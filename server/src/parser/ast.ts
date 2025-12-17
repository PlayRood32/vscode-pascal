import { ASTNode, ASTNodeType, Range } from '../../../shared/src/types';

export class ASTBuilder {
    public static createProgram(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.Program, name, range, children: [] };
    }

    public static createUnit(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.Unit, name, range, children: [] };
    }

    public static createProcedure(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.Procedure, name, range, children: [] };
    }

    public static createFunction(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.Function, name, range, children: [] };
    }

    public static createVarDeclaration(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.VarDeclaration, name, range };
    }

    public static createTypeDeclaration(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.TypeDeclaration, name, range };
    }

    public static createConstDeclaration(name: string, range: Range): ASTNode {
        return { type: ASTNodeType.ConstDeclaration, name, range };
    }

    public static createBlock(range: Range, children: ASTNode[]): ASTNode {
        return { type: ASTNodeType.Block, range, children };
    }

    public static createInterfaceSection(range: Range, children: ASTNode[]): ASTNode {
        return { type: ASTNodeType.InterfaceSection, range, children };
    }

    public static createImplementationSection(range: Range, children: ASTNode[]): ASTNode {
        return { type: ASTNodeType.ImplementationSection, range, children };
    }
}