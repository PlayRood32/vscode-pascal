"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionProvider = void 0;
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
class DefinitionProvider {
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
        const symbol = info.symbols.find(wordInfo.word.toLowerCase());
        if (!symbol)
            return null;
        return { uri: params.textDocument.uri, range: symbol.range };
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map