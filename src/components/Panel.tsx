import type { HTMLAttributes } from 'react';

/** Paper card with the chunky pixel border from index.css. */
export default function Panel({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`pixel-border rounded-sm bg-paper p-4 ${className}`} />;
}
