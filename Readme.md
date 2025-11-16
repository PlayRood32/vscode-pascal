להלן גרסה מסודרת ל-README, נקייה, קריאה וברורה — ללא תוספות מיותרות, רק תוכן מאורגן היטב.
אתה יכול להעתיק ולהדביק ישירות כ-`README.md`.

---

````markdown
# Pascal Complete

Pascal Complete is a powerful Visual Studio Code extension for modern Pascal development. It offers intelligent code completions, real-time diagnostics, refactoring tools, and full integration with Free Pascal, Delphi, Turbo Pascal, and Object Pascal.

**Repository:** https://github.com/PlayRood32/vscode-pascal

![Pascal Complete](https://raw.githubusercontent.com/PlayRood32/vscode-pascal/main/images/icon.png)

---

## 🚀 Quick Start

### Installation

1. Install the extension from VS Code (`Ctrl+Shift+X`) → search **Pascal Complete**.
2. Install Free Pascal Compiler (required for building and diagnostics):

**Windows (64-bit):**
```powershell
winget install --id FreePascal.FreePascalCompiler -e --include-unknown --accept-package-agreements --accept-source-agreements
````

**Windows (32-bit):**

```powershell
winget install --id FreePascal.FreePascalCompiler -e
```

**macOS:**

```bash
brew install fpc
```

**Ubuntu/Debian:**

```bash
sudo apt install fpc
```

**Arch Linux:**

```bash
sudo pacman -S fpc
```

3. Verify installation:
   `fpc -iV`

4. Create a `.pas` file and start coding.

---

## ✨ Features

### Intelligence

* Context-aware code completion
* Smart symbol caching
* Predictive analysis
* Semantic understanding of Pascal code

### Diagnostics

* Real-time error detection
* Compiler-accurate messages
* Warnings and hints support
* Semantic checks (unused variables, missing blocks, etc.)

### Code Completion

* Built-in functions with docs
* Member completion with `.`
* Parameter hints
* 120+ Pascal snippets

### Refactoring & Code Actions

* Add missing semicolon
* Declare variables
* Remove unused variables
* Add missing `end`
* Extract procedure
* Casing fixes

### Navigation

* Go to Definition (F12)
* Hover documentation
* Symbol outline
* Find references

### Build & Run

| Shortcut     | Action        |
| ------------ | ------------- |
| Ctrl+Shift+B | Compile       |
| Ctrl+Shift+R | Compile & Run |
| Ctrl+R       | Run           |
| Ctrl+Shift+C | Clean         |
| Ctrl+Shift+F | Format        |
| Ctrl+Shift+A | Analyze       |

---

## 📚 Snippets

### Control Flow

`if`, `ife`, `for`, `while`, `repeat`, `case`

### Program Structure

`prog`, `pmin`, `unit`

### Functions & Procedures

`proc`, `func`, `funcvar`

### OOP

`class`, `cons`, `dest`, `virtual`, `override`, `property`

### I/O

`wl`, `rl`, `wlf`

### Exceptions

`try`, `tryf`

Total: **120+ snippets**

---

## ⚙️ Configuration

### Basic Settings

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

### Full Settings Table

| Setting                    | Description        |
| -------------------------- | ------------------ |
| pascal.compilerPath        | Path to FPC        |
| pascal.compilerMode        | FPC/Delphi/TP/etc. |
| pascal.compilerOptions     | Extra flags        |
| pascal.syntaxCheckOnChange | Real-time checks   |
| pascal.syntaxCheckOnSave   | Check on save      |
| pascal.showWarnings        | Show warnings      |
| pascal.showHints           | Show hints         |
| pascal.formatOnSave        | Format on save     |
| pascal.indentSize          | Indent size        |
| pascal.insertSpaces        | Spaces/tabs        |
| pascal.autoSemicolon       | Auto semicolon     |
| pascal.autoCloseBrackets   | Auto brackets      |
| pascal.enableCodeLens      | CodeLens           |
| pascal.enableHoverDocs     | Hover docs         |
| pascal.enableSignatureHelp | Signatures         |
| pascal.lspEnabled          | Enable LSP         |
| pascal.debugMode           | Debug logs         |

---

## 📖 Examples

### Hello World

```pascal
program HelloWorld;
begin
  writeln('Hello from Pascal Complete!');
end.
```

### OOP Example

```pascal
type
  TPerson = class
  private
    FName: String;
    FAge: Integer;
  public
    constructor Create(AName: String; AAge: Integer);
    procedure Greet;
  end;

constructor TPerson.Create(AName: String; AAge: Integer);
begin
  FName := AName;
  FAge := AAge;
end;

procedure TPerson.Greet;
begin
  writeln('Hello, I am ', FName, ' and I am ', FAge);
end;

var p: TPerson;
begin
  p := TPerson.Create('Alice', 25);
  p.Greet;
  p.Free;
end.
```

### Generics Example

```pascal
generic TGenericList<T> = class
private
  FItems: array of T;
  FCount: Integer;
public
  procedure Add(Item: T);
  function Get(Index: Integer): T;
end;

procedure TGenericList<T>.Add(Item: T);
begin
  Inc(FCount);
  SetLength(FItems, FCount);
  FItems[FCount - 1] := Item;
end;
```

---

## 🛠 Troubleshooting

**No syntax highlighting:**
Reload VS Code → ensure `.pas` extension is recognized.

**No diagnostics:**
Verify `fpc -iV` works and `compilerPath` is correct.

**Snippets not working:**
Press `Ctrl+Space`.

**LSP issues:**
Install:
`npm install -g pasls`

---

## 🆕 What's New (v3.0.0)

* Improved intelligence and symbol caching
* Enhanced diagnostics
* New refactorings and code actions
* Faster performance
* Better hover docs
* New commands:

  * Analyze File
  * Show All Symbols
  * Refresh Symbol Cache

---

## 🤝 Contributing

```bash
git clone https://github.com/PlayRood32/vscode-pascal
cd vscode-pascal
npm install
code .
```

Press **F5** to launch the debug instance.

---

## 📄 License

MIT License.

---

## Support

* Issues: [https://github.com/PlayRood32/vscode-pascal/issues](https://github.com/PlayRood32/vscode-pascal/issues)
* Discussions: [https://github.com/PlayRood32/vscode-pascal/discussions](https://github.com/PlayRood32/vscode-pascal/discussions)

```