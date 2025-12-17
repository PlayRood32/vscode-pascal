"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticProvider = void 0;
const node_1 = require("vscode-languageserver/node");
class DiagnosticProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provideDiagnostics(uri) {
        const info = this.manager.get(uri);
        if (!info || !info.ast)
            return [];
        const diagnostics = [];
        let beginCount = 0;
        let endCount = 0;
        const text = info.document.getText();
        const lines = text.split('\n');
        for (const line of lines) {
            beginCount += (line.match(/\bbegin\b/g) || []).length;
            endCount += (line.match(/\bend\b/g) || []).length;
        }
        if (beginCount !== endCount) {
            diagnostics.push({
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: lines.length - 1, character: 0 },
                    end: { line: lines.length - 1, character: 100 }
                },
                message: `Mismatched begin/end pairs: ${beginCount} begin(s), ${endCount} end(s)`,
                source: 'pascal'
            });
        }
        return diagnostics;
    }
}
exports.DiagnosticProvider = DiagnosticProvider;
//# sourceMappingURL=diagnosticProvider.js.map