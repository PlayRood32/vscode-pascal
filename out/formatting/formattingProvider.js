"use strict";
// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\formatting\formattingProvider.ts
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
exports.FormattingProvider = void 0;
const vscode = __importStar(require("vscode"));
class FormattingProvider {
    provideDocumentFormattingEdits(document, _options, _token) {
        const config = vscode.workspace.getConfiguration('pascal');
        const indentSize = config.get('indentSize', 2);
        const useSpaces = config.get('insertSpaces', true);
        const edits = [];
        const lines = document.getText().split('\n');
        let indentLevel = 0;
        let inCase = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (!trimmed || this.isComment(trimmed)) {
                continue;
            }
            // Calculate indent for this line
            const newIndent = this.calculateIndent(trimmed, indentLevel, inCase);
            // Update indent level for next line
            const indentChange = this.getIndentChange(trimmed);
            indentLevel = Math.max(0, indentLevel + indentChange);
            // Track case statements
            if (/\bcase\b.*\bof\b/i.test(trimmed)) {
                inCase = true;
            }
            if (inCase && /^\s*end\s*;/i.test(trimmed)) {
                inCase = false;
            }
            // Create formatted line
            const indentStr = useSpaces
                ? ' '.repeat(newIndent * indentSize)
                : '\t'.repeat(newIndent);
            const formattedLine = indentStr + trimmed;
            // Create edit if line changed
            if (line !== formattedLine) {
                const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, line.length));
                edits.push(vscode.TextEdit.replace(range, formattedLine));
            }
        }
        return edits;
    }
    calculateIndent(line, currentIndent, inCase) {
        const lower = line.toLowerCase();
        // Decrease indent before these keywords
        if (/^(end|until|else|except|finally)\b/.test(lower)) {
            return Math.max(0, currentIndent - 1);
        }
        // Case values
        if (inCase && /^\w+\s*:/.test(line)) {
            return currentIndent;
        }
        // Visibility modifiers
        if (/^(private|protected|public|published)\b/.test(lower)) {
            return Math.max(0, currentIndent - 1);
        }
        return currentIndent;
    }
    getIndentChange(line) {
        const lower = line.toLowerCase();
        let change = 0;
        // Increase indent
        if (/\b(begin|record|class|case|try|repeat)\b/.test(lower)) {
            change++;
        }
        // Also increase for control structures
        if (/(if\b.*\bthen|while\b.*\bdo|for\b.*\bdo)\s*$/i.test(lower) &&
            !/\bbegin\b/i.test(lower)) {
            change++;
        }
        // Decrease indent
        if (/^(end|until)\b/.test(lower)) {
            change--;
        }
        // Handle single-line blocks
        if (/\bbegin\b.*\bend\b/i.test(lower)) {
            change = 0;
        }
        return change;
    }
    isComment(line) {
        return line.startsWith('//') ||
            line.startsWith('{') ||
            line.startsWith('(*');
    }
}
exports.FormattingProvider = FormattingProvider;
//# sourceMappingURL=formattingProvider.js.map