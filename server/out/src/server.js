"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const documentManager_1 = require("./workspace/documentManager");
const diagnosticProvider_1 = require("./providers/diagnosticProvider");
const completionProvider_1 = require("./providers/completionProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const definitionProvider_1 = require("./providers/definitionProvider");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
const docManager = new documentManager_1.DocumentManager(documents);
const diagProvider = new diagnosticProvider_1.DiagnosticProvider(docManager);
const completionProvider = new completionProvider_1.CompletionProvider(docManager);
const hoverProvider = new hoverProvider_1.HoverProvider(docManager);
const definitionProvider = new definitionProvider_1.DefinitionProvider(docManager);
connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
        completionProvider: { triggerCharacters: ['.', ':', '('] },
        hoverProvider: true,
        definitionProvider: true
    }
}));
documents.onDidChangeContent(change => {
    const diagnostics = diagProvider.getDiagnostics(change.document.uri);
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});
connection.onCompletion(params => completionProvider.provide(params));
connection.onHover(params => hoverProvider.provide(params));
connection.onDefinition(params => definitionProvider.provide(params));
documents.listen(connection);
connection.listen();
//# sourceMappingURL=server.js.map