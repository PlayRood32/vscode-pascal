# Pascal Language Server

Professional Pascal/Free Pascal/Object Pascal support for Visual Studio Code.

## Features

- **IntelliSense** – Smart completion with keywords prioritized (type `var` to see `var` first)
- **Hover** – Documentation for built-in functions (WriteLn, ReadLn, Length, Copy, etc.)
- **Go to Definition & Rename** – Navigate and rename symbols in the current file
- **Diagnostics** – Real-time errors with red squiggles and quick fixes (undeclared identifiers, missing semicolons, mismatched begin/end)
- **Syntax Highlighting** – Full Pascal syntax with distinct colors
- **Basic Formatting** – Auto-indent for blocks
- **Snippets** – 30+ templates with automatic filename insertion (`${TM_FILENAME_BASE}`)
- **Document Symbols** – Outline view for quick navigation



<details>
<summary>📋 Full List of Code Snippets (click to expand)</summary>
| Prefix       | Description                                   | Generated Code Example |
|--------------|-----------------------------------------------|------------------------|
| `program`    | Professional program template with error handling and filename insertion | `program MyFile;` + uses + try/except block |
| `progconsole`| Console application template (pauses on Windows) | `program MyFile;` + {$APPTYPE CONSOLE} + pause on Windows |
| `pmin`       | Minimal program with filename insertion      | `program MyFile; begin end.` |
| `vint`       | Integer variable declaration                 | `name: Integer;` |
| `vstr`       | String variable declaration                  | `name: String;` |
| `vbool`      | Boolean variable declaration                 | `name: Boolean;` |
| `varr`       | Static array declaration                     | `name: array[0..9] of Integer;` |
| `vdyn`       | Dynamic array declaration                    | `name: array of Integer;` |
| `vptr`       | Pointer declaration                          | `name: ^Integer;` |
| `cconst`     | Simple constant declaration                  | `NAME = value;` |
| `tconst`     | Typed constant declaration                   | `name: Integer = 0;` |
| `dbg`        | Conditional debug output                     | `{$IFDEF DEBUG} WriteLn('DEBUG: '); {$ENDIF}` |
| `region`     | Code folding region                          | `{$REGION 'Name'} ... {$ENDREGION}` |
| `todo`       | TODO comment                                 | `// TODO: description` |
| `fixme`      | FIXME comment                                | `// FIXME: description` |
| `note`       | NOTE comment                                 | `// NOTE: description` |
| `hack`       | HACK comment                                 | `// HACK: description` |
</details>




## Installation

Search "Pascal Language Server" in VS Code Extensions and install.

No external dependencies required (Free Pascal Compiler optional for future features).

## Usage Example

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

Enjoy modern Pascal development in VS Code!

**Author:** Yishay Oved (PlayRood)  
GitHub: [@PlayRood32](https://github.com/PlayRood32)  
**License:** MIT

---

**Built with ❤️ using Language Server Protocol**