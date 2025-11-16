// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\completion\symbolCache.ts

import * as vscode from 'vscode';
import { PascalParser } from '../utils/pascalParser';

export interface PascalSymbol {
    name: string;
    kind: string;
    detail: string;
    range: vscode.Range;
    uri: vscode.Uri;
    documentation?: string;
}

export class SymbolCache implements vscode.Disposable {
    private symbols: Map<string, PascalSymbol[]> = new Map();
    private parser: PascalParser;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.parser = new PascalParser();

        // Watch for document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.languageId === 'pascal') {
                    this.refreshDocument(e.document);
                }
            })
        );

        this.disposables.push(
            vscode.workspace.onDidCloseTextDocument(doc => {
                if (doc.languageId === 'pascal') {
                    this.removeDocument(doc);
                }
            })
        );
    }

    public async refreshDocument(document: vscode.TextDocument): Promise<void> {
        const symbols = this.parser.parseDocument(document);
        this.symbols.set(document.uri.toString(), symbols);
    }

    public removeDocument(document: vscode.TextDocument): void {
        this.symbols.delete(document.uri.toString());
    }

    public getSymbolCount(): number {
        let count = 0;
        this.symbols.forEach(syms => count += syms.length);
        return count;
    }

    public getAllSymbols(): PascalSymbol[] {
        const allSymbols: PascalSymbol[] = [];
        this.symbols.forEach(syms => allSymbols.push(...syms));
        return allSymbols;
    }

    public getSymbolsForDocument(document: vscode.TextDocument): PascalSymbol[] {
        return this.symbols.get(document.uri.toString()) || [];
    }

    public findSymbol(name: string, document?: vscode.TextDocument): PascalSymbol | undefined {
        if (document) {
            const docSymbols = this.getSymbolsForDocument(document);
            const found = docSymbols.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (found) return found;
        }

        // Search in all documents
        for (const symbols of this.symbols.values()) {
            const found = symbols.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (found) return found;
        }

        return undefined;
    }

    public getCompletionItems(document: vscode.TextDocument): vscode.CompletionItem[] {
        const symbols = this.getSymbolsForDocument(document);
        return symbols.map(sym => {
            const item = new vscode.CompletionItem(
                sym.name,
                this.mapKindToCompletionKind(sym.kind)
            );
            item.detail = sym.detail;
            item.documentation = new vscode.MarkdownString(sym.documentation || sym.detail);
            item.sortText = '1' + sym.name; // Lower priority than keywords
            return item;
        });
    }

    public getDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols = this.getSymbolsForDocument(document);
        return symbols.map(sym => new vscode.DocumentSymbol(
            sym.name,
            sym.detail,
            this.mapKindToSymbolKind(sym.kind),
            sym.range,
            sym.range
        ));
    }

    private mapKindToCompletionKind(kind: string): vscode.CompletionItemKind {
        switch (kind.toLowerCase()) {
            case 'procedure': return vscode.CompletionItemKind.Function;
            case 'function': return vscode.CompletionItemKind.Function;
            case 'variable': return vscode.CompletionItemKind.Variable;
            case 'constant': return vscode.CompletionItemKind.Constant;
            case 'type': return vscode.CompletionItemKind.Class;
            case 'class': return vscode.CompletionItemKind.Class;
            case 'record': return vscode.CompletionItemKind.Struct;
            case 'property': return vscode.CompletionItemKind.Property;
            case 'unit': return vscode.CompletionItemKind.Module;
            default: return vscode.CompletionItemKind.Text;
        }
    }

    private mapKindToSymbolKind(kind: string): vscode.SymbolKind {
        switch (kind.toLowerCase()) {
            case 'procedure': return vscode.SymbolKind.Function;
            case 'function': return vscode.SymbolKind.Function;
            case 'variable': return vscode.SymbolKind.Variable;
            case 'constant': return vscode.SymbolKind.Constant;
            case 'type': return vscode.SymbolKind.Class;
            case 'class': return vscode.SymbolKind.Class;
            case 'record': return vscode.SymbolKind.Struct;
            case 'property': return vscode.SymbolKind.Property;
            case 'unit': return vscode.SymbolKind.Module;
            case 'constructor': return vscode.SymbolKind.Constructor;
            default: return vscode.SymbolKind.Variable;
        }
    }

    dispose() {
        this.symbols.clear();
        this.disposables.forEach(d => d.dispose());
    }
}