"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolTable = void 0;
class SymbolTable {
    constructor() {
        this.symbols = new Map();
    }
    add(symbol) {
        this.symbols.set(symbol.name.toLowerCase(), symbol);
    }
    find(name) {
        return this.symbols.get(name.toLowerCase());
    }
    getAll() {
        return Array.from(this.symbols.values());
    }
    findExact(name) {
        for (const sym of this.symbols.values()) {
            if (sym.name === name)
                return sym;
        }
        return undefined;
    }
}
exports.SymbolTable = SymbolTable;
//# sourceMappingURL=symbolTable.js.map