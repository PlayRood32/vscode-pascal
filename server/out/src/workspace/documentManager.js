"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentManager = void 0;
const parser_1 = require("../parser/parser");
const symbolTable_1 = require("../analyzer/symbolTable");
const types_1 = require("~shared/types");
class DocumentManager {
    constructor(documents) {
        this.cache = new Map();
        documents.onDidOpen(e => this.update(e.document));
        documents.onDidChangeContent(e => this.update(e.document));
        documents.onDidClose(e => this.cache.delete(e.document.uri));
    }
    update(document) {
        const parser = new parser_1.Parser(document.getText());
        const ast = parser.parse();
        const symbols = new symbolTable_1.SymbolTable();
        this.extractSymbols(ast, symbols);
        this.cache.set(document.uri, {
            document,
            ast,
            symbols,
            version: document.version
        });
    }
    extractSymbols(node, table) {
        if (!node || !node.name)
            return;
        const kind = node.type === types_1.ASTNodeType.Procedure ? 'procedure' :
            node.type === types_1.ASTNodeType.Function ? 'function' :
                node.type === types_1.ASTNodeType.VarDeclaration ? 'variable' : 'type';
        table.add({
            name: node.name,
            kind: kind,
            range: node.range
        });
        node.children?.forEach(child => this.extractSymbols(child, table));
    }
    get(uri) {
        return this.cache.get(uri);
    }
}
exports.DocumentManager = DocumentManager;
//# sourceMappingURL=documentManager.js.map