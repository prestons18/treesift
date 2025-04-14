/**
 * @file Main entry point for TreeSift - A JavaScript/TypeScript AST analysis library
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * This is the core entry point for the TreeSift library, which provides a comprehensive
 * set of analyzers for React components. It coordinates the execution of various analyzers
 * to extract information about component structure, props, hooks, styling, and more.
 * The library is designed to be extensible and can be used for documentation generation,
 * design system tooling, and static code analysis.
 *
 * Usage:
 * ------------------------------------------------------
 * import { TreeSift } from "treesift";
 * const result = TreeSift.analyze("/path/to/Component.tsx");
 */

import { TreeSift } from './core/TreeSift';
import type { ComponentContext } from './context/ComponentContext';

// Re-export the main TreeSift class and types
export { TreeSift };
export type { ComponentContext };

// Export individual analyzers for direct use if needed
export { ComponentNameAnalyzer } from './analyzers/ComponentNameAnalyzer';
export { PropAnalyzer } from './analyzers/PropAnalyzer';
export { HookAnalyzer } from './analyzers/HookAnalyzer';
export { CVAAnalyzer } from './analyzers/CVAAnalyzer';
export { ClassNamesAnalyzer } from './analyzers/ClassNamesAnalyzer';
export { StylingLibraryAnalyzer } from './analyzers/StylingLibraryAnalyzer';
export { ImportAnalyzer } from './analyzers/ImportAnalyzer';
export { ExportAnalyzer } from './analyzers/ExportAnalyzer';
export { JSXElementAnalyzer } from './analyzers/JSXElementAnalyzer';
export { BaseAnalyzer } from './analyzers/BaseAnalyzer';
