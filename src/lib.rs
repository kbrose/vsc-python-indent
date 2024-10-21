use regex::Regex;
use std::sync::LazyLock;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone)]
pub struct RowCol {
    pub row: usize,
    pub col: usize,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct OpenClose {
    pub open: usize,
    pub close: usize,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct LastSeenIndenters {
    pub if_: Option<usize>,
    pub for_: Option<usize>,
    pub try_: Option<usize>,
    pub while_: Option<usize>,
}

impl LastSeenIndenters {
    fn new() -> LastSeenIndenters {
        LastSeenIndenters {
            if_: None,
            for_: None,
            try_: None,
            while_: None,
        }
    }
}

#[wasm_bindgen(getter_with_clone)]
pub struct IParseOutput {
    pub can_hang: bool,
    pub dedent_next: bool,
    pub last_closed_info: Option<OpenClose>,
    pub last_colon_row: Option<usize>,
    pub open_bracket_stack: Vec<RowCol>,
    pub last_seen_indenters: LastSeenIndenters,
}

static DEDENT_NEXT_KEYWORDS: [LazyLock<Regex>; 5] = [
    LazyLock::new(|| Regex::new(r"^\s*return\b").unwrap()),
    LazyLock::new(|| Regex::new(r"^\s*pass\b").unwrap()),
    LazyLock::new(|| Regex::new(r"^\s*break\b").unwrap()),
    LazyLock::new(|| Regex::new(r"^\s*continue\b").unwrap()),
    LazyLock::new(|| Regex::new(r"^\s*raise\b").unwrap()),
];

#[wasm_bindgen]
pub fn parse_lines(lines: Vec<String>) -> IParseOutput {
    let mut open_bracket_stack = Vec::new();
    let mut last_closed_info = None;
    let mut last_colon_row = None;
    let mut can_hang = false;
    let mut dedent_next = false;
    let mut last_seen_indenters = LastSeenIndenters::new();

    let mut string_delimiter: Option<char> = None;
    let mut in_triple_quoted_string = false;
    let mut check_next_char_for_string = false;

    for (row, line) in lines.iter().enumerate() {
        dedent_next =
            string_delimiter.is_none() && DEDENT_NEXT_KEYWORDS.iter().any(|re| re.is_match(line));

        let trimmed = line.trim_start();
        if trimmed.starts_with("if") {
            last_seen_indenters.if_ = Some(row);
        } else if trimmed.starts_with("for") {
            last_seen_indenters.for_ = Some(row);
        } else if trimmed.starts_with("try") {
            last_seen_indenters.try_ = Some(row);
        } else if trimmed.starts_with("while") {
            last_seen_indenters.while_ = Some(row);
        }

        // Keep track of the number of consecutive string delimiter's we've seen
        // in this line; this is used to tell if we are in a triple quoted string
        let mut num_consecutive_string_delimiters = 0;

        // Whether or not the current character is being escaped
        // applicable when we are currently in a string
        let mut is_escaped = false;

        let last_last_colon_row = last_colon_row;
        for (col, c) in line.chars().enumerate() {
            if (Some(c) == string_delimiter) && !is_escaped {
                num_consecutive_string_delimiters += 1;
            } else if check_next_char_for_string {
                num_consecutive_string_delimiters = 0;
                string_delimiter = None;
            } else {
                num_consecutive_string_delimiters = 0;
            }

            check_next_char_for_string = false;

            // If stringDelimiter is set, then we are in a string
            if string_delimiter.is_some() {
                if is_escaped {
                    // If current character is escaped, then we do not care what it was,
                    // but since it is impossible for the next character to be escaped as well,
                    // go ahead and set that to false
                    is_escaped = false;
                } else if Some(c) == string_delimiter {
                    // We are seeing the same quote that started the string, i.e. ' or "
                    if in_triple_quoted_string {
                        if num_consecutive_string_delimiters == 3 {
                            // Breaking out of the triple quoted string...
                            num_consecutive_string_delimiters = 0;
                            string_delimiter = None;
                            in_triple_quoted_string = false;
                        }
                    } else if num_consecutive_string_delimiters == 3 {
                        // reset the count, correctly handles cases like ''''''
                        num_consecutive_string_delimiters = 0;
                        in_triple_quoted_string = true;
                    } else if num_consecutive_string_delimiters == 2 {
                        // We are not currently in a triple quoted string, and we've
                        // seen two of the same string delimiter in a row. This could
                        // either be an empty string, i.e. '' or "", or it could be
                        // the start of a triple quoted string. We will check the next
                        // character, and if it matches then we know we're in a triple
                        // quoted string, and if it does not match we know we're not
                        // in a string any more (i.e. it was the empty string).
                        check_next_char_for_string = true;
                    } else if num_consecutive_string_delimiters == 1 {
                        // We are not in a string that is not triple quoted, and we've
                        // just seen an un-escaped instance of that string delimiter.
                        // In other words, we've left the string.
                        // It is also worth noting that it is impossible for
                        // numConsecutiveStringDelimiters to be 0 at this point, so
                        // this set of if/else if statements covers all cases.
                        string_delimiter = None;
                    }
                } else if c == '\\' {
                    // We are seeing an unescaped backslash, the next character is escaped.
                    // Note that this is not exactly true in raw strings, HOWEVER, in raw
                    // strings you can still escape the quote mark by using a backslash.
                    // Since that's all we really care about as far as escaped characters
                    // go, we can assume we are now escaping the next character.
                    is_escaped = true;
                }
            } else if ['[', '(', '{'].contains(&c) {
                // If the only characters after this opening bracket are whitespace,
                // then we should do a hanging indent. If there are other non-whitespace
                // characters after this, then they will set the canHang boolean to false
                can_hang = true;
                open_bracket_stack.push(RowCol { row, col });
            } else if [' ', '\t', '\r', '\n'].contains(&c) {
                // If it's whitespace, we don't care at all
            } else if c == '#' {
                // # outside of string -- skip the rest of this line.
                break;
            } else {
                // We've already skipped if the character was white-space, an opening
                // bracket, or a comment, so that means the current character is not
                // whitespace and not an opening bracket, so canHang needs to get set to
                // false.
                can_hang = false;

                // Similar to above, we've already skipped all irrelevant characters,
                // so if we saw a colon earlier in this line, then we would have
                // incorrectly thought it was the end of a def/for/if/elif/else/try/except
                // block when it was actually a dictionary being defined/type hinting,
                // reset the lastColonRow variable to whatever it was when we started
                // parsing this line.
                last_colon_row = last_last_colon_row;

                if c == ':' {
                    last_colon_row = Some(row);
                } else if [']', ')', '}'].contains(&c) && open_bracket_stack.len() > 0 {
                    let opened_row = open_bracket_stack.pop().unwrap().row;
                    // last_closed_info is used to set the indentation back to what it was
                    // on the line when the corresponding bracket was opened. However,
                    // if the bracket was opened on this same line, then we do not need
                    // or want to do that, and in fact, it can obscure other earlier
                    // bracket pairs. E.g.:
                    //   def f(api):
                    //       (api
                    //        .doSomething()
                    //        .anotherThing()
                    //        ).finish()
                    //       print('Correctly indented!')
                    // without the following check, the print statement would be indented
                    // 5 spaces instead of 4.
                    if row != opened_row {
                        last_closed_info = Some(OpenClose {
                            open: opened_row,
                            close: row,
                        });
                    }
                } else if ['\'', '"'].contains(&c) {
                    string_delimiter = Some(c);
                    num_consecutive_string_delimiters += 1;
                }
            }
        }
    }

    IParseOutput {
        can_hang,
        dedent_next,
        last_closed_info,
        last_colon_row,
        open_bracket_stack,
        last_seen_indenters,
    }
}
