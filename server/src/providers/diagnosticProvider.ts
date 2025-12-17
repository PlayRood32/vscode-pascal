import { Diagnostic, DiagnosticSeverity, CodeAction, CodeActionKind, TextEdit, Range, Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentManager } from '../workspace/documentManager';

const builtIns = new Set([
    'WriteLn', 'Write', 'ReadLn', 'Read', 'Length', 'Copy', 'Inc', 'Dec',
    'Ord', 'Chr', 'Pred', 'Succ', 'High', 'Low', 'SizeOf', 'Assigned',
    'Str', 'Val', 'Concat', 'Pos', 'Delete', 'Insert', 'UpCase', 'LowCase'
]);

export class DiagnosticProvider {
    constructor(private manager: DocumentManager) {}

    public provideDiagnostics(uri: string): Diagnostic[] {
        const info = this.manager.get(uri);
        if (!info) return [];

        const diagnostics: Diagnostic[] = [];
        const doc = info.document;
        const text = doc.getText();
        const lines = text.split('\n');

        // 1. Mismatched begin/end
        let beginCount = 0;
        let endCount = 0;
        for (const line of lines) {
            beginCount += (line.match(/\bbegin\b/gi) || []).length;
            endCount += (line.match(/\bend\b/gi) || []).length;
        }
        if (beginCount !== endCount) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: Range.create(Position.create(lines.length - 1, 0), Position.create(lines.length - 1, 100)),
                message: `Mismatched begin/end: ${beginCount} begin(s), ${endCount} end(s)`,
                source: 'pascal'
            });
        }

        const identifierRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
        let match: RegExpExecArray | null;
        while ((match = identifierRegex.exec(text)) !== null) {
            const word = match[0];
            if (builtIns.has(word)) continue;
            if (info.symbols.find(word.toLowerCase())) continue;

            const before = text.substring(0, match.index);
            if (before.includes("'") && before.split("'").length % 2 === 0) continue;
            if (before.includes('//') || before.includes('{') || before.includes('(*')) continue;

            const start = doc.positionAt(match.index);
            const end = doc.positionAt(match.index + word.length);

            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: { start, end },
                message: `Undeclared identifier: '${word}'`,
                source: 'pascal',
                code: 'undeclared',
                data: { word }
            });
        }

        for (let i = 0; i < lines.length - 1; i++) {
            const trimmed = lines[i].trim();
            if (trimmed && !trimmed.endsWith(';') && !trimmed.match(/^(begin|end|else|until|var|const|type|procedure|function|program|unit|uses|interface|implementation)$/i)) {
                const lastPos = doc.positionAt(doc.offsetAt(Position.create(i, 0)) + lines[i].length);
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: { start: lastPos, end: lastPos },
                    message: 'Missing semicolon',
                    source: 'pascal',
                    code: 'missing_semicolon'
                });
            }
        }

        return diagnostics;
    }

    // Quick Fixes
    public provideCodeActions(uri: string, range: Range, diagnostics: Diagnostic[]): CodeAction[] {
        const actions: CodeAction[] = [];

        for (const diag of diagnostics) {
            if (diag.code === 'undeclared' && diag.data?.word) {
                const word = diag.data.word as string;
                actions.push({
                    title: `Declare '${word}' as variable`,
                    kind: CodeActionKind.QuickFix,
                    diagnostics: [diag],
                    edit: {
                        changes: { [uri]: [TextEdit.insert(Position.create(0, 0), `var ${word}: Integer;\n`)] }
                    }
                });
            }
            if (diag.code === 'missing_semicolon') {
                actions.push({
                    title: 'Add missing semicolon',
                    kind: CodeActionKind.QuickFix,
                    diagnostics: [diag],
                    edit: {
                        changes: { [uri]: [TextEdit.insert(diag.range.start, ';')] }
                    }
                });
            }
        }

        return actions;
    }
}