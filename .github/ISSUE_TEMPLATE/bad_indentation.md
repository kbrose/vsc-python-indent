---
name: Suboptimal Indentation
about: I think the indentation can be *even better*.
title: ''
labels: indentation
assignees: ''

---

**Minimal code example:**

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

<!-- Feel free to attach screenshot and/or write additional information below. -->
