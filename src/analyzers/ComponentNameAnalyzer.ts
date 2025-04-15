/**
 * @file Analyzer for detecting React component names
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 15/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ComponentNameAnalyzer is responsible for identifying and extracting component
 * names from React components. It handles various component declaration patterns
 * including default exports, named exports, and variable declarations. The analyzer
 * follows React's component naming convention (must start with uppercase) and
 * updates the component context with the detected name.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new ComponentNameAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.name); // "MyComponent"
 */

import { ASTParser } from '../parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext } from '../context/ComponentContext';

export class ComponentNameAnalyzer extends BaseAnalyzer {
  name = 'ComponentNameAnalyzer';
  description = 'Detects component names in React components';
  category = 'react';

  analyze(node: any, context: ComponentContext): void {
    let componentName = 'Unknown';
    let componentType: ComponentContext['type'] = 'Unknown';
    let isDefaultExport = false;

    // First pass: look for default export
    ASTParser.traverseAST(node, path => {
      if (t.isExportDefaultDeclaration(path.node)) {
        if (
          t.isFunctionDeclaration(path.node.declaration) &&
          t.isIdentifier(path.node.declaration.id)
        ) {
          componentName = path.node.declaration.id.name;
          componentType = 'FunctionDeclaration';
          isDefaultExport = true;
        } else if (t.isIdentifier(path.node.declaration)) {
          // Handle default export of named component
          componentName = path.node.declaration.name;
          isDefaultExport = true;
        }
      }
    });

    // Second pass: if no default export found or we need to determine type
    ASTParser.traverseAST(node, path => {
      // If we found a default export identifier, look for its declaration
      if (isDefaultExport && componentType === 'Unknown') {
        if (
          t.isVariableDeclarator(path.node) &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name === componentName
        ) {
          if (t.isArrowFunctionExpression(path.node.init)) {
            componentType = 'ArrowFunctionExpression';
          } else if (t.isFunctionExpression(path.node.init)) {
            componentType = 'FunctionExpression';
          }
        } else if (
          t.isFunctionDeclaration(path.node) &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name === componentName
        ) {
          componentType = 'FunctionDeclaration';
        } else if (
          t.isClassDeclaration(path.node) &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name === componentName
        ) {
          componentType = 'ClassDeclaration';
        }
      }
      // If no default export found, look for named exports
      else if (!isDefaultExport) {
        // Check for named exports that look like components
        if (
          t.isExportNamedDeclaration(path.node) &&
          t.isFunctionDeclaration(path.node.declaration) &&
          t.isIdentifier(path.node.declaration.id) &&
          path.node.declaration.id.name.match(/^[A-Z]/)
        ) {
          componentName = path.node.declaration.id.name;
          componentType = 'FunctionDeclaration';
        }

        // Check for variable declarations with function expressions
        if (
          t.isVariableDeclarator(path.node) &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name.match(/^[A-Z]/)
        ) {
          componentName = path.node.id.name;
          if (t.isArrowFunctionExpression(path.node.init)) {
            componentType = 'ArrowFunctionExpression';
          } else if (t.isFunctionExpression(path.node.init)) {
            componentType = 'FunctionExpression';
          }
        }

        // Check for class declarations
        if (
          t.isClassDeclaration(path.node) &&
          t.isIdentifier(path.node.id) &&
          path.node.id.name.match(/^[A-Z]/)
        ) {
          componentName = path.node.id.name;
          componentType = 'ClassDeclaration';
        }
      }
    });

    context.name = componentName;
    context.type = componentType;
  }
}
