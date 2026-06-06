/**
 * Pixel-art icon from `public/images/icons/`. Renders at 1em square so it
 * inherits the surrounding font-size — drop it where an emoji used to sit and
 * existing text-size classes keep controlling its scale. `[image-rendering:
 * pixelated]` keeps the art crisp when scaled up.
 *
 * Decorative by default (`alt=''` → aria-hidden); pass `alt` when the icon is
 * the only label for its control.
 */

// Every file in public/images/icons (minus .png). The union makes a typo or a
// missing asset a compile error.
export const ICON_NAMES = [
  'aquarius', 'aries', 'baseball', 'black-ball', 'black-square', 'black-tile',
  'blast', 'blue-ball', 'blue-orb', 'blue-tile', 'book', 'box-2', 'box', 'brain',
  'bricks', 'bulb', 'button', 'calculator', 'cart', 'cat', 'chart', 'check-2',
  'check', 'coffee', 'compass', 'copyright', 'diamond', 'die', 'dirt', 'divide',
  'document', 'down', 'eye', 'family', 'feather', 'fire', 'fist', 'flag',
  'flashlight', 'folder', 'forbidden', 'fox', 'frame', 'frog', 'gamepad', 'gear',
  'gemini', 'globe-2', 'globe-3', 'globe', 'gold-square', 'gold-tile',
  'green-tile', 'hand', 'handshake', 'heart-2', 'heart-3', 'heart', 'hourglass',
  'house', 'keyboard', 'ladder', 'letters', 'lightning', 'lock', 'log', 'loop',
  'map', 'medal', 'monster-2', 'monster', 'muscle', 'muted', 'next', 'ophiuchus',
  'orange-tile', 'owl', 'palette', 'party', 'pencil', 'pickaxe-2', 'pickaxe',
  'picture', 'pig', 'plus', 'potion', 'previous', 'purple-tile', 'puzzle',
  'question', 'rail', 'recycle', 'red-ball', 'red-orb', 'red-tile', 'robot',
  'rock', 'rocket', 'sagittarius', 'sailboat', 'seedling', 'shield', 'sign',
  'skull', 'sliders', 'soccer', 'sparkle', 'star', 'sun-2', 'sun', 'sunflower',
  'tag', 'taurus', 'tent', 'toolbox', 'tools', 'trophy', 'up-arrow', 'volume',
  'warning', 'watch', 'white-ball', 'white-tile', 'window', 'wolf', 'x-2', 'x',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const NAME_SET: ReadonlySet<string> = new Set(ICON_NAMES);

/** True when a value names an icon asset — used to keep legacy emoji avatars working. */
export function isIconName(value: string): value is IconName {
  return NAME_SET.has(value);
}

interface IconProps {
  name: IconName;
  alt?: string;
  className?: string;
}

export default function Icon({ name, alt = '', className = '' }: IconProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/icons/${name}.png`}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      draggable={false}
      className={`inline-block h-[1em] w-[1em] object-contain align-[-0.125em] [image-rendering:pixelated] ${className}`}
    />
  );
}
