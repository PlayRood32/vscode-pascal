import { Token, TokenType } from '../../../shared/src/types';

export class Lexer {
    private input: string;
    private pos = 0;
    private line = 1;
    private column = 1;
    private tokens: Token[] = [];

    private readonly keywords = new Set<string>([
        'program', 'unit', 'uses', 'interface', 'implementation',
        'begin', 'end', 'var', 'const', 'type', 'procedure', 'function',
        'if', 'then', 'else', 'while', 'do', 'for', 'to', 'downto',
        'repeat', 'until', 'case', 'of', 'record', 'class', 'object',
        'initialization', 'finalization', 'constructor', 'destructor'
    ]);

    constructor(input: string) {
        this.input = input + '\n';
    }

    public tokenize(): Token[] {
        while (this.pos < this.input.length) {
            this.skipWhitespaceAndComments();

            if (this.pos >= this.input.length) break;

            const ch = this.peek();

            if (this.isAlpha(ch) || ch === '_') {
                this.tokenizeIdentifierOrKeyword();
            } else if (this.isDigit(ch)) {
                this.tokenizeNumber();
            } else if (ch === '\'' || ch === '"') {
                this.tokenizeString();
            } else if ('+-*/=<>@.^,:;()[]{}'.includes(ch)) {
                this.tokenizeOperatorOrPunctuation();
            } else {
                this.advance();
            }
        }

        this.tokens.push({
            type: TokenType.EOF,
            value: '',
            line: this.line,
            column: this.column,
            startOffset: this.pos,
            endOffset: this.pos
        });

        return this.tokens;
    }

    private skipWhitespaceAndComments() {
        while (this.pos < this.input.length) {
            const ch = this.peek();
            if (/\s/.test(ch) && ch !== '\n') {
                this.advance();
            } else if (ch === '\n') {
                this.advance();
            } else if (ch === '/' && this.peek(1) === '/') {
                this.skipLineComment();
            } else if (ch === '{') {
                this.skipBlockComment();
            } else if (ch === '(' && this.peek(1) === '*') {
                this.skipPascalComment();
            } else {
                break;
            }
        }
    }

    private skipLineComment() {
        this.advance(2);
        while (this.pos < this.input.length && this.peek() !== '\n') this.advance();
    }

    private skipBlockComment() {
        this.advance();
        while (this.pos < this.input.length) {
            if (this.peek() === '}') {
                this.advance();
                break;
            }
            this.advance();
        }
    }

    private skipPascalComment() {
        this.advance(2);
        while (this.pos < this.input.length) {
            if (this.peek() === '*' && this.peek(1) === ')') {
                this.advance(2);
                break;
            }
            this.advance();
        }
    }

    private tokenizeIdentifierOrKeyword() {
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;

        while (this.isAlphaNumeric(this.peek())) this.advance();

        const value = this.input.substring(startPos, this.pos);
        const type = this.keywords.has(value.toLowerCase()) ? TokenType.Keyword : TokenType.Identifier;

        this.tokens.push({
            type,
            value,
            line: startLine,
            column: startColumn,
            startOffset: startPos,
            endOffset: this.pos
        });
    }

    private tokenizeNumber() {
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;

        while (this.isDigit(this.peek()) || this.peek() === '.') this.advance();

        this.tokens.push({
            type: TokenType.Number,
            value: this.input.substring(startPos, this.pos),
            line: startLine,
            column: startColumn,
            startOffset: startPos,
            endOffset: this.pos
        });
    }

    private tokenizeString() {
        const quote = this.peek();
        this.advance();

        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;

        while (this.pos < this.input.length && this.peek() !== quote) {
            if (this.peek() === '\n') break;
            this.advance();
        }

        const value = this.input.substring(startPos, this.pos);

        if (this.peek() === quote) this.advance();

        this.tokens.push({
            type: TokenType.String,
            value: quote + value + quote,
            line: startLine,
            column: startColumn,
            startOffset: startPos - 1,
            endOffset: this.pos
        });
    }

    private tokenizeOperatorOrPunctuation() {
        const startPos = this.pos;
        const startLine = this.line;
        const startColumn = this.column;

        const twoChar = this.input.substr(this.pos, 2);
        const operators = [':=', '<=', '>=', '<>', '..', '**'];
        if (operators.includes(twoChar)) {
            this.advance(2);
        } else {
            this.advance();
        }

        const value = this.input.substring(startPos, this.pos);
        const type = value.length > 1 || ['.', ':', ';', ',', '(', ')', '[', ']', '{', '}', '^', '@'].includes(value)
            ? TokenType.Punctuation
            : TokenType.Operator;

        this.tokens.push({
            type,
            value,
            line: startLine,
            column: startColumn,
            startOffset: startPos,
            endOffset: this.pos
        });
    }

    private peek(offset = 0): string {
        return this.input[this.pos + offset] || '';
    }

    private advance(count = 1): void {
        for (let i = 0; i < count; i++) {
            if (this.input[this.pos] === '\n') {
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
            this.pos++;
        }
    }

    private isAlpha(ch: string): boolean { return /[a-zA-Z_]/.test(ch); }
    private isDigit(ch: string): boolean { return /[0-9]/.test(ch); }
    private isAlphaNumeric(ch: string): boolean { return this.isAlpha(ch) || this.isDigit(ch); }
}