/**
 * @file Analyzer for detecting React component props
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * PropAnalyzer identifies and analyzes props used within React components. It detects
 * props through various patterns including direct props access, destructured parameters,
 * and variable declarations. The analyzer provides insights into component interfaces
 * and prop usage patterns, which is crucial for documentation and type inference.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new PropAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.props); // Array of { name, type, isOptional }
 */

import { ASTParser } from '../parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext } from '../context/ComponentContext';

export class PropAnalyzer extends BaseAnalyzer {
  name = 'PropAnalyzer';
  description = 'Analyzes component props';
  category = 'react';

  analyze(node: any, context: ComponentContext): void {
    const props: ComponentContext['props'] = [];

    ASTParser.traverseAST(node, path => {
      // Direct props access: props.title
      if (
        t.isMemberExpression(path.node) &&
        t.isIdentifier(path.node.object) &&
        path.node.object.name === 'props'
      ) {
        if (t.isIdentifier(path.node.property)) {
          props.push({
            name: path.node.property.name,
            type: 'any', // Default type since we can't infer it from usage
            isOptional: true,
          });
        }
      }

      // Destructured props in function parameters: ({ title, content })
      if (t.isFunctionDeclaration(path.node) || t.isArrowFunctionExpression(path.node)) {
        path.node.params.forEach((param: any) => {
          if (t.isObjectPattern(param)) {
            param.properties.forEach(prop => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                props.push({
                  name: prop.key.name,
                  type: 'any', // Default type since we can't infer it from usage
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
        path.node.init.name === 'props'
      ) {
        if (t.isObjectPattern(path.node.id)) {
          path.node.id.properties.forEach((prop: any) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              props.push({
                name: prop.key.name,
                type: 'any', // Default type since we can't infer it from usage
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
