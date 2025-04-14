import { ComponentContext } from "../context/ComponentContext";

export abstract class BaseAnalyzer {
  abstract name: string;
  abstract description: string;
  abstract category: string;

  /**
   * @param node - The AST node or root to analyze.
   * @param context - The current component context to update.
   */
  abstract analyze(node: any, context: ComponentContext): void;
}
