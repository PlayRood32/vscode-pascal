// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\utils\pascalParser.ts

import * as vscode from 'vscode';
import { PascalSymbol } from '../completion/symbolCache';

export class PascalParser {
    private readonly procedurePattern = /^\s*(procedure|function)\s+(\w+)(?:\(([^)]*)\))?(?:\s*:\s*(\w+))?/i;
    private readonly varPattern = /^\s*(var|const)\s+(\w+)\s*:\s*([^;]+);/i;
    private readonly typePattern = /^\s*type\s+(\w+)\s*=\s*(.+)/i;
    private readonly classPattern = /^\s*(\w+)\s*=\s*class(?:\((\w+)\))?/i;
    private readonly propertyPattern = /^\s*property\s+(\w+)\s*:\s*(\w+)/i;

    public parseDocument(document: vscode.TextDocument): PascalSymbol[] {
        const symbols: PascalSymbol[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let currentClass: string | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Parse procedure/function
            const procMatch = trimmed.match(this.procedurePattern);
            if (procMatch) {
                const [, kind, name, params, returnType] = procMatch;
                const detail = this.buildProcedureDetail(kind, name, params, returnType);
                
                symbols.push({
                    name,
                    kind: kind.toLowerCase(),
                    detail,
                    range: new vscode.Range(i, 0, i, line.length),
                    uri: document.uri,
                    documentation: this.extractDocumentation(lines, i)
                });
            }

            // Parse variable/constant
            const varMatch = trimmed.match(this.varPattern);
            if (varMatch) {
                const [, kind, name, type] = varMatch;
                symbols.push({
                    name,
                    kind: kind.toLowerCase() === 'var' ? 'variable' : 'constant',
                    detail: `${name}: ${type}`,
                    range: new vscode.Range(i, 0, i, line.length),
                    uri: document.uri
                });
            }

            // Parse type/class
            const typeMatch = trimmed.match(this.typePattern);
            if (typeMatch) {
                const [, name, definition] = typeMatch;
                
                const classMatch = definition.match(this.classPattern);
                if (classMatch) {
                    currentClass = name;
                    const [, , parent] = classMatch;
                    symbols.push({
                        name,
                        kind: 'class',
                        detail: parent ? `class(${parent})` : 'class',
                        range: new vscode.Range(i, 0, this.findEndOfClass(lines, i), 0),
                        uri: document.uri,
                        documentation: this.extractDocumentation(lines, i)
                    });
                } else {
                    symbols.push({
                        name,
                        kind: 'type',
                        detail: definition,
                        range: new vscode.Range(i, 0, i, line.length),
                        uri: document.uri
                    });
                }
            }

            // Parse property
            if (currentClass) {
                const propMatch = trimmed.match(this.propertyPattern);
                if (propMatch) {
                    const [, name, type] = propMatch;
                    symbols.push({
                        name,
                        kind: 'property',
                        detail: `property ${name}: ${type}`,
                        range: new vscode.Range(i, 0, i, line.length),
                        uri: document.uri
                    });
                }
            }

            // End of class
            if (currentClass && /^\s*end;\s*$/i.test(trimmed)) {
                currentClass = null;
            }
        }

        return symbols;
    }

    private buildProcedureDetail(
        kind: string,
        name: string,
        params?: string,
        returnType?: string
    ): string {
        let detail = `${kind} ${name}`;
        
        if (params) {
            detail += `(${params})`;
        }
        
        if (returnType) {
            detail += `: ${returnType}`;
        }
        
        return detail;
    }

    private extractDocumentation(lines: string[], index: number): string | undefined {
        const docs: string[] = [];
        
        // Look for comments above the declaration
        for (let i = index - 1; i >= 0 && i >= index - 5; i--) {
            const line = lines[i].trim();
            
            if (line.startsWith('//')) {
                docs.unshift(line.substring(2).trim());
            } else if (line.startsWith('{') && line.endsWith('}')) {
                docs.unshift(line.substring(1, line.length - 1).trim());
            } else if (line && !line.startsWith('//') && !line.startsWith('{')) {
                break; // Stop at first non-comment line
            }
        }
        
        return docs.length > 0 ? docs.join('\n') : undefined;
    }

    private findEndOfClass(lines: string[], startIndex: number): number {
        let depth = 1;
        
        for (let i = startIndex + 1; i < lines.length && i < startIndex + 500; i++) {
            const line = lines[i].toLowerCase();
            
            if (line.includes('class') || line.includes('record')) {
                depth++;
            }
            if (line.trim() === 'end;') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        
        return startIndex + 1;
    }

    public findSymbolAtPosition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): string | undefined {
        const range = document.getWordRangeAtPosition(position, /\b[a-zA-Z_]\w*\b/);
        if (!range) return undefined;
        
        return document.getText(range);
    }

    public isInComment(document: vscode.TextDocument, position: vscode.Position): boolean {
        const line = document.lineAt(position).text;
        const char = position.character;
        
        // Check for line comment
        const commentStart = line.indexOf('//');
        if (commentStart !== -1 && commentStart < char) {
            return true;
        }
        
        // Check for block comment (simplified)
        const beforeCursor = line.substring(0, char);
        const openBrace = beforeCursor.lastIndexOf('{');
        const closeBrace = beforeCursor.lastIndexOf('}');
        
        if (openBrace > closeBrace) {
            return true;
        }
        
        return false;
    }

    public isInString(document: vscode.TextDocument, position: vscode.Position): boolean {
        const line = document.lineAt(position).text;
        const char = position.character;
        
        let inString = false;
        for (let i = 0; i < char; i++) {
            if (line[i] === "'") {
                inString = !inString;
            }
        }
        
        return inString;
    }
}