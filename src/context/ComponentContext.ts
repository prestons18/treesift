/**
 * @file Interface defining the structure of component analysis results
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * ComponentContext defines the data structure that holds all analysis results
 * for a React component. It includes information about the component's name,
 * props, hooks, styling approach, dependencies, and more. This interface serves
 * as the central data model for the TreeSift library, providing a comprehensive
 * view of a component's structure and behavior.
 *
 * Usage:
 * ------------------------------------------------------
 * const context: ComponentContext = {
 *   name: "MyComponent",
 *   filePath: "src/components/MyComponent.tsx",
 *   exportType: "default",
 *   props: [{ name: "title", type: "string", isOptional: false }],
 *   // ... other properties
 * };
 */

/**
 * Interface representing a JSX element's analysis information
 */
export interface JSXElementInfo {
  /** Name of the element (component or HTML tag) */
  name: string;
  /** Props passed to the element */
  props: Array<{
    /** Name of the prop */
    name: string;
    /** Value of the prop if it's a literal or identifier */
    value: string | null;
    /** Whether this is a spread prop (...props) */
    isSpread: boolean;
  }>;
  /** Children of the element */
  children: Array<{
    /** Type of child (text, element, expression, or fragment) */
    type: 'text' | 'element' | 'expression' | 'fragment';
    /** Content of the child */
    content: string;
  }>;
  /** HTML attributes (for HTML elements only) */
  attributes: Array<{
    /** Name of the attribute */
    name: string;
    /** Value of the attribute */
    value: string | null;
  }>;
}

/**
 * Interface representing the complete analysis of a React component
 */
export interface ComponentContext {
  /** The name of the component */
  name: string;
  /** Relative path to the source file */
  filePath: string; // Relative path to source file
  /** Whether the component is exported as default or named export */
  exportType: 'default' | 'named'; // Export style

  /** Array of props used by the component */
  props: {
    /** Name of the prop */
    name: string;
    /** Type of the prop (string, number, etc.) */
    type: string;
    /** Default value if specified */
    defaultValue?: string;
    /** Whether the prop is optional */
    isOptional: boolean;
    /** Description from JSDoc if available */
    description?: string;
  }[];

  /** Array of hooks used by the component */
  hooks: {
    /** Name of the hook (useState, useEffect, etc.) */
    name: string;
    /** Arguments passed to the hook */
    arguments?: string[];
  }[];

  /** Class Variance Authority style configurations */
  cvaConfigs: {
    /** Name of the variable holding the CVA config */
    variableName: string;
    /** Stringified or parsed configuration object */
    configObject: string; // Stringified or parsed object
  }[];

  /** Information about className utility usage */
  classNames: {
    /** Source of the className utility import */
    importSource: string | null;
    /** Name of the imported utility (cn, clsx, etc.) */
    importName: string | null;
    /** Locations where the utility is used */
    usages: Array<{
      /** Line number in the source file */
      line: number;
      /** Column number in the source file */
      column: number;
      /** Arguments passed to the utility */
      arguments: string[];
    }>;
  };

  /** Dependencies of the component */
  dependencies: {
    /** Components used in the JSX */
    components: JSXElementInfo[];
    /** Package imports */
    packages: string[];
  };

  /** Context providers and consumers */
  contexts: {
    /** Contexts consumed by the component */
    consumes: string[];
    /** Contexts provided by the component */
    provides: string[];
  };

  /** Higher-order component wrappers */
  hocWrappers: string[];

  /** Styling library information */
  stylingLibrary: {
    /** Type of styling library used */
    type: 'tailwind' | 'styled-components' | 'emotion' | 'unknown';
    /** Confidence score of the detection */
    confidence: number;
    /** Indicators that led to the detection */
    indicators: string[];
  };

  /** Component description from JSDoc */
  description?: string; // JSDoc extracted component summary
  /** Location of the component in the source file */
  location?: {
    /** Line number */
    line: number;
    /** Column number */
    column: number;
  };
}
