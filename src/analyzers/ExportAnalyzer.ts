/**
 * @file Analyzer for detecting export statements
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ExportAnalyzer identifies and analyzes export statements within React components.
 * It detects both named and default exports, handling various export patterns
 * including variable declarations, function declarations, and re-exports.
 * This analyzer is crucial for understanding how components are exposed to other
 * parts of the application.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new ExportAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.exportType); // "default" or "named"
 */

import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class ExportAnalyzer extends BaseAnalyzer {
  name = "ExportAnalyzer";
  description = "Detects exports";
  category = "react";

  analyze(node: any, context: ComponentContext): void {
    const exports: Set<string> = new Set();

    ASTParser.traverseAST(node, (path) => {
      const pathNode = path.node;

      if (t.isExportNamedDeclaration(pathNode)) {
        if (pathNode.declaration) {
          if (t.isVariableDeclaration(pathNode.declaration)) {
            pathNode.declaration.declarations.forEach((decl) => {
              if (t.isIdentifier(decl.id)) {
                exports.add(decl.id.name);
              }
            });
          } else if (
            (t.isFunctionDeclaration(pathNode.declaration) ||
              t.isClassDeclaration(pathNode.declaration)) &&
            pathNode.declaration.id
          ) {
            exports.add(pathNode.declaration.id.name);
          }
        } else if (pathNode.specifiers.length > 0) {
          pathNode.specifiers.forEach((specifier) => {
            if (t.isExportSpecifier(specifier)) {
              const exportedName = t.isIdentifier(specifier.exported)
                ? specifier.exported.name
                : specifier.exported.value;
              exports.add(exportedName);
            }
          });
        }
      }

      if (t.isExportDefaultDeclaration(pathNode)) {
        if (t.isIdentifier(pathNode.declaration)) {
          exports.add("default: " + pathNode.declaration.name);
        } else if (
          t.isFunctionDeclaration(pathNode.declaration) ||
          t.isClassDeclaration(pathNode.declaration)
        ) {
          const name = pathNode.declaration.id
            ? pathNode.declaration.id.name
            : "(anonymous)";
          exports.add("default: " + name);
        } else {
          exports.add("default: (anonymous)");
        }
      }
    });

    // Store results in context
    context.exportType = exports.has("default: MyComponent")
      ? "default"
      : "named";
  }
}
