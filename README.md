# Python Indent

Correct python indentation in Visual Studio Code. [See it on the VSCode Marketplace.](https://marketplace.visualstudio.com/items?itemName=KevinRose.vsc-python-indent&ssr=true)

![](static/demo.gif)

[![Build Status](https://dev.azure.com/kevinbrose/vsc-python-indent/_apis/build/status/vsc-python-indent%20CI?branchName=master)](https://dev.azure.com/kevinbrose/vsc-python-indent/_build/latest?definitionId=1&branchName=master)

## How it works

Every time you press the `Enter` key in a python context, this extension will parse your python file up to the location of your cursor, and determine exactly how much the next line (or two in the case of hanging indents) should be indented. There are two main cases.

### Between bracket pairs

In cases when you have your cursor between an open bracket (one of `[({`) and its closing bracket pair (the corresponding one of `})]`), this extension will keep subsequent lines indented just to the right of where it was opened:

```python
data = {'a': 0,
        | # <- pressing enter should put your cursor at the "|"
| # <- This is where default VS Code puts your cursor.
```

Even heavily nested brackets are handled:

```python
data = {'a': 0,
        'b': [[1, 2],
              | # <- match the more recently opened [ instead of the {
        | # <- default behavior of VS Code.
```

```python
data = {'a': 0,
        'b': [[1, 2],
              [3, 4]],
        | # <- since the lists are all closed, go back to the { position
              | # <- default behavior of VS Code.
```

```python
data = {'a': 0,
        'b': [[1, 2],
              [3, 4]],
        'c': 5}
| # <- go back to indentation level before any brackets were opened
        | # <- default behavior of VS Code.
```

In the full example below, default VS Code required nine extra key presses (three `tab`'s, two `space`'s, and four `backspace`'s) to match the *automatic* indentation of this extension.

```python
data = {'a': 0,
        'b': [[1, 2],
              [3, 4]],
        'c': 5}
done(data)
```

### Hanging indents

When you have opened a bracket, but not yet inserted any content, pressing `Enter` will create a hanging indent, matching the base behavior of VS Code.

```python
result = my_func(
    | # <- your cursor should end up here
) # <- the closing bracket should end up here
```

## Why is it needed?

There are many related issues on GitHub ([[1]](https://github.com/Microsoft/vscode-python/issues/481), [[2]](https://github.com/Microsoft/python-language-server/issues/671), [[3]](https://github.com/Microsoft/vscode/issues/66235), [[4]](https://github.com/Microsoft/vscode-python/issues/684), [[5]](https://github.com/Microsoft/vscode-python/issues/539)) asking for improved python indentation in VS Code. The microsoft team has made no progress on it in the **years** since it was first asked for.

## Caveats

This extension is new, and may have problems. Some known caveats are listed below.

* Using tabs (`\t`) for your indentation will likely not work.
* If your python code is not correctly formatted, you may not get correct indentation.
* The extension works by registering the `Enter` key as a keyboard shortcut. The conditions when the shortcut is triggered have been heavily restricted, but there may still be times this extension is unexpectedly overriding `Enter` behavior.

If you experience any problems, please submit an [issue](https://github.com/kbrose/vsc-python-indent/issues), or better yet a [pull request](https://github.com/kbrose/vsc-python-indent/pulls).

## Release Notes

See [the change log](/CHANGELOG.md).
