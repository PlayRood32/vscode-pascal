"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = void 0;
const node_1 = require("vscode-languageserver/node");
const builtIns = [
    { label: 'WriteLn', kind: node_1.CompletionItemKind.Function, documentation: 'Writes values with newline.' },
    { label: 'ReadLn', kind: node_1.CompletionItemKind.Function, documentation: 'Reads line from input.' },
    { label: 'Write', kind: node_1.CompletionItemKind.Function, documentation: 'Writes values without newline.' },
    { label: 'Length', kind: node_1.CompletionItemKind.Function, documentation: 'Returns length of string/array.' },
    { label: 'Copy', kind: node_1.CompletionItemKind.Function, documentation: 'Returns substring.' },
    { label: 'begin', kind: node_1.CompletionItemKind.Keyword },
    { label: 'end', kind: node_1.CompletionItemKind.Keyword },
    { label: 'procedure', kind: node_1.CompletionItemKind.Keyword },
    { label: 'function', kind: node_1.CompletionItemKind.Keyword },
    { label: 'var', kind: node_1.CompletionItemKind.Keyword },
    { label: 'const', kind: node_1.CompletionItemKind.Keyword },
    { label: 'type', kind: node_1.CompletionItemKind.Keyword },
    { label: 'Integer', kind: node_1.CompletionItemKind.Class },
    { label: 'String', kind: node_1.CompletionItemKind.Class },
    { label: 'Boolean', kind: node_1.CompletionItemKind.Class },
    { label: 'Real', kind: node_1.CompletionItemKind.Class },
    { label: 'Char', kind: node_1.CompletionItemKind.Class }
];
class CompletionProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provide(params) {
        const info = this.manager.get(params.textDocument.uri);
        const items = [];
        builtIns.forEach(b => {
            items.push({
                label: b.label,
                kind: b.kind,
                documentation: b.documentation ? { kind: 'markdown', value: b.documentation } : undefined
            });
        });
        if (info) {
            info.symbols.getAll().forEach(sym => {
                items.push({
                    label: sym.name,
                    kind: sym.kind === 'procedure' || sym.kind === 'function'
                        ? node_1.CompletionItemKind.Function
                        : sym.kind === 'variable' || sym.kind === 'constant'
                            ? node_1.CompletionItemKind.Variable
                            : node_1.CompletionItemKind.Class
                });
            });
        }
        return node_1.CompletionList.create(items, false);
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map