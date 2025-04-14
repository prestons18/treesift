/**
 * @file Core implementation of TreeSift - A JavaScript/TypeScript AST analysis library
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * This is the core implementation of the TreeSift library, which provides a comprehensive
 * set of analyzers for React components. It coordinates the execution of various analyzers
 * to extract information about component structure, props, hooks, styling, and more.
 * The library is designed to be extensible and can be used for documentation generation,
 * design system tooling, and static code analysis.
 */

import { HookAnalyzer } from "../analyzers/HookAnalyzer";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";
import { PropAnalyzer } from "../analyzers/PropAnalyzer";
import { ExportAnalyzer } from "../analyzers/ExportAnalyzer";
import { JSXElementAnalyzer } from "../analyzers/JSXElementAnalyzer";
import { CVAAnalyzer } from "../analyzers/CVAAnalyzer";
import { ClassNamesAnalyzer } from "../analyzers/ClassNamesAnalyzer";
import { StylingLibraryAnalyzer } from "../analyzers/StylingLibraryAnalyzer";
import { ComponentNameAnalyzer } from "../analyzers/ComponentNameAnalyzer";
import { ComponentContext } from "../context/ComponentContext";
import { ASTParser } from "../parser/ASTParser";

export class TreeSift {
  /**
   * Analyzes a React component file and returns a comprehensive analysis
   * @param filePath - Path to the component file to analyze
   * @returns ComponentContext with analysis results
   */
  static analyze(filePath: string): ComponentContext {
    // In a real implementation, this would read the file
    // For now, we'll use the example code
    const code = `
import React, { useState, useEffect } from "react";
import CustomHook from "./hooks/useCustom";
import { helper } from "../utils/helpers";
import { cn } from "clsx";
import { cva } from "class-variance-authority";
import "tailwindcss/tailwind.css";

const buttonVariants = cva(
  "px-4 py-2 rounded",
  {
    variants: {
      intent: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-200 text-gray-800",
      },
      size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "small",
    },
  }
);

export const MyComponent = (props) => {
    const [count, setCount] = useState(0);
    const result = CustomHook(props.data);
    const buttonClass = cn(
      "font-bold",
      count > 5 ? "text-red-500" : "text-green-500"
    );

    useEffect(() => {
        console.log(count);
    }, [count]);

    return (
        <section>
            <h1 className="text-2xl font-bold">{props.title}</h1>
            <CustomComponent someProp={count} />
            <div className={buttonClass}>{result}</div>
            <button className={buttonVariants({ intent: "secondary", size: "large" })}>
              Click me
            </button>
        </section>
    );
}

export default MyComponent;
`;

    // Parse the code into an AST
    const ast = ASTParser.parseCode(code);

    // Create a component context to store analysis results
    const context: ComponentContext = {
      name: "Unknown",
      filePath: filePath,
      exportType: "default",
      props: [],
      hooks: [],
      cvaConfigs: [],
      contexts: {
        consumes: [],
        provides: [],
      },
      dependencies: {
        components: [],
        packages: [],
      },
      hocWrappers: [],
      classNames: {
        importSource: null,
        importName: null,
        usages: [],
      },
      stylingLibrary: {
        type: "unknown",
        confidence: 0,
        indicators: [],
      },
    };

    // Run all analyzers
    const componentNameAnalyzer = new ComponentNameAnalyzer();
    componentNameAnalyzer.analyze(ast, context);

    const importAnalyzer = new ImportAnalyzer();
    importAnalyzer.analyze(ast, context);

    const propAnalyzer = new PropAnalyzer();
    propAnalyzer.analyze(ast, context);

    const hookAnalyzer = new HookAnalyzer();
    hookAnalyzer.analyze(ast, context);

    const exportAnalyzer = new ExportAnalyzer();
    exportAnalyzer.analyze(ast, context);

    const jsxElementAnalyzer = new JSXElementAnalyzer();
    jsxElementAnalyzer.analyze(ast, context);

    const cvaAnalyzer = new CVAAnalyzer();
    cvaAnalyzer.analyze(ast, context);

    const classNamesAnalyzer = new ClassNamesAnalyzer();
    classNamesAnalyzer.analyze(ast, context);

    const stylingLibraryAnalyzer = new StylingLibraryAnalyzer();
    stylingLibraryAnalyzer.analyze(ast, context);

    return context;
  }
}
