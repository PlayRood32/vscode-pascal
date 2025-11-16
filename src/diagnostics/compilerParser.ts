// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\diagnostics\compilerParser.ts

import * as vscode from 'vscode';

export class CompilerParser {
    private readonly errorPattern = /^(.+?)\((\d+),(\d+)\)\s+(Fatal|Error|Warning|Hint|Note):\s+(.+)$/;
    private readonly continuationPattern = /^\s+(.+)$/;

    public parse(output: string, document: vscode.TextDocument): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const lines = output.split('\n');
        
        const config = vscode.workspace.getConfiguration('pascal');
        const showWarnings = config.get<boolean>('showWarnings', true);
        const showHints = config.get<boolean>('showHints', false);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(this.errorPattern);

            if (match) {
                const [, , lineNum, column, severity, message] = match;
                
                // Filter based on settings
                if (!showWarnings && severity === 'Warning') continue;
                if (!showHints && (severity === 'Hint' || severity === 'Note')) continue;

                // Collect continuation lines
                let fullMessage = message;
                while (i + 1 < lines.length && this.continuationPattern.test(lines[i + 1])) {
                    i++;
                    const contMatch = lines[i].match(this.continuationPattern);
                    if (contMatch) {
                        fullMessage += ' ' + contMatch[1].trim();
                    }
                }

                const diagnostic = this.createDiagnostic(
                    parseInt(lineNum) - 1,
                    parseInt(column) - 1,
                    severity,
                    fullMessage,
                    document
                );

                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            }
        }

        return diagnostics;
    }

    private createDiagnostic(
        line: number,
        column: number,
        severity: string,
        message: string,
        document: vscode.TextDocument
    ): vscode.Diagnostic | null {
        // Validate line number
        if (line < 0 || line >= document.lineCount) {
            return null;
        }

        const lineText = document.lineAt(line).text;
        const endColumn = Math.min(column + this.estimateErrorLength(message, lineText, column), lineText.length);

        const range = new vscode.Range(
            new vscode.Position(line, column),
            new vscode.Position(line, endColumn)
        );

        const diagnosticSeverity = this.mapSeverity(severity);
        const diagnostic = new vscode.Diagnostic(range, message, diagnosticSeverity);
        
        diagnostic.source = 'Pascal Compiler';
        diagnostic.code = this.extractErrorCode(message);

        // Add related information
        const relatedInfo = this.extractRelatedInformation(message, document);
        if (relatedInfo) {
            diagnostic.relatedInformation = [relatedInfo];
        }

        return diagnostic;
    }

    private mapSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toLowerCase()) {
            case 'fatal':
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'hint':
            case 'note':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Error;
        }
    }

    private estimateErrorLength(message: string, lineText: string, column: number): number {
        // Try to extract identifier from message
        const identMatch = message.match(/["']([^"']+)["']/);
        if (identMatch && identMatch[1]) {
            const ident = identMatch[1];
            const pos = lineText.indexOf(ident, column);
            if (pos !== -1 && pos - column < 50) {
                return ident.length;
            }
        }

        // Find next space or end of line
        const remaining = lineText.substring(column);
        const spacePos = remaining.search(/[\s;,()]/);
        
        if (spacePos !== -1) {
            return Math.min(spacePos, 30);
        }

        return Math.min(remaining.length, 30);
    }

    private extractErrorCode(message: string): string | undefined {
        // Extract error code like (5000) from message
        const match = message.match(/\((\d+)\)/);
        return match ? match[1] : undefined;
    }

    private extractRelatedInformation(
        message: string, 
        document: vscode.TextDocument
    ): vscode.DiagnosticRelatedInformation | undefined {
        // Look for "defined at" patterns
        const definedAtMatch = message.match(/defined at (.+?):(\d+)/);
        if (definedAtMatch) {
            const [, , line] = definedAtMatch;
            const location = new vscode.Location(
                document.uri,
                new vscode.Position(parseInt(line) - 1, 0)
            );
            return new vscode.DiagnosticRelatedInformation(
                location,
                'Symbol defined here'
            );
        }

        return undefined;
    }
}