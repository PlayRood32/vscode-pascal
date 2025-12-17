export enum TokenType {
    Identifier,
    Keyword,
    String,
    Number,
    Operator,
    Punctuation,
    Comment,
    EOF
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
    startOffset: number;
    endOffset: number;
}

export interface Position {
    line: number;
    character: number;
}

export interface Range {
    start: Position;
    end: Position;
}

export enum ASTNodeType {
    Program,
    Unit,
    Procedure,
    Function,
    VarDeclaration,
    TypeDeclaration,
    ConstDeclaration,
    Block,
    InterfaceSection,
    ImplementationSection,
    Initialization
}

export interface ASTNode {
    type: ASTNodeType;
    name?: string;
    range: Range;
    children?: ASTNode[];
}

export interface SymbolInfo {
    name: string;
    kind: string;
    range: Range;
}