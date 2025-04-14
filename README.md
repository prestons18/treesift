# 🌳 TreeSift

A clean, minimal Abstract Syntax Tree (AST) analysis library for JavaScript and TypeScript —  
built for component discovery, documentation pipelines, and design system tooling.

---

## ⚡ What is TreeSift?

TreeSift is a lightweight foundation for code analysis, designed to help understand and map your components, props, and patterns.

Right now it's simple — but the goal is to turn this into a flexible, extendable, and rock-solid backbone for automated component documentation, intelligent design system integration, and even visual tooling.

---

## ✅ Current Features

| Capability             | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `Component Name`       | Detects functional or class component names.                 |
| `Props Detection`      | Lists typed or directly declared props.                      |
| `React Hook Detection` | Detects hooks like `useState`, `useEffect`, `useMemo` etc.   |
| `CVA Config Detection` | Identifies `class-variance-authority` (CVA) style configs.   |
| `Imports / Exports`    | Resolves imports and exports from your component files.      |
| `JSX Elements`         | Lists JSX elements used within your component's render tree. |

---

## 🧠 Designed For

TreeSift is being built to support a wide range of workflows, including:

- 📚 **Documentation Generators**
- 🧩 **Design System Metadata Extraction**
- 🔬 **Static Code Analysis**
- ⚡ **Visual UI Builders**

While still early, the goal is to make the library smart enough to feed into anything from docs to rendering engines.

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
  imports: [...],
  exports: [...],
  jsxElements: ['button', 'Icon']
}
*/
```
