"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\completion\completionProvider.ts
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
exports.CompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
class CompletionProvider {
    constructor(symbolCache) {
        this.symbolCache = symbolCache;
    }
    async provideCompletionItems(document, position, _token, _context) {
        const line = document.lineAt(position).text;
        const linePrefix = line.substring(0, position.character);
        const items = [];
        // Context-aware completions
        if (this.isInProcedureCall(linePrefix)) {
            items.push(...this.getVariableCompletions(document, position));
        }
        if (this.isAfterDot(linePrefix)) {
            items.push(...this.getMemberCompletions(document, position, linePrefix));
        }
        if (this.isInTypeContext(linePrefix)) {
            items.push(...this.getTypeCompletions());
        }
        // Always include keywords
        items.push(...this.getKeywordCompletions());
        // Include symbols from cache
        items.push(...this.symbolCache.getCompletionItems(document));
        // Built-in functions
        items.push(...this.getBuiltInCompletions());
        return items;
    }
    isInProcedureCall(linePrefix) {
        return /\b(writeln|write|readln|read)\s*\(\s*[^)]*$/i.test(linePrefix);
    }
    isAfterDot(linePrefix) {
        return /\.\s*$/.test(linePrefix);
    }
    isInTypeContext(linePrefix) {
        return /:\s*$/.test(linePrefix) || /\bvar\s+\w+\s*:\s*$/i.test(linePrefix);
    }
    getVariableCompletions(document, position) {
        const items = [];
        const varPattern = /\b(?:var|const)\s+(\w+)\s*:/gi;
        const text = document.getText(new vscode.Range(0, 0, position.line, position.character));
        let match;
        while ((match = varPattern.exec(text)) !== null) {
            const item = new vscode.CompletionItem(match[1], vscode.CompletionItemKind.Variable);
            item.detail = 'Local variable';
            item.sortText = '0' + match[1]; // Prioritize
            items.push(item);
        }
        return items;
    }
    getMemberCompletions(document, _position, linePrefix) {
        const items = [];
        // Extract object before dot
        const objectMatch = linePrefix.match(/(\w+)\.\s*$/);
        if (!objectMatch)
            return items;
        const objectName = objectMatch[1].toLowerCase();
        // Common string methods
        if (this.isStringType(objectName, document)) {
            items.push(...this.getStringMethods());
        }
        // Common TObject methods
        items.push(...this.getObjectMethods());
        return items;
    }
    isStringType(name, document) {
        // Simple heuristic: check if variable is declared as string
        const text = document.getText();
        const declPattern = new RegExp(`\\b${name}\\s*:\\s*string\\b`, 'i');
        return declPattern.test(text);
    }
    getStringMethods() {
        const methods = [
            { name: 'Length', detail: 'Returns string length', kind: vscode.CompletionItemKind.Method },
            { name: 'Copy', detail: 'Copies substring', kind: vscode.CompletionItemKind.Method },
            { name: 'Pos', detail: 'Finds substring position', kind: vscode.CompletionItemKind.Method },
            { name: 'Insert', detail: 'Inserts string', kind: vscode.CompletionItemKind.Method },
            { name: 'Delete', detail: 'Deletes substring', kind: vscode.CompletionItemKind.Method }
        ];
        return methods.map(m => {
            const item = new vscode.CompletionItem(m.name, m.kind);
            item.detail = m.detail;
            return item;
        });
    }
    getObjectMethods() {
        const methods = [
            { name: 'Create', detail: 'Constructor', kind: vscode.CompletionItemKind.Constructor },
            { name: 'Free', detail: 'Destructor', kind: vscode.CompletionItemKind.Method },
            { name: 'ClassName', detail: 'Returns class name', kind: vscode.CompletionItemKind.Property }
        ];
        return methods.map(m => {
            const item = new vscode.CompletionItem(m.name, m.kind);
            item.detail = m.detail;
            return item;
        });
    }
    getTypeCompletions() {
        const types = [
            'Integer', 'String', 'Boolean', 'Real', 'Char', 'Byte',
            'Word', 'LongInt', 'Cardinal', 'Int64', 'Double',
            'Single', 'Extended', 'Currency', 'TDateTime',
            'AnsiString', 'WideString', 'ShortString',
            'Pointer', 'TObject', 'TList', 'TStringList'
        ];
        return types.map(type => {
            const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter);
            item.detail = 'Pascal type';
            return item;
        });
    }
    getKeywordCompletions() {
        const keywords = [
            // Control structures
            { word: 'begin', snippet: 'begin\n\t$0\nend;', detail: 'Begin-end block' },
            { word: 'if', snippet: 'if ${1:condition} then\nbegin\n\t$0\nend;', detail: 'If statement' },
            { word: 'for', snippet: 'for ${1:i} := ${2:1} to ${3:10} do\nbegin\n\t$0\nend;', detail: 'For loop' },
            { word: 'while', snippet: 'while ${1:condition} do\nbegin\n\t$0\nend;', detail: 'While loop' },
            { word: 'repeat', snippet: 'repeat\n\t$0\nuntil ${1:condition};', detail: 'Repeat-until loop' },
            { word: 'case', snippet: 'case ${1:expr} of\n\t${2:value}: $0;\nend;', detail: 'Case statement' },
            { word: 'try', snippet: 'try\n\t$0\nexcept\n\ton E: Exception do\n\t\twriteln(E.Message);\nend;', detail: 'Try-except' },
            // Declarations
            { word: 'procedure', snippet: 'procedure ${1:Name}(${2:params});\nbegin\n\t$0\nend;', detail: 'Procedure declaration' },
            { word: 'function', snippet: 'function ${1:Name}(${2:params}): ${3:Type};\nbegin\n\tResult := $0;\nend;', detail: 'Function declaration' },
            { word: 'var', snippet: 'var\n\t${1:name}: ${2:Type};', detail: 'Variable declaration' },
            { word: 'const', snippet: 'const\n\t${1:NAME} = ${2:value};', detail: 'Constant declaration' },
            { word: 'type', snippet: 'type\n\t${1:TName} = ${2:Type};', detail: 'Type declaration' },
            // OOP
            { word: 'class', snippet: 'type\n\t${1:TClassName} = class\n\tprivate\n\t\t${2:// fields}\n\tpublic\n\t\tconstructor Create;\n\t\tdestructor Destroy; override;\n\tend;', detail: 'Class declaration' },
            { word: 'constructor', snippet: 'constructor Create${1:(params)};\nbegin\n\tinherited;\n\t$0\nend;', detail: 'Constructor' },
            { word: 'destructor', snippet: 'destructor Destroy;\nbegin\n\t$0\n\tinherited;\nend;', detail: 'Destructor' },
            { word: 'property', snippet: 'property ${1:Name}: ${2:Type} read ${3:FField} write ${4:FField};', detail: 'Property' }
        ];
        return keywords.map(kw => {
            const item = new vscode.CompletionItem(kw.word, vscode.CompletionItemKind.Keyword);
            item.insertText = new vscode.SnippetString(kw.snippet);
            item.detail = kw.detail;
            item.documentation = new vscode.MarkdownString(`**${kw.word}**\n\n${kw.detail}`);
            return item;
        });
    }
    getBuiltInCompletions() {
        const builtIns = [
            // I/O
            { name: 'WriteLn', params: '(text: any)', detail: 'Write line to console', kind: vscode.CompletionItemKind.Function },
            { name: 'Write', params: '(text: any)', detail: 'Write to console', kind: vscode.CompletionItemKind.Function },
            { name: 'ReadLn', params: '(var x)', detail: 'Read line from console', kind: vscode.CompletionItemKind.Function },
            { name: 'Read', params: '(var x)', detail: 'Read from console', kind: vscode.CompletionItemKind.Function },
            // String functions
            { name: 'Length', params: '(s: string): Integer', detail: 'String length', kind: vscode.CompletionItemKind.Function },
            { name: 'Copy', params: '(s: string; start, len: Integer): string', detail: 'Copy substring', kind: vscode.CompletionItemKind.Function },
            { name: 'Pos', params: '(substr, s: string): Integer', detail: 'Find substring', kind: vscode.CompletionItemKind.Function },
            { name: 'UpCase', params: '(c: char): char', detail: 'Uppercase character', kind: vscode.CompletionItemKind.Function },
            { name: 'LowerCase', params: '(s: string): string', detail: 'Lowercase string', kind: vscode.CompletionItemKind.Function },
            { name: 'UpperCase', params: '(s: string): string', detail: 'Uppercase string', kind: vscode.CompletionItemKind.Function },
            { name: 'Trim', params: '(s: string): string', detail: 'Trim whitespace', kind: vscode.CompletionItemKind.Function },
            // Math functions
            { name: 'Abs', params: '(x: number): number', detail: 'Absolute value', kind: vscode.CompletionItemKind.Function },
            { name: 'Sqrt', params: '(x: Real): Real', detail: 'Square root', kind: vscode.CompletionItemKind.Function },
            { name: 'Sqr', params: '(x: number): number', detail: 'Square', kind: vscode.CompletionItemKind.Function },
            { name: 'Sin', params: '(x: Real): Real', detail: 'Sine', kind: vscode.CompletionItemKind.Function },
            { name: 'Cos', params: '(x: Real): Real', detail: 'Cosine', kind: vscode.CompletionItemKind.Function },
            { name: 'Round', params: '(x: Real): Integer', detail: 'Round to integer', kind: vscode.CompletionItemKind.Function },
            { name: 'Trunc', params: '(x: Real): Integer', detail: 'Truncate to integer', kind: vscode.CompletionItemKind.Function },
            // Conversion
            { name: 'IntToStr', params: '(i: Integer): string', detail: 'Integer to string', kind: vscode.CompletionItemKind.Function },
            { name: 'StrToInt', params: '(s: string): Integer', detail: 'String to integer', kind: vscode.CompletionItemKind.Function },
            { name: 'FloatToStr', params: '(f: Real): string', detail: 'Float to string', kind: vscode.CompletionItemKind.Function },
            { name: 'Chr', params: '(i: Integer): char', detail: 'Integer to char', kind: vscode.CompletionItemKind.Function },
            { name: 'Ord', params: '(c: char): Integer', detail: 'Char to integer', kind: vscode.CompletionItemKind.Function },
            // Memory
            { name: 'New', params: '(var p: Pointer)', detail: 'Allocate memory', kind: vscode.CompletionItemKind.Function },
            { name: 'Dispose', params: '(var p: Pointer)', detail: 'Free memory', kind: vscode.CompletionItemKind.Function },
            // System
            { name: 'Exit', params: '()', detail: 'Exit procedure/function', kind: vscode.CompletionItemKind.Function },
            { name: 'Break', params: '()', detail: 'Break loop', kind: vscode.CompletionItemKind.Function },
            { name: 'Continue', params: '()', detail: 'Continue loop', kind: vscode.CompletionItemKind.Function },
            { name: 'Halt', params: '(code: Integer)', detail: 'Terminate program', kind: vscode.CompletionItemKind.Function }
        ];
        return builtIns.map(fn => {
            const item = new vscode.CompletionItem(fn.name, fn.kind);
            item.detail = `${fn.name}${fn.params}`;
            item.documentation = new vscode.MarkdownString(`**${fn.name}**\n\n${fn.detail}\n\n\`\`\`pascal\n${fn.name}${fn.params}\n\`\`\``);
            item.insertText = fn.name;
            return item;
        });
    }
    resolveCompletionItem(item, _token) {
        // Add more detailed documentation when item is selected
        return item;
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map