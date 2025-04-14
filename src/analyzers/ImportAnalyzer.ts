import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class ImportAnalyzer extends BaseAnalyzer {
  name = "ImportAnalyzer";
  description = "Analyzes import statements";
  category = "react";

  analyze(node: any, context: ComponentContext): void {
    const imports: Set<string> = new Set();

    ASTParser.traverseAST(node, (path) => {
      if (t.isImportDeclaration(path.node)) {
        const source = path.node.source.value;
        imports.add(source);
      }
    });

    // Store results in context
    context.dependencies.packages = Array.from(imports);
  }
}
