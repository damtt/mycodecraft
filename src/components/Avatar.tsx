import Icon, { isIconName } from './Icon';

/**
 * Renders a player avatar. New profiles store an icon name (e.g. 'fox') and get
 * a pixel-art `<Icon>`; profiles saved before the icon switch hold a raw emoji
 * string, which we keep rendering as text so no migration is needed.
 */
export default function Avatar({
  value,
  alt = '',
  className = '',
}: {
  value: string;
  alt?: string;
  className?: string;
}) {
  if (isIconName(value)) return <Icon name={value} alt={alt} className={className} />;
  return (
    <span aria-hidden={alt === '' ? true : undefined} className={className}>
      {value}
    </span>
  );
}
