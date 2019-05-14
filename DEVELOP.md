## Release check list

1. The [CHANGELOG](./CHANGELOG.md) has been updated.
1. `git checkout master`
1. `git pull`
1. CI has passed on the master branch.
1. `vsce publish {patch,minor,major}`
1. `vsce package`
1. `git push`
1. `git push --tags`
1. On GitHub, draft a release using the existing tag that was created by the `publish` command.
    * If you are not told that the tag already exists, then you have a typo, or you missed a step.
1. Attach the `.vsix` artifact created by the `package` command to the draft release.
1. Publish the release.

## Getting CI to work

Unfortunately, that yaml does not fully specify the build process. There remain settings
which are *uncontrollable from the pipeline yaml*. An export button exists on the azure website,
but it is greyed out and unclickable.

### Triggers

Despite what the [documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema#triggers)
says, it doesn't seem like Azure Pipelines automatically trigger builds on branches or pull requests.
To get around this, `trigger` and `pr` sections were added to [azure-pipelines.yml](./azure-pipelines.yml).
However, `pr` builds are still not working correctly.

Even with these edits, ull requests from forks are not automatically enabled, and this must be enabled through the GUI.
As of writing, you can do this by going to pipelines page, clicking "Edit" ->
three veritcal dots -> "Triggers" -> "Pull request validation" ->
"Build pull requests from forks of this repository".

It is impossible to schedule builds in the YAML, so that must also be done through the GUI.

### GitHub has old pipeline names

If you update the name of the CI build pipeline, GitHub may continue to expect the old name.
To fix this, go to the repo settings page on GitHub -> branches -> "edit" next to the branch of your choice
-> check/uncheck the desired build names.
