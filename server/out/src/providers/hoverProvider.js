"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const node_1 = require("vscode-languageserver/node");
const builtInDocs = {
    WriteLn: 'כותב ערכים לקונסולה עם מעבר שורה.',
    ReadLn: 'קורא שורה מקלט סטנדרטי.',
    Length: 'מחזיר אורך של מחרוזת או מערך.',
    Copy: 'מחזיר תת-מחרוזת.'
};
function getWordRangeAtPosition(doc, position) {
    const lineText = doc.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line + 1, character: 0 }
    });
    const charOffset = position.character;
    const identifierRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    let match;
    while ((match = identifierRegex.exec(lineText)) !== null) {
        if (match.index <= charOffset && charOffset <= match.index + match[0].length) {
            return {
                start: { line: position.line, character: match.index },
                end: { line: position.line, character: match.index + match[0].length }
            };
        }
    }
    return undefined;
}
class HoverProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provide(params) {
        const info = this.manager.get(params.textDocument.uri);
        if (!info)
            return null;
        const doc = info.document;
        const wordRange = getWordRangeAtPosition(doc, params.position);
        if (!wordRange)
            return null;
        const word = doc.getText(wordRange);
        if (builtInDocs[word]) {
            return {
                contents: { kind: node_1.MarkupKind.Markdown, value: `**${word}**\n\n${builtInDocs[word]}` },
                range: wordRange
            };
        }
        const symbol = info.symbols.find(word);
        if (symbol) {
            return {
                contents: { kind: node_1.MarkupKind.Markdown, value: `**${symbol.kind}** \`${symbol.name}\`` },
                range: wordRange
            };
        }
        return null;
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hoverProvider.js.map