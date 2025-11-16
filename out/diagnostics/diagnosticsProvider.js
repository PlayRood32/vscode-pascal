"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\diagnostics\diagnosticsProvider.ts
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
exports.DiagnosticsProvider = void 0;
const vscode = __importStar(require("vscode"));
const child_process = __importStar(require("child_process"));
const path = __importStar(require("path"));
const compilerParser_1 = require("./compilerParser");
const logger_1 = require("../utils/logger");
class DiagnosticsProvider {
    constructor(symbolCache) {
        this.disposables = [];
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('pascal');
        this.parser = new compilerParser_1.CompilerParser();
        this.symbolCache = symbolCache;
        // Listen to document changes
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChange(e)));
        this.disposables.push(vscode.workspace.onDidSaveTextDocument(doc => this.onDocumentSave(doc)));
        this.disposables.push(vscode.workspace.onDidCloseTextDocument(doc => this.onDocumentClose(doc)));
        logger_1.Logger.log('✅ DiagnosticsProvider initialized');
    }
    onDocumentChange(event) {
        if (event.document.languageId !== 'pascal')
            return;
        const config = vscode.workspace.getConfiguration('pascal');
        if (!config.get('syntaxCheckOnChange', true))
            return;
        // Debounce syntax checking
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.checkSyntax(event.document);
        }, 200);
    }
    onDocumentSave(document) {
        if (document.languageId !== 'pascal')
            return;
        const config = vscode.workspace.getConfiguration('pascal');
        if (config.get('syntaxCheckOnSave', true)) {
            this.checkSyntax(document);
        }
    }
    onDocumentClose(document) {
        if (document.languageId === 'pascal') {
            this.diagnosticCollection.delete(document.uri);
        }
    }
    async checkSyntax(document) {
        const config = vscode.workspace.getConfiguration('pascal');
        const compiler = config.get('compilerPath', 'fpc');
        try {
            const diagnostics = await this.runCompilerCheck(document, compiler);
            // Add semantic diagnostics
            const semanticDiags = this.performSemanticAnalysis(document);
            diagnostics.push(...semanticDiags);
            this.diagnosticCollection.set(document.uri, diagnostics);
            // Update symbol cache
            await this.symbolCache.refreshDocument(document);
        }
        catch (error) {
            logger_1.Logger.log(`Syntax check error: ${error.message}`);
        }
    }
    async runCompilerCheck(document, compiler) {
        return new Promise((resolve) => {
            const config = vscode.workspace.getConfiguration('pascal');
            const mode = this.getModeFlag();
            const options = config.get('compilerOptions', []).join(' ');
            // Use syntax check only mode
            const cmd = `"${compiler}" ${mode} -vewnhi ${options} -Sew "${document.fileName}"`;
            child_process.exec(cmd, {
                cwd: path.dirname(document.fileName),
                timeout: 5000
            }, (_error, stdout, stderr) => {
                const output = stderr + '\n' + stdout;
                const diagnostics = this.parser.parse(output, document);
                resolve(diagnostics);
            });
        });
    }
    async compile(document) {
        const config = vscode.workspace.getConfiguration('pascal');
        const compiler = config.get('compilerPath', 'fpc');
        return new Promise((resolve, reject) => {
            const mode = this.getModeFlag();
            const options = config.get('compilerOptions', []).join(' ');
            const outputName = path.basename(document.fileName, '.pas');
            const outputDir = path.dirname(document.fileName);
            const cmd = `"${compiler}" ${mode} ${options} "${document.fileName}" -o"${path.join(outputDir, outputName)}"`;
            logger_1.Logger.log(`Compiling: ${cmd}`);
            child_process.exec(cmd, {
                cwd: outputDir,
                timeout: 30000
            }, (error, stdout, stderr) => {
                const output = stderr + '\n' + stdout;
                const diagnostics = this.parser.parse(output, document);
                this.diagnosticCollection.set(document.uri, diagnostics);
                if (error && diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Error)) {
                    reject(new Error('Compilation failed with errors'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    performSemanticAnalysis(document) {
        const diagnostics = [];
        const text = document.getText();
        const lines = text.split('\n');
        // Check for common issues
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            // Check for missing semicolons
            if (this.shouldHaveSemicolon(trimmed, lines, i)) {
                const diagnostic = new vscode.Diagnostic(new vscode.Range(i, line.length, i, line.length), 'Missing semicolon', vscode.DiagnosticSeverity.Warning);
                diagnostic.code = 'missing-semicolon';
                diagnostic.source = 'Pascal Complete';
                diagnostics.push(diagnostic);
            }
            // Check for unused variables (simple heuristic)
            const varMatch = trimmed.match(/^\s*(\w+)\s*:\s*\w+;/);
            if (varMatch) {
                const varName = varMatch[1];
                const isUsed = text.indexOf(varName, document.offsetAt(new vscode.Position(i + 1, 0))) > -1;
                if (!isUsed) {
                    const diagnostic = new vscode.Diagnostic(new vscode.Range(i, line.indexOf(varName), i, line.indexOf(varName) + varName.length), `Variable '${varName}' is declared but never used`, vscode.DiagnosticSeverity.Hint);
                    diagnostic.code = 'unused-variable';
                    diagnostic.source = 'Pascal Complete';
                    diagnostics.push(diagnostic);
                }
            }
            // Check for deprecated WriteLn/ReadLn casing
            if (/write(?:ln)?|read(?:ln)?/i.test(trimmed) && !/WriteLn|ReadLn|Write|Read/.test(line)) {
                const match = trimmed.match(/(write(?:ln)?|read(?:ln)?)/i);
                if (match) {
                    const start = line.indexOf(match[0]);
                    const diagnostic = new vscode.Diagnostic(new vscode.Range(i, start, i, start + match[0].length), 'Inconsistent casing for I/O function', vscode.DiagnosticSeverity.Information);
                    diagnostic.code = 'casing-style';
                    diagnostic.source = 'Pascal Complete';
                    diagnostics.push(diagnostic);
                }
            }
            // Check for begin without end
            if (/\bbegin\b/i.test(trimmed) && !this.hasMatchingEnd(lines, i)) {
                const diagnostic = new vscode.Diagnostic(new vscode.Range(i, 0, i, line.length), 'begin without matching end', vscode.DiagnosticSeverity.Error);
                diagnostic.code = 'unmatched-begin';
                diagnostic.source = 'Pascal Complete';
                diagnostics.push(diagnostic);
            }
        }
        return diagnostics;
    }
    shouldHaveSemicolon(line, lines, index) {
        // Skip empty lines, comments, and lines already with semicolons
        if (!line || line.startsWith('//') || line.endsWith(';') || line.endsWith('.')) {
            return false;
        }
        // Skip control structure keywords
        const skipKeywords = ['begin', 'end', 'then', 'do', 'else', 'of', 'try', 'except', 'finally', 'repeat', 'until'];
        const lastWord = line.split(/\s+/).pop()?.toLowerCase();
        if (skipKeywords.includes(lastWord || '')) {
            return false;
        }
        // Check if next line is a control keyword
        if (index + 1 < lines.length) {
            const nextLine = lines[index + 1].trim().toLowerCase();
            if (nextLine.startsWith('end') || nextLine.startsWith('else') ||
                nextLine.startsWith('until') || nextLine.startsWith('except')) {
                return false;
            }
        }
        // Likely needs semicolon
        return /^[^{(*].*([:=]|procedure|function|var|const).*[^;.]$/.test(line);
    }
    hasMatchingEnd(lines, beginIndex) {
        let depth = 1;
        for (let i = beginIndex + 1; i < lines.length && i < beginIndex + 100; i++) {
            const line = lines[i].toLowerCase();
            if (line.includes('begin'))
                depth++;
            if (line.includes('end'))
                depth--;
            if (depth === 0)
                return true;
        }
        return false;
    }
    getModeFlag() {
        const config = vscode.workspace.getConfiguration('pascal');
        const mode = config.get('compilerMode', 'FPC');
        const modeMap = {
            'Delphi': '-Mdelphi',
            'TP': '-Mtp',
            'MacPas': '-Mmacpas',
            'ISO': '-Miso',
            'FPC': ''
        };
        return modeMap[mode] || '';
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.disposables.forEach(d => d.dispose());
    }
}
exports.DiagnosticsProvider = DiagnosticsProvider;
//# sourceMappingURL=diagnosticsProvider.js.map