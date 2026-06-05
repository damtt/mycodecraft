import { Fragment } from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';

/*
 * Renders lesson prose as Markdown so code reads as code. Content authors wrap
 * code in backticks: inline `<p>Hello, world!</p>` becomes one <code> chip, and
 * a fenced block
 *   ```
 *   h1 { color: red; }
 *   ```
 * becomes a multi-line code block. Works for HTML, CSS, and JS alike.
 *
 * Raw HTML is NOT rendered (react-markdown's safe default), so any kid-facing
 * tag MUST live inside backticks — the content-integrity test enforces this so
 * a forgotten backtick can't make a tag silently vanish.
 */
const components: Components = {
  // Lesson text lives inside our own block elements, so unwrap paragraphs.
  p: ({ children }) => <Fragment>{children}</Fragment>,
  // Inline code → chip.
  code: ({ children }) => (
    <code className="mx-0.5 rounded bg-night px-1.5 py-0.5 font-mono text-[0.85em] text-diamond">
      {children}
    </code>
  ),
  // Fenced block → code block (reset the inner <code> chip styling).
  pre: ({ children }) => (
    <pre className="my-1 overflow-x-auto rounded-md bg-night p-3 font-mono text-sm leading-snug text-diamond [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
      {children}
    </pre>
  ),
};

export default function LessonText({ text }: { text: string }) {
  return <Markdown components={components}>{text}</Markdown>;
}
