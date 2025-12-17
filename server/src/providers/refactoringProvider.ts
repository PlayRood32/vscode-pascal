import { RenameParams, WorkspaceEdit, TextEdit, Position, Range } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentManager } from '../workspace/documentManager';

function getWordAtPosition(doc: TextDocument, position: Position): { word: string; range: Range } | null {
    const lineText = doc.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line + 1, character: 0 }
    });

    const charOffset = position.character;
    const identifierRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    let match: RegExpExecArray | null;

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

export class RefactoringProvider {
    constructor(private manager: DocumentManager) {}

    public rename(params: RenameParams): WorkspaceEdit | null {
        const info = this.manager.get(params.textDocument.uri);
        if (!info) return null;

        const wordInfo = getWordAtPosition(info.document, params.position);
        if (!wordInfo) return null;

        const lowerName = wordInfo.word.toLowerCase();
        const symbol = info.symbols.find(lowerName);
        if (!symbol) return null;

        const text = info.document.getText();
        const regex = new RegExp('\\b' + wordInfo.word + '\\b', 'g');
        const changes: TextEdit[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            const start = info.document.positionAt(match.index);
            const end = info.document.positionAt(match.index + match[0].length);
            changes.push(TextEdit.replace({ start, end }, params.newName));
        }

        return {
            changes: {
                [params.textDocument.uri]: changes
            }
        };
    }
}