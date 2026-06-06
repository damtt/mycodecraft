import { type ReactNode } from 'react';
import Icon, { isIconName } from './Icon';

/**
 * Renders a plain string, swapping `[icon:name]` tokens for inline `<Icon>`s.
 * Lets bilingual content strings (e.g. guide bubbles) carry icons without
 * embedding JSX. An unknown name is left as literal text so a typo is visible
 * rather than silently dropped.
 */
const TOKEN = /\[icon:([a-z0-9-]+)\]/g;

export default function IconText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(isIconName(match[1]) ? <Icon key={match.index} name={match[1]} /> : match[0]);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <>{parts}</>;
}
