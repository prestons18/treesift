import { ComponentContext } from '../context/ComponentContext';

/**
 * @file Base abstract class for all TreeSift analyzers
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * BaseAnalyzer is the foundation class that all TreeSift analyzers inherit from.
 * It defines the common interface and contract that each analyzer must implement,
 * ensuring consistency across the analysis pipeline. Each analyzer must provide
 * a name, description, category, and implement the analyze method.
 *
 * Usage:
 * ------------------------------------------------------
 * class CustomAnalyzer extends BaseAnalyzer {
 *   name = "CustomAnalyzer";
 *   description = "Analyzes custom patterns";
 *   category = "custom";
 *
 *   analyze(node: any, context: ComponentContext): void {
 *     // Implementation
 *   }
 * }
 */

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
