/**
 * @file Analyzer for className utility functions (cn, clsx, classNames)
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ClassNamesAnalyzer detects and analyzes the usage of className utility functions
 * like cn, clsx, and classNames in React components. It tracks imports, usage locations,
 * and extracts the actual class names being used, including support for conditional
 * classes, template literals, and nested utility calls.
 */

import { ASTParser } from '../parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext } from '../context/ComponentContext';

type ClassNameArgType =
  | 'string'
  | 'object'
  | 'array'
  | 'identifier'
  | 'conditional'
  | 'unknown'
  | 'call';

interface ClassNameArg {
  type: ClassNameArgType;
  value: any;
}

interface Location {
  line: number;
  column: number;
}

export class ClassNamesAnalyzer extends BaseAnalyzer {
  name = 'ClassNamesAnalyzer';
  description = 'Analyzes className utility usage in components';
  category = 'styling';

  analyze(node: any, context: ComponentContext): void {
    // Initialize with default values
    context.classNamesUsage = {
      hasClassNames: false,
      importSource: '',
      usage: [],
    };

    // Track imported utilities
    const importedUtils = new Map<string, string>();

    // First pass: collect all imported utilities
    ASTParser.traverseAST(node, path => {
      if (t.isImportDeclaration(path.node)) {
        const source = path.node.source.value;
        if (typeof source === 'string') {
          path.node.specifiers.forEach(
            (spec: t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier) => {
              if (t.isImportSpecifier(spec)) {
                const importedName = t.isIdentifier(spec.imported) ? spec.imported.name : '';
                const localName = spec.local.name;
                if (['cn', 'clsx', 'classnames', 'cx'].includes(importedName)) {
                  importedUtils.set(localName, source);
                  context.classNamesUsage.hasClassNames = true;
                  context.classNamesUsage.importSource = source;
                }
              }
            }
          );
        }
      }
    });

    // Helper function to extract arguments from a call expression
    const extractArgs = (callExpr: t.CallExpression): ClassNameArg[] => {
      return callExpr.arguments.map(arg => {
        if (t.isStringLiteral(arg)) {
          return { type: 'string', value: arg.value };
        } else if (t.isTemplateLiteral(arg)) {
          return { type: 'string', value: arg.quasis.map(q => q.value.raw).join('') };
        } else if (t.isObjectExpression(arg)) {
          const obj: Record<string, any> = {};
          arg.properties.forEach(prop => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              obj[prop.key.name] = t.isBooleanLiteral(prop.value)
                ? prop.value.value
                : t.isStringLiteral(prop.value)
                  ? prop.value.value
                  : true;
            }
          });
          return { type: 'object', value: obj };
        } else if (t.isArrayExpression(arg)) {
          return {
            type: 'array',
            value: arg.elements
              .map(el => (t.isStringLiteral(el) ? el.value : t.isIdentifier(el) ? el.name : null))
              .filter(Boolean),
          };
        } else if (t.isIdentifier(arg)) {
          return { type: 'identifier', value: arg.name };
        } else if (t.isConditionalExpression(arg)) {
          const test = t.isBinaryExpression(arg.test)
            ? `${t.isIdentifier(arg.test.left) ? arg.test.left.name : ''} ${arg.test.operator} ${t.isNumericLiteral(arg.test.right) ? arg.test.right.value : ''}`
            : t.isIdentifier(arg.test)
              ? arg.test.name
              : '';

          const consequent = t.isStringLiteral(arg.consequent)
            ? arg.consequent.value
            : t.isIdentifier(arg.consequent)
              ? arg.consequent.name
              : '';

          const alternate = t.isStringLiteral(arg.alternate)
            ? arg.alternate.value
            : t.isIdentifier(arg.alternate)
              ? arg.alternate.name
              : '';

          return {
            type: 'conditional',
            value: { condition: test, trueValue: consequent, falseValue: alternate },
          };
        }
        return { type: 'unknown', value: '' };
      });
    };

    // Helper function to process a className utility call
    const processClassNameCall = (
      callExpr: t.CallExpression,
      calleeName: string,
      location: Location
    ): void => {
      if (
        ['cn', 'clsx', 'classnames', 'cx'].includes(calleeName) ||
        importedUtils.has(calleeName)
      ) {
        context.classNamesUsage.hasClassNames = true;
        const typeForContext = importedUtils.has(calleeName)
          ? 'cn'
          : calleeName === 'cn'
            ? 'cn'
            : calleeName === 'clsx'
              ? 'clsx'
              : 'classnames';

        context.classNamesUsage.usage.push({
          type: typeForContext,
          arguments: extractArgs(callExpr),
          location,
        });
      }
    };

    // Second pass: find usages
    ASTParser.traverseAST(node, path => {
      // Check for direct usage of className utilities
      if (t.isCallExpression(path.node) && t.isIdentifier(path.node.callee)) {
        const location = path.node.loc
          ? { line: path.node.loc.start.line, column: path.node.loc.start.column }
          : { line: 0, column: 0 };
        processClassNameCall(path.node, path.node.callee.name, location);
      }

      // Check for JSX className attributes that use className utilities
      if (
        t.isJSXAttribute(path.node) &&
        t.isJSXIdentifier(path.node.name) &&
        path.node.name.name === 'className'
      ) {
        if (
          t.isJSXExpressionContainer(path.node.value) &&
          t.isCallExpression(path.node.value.expression) &&
          t.isIdentifier(path.node.value.expression.callee)
        ) {
          const location = path.node.loc
            ? { line: path.node.loc.start.line, column: path.node.loc.start.column }
            : { line: 0, column: 0 };
          processClassNameCall(
            path.node.value.expression,
            path.node.value.expression.callee.name,
            location
          );
        }
      }
    });

    // Update the legacy classNames property for backward compatibility
    if (context.classNamesUsage.hasClassNames) {
      context.classNames = {
        importSource: context.classNamesUsage.importSource,
        importName:
          context.classNamesUsage.usage.length > 0 ? context.classNamesUsage.usage[0].type : null,
        usages: context.classNamesUsage.usage.map(usage => ({
          line: usage.location.line,
          column: usage.location.column,
          arguments: usage.arguments.map(arg => {
            if (arg.type === 'conditional') {
              return `${arg.value.condition} ? "${arg.value.trueValue}" : "${arg.value.falseValue}"`;
            } else if (typeof arg.value === 'string') {
              return arg.value;
            } else {
              return JSON.stringify(arg.value);
            }
          }),
        })),
      };
    }
  }
}
