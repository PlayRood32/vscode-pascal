// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\intellisense\definitionProvider.ts

import * as vscode from 'vscode';
import { SymbolCache } from '../completion/symbolCache';
import { PascalParser } from '../utils/pascalParser';

export class DefinitionProvider implements vscode.DefinitionProvider {
    private symbolCache: SymbolCache;
    private parser: PascalParser;

    constructor(symbolCache: SymbolCache) {
        this.symbolCache = symbolCache;
        this.parser = new PascalParser();
    }

    public provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.Definition | undefined {
        // Don't provide definition in comments or strings
        if (this.parser.isInComment(document, position) || 
            this.parser.isInString(document, position)) {
            return undefined;
        }

        const wordRange = document.getWordRangeAtPosition(position, /\b[a-zA-Z_]\w*\b/);
        if (!wordRange) return undefined;

        const word = document.getText(wordRange);

        // Search for symbol in current document first
        const symbol = this.symbolCache.findSymbol(word, document);
        if (symbol) {
            return new vscode.Location(symbol.uri, symbol.range);
        }

        // Search in all documents
        const allSymbol = this.symbolCache.findSymbol(word);
        if (allSymbol) {
            return new vscode.Location(allSymbol.uri, allSymbol.range);
        }

        // Try to find in same document with regex (fallback)
        const localDefinition = this.findLocalDefinition(document, word);
        if (localDefinition) {
            return localDefinition;
        }

        return undefined;
    }

    private findLocalDefinition(
        document: vscode.TextDocument,
        word: string
    ): vscode.Location | undefined {
        const text = document.getText();
        const lines = text.split('\n');

        // Patterns to search for
        const patterns = [
            new RegExp(`^\\s*(procedure|function)\\s+${word}\\b`, 'i'),
            new RegExp(`^\\s*(var|const)\\s+${word}\\s*:`, 'i'),
            new RegExp(`^\\s*${word}\\s*=\\s*(class|record)\\b`, 'i'),
            new RegExp(`^\\s*type\\s+${word}\\s*=`, 'i')
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            for (const pattern of patterns) {
                if (pattern.test(line)) {
                    const position = new vscode.Position(i, line.indexOf(word));
                    return new vscode.Location(document.uri, position);
                }
            }
        }

        return undefined;
    }
}