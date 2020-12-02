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

import android.content.Context
import java.io.*
import java.lang.RuntimeException
import java.util.zip.ZipInputStream

/**
 * Installs Tor resources from assets to the app files directory.
 *
 * @author The Tari Development Team
 */
class TorResourceInstaller(
    private var context: Context,
    private var installFolder: File
) {

    companion object {
        private const val TOR_BINARY_FILE_NAME = "libtor.so"
        private const val COMMON_ASSET_KEY = "tor/"
        private const val GEOIP_ASSET_KEY = "geoip"
        private const val GEOIP6_ASSET_KEY = "geoip6"
        private const val FILE_WRITE_BUFFER_SIZE = 1024
    }

    private object Util {
        fun makeFileExecutable(fileBin: File) {
            fileBin.setReadable(true)
            fileBin.setExecutable(true)
            fileBin.setWritable(false)
            fileBin.setWritable(true, true)
        }

        /**
         * Reads file from assetPath/assetKey writes it to the install folder.
         */
        @Throws(IOException::class)
        fun assetToFile(
            context: Context,
            filesPath: String,
            assetPath: String,
            assetKey: String,
            isZipped: Boolean = false,
            setExecutable: Boolean = false
        ): File {
            val inputStream = context.assets.open(assetPath)
            val outFile = File(filesPath, assetKey)
            if (!outFile.exists()) {
                streamToFile(inputStream, outFile, isZipped = isZipped)
                if (setExecutable) {
                    makeFileExecutable(outFile)
                }
            }
            return outFile
        }

        /**
         * Write the inputstream contents to the file
         */
        @Throws(IOException::class)
        private fun streamToFile(
            inputStream: InputStream,
            outFile: File,
            append: Boolean = false,
            isZipped: Boolean = false
        ) {
            val outputStream: OutputStream = FileOutputStream(outFile.absolutePath, append)
            var zipInputStream: ZipInputStream? = null
            if (isZipped) {
                zipInputStream = ZipInputStream(inputStream)
                zipInputStream.nextEntry
            }
            val fileInputStream = zipInputStream ?: inputStream

            var bytecount: Int
            val buffer = ByteArray(FILE_WRITE_BUFFER_SIZE)
            while (fileInputStream.read(buffer).also { bytecount = it } > 0) {
                outputStream.write(buffer, 0, bytecount)
            }
            outputStream.close()
            zipInputStream?.close()
            inputStream.close()
        }
    }

    fun getTorBinaryFile(): File {
        val torBinaryFile = File(
            context.applicationInfo.nativeLibraryDir,
            TOR_BINARY_FILE_NAME
        )
        if (!torBinaryFile.exists()) {
            throw RuntimeException("Tor binary cannot be found: ${torBinaryFile.absolutePath}")
        }
        //Util.makeFileExecutable(torBinaryFile)
        if (!torBinaryFile.canExecute()) {
            throw RuntimeException("Tor binary is not executable.")
        }
        return torBinaryFile
    }

    /**
     * Install the Tor geo IP resources from assets to app files directory.
     */
    fun installGeoIPResources() {
        Util.assetToFile(
            context = context,
            filesPath = installFolder.absolutePath,
            assetPath = COMMON_ASSET_KEY + GEOIP_ASSET_KEY,
            assetKey = GEOIP_ASSET_KEY
        )
        Util.assetToFile(
            context = context,
            filesPath = installFolder.absolutePath,
            assetPath = COMMON_ASSET_KEY + GEOIP6_ASSET_KEY,
            assetKey = GEOIP6_ASSET_KEY
        )
    }

}