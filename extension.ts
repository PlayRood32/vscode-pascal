import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let diagnosticCollection: vscode.DiagnosticCollection;
let debounceTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    // LSP for pascal-language-server (full support for libraries, user code, real-time) - only for Pascal
    const serverOptions: ServerOptions = {
        command: 'pascal-language-server',
        args: []
    };
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'pascal' }],
        synchronize: {
            configurationSection: 'pascal'
        },
        outputChannelName: 'Pascal LSP'
    };
    try {
        client = new LanguageClient('pascalLSP', 'Pascal LSP', serverOptions, clientOptions);
        client.start().then(() => {
            vscode.window.showInformationMessage('Pascal LSP started – full support for libraries and real-time diagnostics.');
        });
    } catch (error) {
        vscode.window.showWarningMessage('Pascal LSP not found. Install from https://github.com/genericptr/pascal-language-server for full features.');
    }

    // Diagnostics collection (only for Pascal files)
    diagnosticCollection = vscode.languages.createDiagnosticCollection('pascal');
    context.subscriptions.push(diagnosticCollection);

    // Real-time syntax check on change (debounce 500ms, backup for LSP) - only Pascal
    const checkOnChange = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'pascal') {
            debouncedCheckSyntax(event);
        }
    });
    context.subscriptions.push(checkOnChange);

    // On save as fallback - only Pascal
    if (vscode.workspace.getConfiguration('pascal').get('syntaxCheckOnSave')) {
        const onSave = vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.languageId === 'pascal') {
                checkSyntax(doc);
            }
        });
        context.subscriptions.push(onSave);
    }

    // Commands - only for Pascal files
    context.subscriptions.push(vscode.commands.registerCommand('pascal.compile', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'pascal') {
            vscode.window.showErrorMessage('No Pascal file open.');
            return;
        }
        compileFile();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('pascal.run', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'pascal') {
            vscode.window.showErrorMessage('No Pascal file open.');
            return;
        }
        runFile();
    }));

    // Tasks Provider - only Pascal
    context.subscriptions.push(vscode.tasks.registerTaskProvider('pascal', {
        provideTasks: () => {
            return [new vscode.Task({ type: 'pascal' }, vscode.TaskScope.Workspace, 'Compile', 'Pascal', new vscode.ShellExecution('fpc ${file}'))];
        },
        resolveTask: (task) => task
    }));

    // Formatting Provider (improved for full Pascal, generics, attributes)
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('pascal', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            if (document.languageId !== 'pascal') return []; // Strict to Pascal
            const edits: vscode.TextEdit[] = [];
            const indentSize = vscode.workspace.getConfiguration('pascal').get<number>('indentSize', 2);
            const insertSpaces = vscode.workspace.getConfiguration('pascal').get<boolean>('insertSpaces', true);
            const tab = insertSpaces ? ' '.repeat(indentSize) : '\t';
            let level = 0;
            const lines = document.getText().split('\n');
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                let trimmedLine = line.replace(/\{.*?\}|\(\*.*?\*\)/g, '').replace(/\[[^\]]*\]/g, ''); // Ignore comments and attributes
                // Decrease indent
                if (/^(end|until|else|od|fi|except|finally);?$/.test(trimmedLine) || trimmedLine.match(/^\w+\s*:\s*(end|until|else)/)) {
                    level = Math.max(0, level - 1);
                }
                // Current indent
                const fullLine = lines[i];
                const currentIndentMatch = fullLine.match(/^\s*/);
                const currentIndent = currentIndentMatch ? currentIndentMatch[0].length : 0;
                const expectedIndent = (tab.repeat(level)).length;
                if (currentIndent !== expectedIndent) {
                    edits.push(vscode.TextEdit.replace(new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, currentIndent)), tab.repeat(level)));
                }
                // Increase indent (full Pascal blocks, generics, attributes)
                if (/^(begin|record|class|object|interface|case|repeat|try|procedure|function|constructor|destructor|if|for|while)/.test(trimmedLine) ||
                    trimmedLine.match(/:\s*(array|set|record|class<)/) ||
                    trimmedLine.match(/\bgeneric\b/) ||
                    trimmedLine.match(/^\[.*\]/)) { // Attributes
                    level++;
                }
            }
            return edits;
        }
    }));

    // Format on save - only Pascal
    if (vscode.workspace.getConfiguration('pascal').get('formatOnSave')) {
        const onWillSave = vscode.workspace.onWillSaveTextDocument((e) => {
            if (e.document.languageId === 'pascal') {
                vscode.commands.executeCommand('editor.action.formatDocument');
            }
        });
        context.subscriptions.push(onWillSave);
    }

    // Completion provider (learns from user libraries via LSP fallback) - only Pascal
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('pascal', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            if (document.languageId !== 'pascal') return undefined;
            // Fallback symbols from document (for user vars/functions)
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.match(/uses\s*$/)) return undefined;
            const symbols = [];
            const regex = /(?:procedure|function)\s+(\w+)/g;
            let match;
            while ((match = regex.exec(document.getText()))) {
                symbols.push(new vscode.CompletionItem(match[1], vscode.CompletionItemKind.Function));
            }
            return symbols;
        }
    }, ' '));

    // Symbol Provider (full for Pascal)
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider('pascal', {
        provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
            if (document.languageId !== 'pascal') return [];
            const symbols: vscode.DocumentSymbol[] = [];
            const lines = document.getText().split('\n');
            lines.forEach((line, i) => {
                const procMatch = line.match(/(?i:procedure|function)\s+(\w+)/);
                if (procMatch) {
                    symbols.push(new vscode.DocumentSymbol(procMatch[1], '', vscode.SymbolKind.Function, new vscode.Range(i, 0, i, line.length), new vscode.Range(i, 0, i, line.length)));
                }
            });
            return symbols;
        }
    }));
}

export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

function debouncedCheckSyntax(event: vscode.TextDocumentChangeEvent) {
    if (event.document.languageId !== 'pascal') return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => checkSyntax(event.document), 500); // Debounce 500ms for real-time
}

function checkSyntax(document: vscode.TextDocument) {
    if (document.languageId !== 'pascal') return; // Strict to Pascal
    diagnosticCollection.clear();
    const file = document.fileName;
    const compiler = vscode.workspace.getConfiguration('pascal').get<string>('compilerPath', 'fpc');
    const options = vscode.workspace.getConfiguration('pascal').get<string[]>('compilerOptions', []);
    const showWarnings = vscode.workspace.getConfiguration('pascal').get<boolean>('showWarnings', true);
    const showHints = vscode.workspace.getConfiguration('pascal').get<boolean>('showHints', false);
    const mode = getModeFlag();
    const extra = [];
    if (showWarnings) extra.push('-vw');
    if (showHints) extra.push('-vh');
    const cmd = `${compiler} -vn ${extra.join(' ')} ${options.join(' ')} ${mode} ${file}`;
    const cwd = path.dirname(file);
    child_process.exec(cmd, { cwd }, (err, stdout, stderr) => {
        if (err) {
            vscode.window.showErrorMessage(`Syntax check error: ${err.message}`);
            return;
        }
        const diagnostics: vscode.Diagnostic[] = [];
        const errorLines = stderr.split('\n').filter(line => line.trim());
        let currentError: { line?: number, col?: number, severity?: string, msg: string } = { msg: '' };
        errorLines.forEach(line => {
            const match = line.match(/^(.*)\((\d+),(\d+)\)\s+(Fatal|Error|Warning|Hint|Note):\s+(.*)$/);
            if (match) {
                if (currentError.msg) {
                    addDiagnostic(currentError, diagnostics, document.uri);
                }
                currentError = {
                    line: Number(match[2]) - 1,
                    col: Number(match[3]) - 1,
                    severity: match[4],
                    msg: match[5]
                };
            } else if (currentError.msg && line.trim()) {
                currentError.msg += ' ' + line.trim();
            }
        });
        if (currentError.msg) addDiagnostic(currentError, diagnostics, document.uri);
        diagnosticCollection.set(document.uri, diagnostics); // Underline errors in real-time (red line, Problems panel)
    });
}

function addDiagnostic(err: any, diagnostics: vscode.Diagnostic[], uri: vscode.Uri) {
    if (err.line !== undefined && err.col !== undefined) {
        const severity = err.severity === 'Error' || err.severity === 'Fatal' ? vscode.DiagnosticSeverity.Error :
                         err.severity === 'Warning' ? vscode.DiagnosticSeverity.Warning :
                         vscode.DiagnosticSeverity.Information;
        const range = new vscode.Range(err.line, err.col, err.line, err.col + err.msg.length);
        diagnostics.push(new vscode.Diagnostic(range, err.msg, severity));
    }
}

function compileFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'pascal') {
        vscode.window.showErrorMessage('No Pascal file open.');
        return;
    }
    const file = editor.document.fileName;
    const compiler = vscode.workspace.getConfiguration('pascal').get<string>('compilerPath', 'fpc');
    const options = vscode.workspace.getConfiguration('pascal').get<string[]>('compilerOptions', []);
    const mode = getModeFlag();
    const cmd = `${compiler} ${options.join(' ')} ${mode} ${file}`;
    const cwd = path.dirname(file);
    child_process.exec(cmd, { cwd }, (err, stdout, stderr) => {
        if (err) {
            vscode.window.showErrorMessage(`Compile error: ${err.message || stderr}`);
            return;
        }
        vscode.window.showInformationMessage('Compiled successfully');
    });
}

function runFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'pascal') {
        vscode.window.showErrorMessage('No Pascal file open.');
        return;
    }
    const fileBase = path.basename(editor.document.fileName, '.pas');
    const outputPath = vscode.workspace.getConfiguration('pascal').get<string>('outputPath', path.dirname(editor.document.fileName));
    const exeExt = vscode.workspace.getConfiguration('pascal').get<string>('exeExt', process.platform === 'win32' ? '.exe' : '');
    const exe = path.join(outputPath, fileBase + exeExt);
    const cwd = outputPath;
    const shellExec = new vscode.ShellExecution(exe, { cwd });
    vscode.tasks.executeTask(new vscode.Task({ type: 'shell' }, vscode.TaskScope.Workspace, 'Run', 'Pascal', shellExec)).then(() => {
        // Handle task errors if needed
    }, (err) => {
        vscode.window.showErrorMessage(`Run error: ${err}`);
    });
}

function getModeFlag(): string {
    const mode = vscode.workspace.getConfiguration('pascal').get<string>('compilerMode', 'FPC');
    switch (mode) {
        case 'Delphi': return '-Mdelphi';
        case 'TP': return '-Mtp';
        case 'MacPas': return '-Mmacpas';
        case 'ISO': return '-Miso';
        default: return '-Mfpc';
    }
}