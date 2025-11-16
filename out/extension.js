"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const diagnosticsProvider_1 = require("./diagnostics/diagnosticsProvider");
const completionProvider_1 = require("./completion/completionProvider");
const formattingProvider_1 = require("./formatting/formattingProvider");
const hoverProvider_1 = require("./hover/hoverProvider");
const signatureProvider_1 = require("./intellisense/signatureProvider");
const definitionProvider_1 = require("./intellisense/definitionProvider");
const codeActionProvider_1 = require("./codeActions/codeActionProvider");
const logger_1 = require("./utils/logger");
const symbolCache_1 = require("./completion/symbolCache");
const node_1 = require("vscode-languageclient/node");
let client;
let diagnosticsProvider;
let symbolCache;
let statusBarItem;
let outputChannel;
function activate(context) {
    logger_1.Logger.log('🚀 Pascal Complete Extension Activating...');
    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel('Pascal Complete');
    context.subscriptions.push(outputChannel);
    logger_1.Logger.setOutputChannel(outputChannel);
    // Initialize status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'pascal.showStatus';
    statusBarItem.text = '$(check) Pascal Ready';
    statusBarItem.tooltip = 'Pascal Complete - Click for details';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Initialize symbol cache
    symbolCache = new symbolCache_1.SymbolCache();
    context.subscriptions.push(symbolCache);
    // Initialize diagnostics provider
    diagnosticsProvider = new diagnosticsProvider_1.DiagnosticsProvider(symbolCache);
    context.subscriptions.push(diagnosticsProvider);
    // Register providers
    registerProviders(context);
    // Register commands
    registerCommands(context);
    // Start LSP if enabled
    startLanguageServer(context);
    // Watch for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('pascal')) {
            handleConfigurationChange();
        }
    }));
    // Initial workspace scan
    scanWorkspace();
    logger_1.Logger.log('✅ Pascal Complete Extension Activated Successfully');
    vscode.window.showInformationMessage('Pascal Complete is ready!');
}
function registerProviders(context) {
    const selector = { language: 'pascal', scheme: 'file' };
    // Completion provider with advanced features
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, new completionProvider_1.CompletionProvider(symbolCache), '.', ':', '(', ' '));
    // Hover provider
    context.subscriptions.push(vscode.languages.registerHoverProvider(selector, new hoverProvider_1.HoverProvider(symbolCache)));
    // Signature help provider
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider(selector, new signatureProvider_1.SignatureProvider(symbolCache), '(', ',', ';'));
    // Definition provider
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, new definitionProvider_1.DefinitionProvider(symbolCache)));
    // Document formatting provider
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(selector, new formattingProvider_1.FormattingProvider()));
    // Code actions provider
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(selector, new codeActionProvider_1.CodeActionProvider(symbolCache), { providedCodeActionKinds: codeActionProvider_1.CodeActionProvider.providedCodeActionKinds }));
    // Document symbol provider
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(selector, {
        provideDocumentSymbols(document) {
            return symbolCache.getDocumentSymbols(document);
        }
    }));
    // Folding range provider
    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(selector, {
        provideFoldingRanges(document) {
            const ranges = [];
            let inBlock = false;
            let blockStart = 0;
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i).text.trim().toLowerCase();
                if (line.includes('begin') || line.includes('record') ||
                    line.includes('class') || line.includes('case')) {
                    blockStart = i;
                    inBlock = true;
                }
                else if (inBlock && (line.includes('end;') || line.includes('end.'))) {
                    ranges.push(new vscode.FoldingRange(blockStart, i));
                    inBlock = false;
                }
            }
            return ranges;
        }
    }));
    logger_1.Logger.log('📦 All language providers registered');
}
function registerCommands(context) {
    const commands = [
        { name: 'pascal.compile', handler: compileFile },
        { name: 'pascal.run', handler: runFile },
        { name: 'pascal.compileAndRun', handler: compileAndRun },
        { name: 'pascal.cleanBuild', handler: cleanBuild },
        { name: 'pascal.formatDocument', handler: formatDocument },
        { name: 'pascal.showStatus', handler: showStatusInfo },
        { name: 'pascal.analyzeFile', handler: analyzeFile },
        { name: 'pascal.showSymbols', handler: showSymbols },
        { name: 'pascal.refreshSymbols', handler: refreshSymbols },
        { name: 'pascal.openDocs', handler: openDocumentation },
        { name: 'pascal.checkSyntax', handler: checkSyntax }
    ];
    commands.forEach(cmd => {
        context.subscriptions.push(vscode.commands.registerCommand(cmd.name, cmd.handler));
    });
    logger_1.Logger.log('⚡ All commands registered');
}
async function compileFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'pascal') {
        vscode.window.showErrorMessage('❌ No Pascal file open');
        return;
    }
    await editor.document.save();
    statusBarItem.text = '$(sync~spin) Compiling...';
    try {
        await diagnosticsProvider.compile(editor.document);
        statusBarItem.text = '$(check) Compiled';
        vscode.window.showInformationMessage('✅ Compilation successful!');
        setTimeout(() => {
            statusBarItem.text = '$(check) Pascal Ready';
        }, 3000);
    }
    catch (error) {
        statusBarItem.text = '$(error) Compile Failed';
        vscode.window.showErrorMessage(`❌ Compilation failed: ${error.message}`);
    }
}
async function runFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'pascal') {
        vscode.window.showErrorMessage('❌ No Pascal file open');
        return;
    }
    const path = require('path');
    const fs = require('fs');
    const baseName = path.basename(editor.document.fileName, '.pas');
    const dirName = path.dirname(editor.document.fileName);
    const ext = process.platform === 'win32' ? '.exe' : '';
    const exePath = path.join(dirName, baseName + ext);
    if (!fs.existsSync(exePath)) {
        const answer = await vscode.window.showWarningMessage('Executable not found. Compile first?', 'Yes', 'No');
        if (answer === 'Yes') {
            await compileFile();
            setTimeout(() => runFile(), 1000);
        }
        return;
    }
    const terminal = vscode.window.createTerminal({
        name: `Pascal: ${baseName}`,
        cwd: dirName
    });
    terminal.show();
    terminal.sendText(process.platform === 'win32' ? `"${exePath}"` : `./${baseName}`);
}
async function compileAndRun() {
    await compileFile();
    setTimeout(() => runFile(), 800);
}
async function cleanBuild() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'pascal') {
        vscode.window.showErrorMessage('❌ No Pascal file open');
        return;
    }
    const path = require('path');
    const fs = require('fs');
    const baseName = path.basename(editor.document.fileName, '.pas');
    const dirName = path.dirname(editor.document.fileName);
    const filesToDelete = [
        path.join(dirName, baseName + '.o'),
        path.join(dirName, baseName + '.ppu'),
        path.join(dirName, baseName + (process.platform === 'win32' ? '.exe' : ''))
    ];
    let deleted = 0;
    for (const file of filesToDelete) {
        if (fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
                deleted++;
            }
            catch (error) {
                logger_1.Logger.log(`Failed to delete ${file}: ${error}`);
            }
        }
    }
    vscode.window.showInformationMessage(`🗑️ Cleaned ${deleted} file(s)`);
}
async function formatDocument() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'pascal') {
        await vscode.commands.executeCommand('editor.action.formatDocument');
    }
}
function showStatusInfo() {
    const config = vscode.workspace.getConfiguration('pascal');
    const symbolCount = symbolCache.getSymbolCount();
    const info = `
**Pascal Complete Status**

📊 **Statistics:**
- Cached Symbols: ${symbolCount}
- Active Documents: ${vscode.workspace.textDocuments.filter(d => d.languageId === 'pascal').length}

⚙️ **Configuration:**
- Compiler: ${config.get('compilerPath', 'fpc')}
- Mode: ${config.get('compilerMode', 'FPC')}
- Real-time Checks: ${config.get('syntaxCheckOnChange') ? '✔' : '✗'}
- Auto-Semicolon: ${config.get('autoSemicolon') ? '✔' : '✗'}
- LSP: ${config.get('lspEnabled') ? '✔' : '✗'}
- Format on Save: ${config.get('formatOnSave') ? '✔' : '✗'}
    `.trim();
    const panel = vscode.window.createWebviewPanel('pascalStatus', 'Pascal Complete Status', vscode.ViewColumn.One, {});
    panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                }
                h2 { color: var(--vscode-textLink-foreground); }
                pre { 
                    background: var(--vscode-textBlockQuote-background);
                    padding: 15px;
                    border-radius: 5px;
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            <h2>Pascal Complete Status</h2>
            <pre>${info}</pre>
        </body>
        </html>
    `;
}
async function analyzeFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'pascal') {
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Analyzing Pascal file...",
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0 });
        await symbolCache.refreshDocument(editor.document);
        progress.report({ increment: 50 });
        await diagnosticsProvider.checkSyntax(editor.document);
        progress.report({ increment: 100 });
        vscode.window.showInformationMessage('✅ Analysis complete!');
    });
}
function showSymbols() {
    const symbols = symbolCache.getAllSymbols();
    const items = symbols.map(sym => ({
        label: sym.name,
        description: sym.kind,
        detail: sym.detail
    }));
    vscode.window.showQuickPick(items, {
        placeHolder: 'Search symbols...'
    });
}
async function refreshSymbols() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'pascal') {
        await symbolCache.refreshDocument(editor.document);
        vscode.window.showInformationMessage('🔄 Symbols refreshed');
    }
}
function openDocumentation() {
    vscode.env.openExternal(vscode.Uri.parse('https://github.com/PlayRood32/vscode-pascal'));
}
async function checkSyntax() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'pascal') {
        await diagnosticsProvider.checkSyntax(editor.document);
    }
}
function startLanguageServer(_context) {
    const config = vscode.workspace.getConfiguration('pascal');
    if (!config.get('lspEnabled', true)) {
        logger_1.Logger.log('LSP disabled in configuration');
        return;
    }
    try {
        const serverOptions = {
            command: 'pasls',
            args: []
        };
        const clientOptions = {
            documentSelector: [{ scheme: 'file', language: 'pascal' }],
            synchronize: {
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{pas,pp,inc}')
            }
        };
        client = new node_1.LanguageClient('pascalLanguageServer', 'Pascal Language Server', serverOptions, clientOptions);
        client.start();
        logger_1.Logger.log('🔌 Language Server started');
    }
    catch (error) {
        logger_1.Logger.log(`Failed to start LSP: ${error}`);
    }
}
function handleConfigurationChange() {
    logger_1.Logger.log('⚙️ Configuration changed, reloading...');
    vscode.window.showInformationMessage('Pascal settings updated. Some changes require reload.');
}
async function scanWorkspace() {
    const files = await vscode.workspace.findFiles('**/*.{pas,pp}', '**/node_modules/**', 100);
    logger_1.Logger.log(`🔍 Found ${files.length} Pascal files in workspace`);
    for (const file of files) {
        try {
            const document = await vscode.workspace.openTextDocument(file);
            await symbolCache.refreshDocument(document);
        }
        catch (error) {
            logger_1.Logger.log(`Error scanning ${file.fsPath}: ${error}`);
        }
    }
}
function deactivate() {
    logger_1.Logger.log('👋 Pascal Complete Extension Deactivating...');
    if (client) {
        return client.stop();
    }
    return undefined;
}
//# sourceMappingURL=extension.js.map