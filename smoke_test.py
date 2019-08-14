data = {'a': 0,
        'b': [[1, 2,],
              [3, 4]],
        'c': 5}

def hello(
    first: bool, second: bool,
):
    # This comment line is waaaaaaaaaaaay too long.
    if first and second:
        raise ValueError('no')
    elif first:
        print('hello')
    elif second:
        print('world')
    return 'done'
