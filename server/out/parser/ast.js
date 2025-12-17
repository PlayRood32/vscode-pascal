"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTBuilder = void 0;
const types_1 = require("../../../shared/src/types");
class ASTBuilder {
    static createProgram(name, range) {
        return { type: types_1.ASTNodeType.Program, name, range, children: [] };
    }
    static createUnit(name, range) {
        return { type: types_1.ASTNodeType.Unit, name, range, children: [] };
    }
    static createProcedure(name, range) {
        return { type: types_1.ASTNodeType.Procedure, name, range, children: [] };
    }
    static createFunction(name, range) {
        return { type: types_1.ASTNodeType.Function, name, range, children: [] };
    }
    static createVarDeclaration(name, range) {
        return { type: types_1.ASTNodeType.VarDeclaration, name, range };
    }
    static createTypeDeclaration(name, range) {
        return { type: types_1.ASTNodeType.TypeDeclaration, name, range };
    }
    static createConstDeclaration(name, range) {
        return { type: types_1.ASTNodeType.ConstDeclaration, name, range };
    }
    static createBlock(range, children) {
        return { type: types_1.ASTNodeType.Block, range, children };
    }
    static createInterfaceSection(range, children) {
        return { type: types_1.ASTNodeType.InterfaceSection, range, children };
    }
    static createImplementationSection(range, children) {
        return { type: types_1.ASTNodeType.ImplementationSection, range, children };
    }
}
exports.ASTBuilder = ASTBuilder;
//# sourceMappingURL=ast.js.map