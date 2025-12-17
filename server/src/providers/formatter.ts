import { TextDocument } from 'vscode-languageserver-textdocument';
import { FormattingOptions, TextEdit, Range, Position } from 'vscode-languageserver/node';

export class Formatter {
    public format(doc: TextDocument, options: FormattingOptions): TextEdit[] {
        const text = doc.getText();
        const lines = text.split('\n');
        const formatted: string[] = [];
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
        const fullRange = Range.create(Position.create(0, 0), doc.positionAt(text.length));
        return [TextEdit.replace(fullRange, fullText)];
    }
}