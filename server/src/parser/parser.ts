import { Token, TokenType, Position, Range, ASTNode, ASTNodeType } from '../../../shared/src/types';
import { Lexer } from './lexer';
import { ASTBuilder } from './ast';

export class Parser {
    private tokens: Token[];
    private pos = 0;

    constructor(source: string) {
        const lexer = new Lexer(source);
        this.tokens = lexer.tokenize();
    }

    public parse(): ASTNode | null {
        if (this.isAtEnd()) return null;

        try {
            if (this.matchKeyword('program')) {
                return this.parseProgram();
            } else if (this.matchKeyword('unit')) {
                return this.parseUnit();
            } else if (this.matchKeyword('procedure') || this.matchKeyword('function')) {
                return this.parseProcedureOrFunction();
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    private parseProgram(): ASTNode {
        const startToken = this.consumeKeyword('program');
        const name = this.consume(TokenType.Identifier).value;
        this.consumePunctuation(';');

        const uses = this.parseUses();
        const declarations = this.parseDeclarations();
        const block = this.parseBlock();

        const range: Range = {
            start: this.tokenToPosition(startToken),
            end: block?.range.end || this.tokenToPosition(this.previous())
        };

        const programNode = ASTBuilder.createProgram(name, range);
        programNode.children!.push(...uses, ...declarations);
        if (block) programNode.children!.push(block);
        return programNode;
    }

    private parseUnit(): ASTNode {
        const startToken = this.consumeKeyword('unit');
        const name = this.consume(TokenType.Identifier).value;
        this.consumePunctuation(';');

        this.consumeKeyword('interface');
        const interfaceUses = this.parseUses();
        const interfaceDecls = this.parseDeclarations();

        const interfaceSection = ASTBuilder.createInterfaceSection(
            this.getRangeFromTokens(startToken, this.previous()),
            [...interfaceUses, ...interfaceDecls]
        );

        if (this.matchKeyword('implementation')) {
            this.consumeKeyword('implementation');
            const implUses = this.parseUses();
            const implDecls = this.parseDeclarations();

            const implSection = ASTBuilder.createImplementationSection(
                this.getRangeFromTokens(this.previous(), this.previous()),
                [...implUses, ...implDecls]
            );
            interfaceSection.children!.push(implSection);
        }

        if (this.matchKeyword('initialization')) {
            const initBlock = this.parseInitialization();
            if (initBlock) interfaceSection.children!.push(initBlock);
        }

        const unitNode = ASTBuilder.createUnit(name, {
            start: this.tokenToPosition(startToken),
            end: this.tokenToPosition(this.previous())
        });
        unitNode.children!.push(interfaceSection);
        return unitNode;
    }

    private parseProcedureOrFunction(): ASTNode {
        const isFunction = this.matchKeyword('function');
        const startToken = isFunction ? this.consumeKeyword('function') : this.consumeKeyword('procedure');
        const name = this.consume(TokenType.Identifier).value;

        this.parseParameters();

        let returnType: string | null = null;
        if (isFunction) {
            this.consumePunctuation(':');
            returnType = this.consume(TokenType.Identifier).value;
        }
        this.consumePunctuation(';');

        const declarations = this.parseDeclarations();
        const block = this.parseBlock();
        this.consumePunctuation(';');

        const range: Range = {
            start: this.tokenToPosition(startToken),
            end: this.tokenToPosition(this.previous())
        };

        const node = isFunction 
            ? ASTBuilder.createFunction(name, range)
            : ASTBuilder.createProcedure(name, range);
        node.children!.push(...declarations);
        if (block) node.children!.push(block);
        return node;
    }

    private parseParameters(): void {
        if (!this.matchPunctuation('(')) return;
        this.consumePunctuation('(');
        while (!this.matchPunctuation(')')) {
            if (this.matchKeyword('var') || this.matchKeyword('const') || this.matchKeyword('out')) this.advance();
            this.consume(TokenType.Identifier);
            if (this.matchPunctuation(':')) {
                this.consumePunctuation(':');
                this.consume(TokenType.Identifier);
            }
            if (this.matchPunctuation(';')) this.consumePunctuation(';');
        }
        this.consumePunctuation(')');
    }

    private parseUses(): ASTNode[] {
        if (!this.matchKeyword('uses')) return [];
        this.consumeKeyword('uses');
        const nodes: ASTNode[] = [];
        do {
            const unitName = this.consume(TokenType.Identifier).value;
            nodes.push(ASTBuilder.createVarDeclaration(unitName, this.getCurrentRange()));
        } while (this.matchPunctuation(',') && this.advance().type === TokenType.Identifier);
        this.consumePunctuation(';');
        return nodes;
    }

    private parseDeclarations(): ASTNode[] {
        const decls: ASTNode[] = [];
        while (true) {
            if (this.matchKeyword('var')) {
                decls.push(...this.parseVarSection());
            } else if (this.matchKeyword('const')) {
                decls.push(...this.parseConstSection());
            } else if (this.matchKeyword('type')) {
                decls.push(...this.parseTypeSection());
            } else if (this.matchKeyword('procedure') || this.matchKeyword('function')) {
                decls.push(this.parseProcedureOrFunction());
            } else {
                break;
            }
        }
        return decls;
    }

    private parseVarSection(): ASTNode[] {
        this.consumeKeyword('var');
        const vars: ASTNode[] = [];
        while (!this.isSectionEnd()) {
            const name = this.consume(TokenType.Identifier).value;
            this.consumePunctuation(':');
            this.consume(TokenType.Identifier);
            this.consumePunctuation(';');
            vars.push(ASTBuilder.createVarDeclaration(name, this.getCurrentRange()));
        }
        return vars;
    }

    private parseConstSection(): ASTNode[] {
        this.consumeKeyword('const');
        const consts: ASTNode[] = [];
        while (!this.isSectionEnd()) {
            const name = this.consume(TokenType.Identifier).value;
            this.consumePunctuation('=');
            this.advance();
            this.consumePunctuation(';');
            consts.push(ASTBuilder.createConstDeclaration(name, this.getCurrentRange()));
        }
        return consts;
    }

    private parseTypeSection(): ASTNode[] {
        this.consumeKeyword('type');
        const types: ASTNode[] = [];
        while (!this.isSectionEnd()) {
            const name = this.consume(TokenType.Identifier).value;
            this.consumePunctuation('=');
            this.advance();
            this.consumePunctuation(';');
            types.push(ASTBuilder.createTypeDeclaration(name, this.getCurrentRange()));
        }
        return types;
    }

    private parseBlock(): ASTNode | null {
        if (!this.matchKeyword('begin')) return null;
        this.consumeKeyword('begin');
        const start = this.previous();
        while (!this.matchKeyword('end') && !this.isAtEnd()) this.advance();
        const end = this.matchKeyword('end') ? this.consumeKeyword('end') : this.previous();
        return ASTBuilder.createBlock({
            start: this.tokenToPosition(start),
            end: this.tokenToPosition(end)
        }, []);
    }

    private parseInitialization(): ASTNode | null {
        if (!this.matchKeyword('initialization')) return null;
        this.consumeKeyword('initialization');
        const block = this.parseBlock();
        return block;
    }

    private isSectionEnd(): boolean {
        return this.matchKeyword('begin') || this.matchKeyword('procedure') || this.matchKeyword('function') ||
               this.matchKeyword('var') || this.matchKeyword('const') || this.matchKeyword('type') ||
               this.matchKeyword('implementation') || this.isAtEnd();
    }

    private getCurrentRange(): Range {
        return {
            start: this.tokenToPosition(this.tokens[Math.max(0, this.pos - 1)]),
            end: this.tokenToPosition(this.current())
        };
    }

    private getRangeFromTokens(start: Token, end: Token): Range {
        return {
            start: this.tokenToPosition(start),
            end: this.tokenToPosition(end)
        };
    }

    private current(): Token {
        return this.tokens[this.pos];
    }

    private previous(): Token {
        return this.tokens[this.pos - 1];
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.pos++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.current().type === TokenType.EOF;
    }

    private matchKeyword(keyword: string): boolean {
        return this.current().type === TokenType.Keyword && this.current().value.toLowerCase() === keyword.toLowerCase();
    }

    private match(type: TokenType): boolean {
        return this.current().type === type;
    }

    private matchPunctuation(punct: string): boolean {
        return this.current().type === TokenType.Punctuation && this.current().value === punct;
    }

    private consumeKeyword(keyword: string): Token {
        if (this.matchKeyword(keyword)) return this.advance();
        throw new Error(`Expected keyword '${keyword}'`);
    }

    private consume(type: TokenType): Token {
        if (this.current().type === type) return this.advance();
        throw new Error(`Expected token type ${type}`);
    }

    private consumePunctuation(punct = ';'): void {
        if (this.matchPunctuation(punct)) this.advance();
    }

    private tokenToPosition(token: Token): Position {
        return { line: token.line - 1, character: token.column - 1 };
    }
}