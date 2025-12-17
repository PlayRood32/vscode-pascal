"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const node_1 = require("vscode-languageserver/node");
const builtInDocs = {
    WriteLn: '**WriteLn**  \nWrites values followed by a newline.',
    ReadLn: '**ReadLn**  \nReads a line from standard input.',
    Length: '**Length**  \nReturns length of string or array.',
    Copy: '**Copy**  \nReturns a substring.',
    Inc: '**Inc**  \nIncrements a variable.',
    Dec: '**Dec**  \nDecrements a variable.',
    Ord: '**Ord**  \nReturns ordinal value of character.',
    Chr: '**Chr**  \nReturns character from ordinal value.'
};
function getWordAtPosition(doc, position) {
    const lineText = doc.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line + 1, character: 0 }
    });
    const charOffset = position.character;
    const identifierRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    let match;
    while ((match = identifierRegex.exec(lineText)) !== null) {
        if (match.index <= charOffset && charOffset <= match.index + match[0].length) {
            const range = {
                start: { line: position.line, character: match.index },
                end: { line: position.line, character: match.index + match[0].length }
            };
            return { word: match[0], range };
        }
    }
    return null;
}
class HoverProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provide(params) {
        const info = this.manager.get(params.textDocument.uri);
        if (!info)
            return null;
        const wordInfo = getWordAtPosition(info.document, params.position);
        if (!wordInfo)
            return null;
        const lowerWord = wordInfo.word.toLowerCase();
        if (builtInDocs[wordInfo.word]) {
            return {
                contents: { kind: node_1.MarkupKind.Markdown, value: builtInDocs[wordInfo.word] },
                range: wordInfo.range
            };
        }
        const symbol = info.symbols.find(lowerWord);
        if (symbol) {
            return {
                contents: { kind: node_1.MarkupKind.Markdown, value: `**${symbol.kind}** \`${symbol.name}\`` },
                range: wordInfo.range
            };
        }
        return null;
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hoverProvider.js.map