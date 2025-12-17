"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticProvider = void 0;
const node_1 = require("vscode-languageserver/node");
const builtIns = new Set([
    'WriteLn', 'Write', 'ReadLn', 'Read', 'Length', 'Copy', 'Inc', 'Dec',
    'Ord', 'Chr', 'Pred', 'Succ', 'High', 'Low', 'SizeOf', 'Assigned',
    'Str', 'Val', 'Concat', 'Pos', 'Delete', 'Insert', 'UpCase', 'LowCase'
]);
class DiagnosticProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provideDiagnostics(uri) {
        const info = this.manager.get(uri);
        if (!info)
            return [];
        const diagnostics = [];
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
                severity: node_1.DiagnosticSeverity.Error,
                range: node_1.Range.create(node_1.Position.create(lines.length - 1, 0), node_1.Position.create(lines.length - 1, 100)),
                message: `Mismatched begin/end: ${beginCount} begin(s), ${endCount} end(s)`,
                source: 'pascal'
            });
        }
        // 2. Undeclared identifiers
        const identifierRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
        let match;
        while ((match = identifierRegex.exec(text)) !== null) {
            const word = match[0];
            if (builtIns.has(word))
                continue;
            if (info.symbols.find(word.toLowerCase()))
                continue;
            // דילוג על מילים בתוך מחרוזות ותגובות (פשוט)
            const before = text.substring(0, match.index);
            if (before.includes("'") && before.split("'").length % 2 === 0)
                continue;
            if (before.includes('//') || before.includes('{') || before.includes('(*'))
                continue;
            const start = doc.positionAt(match.index);
            const end = doc.positionAt(match.index + word.length);
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: { start, end },
                message: `Undeclared identifier: '${word}'`,
                source: 'pascal',
                code: 'undeclared',
                data: { word }
            });
        }
        // 3. Missing semicolon
        for (let i = 0; i < lines.length - 1; i++) {
            const trimmed = lines[i].trim();
            if (trimmed && !trimmed.endsWith(';') && !trimmed.match(/^(begin|end|else|until|var|const|type|procedure|function|program|unit|uses|interface|implementation)$/i)) {
                const lastPos = doc.positionAt(doc.offsetAt(node_1.Position.create(i, 0)) + lines[i].length);
                diagnostics.push({
                    severity: node_1.DiagnosticSeverity.Warning,
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
    provideCodeActions(uri, range, diagnostics) {
        const actions = [];
        for (const diag of diagnostics) {
            if (diag.code === 'undeclared' && diag.data?.word) {
                const word = diag.data.word;
                actions.push({
                    title: `Declare '${word}' as variable`,
                    kind: node_1.CodeActionKind.QuickFix,
                    diagnostics: [diag],
                    edit: {
                        changes: { [uri]: [node_1.TextEdit.insert(node_1.Position.create(0, 0), `var ${word}: Integer;\n`)] }
                    }
                });
            }
            if (diag.code === 'missing_semicolon') {
                actions.push({
                    title: 'Add missing semicolon',
                    kind: node_1.CodeActionKind.QuickFix,
                    diagnostics: [diag],
                    edit: {
                        changes: { [uri]: [node_1.TextEdit.insert(diag.range.start, ';')] }
                    }
                });
            }
        }
        return actions;
    }
}
exports.DiagnosticProvider = DiagnosticProvider;
//# sourceMappingURL=diagnosticProvider.js.map