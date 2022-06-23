// Adapted from https://github.com/DSpeckhals/python-indent-parser

import * as assert from "assert";

import * as parser from "../../parser";

const tabSize = 4;

suite("indentationLevel", () => {
    test("empty string", () => {
        assert.equal(0, parser.indentationLevel(""));
    });
    test("no whitespace", () => {
        assert.equal(0, parser.indentationLevel("hi"));
    });
    test("only whitespace", () => {
        assert.equal(2, parser.indentationLevel("  "));
    });
    test("both whitespace and not whitespace", () => {
        assert.equal(4, parser.indentationLevel("    hi"));
    });
    test("space word space", () => {
        assert.equal(1, parser.indentationLevel(" hi "));
    });
});

suite("nextIndentationLevel", () => {
    suite("functions", () => {
        test("normal", () => {
            assert.equal(tabSize, parser.indentationInfo(
                ["def function(x):"],
                tabSize,
            ).nextIndentationLevel);
        });
        test("non-default indent size", () => {
            assert.equal(8, parser.indentationInfo(
                ["def function(x):"],
                8,
            ).nextIndentationLevel);
        });
        test("normal, within class", () => {
            assert.equal(tabSize * 2, parser.indentationInfo(
                [
                    "class A:",
                    "    def function(x):",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("broken up arguments", () => {
            assert.equal("def function(".length, parser.indentationInfo(
                [
                    "def function(x,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("broken up arguments with type hints", () => {
            assert.equal("def function(".length, parser.indentationInfo(
                [
                    "def function(x: int,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("broken up arguments final indent", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "def function(x,",
                    "             y):",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("broken up arguments final indent with type hints", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "def function(x: int,",
                    "             y: float):",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("broken up arguments with embedded list", () => {
            assert.equal("def function(x=[".length, parser.indentationInfo(
                [
                    "def function(x=[0, 1,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
    });
    suite("colon control flows", () => {
        test("if", () => {
            assert.equal(tabSize, parser.indentationInfo(
                ["if condition:"],
                tabSize,
            ).nextIndentationLevel);
        });
        test("if/else", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "if condition:",
                    "    first",
                    "else:",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("for", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "for i in range(5):",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("try", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "try:",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("try/except", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "try:",
                    "    will_fail()",
                    "except ValueError:",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
    });

    suite("lists, dicts, and tuples", () => {
        test("list", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "[0, 1, 2,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("list dedents at the end", () => {
            assert.equal(0, parser.indentationInfo(
                [
                    "[0, 1, 2,",
                    " 3, 4, 5,",
                    " 6, 7, 8]",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("list extended", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "[0, 1, 2,",
                    " 3, 4, 5,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("nested lists", () => {
            assert.equal(2, parser.indentationInfo(
                [
                    "[[0, 1, 2,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(1, parser.indentationInfo(
                [
                    "[[0, 1, 2],",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal("[0, 1, 2, [".length, parser.indentationInfo(
                [
                    "[0, 1, 2, [3, 4, 5,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(2, parser.indentationInfo(
                [
                    "[0, 1, 2,",
                    " [3, 4, 5,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(2, parser.indentationInfo(
                [
                    "[[[0, 1, 2,",
                    "   3, 4, 5],",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("dict", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "{'a': 0,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("dict extended", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "{'a': 0,",
                    " 'b': 1,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("tuple", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "(0, 1, 2,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("tuple extended", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "(0, 1, 2,",
                    " 3, 4, 5,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("mixed", () => {
            assert.equal("{'a': [".length, parser.indentationInfo(
                [
                    "{'a': [0, 1, 2,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(1, parser.indentationInfo(
                [
                    "({'a': 0},",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("starting indented", () => {
            assert.equal(5, parser.indentationInfo(
                [
                    "    [0, 1, 2,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(5, parser.indentationInfo(
                [
                    "    [0, 1, 2,",
                    "     3, 4, 5,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(5, parser.indentationInfo(
                [
                    "    (0, 1, 2,",
                    "     3, 4, 5,",
                ],
                tabSize,
            ).nextIndentationLevel);
            assert.equal(5, parser.indentationInfo(
                [
                    "    {0: 1,",
                    "     2: 3,",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
    });

    suite("strings", () => {
        test("list", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "['a', 'b',",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("quoted bracket ender", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "['a', 'b]',",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("quoted bracket ender in raw", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "['a', r'b]',",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("just like REALLY messy", () => {
            const text = "\n\
x = ['here(\\'(', 'is', 'a',\n\
     'list', 'of', ['nested]',\n\
                    'strings\\\\'],\n\
     r'some \\[\\'[of which are raw',\n\
     'and some of which are not']\n\
";
            const lines = text.split("\n").slice(1);
            const expectedIndents = [5, 20, 5, 5];
            const range = [0, 1, 2, 3];
            for (const i of range) {
                assert.equal(expectedIndents[i], parser.indentationInfo(
                    lines.slice(undefined, i + 1),
                    tabSize,
                ).nextIndentationLevel);
            }
        });
    });

    suite("comments", () => {
        test("list", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "[0, 1, 2, #",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("commented bracket ender", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "[0, 1, 2, #]",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("commented bracket opener", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "[0, 1, 2, #[",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("additional text", () => {
            assert.equal(1, parser.indentationInfo(
                [
                    "[0, 1, 2, #additional text and stuff",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
    });

    suite("hanging", () => {
        test("simple as can be", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "[]",
                1,
            ));
        });
        test("list", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "this_list = []",
                "this_list = [".length,
            ));
        });
        test("function", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "def my_func()",
                "def my_func(".length,
            ));
        });
        test("function with end paren and colon", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "def my_func():",
                "def my_func(".length,
            ));
        });
        test("function with end paren and colon and whitespace", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "def my_func(): ",
                "def my_func(".length,
            ));
        });
        test("starting indented", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "    def __init__()",
                "    def __init__(".length,
            ));
        });
        test("starting indented with end paren and colon", () => {
            assert.equal(parser.Hanging.full, parser.shouldHang(
                "    def __init__():",
                "    def __init__(".length,
            ));
        });
        test("negative case", () => {
            assert.equal(parser.Hanging.none, parser.shouldHang(
                "    def __init__(self):",
                "    def __init__(self):".length,
            ));
        });
        test("empty string", () => {
            assert.equal(parser.Hanging.none, parser.shouldHang(
                "",
                0,
            ));
        });
        test("text after position", () => {
            assert.equal(parser.Hanging.partial, parser.shouldHang(
                "this_list = [x]",
                "this_list = [".length,
            ));
        });
        test("no closing bracket", () => {
            assert.equal(parser.Hanging.partial, parser.shouldHang(
                "this_list = [",
                "this_list = [".length,
            ));
        });
        test("backslash continuation", () => {
            assert.equal(parser.Hanging.partial, parser.shouldHang(
                "long_line = 5 + \\",
                "long_line = 5 + \\".length,
            ));
        });
    });

    suite("dedent next line", () => {
        test("return", () => {
            assert.equal(0, parser.indentationInfo(
                [
                    "def function(x):",
                    "    return x",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("pass", () => {
            assert.equal(0, parser.indentationInfo(
                [
                    "def function(x):",
                    "    pass",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("break", () => {
            assert.equal(0, parser.indentationInfo(
                [
                    "for i in range(5):",
                    "    break",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("continue", () => {
            assert.equal(0, parser.indentationInfo(
                [
                    "for i in range(5):",
                    "    continue",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("raise", () => {
            assert.equal(0, parser.indentationInfo(
                [
                    "def function(x):",
                    "    raise NotImplementedError('uh oh')",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("return, starting indented", () => {
            assert.equal(tabSize, parser.indentationInfo(
                [
                    "class A():",
                    "    def function(x):",
                    "        return x",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("return, with bracket", () => {
            assert.equal("        return self._connection_class()(".length , parser.indentationInfo(
                [
                    "class A():",
                    "    def handle_request(self, request, release_callback, callback):",
                    "        return self._connection_class()(self, request, release_callback, callback",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("raise inside argument", () => {
            assert.equal(4, parser.indentationInfo(
                [
                    "def function(raise_error=False):",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("return inside string", () => {
            assert.equal(4, parser.indentationInfo(
                [
                    "def function(x):",
                    "    print('this returns none')",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("return inside triple string", () => {
            assert.equal(4, parser.indentationInfo(
                [
                    "def function(x):",
                    "    '''",
                    "    return",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
        test("return inside variable name", () => {
            assert.equal(4, parser.indentationInfo(
                [
                    "def function(x):",
                    "    return_x = 5",
                ],
                tabSize,
            ).nextIndentationLevel);
        });
    });
});
