"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\intellisense\definitionProvider.ts
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
exports.DefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
const pascalParser_1 = require("../utils/pascalParser");
class DefinitionProvider {
    constructor(symbolCache) {
        this.symbolCache = symbolCache;
        this.parser = new pascalParser_1.PascalParser();
    }
    provideDefinition(document, position, _token) {
        // Don't provide definition in comments or strings
        if (this.parser.isInComment(document, position) ||
            this.parser.isInString(document, position)) {
            return undefined;
        }
        const wordRange = document.getWordRangeAtPosition(position, /\b[a-zA-Z_]\w*\b/);
        if (!wordRange)
            return undefined;
        const word = document.getText(wordRange);
        // Search for symbol in current document first
        const symbol = this.symbolCache.findSymbol(word, document);
        if (symbol) {
            return new vscode.Location(symbol.uri, symbol.range);
        }
        // Search in all documents
        const allSymbol = this.symbolCache.findSymbol(word);
        if (allSymbol) {
            return new vscode.Location(allSymbol.uri, allSymbol.range);
        }
        // Try to find in same document with regex (fallback)
        const localDefinition = this.findLocalDefinition(document, word);
        if (localDefinition) {
            return localDefinition;
        }
        return undefined;
    }
    findLocalDefinition(document, word) {
        const text = document.getText();
        const lines = text.split('\n');
        // Patterns to search for
        const patterns = [
            new RegExp(`^\\s*(procedure|function)\\s+${word}\\b`, 'i'),
            new RegExp(`^\\s*(var|const)\\s+${word}\\s*:`, 'i'),
            new RegExp(`^\\s*${word}\\s*=\\s*(class|record)\\b`, 'i'),
            new RegExp(`^\\s*type\\s+${word}\\s*=`, 'i')
        ];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const pattern of patterns) {
                if (pattern.test(line)) {
                    const position = new vscode.Position(i, line.indexOf(word));
                    return new vscode.Location(document.uri, position);
                }
            }
        }
        return undefined;
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map