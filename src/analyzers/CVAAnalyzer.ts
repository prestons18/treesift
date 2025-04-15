/**
 * @file Analyzer for Class Variance Authority (CVA) style configurations
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 15/04/24
 *
 * Description:
 * ------------------------------------------------------
 * CVAAnalyzer detects and analyzes Class Variance Authority (CVA) style configurations
 * within React components. It identifies CVA function calls, extracts their base styles,
 * variants, and compound variants, providing a comprehensive view of the component's
 * styling system. This analyzer is crucial for understanding and documenting
 * component styling patterns.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new CVAAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.cvaConfigs); // Array of CVA configurations
 */

import { ASTParser } from '../parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext } from '../context/ComponentContext';

export class CVAAnalyzer extends BaseAnalyzer {
  name = 'CVAAnalyzer';
  description = 'Analyzes Class Variance Authority (CVA) usage in components';
  category = 'styling';

  analyze(node: any, context: ComponentContext): void {
    const cvaConfigs: ComponentContext['cvaConfigs'] = [];

    ASTParser.traverseAST(node, path => {
      if (this.isCvaCall(path.node)) {
        const parent = path.parentPath?.node;
        if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
          cvaConfigs.push({
            variableName: parent.id.name,
            configObject: JSON.stringify(this.parseCvaConfig(path.node), null, 2),
          });
        }
      }
    });

    context.cvaConfigs = cvaConfigs;
  }

  private isCvaCall(node: any): boolean {
    return t.isCallExpression(node) && t.isIdentifier(node.callee) && node.callee.name === 'cva';
  }

  private parseCvaConfig(node: any): Record<string, any> {
    if (!t.isCallExpression(node) || node.arguments.length === 0) {
      return { base: '', variants: {}, defaultVariants: {}, compoundVariants: [] };
    }

    const result: Record<string, any> = {
      base: this.extractValue(node.arguments[0]),
      variants: {},
      defaultVariants: {},
      compoundVariants: [],
    };

    // Parse the second argument (config object)
    if (node.arguments.length > 1 && t.isObjectExpression(node.arguments[1])) {
      const configObj = node.arguments[1];

      // Extract variants
      const variantsProp = this.findProperty(configObj, 'variants');
      if (variantsProp && t.isObjectExpression(variantsProp.value)) {
        result.variants = this.extractObject(variantsProp.value);
      }

      // Extract defaultVariants
      const defaultVariantsProp = this.findProperty(configObj, 'defaultVariants');
      if (defaultVariantsProp && t.isObjectExpression(defaultVariantsProp.value)) {
        result.defaultVariants = this.extractObject(defaultVariantsProp.value);
      }

      // Extract compoundVariants
      const compoundVariantsProp = this.findProperty(configObj, 'compoundVariants');
      if (compoundVariantsProp && t.isArrayExpression(compoundVariantsProp.value)) {
        result.compoundVariants = this.extractArray(compoundVariantsProp.value);
      }
    }

    return result;
  }

  private findProperty(obj: any, name: string): any {
    if (!t.isObjectExpression(obj)) return null;

    return obj.properties.find(
      (prop: any) => t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === name
    );
  }

  private extractValue(node: any): any {
    if (!node) return '';

    if (t.isStringLiteral(node)) {
      return node.value;
    }

    if (t.isTemplateLiteral(node)) {
      return node.quasis.map((q: any) => q.value.raw).join('');
    }

    if (t.isArrayExpression(node)) {
      return this.extractArray(node);
    }

    if (t.isObjectExpression(node)) {
      return this.extractObject(node);
    }

    if (t.isIdentifier(node)) {
      return node.name;
    }

    if (t.isNumericLiteral(node)) {
      return node.value;
    }

    if (t.isBooleanLiteral(node)) {
      return node.value;
    }

    if (t.isNullLiteral(node)) {
      return null;
    }

    if (t.isCallExpression(node)) {
      return this.extractCallExpression(node);
    }

    return '';
  }

  private extractCallExpression(node: any): any {
    if (!t.isCallExpression(node)) return null;

    const callee = this.extractValue(node.callee);
    const args = node.arguments.map((arg: any) => this.extractValue(arg));

    return {
      type: 'call',
      callee,
      arguments: args,
    };
  }

  private extractObject(node: any): Record<string, any> {
    if (!t.isObjectExpression(node)) return {};

    const result: Record<string, any> = {};

    node.properties.forEach((prop: any) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        result[prop.key.name] = this.extractValue(prop.value);
      } else if (t.isObjectProperty(prop) && t.isStringLiteral(prop.key)) {
        result[prop.key.value] = this.extractValue(prop.value);
      } else if (t.isSpreadElement(prop)) {
        // Handle spread elements
        const spreadValue = this.extractValue(prop.argument);
        if (typeof spreadValue === 'object') {
          Object.assign(result, spreadValue);
        }
      }
    });

    return result;
  }

  private extractArray(node: any): any[] {
    if (!t.isArrayExpression(node)) return [];

    return node.elements.map((element: any) => {
      if (element === null) return null;
      return this.extractValue(element);
    });
  }
}
