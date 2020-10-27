// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

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

class MockedFalseWorkspaceConfiguration {
    trimLinesWithOnlyWhitespace = false;
    get(section: string) {
        return undefined;
    }
    has(section: string) {
        return true;
    }
    inspect(section: string) {
        return undefined;
    }
    async update(section: string, value: boolean) {
        return undefined;
    }
}

class MockedTrueWorkspaceConfiguration {
    trimLinesWithOnlyWhitespace = true;
    get(section: string) {
        return undefined;
    }
    has(section: string) {
        return true;
    }
    inspect(section: string) {
        return undefined;
    }
    async update(section: string, value: boolean) {
        return undefined;
    }
}

suite("trim whitespace-only lines", function () {
    const falseSetting = new MockedFalseWorkspaceConfiguration();
    const trueSetting = new MockedTrueWorkspaceConfiguration();
    test("do not trim whitespace from empty line without setting", async () => {
        assert.equal(false, indent.trimCurrentLine("    ", falseSetting));
    });
    test("do not trim whitespace from non-empty line without setting", function () {
        assert.equal(false, indent.trimCurrentLine("    a", falseSetting));
    });
    test("do not trim whitespace from non-empty line with setting", async () => {
        assert.equal(false, indent.trimCurrentLine("    a", trueSetting));
    });
    test("trim whitespace on empty line with setting", function () {
        assert.equal(true, indent.trimCurrentLine("    ", trueSetting));
    });
    test("trim whitespace on empty line with tabs with setting", function () {
        assert.equal(true, indent.trimCurrentLine("    \t", trueSetting));
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
