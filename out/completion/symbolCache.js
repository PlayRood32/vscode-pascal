"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\completion\symbolCache.ts
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
exports.SymbolCache = void 0;
const vscode = __importStar(require("vscode"));
const pascalParser_1 = require("../utils/pascalParser");
class SymbolCache {
    constructor() {
        this.symbols = new Map();
        this.disposables = [];
        this.parser = new pascalParser_1.PascalParser();
        // Watch for document changes
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === 'pascal') {
                this.refreshDocument(e.document);
            }
        }));
        this.disposables.push(vscode.workspace.onDidCloseTextDocument(doc => {
            if (doc.languageId === 'pascal') {
                this.removeDocument(doc);
            }
        }));
    }
    async refreshDocument(document) {
        const symbols = this.parser.parseDocument(document);
        this.symbols.set(document.uri.toString(), symbols);
    }
    removeDocument(document) {
        this.symbols.delete(document.uri.toString());
    }
    getSymbolCount() {
        let count = 0;
        this.symbols.forEach(syms => count += syms.length);
        return count;
    }
    getAllSymbols() {
        const allSymbols = [];
        this.symbols.forEach(syms => allSymbols.push(...syms));
        return allSymbols;
    }
    getSymbolsForDocument(document) {
        return this.symbols.get(document.uri.toString()) || [];
    }
    findSymbol(name, document) {
        if (document) {
            const docSymbols = this.getSymbolsForDocument(document);
            const found = docSymbols.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (found)
                return found;
        }
        // Search in all documents
        for (const symbols of this.symbols.values()) {
            const found = symbols.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (found)
                return found;
        }
        return undefined;
    }
    getCompletionItems(document) {
        const symbols = this.getSymbolsForDocument(document);
        return symbols.map(sym => {
            const item = new vscode.CompletionItem(sym.name, this.mapKindToCompletionKind(sym.kind));
            item.detail = sym.detail;
            item.documentation = new vscode.MarkdownString(sym.documentation || sym.detail);
            item.sortText = '1' + sym.name; // Lower priority than keywords
            return item;
        });
    }
    getDocumentSymbols(document) {
        const symbols = this.getSymbolsForDocument(document);
        return symbols.map(sym => new vscode.DocumentSymbol(sym.name, sym.detail, this.mapKindToSymbolKind(sym.kind), sym.range, sym.range));
    }
    mapKindToCompletionKind(kind) {
        switch (kind.toLowerCase()) {
            case 'procedure': return vscode.CompletionItemKind.Function;
            case 'function': return vscode.CompletionItemKind.Function;
            case 'variable': return vscode.CompletionItemKind.Variable;
            case 'constant': return vscode.CompletionItemKind.Constant;
            case 'type': return vscode.CompletionItemKind.Class;
            case 'class': return vscode.CompletionItemKind.Class;
            case 'record': return vscode.CompletionItemKind.Struct;
            case 'property': return vscode.CompletionItemKind.Property;
            case 'unit': return vscode.CompletionItemKind.Module;
            default: return vscode.CompletionItemKind.Text;
        }
    }
    mapKindToSymbolKind(kind) {
        switch (kind.toLowerCase()) {
            case 'procedure': return vscode.SymbolKind.Function;
            case 'function': return vscode.SymbolKind.Function;
            case 'variable': return vscode.SymbolKind.Variable;
            case 'constant': return vscode.SymbolKind.Constant;
            case 'type': return vscode.SymbolKind.Class;
            case 'class': return vscode.SymbolKind.Class;
            case 'record': return vscode.SymbolKind.Struct;
            case 'property': return vscode.SymbolKind.Property;
            case 'unit': return vscode.SymbolKind.Module;
            case 'constructor': return vscode.SymbolKind.Constructor;
            default: return vscode.SymbolKind.Variable;
        }
    }
    dispose() {
        this.symbols.clear();
        this.disposables.forEach(d => d.dispose());
    }
}
exports.SymbolCache = SymbolCache;
//# sourceMappingURL=symbolCache.js.map