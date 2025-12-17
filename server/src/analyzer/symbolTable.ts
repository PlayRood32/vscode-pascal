import { SymbolInfo } from '../../../shared/src/types';

export class SymbolTable {
    private symbols = new Map<string, SymbolInfo>();

    public add(symbol: SymbolInfo): void {
        this.symbols.set(symbol.name.toLowerCase(), symbol);
    }

    public find(name: string): SymbolInfo | undefined {
        return this.symbols.get(name.toLowerCase());
    }

    public getAll(): SymbolInfo[] {
        return Array.from(this.symbols.values());
    }

    public findExact(name: string): SymbolInfo | undefined {
        for (const sym of this.symbols.values()) {
            if (sym.name === name) return sym;
        }
        return undefined;
    }
}