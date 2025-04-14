import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class PropAnalyzer extends BaseAnalyzer {
  name = "PropAnalyzer";
  description = "Analyzes component props";
  category = "react";

  analyze(node: any, context: ComponentContext): void {
    const props: ComponentContext["props"] = [];

    ASTParser.traverseAST(node, (path) => {
      // Direct props access: props.title
      if (
        t.isMemberExpression(path.node) &&
        t.isIdentifier(path.node.object) &&
        path.node.object.name === "props"
      ) {
        if (t.isIdentifier(path.node.property)) {
          props.push({
            name: path.node.property.name,
            type: "any", // Default type since we can't infer it from usage
            isOptional: true,
          });
        }
      }

      // Destructured props in function parameters: ({ title, content })
      if (
        t.isFunctionDeclaration(path.node) ||
        t.isArrowFunctionExpression(path.node)
      ) {
        path.node.params.forEach((param: any) => {
          if (t.isObjectPattern(param)) {
            param.properties.forEach((prop) => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                props.push({
                  name: prop.key.name,
                  type: "any", // Default type since we can't infer it from usage
                  isOptional: true,
                });
              }
            });
          }
        });
      }

      // Destructured props assignment: const { title } = props;
      if (
        t.isVariableDeclarator(path.node) &&
        t.isIdentifier(path.node.init) &&
        path.node.init.name === "props"
      ) {
        if (t.isObjectPattern(path.node.id)) {
          path.node.id.properties.forEach((prop: any) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              props.push({
                name: prop.key.name,
                type: "any", // Default type since we can't infer it from usage
                isOptional: true,
              });
            }
          });
        }
      }
    });

    // Store results in context
    context.props = props;
  }
}
