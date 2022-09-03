fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios bumpVersion

```sh
[bundle exec] fastlane ios bumpVersion
```

Bump new version for iOS

### ios bumpBuildNumber

```sh
[bundle exec] fastlane ios bumpBuildNumber
```



### ios beta

```sh
[bundle exec] fastlane ios beta
```

Push a new beta build to TestFlight

----


## Android

### android alpha

```sh
[bundle exec] fastlane android alpha
```

Submit a new Alpha Build to Play Market

### android internal

```sh
[bundle exec] fastlane android internal
```

Submit a new Internal Build to Play Market

### android apk

```sh
[bundle exec] fastlane android apk
```

Build Release APK

### android bumpVersion

```sh
[bundle exec] fastlane android bumpVersion
```



### android bumpBuildNumber

```sh
[bundle exec] fastlane android bumpBuildNumber
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
