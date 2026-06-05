import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { autocompletion } from '@codemirror/autocomplete';

interface CodeEditorProps {
  /** Initial document. Parent must remount (key=quest.id) to change it. */
  initialValue: string;
  onChange(value: string): void;
}

/**
 * Kid-friendly CodeMirror 6. All quests edit a full HTML document (lang-html
 * highlights nested CSS/JS too). Uncontrolled by design: CodeMirror owns the
 * text; React only hears about changes.
 */
export default function CodeEditor({ initialValue, onChange }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      doc: initialValue,
      parent: hostRef.current,
      extensions: [
        basicSetup,
        autocompletion({ override: [] }), // no popups while kids type — re-enable deliberately later
        html(),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': { fontSize: '15px', height: '100%' },
          '.cm-scroller': { fontFamily: 'ui-monospace, monospace' },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; remount via key
  }, []);

  return <div ref={hostRef} aria-label="Code editor" data-testid="code-editor" className="h-full overflow-hidden rounded-lg" />;
}
