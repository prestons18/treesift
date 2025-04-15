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
    const result = this.detectComponentInfo(node);
    context.name = result.name;
    context.type = result.type;
  }

  private detectComponentInfo(node: any): { name: string; type: ComponentContext['type'] } {
    // Initialize with default values
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

    // Second pass: analyze component declarations
    ASTParser.traverseAST(node, path => {
      // If we have a default export, look for its declaration
      if (isDefaultExport && componentType === 'Unknown') {
        const result = this.analyzeComponentDeclaration(path.node, componentName);
        if (result) {
          componentType = result;
        }
      }
      // If no default export found, look for named exports
      else if (!isDefaultExport) {
        const result = this.analyzeNamedExport(path.node);
        if (result) {
          componentName = result.name;
          componentType = result.type;
        }
      }
    });

    return { name: componentName, type: componentType };
  }

  private analyzeComponentDeclaration(
    node: any,
    expectedName: string
  ): ComponentContext['type'] | null {
    // Check for variable declarations
    if (t.isVariableDeclarator(node) && t.isIdentifier(node.id) && node.id.name === expectedName) {
      if (t.isArrowFunctionExpression(node.init)) {
        return 'ArrowFunctionExpression';
      } else if (t.isFunctionExpression(node.init)) {
        return 'FunctionExpression';
      } else if (this.isForwardRefCall(node.init)) {
        return 'ForwardRefComponent';
      }
    }
    // Check for function declarations
    else if (
      t.isFunctionDeclaration(node) &&
      t.isIdentifier(node.id) &&
      node.id.name === expectedName
    ) {
      return 'FunctionDeclaration';
    }
    // Check for class declarations
    else if (
      t.isClassDeclaration(node) &&
      t.isIdentifier(node.id) &&
      node.id.name === expectedName
    ) {
      return 'ClassDeclaration';
    }

    return null;
  }

  private analyzeNamedExport(node: any): { name: string; type: ComponentContext['type'] } | null {
    // Check for named exports that look like components
    if (
      t.isExportNamedDeclaration(node) &&
      t.isFunctionDeclaration(node.declaration) &&
      t.isIdentifier(node.declaration.id) &&
      node.declaration.id.name.match(/^[A-Z]/)
    ) {
      return {
        name: node.declaration.id.name,
        type: 'FunctionDeclaration',
      };
    }

    // Check for variable declarations with function expressions
    if (t.isVariableDeclarator(node) && t.isIdentifier(node.id) && node.id.name.match(/^[A-Z]/)) {
      if (t.isArrowFunctionExpression(node.init)) {
        return { name: node.id.name, type: 'ArrowFunctionExpression' };
      } else if (t.isFunctionExpression(node.init)) {
        return { name: node.id.name, type: 'FunctionExpression' };
      } else if (this.isForwardRefCall(node.init)) {
        return { name: node.id.name, type: 'ForwardRefComponent' };
      }
    }

    // Check for class declarations
    if (t.isClassDeclaration(node) && t.isIdentifier(node.id) && node.id.name.match(/^[A-Z]/)) {
      return { name: node.id.name, type: 'ClassDeclaration' };
    }

    // Check for forwardRef usage (both React.forwardRef and imported forwardRef)
    if (this.isForwardRefCall(node)) {
      // If this is a variable declaration
      if (
        t.isVariableDeclarator(node.parentPath?.node) &&
        t.isIdentifier(node.parentPath.node.id)
      ) {
        return { name: node.parentPath.node.id.name, type: 'ForwardRefComponent' };
      }
      // If this is a direct export
      else if (
        t.isExportNamedDeclaration(node.parentPath?.node) &&
        t.isVariableDeclaration(node.parentPath.node.declaration)
      ) {
        const decl = node.parentPath.node.declaration.declarations[0];
        if (t.isIdentifier(decl.id)) {
          return { name: decl.id.name, type: 'ForwardRefComponent' };
        }
      }
    }

    return null;
  }

  private isForwardRefCall(node: any): boolean {
    if (!t.isCallExpression(node)) return false;

    // Check for React.forwardRef
    if (
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.object) &&
      t.isIdentifier(node.callee.property) &&
      node.callee.object.name === 'React' &&
      node.callee.property.name === 'forwardRef'
    ) {
      return true;
    }

    // Check for imported forwardRef
    if (t.isIdentifier(node.callee) && node.callee.name === 'forwardRef') {
      return true;
    }

    return false;
  }
}
