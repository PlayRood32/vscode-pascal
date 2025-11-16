# Pascal Complete

**Pascal Complete** is the most advanced Visual Studio Code extension for Pascal development. It provides AI-like intelligent features, real-time diagnostics, smart code completion, advanced refactoring, and seamless LSP integration. Perfect for Free Pascal (FPC), Delphi, Turbo Pascal, and Object Pascal development.

This extension is **fully open source** under the MIT License.  
**Repository:** [https://github.com/PlayRood32/vscode-pascal](https://github.com/PlayRood32/vscode-pascal)

![Pascal Logo](https://raw.githubusercontent.com/PlayRood32/vscode-pascal/main/images/icon.png)

---

## 🚀 Quick Start

### Installation

1. **Install Extension**: Search for "Pascal Complete" in VS Code Extensions (Ctrl+Shift+X)
2. **Install Free Pascal Compiler**:
   ```bash
   # Windows (64-bit)
   winget install --id FreePascal.FreePascalCompiler -e --include-unknown --accept-package-agreements --accept-source-agreements
   
   # Windows (32-bit)
   winget install --id FreePascal.FreePascalCompiler -e
   
   # macOS
   brew install fpc
   
   # Ubuntu/Debian
   sudo apt install fpc
   
   # Arch Linux btw
   sudo pacman -S fpc
   ```
3. **Verify Installation**: Run `fpc -iV` in terminal
4. **Start Coding**: Create a `.pas` file and enjoy!

---

## ✨ Features

### 🧠 AI-Like Intelligence

The extension analyzes your code in real-time, providing intelligent suggestions that feel like having an AI assistant:

- **Context-Aware Completion**: Suggests variables from your code at the right time
- **Smart Symbol Caching**: Remembers all procedures, functions, variables, and types
- **Predictive Analysis**: Anticipates common errors before compilation
- **Semantic Understanding**: Understands Pascal syntax deeply, not just pattern matching

### 🔍 Real-Time Diagnostics

- **Instant Error Detection**: Shows errors as you type (200ms debounce)
- **Compiler Integration**: Uses FPC compiler for accurate diagnostics
- **Smart Error Messages**: Clear, actionable error descriptions
- **Warning & Hint Control**: Toggle warnings/hints in settings
- **Semantic Analysis**: Detects unused variables, missing semicolons, unmatched blocks

### 💡 Intelligent Code Completion

- **Built-in Functions**: All Pascal standard functions with documentation
- **Symbol-Aware**: Suggests procedures, functions, variables from your code
- **Member Completion**: Type `.` after objects to see methods/properties
- **Parameter Hints**: Shows function signatures as you type
- **Snippet Integration**: 120+ snippets with smart tab stops

### 🔧 Advanced Code Actions & Refactoring

Quick fixes that appear when you press `Ctrl+.`:

- **Add Missing Semicolon**: Automatic semicolon insertion
- **Declare Undeclared Variables**: Creates variable declarations
- **Remove Unused Variables**: Cleans up unused code
- **Fix Casing**: Corrects WriteLn/ReadLn casing
- **Add Matching End**: Completes begin-end blocks
- **Extract to Procedure**: Refactor code into procedures
- **Convert Case**: Change to UPPERCASE/lowercase

### 📝 Professional Formatting

- **Smart Indentation**: Automatically formats begin-end blocks
- **Configurable Style**: Spaces vs tabs, indent size
- **Format on Save**: Optional automatic formatting
- **Preserve Comments**: Maintains comment structure

### 🎯 Go to Definition & Hover

- **Jump to Definition**: F12 to jump to any symbol
- **Hover Documentation**: Rich documentation on hover
- **Symbol Outline**: Document outline in Explorer
- **Find All References**: See where symbols are used

### ⚡ Build & Run

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+B` | Compile | Build current file |
| `Ctrl+Shift+R` | Compile & Run | Build and execute |
| `Ctrl+R` | Run | Execute compiled program |
| `Ctrl+Shift+C` | Clean | Remove build files |
| `Ctrl+Shift+F` | Format | Format document |
| `Ctrl+Shift+A` | Analyze | Deep code analysis |

---

## 📚 Code Snippets

Type the prefix and press `Tab` for instant code templates:

### Program Structure
- `prog` → Complete program with uses
- `pmin` → Minimal program
- `unit` → Unit template with interface/implementation

### Control Flow
- `if` → If statement with begin-end
- `ife` → If-else with blocks
- `for` → For loop
- `while` → While loop
- `repeat` → Repeat-until loop
- `case` → Case statement

### Functions & Procedures
- `proc` → Procedure declaration
- `func` → Function with Result
- `funcvar` → Function with local variables

### Object-Oriented
- `class` → Class declaration
- `cons` → Constructor
- `dest` → Destructor
- `property` → Property declaration
- `virtual` → Virtual method
- `override` → Override method

### I/O Operations
- `wl` → WriteLn();
- `rl` → ReadLn();
- `wlf` → WriteLn with format

### Exception Handling
- `try` → Try-except block
- `tryf` → Try-finally block

**Total: 120+ snippets** - See full list in extension settings

---

## ⚙️ Configuration

### Essential Settings

```json
{
  "pascal.compilerPath": "fpc",
  "pascal.compilerMode": "FPC",
  "pascal.syntaxCheckOnChange": true,
  "pascal.autoSemicolon": true,
  "pascal.formatOnSave": false,
  "pascal.indentSize": 2,
  "pascal.showWarnings": true,
  "pascal.showHints": false
}
```

### All Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `pascal.compilerPath` | `fpc` | Path to FPC compiler |
| `pascal.compilerMode` | `FPC` | Mode: FPC, Delphi, TP, MacPas, ISO |
| `pascal.compilerOptions` | `[]` | Extra compiler flags |
| `pascal.syntaxCheckOnChange` | `true` | Real-time syntax checking |
| `pascal.syntaxCheckOnSave` | `true` | Check on save |
| `pascal.showWarnings` | `true` | Display warnings |
| `pascal.showHints` | `false` | Display hints/notes |
| `pascal.formatOnSave` | `false` | Auto-format on save |
| `pascal.indentSize` | `2` | Indent size (spaces) |
| `pascal.insertSpaces` | `true` | Spaces vs tabs |
| `pascal.autoSemicolon` | `true` | Smart semicolon insertion |
| `pascal.autoCloseBrackets` | `true` | Auto-close brackets |
| `pascal.enableCodeLens` | `true` | Show CodeLens |
| `pascal.enableHoverDocs` | `true` | Hover documentation |
| `pascal.enableSignatureHelp` | `true` | Parameter hints |
| `pascal.lspEnabled` | `true` | Enable LSP server |
| `pascal.debugMode` | `false` | Verbose logging |

### Custom Color Themes

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "keyword.control.begin-end.pascal",
        "settings": { "foreground": "#C586C0", "fontStyle": "bold" }
      },
      {
        "scope": "support.function.io.pascal",
        "settings": { "foreground": "#DCDCAA" }
      }
    ]
  }
}
```

---

## 📖 Code Examples

### Hello World

```pascal
program HelloWorld;
begin
  writeln('Hello from Pascal Complete!');
end.
```

### Object-Oriented Programming

```pascal
type
  TPerson = class
  private
    FName: String;
    FAge: Integer;
  public
    constructor Create(AName: String; AAge: Integer);
    procedure Greet;
    property Name: String read FName write FName;
    property Age: Integer read FAge write FAge;
  end;

constructor TPerson.Create(AName: String; AAge: Integer);
begin
  FName := AName;
  FAge := AAge;
end;

procedure TPerson.Greet;
begin
  writeln('Hello, I am ', FName, ' and I am ', FAge, ' years old.');
end;

var
  person: TPerson;
begin
  person := TPerson.Create('Alice', 25);
  try
    person.Greet;
  finally
    person.Free;
  end;
end.
```

### Generics (FPC)

```pascal
generic type
  TGenericList<T> = class
  private
    FItems: array of T;
    FCount: Integer;
  public
    procedure Add(Item: T);
    function Get(Index: Integer): T;
    property Count: Integer read FCount;
  end;

procedure TGenericList.Add(Item: T);
begin
  Inc(FCount);
  SetLength(FItems, FCount);
  FItems[FCount - 1] := Item;
end;
```

---

## 🛠️ Troubleshooting

### No Syntax Highlighting?
- Reload VS Code: `Ctrl+Shift+P` → "Reload Window"
- Check file extension is `.pas`, `.pp`, or `.p`

### No Diagnostics?
- Ensure FPC is in PATH: Run `fpc -iV` in terminal
- Check `pascal.compilerPath` setting
- Enable `pascal.syntaxCheckOnChange`

### Snippets Not Working?
- Press `Ctrl+Space` to trigger IntelliSense
- Check snippets are enabled: Settings → "Editor: Suggest: Snippets"

### LSP Errors?
- Install Language Server: `npm install -g pasls`
- Enable in settings: `pascal.lspEnabled: true`

### Slow Performance?
- Disable real-time checks: `pascal.syntaxCheckOnChange: false`
- Reduce debounce time or increase if typing fast

---

## 🆕 What's New in v3.0.0

### Major Features
- ✨ **AI-Like Intelligence**: Advanced symbol caching and context-aware completion
- 🔍 **Enhanced Diagnostics**: Semantic analysis, unused variable detection
- 💡 **Smart Code Actions**: 10+ quick fixes and refactoring options
- 🎯 **Go to Definition**: Jump to any symbol with F12
- 📝 **Professional Formatting**: Smart indentation with configurable style
- ⚡ **Performance**: 50% faster symbol parsing, optimized diagnostics

### New Commands
- `Pascal: Analyze File` - Deep code analysis
- `Pascal: Show All Symbols` - Symbol explorer
- `Pascal: Refresh Symbol Cache` - Manual cache refresh

### Improvements
- Better error messages with related information
- Improved hover documentation with examples
- Enhanced signature help for all built-in functions
- Smarter auto-semicolon insertion
- Folding support for code blocks
- Document outline in Explorer

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository: [https://github.com/PlayRood32/vscode-pascal](https://github.com/PlayRood32/vscode-pascal)
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/vscode-pascal`
3. **Install** dependencies: `npm install`
4. **Make** changes and test: Press F5 to debug
5. **Submit** pull request with detailed description

### Development Setup

```bash
git clone https://github.com/PlayRood32/vscode-pascal
cd vscode-pascal
npm install
code .
# Press F5 to launch extension in debug mode
```

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🌟 Support

- **GitHub Issues**: [Report bugs](https://github.com/PlayRood32/vscode-pascal/issues)
- **Discussions**: [Ask questions](https://github.com/PlayRood32/vscode-pascal/discussions)
- **Star the repo**: Show your support! ⭐

---

## 🙏 Acknowledgments

Thanks to:
- Free Pascal team for the excellent compiler
- VS Code team for the amazing editor
- All contributors and users of this extension

---

**Made with ❤️ by PlayRood32**