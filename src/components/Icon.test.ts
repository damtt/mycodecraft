import { ICON_NAMES, isIconName } from './Icon';
import { GUIDE } from '../features/guide/guideContent';

// The IconName union is hand-maintained, so its "missing asset = broken icon"
// guarantee only holds if the list and the asset folder stay in lockstep.
test('ICON_NAMES matches the files in public/images/icons exactly', () => {
  const files = Object.keys(import.meta.glob('/public/images/icons/*.png'))
    .map((path) => path.replace(/^.*\/(.+)\.png$/, '$1'))
    .sort();
  expect(files.length).toBeGreaterThan(0);
  expect([...ICON_NAMES].sort()).toEqual(files);
});

// Guide bubbles carry icons as `[icon:name]` tokens in untyped strings; a typo
// would silently render as literal text in a kid-facing bubble, so assert here.
test('every [icon:name] token in GUIDE resolves to a real icon', () => {
  const tokens = [...JSON.stringify(GUIDE).matchAll(/\[icon:([a-z0-9-]+)\]/g)].map((m) => m[1]);
  expect(tokens.length).toBeGreaterThan(0);
  for (const name of tokens) expect(isIconName(name)).toBe(true);
});
