# Pascal Language Server

Professional Pascal language support for Visual Studio Code with Language Server Protocol (LSP).

**Repository:** https://github.com/PlayRood32/vscode-pascal

## 🚀 Features

### ✅ Working Features

#### **IntelliSense**
- **Smart code completion** with context awareness
- **Built-in functions** (WriteLn, ReadLn, Length, Copy, etc.)
- **Built-in types** (Integer, String, Boolean, etc.)
- **User symbols** from your code
- **Trigger characters** (`.`, `:`, `(`)

#### **Hover Documentation**
- Hover over symbols to see documentation
- Type information
- Parameter details
- Built-in function documentation

#### **Go to Definition**
- Navigate to symbol definitions
- Works across files
- Supports procedures, functions, types, variables

#### **Rename Symbol**
- Rename across the current file

#### **Diagnostics**
- Real-time error checking with red squiggles
- Undeclared identifiers
- Mismatched `begin`/`end`
- Missing semicolons
- Quick fixes (Ctrl+.) – declare variable or add semicolon

#### **Syntax Highlighting**
- Complete Pascal syntax support
- Keywords, operators, types
- Strings, comments, numbers
- Compiler directives

#### **Code Formatting**
- Basic auto-indentation for blocks

#### **Code Snippets**
- 30+ ready-to-use snippets
- Program templates with automatic filename insertion
- Variable declarations, constants, control structures

#### **Document Symbols**
- Outline view
- Quick navigation
- Symbol hierarchy

### 🏗️ Architecture

This extension uses **Language Server Protocol (LSP)**:
- **Client**: VS Code extension (thin client)
- **Server**: Separate LSP server process
  - **Lexer**: Tokenization
  - **Parser**: AST generation
  - **Semantic Analysis**: Symbol resolution
  - **Providers**: Completion, Hover, Definition, Diagnostics, Rename

## 📦 Installation

### Prerequisites

Install Free Pascal Compiler (optional for future features):

**Windows:**
```powershell
winget install --id FreePascal.FreePascalCompiler -e
```

**macOS:**
```bash
brew install fpc
```

**Linux:**
```bash
sudo apt install fpc  # Ubuntu/Debian
sudo pacman -S fpc    # Arch btw
```

### Install Extension

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Pascal Language Server"
4. Click Install

Or install from VSIX:
```bash
code --install-extension pascal-language-server-1.0.0.vsix
```

## 🎯 Usage

### Basic Example

```pascal
program HelloWorld;

uses
  SysUtils;

var
  name: String;

begin
  WriteLn('Enter your name:');
  ReadLn(name);
  WriteLn('Hello, ', name, '!');
end.
```

### Features in Action

#### 1. Code Completion
Type `Wri` and press `Ctrl+Space`:
- ✅ WriteLn
- ✅ Write

#### 2. Hover Documentation
Hover over `WriteLn`:
```
WriteLn(text)
Writes values to output with newline.
```

#### 3. Go to Definition
Click on a function name + `F12`:
- Jumps to its declaration

#### 4. Document Outline
View all symbols in current file in Explorer sidebar.

## ⚙️ Configuration

```json
{
  "pascal.trace.server": "off"
}
```

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `pascal.trace.server` | string | `"off"` | LSP trace level |


📋 Full List of Code Snippets (click to expand)


## 🔧 Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/PlayRood32/vscode-pascal
cd vscode-pascal

# Install dependencies
npm install

# Compile
npm run compile

# Package
npm run package
```

### Project Structure

```
vscode-pascal/
├── client/                    # VS Code Extension
│   ├── src/
│   │   └── extension.ts
│   ├── package.json
│   └── tsconfig.json
├── server/                    # Language Server (LSP)
│   ├── src/
│   │   ├── server.ts
│   │   ├── parser/
│   │   │   ├── lexer.ts
│   │   │   ├── parser.ts
│   │   │   └── ast.ts
│   │   ├── analyzer/
│   │   │   └── symbolTable.ts
│   │   ├── providers/
│   │   │   ├── completionProvider.ts
│   │   │   ├── hoverProvider.ts
│   │   │   ├── definitionProvider.ts
│   │   │   ├── diagnosticProvider.ts
│   │   │   ├── formatter.ts
│   │   │   └── refactoringProvider.ts
│   │   └── workspace/
│   │       └── documentManager.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/                    # Shared code
│   └── src/
│       └── types.ts
├── syntaxes/
│   └── pascal.tmLanguage.json
├── snippets/
│   └── snippets.json
└── package.json              # Root package.json
```

### Debug

1. Open project in VS Code
2. Press `F5`
3. Choose "Run Extension"
4. New VS Code window opens with extension loaded

## 🐛 Known Limitations

- Multi-file symbol resolution limited
- Advanced refactoring planned
- FPC integration for diagnostics coming soon

## 🗺️ Roadmap

### Version 1.1
- [ ] Multi-file support improvements
- [ ] Type inference
- [ ] Member completion enhancements

### Version 1.2
- [ ] Advanced code formatting
- [ ] Refactoring actions
- [ ] Find all references

### Version 2.0
- [ ] FPC integration for diagnostics
- [ ] Project support (.dpr, .lproj)
- [ ] Debug adapter

## 🤝 Contributing

Contributions welcome! Fork and submit pull requests.

## 📄 License

MIT License – see [LICENSE](LICENSE)

## 👨‍💻 Author

**Yishay Oved (PlayRood)**  
GitHub: [@PlayRood32](https://github.com/PlayRood32)

---

**Built with ❤️ for the Pascal community**