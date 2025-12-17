"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticProvider = void 0;
const node_1 = require("vscode-languageserver/node");
class DiagnosticProvider {
    constructor(manager) {
        this.manager = manager;
    }
    getDiagnostics(uri) {
        const info = this.manager.get(uri);
        if (!info)
            return [];
        const diagnostics = [];
        if (!info.ast) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
                message: 'Failed to parse Pascal source.',
                source: 'pascal'
            });
        }
        // begin/end balance check
        const text = info.document.getText();
        const beginCount = (text.match(/\bbegin\b/gi) || []).length;
        const endCount = (text.match(/\bend\b/gi) || []).length;
        if (beginCount !== endCount) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: { start: { line: info.document.lineCount - 1, character: 0 }, end: { line: info.document.lineCount - 1, character: 100 } },
                message: `Mismatched begin/end: ${beginCount} begin(s), ${endCount} end(s)`,
                source: 'pascal'
            });
        }
        return diagnostics;
    }
}
exports.DiagnosticProvider = DiagnosticProvider;
//# sourceMappingURL=diagnosticProvider.js.map