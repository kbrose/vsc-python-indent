// Adapted from https://github.com/DSpeckhals/python-indent-parser

import { parse_lines, IParseOutput } from './parse-wasm/pythonindent';
export { IParseOutput } from './parse-wasm/pythonindent';

export enum Hanging {
    none, // No hanging indent should be done
    partial, // Indent the next line
    full, // Indent the next line, and put the closing bracket on its own line
}
// Examples, the pipe character indicates your cursor before pressing Enter
// Hanging.None:
//  def f():|
// Hanging.Partial
//  def f(|x):
// Hanging.Full
//  def f(|):

export function indentationLevel(line: string): number {
    return line.search(/\S|$/);
}

function nextIndentationLevel(parseOutput: IParseOutput, lines: string[], tabSize: number): number {
    const row = lines.length - 1;
    // openBracketStack: A stack of [row, col] pairs describing where open brackets are
    // lastClosedRow: Either empty, or an array [rowOpen, rowClose] describing the rows
    //     where the last bracket to be closed was opened and closed.
    // lastColonRow: The last row a def/for/if/elif/else/try/except etc. block started
    // dedentNext: Boolean, should we dedent the next row?
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { open_bracket_stack, last_closed_info, last_colon_row, dedent_next } = parseOutput;

    if (dedent_next && !open_bracket_stack.length) {
        return indentationLevel(lines[row]) - tabSize;
    }

    if (!open_bracket_stack.length) {
        // Can assume lastClosedRow is not empty
        if (last_closed_info?.close === row) {
            // We just closed a bracket on the row, get indentation from the
            // row where it was opened
            let indentLevel = indentationLevel(lines[last_closed_info?.open]);

            if (last_colon_row === row) {
                // We just finished def/for/if/elif/else/try/except etc. block,
                // need to increase indent level by 1.
                indentLevel += tabSize;
            }
            return indentLevel;
        }
        if (last_colon_row === row) {
            return indentationLevel(lines[row]) + tabSize;
        }
        return indentationLevel(lines[row]);
    }

    if (last_colon_row === row) {
        return indentationLevel(lines[row]) + tabSize;
    }

    // At this point, we are guaranteed openBracketStack is non-empty,
    // which means that we are currently in the middle of an opened/closed
    // bracket.
    const lastOpenBracketLocation = open_bracket_stack[open_bracket_stack.length - 1];

    // Get some booleans to help work through the cases

    // haveClosedBracket is true if we have ever closed a bracket
    const haveClosedBracket = last_closed_info !== undefined;
    // justOpenedBracket is true if we opened a bracket on the row we just finished
    const justOpenedBracket = lastOpenBracketLocation!.row === row;
    // justClosedBracket is true if we closed a bracket on the row we just finished
    const justClosedBracket = haveClosedBracket && last_closed_info?.close === row;
    // closedBracketOpenedAfterLineWithCurrentOpen is an ***extremely*** long name, and
    // it is true if the most recently closed bracket pair was opened on
    // a line AFTER the line where the current open bracket
    const closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket
        && last_closed_info?.open > lastOpenBracketLocation.row;

    let indentColumn;

    if (!justOpenedBracket && !justClosedBracket) {
        // The bracket was opened before the previous line,
        // and we did not close a bracket on the previous line.
        // Thus, nothing has happened that could have changed the
        // indentation level since the previous line, so
        // we should use whatever indent we are given.
        return indentationLevel(lines[row]);
    } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
        // A bracket that was opened after the most recent open
        // bracket was closed on the line we just finished typing.
        // We should use whatever indent was used on the row
        // where we opened the bracket we just closed. This needs
        // to be handled as a separate case from the last case below
        // in case the current bracket is using a hanging indent.
        // This handles cases such as
        // x = [0, 1, 2,
        //      [3, 4, 5,
        //       6, 7, 8],
        //      9, 10, 11]
        // which would be correctly handled by the case below, but it also correctly handles
        // x = [
        //     0, 1, 2, [3, 4, 5,
        //               6, 7, 8],
        //     9, 10, 11
        // ]
        // which the last case below would incorrectly indent an extra space
        // before the "9", because it would try to match it up with the
        // open bracket instead of using the hanging indent.
        indentColumn = indentationLevel(lines[last_closed_info.open]);
    } else {
        // lastOpenBracketLocation[1] is the column where the bracket was,
        // so need to bump up the indentation by one
        indentColumn = lastOpenBracketLocation!.col + 1;
    }

    return indentColumn;
}

export function indentationInfo(lines: string[], tabSize: number): { nextIndentationLevel: number; parseOutput: IParseOutput } {
    const parseOutput = parse_lines(lines);
    const nextIndent = nextIndentationLevel(parseOutput, lines, tabSize);
    return { nextIndentationLevel: nextIndent, parseOutput };
}

// Determines if a hanging indent should happen, and if so how much of one
export function shouldHang(line: string, char: number): Hanging {
    if (char <= 0 || line.length === 0) {
        return Hanging.none;
    }
    // Line continuation using backslash
    if (line[char - 1] === "\\") {
        return Hanging.partial;
    }
    if (!"[({".includes(line[char - 1])) {
        return Hanging.none;
    }
    // These characters don't have an effect one way or another.
    const neutralChars = ": \t\r".split("");
    // The presence of these characters mean that we're in Full mode.
    const fullChars = "]})".split("");

    const theRest = new Set(line.slice(char).split(""));
    // We only return Hanging.Full if the rest of the characters
    // are neutralChars/fullChars, *and* if at least one of the fullChars
    // is in theRest
    neutralChars.forEach((c) => theRest.delete(c));
    const containsSomeChars = theRest.size > 0;
    fullChars.forEach((c) => theRest.delete(c));
    const containsOnlyFullChars = theRest.size === 0;
    if (containsSomeChars && containsOnlyFullChars) {
        return Hanging.full;
    }
    return Hanging.partial;
}
