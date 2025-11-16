// C:\Users\Yishay\Desktop\pascal\vscode-pascal\src\intellisense\signatureProvider.ts

import * as vscode from 'vscode';
import { SymbolCache } from '../completion/symbolCache';

interface FunctionSignature {
    label: string;
    parameters: string[];
    documentation?: string;
}

export class SignatureProvider implements vscode.SignatureHelpProvider {
    private symbolCache: SymbolCache;
    private signatures: Map<string, FunctionSignature>;

    constructor(symbolCache: SymbolCache) {
        this.symbolCache = symbolCache;
        this.signatures = this.initializeSignatures();
    }

    public provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.SignatureHelpContext
    ): vscode.SignatureHelp | undefined {
        const line = document.lineAt(position).text;
        const beforeCursor = line.substring(0, position.character);

        // Find function call
        const funcMatch = beforeCursor.match(/(\w+)\s*\([^)]*$/);
        if (!funcMatch) return undefined;

        const funcName = funcMatch[1].toLowerCase();

        // Count parameters
        const afterParen = beforeCursor.substring(beforeCursor.lastIndexOf('(') + 1);
        const paramCount = afterParen ? afterParen.split(',').length - 1 : 0;

        // Check built-in signatures
        const builtInSig = this.signatures.get(funcName);
        if (builtInSig) {
            return this.createSignatureHelp(builtInSig, paramCount);
        }

        // Check cached symbols
        const symbol = this.symbolCache.findSymbol(funcName, document);
        if (symbol && (symbol.kind === 'procedure' || symbol.kind === 'function')) {
            const sig = this.parseSymbolSignature(symbol.detail);
            if (sig) {
                return this.createSignatureHelp(sig, paramCount);
            }
        }

        return undefined;
    }

    private createSignatureHelp(sig: FunctionSignature, activeParam: number): vscode.SignatureHelp {
        const signatureHelp = new vscode.SignatureHelp();
        
        const signature = new vscode.SignatureInformation(sig.label);
        signature.documentation = new vscode.MarkdownString(sig.documentation);
        
        sig.parameters.forEach(param => {
            signature.parameters.push(new vscode.ParameterInformation(param));
        });
        
        signatureHelp.signatures = [signature];
        signatureHelp.activeSignature = 0;
        signatureHelp.activeParameter = Math.min(activeParam, sig.parameters.length - 1);
        
        return signatureHelp;
    }

    private parseSymbolSignature(detail: string): FunctionSignature | undefined {
        const match = detail.match(/^(procedure|function)\s+(\w+)\(([^)]*)\)(?:\s*:\s*(\w+))?/i);
        if (!match) return undefined;

        const [, , name, paramsStr, returnType] = match;
        const params = paramsStr.split(';').map(p => p.trim()).filter(p => p);

        let label = `${name}(${paramsStr})`;
        if (returnType) {
            label += `: ${returnType}`;
        }

        return {
            label,
            parameters: params,
            documentation: detail
        };
    }

    private initializeSignatures(): Map<string, FunctionSignature> {
        const sigs = new Map<string, FunctionSignature>();

        // I/O Functions
        sigs.set('writeln', {
            label: 'WriteLn([text1, text2, ...])',
            parameters: ['text: any'],
            documentation: 'Writes values to console with newline'
        });

        sigs.set('write', {
            label: 'Write([text1, text2, ...])',
            parameters: ['text: any'],
            documentation: 'Writes values to console without newline'
        });

        sigs.set('readln', {
            label: 'ReadLn(var variable)',
            parameters: ['var variable'],
            documentation: 'Reads value from console with newline'
        });

        sigs.set('read', {
            label: 'Read(var variable)',
            parameters: ['var variable'],
            documentation: 'Reads value from console without newline'
        });

        // String Functions
        sigs.set('length', {
            label: 'Length(s: string): Integer',
            parameters: ['s: string'],
            documentation: 'Returns the length of string or array'
        });

        sigs.set('copy', {
            label: 'Copy(s: string; start, length: Integer): string',
            parameters: ['s: string', 'start: Integer', 'length: Integer'],
            documentation: 'Returns substring from position start with given length'
        });

        sigs.set('pos', {
            label: 'Pos(substr, s: string): Integer',
            parameters: ['substr: string', 's: string'],
            documentation: 'Returns position of first occurrence of substr in s, or 0'
        });

        sigs.set('delete', {
            label: 'Delete(var s: string; start, length: Integer)',
            parameters: ['var s: string', 'start: Integer', 'length: Integer'],
            documentation: 'Deletes substring from string'
        });

        sigs.set('insert', {
            label: 'Insert(source: string; var dest: string; index: Integer)',
            parameters: ['source: string', 'var dest: string', 'index: Integer'],
            documentation: 'Inserts source into dest at position index'
        });

        sigs.set('uppercase', {
            label: 'UpperCase(s: string): string',
            parameters: ['s: string'],
            documentation: 'Converts string to uppercase'
        });

        sigs.set('lowercase', {
            label: 'LowerCase(s: string): string',
            parameters: ['s: string'],
            documentation: 'Converts string to lowercase'
        });

        sigs.set('trim', {
            label: 'Trim(s: string): string',
            parameters: ['s: string'],
            documentation: 'Removes leading and trailing whitespace'
        });

        // Math Functions
        sigs.set('abs', {
            label: 'Abs(x: Real): Real',
            parameters: ['x: Real'],
            documentation: 'Returns absolute value'
        });

        sigs.set('sqrt', {
            label: 'Sqrt(x: Real): Real',
            parameters: ['x: Real'],
            documentation: 'Returns square root'
        });

        sigs.set('sqr', {
            label: 'Sqr(x: Real): Real',
            parameters: ['x: Real'],
            documentation: 'Returns square (x * x)'
        });

        sigs.set('sin', {
            label: 'Sin(x: Real): Real',
            parameters: ['x: Real'],
            documentation: 'Returns sine (angle in radians)'
        });

        sigs.set('cos', {
            label: 'Cos(x: Real): Real',
            parameters: ['x: Real'],
            documentation: 'Returns cosine (angle in radians)'
        });

        sigs.set('round', {
            label: 'Round(x: Real): Int64',
            parameters: ['x: Real'],
            documentation: 'Rounds to nearest integer'
        });

        sigs.set('trunc', {
            label: 'Trunc(x: Real): Int64',
            parameters: ['x: Real'],
            documentation: 'Truncates to integer (removes fractional part)'
        });

        // Conversion Functions
        sigs.set('inttostr', {
            label: 'IntToStr(i: Integer): string',
            parameters: ['i: Integer'],
            documentation: 'Converts integer to string'
        });

        sigs.set('strtoint', {
            label: 'StrToInt(s: string): Integer',
            parameters: ['s: string'],
            documentation: 'Converts string to integer'
        });

        sigs.set('floattostr', {
            label: 'FloatToStr(f: Real): string',
            parameters: ['f: Real'],
            documentation: 'Converts floating-point to string'
        });

        sigs.set('strtofloat', {
            label: 'StrToFloat(s: string): Real',
            parameters: ['s: string'],
            documentation: 'Converts string to floating-point'
        });

        sigs.set('chr', {
            label: 'Chr(x: Byte): Char',
            parameters: ['x: Byte'],
            documentation: 'Converts ordinal value to character'
        });

        sigs.set('ord', {
            label: 'Ord(c: Char): Integer',
            parameters: ['c: Char'],
            documentation: 'Returns ordinal value of character'
        });

        // Memory Functions
        sigs.set('new', {
            label: 'New(var p: Pointer)',
            parameters: ['var p: Pointer'],
            documentation: 'Allocates memory for pointer variable'
        });

        sigs.set('dispose', {
            label: 'Dispose(var p: Pointer)',
            parameters: ['var p: Pointer'],
            documentation: 'Frees memory allocated by New'
        });

        sigs.set('getmem', {
            label: 'GetMem(var p: Pointer; size: Integer)',
            parameters: ['var p: Pointer', 'size: Integer'],
            documentation: 'Allocates memory block of given size'
        });

        sigs.set('freemem', {
            label: 'FreeMem(var p: Pointer)',
            parameters: ['var p: Pointer'],
            documentation: 'Frees memory allocated by GetMem'
        });

        return sigs;
    }
}