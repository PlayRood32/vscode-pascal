"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\codeActions\codeActionProvider.ts
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
exports.CodeActionProvider = void 0;
const vscode = __importStar(require("vscode"));
class CodeActionProvider {
    constructor(_symbolCache) {
        // SymbolCache reserved for future use
    }
    provideCodeActions(document, range, context, _token) {
        const actions = [];
        // Quick fixes for diagnostics
        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source === 'Pascal Complete' || diagnostic.source === 'Pascal Compiler') {
                actions.push(...this.createQuickFixes(document, range, diagnostic));
            }
        }
        // Refactoring actions
        actions.push(...this.createRefactoringActions(document, range));
        return actions;
    }
    createQuickFixes(document, _range, diagnostic) {
        const actions = [];
        // Fix missing semicolon
        if (diagnostic.code === 'missing-semicolon' ||
            diagnostic.message.toLowerCase().includes('semicolon')) {
            const fix = this.createAddSemicolonFix(document, diagnostic.range);
            if (fix)
                actions.push(fix);
        }
        // Fix unused variable
        if (diagnostic.code === 'unused-variable') {
            const remove = this.createRemoveUnusedVariableFix(document, diagnostic);
            if (remove)
                actions.push(remove);
        }
        // Fix casing
        if (diagnostic.code === 'casing-style') {
            const fixCase = this.createFixCasingFix(document, diagnostic);
            if (fixCase)
                actions.push(fixCase);
        }
        // Fix unmatched begin
        if (diagnostic.code === 'unmatched-begin') {
            const addEnd = this.createAddEndFix(document, diagnostic.range);
            if (addEnd)
                actions.push(addEnd);
        }
        // Fix undeclared identifier
        if (diagnostic.message.toLowerCase().includes('undeclared identifier')) {
            const declare = this.createDeclareVariableFix(document, diagnostic);
            if (declare)
                actions.push(declare);
        }
        return actions;
    }
    createAddSemicolonFix(document, range) {
        const fix = new vscode.CodeAction('Add semicolon', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        const line = document.lineAt(range.end.line);
        const endPos = new vscode.Position(range.end.line, line.text.trimEnd().length);
        fix.edit.insert(document.uri, endPos, ';');
        fix.isPreferred = true;
        return fix;
    }
    createRemoveUnusedVariableFix(document, diagnostic) {
        const fix = new vscode.CodeAction('Remove unused variable', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        const fullLineRange = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line + 1, 0);
        fix.edit.delete(document.uri, fullLineRange);
        return fix;
    }
    createFixCasingFix(document, diagnostic) {
        const text = document.getText(diagnostic.range);
        const lower = text.toLowerCase();
        let correctCasing;
        if (lower === 'writeln')
            correctCasing = 'WriteLn';
        else if (lower === 'readln')
            correctCasing = 'ReadLn';
        else if (lower === 'write')
            correctCasing = 'Write';
        else if (lower === 'read')
            correctCasing = 'Read';
        if (!correctCasing)
            return undefined;
        const fix = new vscode.CodeAction(`Change to '${correctCasing}'`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(document.uri, diagnostic.range, correctCasing);
        return fix;
    }
    createAddEndFix(document, range) {
        const fix = new vscode.CodeAction('Add matching end', vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        // Find appropriate indentation
        const line = document.lineAt(range.start.line);
        const indent = line.text.match(/^\s*/)?.[0] || '';
        // Insert end after the begin block (find good position)
        let insertLine = range.end.line + 1;
        while (insertLine < document.lineCount &&
            document.lineAt(insertLine).text.trim()) {
            insertLine++;
        }
        fix.edit.insert(document.uri, new vscode.Position(insertLine, 0), `${indent}end;\n`);
        fix.isPreferred = true;
        return fix;
    }
    createDeclareVariableFix(document, diagnostic) {
        const varNameMatch = diagnostic.message.match(/["'](\w+)["']/);
        if (!varNameMatch)
            return undefined;
        const varName = varNameMatch[1];
        const fix = new vscode.CodeAction(`Declare variable '${varName}'`, vscode.CodeActionKind.QuickFix);
        fix.edit = new vscode.WorkspaceEdit();
        // Find var section or create one
        const varSection = this.findOrCreateVarSection(document);
        if (!varSection)
            return undefined;
        fix.edit.insert(document.uri, varSection, `  ${varName}: Integer; // TODO: Set correct type\n`);
        return fix;
    }
    findOrCreateVarSection(document) {
        const text = document.getText();
        const lines = text.split('\n');
        // Look for existing var section
        for (let i = 0; i < lines.length; i++) {
            if (/^\s*var\s*$/i.test(lines[i])) {
                // Find end of var section
                for (let j = i + 1; j < lines.length; j++) {
                    if (/^\s*(begin|const|type|procedure|function)\b/i.test(lines[j])) {
                        return new vscode.Position(j, 0);
                    }
                }
                return new vscode.Position(i + 1, 0);
            }
        }
        // Find begin and insert var before it
        for (let i = 0; i < lines.length; i++) {
            if (/^\s*begin\s*$/i.test(lines[i])) {
                return new vscode.Position(i, 0);
            }
        }
        return undefined;
    }
    createRefactoringActions(document, range) {
        const actions = [];
        const selectedText = document.getText(range);
        // Extract to procedure
        if (selectedText.trim().length > 0) {
            const extract = new vscode.CodeAction('Extract to procedure', vscode.CodeActionKind.RefactorExtract);
            extract.command = {
                command: 'pascal.extractProcedure',
                title: 'Extract to procedure',
                arguments: [document, range]
            };
            actions.push(extract);
        }
        // Convert to uppercase/lowercase
        if (selectedText.length > 0) {
            const toUpper = new vscode.CodeAction('Convert to UPPERCASE', vscode.CodeActionKind.Refactor);
            toUpper.edit = new vscode.WorkspaceEdit();
            toUpper.edit.replace(document.uri, range, selectedText.toUpperCase());
            actions.push(toUpper);
            const toLower = new vscode.CodeAction('Convert to lowercase', vscode.CodeActionKind.Refactor);
            toLower.edit = new vscode.WorkspaceEdit();
            toLower.edit.replace(document.uri, range, selectedText.toLowerCase());
            actions.push(toLower);
        }
        return actions;
    }
}
exports.CodeActionProvider = CodeActionProvider;
CodeActionProvider.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Refactor
];
//# sourceMappingURL=codeActionProvider.js.map