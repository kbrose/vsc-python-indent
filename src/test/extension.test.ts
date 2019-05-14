//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
import * as indent from '../indent';

const tabSize = 4;

suite("indentationLevel", function () {
    test("empty string", function() {
        assert.equal(0, indent.indentationLevel(""));
    });
    test("no whitespace", function () {
        assert.equal(0, indent.indentationLevel("hi"));
    });
    test("only whitespace", function () {
        assert.equal(2, indent.indentationLevel("  "));
    });
    test("both whitespace and not whitespace", function () {
        assert.equal(4, indent.indentationLevel("    hi"));
    });
    test("space word space", function () {
        assert.equal(1, indent.indentationLevel(" hi "));
    });
});
suite("nextIndentationLevel", function () {
    suite("functions", function () {
        test("normal", function() {
            assert.equal(tabSize, indent.nextIndentationLevel(
                ["def function(x):"],
                tabSize,
            ).indent);
        });
        test("non-default indent size", function() {
            assert.equal(8, indent.nextIndentationLevel(
                ["def function(x):"],
                8,
            ).indent);
        });
        test("normal, within class", function() {
            assert.equal(tabSize * 2, indent.nextIndentationLevel(
                [
                    "class A:",
                    "    def function(x):",
                ],
                tabSize,
            ).indent);
        });
        test("broken up arguments", function() {
            assert.equal("def function(".length, indent.nextIndentationLevel(
                [
                    "def function(x,"
                ],
                tabSize,
            ).indent);
        });
        test("broken up arguments with type hints", function() {
            assert.equal("def function(".length, indent.nextIndentationLevel(
                [
                    "def function(x: int,"
                ],
                tabSize,
            ).indent);
        });
        test("broken up arguments final indent", function() {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "def function(x,",
                    "             y):",
                ],
                tabSize,
            ).indent);
        });
        test("broken up arguments final indent with type hints", function() {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "def function(x: int,",
                    "             y: float):",
                ],
                tabSize,
            ).indent);
        });
        test("broken up arguments with embedded list", function() {
            assert.equal("def function(x=[".length, indent.nextIndentationLevel(
                [
                    "def function(x=[0, 1,",
                ],
                tabSize,
            ).indent);
        });
        test("function with raise_error", function() {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "def fetch(self, request, callback=None, raise_error=True, **kwargs):"
                ], tabSize
            ).indent);
        })

    });

    suite("check_detent", function() {
        test("one", function() {
            assert.equal(false, indent._check_dedent("raise_error, ", false,  ["return", "pass", "break", "continue", "raise"]));
        })
    });

    suite("colon control flows", function () {
        test("if", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                ["if condition:"],
                tabSize,
            ).indent);
        });
        test("if/else", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "if condition:",
                    "    first",
                    "else:"
                ],
                tabSize,
            ).indent);
        });
        test("for", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "for i in range(5):",
                ],
                tabSize,
            ).indent);
        });
        test("try", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "try:",
                ],
                tabSize,
            ).indent);
        });
        test("try/except", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "try:",
                    "    will_fail()",
                    "except ValueError:",
                ],
                tabSize,
            ).indent);
        });
    });
    suite("lists, dicts, and tuples", function () {
        test("list", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                ],
                tabSize,
            ).indent);
        });
        test("list dedents at the end", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                    " 3, 4, 5,",
                    " 6, 7, 8]",
                ],
                tabSize,
            ).indent);
        });
        test("list extended", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                    " 3, 4, 5,"
                ],
                tabSize,
            ).indent);
        });
        test("nested lists", function () {
            assert.equal(2, indent.nextIndentationLevel(
                [
                    "[[0, 1, 2,",
                ],
                tabSize,
            ).indent);
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[[0, 1, 2],",
                ],
                tabSize,
            ).indent);
            assert.equal("[0, 1, 2, [".length, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, [3, 4, 5,",
                ],
                tabSize,
            ).indent);
            assert.equal(2, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                    " [3, 4, 5,",
                ],
                tabSize,
            ).indent);
            assert.equal(2, indent.nextIndentationLevel(
                [
                    "[[[0, 1, 2,",
                    "   3, 4, 5],",
                ],
                tabSize,
            ).indent);
        });
        test("dict", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "{'a': 0,",
                ],
                tabSize,
            ).indent);
        });
        test("dict extended", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "{'a': 0,",
                    " 'b': 1,"
                ],
                tabSize,
            ).indent);
        });
        test("tuple", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "(0, 1, 2,",
                ],
                tabSize,
            ).indent);
        });
        test("tuple extended", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "(0, 1, 2,",
                    " 3, 4, 5,"
                ],
                tabSize,
            ).indent);
        });
        test("mixed", function () {
            assert.equal("{'a': [".length, indent.nextIndentationLevel(
                [
                    "{'a': [0, 1, 2,",
                ],
                tabSize,
            ).indent);
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "({'a': 0},",
                ],
                tabSize,
            ).indent);
        });
        test("starting indented", function () {
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    [0, 1, 2,",
                ],
                tabSize,
            ).indent);
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    [0, 1, 2,",
                    "     3, 4, 5,"
                ],
                tabSize,
            ).indent);
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    (0, 1, 2,",
                    "     3, 4, 5,"
                ],
                tabSize,
            ).indent);
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    {0: 1,",
                    "     2: 3,"
                ],
                tabSize,
            ).indent);
        });
    });
    suite("hanging", function () {
        test("normal", function () {
            assert.equal(4, indent.nextIndentationLevel(
                [
                    "("
                ],
                tabSize,
            ).indent);
        });
        test("starting indented", function () {
            assert.equal(8, indent.nextIndentationLevel(
                [
                    "    ("
                ],
                tabSize,
            ).indent);
        });
        test("non-default indent size", function () {
            assert.equal(8, indent.nextIndentationLevel(
                [
                    "("
                ],
                8,
            ).indent);
        });
    });
    suite("strings", function () {
        test("list", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "['a', 'b',",
                ],
                tabSize,
            ).indent);
        });
        test("quoted bracket ender", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "['a', 'b]',",
                ],
                tabSize,
            ).indent);
        });
        test("quoted bracket ender in raw", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "['a', r'b]',",
                ],
                tabSize,
            ).indent);
        });
        test("just like REALLY messy", function () {
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
            var i: number;
            for (i of range) {
                assert.equal(expectedIndents[i], indent.nextIndentationLevel(
                    lines.slice(undefined, i + 1),
                    tabSize,
                ).indent);
            }
        });
    });
    suite("comments", function () {
        test("list", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #",
                ],
                tabSize,
            ).indent);
        });
        test("commented bracket ender", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #]",
                ],
                tabSize,
            ).indent);
        });
        test("commented bracket opener", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #[",
                ],
                tabSize,
            ).indent);
        });
        test("additional text", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #additional text and stuff",
                ],
                tabSize,
            ).indent);
        });
    });
    suite("hanging", function () {
        test("list", function () {
            assert.equal(true, indent.nextIndentationLevel(
                ["this_list = [",],
                tabSize,
            ).shouldHang);
        });
        test("function", function () {
            assert.equal(true, indent.nextIndentationLevel(
                ["def my_func(",],
                tabSize,
            ).shouldHang);
        });
        test("nested", function () {
            assert.equal(true, indent.nextIndentationLevel(
                ["class A:", "    def __init__("],
                tabSize,
            ).shouldHang);
        });
        test("negative case", function () {
            assert.equal(false, indent.nextIndentationLevel(
                ["class A:", "    def __init__(self):"],
                tabSize,
            ).shouldHang);
        });
    });
    suite("dedent", function () {
        test("return", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    return x"
                ],
                tabSize,
            ).indent);
        });
        test("pass", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    pass"
                ],
                tabSize,
            ).indent);
        });
        test("break", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "for i in range(5):",
                    "    break"
                ],
                tabSize,
            ).indent);
        });
        test("continue", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "for i in range(5):",
                    "    continue"
                ],
                tabSize,
            ).indent);
        });
        test("raise", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    raise NotImplementedError('uh oh')"
                ],
                tabSize,
            ).indent);
        });
        test("return, starting indented", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "class A():",
                    "    def function(x):",
                    "        return x"
                ],
                tabSize,
            ).indent);
        });

        test("return, with bracket", function() {
            assert.equal("        return self._connection_class()(".length , indent.nextIndentationLevel(
                [
                    "class A():",
                    "    def handle_request(self, request, release_callback, callback):",
                    "        return self._connection_class()(self, request, release_callback, callback"
                ],
                tabSize
            ).indent);
        })
    });
});
