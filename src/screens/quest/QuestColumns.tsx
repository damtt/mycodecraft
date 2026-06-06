import type { ReactNode } from 'react';

/** Tablet/desktop layout (>=768px): lesson left, editor over preview right. */
export default function QuestColumns({ lesson, editor, preview }: { lesson: ReactNode; editor: ReactNode; preview: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 gap-3">
      <div className="flex w-2/5 min-h-0 flex-col">{lesson}</div>
      <div className="flex w-3/5 min-h-0 flex-col gap-3">
        <div className="flex min-h-0 flex-1 flex-col">{editor}</div>
        <div className="flex min-h-0 flex-1 flex-col">{preview}</div>
      </div>
    </div>
  );
}
