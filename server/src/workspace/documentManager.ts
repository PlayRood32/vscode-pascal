import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../parser/parser';
import { SymbolTable } from '../analyzer/symbolTable';
import { ASTNode, SymbolInfo, ASTNodeType } from '../../../shared/src/types';

export interface DocumentInfo {
    document: TextDocument;
    ast: ASTNode | null;
    symbols: SymbolTable;
    version: number;
}

export class DocumentManager {
    private cache = new Map<string, DocumentInfo>();

    constructor(documents: TextDocuments<TextDocument>) {
        documents.onDidOpen(e => this.update(e.document));
        documents.onDidChangeContent(e => this.update(e.document));
        documents.onDidClose(e => this.cache.delete(e.document.uri));
    }

    private update(document: TextDocument): void {
        const parser = new Parser(document.getText());
        const ast = parser.parse();

        const symbols = new SymbolTable();
        this.extractSymbols(ast, symbols);

        this.cache.set(document.uri, {
            document,
            ast,
            symbols,
            version: document.version
        });
    }

    private extractSymbols(node: ASTNode | null, table: SymbolTable): void {
        if (!node) return;

        if (node.name) {
            let kind = 'unknown';
            switch (node.type) {
                case ASTNodeType.Program:
                case ASTNodeType.Unit:
                    kind = 'module';
                    break;
                case ASTNodeType.Procedure:
                    kind = 'procedure';
                    break;
                case ASTNodeType.Function:
                    kind = 'function';
                    break;
                case ASTNodeType.VarDeclaration:
                    kind = 'variable';
                    break;
                case ASTNodeType.TypeDeclaration:
                    kind = 'type';
                    break;
                case ASTNodeType.ConstDeclaration:
                    kind = 'constant';
                    break;
            }
            table.add({ name: node.name, kind, range: node.range });
        }

        node.children?.forEach(child => this.extractSymbols(child, table));
    }

    public get(uri: string): DocumentInfo | undefined {
        return this.cache.get(uri);
    }
}