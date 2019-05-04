---
name: Suboptimal Indentation
about: I think the indentation can be *even better*
title: ''
labels: indentation
assignees: ''

---

**Code:**

Minimal code setup:

<!---
  Show what the code looks like BEFORE you have pressed enter. Use the pipe character "|" to indicate where your cursor is. Keep your code nice and short.
-->
```python
def my_example():
    pass|
```

What I expect the code to look like after pressing `enter`:

```python
def my_example():
    pass
|
```

What the code actually looks like after pressing `enter`:

```python
def my_example():
    pass
    |
```

**Screenshots:**
If you want, attach screenshots/videos/gifs to help explain your problem.

**Environment (please complete the following information):**
 - OS: [e.g. ubuntu 18.04, Mac OS Mojave]
 - Version of `Python Indent` [e.g. 0.7.0]
 - Version of Visual Studio Code [e.g. 1.33.1]

**Additional context:**
Add any other context about the problem here.
