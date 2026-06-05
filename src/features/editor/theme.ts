import { EditorView } from 'codemirror';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/*
 * Kid-friendly dark editor theme for CodeCraft. The default CodeMirror
 * highlight style is built for a light background, so on our dark editor panel
 * the chrome (gutter, active line, cursor, selection) and several tokens had
 * poor contrast. This is a cohesive dark theme tuned for 9–12 year-olds:
 * - High contrast text on a dark slate that matches the editor wrapper.
 * - Comments are BRIGHT and readable (lesson instructions live in comments).
 * - On-brand diamond-cyan caret/selection so the cursor is easy to find.
 */
const BG = '#1e1e2e';
const FG = '#e4e6f0';
const DIAMOND = '#4aedd9';

const chrome = EditorView.theme(
  {
    '&': { color: FG, backgroundColor: BG, fontSize: '15px', height: '100%' },
    '.cm-content': { caretColor: DIAMOND, fontFamily: 'ui-monospace, monospace' },
    '.cm-scroller': { fontFamily: 'ui-monospace, monospace', lineHeight: '1.6' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-cursor': { borderLeftColor: DIAMOND, borderLeftWidth: '2px' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'rgba(74, 237, 217, 0.30)',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    '.cm-gutters': { backgroundColor: '#181826', color: '#8089ad', border: 'none' },
    '.cm-activeLineGutter': { backgroundColor: 'rgba(255, 255, 255, 0.07)', color: '#e4e6f0' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 10px' },
    '.cm-matchingBracket': { backgroundColor: 'rgba(74, 237, 217, 0.22)', color: FG },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#9ad6a3', fontStyle: 'italic' },
  { tag: [t.tagName, t.heading], color: '#7ec9ff' },
  { tag: t.angleBracket, color: '#7ec9ff' },
  { tag: t.attributeName, color: '#ffd479' },
  { tag: [t.attributeValue, t.string], color: '#c3e88d' },
  { tag: [t.keyword, t.modifier], color: '#d8a0ff' },
  { tag: [t.number, t.bool, t.atom], color: '#ff9e64' },
  { tag: t.propertyName, color: '#7ec9ff' },
  { tag: [t.variableName, t.definition(t.variableName)], color: FG },
  { tag: t.function(t.variableName), color: '#88aaff' },
  { tag: [t.operator, t.punctuation, t.bracket, t.separator], color: '#bac2de' },
]);

/** Drop-in extension array: dark chrome + kid-tuned syntax colors. */
export const codecraftEditorTheme = [chrome, syntaxHighlighting(highlight)];
