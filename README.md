# 🌳 TreeSift

A minimal, zero-bloat Abstract Syntax Tree (AST) analysis library for JavaScript and TypeScript — built for component discovery, documentation pipelines, design systems, and visual tooling.

---

## ⚡ What is TreeSift?

TreeSift helps you understand your code, automatically.

It parses and analyzes component source files, extracting structured metadata — like names, props, hooks, patterns, and design conventions — ready for use in documentation tools, design systems, and UI builders.

Whether you're mapping a large codebase, generating docs, or creating intelligent design workflows, TreeSift is designed to be the foundation.

---

## ✅ Features

| Capability                         | Description                                                                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🏷 **Component Name Detection**    | Intelligently detects component names and their declaration types (function, class, arrow function, forwardRef). Handles both default and named exports with proper naming convention validation.             |
| 🧾 **Props Analysis**              | Comprehensive props analysis including direct props access, destructured parameters, and variable declarations. Tracks prop types and optionality for better type inference.                                  |
| ⚓ **React Hook Detection**        | Sophisticated hook detection system that identifies both built-in React hooks (useState, useEffect, etc.) and custom hooks following the 'use' prefix convention. Extracts hook arguments and usage patterns. |
| 🎛 **CVA Configuration Analysis**  | Deep analysis of Class Variance Authority (CVA) configurations, extracting base styles, variants, default variants, and compound variants. Perfect for documenting component styling systems.                 |
| 🎨 **ClassNames Utility Analysis** | Advanced detection of className utility usage (cn, clsx, classnames) with support for conditional classes, template literals, nested utility calls, and location tracking.                                    |
| 🧵 **Styling Library Detection**   | Smart detection of styling approaches with confidence scoring. Identifies Tailwind CSS, styled-components, Emotion, and CSS Modules through import analysis, class patterns, and API usage.                   |
| 📦 **Import/Export Resolution**    | Robust tracking of component dependencies and module relationships. Analyzes both default and named exports, handling various export patterns including re-exports.                                           |
| 🧱 **JSX Element Analysis**        | Detailed analysis of JSX elements within components, including built-in HTML elements, custom components, props, attributes, children elements, and component composition patterns.                           |

---

## 🧠 Designed For

- 📚 **Documentation Generators**
- 🧩 **Design System Metadata Extraction**
- 🔬 **Static Code Analysis**
- ⚡ **Visual UI Builders & Render Engines**

TreeSift is meant to integrate deeply with your development tooling — from pipelines to playgrounds.

---

## 💡 Example Usage

```ts
import { TreeSift } from 'treesift';

const result = TreeSift.analyze('/path/to/Component.tsx');

console.log(result);
/*
{
  name: 'MyComponent',
  filePath: 'test',
  exportType: 'default',
  type: 'FunctionDeclaration',
  props: [
    { name: 'data', type: 'any', isOptional: true },
    { name: 'title', type: 'any', isOptional: true }
  ],
  hooks: [
    { name: 'useState', arguments: ['0'] },
    { name: 'useEffect', arguments: ['() => {...}', '[count]'] }
  ],
  cvaConfigs: [
    {
      variableName: 'buttonVariants',
      configObject: {
        base: 'px-4 py-2 rounded',
        variants: {
          intent: {
            primary: 'bg-blue-500 text-white',
            secondary: 'bg-gray-200 text-gray-800'
          },
          size: {
            small: 'text-sm',
            large: 'text-lg'
          }
        },
        defaultVariants: {
          intent: 'primary',
          size: 'small'
        },
        compoundVariants: []
      }
    }
  ],
  classNames: {
    importSource: 'clsx',
    importName: 'cn',
    usages: [
      {
        line: 33,
        column: 30,
        arguments: ['font-bold', 'count > 5 ? "text-red-500" : "text-green-500"']
      }
    ]
  },
  classNamesUsage: {
    hasClassNames: true,
    importSource: 'clsx',
    usage: [
      {
        type: 'cn',
        arguments: [
          { type: 'string', value: 'font-bold' },
          { type: 'conditional', value: { condition: 'count > 5', trueValue: 'text-red-500', falseValue: 'text-green-500' } }
        ],
        location: { line: 33, column: 30 }
      }
    ]
  },
  dependencies: {
    packages: [
      'react',
      './hooks/useCustom',
      '../utils/helpers',
      'clsx',
      'class-variance-authority',
      'tailwindcss/tailwind.css'
    ]
  },
  jsxStructure: [
    { name: 'section', props: [], children: [], attributes: [] },
    { name: 'h1', props: [], children: [], attributes: [{ name: 'className', value: 'text-2xl font-bold' }] },
    { name: 'CustomComponent', props: [{ name: 'someProp', value: 'count', isSpread: false }], children: [], attributes: [] },
    { name: 'div', props: [], children: [{ type: 'text', content: 'Class Component' }], attributes: [] },
    { name: 'button', props: [], children: [{ type: 'text', content: 'Click me' }], attributes: [{ name: 'className', value: null, isSpread: false }] }
  ],
  contexts: { consumes: [], provides: [] },
  hocWrappers: [],
  stylingLibrary: {
    type: 'tailwind',
    confidence: 100,
    indicators: [
      'Imports from clsx',
      'Imports from tailwindcss/tailwind.css',
      'Imports CSS file: tailwindcss/tailwind.css',
      'Uses Tailwind-like class: text-2xl font-bold'
    ]
  }
}
*/
```
