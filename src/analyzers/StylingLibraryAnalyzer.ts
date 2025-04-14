/**
 * @file Analyzer for detecting styling libraries and approaches
 * @author Preston Arnold
 * @license MIT
 * @repository https://github.com/prestons18/treesift
 * @created 14/04/24
 * @lastModified 14/04/24
 *
 * Description:
 * ------------------------------------------------------
 * StylingLibraryAnalyzer identifies which styling approach or library is being used
 * in a React component. It detects various styling solutions including Tailwind CSS,
 * CSS Modules, styled-components, and Emotion. The analyzer uses a scoring system
 * to determine the most likely styling approach based on imports, class name patterns,
 * and usage of styling-specific APIs.
 *
 * Usage:
 * ------------------------------------------------------
 * const analyzer = new StylingLibraryAnalyzer();
 * analyzer.analyze(ast, componentContext);
 * console.log(componentContext.stylingLibrary); // { type, confidence, indicators }
 */

import { ASTParser } from 'src/parser/ASTParser';
import * as t from '@babel/types';
import { BaseAnalyzer } from './BaseAnalyzer';
import { ComponentContext } from '../context/ComponentContext';

type StylingLibrary = 'tailwind' | 'styled-components' | 'emotion' | 'unknown';

interface StylingScore {
  score: number;
  indicators: string[];
}

export class StylingLibraryAnalyzer extends BaseAnalyzer {
  name = 'StylingLibraryAnalyzer';
  description = 'Detects which styling library is being used in a component';
  category = 'styling';

  private readonly TAILWIND_CLASS_PATTERNS = [
    'text-',
    'bg-',
    'p-',
    'm-',
    'flex-',
    'grid-',
    'w-',
    'h-',
    'rounded-',
    'border-',
    'shadow-',
    'transition-',
    'hover:',
    'focus:',
    'active:',
    'disabled:',
    'dark:',
    'light:',
  ];

  analyze(node: any, context: ComponentContext): void {
    const scores = new Map<StylingLibrary, StylingScore>([
      ['tailwind', { score: 0, indicators: [] }],
      ['styled-components', { score: 0, indicators: [] }],
      ['emotion', { score: 0, indicators: [] }],
      ['unknown', { score: 0, indicators: [] }],
    ]);

    ASTParser.traverseAST(node, path => {
      this.analyzeImports(path.node, scores);
      this.analyzeClassNames(path.node, scores);
      this.analyzeStyledComponents(path.node, scores);
      this.analyzeEmotion(path.node, scores);
    });

    const [detectedType, confidence] = this.calculateConfidence(scores);

    context.stylingLibrary = {
      type: detectedType,
      confidence,
      indicators: scores.get(detectedType)?.indicators || ['No clear styling indicators found'],
    };
  }

  private analyzeImports(node: any, scores: Map<StylingLibrary, StylingScore>): void {
    if (!t.isImportDeclaration(node)) return;

    const source = node.source.value;
    if (typeof source !== 'string') return;

    const importScores: Record<string, { lib: StylingLibrary; score: number }> = {
      tailwind: { lib: 'tailwind', score: 30 },
      clsx: { lib: 'tailwind', score: 20 },
      'tailwind-merge': { lib: 'tailwind', score: 20 },
      'styled-components': { lib: 'styled-components', score: 50 },
      '@emotion/react': { lib: 'emotion', score: 50 },
    };

    for (const [pattern, { lib, score }] of Object.entries(importScores)) {
      if (source.includes(pattern)) {
        const current = scores.get(lib)!;
        current.score += score;
        current.indicators.push(`Imports from ${source}`);
      }
    }

    // CSS files are common with Tailwind
    if (source.endsWith('.css') && !source.endsWith('.module.css')) {
      const current = scores.get('tailwind')!;
      current.score += 15;
      current.indicators.push(`Imports CSS file: ${source}`);
    }
  }

  private analyzeClassNames(node: any, scores: Map<StylingLibrary, StylingScore>): void {
    if (
      !t.isJSXAttribute(node) ||
      !t.isJSXIdentifier(node.name) ||
      node.name.name !== 'className' ||
      !t.isStringLiteral(node.value)
    )
      return;

    const className = node.value.value;
    const hasTailwindClass = this.TAILWIND_CLASS_PATTERNS.some(pattern =>
      className.includes(pattern)
    );

    if (hasTailwindClass) {
      const current = scores.get('tailwind')!;
      current.score += 25;
      current.indicators.push(`Uses Tailwind-like class: ${className}`);
    }
  }

  private analyzeStyledComponents(node: any, scores: Map<StylingLibrary, StylingScore>): void {
    if (!t.isTaggedTemplateExpression(node) || !t.isIdentifier(node.tag)) return;

    const tagName = node.tag.name;
    if (tagName === 'styled' || tagName.endsWith('Styled')) {
      const current = scores.get('styled-components')!;
      current.score += 30;
      current.indicators.push(`Uses styled-components: ${tagName}`);
    }
  }

  private analyzeEmotion(node: any, scores: Map<StylingLibrary, StylingScore>): void {
    if (!t.isCallExpression(node) || !t.isIdentifier(node.callee) || node.callee.name !== 'css')
      return;

    const current = scores.get('emotion')!;
    current.score += 30;
    current.indicators.push('Uses Emotion css function');
  }

  private calculateConfidence(scores: Map<StylingLibrary, StylingScore>): [StylingLibrary, number] {
    let maxScore = 0;
    let detectedType: StylingLibrary = 'unknown';

    for (const [type, { score }] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        detectedType = type;
      }
    }

    if (detectedType === 'unknown') return ['unknown', 0];

    const indicatorCount = scores.get(detectedType)?.indicators.length || 0;
    let confidence = maxScore;

    // Boost confidence based on number of indicators
    confidence = Math.min(100, confidence + indicatorCount * 15);

    // Ensure minimum confidence based on indicator count
    if (indicatorCount >= 4) confidence = Math.max(confidence, 95);
    else if (indicatorCount >= 3) confidence = Math.max(confidence, 85);

    return [detectedType, Math.round(confidence)];
  }
}
