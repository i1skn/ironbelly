# Contributing

Find an area you can help with and do it. Open source is about collaboration and open participation. Try to make your code look like what already exists and submit a pull request.

The [list of issues](https://github.com/cyclefortytwo/ironbelly/issues) is a good place to start, especially the ones tagged as "help wanted" or "good first issue" (but don't let that stop you from looking at others). If you're looking for additional ideas, the code includes `TODO` comments for minor to major improvements. Use _Search in files_ in your code editor, or `grep "TODO" -r --exclude-dir=target --exclude-dir=.git .`.

Additional tests are rewarded with an immense amount of positive karma.

More documentation or updates/fixes to existing documentation are also very welcome. 

# PR Guidelines

We generally prefer you to PR your work earlier rather than later. This ensures everyone else has a better idea of what's being worked on, and can help reduce wasted effort. If work on your PR has just begun, please feel free to create the PR with [WIP] (work in progress) in the PR title, and let us know when it's ready for review in the comments.

Before submitting your PR for approval, please be ensure it:
* Includes a proper description of what problems the PR addresses, as well as a detailed explanation as to what it changes
* Describes how you've tested the change (e.g. against Floonet, etc)
* Updates any documentation that's affected by the PR

If submitting a PR consisting of documentation changes only, please try to ensure that the change is significantly more substantial than one or two lines. For example, working through an install document and making changes and updates throughout as you find issues is worth a PR. For typos and other small changes, either contact one of the developers, or if you think it's a significant enough error to cause problems for other users, please feel free to open an issue.

The development team will be happy to help and guide you with any of these points and work with you getting your PR submitted for approval. Create a PR with [WIP] in the title and ask for specific assistance within the issue, or contact the dev team on [gitter chat channel](https://gitter.im/ironbelly-wallet/community).

## Pull-Request Title Prefix

Please consider putting one of the following prefixes in the title of your pull-request:
- **feat**:     A new feature
- **fix**:      A bug fix
- **docs**:     Documentation only changes
- **style**:    Formatting, missing semi-colons, white-space, etc
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**:     A code change that improves performance
- **test**:     Adding missing tests
- **chore**:    Maintain. Changes to the build process or auxiliary tools/libraries/documentation

For example: `fix: rust tx_create panick when xxx`. Please don't worry if you can't find a suitable prefix, this's just optional, not mandatory.

# Find Us

When you are starting to contribute to Ironbelly, we really would appreciate if you come by the [gitter chat channel](https://gitter.im/ironbelly-wallet/community).

# Testing

This project has only e2e tests so far. They are written in [Detox](https://github.com/wix/Detox).
To run all tests:
* Create a build `detox build --configuration ios.sim.debug` 
* Run the tests `detox test --configuration ios.sim.debug`

Remember to test locally before creating a PR on github.

## Check Travis output

After creating a PR on github, the code will be tested automatically by Travis CI, and from the results you'll get a red or green light. The test can take a while, and you'll have a "yellow traffic light" on your PR until Travis CI is done testing.

## Building quality

The most important thing you can do alongside - or even before - changing code, is adding tests for how Ironbelly should and should not work.

## How to switch to Floonet?

Just tap on the version line on the initial screen :)

# Code Style Guide

This project written in 4 different programming languages:
* **Rust** uses `rustfmt`[how to install](https://github.com/rust-lang/rustfmt#installation) to maintain consistent formatting.
* **React Native (JavaScript)** uses `prettier`[How to install](https://prettier.io/docs/en/install.html) to maintain consistent formatting. **Use it with `.prettierrc` configuration file** in the root of the project.
* **Swift** - no specific code style requirements so far.
* **ObjectiveC** - no specific code style requirements so far.

# Thanks for any contribution

Even one word correction are welcome! Our objective is to encourage you to get interested in Ironbelly and contribute in any way possible. Thanks for any help!
