/**
 * @file Analyzer for detecting import statements
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ImportAnalyzer identifies and tracks import statements within React components.
 * It collects information about external package dependencies and internal module
 * imports, which is essential for understanding component dependencies and
 * building dependency graphs.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new ImportAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.dependencies.packages); // Array of import sources
 */

import { ASTParser } from 'src/parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext } from '../context/ComponentContext';

export class ImportAnalyzer extends BaseAnalyzer {
  name = 'ImportAnalyzer';
  description = 'Analyzes import statements';
  category = 'react';

  analyze(node: any, context: ComponentContext): void {
    const imports: Set<string> = new Set();

    ASTParser.traverseAST(node, path => {
      if (t.isImportDeclaration(path.node)) {
        const source = path.node.source.value;
        imports.add(source);
      }
    });

    // Store results in context
    context.dependencies.packages = Array.from(imports);
  }
}
