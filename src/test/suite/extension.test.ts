// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

import { Hanging } from 'python-indent-parser';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
import * as indent from '../../indent';

suite("dedent current line", function () {
    test("normal else", function () {
        assert.equal(4, indent.currentLineDedentation(
            [
                "if True:",
                "    pass",
                "    else:"
            ], 4));
    });
    test("else with small tabsize", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  if True:",
                "    pass",
                "    else:"
            ], 2));
    });
    test("else resulting in over dedentation", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "if True:",
                "    pass",
                "else:"
            ], 4));
    });
    test("else resulting in over dedentation, 2", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "if True:",
                "  pass",
                "  else:"
            ], 4));
    });
    test("elif", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  if True:",
                "    pass",
                "    elif False:"
            ],
            2));
    });
    test("except", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  try:",
                "    pass",
                "    except ValueError:"
            ], 2));
    });
    test("finally", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  try:",
                "    pass",
                "  except ValueError:",
                "    pass",
                "    finally:"
            ], 2));
    });
    test("try...else", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  try:",
                "    pass",
                "  except ValueError:",
                "    pass",
                "    else:"
            ], 2));
    });
    test("if...try...else do not go past try", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "if True:",
                "  try:",
                "    pass",
                "  except ValueError:",
                "    pass",
                "  else:"
            ], 2));
    });
    test("for...else", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  for i in range(5):",
                "    pass",
                "    else:"
            ], 2));
    });
    test("if...for...else", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "if True:",
                "  for i in range(5):",
                "    pass",
                "    else:"
            ], 2));
    });
    test("if...for...else do not go past for", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "if True:",
                "  for i in range(5):",
                "    pass",
                "  else:"
            ], 2));
    });
    test("while...else", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  while True:",
                "    pass",
                "    else:"
            ], 2));
    });
    test("if...while...else", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "if True:",
                "  while True:",
                "    pass",
                "    else:"
            ], 2));
    });
    test("if...while...else do not go past while", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "if True:",
                "  while True:",
                "    pass",
                "  else:"
            ], 2));
    });
    test("do not dedent past matching if", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "  if True:",
                "    pass",
                "  else:"
            ], 2));
    });
    test("do not dedent past FIRST matching if", function () {
        assert.equal(2, indent.currentLineDedentation(
            [
                "  if True:",
                "    if False:",
                "      pass",
                "      else:",
            ], 2));
    });
    test("do not dedent past FIRST matching if, already dedented", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "  if True:",
                "    if False:",
                "      pass",
                "    else:",
            ], 2));
    });
    test("do not re-indent with nested if", function () {
        assert.equal(0, indent.currentLineDedentation(
            [
                "  if True:",
                "    if False:",
                "      pass",
                "  else:",
            ], 2));
    });
});

suite("extend comment line", function () {
    test("should extend", function () {
        assert.equal(true, indent.extendCommentToNextLine(
            "  # this is a comment", 8));
    });
    test("no extend if cursor at end of line", function () {
        assert.equal(false, indent.extendCommentToNextLine(
            "  # this is a comment", "  # this is a comment".length));
    });
    test("no extend if cursor left of comment", function () {
        assert.equal(false, indent.extendCommentToNextLine(
            "  # this is a comment", 0));
        assert.equal(false, indent.extendCommentToNextLine(
            "  # this is a comment", 1));
        assert.equal(false, indent.extendCommentToNextLine(
            "  # this is a comment", 2));
    });
    test("no extend if only whitespace to right of cursor", function () {
        assert.equal(false, indent.extendCommentToNextLine(
            "  # x    ", 5));
        assert.equal(false, indent.extendCommentToNextLine(
            "  # x    ", 6));
        assert.equal(false, indent.extendCommentToNextLine(
            "  # x    ", 7));
    });
});

suite("trim whitespace-only lines", function () {
    test("do not trim whitespace from empty line without setting", async () => {
        assert.equal(false, indent.trimCurrentLine("    ", false));
    });
    test("do not trim whitespace from non-empty line without setting", function () {
        assert.equal(false, indent.trimCurrentLine("    a", false));
    });
    test("do not trim whitespace from non-empty line with setting", async () => {
        assert.equal(false, indent.trimCurrentLine("    a", true));
    });
    test("trim whitespace on empty line with setting", function () {
        assert.equal(true, indent.trimCurrentLine("    ", true));
    });
    test("trim whitespace on empty line with tabs with setting", function () {
        assert.equal(true, indent.trimCurrentLine("    \t", true));
    });
});

suite("detect whitespace length", function () {
    test("empty string", function () {
        assert.equal(0, indent.startingWhitespaceLength(""));
    });
    test("space-only string", function () {
        assert.equal(0, indent.startingWhitespaceLength("   "));
    });
    test("tab-only-2 string", function () {
        assert.equal(0, indent.startingWhitespaceLength("\t\t"));
    });
    test("arbitrary whitespace-only string", function () {
        assert.equal(0, indent.startingWhitespaceLength("  \t\t "));
    });
    test("real example 1", function () {
        assert.equal(4, indent.startingWhitespaceLength("    4"));
    });
    test("real example 2", function () {
        assert.equal(4, indent.startingWhitespaceLength("    456"));
    });
    test("real example 3", function () {
        assert.equal(5, indent.startingWhitespaceLength("    \t56"));
    });
    test("real example 4", function () {
        assert.equal(1, indent.startingWhitespaceLength(" Quota Era Demonstratum"));
    });
});

suite("integration tests", function () {
    const simpleCases: [string, string][] = [
        [
            "data = {'a': 0,|}",
            "data = {'a': 0,\n        }"
        ],
        [
            "def f():|",
            "def f():\n    "
        ],
        [
            `
data = {'a': 0,
        'b': [[1, 2,],|]}`,
            `
data = {'a': 0,
        'b': [[1, 2,],
              ]}`
        ],
        [
            `
data = {'a': 0,
        'b': [[1, 2,],
              [3, 4]],
        'c': 5}|`,
            `
data = {'a': 0,
        'b': [[1, 2,],
              [3, 4]],
        'c': 5}
`,
        ],
        [
            `
def f():
    if first and second:|`,
            `
def f():
    if first and second:
        `,
        ],
        [
            `
def f():
    if first and second:
        raise ValueError('no')|`,
            `
def f():
    if first and second:
        raise ValueError('no')
    `,
        ],
        [
            `
def f():
    if first and second:
        raise ValueError('no')
    else:|`,
            `
def f():
    if first and second:
        raise ValueError('no')
    else:
        `,
        ],
        [
            `
def f():
    if first and second:
        raise ValueError('no')
    else:
        print('hello')|`,
            `
def f():
    if first and second:
        raise ValueError('no')
    else:
        print('hello')
        `,
        ],
        [
            `
def f():
    if first and second:
        raise ValueError('no')
    else:
        print('hello')
    return 'done'|`,
            `
def f():
    if first and second:
        raise ValueError('no')
    else:
        print('hello')
    return 'done'
`,
        ]
    ];
    simpleCases.forEach((input_output, index) => {
        let paramGrid: [boolean, boolean][] = [
            [false, false], [false, true], [true, false], [true, true]];
        test("simple case # " + (index + 1).toString(), async () => {
            let lastLine = input_output[0].split('\n').pop()!;
            let lines = input_output[0].replace(/\|.*/, '').split('\n');
            paramGrid.forEach((params) => {
                let edits = indent.editsToMake(
                    lines,
                    lastLine.replace('|', ''),
                    4,
                    lines.length - 1,
                    lastLine.indexOf('|'),
                    params[0],
                    params[1],
                );
                let result = input_output[0].replace('|', edits.insert);
                assert.equal(input_output[1], result);
                assert.equal(Hanging.None, edits.hanging);
                assert.equal(0, edits.deletes.length);
            });
        });
    });
    test("requires delete # 1", async () => {
        let edits = indent.editsToMake(
            [
                "if True:",
                "  print('hi')",
                "  else:"
            ],
            "  else:",
            2,
            2,
            "  else:".length,
            false,
            false,
        );
        assert.equal("\n  ", edits.insert);
        assert.equal(1, edits.deletes.length);
        assert.equal(2, edits.deletes[0].start.line);
        assert.equal(0, edits.deletes[0].start.character);
        assert.equal(2, edits.deletes[0].end.line);
        assert.equal(2, edits.deletes[0].end.character);
        assert.equal(Hanging.None, edits.hanging);
    });
    test("requires delete # 2", async () => {
        let edits = indent.editsToMake(
            [
                "if True:",
                "  print('hi')",
                "  "
            ],
            "  ",
            2,
            2,
            "  ".length,
            true,
            false,
        );
        assert.equal("\n  ", edits.insert);
        assert.equal(1, edits.deletes.length);
        assert.equal(2, edits.deletes[0].start.line);
        assert.equal(0, edits.deletes[0].start.character);
        assert.equal(2, edits.deletes[0].end.line);
        assert.equal(2, edits.deletes[0].end.character);
        assert.equal(Hanging.None, edits.hanging);
    });
    test("requires delete # 3", async () => {
        let edits = indent.editsToMake(
            [
                "if True:",
                "  print('hi')",
                "  # this is a"
            ],
            "  # this is a long comment",
            2,
            2,
            "  # this is a".length,
            true,
            false,
        );
        assert.equal("\n  # ", edits.insert);
        assert.equal(1, edits.deletes.length);
        assert.equal(2, edits.deletes[0].start.line);
        assert.equal(13, edits.deletes[0].start.character);
        assert.equal(2, edits.deletes[0].end.line);
        assert.equal(14, edits.deletes[0].end.character);
        assert.equal(Hanging.None, edits.hanging);
    });
    test("hanging indent # 1", async () => {
        let edits = indent.editsToMake(
            [
                "",
                "def f(",
            ],
            "def f():",
            2,
            1,
            "def f(".length,
            false,
            false,
        );
        assert.equal(0, edits.deletes.length);
        assert.equal(Hanging.Full, edits.hanging);
    });
    test("hanging indent # 2", async () => {
        let edits = indent.editsToMake(
            [
                "",
                "def f(",
            ],
            "def f():",
            2,
            1,
            "def f(".length,
            false,
            true,
        );
        assert.equal("\n  ", edits.insert);
        assert.equal(0, edits.deletes.length);
        assert.equal(Hanging.Partial, edits.hanging);
    });
    test("respects trimLinesWithOnlyWhitespace parameter", async () => {
        let edits = indent.editsToMake(
            [
                "def f():",
                "  # this is a ",
            ],
            "  # this is a long comment",
            2,
            3,
            "  # this is a ".length,
            false,
            false,
        );
        assert.equal("\n  # ", edits.insert);
        assert.equal(0, edits.deletes.length);
        assert.equal(Hanging.None, edits.hanging);
    });
});
