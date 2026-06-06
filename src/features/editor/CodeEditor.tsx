import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { autocompletion } from '@codemirror/autocomplete';
import { codecraftEditorTheme } from './theme';

export interface CodeEditorHandle {
  insertText(text: string): void;
}

interface CodeEditorProps {
  /** Initial document. Parent must remount (key=quest.id) to change it. */
  initialValue: string;
  onChange(value: string): void;
  /** Fires true on focus, false on blur — drives the Guide Buddy auto-hide. */
  onFocusChange?(focused: boolean): void;
}

/**
 * Kid-friendly CodeMirror 6. All quests edit a full HTML document (lang-html
 * highlights nested CSS/JS too). Uncontrolled by design: CodeMirror owns the
 * text; React only hears about changes. Exposes insertText() for the touch
 * InsertToolbar.
 */
function CodeEditorImpl(
  { initialValue, onChange, onFocusChange }: CodeEditorProps,
  ref: React.Ref<CodeEditorHandle>,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onFocusRef = useRef(onFocusChange);
  onFocusRef.current = onFocusChange;

  useImperativeHandle(ref, () => ({
    insertText(text: string) {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch(view.state.replaceSelection(text));
      view.focus();
    },
  }), []);

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
        codecraftEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
        EditorView.domEventHandlers({
          focus: () => onFocusRef.current?.(true),
          blur: () => onFocusRef.current?.(false),
        }),
      ],
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
      // destroy() removes the focused contentDOM without firing blur — clear the
      // focus flag ourselves so consumers (Guide Buddy) don't stay stuck "focused".
      onFocusRef.current?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; remount via key
  }, []);

  return <div ref={hostRef} aria-label="Code editor" data-testid="code-editor" className="h-full overflow-hidden rounded-lg" />;
}

const CodeEditor = forwardRef(CodeEditorImpl);
export default CodeEditor;
