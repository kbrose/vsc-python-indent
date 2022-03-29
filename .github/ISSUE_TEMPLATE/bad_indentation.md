---
name: Suboptimal Indentation
about: Indentation is not working as desired
title: ''
labels: indentation
assignees: ''

---

What the code looks like before pressing `enter`:

```python
def my_example():
    pass|  # Use "|" to show where the cursor is. Keep your code nice and short!
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

<!-- Attach any screenshots and/or write additional information below. -->
