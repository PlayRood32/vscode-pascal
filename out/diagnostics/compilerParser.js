"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\diagnostics\compilerParser.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerParser = void 0;
const vscode = __importStar(require("vscode"));
class CompilerParser {
    constructor() {
        this.errorPattern = /^(.+?)\((\d+),(\d+)\)\s+(Fatal|Error|Warning|Hint|Note):\s+(.+)$/;
        this.continuationPattern = /^\s+(.+)$/;
    }
    parse(output, document) {
        const diagnostics = [];
        const lines = output.split('\n');
        const config = vscode.workspace.getConfiguration('pascal');
        const showWarnings = config.get('showWarnings', true);
        const showHints = config.get('showHints', false);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(this.errorPattern);
            if (match) {
                const [, , lineNum, column, severity, message] = match;
                // Filter based on settings
                if (!showWarnings && severity === 'Warning')
                    continue;
                if (!showHints && (severity === 'Hint' || severity === 'Note'))
                    continue;
                // Collect continuation lines
                let fullMessage = message;
                while (i + 1 < lines.length && this.continuationPattern.test(lines[i + 1])) {
                    i++;
                    const contMatch = lines[i].match(this.continuationPattern);
                    if (contMatch) {
                        fullMessage += ' ' + contMatch[1].trim();
                    }
                }
                const diagnostic = this.createDiagnostic(parseInt(lineNum) - 1, parseInt(column) - 1, severity, fullMessage, document);
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            }
        }
        return diagnostics;
    }
    createDiagnostic(line, column, severity, message, document) {
        // Validate line number
        if (line < 0 || line >= document.lineCount) {
            return null;
        }
        const lineText = document.lineAt(line).text;
        const endColumn = Math.min(column + this.estimateErrorLength(message, lineText, column), lineText.length);
        const range = new vscode.Range(new vscode.Position(line, column), new vscode.Position(line, endColumn));
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
    mapSeverity(severity) {
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
    estimateErrorLength(message, lineText, column) {
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
    extractErrorCode(message) {
        // Extract error code like (5000) from message
        const match = message.match(/\((\d+)\)/);
        return match ? match[1] : undefined;
    }
    extractRelatedInformation(message, document) {
        // Look for "defined at" patterns
        const definedAtMatch = message.match(/defined at (.+?):(\d+)/);
        if (definedAtMatch) {
            const [, , line] = definedAtMatch;
            const location = new vscode.Location(document.uri, new vscode.Position(parseInt(line) - 1, 0));
            return new vscode.DiagnosticRelatedInformation(location, 'Symbol defined here');
        }
        return undefined;
    }
}
exports.CompilerParser = CompilerParser;
//# sourceMappingURL=compilerParser.js.map