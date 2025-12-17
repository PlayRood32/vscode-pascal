import { CompletionItem, CompletionItemKind, CompletionList, TextDocumentPositionParams } from 'vscode-languageserver/node';
import { DocumentManager } from '../workspace/documentManager';

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
    { label: 'WriteLn', kind: CompletionItemKind.Function, documentation: 'Writes values with newline.' },
    { label: 'Write', kind: CompletionItemKind.Function, documentation: 'Writes values without newline.' },
    { label: 'ReadLn', kind: CompletionItemKind.Function, documentation: 'Reads line from input.' },
    { label: 'Read', kind: CompletionItemKind.Function, documentation: 'Reads from input.' },
    { label: 'Length', kind: CompletionItemKind.Function, documentation: 'Returns length of string/array.' },
    { label: 'Copy', kind: CompletionItemKind.Function, documentation: 'Returns substring.' },
    { label: 'Inc', kind: CompletionItemKind.Function },
    { label: 'Dec', kind: CompletionItemKind.Function },
    { label: 'Ord', kind: CompletionItemKind.Function },
    { label: 'Chr', kind: CompletionItemKind.Function },
    { label: 'Pred', kind: CompletionItemKind.Function },
    { label: 'Succ', kind: CompletionItemKind.Function },
    { label: 'High', kind: CompletionItemKind.Function },
    { label: 'Low', kind: CompletionItemKind.Function },
    { label: 'SizeOf', kind: CompletionItemKind.Function }
];

const builtInTypes = [
    'Integer', 'String', 'Boolean', 'Char', 'Real',
    'Byte', 'Word', 'LongInt', 'Cardinal', 'ShortInt',
    'SmallInt', 'LongWord', 'Int64', 'Single', 'Double',
    'Extended', 'Pointer', 'File', 'Text'
];

export class CompletionProvider {
    constructor(private manager: DocumentManager) {}

    public provide(params: TextDocumentPositionParams): CompletionList {
        const info = this.manager.get(params.textDocument.uri);
        const items: CompletionItem[] = [];

        keywords.forEach(kw => {
            items.push({
                label: kw,
                kind: CompletionItemKind.Keyword
            });
        });

        builtInTypes.forEach(t => {
            items.push({
                label: t,
                kind: CompletionItemKind.Class
            });
        });

        builtIns.forEach(b => {
            items.push({
                label: b.label,
                kind: b.kind,
                documentation: b.documentation ? { kind: 'markdown', value: b.documentation } : undefined
            });
        });

        if (info) {
            info.symbols.getAll().forEach(sym => {
                let kind: CompletionItemKind = CompletionItemKind.Variable; 

                if (sym.kind === 'procedure' || sym.kind === 'function') {
                    kind = CompletionItemKind.Function;
                } else if (sym.kind === 'type' || sym.kind === 'class') {
                    kind = CompletionItemKind.Class;
                } else if (sym.kind === 'module') {
                    kind = CompletionItemKind.Module;
                } else if (sym.kind === 'constant') {
                    kind = CompletionItemKind.Constant;
                }

                items.push({
                    label: sym.name,
                    kind: kind
                });
            });
        }

        return CompletionList.create(items, false);
    }
}