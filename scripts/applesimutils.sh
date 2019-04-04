#!/bin/bash -e

if [ ! $(ls -A /usr/local/Cellar/applesimutils | wc -l) -gt 0 ]
then
brew config
brew tap wix/brew
brew install applesimutils
fi
