# Developing this extension

Thank you for your interest in helping develop this extension. If you're new to developing VSCode extensions, then you may want to try and follow the quickstart below. If something doesn't work, feel free to open an issue or submit a PR fixing this documentation!

## Quickstart

1. Download node / npm
1. From the top level folder, run `npm install` to get the dependencies.
1. Open this folder in vscode.
1. Make your changes
1. You can manually test your changes by navigating to "Run" -> "Run Extension" -> green arrow. This opens a sandboxed version of vscode with your updated extension.
1. You should add unit tests for your functionality as well. These go under `src/test/suite`. *Your PR will likely not be merged without unit tests.*

# Release check list

1. The [CHANGELOG](./CHANGELOG.md) has been updated.
1. `git checkout master`
1. `git pull`
1. Smoke test (run extension through debugger, open `smoke_test.py`, press `enter` after each line and make sure it looks good).
1. CI has passed on the master branch.
1. `vsce publish {patch,minor,major}`
1. `vsce package`
1. `git push; git push --tags`
1. On GitHub, draft a release using the existing tag that was created by the `publish` command.
    * If you are not told that the tag already exists, then you have a typo, or you missed a step.
1. Attach the `.vsix` artifact created by the `package` command to the draft release.
1. Publish the release.

# Getting CI to work

Unfortunately, that yaml does not fully specify the build process. There remain settings
which are *uncontrollable from the pipeline yaml*. An export button exists on the azure website,
but it is greyed out and unclickable.

## Triggers

Despite what the [documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema#triggers)
says, it doesn't seem like Azure Pipelines automatically trigger builds on branches or pull requests.
To get around this, `trigger` and `pr` sections were added to [azure-pipelines.yml](./azure-pipelines.yml).
However, `pr` builds are still not working correctly.

Even with these edits, ull requests from forks are not automatically enabled, and this must be enabled through the GUI.
As of writing, you can do this by going to pipelines page, clicking "Edit" ->
three veritcal dots -> "Triggers" -> "Pull request validation" ->
"Build pull requests from forks of this repository".

It is impossible to schedule builds in the YAML, so that must also be done through the GUI.

## GitHub has old pipeline names

If you update the name of the CI build pipeline, GitHub may continue to expect the old name.
To fix this, go to the repo settings page on GitHub -> branches -> "edit" next to the branch of your choice
-> check/uncheck the desired build names.
