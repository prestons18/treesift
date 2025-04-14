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
