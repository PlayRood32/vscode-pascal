"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const types_1 = require("../../../shared/src/types");
class Lexer {
    constructor(input) {
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.keywords = new Set([
            'program', 'unit', 'uses', 'interface', 'implementation',
            'begin', 'end', 'var', 'const', 'type', 'procedure', 'function',
            'if', 'then', 'else', 'while', 'do', 'for', 'to', 'downto',
            'repeat', 'until', 'case', 'of', 'record', 'class', 'object',
            'initialization', 'finalization', 'constructor', 'destructor'
        ]);
        this.input = input + '\n';
    }
    tokenize() {
        while (this.pos < this.input.length) {
            this.skipWhitespaceAndComments();
            if (this.pos >= this.input.length)
                break;
            const ch = this.peek();
            if (this.isAlpha(ch) || ch === '_') {
                this.tokenizeIdentifierOrKeyword();
            }
            else if (this.isDigit(ch)) {
                this.tokenizeNumber();
            }
            else if (ch === '\'' || ch === '"') {
                this.tokenizeString();
            }
            else if ('+-*/=<>@.^,:;()[]{}'.includes(ch)) {
                this.tokenizeOperatorOrPunctuation();
            }
            else {
                this.advance();
            }
        }
        this.tokens.push({
            type: types_1.TokenType.EOF,
            value: '',
            line: this.line,
            column: this.column,
            startOffset: this.pos,
            endOffset: this.pos
        });
        return this.tokens;
    }
    skipWhitespaceAndComments() {
        while (this.pos < this.input.length) {
            const ch = this.peek();
            if (/\s/.test(ch) && ch !== '\n') {
                this.advance();
            }
            else if (ch === '\n') {
                this.advance();
            }
            else if (ch === '/' && this.peek(1) === '/') {
                this.skipLineComment();
            }
            else if (ch === '{') {
                this.skipBlockComment();
            }
            else if (ch === '(' && this.peek(1) === '*') {
                this.skipPascalComment();
            }
            else {
                break;
            }
        }
    }
    skipLineComment() {
        this.advance(2);
        while (this.pos < this.input.length && this.peek() !== '\n')
            this.advance();
    }
    skipBlockComment() {
        this.advance();
        while (this.pos < this.input.length) {
            if (this.peek() === '}') {
                this.advance();
                break;
            }
            this.advance();
        }
    }
    skipPascalComment() {
        this.advance(2);
        while (this.pos < this.input.length) {
            if (this.peek() === '*' && this.peek(1) === ')') {
                this.advance(2);
                break;
            }
            this.advance();
        }
    }
    tokenizeIdentifierOrKeyword() {
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;
        while (this.isAlphaNumeric(this.peek()))
            this.advance();
        const value = this.input.substring(startPos, this.pos);
        const type = this.keywords.has(value.toLowerCase()) ? types_1.TokenType.Keyword : types_1.TokenType.Identifier;
        this.tokens.push({
            type,
            value,
            line: startLine,
            column: startColumn,
            startOffset: startPos,
            endOffset: this.pos
        });
    }
    tokenizeNumber() {
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;
        while (this.isDigit(this.peek()) || this.peek() === '.')
            this.advance();
        this.tokens.push({
            type: types_1.TokenType.Number,
            value: this.input.substring(startPos, this.pos),
            line: startLine,
            column: startColumn,
            startOffset: startPos,
            endOffset: this.pos
        });
    }
    tokenizeString() {
        const quote = this.peek();
        this.advance();
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;
        while (this.pos < this.input.length && this.peek() !== quote) {
            if (this.peek() === '\n')
                break;
            this.advance();
        }
        const value = this.input.substring(startPos, this.pos);
        if (this.peek() === quote)
            this.advance();
        this.tokens.push({
            type: types_1.TokenType.String,
            value: quote + value + quote,
            line: startLine,
            column: startColumn,
            startOffset: startPos - 1,
            endOffset: this.pos
        });
    }
    tokenizeOperatorOrPunctuation() {
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;
        const twoChar = this.input.substr(this.pos, 2);
        const operators = [':=', '<=', '>=', '<>', '..', '**'];
        if (operators.includes(twoChar)) {
            this.advance(2);
        }
        else {
            this.advance();
        }
        const value = this.input.substring(startPos, this.pos);
        const type = value.length > 1 || ['.', ':', ';', ',', '(', ')', '[', ']', '{', '}', '^', '@'].includes(value)
            ? types_1.TokenType.Punctuation
            : types_1.TokenType.Operator;
        this.tokens.push({
            type,
            value,
            line: startLine,
            column: startColumn,
            startOffset: startPos,
            endOffset: this.pos
        });
    }
    peek(offset = 0) {
        return this.input[this.pos + offset] || '';
    }
    advance(count = 1) {
        for (let i = 0; i < count; i++) {
            if (this.input[this.pos] === '\n') {
                this.line++;
                this.column = 1;
            }
            else {
                this.column++;
            }
            this.pos++;
        }
    }
    isAlpha(ch) { return /[a-zA-Z_]/.test(ch); }
    isDigit(ch) { return /[0-9]/.test(ch); }
    isAlphaNumeric(ch) { return this.isAlpha(ch) || this.isDigit(ch); }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map