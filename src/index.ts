import { HookAnalyzer } from "./analyzers/HookAnalyzer";
import { ImportAnalyzer } from "./analyzers/ImportAnalyzer";
import { PropAnalyzer } from "./analyzers/PropAnalyzer";
import { ExportAnalyzer } from "./analyzers/ExportAnalyzer";
import { JSXElementAnalyzer } from "./analyzers/JSXElementAnalyzer";
import { ComponentContext } from "./context/ComponentContext";
import { ASTParser } from "./parser/ASTParser";

const code = `
import React, { useState, useEffect } from "react";
import CustomHook from "./hooks/useCustom";
import { helper } from "../utils/helpers";

export const MyComponent = (props) => {
    const [count, setCount] = useState(0);
    const result = CustomHook(props.data);

    useEffect(() => {
        console.log(count);
    }, [count]);

    return (
        <section>
            <h1>{props.title}</h1>
            <CustomComponent someProp={count} />
            <div className="info">{result}</div>
        </section>
    );
}

export default MyComponent;
`;

// Parse the code into an AST
const ast = ASTParser.parseCode(code);

// Create a component context to store analysis results
const context: ComponentContext = {
  name: "MyComponent",
  filePath: "src/components/MyComponent.tsx",
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
};

// Run all analyzers
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

// Output the entire ComponentContext
console.log("Component Context:", JSON.stringify(context, null, 2));
