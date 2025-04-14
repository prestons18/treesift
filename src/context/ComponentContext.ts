export interface ComponentContext {
  name: string;
  filePath: string; // Relative path to source file
  exportType: "default" | "named"; // Export style

  props: {
    name: string;
    type: string;
    defaultValue?: string;
    isOptional: boolean;
    description?: string;
  }[];

  hooks: {
    name: string;
    arguments?: string[];
  }[];

  cvaConfigs: {
    variableName: string;
    configObject: string; // Stringified or parsed object
  }[];

  classNames: {
    importSource: string | null;
    importName: string | null;
    usages: Array<{
      line: number;
      column: number;
      arguments: string[];
    }>;
  };

  stylingLibrary: {
    type:
      | "tailwind"
      | "css-modules"
      | "styled-components"
      | "emotion"
      | "custom"
      | "unknown";
    confidence: number; // 0-100 confidence score
    indicators: string[]; // Specific indicators that led to this conclusion
  };

  contexts: {
    consumes: string[]; // Contexts used via useContext
    provides: string[]; // Contexts created via createContext
  };

  dependencies: {
    components: string[]; // Other components used in JSX
    packages: string[]; // External packages imported
  };

  hocWrappers: string[]; // e.g., ['memo', 'forwardRef', 'observer']

  description?: string; // JSDoc extracted component summary
  location?: {
    line: number;
    column: number;
  };
}
