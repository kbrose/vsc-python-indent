## Release check list

1. The [CHANGELOG](./CHANGELOG.md) has been updated.
1. `git checkout master`
1. `git pull`
1. CI has passed on the master branch.
1. `vsce publish {patch,minor,major}`
1. `vsce package`
1. `git push --tags`
1. On GitHub, draft a release using the existing tag that was created by the `publish` command.
    * If you are not told that the tag already exists, then you have a typo, or you missed a step.
1. Attach the `.vsix` artifact created by the `package` command to the draft release.
1. Publish the release.
