import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class JSXElementAnalyzer extends BaseAnalyzer {
  name = "JSXElementAnalyzer";
  description = "Analyzes JSX elements in the code";
  category = "react";

  analyze(node: any, context: ComponentContext): void {
    const components: Set<string> = new Set();

    ASTParser.traverseAST(node, (path) => {
      if (
        t.isJSXElement(path.node) &&
        t.isJSXIdentifier(path.node.openingElement.name)
      ) {
        components.add(path.node.openingElement.name.name);
      }
    });

    // Store results in context
    context.dependencies.components = Array.from(components);
  }
}
