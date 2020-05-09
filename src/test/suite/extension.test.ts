// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
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
suite("trim whitespace-only lines", function () {
    const trimConfig = "trimLinesWithOnlyWhitespace";
    let settings = vscode.workspace.getConfiguration("pythonIndent");
    test("do not trim whitespace from empty line by default", async () => {
        await settings.update(trimConfig, settings.inspect(trimConfig)!.defaultValue);
        assert.equal(false, indent.trimCurrentLine("    "));
    });
    test("do not trim whitespace from non-empty line by default", function () {
        assert.equal(false, indent.trimCurrentLine("    a"));
    });
    test("do not trim whitespace from non-empty line if configured", async () => {
        await settings.update(trimConfig, true);
        assert.equal(false, indent.trimCurrentLine("    a"));
    });
    test("trim whitespace on empty line if configured", function () {
        assert.equal(true, indent.trimCurrentLine("    "));
    });
    test("trim whitespace on empty line with tabs if configured", function () {
        assert.equal(true, indent.trimCurrentLine("    \t"));
    });
    test("unset trim config settings", async () => {
        await settings.update(trimConfig, undefined);
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
