import { ASTParser } from "src/parser/ASTParser";
import * as t from "@babel/types";
import { BaseAnalyzer } from "./BaseAnalyzer";
import { ComponentContext } from "../context/ComponentContext";

export class StylingLibraryAnalyzer extends BaseAnalyzer {
  name = "StylingLibraryAnalyzer";
  description = "Detects which styling library is being used in a component";
  category = "styling";

  analyze(node: any, context: ComponentContext): void {
    const indicators: string[] = [];
    const scores = {
      tailwind: 0,
      "css-modules": 0,
      "styled-components": 0,
      emotion: 0,
      custom: 0,
    };

    ASTParser.traverseAST(node, (path) => {
      // Check imports
      if (t.isImportDeclaration(path.node)) {
        const source = path.node.source.value;
        if (typeof source === "string") {
          if (source.includes("tailwind")) {
            scores.tailwind += 30;
            indicators.push(`Imports from ${source}`);
          }
          if (source.includes("clsx") || source.includes("tailwind-merge")) {
            scores.tailwind += 20;
            indicators.push(`Imports ${source}`);
          }
          if (source.endsWith(".module.css")) {
            scores["css-modules"] += 40;
            indicators.push(`Imports CSS module: ${source}`);
          }
          if (source === "styled-components") {
            scores["styled-components"] += 50;
            indicators.push("Imports styled-components");
          }
          if (source === "@emotion/react") {
            scores.emotion += 50;
            indicators.push("Imports @emotion/react");
          }
          if (source.endsWith(".css") && !source.endsWith(".module.css")) {
            scores.custom += 30;
            indicators.push(`Imports CSS file: ${source}`);
          }
        }
      }

      // Check className usage with Tailwind-like patterns
      if (
        t.isJSXAttribute(path.node) &&
        t.isJSXIdentifier(path.node.name) &&
        path.node.name.name === "className" &&
        t.isStringLiteral(path.node.value)
      ) {
        const className = path.node.value.value;
        if (
          className.includes("text-") ||
          className.includes("bg-") ||
          className.includes("p-") ||
          className.includes("m-") ||
          className.includes("flex-") ||
          className.includes("grid-")
        ) {
          scores.tailwind += 10;
          indicators.push(`Uses Tailwind-like class: ${className}`);
        }
      }

      // Check for styled-components usage
      if (
        t.isTaggedTemplateExpression(path.node) &&
        t.isIdentifier(path.node.tag) &&
        (path.node.tag.name === "styled" ||
          path.node.tag.name.endsWith("Styled"))
      ) {
        scores["styled-components"] += 20;
        indicators.push(`Uses styled-components: ${path.node.tag.name}`);
      }

      // Check for Emotion usage
      if (
        t.isCallExpression(path.node) &&
        t.isIdentifier(path.node.callee) &&
        path.node.callee.name === "css"
      ) {
        scores.emotion += 20;
        indicators.push("Uses Emotion css function");
      }
    });

    // Determine the styling library with highest confidence
    const maxScore = Math.max(...Object.values(scores));
    const detectedType =
      maxScore > 0
        ? (Object.entries(scores).find(
            ([_, score]) => score === maxScore
          )?.[0] as ComponentContext["stylingLibrary"]["type"]) || "unknown"
        : "unknown";

    // Store results in context
    context.stylingLibrary = {
      type: detectedType,
      confidence: maxScore,
      indicators:
        indicators.length > 0
          ? indicators
          : ["No clear styling indicators found"],
    };
  }
}
