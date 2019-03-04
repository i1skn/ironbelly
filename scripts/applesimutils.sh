#!/bin/bash -e

if [ ! $(ls -A /usr/local/Cellar/applesimutils | wc -l) -gt 0 ]
then
sudo softwareupdate --list
sudo softwareupdate --install "Command Line Tools (macOS High Sierra version 10.13) for Xcode-10.1"
brew config
brew tap wix/brew
brew install applesimutils
fi
