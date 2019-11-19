# Change Log

### Unreleased

### 1.8.1

* Also handle `while...else`.

### 1.8.0

* Update dedent logic to handle `for...else` and `try...else` constructs.

### 1.7.0

* Scroll the window when pressing `Enter` near the bottom of the window/out of view.

### 1.6.1

* Bump `python-indent-parser` version

### 1.6.0

* Fix incorrect indentation when pressing enter on lines with an open bracket, but no closing bracket.
* Switch to centralized python parsing library shared by the `python-indent` package for Atom (thanks @DSpeckhals)

### 1.5.0

* If your cursor is in the middle of a comment when you press `Enter`, then the next line is auto-commented as well.
* Small updates to README

### 1.4.0

* Better dedentation handling of `else:` and similar keywords.

### 1.3.0

* Indent the next line if you use a backslash to do a line continuation.

### 1.2.0

* Fix unexpected dedenting when you have variables named like `return_this_value`.

### 1.1.0

* The extension now works if text is highlighted when the user presses Enter. Thanks @WhistleWhileYouWork!

### 1.0

* The package has been deemed stable enough for 1.0!

### 0.9.0

* Dedent current line on `else`, `elif`, `except`, and `finally` statements
    * ***NOTE:*** You no longer need to manually un-indent on these lines, just press `Enter` and it will be un-indented for you.
* Don't dedent on keywords if they appear in triple quoted string.
* Update demo gif to showcase improved dedent behaviors.

### 0.8.1

* Don't run extension if multiple cursors exist.

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

