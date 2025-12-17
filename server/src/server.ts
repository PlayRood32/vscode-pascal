import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    CompletionParams,
    HoverParams,
    DefinitionParams,
    DocumentFormattingParams,
    RenameParams
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { DocumentManager } from './workspace/documentManager';
import { DiagnosticProvider } from './providers/diagnosticProvider';
import { CompletionProvider } from './providers/completionProvider';
import { HoverProvider } from './providers/hoverProvider';
import { DefinitionProvider } from './providers/definitionProvider';
import { Formatter } from './providers/formatter';
import { RefactoringProvider } from './providers/refactoringProvider';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const docManager = new DocumentManager(documents);
const diagProvider = new DiagnosticProvider(docManager);
const completionProvider = new CompletionProvider(docManager);
const hoverProvider = new HoverProvider(docManager);
const definitionProvider = new DefinitionProvider(docManager);
const formatter = new Formatter();
const refactoringProvider = new RefactoringProvider(docManager);

connection.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: { triggerCharacters: ['.', ':', '('] },
            hoverProvider: true,
            definitionProvider: true,
            documentFormattingProvider: true,
            renameProvider: { prepareProvider: false },
            codeActionProvider: true
        }
    };
});

documents.onDidChangeContent(change => {
    const diagnostics = diagProvider.provideDiagnostics(change.document.uri);
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

connection.onCompletion((params: CompletionParams) => completionProvider.provide(params));
connection.onHover((params: HoverParams) => hoverProvider.provide(params));
connection.onDefinition((params: DefinitionParams) => definitionProvider.provide(params));
connection.onDocumentFormatting((params: DocumentFormattingParams) => formatter.format(documents.get(params.textDocument.uri)!, params.options));
connection.onRenameRequest((params: RenameParams) => refactoringProvider.rename(params));

documents.listen(connection);
connection.listen();

connection.onCodeAction((params) => {
    return diagProvider.provideCodeActions(params.textDocument.uri, params.range, params.context.diagnostics);
});