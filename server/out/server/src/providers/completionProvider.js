"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = void 0;
const node_1 = require("vscode-languageserver/node");
const keywords = [
    'program', 'unit', 'uses', 'interface', 'implementation',
    'begin', 'end', 'var', 'const', 'type',
    'procedure', 'function', 'constructor', 'destructor',
    'class', 'record', 'object', 'property',
    'if', 'then', 'else', 'case', 'of',
    'for', 'to', 'downto', 'while', 'do',
    'repeat', 'until', 'try', 'except', 'finally',
    'with', 'inherited', 'override', 'virtual', 'abstract'
];
const builtIns = [
    { label: 'WriteLn', kind: node_1.CompletionItemKind.Function, documentation: 'Writes values with newline.' },
    { label: 'Write', kind: node_1.CompletionItemKind.Function, documentation: 'Writes values without newline.' },
    { label: 'ReadLn', kind: node_1.CompletionItemKind.Function, documentation: 'Reads line from input.' },
    { label: 'Read', kind: node_1.CompletionItemKind.Function, documentation: 'Reads from input.' },
    { label: 'Length', kind: node_1.CompletionItemKind.Function, documentation: 'Returns length of string/array.' },
    { label: 'Copy', kind: node_1.CompletionItemKind.Function, documentation: 'Returns substring.' },
    { label: 'Inc', kind: node_1.CompletionItemKind.Function },
    { label: 'Dec', kind: node_1.CompletionItemKind.Function },
    { label: 'Ord', kind: node_1.CompletionItemKind.Function },
    { label: 'Chr', kind: node_1.CompletionItemKind.Function },
    { label: 'Pred', kind: node_1.CompletionItemKind.Function },
    { label: 'Succ', kind: node_1.CompletionItemKind.Function },
    { label: 'High', kind: node_1.CompletionItemKind.Function },
    { label: 'Low', kind: node_1.CompletionItemKind.Function },
    { label: 'SizeOf', kind: node_1.CompletionItemKind.Function }
];
const builtInTypes = [
    'Integer', 'String', 'Boolean', 'Char', 'Real',
    'Byte', 'Word', 'LongInt', 'Cardinal', 'ShortInt',
    'SmallInt', 'LongWord', 'Int64', 'Single', 'Double',
    'Extended', 'Pointer', 'File', 'Text'
];
class CompletionProvider {
    constructor(manager) {
        this.manager = manager;
    }
    provide(params) {
        const info = this.manager.get(params.textDocument.uri);
        const items = [];
        // מילות מפתח
        keywords.forEach(kw => {
            items.push({
                label: kw,
                kind: node_1.CompletionItemKind.Keyword
            });
        });
        // טיפוסים מובנים
        builtInTypes.forEach(t => {
            items.push({
                label: t,
                kind: node_1.CompletionItemKind.Class
            });
        });
        // פונקציות מובנות
        builtIns.forEach(b => {
            items.push({
                label: b.label,
                kind: b.kind,
                documentation: b.documentation ? { kind: 'markdown', value: b.documentation } : undefined
            });
        });
        // סמלים מהקוד של המשתמש
        if (info) {
            info.symbols.getAll().forEach(sym => {
                let kind = node_1.CompletionItemKind.Variable; // כאן ההגדרה המפורשת!
                if (sym.kind === 'procedure' || sym.kind === 'function') {
                    kind = node_1.CompletionItemKind.Function;
                }
                else if (sym.kind === 'type' || sym.kind === 'class') {
                    kind = node_1.CompletionItemKind.Class;
                }
                else if (sym.kind === 'module') {
                    kind = node_1.CompletionItemKind.Module;
                }
                else if (sym.kind === 'constant') {
                    kind = node_1.CompletionItemKind.Constant;
                }
                items.push({
                    label: sym.name,
                    kind: kind
                });
            });
        }
        return node_1.CompletionList.create(items, false);
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map