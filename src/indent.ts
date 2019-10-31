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
    if (vscode.workspace.getConfiguration('pythonIndent').useTabOnHangingIndent) {
        snippetCursor = '$1';
    }
    let hanging = Hanging.None;
    let toInsert = '\n';

    try {
        if (textEditor.document.languageId === 'python') {
            const lines = textEditor.document.getText(
                new vscode.Range(0, 0, position.line, position.character)).split("\n");

            const { nextIndentationLevel, parseOutput: { dedentNext } } = indentationInfo(lines, tabSize);
            let indent = nextIndentationLevel;

            const spacesToRemove = currentLineDedentation(lines, tabSize);
            if (spacesToRemove > 0) {
                // don't dedent the current line if we already dedented it, e.g. after a "return"
                if (dedentNext) {
                    edit.delete(new vscode.Range(position.line, 0, position.line, spacesToRemove));
                    indent = Math.max(indent - spacesToRemove, 0);
                }
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
    const dedentKeywords: { [index: string]: string; } = {elif: "if", else: "if", except: "try", finally: "try"};
    // Reverse to help searching
    lines = lines.reverse();
    const line = lines[0];
    const trimmed = line.trim();
    if (trimmed.endsWith(":")) {
        for (const keyword in dedentKeywords) {
            if (trimmed.startsWith(keyword)) {
                for (const matchedLine of lines.slice(1)) {
                    const matchedLineTrimmed = matchedLine.trim();
                    if (matchedLineTrimmed.endsWith(":") && matchedLineTrimmed.startsWith(dedentKeywords[keyword])) {
                        const currentIndent = indentationLevel(line);
                        const matchedIndent = indentationLevel(matchedLine);
                        return Math.max(0, Math.min(tabSize, currentIndent, currentIndent - matchedIndent));
                    }
                }
            }
        }
    }
    return 0;
}
