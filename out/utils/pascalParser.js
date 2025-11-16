"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\utils\pascalParser.ts
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
exports.PascalParser = void 0;
const vscode = __importStar(require("vscode"));
class PascalParser {
    constructor() {
        this.procedurePattern = /^\s*(procedure|function)\s+(\w+)(?:\(([^)]*)\))?(?:\s*:\s*(\w+))?/i;
        this.varPattern = /^\s*(var|const)\s+(\w+)\s*:\s*([^;]+);/i;
        this.typePattern = /^\s*type\s+(\w+)\s*=\s*(.+)/i;
        this.classPattern = /^\s*(\w+)\s*=\s*class(?:\((\w+)\))?/i;
        this.propertyPattern = /^\s*property\s+(\w+)\s*:\s*(\w+)/i;
    }
    parseDocument(document) {
        const symbols = [];
        const text = document.getText();
        const lines = text.split('\n');
        let currentClass = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            // Parse procedure/function
            const procMatch = trimmed.match(this.procedurePattern);
            if (procMatch) {
                const [, kind, name, params, returnType] = procMatch;
                const detail = this.buildProcedureDetail(kind, name, params, returnType);
                symbols.push({
                    name,
                    kind: kind.toLowerCase(),
                    detail,
                    range: new vscode.Range(i, 0, i, line.length),
                    uri: document.uri,
                    documentation: this.extractDocumentation(lines, i)
                });
            }
            // Parse variable/constant
            const varMatch = trimmed.match(this.varPattern);
            if (varMatch) {
                const [, kind, name, type] = varMatch;
                symbols.push({
                    name,
                    kind: kind.toLowerCase() === 'var' ? 'variable' : 'constant',
                    detail: `${name}: ${type}`,
                    range: new vscode.Range(i, 0, i, line.length),
                    uri: document.uri
                });
            }
            // Parse type/class
            const typeMatch = trimmed.match(this.typePattern);
            if (typeMatch) {
                const [, name, definition] = typeMatch;
                const classMatch = definition.match(this.classPattern);
                if (classMatch) {
                    currentClass = name;
                    const [, , parent] = classMatch;
                    symbols.push({
                        name,
                        kind: 'class',
                        detail: parent ? `class(${parent})` : 'class',
                        range: new vscode.Range(i, 0, this.findEndOfClass(lines, i), 0),
                        uri: document.uri,
                        documentation: this.extractDocumentation(lines, i)
                    });
                }
                else {
                    symbols.push({
                        name,
                        kind: 'type',
                        detail: definition,
                        range: new vscode.Range(i, 0, i, line.length),
                        uri: document.uri
                    });
                }
            }
            // Parse property
            if (currentClass) {
                const propMatch = trimmed.match(this.propertyPattern);
                if (propMatch) {
                    const [, name, type] = propMatch;
                    symbols.push({
                        name,
                        kind: 'property',
                        detail: `property ${name}: ${type}`,
                        range: new vscode.Range(i, 0, i, line.length),
                        uri: document.uri
                    });
                }
            }
            // End of class
            if (currentClass && /^\s*end;\s*$/i.test(trimmed)) {
                currentClass = null;
            }
        }
        return symbols;
    }
    buildProcedureDetail(kind, name, params, returnType) {
        let detail = `${kind} ${name}`;
        if (params) {
            detail += `(${params})`;
        }
        if (returnType) {
            detail += `: ${returnType}`;
        }
        return detail;
    }
    extractDocumentation(lines, index) {
        const docs = [];
        // Look for comments above the declaration
        for (let i = index - 1; i >= 0 && i >= index - 5; i--) {
            const line = lines[i].trim();
            if (line.startsWith('//')) {
                docs.unshift(line.substring(2).trim());
            }
            else if (line.startsWith('{') && line.endsWith('}')) {
                docs.unshift(line.substring(1, line.length - 1).trim());
            }
            else if (line && !line.startsWith('//') && !line.startsWith('{')) {
                break; // Stop at first non-comment line
            }
        }
        return docs.length > 0 ? docs.join('\n') : undefined;
    }
    findEndOfClass(lines, startIndex) {
        let depth = 1;
        for (let i = startIndex + 1; i < lines.length && i < startIndex + 500; i++) {
            const line = lines[i].toLowerCase();
            if (line.includes('class') || line.includes('record')) {
                depth++;
            }
            if (line.trim() === 'end;') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return startIndex + 1;
    }
    findSymbolAtPosition(document, position) {
        const range = document.getWordRangeAtPosition(position, /\b[a-zA-Z_]\w*\b/);
        if (!range)
            return undefined;
        return document.getText(range);
    }
    isInComment(document, position) {
        const line = document.lineAt(position).text;
        const char = position.character;
        // Check for line comment
        const commentStart = line.indexOf('//');
        if (commentStart !== -1 && commentStart < char) {
            return true;
        }
        // Check for block comment (simplified)
        const beforeCursor = line.substring(0, char);
        const openBrace = beforeCursor.lastIndexOf('{');
        const closeBrace = beforeCursor.lastIndexOf('}');
        if (openBrace > closeBrace) {
            return true;
        }
        return false;
    }
    isInString(document, position) {
        const line = document.lineAt(position).text;
        const char = position.character;
        let inString = false;
        for (let i = 0; i < char; i++) {
            if (line[i] === "'") {
                inString = !inString;
            }
        }
        return inString;
    }
}
exports.PascalParser = PascalParser;
//# sourceMappingURL=pascalParser.js.map