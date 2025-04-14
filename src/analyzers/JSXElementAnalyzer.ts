/**
 * @file Analyzer for detecting JSX elements
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * JSXElementAnalyzer identifies and tracks JSX elements used within React components.
 * It detects both built-in HTML elements and custom components, providing insights
 * into the component's render tree structure, props, children, and attributes.
 * This analyzer is essential for understanding component composition and dependencies.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new JSXElementAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.dependencies.components); // Array of component details
 */

import { ASTParser } from 'src/parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext, JSXElementInfo } from '../context/ComponentContext';

export class JSXElementAnalyzer extends BaseAnalyzer {
  name = 'JSXElementAnalyzer';
  description = 'Analyzes JSX elements in the code';
  category = 'react';

  analyze(node: any, context: ComponentContext): void {
    const elements = new Map<string, JSXElementInfo>();

    ASTParser.traverseAST(node, path => {
      if (!t.isJSXElement(path.node)) return;

      const elementName = t.isJSXIdentifier(path.node.openingElement.name)
        ? path.node.openingElement.name.name
        : 'Unknown';

      const elementInfo: JSXElementInfo = {
        name: elementName,
        props: [],
        children: [],
        attributes: [],
      };

      // Analyze props and attributes
      path.node.openingElement.attributes.forEach((attr: t.JSXAttribute | t.JSXSpreadAttribute) => {
        if (t.isJSXSpreadAttribute(attr)) {
          elementInfo.props.push({ name: '...', value: null, isSpread: true });
          return;
        }

        if (!t.isJSXAttribute(attr)) return;

        const propName = t.isJSXIdentifier(attr.name) ? attr.name.name : 'Unknown';
        const propValue = this.extractPropValue(attr.value);

        elementInfo.props.push({ name: propName, value: propValue, isSpread: false });

        // Track attributes separately for HTML elements
        if (elementName.match(/^[a-z]/)) {
          elementInfo.attributes.push({ name: propName, value: propValue });
        }
      });

      // Analyze children
      path.node.children.forEach(
        (child: t.JSXElement | t.JSXText | t.JSXExpressionContainer | t.JSXFragment) => {
          const childInfo = this.extractChildInfo(child);
          if (childInfo) elementInfo.children.push(childInfo);
        }
      );

      elements.set(elementName, elementInfo);
    });

    context.dependencies.components = Array.from(elements.values());
  }

  private extractPropValue(value: t.JSXAttribute['value']): string | null {
    if (!value) return null;

    if (t.isStringLiteral(value)) return value.value;

    if (t.isJSXExpressionContainer(value)) {
      const expr = value.expression;
      if (t.isStringLiteral(expr)) return expr.value;
      if (t.isIdentifier(expr)) return expr.name;
    }

    return null;
  }

  private extractChildInfo(
    child: t.JSXElement | t.JSXText | t.JSXExpressionContainer | t.JSXFragment
  ): { type: 'text' | 'element' | 'expression' | 'fragment'; content: string } | null {
    if (t.isJSXText(child)) {
      const content = child.value.trim();
      return content ? { type: 'text' as const, content } : null;
    }

    if (t.isJSXElement(child)) {
      const childName = t.isJSXIdentifier(child.openingElement.name)
        ? child.openingElement.name.name
        : 'Unknown';
      return { type: 'element' as const, content: childName };
    }

    if (t.isJSXExpressionContainer(child) && t.isIdentifier(child.expression)) {
      return { type: 'expression' as const, content: child.expression.name };
    }

    if (t.isJSXFragment(child)) {
      return { type: 'fragment' as const, content: 'Fragment' };
    }

    return null;
  }
}
