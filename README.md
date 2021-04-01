# Python Indent

Correct python indentation in Visual Studio Code. See the extension on the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=KevinRose.vsc-python-indent&ssr=true) and its source code on [GitHub](https://github.com/kbrose/vsc-python-indent).

![](static/demo.gif)

[![Build Status](https://dev.azure.com/kevinbrose/vsc-python-indent/_apis/build/status/vsc-python-indent-CI?branchName=master)](https://dev.azure.com/kevinbrose/vsc-python-indent/_build/latest?definitionId=1&branchName=master)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/KevinRose.vsc-python-indent.svg)](https://marketplace.visualstudio.com/items?itemName=KevinRose.vsc-python-indent)
[![Stars](https://vsmarketplacebadge.apphb.com/rating-star/KevinRose.vsc-python-indent.svg)](https://marketplace.visualstudio.com/items?itemName=KevinRose.vsc-python-indent)

Please consider [donating](paypal.me/2kbrose) if you find this extension useful and have some spare cash!

## How it works

Every time you press the `Enter` key in a python context, this extension will parse your python file up to the location of your cursor, and determine exactly how much the next line (or two in the case of hanging indents) should be indented and how much nearby lines should be un-indented.

There are three main cases when determining the correct indentation, described below.

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

You can use the setting `useTabOnHangingIndent` to make it so that when you are done typing you can simply press `Tab` to be taken to the closing bracket.

If there is content to the right of your cursor when you press `Enter`, then this extension falls back on just indenting by your set tab size.

```python
# The "|" is your cursor's location.
result = my_func(|x, y, z)
# and when you press enter...
result = my_func(
    |x, y, z)
```

If you never want to have the closing bracket end up on its own line (i.e. you always want to just indent by the set tab size), use the `keepHangingBracketOnLine` configuration setting. *Warning:* This may cause confusing indentation with function definitions as the argument list and the function code may end up at the same indentation level.

It's not often used, but a backslash to continue a line will also result in the next line being indented.

```python
my_long_calculation = 1234 + \
    5678
```

### Keywords

Some keywords in python imply certain indentation behaviors. For example, if there is a `return` statement, then we know the next line can be un-indented (or *de*dented) since no statements can follow a `return` in the same code block. Other keywords that follow the same pattern are `pass`, `break`, `continue`, and `raise`

Similarly, if there is an `else:` on the current line, that the current line needs to be dedented, and the next line needs to be indented *relative to* the new position of the `else:`. Other keywords that follow the same pattern are `elif <stuff>:`, `except <stuff>:`, and `finally:`. Some examples are shown below.

```python
if True:
    pass
    else:|
# and when you press enter...
if True:
    pass
else:
    |
```

But if you have manually changed the indentation, then the extension should not change it for you:

```python
if True:
    if True:
        pass
    else:|
# and when you press enter, do NOT dedent!
if True:
    if True:
        pass
    else:
        |

# Or even more nested

if True:
    if True:
        if True:
            pass
    else:|
# and when you press enter, still do NOT dedent
if True:
    if True:
        if True:
            pass
    else:
        |
```

## Extending comments

If (and only if) you press `Enter` while your cursor is in the middle of a comment, then the next line will automatically be made into a comment.

```python
# As always, the "|" indicates your cursor
def f():
    # This function is |gonna be REAL good!

def f():
    # This function is
    # |gonna be REAL good
```

The next line will always have a hash and a space prepended, regardless of whether your cursor has a space to the right of it. This matches the behavior of VSCode without this extension installed.


```python
def f():
    # This function is| gonna be REAL good!

def f():
    # This function is
    # | gonna be REAL good
```

## Trimming whitespace lines

You can trim whitespace from lines that contain *only* whitespace by using the `trimLinesWithOnlyWhitespace` configuration setting (the default is to not trim whitespace in this way). This setting brings the behavior closer to native VSCode behavior.

```python
# In the below code, the character "·" represents a space.
def f():
····|

# The default of false preserves whitespace
def f():
····
····|

# Setting trimLinesWithOnlyWhitespace = true will trim the whitespace.
def f():

····|
```

## Why is it needed?

There are many related issues on GitHub ([[1]](https://github.com/Microsoft/vscode-python/issues/481), [[2]](https://github.com/Microsoft/python-language-server/issues/671), [[3]](https://github.com/Microsoft/vscode/issues/66235), [[4]](https://github.com/Microsoft/vscode-python/issues/684), [[5]](https://github.com/Microsoft/vscode-python/issues/539)) asking for improved python indentation in VS Code. It seems like the maintainers of the python extension at microsoft are not prioritizing indentation, since there has been no progress in the years since it was first asked for.

## Caveats

Known caveats are listed below.

* Using tabs (`\t`) for your indentation will not work.
* If your python code is not correctly formatted, you may not get correct indentation.
* The extension works by registering the `Enter` key as a keyboard shortcut. The conditions when the shortcut is triggered have been heavily restricted, but there may still be times this extension is unexpectedly overriding `Enter` behavior.

If you experience any problems, please submit an [issue](https://github.com/kbrose/vsc-python-indent/issues), or better yet a [pull request](https://github.com/kbrose/vsc-python-indent/pulls).

## Release Notes

See [the change log](/CHANGELOG.md).

## Developing

See [the developer docs](/DEVELOP.md) for pointers on how to develop this extension.
