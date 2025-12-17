"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = void 0;
const node_1 = require("vscode-languageserver/node");
class Formatter {
    format(doc, options) {
        const text = doc.getText();
        const lines = text.split('\n');
        const formatted = [];
        let indentLevel = 0;
        const indentSize = options.insertSpaces ? options.tabSize : 1;
        const indentChar = options.insertSpaces ? ' ' : '\t';
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line === '') {
                formatted.push('');
                continue;
            }
            const lowerLine = line.toLowerCase();
            if (lowerLine.startsWith('end') || lowerLine === 'else' || lowerLine === 'except' || lowerLine === 'finally') {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            const indent = indentChar.repeat(indentLevel * indentSize);
            formatted.push(indent + line);
            if (lowerLine.startsWith('begin') || lowerLine.startsWith('try') || lowerLine.startsWith('case') ||
                lowerLine.startsWith('record') || lowerLine.startsWith('class') || lowerLine.startsWith('procedure') ||
                lowerLine.startsWith('function')) {
                indentLevel++;
            }
        }
        const fullText = formatted.join('\n');
        const fullRange = node_1.Range.create(node_1.Position.create(0, 0), doc.positionAt(text.length));
        return [node_1.TextEdit.replace(fullRange, fullText)];
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=formatter.js.map