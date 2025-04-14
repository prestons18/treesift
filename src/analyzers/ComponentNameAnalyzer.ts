/**
 * @file Analyzer for detecting React component names
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ComponentNameAnalyzer is responsible for identifying and extracting component
 * names from React components. It handles various component declaration patterns
 * including default exports, named exports, and variable declarations. The analyzer
 * follows React's component naming convention (must start with uppercase) and
 * updates the component context with the detected name.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new ComponentNameAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.name); // "MyComponent"
 */

import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class ComponentNameAnalyzer extends BaseAnalyzer {
  name = "ComponentNameAnalyzer";
  description = "Detects component names in React components";
  category = "react";

  analyze(node: any, context: ComponentContext): void {
    let componentName = "Unknown";

    ASTParser.traverseAST(node, (path) => {
      // Check for export default function
      if (
        t.isExportDefaultDeclaration(path.node) &&
        t.isFunctionDeclaration(path.node.declaration) &&
        t.isIdentifier(path.node.declaration.id)
      ) {
        componentName = path.node.declaration.id.name;
      }

      // Check for named exports that look like components
      if (
        t.isExportNamedDeclaration(path.node) &&
        t.isFunctionDeclaration(path.node.declaration) &&
        t.isIdentifier(path.node.declaration.id) &&
        path.node.declaration.id.name.match(/^[A-Z]/)
      ) {
        componentName = path.node.declaration.id.name;
      }

      // Check for variable declarations with function expressions
      if (
        t.isVariableDeclarator(path.node) &&
        t.isIdentifier(path.node.id) &&
        path.node.id.name.match(/^[A-Z]/) &&
        (t.isFunctionExpression(path.node.init) ||
          t.isArrowFunctionExpression(path.node.init))
      ) {
        componentName = path.node.id.name;
      }
    });

    context.name = componentName;
  }
}
