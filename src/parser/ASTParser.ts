import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;

export class ASTParser {
  static parseCode(code: string) {
    return parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  }

  static traverseAST(ast: t.File, callback: (path: any) => void) {
    traverse(ast, {
      enter(path: any) {
        callback(path);
      },
    });
  }
}
