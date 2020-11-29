/**
 * Copyright 2020 The Tari Project
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are permitted provided that the
 * following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of
 * its contributors may be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package app.ironbelly.tor

import android.app.Service
import android.content.Context
import com.orhanobut.logger.AndroidLogAdapter
import com.orhanobut.logger.Logger
import io.reactivex.Observable
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.disposables.Disposable
import io.reactivex.schedulers.Schedulers
import io.reactivex.subjects.BehaviorSubject
import net.freehaven.tor.control.TorControlConnection
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.net.Socket
import java.util.concurrent.TimeUnit


/**
 * Manages the installation and the running of the Tor proxy.
 *
 * @author The Tari Development Team
 */
internal class TorProxyManager(
        private val context: Context,
        private val torConfig: TorConfig
) {

    companion object {
        const val torDataDirectory = "tor"
    }

    private val appCacheHome = File(context.filesDir.absolutePath + "/" + torDataDirectory)
    private val torProxyControl: TorProxyControl

    private val torProxyStateDisposables = mutableMapOf<Any, CompositeDisposable>()
    private val torProxyStateSubject = BehaviorSubject.create<TorProxyState>()

    private var torBinPath = "tari_wallet_tor_bin_path"

    // region: Tor proxy state

    fun subscribeToTorProxyState(subscriber: Any, consumer: (TorProxyState) -> Unit) {
        val observer = torProxyStateSubject.ofType(TorProxyState::class.java).subscribe(consumer)
        val disposable = torProxyStateDisposables[subscriber]
                ?: CompositeDisposable().apply { torProxyStateDisposables[subscriber] = this }
        disposable.add(observer)
    }

    fun unsubscribeFromTorProxyState(subscriber: Any) = torProxyStateDisposables.apply {
        get(subscriber)?.clear()
        remove(subscriber)
    }

    fun postTorProxyState(event: TorProxyState) {
        Logger.d("TorState: %s", event)
        torProxyStateSubject.onNext(event)
    }

        // endregion

        init {
            postTorProxyState(TorProxyState.NotReady)
            torProxyControl = TorProxyControl(torConfig)
            Logger.addLogAdapter(AndroidLogAdapter())
        }

        private fun installTorResources() {
            // install Tor geoip resources
            val torResourceInstaller = TorResourceInstaller(context, context.filesDir)
            torResourceInstaller.installGeoIPResources()
            // check if there's an existing installation of Tor
            if (torBinPath != null) {
                val torBinFile = File(torBinPath)
                if (torBinFile.exists() && torBinFile.canExecute()) {
                    return
                }
            }
            // get the Tor binary file and make it executable
            val torBinary = torResourceInstaller.getTorBinaryFile()
            torBinPath = torBinary.absolutePath
        }

        /**
         * Executes shell command.
         */
        private fun exec(command: String) {
            // execute the command
            val process = Runtime.getRuntime().exec(command)
            Logger.d("Tor command executed: %s", command)
            postTorProxyState(TorProxyState.Initializing)
            val response = BufferedReader(
                    InputStreamReader(process.inputStream)
            ).use(BufferedReader::readText)
            Logger.d("Tor proxy response: %s", response)
            process.waitFor()
            // Tor proxy is down
            postTorProxyState(TorProxyState.Failed)
        }

        private fun getHashedPassword(password: String): String {
            val cmd1 = "${torBinPath} DataDirectory ${appCacheHome.absolutePath}" +
                    " --hash-password my-secret"
            Logger.d("Tor HASH CMD %s", cmd1)
            val process = Runtime.getRuntime().exec(cmd1)
            return BufferedReader(
                    InputStreamReader(process.inputStream)
            ).use(BufferedReader::readText)
        }

        @Synchronized
        fun run() {
            println("HER")
            // start monitoring Tor on a separate thread
            Thread {
                torProxyControl.startMonitoringTor()
            }.start()
            try {
                installTorResources()
                val torCmdString =
                        "${torBinPath} -f ${appCacheHome.absolutePath}/torrc " +
//                        "--allow-missing-torrc --ignore-missing-torrc " +
                                "--clientonly 1 " +
                                "--socksport ${torConfig.proxyPort} " +
                                "--controlport ${torConfig.controlHost}:${torConfig.controlPort} " +
//                                "--CookieAuthentication 1 " +
//                        "--Socks5ProxyUsername ${torConfig.sock5Username} " +
//                        "--Socks5ProxyPassword ${torConfig.sock5Password} " +
                                "--clientuseipv6 1 " /* +
                        "--ClientTransportPlugin obfs4 socks5 ${torConfig.controlHost}:47351 " +
                        "--ClientTransportPlugin \"meek_lite Socks5Proxy ${torConfig.controlHost}:47352\"" */
                exec(torCmdString)
            } catch (throwable: Throwable) {
                Logger.e("THROWABLE: %s", throwable)
                postTorProxyState(TorProxyState.Failed)
            }
        }

        fun shutdown() {
            torProxyControl.shutdownTor()
        }

        inner class TorProxyControl(private val torConfig: TorConfig) {

            private val initializationCheckTimeoutMillis = 15000L
            private val initializationCheckRetryPeriodMillis = 500L
            private var monitoringStartTimeMs = 0L

            /**
             * Check Tor status every 5 seconds.
             */
            private val statusCheckPeriodSecs = 5L
            /**
             * Timer to check Tor status.
             */
            private var timerSubscription: Disposable? = null

            private lateinit var socket: Socket
            private lateinit var controlConnection: TorControlConnection
            private var currentState = torProxyStateSubject.value

            @Synchronized
            fun startMonitoringTor() {
                connectToTor()
            }

            @Synchronized
            fun shutdownTor() {
                timerSubscription?.dispose()
                controlConnection.shutdownTor("SHUTDOWN")
            }

            private fun connectToTor() {
                monitoringStartTimeMs = System.currentTimeMillis()
                try {
                    socket = Socket(torConfig.controlHost, torConfig.controlPort)
                    controlConnection = TorControlConnection(socket)
                    val cookieFileBytes = File("${appCacheHome.absolutePath}/${torConfig.cookieFilePath}").readBytes()
                    controlConnection.authenticate(cookieFileBytes)
                    checkTorStatus()
                } catch (throwable: Throwable) {
                    val initializationElapsedMs = System.currentTimeMillis() - monitoringStartTimeMs
                    if (initializationElapsedMs > initializationCheckTimeoutMillis) {
                        Logger.e(
                                "Failed to connect to Tor proxy, timed out: %s",
                                throwable.message
                        )
                        updateState(TorProxyState.Failed)
                    } else {
                        Logger.e(
                                "Failed to connect to Tor proxy, will retry: %s",
                                throwable.message
                        )
                        timerSubscription =
                                Observable
                                        .timer(initializationCheckRetryPeriodMillis, TimeUnit.MILLISECONDS)
                                        .subscribeOn(Schedulers.io())
                                        .observeOn(Schedulers.io())
                                        .subscribe {
                                            connectToTor()
                                        }
                    }
                }
            }

            private fun checkTorStatus() {
                try {
                    val bootstrapStatus = isTorRunning(controlConnection)
                    if (bootstrapStatus != null) {
                        updateState(TorProxyState.Running(bootstrapStatus))
                        // schedule timer
                        timerSubscription =
                                Observable
                                        .timer(statusCheckPeriodSecs, TimeUnit.SECONDS)
                                        .subscribeOn(Schedulers.io())
                                        .observeOn(Schedulers.io())
                                        .subscribe {
                                            checkTorStatus()
                                        }
                    } else {
                        updateState(TorProxyState.Failed)
                    }
                } catch (throwable: Throwable) {
                    Logger.e("Tor proxy has failed: %s", throwable.message)
                    updateState(TorProxyState.Failed)
                }
            }

            private fun isTorRunning(controlConnection: TorControlConnection?): TorBootstrapStatus? {
                val phaseLogLine = controlConnection?.getInfo("status/bootstrap-phase") ?: return null
                return TorBootstrapStatus.from(phaseLogLine)
            }

            private fun updateState(newState: TorProxyState) {
                if (currentState != newState) {
                    currentState = newState
                    postTorProxyState(currentState!!)
                }
            }

        }
    }