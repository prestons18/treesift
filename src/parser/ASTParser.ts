/**
 * @file Parser for converting code to Abstract Syntax Tree (AST)
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ASTParser provides utilities for parsing JavaScript/TypeScript code into an Abstract
 * Syntax Tree and traversing that tree. It uses Babel's parser and traverse utilities
 * to handle the complex task of parsing modern JavaScript with TypeScript and JSX support.
 * This parser is the foundation for all analyzers in the TreeSift library.
 *
 * Usage:
 * ------------------------------------------------------
 * const ast = ASTParser.parseCode(code);
 * ASTParser.traverseAST(ast, (path) => {
 *   // Process each node in the AST
 * });
 */

import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;

export class ASTParser {
  /**
   * Parses JavaScript/TypeScript code into an Abstract Syntax Tree
   * @param code - The source code to parse
   * @returns A Babel AST representation of the code
   */
  static parseCode(code: string) {
    return parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  }

  /**
   * Traverses an AST and calls the callback for each node
   * @param ast - The Abstract Syntax Tree to traverse
   * @param callback - Function to call for each node in the AST
   */
  static traverseAST(ast: t.File, callback: (path: any) => void) {
    traverse(ast, {
      enter(path: any) {
        callback(path);
      },
    });
  }
}
