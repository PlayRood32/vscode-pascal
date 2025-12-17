"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTNodeType = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Identifier"] = 0] = "Identifier";
    TokenType[TokenType["Keyword"] = 1] = "Keyword";
    TokenType[TokenType["String"] = 2] = "String";
    TokenType[TokenType["Number"] = 3] = "Number";
    TokenType[TokenType["Operator"] = 4] = "Operator";
    TokenType[TokenType["Punctuation"] = 5] = "Punctuation";
    TokenType[TokenType["Comment"] = 6] = "Comment";
    TokenType[TokenType["EOF"] = 7] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
var ASTNodeType;
(function (ASTNodeType) {
    ASTNodeType[ASTNodeType["Program"] = 0] = "Program";
    ASTNodeType[ASTNodeType["Unit"] = 1] = "Unit";
    ASTNodeType[ASTNodeType["Procedure"] = 2] = "Procedure";
    ASTNodeType[ASTNodeType["Function"] = 3] = "Function";
    ASTNodeType[ASTNodeType["VarDeclaration"] = 4] = "VarDeclaration";
    ASTNodeType[ASTNodeType["TypeDeclaration"] = 5] = "TypeDeclaration";
    ASTNodeType[ASTNodeType["ConstDeclaration"] = 6] = "ConstDeclaration";
    ASTNodeType[ASTNodeType["Block"] = 7] = "Block";
    ASTNodeType[ASTNodeType["InterfaceSection"] = 8] = "InterfaceSection";
    ASTNodeType[ASTNodeType["ImplementationSection"] = 9] = "ImplementationSection";
    ASTNodeType[ASTNodeType["Initialization"] = 10] = "Initialization";
})(ASTNodeType || (exports.ASTNodeType = ASTNodeType = {}));
//# sourceMappingURL=types.js.map