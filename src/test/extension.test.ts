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
            ));
        });
        test("non-default indent size", function() {
            assert.equal(8, indent.nextIndentationLevel(
                ["def function(x):"],
                8,
            ));
        });
        test("normal, within class", function() {
            assert.equal(tabSize * 2, indent.nextIndentationLevel(
                [
                    "class A:",
                    "    def function(x):",
                ],
                tabSize,
            ));
        });
        test("broken up arguments", function() {
            assert.equal("def function(".length, indent.nextIndentationLevel(
                [
                    "def function(x,"
                ],
                tabSize,
            ));
        });
        test("broken up arguments with type hints", function() {
            assert.equal("def function(".length, indent.nextIndentationLevel(
                [
                    "def function(x: int,"
                ],
                tabSize,
            ));
        });
        test("broken up arguments final indent", function() {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "def function(x,",
                    "             y):",
                ],
                tabSize,
            ));
        });
        test("broken up arguments final indent with type hints", function() {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "def function(x: int,",
                    "             y: float):",
                ],
                tabSize,
            ));
        });
        test("broken up arguments with embedded list", function() {
            assert.equal("def function(x=[".length, indent.nextIndentationLevel(
                [
                    "def function(x=[0, 1,",
                ],
                tabSize,
            ));
        });
    });
    suite("colon control flows", function () {
        test("if", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                ["if condition:"],
                tabSize,
            ));
        });
        test("if/else", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "if condition:",
                    "    first",
                    "else:"
                ],
                tabSize,
            ));
        });
        test("for", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "for i in range(5):",
                ],
                tabSize,
            ));
        });
        test("try", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "try:",
                ],
                tabSize,
            ));
        });
        test("try/except", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "try:",
                    "    will_fail()",
                    "except ValueError:",
                ],
                tabSize,
            ));
        });
    });
    suite("lists, dicts, and tuples", function () {
        test("list", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                ],
                tabSize,
            ));
        });
        test("list dedents at the end", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                    " 3, 4, 5,",
                    " 6, 7, 8]",
                ],
                tabSize,
            ));
        });
        test("list extended", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                    " 3, 4, 5,"
                ],
                tabSize,
            ));
        });
        test("nested lists", function () {
            assert.equal(2, indent.nextIndentationLevel(
                [
                    "[[0, 1, 2,",
                ],
                tabSize,
            ));
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[[0, 1, 2],",
                ],
                tabSize,
            ));
            assert.equal("[0, 1, 2, [".length, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, [3, 4, 5,",
                ],
                tabSize,
            ));
            assert.equal(2, indent.nextIndentationLevel(
                [
                    "[0, 1, 2,",
                    " [3, 4, 5,",
                ],
                tabSize,
            ));
            assert.equal(2, indent.nextIndentationLevel(
                [
                    "[[[0, 1, 2,",
                    "   3, 4, 5],",
                ],
                tabSize,
            ));
        });
        test("dict", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "{'a': 0,",
                ],
                tabSize,
            ));
        });
        test("dict extended", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "{'a': 0,",
                    " 'b': 1,"
                ],
                tabSize,
            ));
        });
        test("tuple", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "(0, 1, 2,",
                ],
                tabSize,
            ));
        });
        test("tuple extended", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "(0, 1, 2,",
                    " 3, 4, 5,"
                ],
                tabSize,
            ));
        });
        test("mixed", function () {
            assert.equal("{'a': [".length, indent.nextIndentationLevel(
                [
                    "{'a': [0, 1, 2,",
                ],
                tabSize,
            ));
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "({'a': 0},",
                ],
                tabSize,
            ));
        });
        test("starting indented", function () {
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    [0, 1, 2,",
                ],
                tabSize,
            ));
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    [0, 1, 2,",
                    "     3, 4, 5,"
                ],
                tabSize,
            ));
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    (0, 1, 2,",
                    "     3, 4, 5,"
                ],
                tabSize,
            ));
            assert.equal(5, indent.nextIndentationLevel(
                [
                    "    {0: 1,",
                    "     2: 3,"
                ],
                tabSize,
            ));
        });
    });
    suite("strings", function () {
        test("list", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "['a', 'b',",
                ],
                tabSize,
            ));
        });
        test("quoted bracket ender", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "['a', 'b]',",
                ],
                tabSize,
            ));
        });
        test("quoted bracket ender in raw", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "['a', r'b]',",
                ],
                tabSize,
            ));
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
                ));
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
            ));
        });
        test("commented bracket ender", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #]",
                ],
                tabSize,
            ));
        });
        test("commented bracket opener", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #[",
                ],
                tabSize,
            ));
        });
        test("additional text", function () {
            assert.equal(1, indent.nextIndentationLevel(
                [
                    "[0, 1, 2, #additional text and stuff",
                ],
                tabSize,
            ));
        });
    });
    suite("hanging", function () {
        test("simple as can be", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "[]",
                1
            ));
        });
        test("list", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "this_list = [",
                "this_list = [".length,
            ));
        });
        test("function", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "def my_func(",
                "def my_func(".length,
            ));
        });
        test("function with end paren", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "def my_func()",
                "def my_func(".length,
            ));
        });
        test("function with end paren and colon", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "def my_func():",
                "def my_func(".length,
            ));
        });
        test("function with end paren and colon and whitespace", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "def my_func(): ",
                "def my_func(".length,
            ));
        });
        test("starting indented", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "    def __init__(",
                "    def __init__(".length
            ));
        });
        test("starting indented with end paren", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "    def __init__()",
                "    def __init__(".length
            ));
        });
        test("starting indented with end paren and colon", function () {
            assert.equal(indent.Hanging.Full, indent.shouldHang(
                "    def __init__():",
                "    def __init__(".length
            ));
        });
        test("negative case", function () {
            assert.equal(indent.Hanging.None, indent.shouldHang(
                "    def __init__(self):",
                "    def __init__(self):".length,
            ));
        });
        test("empty string", function () {
            assert.equal(indent.Hanging.None, indent.shouldHang(
                "",
                0
            ));
        });
        test("text after position", function () {
            assert.equal(indent.Hanging.Partial, indent.shouldHang(
                "this_list = [x]",
                "this_list = [".length,
            ));
        });
    });
    suite("dedent next line", function () {
        test("return", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    return x"
                ],
                tabSize,
            ));
        });
        test("pass", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    pass"
                ],
                tabSize,
            ));
        });
        test("break", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "for i in range(5):",
                    "    break"
                ],
                tabSize,
            ));
        });
        test("continue", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "for i in range(5):",
                    "    continue"
                ],
                tabSize,
            ));
        });
        test("raise", function () {
            assert.equal(0, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    raise NotImplementedError('uh oh')"
                ],
                tabSize,
            ));
        });
        test("return, starting indented", function () {
            assert.equal(tabSize, indent.nextIndentationLevel(
                [
                    "class A():",
                    "    def function(x):",
                    "        return x"
                ],
                tabSize,
            ));
        });
        test("return, with bracket", function() {
            assert.equal("        return self._connection_class()(".length , indent.nextIndentationLevel(
                [
                    "class A():",
                    "    def handle_request(self, request, release_callback, callback):",
                    "        return self._connection_class()(self, request, release_callback, callback"
                ],
                tabSize
            ));
        });
        test("raise inside argument", function () {
            assert.equal(4, indent.nextIndentationLevel(
                [
                    "def function(raise_error=False):"
                ],
                tabSize,
            ));
        });
        test("return inside string", function () {
            assert.equal(4, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    print('this returns None')"
                ],
                tabSize,
            ));
        });
        test("return inside triple string", function () {
            assert.equal(4, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    '''",
                    "    return"
                ],
                tabSize,
            ));
        });
        test("return inside variable name", function () {
            assert.equal(4, indent.nextIndentationLevel(
                [
                    "def function(x):",
                    "    return_x = 5"
                ],
                tabSize,
            ));
        });
    });
    suite("dedent current line", function () {
        test("normal else", function () {
            assert.equal(4, indent.dedentCurrentLine("    else:", 4));
        });
        test("else with small tabsize", function () {
            assert.equal(2, indent.dedentCurrentLine("    else:", 2));
        });
        test("else resulting in over dedentation", function () {
            assert.equal(0, indent.dedentCurrentLine("else:", 4));
        });
        test("else resulting in over dedentation, 2", function () {
            assert.equal(2, indent.dedentCurrentLine("  else:", 4));
        });
        test("elif", function () {
            assert.equal(2, indent.dedentCurrentLine("    elif x == 5:", 2));
        });
        test("except", function () {
            assert.equal(2, indent.dedentCurrentLine("    except ValueError:", 2));
        });
        test("finally", function () {
            assert.equal(2, indent.dedentCurrentLine("    finally:", 2));
        });
    });
});
