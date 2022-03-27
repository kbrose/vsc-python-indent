import * as vscode from 'vscode';

import { Hanging, indentationInfo, indentationLevel, shouldHang } from 'python-indent-parser';

export function newlineAndIndent(
    textEditor: vscode.TextEditor,
    edit: vscode.TextEditorEdit,
    args: any[]
) {
    // Get rid of any user selected text, since a selection is
    // always deleted whenever ENTER is pressed.
    // This should always happen first
    if (!textEditor.selection.isEmpty) {
        edit.delete(textEditor.selection);
        // Make sure we get rid of the selection range.
        textEditor.selection = new vscode.Selection(textEditor.selection.start, textEditor.selection.start);
    }

    const position = textEditor.selection.active;
    const tabSize = <number>textEditor.options.tabSize!;
    const insertionPoint = new vscode.Position(position.line, position.character);
    const currentLine = textEditor.document.lineAt(position).text;
    let snippetCursor = '$0';
    let settings = vscode.workspace.getConfiguration('pythonIndent');
    if (settings.useTabOnHangingIndent) {
        snippetCursor = '$1';
    }
    let hanging = Hanging.None;
    let toInsert = '\n';

    try {
        if (textEditor.document.languageId === 'python') {
            const lines = textEditor.document.getText(
                new vscode.Range(0, 0, position.line, position.character)).split("\n");

            const edits = editsToMake(
                lines, currentLine, tabSize, position.line, position.character,
                settings.trimLinesWithOnlyWhitespace,
                settings.keepHangingBracketOnLine);
            toInsert = edits.insert;
            edits.deletes.forEach(range => { edit.delete(range); });
            hanging = edits.hanging;
        }
    } finally {
        // we never ever want to crash here, fallback on just inserting newline
        if (hanging === Hanging.Full) {
            // Hanging indents end up with the cursor in a bad place if we
            // just use the edit.insert() function, snippets behave better.
            // The VSCode snippet logic already does some indentation handling,
            // so don't use the toInsert, just ' ' * tabSize.
            // That behavior is not documented.
            textEditor.insertSnippet(new vscode.SnippetString('\n' + ' '.repeat(tabSize) + snippetCursor + '\n'));
        } else {
            edit.insert(insertionPoint, toInsert);
        }
        textEditor.revealRange(new vscode.Range(position, new vscode.Position(position.line + 2, 0)));
    }
}

export function editsToMake(
    lines: string[],
    currentLine: string,
    tabSize: number,
    lineNum: number,
    charNum: number,
    trimLinesWithOnlyWhitespace: boolean,
    keepHangingBracketOnLine: boolean
): { insert: string; deletes: vscode.Range[]; hanging: Hanging } {
    let { nextIndentationLevel: indent } = indentationInfo(lines, tabSize);
    let deletes: vscode.Range[] = [];

    // If cursor has whitespace to the right, followed by non-whitespace,
    // and also has non-whitespace to the left, then trim the whitespace to the right
    // of the cursor. E.g. in cases like "def f(x,| y):"
    const numCharsToDelete = startingWhitespaceLength(currentLine.slice(charNum));
    if ((numCharsToDelete > 0) && (/\S/.test(currentLine.slice(0, charNum)))) {
        deletes.push(new vscode.Range(
            lineNum, charNum, lineNum, charNum + numCharsToDelete));
    }

    const dedentAmount = currentLineDedentation(lines, tabSize);
    const shouldTrim = trimCurrentLine(lines[lines.length-1], trimLinesWithOnlyWhitespace);
    if ((dedentAmount > 0) || shouldTrim) {
        const totalDeleteAmount = shouldTrim ? lines[lines.length-1].length : dedentAmount;
        deletes.push(new vscode.Range(lineNum, 0, lineNum, totalDeleteAmount));
        indent = Math.max(indent - dedentAmount, 0);
    }
    let hanging = shouldHang(currentLine, charNum);
    if (keepHangingBracketOnLine && hanging === Hanging.Full) {
        // The only difference between partial and full is that
        // full puts the closing bracket on its own line.
        hanging = Hanging.Partial;
    }
    let toInsert = '\n';
    if (hanging === Hanging.Partial) {
        toInsert = '\n' + ' '.repeat(indentationLevel(currentLine) + tabSize);
    } else {
        toInsert = '\n' + ' '.repeat(Math.max(indent, 0));
    }
    if (extendCommentToNextLine(currentLine, charNum)) {
        toInsert = toInsert + '# ';
    }
    return {insert: toInsert, deletes: deletes, hanging: hanging};
}

// Current line is a comment line, and we should make the next one commented too.
export function extendCommentToNextLine(line: string, pos: number): boolean {
    if (line.trim().startsWith('#') && line.slice(pos).trim().length && line.slice(0, pos).trim().length) {
        return true;
    }
    return false;
}

// Returns the number of spaces that should be removed from the current line
export function currentLineDedentation(lines: string[], tabSize: number): number {
    const dedentKeywords: { [index: string]: string[] } =
        {elif: ["if"], else: ["if", "try", "for", "while"], except: ["try"], finally: ["try"]};
    // Reverse to help searching, use slice() to copy since reverse() is inplace
    lines = lines.slice().reverse();
    const line = lines[0];
    const trimmed = line.trim();
    if (trimmed.endsWith(":")) {
        for (const keyword of Object.keys(dedentKeywords).filter((key) => trimmed.startsWith(key))) {
            for (const matchedLine of lines.slice(1).filter((l) => l.trim().endsWith(":"))) {
                const matchedLineTrimmed = matchedLine.trim();
                if (dedentKeywords[keyword].some((matcher) => matchedLineTrimmed.startsWith(matcher))) {
                    const currentIndent = indentationLevel(line);
                    const matchedIndent = indentationLevel(matchedLine);
                    return Math.max(0, Math.min(tabSize, currentIndent, currentIndent - matchedIndent));
                }
            }
        }
    }
    return 0;
}

// Returns true if the current line should have all of its characters deleted.
export function trimCurrentLine(line: string, trimLinesWithOnlyWhitespace: boolean): boolean {
    if (trimLinesWithOnlyWhitespace) {
        if (line.trim().length === 0) {
            // That means the string contained only whitespace.
            return true;
        }
    }
    return false;
}

// Returns the number of whitespace characters until the next non-whitespace char
// If there are no non-whitespace chars, returns 0, regardless of number of whitespace chars.
export function startingWhitespaceLength(line: string): number {
    return /\S/.exec(line)?.index ?? 0;
}
