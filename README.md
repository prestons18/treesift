# 🌳 TreeSift

A minimal, zero-bloat Abstract Syntax Tree (AST) analysis library for JavaScript and TypeScript — built for component discovery, documentation pipelines, design systems, and visual tooling.

---

## ⚡ What is TreeSift?

TreeSift helps you understand your code, automatically.

It parses and analyzes component source files, extracting structured metadata — like names, props, hooks, patterns, and design conventions — ready for use in documentation tools, design systems, and UI builders.

Whether you’re mapping a large codebase, generating docs, or creating intelligent design workflows, TreeSift is designed to be the foundation.

---

## ✅ Features

| Capability                   | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| 🏷 **Component Name Detection**    | Detects functional and class-based component names.                  |
| 🧾 **Props Detection**             | Lists typed or directly declared props.                              |
| ⚓ **React Hook Detection**        | Detects usage of hooks like `useState`, `useEffect`, `useMemo`, etc.  |
| 🎛 **CVA Config Detection**        | Identifies `class-variance-authority` (CVA) style configs.            |
| 🎨 **ClassNames Utility Detection**| Detects `clsx`, `cn`, or `classNames` utility usage.                  |
| 🧵 **Styling Library Detection**   | Identifies styling approaches like Tailwind, CSS Modules, etc.        |
| 📦 **Import / Export Resolution**  | Resolves component imports and exports.                               |
| 🧱 **JSX Element Detection**       | Lists JSX elements used in your component's render tree.              |

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
import { TreeSift } from "treesift";

const result = TreeSift.analyze("/path/to/Component.tsx");

console.log(result);
/*
{
  name: 'MyButton',
  props: ['variant', 'size'],
  hooks: ['useState', 'useEffect'],
  cvaConfigs: ['buttonVariants'],
  classNames: {
    importSource: 'clsx',
    importName: 'cn',
    usages: [
      { line: 25, column: 10, arguments: ['font-bold', 'text-red-500'] }
    ]
  },
  stylingLibrary: {
    type: 'tailwind',
    confidence: 60,
    indicators: ['Imports from clsx', 'Imports from tailwindcss', 'Uses Tailwind-like class: text-2xl']
  },
  imports: [...],
  exports: [...],
  jsxElements: ['button', 'Icon']
}
*/
