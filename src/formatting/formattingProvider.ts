// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\formatting\formattingProvider.ts

import * as vscode from 'vscode';

export class FormattingProvider implements vscode.DocumentFormattingEditProvider {
    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        _options: vscode.FormattingOptions,
        _token: vscode.CancellationToken
    ): vscode.TextEdit[] {
        const config = vscode.workspace.getConfiguration('pascal');
        const indentSize = config.get<number>('indentSize', 2);
        const useSpaces = config.get<boolean>('insertSpaces', true);
        
        const edits: vscode.TextEdit[] = [];
        const lines = document.getText().split('\n');
        let indentLevel = 0;
        let inCase = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (!trimmed || this.isComment(trimmed)) {
                continue;
            }

            // Calculate indent for this line
            const newIndent = this.calculateIndent(trimmed, indentLevel, inCase);
            
            // Update indent level for next line
            const indentChange = this.getIndentChange(trimmed);
            indentLevel = Math.max(0, indentLevel + indentChange);
            
            // Track case statements
            if (/\bcase\b.*\bof\b/i.test(trimmed)) {
                inCase = true;
            }
            if (inCase && /^\s*end\s*;/i.test(trimmed)) {
                inCase = false;
            }

            // Create formatted line
            const indentStr = useSpaces 
                ? ' '.repeat(newIndent * indentSize)
                : '\t'.repeat(newIndent);
            
            const formattedLine = indentStr + trimmed;
            
            // Create edit if line changed
            if (line !== formattedLine) {
                const range = new vscode.Range(
                    new vscode.Position(i, 0),
                    new vscode.Position(i, line.length)
                );
                edits.push(vscode.TextEdit.replace(range, formattedLine));
            }
        }

        return edits;
    }

    private calculateIndent(line: string, currentIndent: number, inCase: boolean): number {
        const lower = line.toLowerCase();
        
        // Decrease indent before these keywords
        if (/^(end|until|else|except|finally)\b/.test(lower)) {
            return Math.max(0, currentIndent - 1);
        }
        
        // Case values
        if (inCase && /^\w+\s*:/.test(line)) {
            return currentIndent;
        }
        
        // Visibility modifiers
        if (/^(private|protected|public|published)\b/.test(lower)) {
            return Math.max(0, currentIndent - 1);
        }
        
        return currentIndent;
    }

    private getIndentChange(line: string): number {
        const lower = line.toLowerCase();
        let change = 0;
        
        // Increase indent
        if (/\b(begin|record|class|case|try|repeat)\b/.test(lower)) {
            change++;
        }
        
        // Also increase for control structures
        if (/(if\b.*\bthen|while\b.*\bdo|for\b.*\bdo)\s*$/i.test(lower) && 
            !/\bbegin\b/i.test(lower)) {
            change++;
        }
        
        // Decrease indent
        if (/^(end|until)\b/.test(lower)) {
            change--;
        }
        
        // Handle single-line blocks
        if (/\bbegin\b.*\bend\b/i.test(lower)) {
            change = 0;
        }
        
        return change;
    }

    private isComment(line: string): boolean {
        return line.startsWith('//') || 
               line.startsWith('{') || 
               line.startsWith('(*');
    }
}