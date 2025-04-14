import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class CVAAnalyzer extends BaseAnalyzer {
  name = "CVAAnalyzer";
  description = "Analyzes Class Variance Authority (CVA) usage in components";
  category = "styling";

  analyze(node: any, context: ComponentContext): void {
    const cvaConfigs: ComponentContext["cvaConfigs"] = [];

    ASTParser.traverseAST(node, (path) => {
      if (
        t.isCallExpression(path.node) &&
        t.isIdentifier(path.node.callee) &&
        path.node.callee.name === "cva"
      ) {
        const parent = path.parentPath?.node;
        if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
          const base = t.isStringLiteral(path.node.arguments[0])
            ? path.node.arguments[0].value
            : "";
          const variants =
            path.node.arguments[1] &&
            t.isObjectExpression(path.node.arguments[1])
              ? path.node.arguments[1].properties.reduce(
                  (acc: Record<string, boolean>, prop: any) => {
                    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key))
                      acc[prop.key.name] = true;
                    return acc;
                  },
                  {}
                )
              : {};
          const hasCompound =
            path.node.arguments[2] &&
            t.isObjectExpression(path.node.arguments[2]) &&
            path.node.arguments[2].properties[0] &&
            t.isObjectProperty(path.node.arguments[2].properties[0]) &&
            t.isIdentifier(path.node.arguments[2].properties[0].key) &&
            path.node.arguments[2].properties[0].key.name ===
              "compoundVariants";

          cvaConfigs.push({
            variableName: parent.id.name,
            configObject: JSON.stringify({
              base,
              variants,
              compoundVariants: hasCompound ? "present" : "none",
            }),
          });
        }
      }
    });

    context.cvaConfigs = cvaConfigs;
  }
}
