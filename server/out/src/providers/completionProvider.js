"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = void 0;
const node_1 = require("vscode-languageserver/node");
const builtIns = {
    functions: ['WriteLn', 'ReadLn', 'Length', 'Copy', 'Inc', 'Dec'],
    types: ['Integer', 'String', 'Boolean', 'Char', 'Real']
};
class CompletionProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provide(params) {
        const items = [];
        builtIns.functions.forEach(f => items.push({
            label: f,
            kind: node_1.CompletionItemKind.Function,
            detail: '(built-in procedure/function)',
            documentation: `Standard Pascal ${f}`
        }));
        builtIns.types.forEach(t => items.push({
            label: t,
            kind: node_1.CompletionItemKind.Class,
            detail: '(built-in type)'
        }));
        const info = this.manager.get(params.textDocument.uri);
        if (info) {
            info.symbols.getAll().forEach(sym => {
                items.push({
                    label: sym.name,
                    kind: sym.kind === 'procedure' || sym.kind === 'function' ? node_1.CompletionItemKind.Function : node_1.CompletionItemKind.Variable,
                    detail: sym.kind
                });
            });
        }
        return items;
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map