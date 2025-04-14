import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class ClassNamesAnalyzer extends BaseAnalyzer {
  name = "ClassNamesAnalyzer";
  description = "Analyzes classNames utility (cn) usage in components";
  category = "styling";

  analyze(node: any, context: ComponentContext): void {
    const cnInfo: {
      importSource: string | null;
      importName: string | null;
      usages: Array<{
        line: number;
        column: number;
        arguments: string[];
      }>;
    } = {
      importSource: null,
      importName: null,
      usages: [],
    };

    ASTParser.traverseAST(node, (path) => {
      // Detect cn import
      if (t.isImportDeclaration(path.node)) {
        const source = path.node.source.value;
        if (
          typeof source === "string" &&
          (source.includes("clsx") ||
            source.includes("classnames") ||
            source.includes("tailwind-merge"))
        ) {
          path.node.specifiers.forEach((specifier: any) => {
            if (
              t.isImportSpecifier(specifier) &&
              t.isIdentifier(specifier.local) &&
              (specifier.local.name === "cn" ||
                specifier.local.name === "clsx" ||
                specifier.local.name === "classNames")
            ) {
              cnInfo.importSource = source;
              cnInfo.importName = specifier.local.name;
            }
          });
        }
      }

      // Detect cn usage
      if (
        t.isCallExpression(path.node) &&
        t.isIdentifier(path.node.callee) &&
        (path.node.callee.name === "cn" ||
          path.node.callee.name === "clsx" ||
          path.node.callee.name === "classNames")
      ) {
        const args = this.extractArguments(path.node.arguments);

        cnInfo.usages.push({
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
          arguments: args,
        });
      }
    });

    // Store results in context
    context.classNames = cnInfo;
  }

  private extractArguments(args: any[]): string[] {
    return args
      .map((arg) => {
        // String literals
        if (t.isStringLiteral(arg)) {
          return arg.value;
        }

        // Template literals
        if (t.isTemplateLiteral(arg)) {
          return arg.quasis.map((q: any) => q.value.raw).join("");
        }

        // Conditional expressions
        if (t.isConditionalExpression(arg)) {
          const condition = this.extractCondition(arg.test);
          const consequent = this.extractArguments([arg.consequent])[0];
          const alternate = this.extractArguments([arg.alternate])[0];
          return [`${condition} ? ${consequent} : ${alternate}`];
        }

        // Array expressions
        if (t.isArrayExpression(arg)) {
          return this.extractArguments(arg.elements);
        }

        // Object expressions (for conditional classes)
        if (t.isObjectExpression(arg)) {
          return arg.properties
            .map((prop: any) => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                return `${prop.key.name}: ${
                  t.isBooleanLiteral(prop.value) ? prop.value.value : "true"
                }`;
              }
              return "";
            })
            .filter(Boolean);
        }

        // Function calls (for nested cn calls)
        if (
          t.isCallExpression(arg) &&
          t.isIdentifier(arg.callee) &&
          (arg.callee.name === "cn" ||
            arg.callee.name === "clsx" ||
            arg.callee.name === "classNames")
        ) {
          return this.extractArguments(arg.arguments);
        }

        // Default case - try to get a string representation
        return String(arg);
      })
      .flat()
      .filter(Boolean);
  }

  private extractCondition(test: any): string {
    if (t.isBinaryExpression(test)) {
      const left = t.isIdentifier(test.left)
        ? test.left.name
        : t.isMemberExpression(test.left)
        ? this.extractMemberExpression(test.left)
        : String(test.left);
      const right = t.isNumericLiteral(test.right)
        ? test.right.value
        : t.isStringLiteral(test.right)
        ? `"${test.right.value}"`
        : String(test.right);
      return `${left} ${test.operator} ${right}`;
    }
    return String(test);
  }

  private extractMemberExpression(node: any): string {
    if (t.isIdentifier(node.object) && t.isIdentifier(node.property)) {
      return `${node.object.name}.${node.property.name}`;
    }
    return String(node);
  }
}
