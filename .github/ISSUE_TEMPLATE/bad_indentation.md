---
name: Suboptimal Indentation
about: I think the indentation can be *even better*
title: ''
labels: indentation
assignees: ''

---

**Minimal code example:**

What the code looks like before pressing `enter`:

<!---
  Use the pipe, "|", to indicate where your cursor is. Keep your code nice and short.
-->
```python
def my_example():
    pass|  # Use "|" to show where the cursor is.
```

What I want the code to look like after pressing `enter`:

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

*Write a short description about why you want the behavior you have described.*

**Environment (please complete the following information):**
 - `Python Indent` version: [e.g. 0.7.0]
 - Visual Studio Code version: [e.g. 1.33.1]
 - OS: [e.g. ubuntu 18.04, Mac OS Mojave]

**Screenshots:**
If you want, attach screenshots/videos/gifs to help explain your problem.

**Additional context:**
Add any other context about the problem here.
