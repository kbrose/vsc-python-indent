# Change Log

### Unreleased

### 0.8.0

* Don't dedent if the special dedent keyword appears in special contexts, like in strings or as variable names. Thanks @chen19901225 for the inspiration!
* Update required version of vscode to resolve security vulnerability [CVE-2018-20834](https://nvd.nist.gov/vuln/detail/CVE-2018-20834).

### 0.7.0

* Fixed compatibility with the `vscodevim.vim` extension.

### 0.6.1

* Re-syncing github and marketplace code histories

### 0.6.0

* Update hanging indent to work correctly when there is content to the right of your cursor.

### 0.5.3

Merged the [first external pull request](https://github.com/kbrose/vsc-python-indent/pull/7), thanks @chen19901225 🎉

* Fixed complex dedent cases like `return f(x)(y)`.
* Turn on continuous integration for pull requests from forks.
* Run linter in continuous integration.

### 0.5.2

* Documentation updates

### 0.5.1

* Documentation updates
* New logo

### 0.5.0

* Fix hanging indentation
* Add option to make hanging indent snippet-style (press tab to go to ending bracket)

### 0.4.0

* Update keybinding condition to not override `Enter` accepting intellisense suggestion.

### 0.3.0

* Update activation events and keybinding condition to work in unsaved buffers. Resolves [#2](https://github.com/kbrose/vsc-python-indent/issues/2).

### 0.2.0

* Refactor to make testing easier
* Add a bunch of testing, now that it is easier
* Run tests on [Azure Pipeline](https://dev.azure.com/kevinbrose/vsc-python-indent/_build/results).

### 0.1.0

* First pass at correct indentation.
* Preserve un-indenting behavior with `return`, `pass`, etc.

