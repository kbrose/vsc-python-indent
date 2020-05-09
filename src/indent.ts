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

            let { nextIndentationLevel: indent } = indentationInfo(lines, tabSize);

            const dedentAmount = currentLineDedentation(lines, tabSize);
            const shouldTrim = trimCurrentLine(lines[lines.length-1], settings);
            if ((dedentAmount > 0) || shouldTrim) {
                const totalDeleteAmount = shouldTrim ? lines[lines.length-1].length : dedentAmount;
                edit.delete(new vscode.Range(position.line, 0, position.line, totalDeleteAmount));
                indent = Math.max(indent - dedentAmount, 0);
            }
            hanging = shouldHang(currentLine, position.character);
            if (hanging === Hanging.Partial) {
                toInsert = '\n' + ' '.repeat(indentationLevel(currentLine) + tabSize);
            } else {
                toInsert = '\n' + ' '.repeat(Math.max(indent, 0));
            }
            if (extendCommentToNextLine(currentLine, position.character)) {
                toInsert = toInsert + '# ';
            }
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

// Current line is a comment line, and we should make the next one commented too.
export function extendCommentToNextLine(line: string, pos: number): boolean {
    if (line.trim().startsWith('#') && line.slice(pos).trim().length && line.slice(0, pos).trim().length) {
        return true;
    }
    return false;
}

// Returns the number of spaces that should be removed from the current line
export function currentLineDedentation(lines: string[], tabSize: number): number {
    const dedentKeywords: { [index: string]: string[]; } =
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
export function trimCurrentLine(line: string, settings: vscode.WorkspaceConfiguration): boolean {
    if (settings.trimLinesWithOnlyWhitespace) {
        if (line.trim().length === 0) {
            // That means the string contained only whitespace.
            return true;
        }
    }
    return false;
}
