/**
 * @file Analyzer for detecting React hooks usage
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * HookAnalyzer identifies and analyzes the usage of React hooks within components.
 * It detects both built-in React hooks (useState, useEffect, etc.) and custom hooks
 * that follow the 'use' prefix convention. The analyzer extracts hook names and their
 * arguments, providing insights into component state management and side effects.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new HookAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.hooks); // Array of { name, arguments }
 */

import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class HookAnalyzer extends BaseAnalyzer {
  name = "HookAnalyzer";
  description = "Analyzes React hooks usage";
  category = "react";

  analyze(node: any, context: ComponentContext): void {
    const hooks: ComponentContext["hooks"] = [];

    ASTParser.traverseAST(node, (path) => {
      if (t.isCallExpression(path.node) && t.isIdentifier(path.node.callee)) {
        const calleeName = path.node.callee.name;

        // Basic React hook pattern
        if (calleeName.startsWith("use")) {
          const args = path.node.arguments
            .map((arg: any) => {
              if (t.isIdentifier(arg)) return arg.name;
              if (t.isStringLiteral(arg)) return arg.value;
              if (t.isNumericLiteral(arg)) return arg.value.toString();
              if (t.isArrayExpression(arg)) {
                return `[${arg.elements
                  .map((el: any) => {
                    if (t.isIdentifier(el)) return el.name;
                    if (t.isStringLiteral(el)) return el.value;
                    if (t.isNumericLiteral(el)) return el.value.toString();
                    return "...";
                  })
                  .join(", ")}]`;
              }
              if (
                t.isArrowFunctionExpression(arg) ||
                t.isFunctionExpression(arg)
              ) {
                return "() => {...}";
              }
              return "...";
            }) // As you can see, this minifies the expressions
            .filter((arg: string | null): arg is string => arg !== null);

          hooks.push({
            name: calleeName,
            arguments: args,
          });
        }
      }
    });

    // Store results in context
    context.hooks = hooks;
  }
}
