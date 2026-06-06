import { useRef } from 'react';
import CodeEditor, { type CodeEditorHandle } from '../../features/editor/CodeEditor';
import InsertToolbar from '../../features/editor/InsertToolbar';

interface EditorPaneProps {
  questId: string;
  initialValue: string;
  onChange: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
  className?: string;
}

export default function EditorPane({ questId, initialValue, onChange, onFocusChange, className = '' }: EditorPaneProps) {
  const editorRef = useRef<CodeEditorHandle>(null);
  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg bg-[#1e1e2e] p-1 ${className}`}>
      <InsertToolbar onInsert={(text) => editorRef.current?.insertText(text)} />
      {/* Absolute-inset fill: CodeMirror needs a definite-height host, and an
          absolutely-positioned box fills its flex-1 parent regardless of the
          percentage-height resolution quirks that bite plain h-full in flex chains. */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <CodeEditor key={questId} ref={editorRef} initialValue={initialValue} onChange={onChange} onFocusChange={onFocusChange} />
        </div>
      </div>
    </div>
  );
}
