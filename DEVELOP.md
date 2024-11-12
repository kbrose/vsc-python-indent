# Developing this extension

Thank you for your interest in helping develop this extension. To get up and running, follow the guide below. If something doesn't work, feel free to open an issue or submit a PR fixing this documentation!

## Quickstart

1. Download the [rust toolchain](https://www.rust-lang.org)
1. Install [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) (`cargo install wasm-pack`)
1. Download node (preferably with `nvm` so you can easily install new versions later) and npm
1. From the top level folder, run `npm install` to get the (javascript) dependencies.
1. Open this folder in vscode.
1. Make your changes
1. You can manually test your changes by navigating to "Run and Debug" -> "Run Extension" -> green arrow. This opens a sandboxed version of vscode with your updated extension.
1. You should add unit tests for your functionality as well. These go under `src/test/suite`, or in `src/lib.rs` if you are modifying the rust code. *Your PR will likely not be merged without unit tests.*

# Maintaining this extension

The following items are relevant if you are actively maintaining this extension. I wrote this documentation for myself, since I have to do these maintenance actions approximately once a year at this point.

## Release check list

You will need [`vsce`](https://github.com/Microsoft/vscode-vsce) installed.

If needed, get a new access token. Follow the instructions [here](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token).

1. The [CHANGELOG](./CHANGELOG.md) has been updated.
1. `git checkout main`
1. `git pull`
1. Tests pass locally (both rust and typescript): `npm run test`
    * Do *NOT* skip this step. It also compiles the wasm code which needs to happen before publishing.
1. Smoke test (run extension through debugger, open `smoke_test.py`, press `enter` after each line and make sure it looks good).
1. CI has passed on the main branch.
1. `vsce publish {patch,minor,major}` and optionally use the `--pre-release` argumentvs
1. `vsce package`
1. `git push; git push --tags`
1. On GitHub, draft a release using the existing tag that was created by the `publish` command.
    * If you are not told that the tag already exists, then you have a typo, or you missed a step.
1. Attach the `.vsix` artifact created by the `package` command to the draft release.
1. Publish the release.

## Getting CI to work

Follow the instructions [here](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions).

## Extension reporting hub

https://marketplace.visualstudio.com/manage/publishers/kevinrose/extensions/vsc-python-indent/hub (requries login)
