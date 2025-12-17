"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const types_1 = require("../../../shared/src/types");
const lexer_1 = require("./lexer");
const ast_1 = require("./ast");
class Parser {
    constructor(source) {
        this.pos = 0;
        const lexer = new lexer_1.Lexer(source);
        this.tokens = lexer.tokenize();
    }
    parse() {
        if (this.isAtEnd())
            return null;
        try {
            if (this.matchKeyword('program')) {
                return this.parseProgram();
            }
            return null;
        }
        catch (e) {
            console.error('Parsing failed:', e);
            return null;
        }
    }
    parseProgram() {
        const startToken = this.consumeKeyword('program');
        const name = this.consume(types_1.TokenType.Identifier).value;
        this.consumePunctuation(';');
        const block = this.parseBlock();
        const range = {
            start: this.tokenToPosition(startToken),
            end: block ? block.range.end : this.tokenToPosition(this.previous())
        };
        const programNode = ast_1.ASTBuilder.createProgram(name, range);
        if (block)
            programNode.children.push(block);
        return programNode;
    }
    parseBlock() {
        if (!this.matchKeyword('begin'))
            return null;
        const startToken = this.consumeKeyword('begin');
        const children = [];
        while (!this.matchKeyword('end') && !this.isAtEnd()) {
            this.advance(); // placeholder – extend for statements later
        }
        const endToken = this.consumeKeyword('end');
        this.consumePunctuation(';');
        const range = {
            start: this.tokenToPosition(startToken),
            end: this.tokenToPosition(endToken)
        };
        return ast_1.ASTBuilder.createBlock(range, children);
    }
    current() { return this.tokens[this.pos]; }
    previous() { return this.tokens[this.pos - 1]; }
    advance() { if (!this.isAtEnd())
        this.pos++; return this.previous(); }
    isAtEnd() { return this.current().type === types_1.TokenType.EOF; }
    matchKeyword(keyword) {
        return this.current().type === types_1.TokenType.Keyword && this.current().value.toLowerCase() === keyword;
    }
    consumeKeyword(keyword) {
        if (this.matchKeyword(keyword))
            return this.advance();
        throw new Error(`Expected keyword '${keyword}' at line ${this.current().line}`);
    }
    consume(type) {
        if (this.current().type === type)
            return this.advance();
        throw new Error(`Expected token type ${type} at line ${this.current().line}`);
    }
    consumePunctuation(punct = ';') {
        if (this.current().value === punct)
            this.advance();
    }
    tokenToPosition(token) {
        return { line: token.line - 1, character: token.column - 1 };
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map