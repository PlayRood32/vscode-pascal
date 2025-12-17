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
            else if (this.matchKeyword('unit')) {
                return this.parseUnit();
            }
            else if (this.matchKeyword('procedure') || this.matchKeyword('function')) {
                return this.parseProcedureOrFunction();
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    parseProgram() {
        const startToken = this.consumeKeyword('program');
        const name = this.consume(types_1.TokenType.Identifier).value;
        this.consumePunctuation(';');
        const uses = this.parseUses();
        const declarations = this.parseDeclarations();
        const block = this.parseBlock();
        const range = {
            start: this.tokenToPosition(startToken),
            end: block?.range.end || this.tokenToPosition(this.previous())
        };
        const programNode = ast_1.ASTBuilder.createProgram(name, range);
        programNode.children.push(...uses, ...declarations);
        if (block)
            programNode.children.push(block);
        return programNode;
    }
    parseUnit() {
        const startToken = this.consumeKeyword('unit');
        const name = this.consume(types_1.TokenType.Identifier).value;
        this.consumePunctuation(';');
        this.consumeKeyword('interface');
        const interfaceUses = this.parseUses();
        const interfaceDecls = this.parseDeclarations();
        const interfaceSection = ast_1.ASTBuilder.createInterfaceSection(this.getRangeFromTokens(startToken, this.previous()), [...interfaceUses, ...interfaceDecls]);
        if (this.matchKeyword('implementation')) {
            this.consumeKeyword('implementation');
            const implUses = this.parseUses();
            const implDecls = this.parseDeclarations();
            const implSection = ast_1.ASTBuilder.createImplementationSection(this.getRangeFromTokens(this.previous(), this.previous()), [...implUses, ...implDecls]);
            interfaceSection.children.push(implSection);
        }
        if (this.matchKeyword('initialization')) {
            const initBlock = this.parseInitialization();
            if (initBlock)
                interfaceSection.children.push(initBlock);
        }
        const unitNode = ast_1.ASTBuilder.createUnit(name, {
            start: this.tokenToPosition(startToken),
            end: this.tokenToPosition(this.previous())
        });
        unitNode.children.push(interfaceSection);
        return unitNode;
    }
    parseProcedureOrFunction() {
        const isFunction = this.matchKeyword('function');
        const startToken = isFunction ? this.consumeKeyword('function') : this.consumeKeyword('procedure');
        const name = this.consume(types_1.TokenType.Identifier).value;
        this.parseParameters();
        let returnType = null;
        if (isFunction) {
            this.consumePunctuation(':');
            returnType = this.consume(types_1.TokenType.Identifier).value;
        }
        this.consumePunctuation(';');
        const declarations = this.parseDeclarations();
        const block = this.parseBlock();
        this.consumePunctuation(';');
        const range = {
            start: this.tokenToPosition(startToken),
            end: this.tokenToPosition(this.previous())
        };
        const node = isFunction
            ? ast_1.ASTBuilder.createFunction(name, range)
            : ast_1.ASTBuilder.createProcedure(name, range);
        node.children.push(...declarations);
        if (block)
            node.children.push(block);
        return node;
    }
    parseParameters() {
        if (!this.matchPunctuation('('))
            return;
        this.consumePunctuation('(');
        while (!this.matchPunctuation(')')) {
            if (this.matchKeyword('var') || this.matchKeyword('const') || this.matchKeyword('out'))
                this.advance();
            this.consume(types_1.TokenType.Identifier);
            if (this.matchPunctuation(':')) {
                this.consumePunctuation(':');
                this.consume(types_1.TokenType.Identifier);
            }
            if (this.matchPunctuation(';'))
                this.consumePunctuation(';');
        }
        this.consumePunctuation(')');
    }
    parseUses() {
        if (!this.matchKeyword('uses'))
            return [];
        this.consumeKeyword('uses');
        const nodes = [];
        do {
            const unitName = this.consume(types_1.TokenType.Identifier).value;
            nodes.push(ast_1.ASTBuilder.createVarDeclaration(unitName, this.getCurrentRange()));
        } while (this.matchPunctuation(',') && this.advance().type === types_1.TokenType.Identifier);
        this.consumePunctuation(';');
        return nodes;
    }
    parseDeclarations() {
        const decls = [];
        while (true) {
            if (this.matchKeyword('var')) {
                decls.push(...this.parseVarSection());
            }
            else if (this.matchKeyword('const')) {
                decls.push(...this.parseConstSection());
            }
            else if (this.matchKeyword('type')) {
                decls.push(...this.parseTypeSection());
            }
            else if (this.matchKeyword('procedure') || this.matchKeyword('function')) {
                decls.push(this.parseProcedureOrFunction());
            }
            else {
                break;
            }
        }
        return decls;
    }
    parseVarSection() {
        this.consumeKeyword('var');
        const vars = [];
        while (!this.isSectionEnd()) {
            const name = this.consume(types_1.TokenType.Identifier).value;
            this.consumePunctuation(':');
            this.consume(types_1.TokenType.Identifier);
            this.consumePunctuation(';');
            vars.push(ast_1.ASTBuilder.createVarDeclaration(name, this.getCurrentRange()));
        }
        return vars;
    }
    parseConstSection() {
        this.consumeKeyword('const');
        const consts = [];
        while (!this.isSectionEnd()) {
            const name = this.consume(types_1.TokenType.Identifier).value;
            this.consumePunctuation('=');
            this.advance();
            this.consumePunctuation(';');
            consts.push(ast_1.ASTBuilder.createConstDeclaration(name, this.getCurrentRange()));
        }
        return consts;
    }
    parseTypeSection() {
        this.consumeKeyword('type');
        const types = [];
        while (!this.isSectionEnd()) {
            const name = this.consume(types_1.TokenType.Identifier).value;
            this.consumePunctuation('=');
            this.advance();
            this.consumePunctuation(';');
            types.push(ast_1.ASTBuilder.createTypeDeclaration(name, this.getCurrentRange()));
        }
        return types;
    }
    parseBlock() {
        if (!this.matchKeyword('begin'))
            return null;
        this.consumeKeyword('begin');
        const start = this.previous();
        while (!this.matchKeyword('end') && !this.isAtEnd())
            this.advance();
        const end = this.matchKeyword('end') ? this.consumeKeyword('end') : this.previous();
        return ast_1.ASTBuilder.createBlock({
            start: this.tokenToPosition(start),
            end: this.tokenToPosition(end)
        }, []);
    }
    parseInitialization() {
        if (!this.matchKeyword('initialization'))
            return null;
        this.consumeKeyword('initialization');
        const block = this.parseBlock();
        return block;
    }
    isSectionEnd() {
        return this.matchKeyword('begin') || this.matchKeyword('procedure') || this.matchKeyword('function') ||
            this.matchKeyword('var') || this.matchKeyword('const') || this.matchKeyword('type') ||
            this.matchKeyword('implementation') || this.isAtEnd();
    }
    getCurrentRange() {
        return {
            start: this.tokenToPosition(this.tokens[Math.max(0, this.pos - 1)]),
            end: this.tokenToPosition(this.current())
        };
    }
    getRangeFromTokens(start, end) {
        return {
            start: this.tokenToPosition(start),
            end: this.tokenToPosition(end)
        };
    }
    current() {
        return this.tokens[this.pos];
    }
    previous() {
        return this.tokens[this.pos - 1];
    }
    advance() {
        if (!this.isAtEnd())
            this.pos++;
        return this.previous();
    }
    isAtEnd() {
        return this.current().type === types_1.TokenType.EOF;
    }
    matchKeyword(keyword) {
        return this.current().type === types_1.TokenType.Keyword && this.current().value.toLowerCase() === keyword.toLowerCase();
    }
    match(type) {
        return this.current().type === type;
    }
    matchPunctuation(punct) {
        return this.current().type === types_1.TokenType.Punctuation && this.current().value === punct;
    }
    consumeKeyword(keyword) {
        if (this.matchKeyword(keyword))
            return this.advance();
        throw new Error(`Expected keyword '${keyword}'`);
    }
    consume(type) {
        if (this.current().type === type)
            return this.advance();
        throw new Error(`Expected token type ${type}`);
    }
    consumePunctuation(punct = ';') {
        if (this.matchPunctuation(punct))
            this.advance();
    }
    tokenToPosition(token) {
        return { line: token.line - 1, character: token.column - 1 };
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map