#!/bin/bash -e
curl https://sh.rustup.rs -sSf | sh -s -- -y
$HOME/.cargo/bin/rustup target add x86_64-apple-ios
if [ ! $($HOME/.cargo/bin/cargo --list | grep lipo | wc -l) -eq 1 ]
then $HOME/.cargo/bin/cargo install cargo-lipo
fi
cd rust/
$HOME/.cargo/bin/cargo lipo --targets x86_64-apple-ios --release
