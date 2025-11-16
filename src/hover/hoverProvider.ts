// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\hover\hoverProvider.ts

import * as vscode from 'vscode';
import { SymbolCache } from '../completion/symbolCache';
import { PascalParser } from '../utils/pascalParser';

export class HoverProvider implements vscode.HoverProvider {
    private symbolCache: SymbolCache;
    private parser: PascalParser;
    private documentation: Map<string, string>;

    constructor(symbolCache: SymbolCache) {
        this.symbolCache = symbolCache;
        this.parser = new PascalParser();
        this.documentation = this.initializeDocumentation();
    }

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.Hover | undefined {
        // Don't show hover in comments or strings
        if (this.parser.isInComment(document, position) || 
            this.parser.isInString(document, position)) {
            return undefined;
        }

        const wordRange = document.getWordRangeAtPosition(position, /\b[a-zA-Z_]\w*\b/);
        if (!wordRange) return undefined;

        const word = document.getText(wordRange).toLowerCase();

        // Check built-in documentation
        const builtInDoc = this.documentation.get(word);
        if (builtInDoc) {
            return new vscode.Hover(new vscode.MarkdownString(builtInDoc), wordRange);
        }

        // Check cached symbols
        const symbol = this.symbolCache.findSymbol(word, document);
        if (symbol) {
            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(symbol.detail, 'pascal');
            
            if (symbol.documentation) {
                markdown.appendMarkdown('\n\n' + symbol.documentation);
            }
            
            return new vscode.Hover(markdown, wordRange);
        }

        return undefined;
    }

    private initializeDocumentation(): Map<string, string> {
        const docs = new Map<string, string>();

        // Keywords
        docs.set('begin', '**begin**\n\nStarts a compound statement block.\n\n```pascal\nbegin\n  // statements\nend;\n```');
        docs.set('end', '**end**\n\nEnds a compound statement block or program.\n\n```pascal\nbegin\n  // statements\nend;\n```');
        docs.set('if', '**if**\n\nConditional statement.\n\n```pascal\nif condition then\n  statement;\n```');
        docs.set('then', '**then**\n\nUsed with `if` statement to introduce the true branch.');
        docs.set('else', '**else**\n\nIntroduces the false branch of an `if` statement.');
        docs.set('for', '**for**\n\nLoop with counter.\n\n```pascal\nfor i := 1 to 10 do\n  statement;\n```');
        docs.set('while', '**while**\n\nLoop with precondition.\n\n```pascal\nwhile condition do\n  statement;\n```');
        docs.set('repeat', '**repeat**\n\nLoop with postcondition.\n\n```pascal\nrepeat\n  statement;\nuntil condition;\n```');
        docs.set('until', '**until**\n\nTerminates a `repeat` loop when condition becomes true.');
        docs.set('case', '**case**\n\nMulti-way selection statement.\n\n```pascal\ncase expr of\n  value1: stmt1;\n  value2: stmt2;\nend;\n```');
        docs.set('procedure', '**procedure**\n\nDefines a subroutine that does not return a value.\n\n```pascal\nprocedure Name(params);\nbegin\n  // code\nend;\n```');
        docs.set('function', '**function**\n\nDefines a subroutine that returns a value.\n\n```pascal\nfunction Name(params): Type;\nbegin\n  Result := value;\nend;\n```');
        docs.set('var', '**var**\n\nDeclares variables.\n\n```pascal\nvar\n  name: Type;\n```');
        docs.set('const', '**const**\n\nDeclares constants.\n\n```pascal\nconst\n  NAME = value;\n```');
        docs.set('type', '**type**\n\nDefines custom types.\n\n```pascal\ntype\n  TName = Type;\n```');

        // I/O Functions
        docs.set('writeln', '**WriteLn**\n\nWrites data to standard output with newline.\n\n```pascal\nWriteLn(text1, text2, ...);\n```\n\n**Parameters:**\n- Text values to output (any type)\n\n**Example:**\n```pascal\nWriteLn(\'Hello, World!\');\nWriteLn(\'Number: \', 42);\n```');
        
        docs.set('write', '**Write**\n\nWrites data to standard output without newline.\n\n```pascal\nWrite(text1, text2, ...);\n```');
        
        docs.set('readln', '**ReadLn**\n\nReads data from standard input with newline.\n\n```pascal\nReadLn(variable);\n```\n\n**Example:**\n```pascal\nvar x: Integer;\nReadLn(x);\n```');
        
        docs.set('read', '**Read**\n\nReads data from standard input without newline.\n\n```pascal\nRead(variable);\n```');

        // String functions
        docs.set('length', '**Length**\n\nReturns the length of a string or array.\n\n```pascal\nfunction Length(s: string): Integer;\n```\n\n**Example:**\n```pascal\nlen := Length(\'Hello\');  // Returns 5\n```');
        
        docs.set('copy', '**Copy**\n\nCopies a substring from a string.\n\n```pascal\nfunction Copy(s: string; start, length: Integer): string;\n```\n\n**Example:**\n```pascal\nsub := Copy(\'Hello\', 1, 3);  // Returns \'Hel\'\n```');
        
        docs.set('pos', '**Pos**\n\nFinds the position of a substring.\n\n```pascal\nfunction Pos(substr, s: string): Integer;\n```\n\n**Returns:** Position of first occurrence, or 0 if not found.');

        // Math functions
        docs.set('abs', '**Abs**\n\nReturns absolute value.\n\n```pascal\nfunction Abs(x: Real): Real;\n```');
        
        docs.set('sqrt', '**Sqrt**\n\nReturns square root.\n\n```pascal\nfunction Sqrt(x: Real): Real;\n```');
        
        docs.set('sqr', '**Sqr**\n\nReturns square of a number.\n\n```pascal\nfunction Sqr(x: Real): Real;\n```');
        
        docs.set('round', '**Round**\n\nRounds to nearest integer.\n\n```pascal\nfunction Round(x: Real): Integer;\n```');
        
        docs.set('trunc', '**Trunc**\n\nTruncates to integer.\n\n```pascal\nfunction Trunc(x: Real): Integer;\n```');

        // Conversion
        docs.set('inttostr', '**IntToStr**\n\nConverts integer to string.\n\n```pascal\nfunction IntToStr(i: Integer): string;\n```');
        
        docs.set('strtoint', '**StrToInt**\n\nConverts string to integer.\n\n```pascal\nfunction StrToInt(s: string): Integer;\n```');
        
        docs.set('chr', '**Chr**\n\nConverts ordinal value to character.\n\n```pascal\nfunction Chr(x: Byte): Char;\n```');
        
        docs.set('ord', '**Ord**\n\nReturns ordinal value of character.\n\n```pascal\nfunction Ord(c: Char): Integer;\n```');

        // Types
        docs.set('integer', '**Integer**\n\nSigned 32-bit integer type.\n\nRange: -2,147,483,648 to 2,147,483,647');
        docs.set('string', '**String**\n\nDynamic string type (AnsiString in FPC).');
        docs.set('boolean', '**Boolean**\n\nLogical type with values `True` or `False`.');
        docs.set('real', '**Real**\n\nFloating-point number type.');
        docs.set('char', '**Char**\n\nSingle character type.');

        return docs;
    }
}