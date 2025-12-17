"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionProvider = void 0;
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
class DefinitionProvider {
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
        const symbol = info.symbols.find(word);
        if (!symbol)
            return null;
        return { uri: params.textDocument.uri, range: symbol.range };
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map