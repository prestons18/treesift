/**
 * @file Test file for TreeSift
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 15/04/24
 */

// Add type declaration for console (very silly stuff)
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
};

import { TreeSift } from './index';
import chalk from 'chalk';

// ANSI color codes for terminal output
const colors = {
  title: chalk.bold.cyan,
  subtitle: chalk.bold.magenta,
  label: chalk.yellow,
  value: chalk.white,
  component: chalk.green,
  prop: chalk.blue,
  child: chalk.cyan,
  attribute: chalk.magenta,
  usage: chalk.yellow,
  separator: chalk.gray,
  highlight: chalk.bold.white,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
};

// Helper functions for formatting
const format = {
  separator: (length = 50): string => colors.separator('─'.repeat(length)),
  title: (text: string): string => `\n${colors.title(`📊 ${text}`)}`,
  subtitle: (text: string): string => `\n${colors.subtitle(`🔍 ${text}`)}`,
  keyValue: (key: string, value: string): string => `${colors.label(key)}: ${colors.value(value)}`,
  listItem: (index: number, text: string): string => `${colors.component(`  ${index}. ${text}`)}`,
  warning: (text: string): string => colors.warning(`  ${text}`),
  treeItem: (indent: number, isLast: boolean, text: string): string => {
    const prefix = indent > 0 ? (isLast ? '└─' : '├─') : '';
    return '  '.repeat(indent) + prefix + ' ' + text;
  },
};

// Test the TreeSift analyzer
const result = TreeSift.analyze('test', true); // Value is hardcoded

// Output the results
console.log('\n' + colors.highlight('🌳 TreeSift Component Analysis'));
console.log(format.separator(50));

// Basic component information
console.log(format.title('Component Overview'));
console.log(format.separator());
console.log(format.keyValue('Name', result.name));
console.log(format.keyValue('Type', result.type));
console.log(format.keyValue('Export Type', result.exportType));
console.log(format.keyValue('File Path', result.filePath));

// Props information
console.log(format.subtitle('Props'));
console.log(format.separator(30));
if (result.props.length > 0) {
  result.props.forEach((prop, index) => {
    console.log(format.listItem(index + 1, `${prop.name}${prop.isOptional ? ' (optional)' : ''}`));
    if (prop.type) console.log(`     ${format.keyValue('Type', prop.type)}`);
    if (prop.defaultValue) console.log(`     ${format.keyValue('Default', prop.defaultValue)}`);
    if (prop.description) console.log(`     ${format.keyValue('Description', prop.description)}`);
  });
} else {
  console.log(format.warning('No props detected'));
}

// Hooks information
console.log(format.subtitle('Hooks'));
console.log(format.separator(30));
if (result.hooks.length > 0) {
  result.hooks.forEach((hook, index) => {
    console.log(format.listItem(index + 1, hook.name));
    if (hook.arguments?.length) {
      console.log(`     ${format.keyValue('Arguments', hook.arguments.join(', '))}`);
    }
  });
} else {
  console.log(format.warning('No hooks detected'));
}

// CVA Configs information
console.log(format.subtitle('CVA Configs'));
console.log(format.separator(30));
if (result.cvaConfigs.length > 0) {
  result.cvaConfigs.forEach((config, index) => {
    console.log(format.listItem(index + 1, config.variableName));
    console.log(`     ${format.keyValue('Config', config.configObject)}`);
  });
} else {
  console.log(format.warning('No CVA configs detected'));
}

// Styling information
console.log(format.subtitle('Styling'));
console.log(format.separator(30));
console.log(
  format.keyValue(
    'Library',
    `${result.stylingLibrary.type} (${result.stylingLibrary.confidence}% confidence)`
  )
);
if (result.stylingLibrary.indicators.length > 0) {
  console.log(`  ${colors.label('Indicators')}:`);
  result.stylingLibrary.indicators.forEach((indicator, index) => {
    console.log(`     ${index + 1}. ${colors.value(indicator)}`);
  });
}

// Dependencies information
console.log(format.subtitle('Dependencies'));
console.log(format.separator(30));
if (result.dependencies.packages.length > 0) {
  console.log(`  ${colors.label('Packages')}:`);
  result.dependencies.packages.forEach((pkg, index) => {
    console.log(`     ${index + 1}. ${colors.value(pkg)}`);
  });
} else {
  console.log(format.warning('No package dependencies detected'));
}

// JSX Elements information
console.log(format.title('JSX Structure'));
console.log(format.separator());
if (result.dependencies.components.length > 0) {
  // Create a tree-like structure for JSX elements
  const renderJSXTree = (elements: typeof result.dependencies.components, level = 0): void => {
    elements.forEach((element, index) => {
      const isLast = index === elements.length - 1;
      console.log(format.treeItem(level, isLast, colors.component(element.name)));

      // Display props
      if (element.props.length > 0) {
        const propIndent = level + 1;
        element.props.forEach((prop, propIndex) => {
          const isLastProp = propIndex === element.props.length - 1;
          const propText = prop.isSpread
            ? colors.prop(`...${prop.name}`)
            : `${colors.prop(prop.name)}${prop.value ? `: ${colors.value(prop.value)}` : ''}`;
          console.log(format.treeItem(propIndent, isLastProp, propText));
        });
      }

      // Display children
      if (element.children.length > 0) {
        const childIndent = level + 1;
        element.children.forEach((child, childIndex) => {
          const isLastChild = childIndex === element.children.length - 1;
          const childText = `${colors.child(`[${child.type}]`)} ${colors.value(child.content)}`;
          console.log(format.treeItem(childIndent, isLastChild, childText));
        });
      }
    });
  };

  renderJSXTree(result.dependencies.components);
} else {
  console.log(format.warning('No JSX elements detected'));
}

// ClassNames information
console.log(format.title('ClassNames Usage'));
console.log(format.separator());
if (result.classNames.importSource) {
  console.log(
    format.keyValue(
      'Import',
      `${result.classNames.importName} from ${result.classNames.importSource}`
    )
  );

  if (result.classNames.usages.length > 0) {
    console.log(`\n${colors.subtitle('Usages')}:`);
    result.classNames.usages.forEach((usage, index) => {
      console.log(`  ${colors.usage(`${index + 1}. Line ${usage.line}, Column ${usage.column}`)}`);
      console.log(`     ${colors.label('Arguments')}: ${colors.value(usage.arguments.join(', '))}`);
    });
  } else {
    console.log(format.warning('No usages found'));
  }
} else {
  console.log(format.warning('No className utility detected'));
}

// Footer
console.log('\n' + format.separator(50));
console.log(colors.highlight('✨ Analysis complete'));
console.log(colors.separator('TreeSift - React Component Analysis Tool'));
