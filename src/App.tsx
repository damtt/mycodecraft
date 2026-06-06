import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { router } from './app/router';
import { useSettings, type FontScale } from './stores/settingsStore';

// Scales the root font-size, so every rem-based size (incl. pixel headings)
// grows/shrinks with the kid's choice.
const ROOT_FONT_PCT: Record<FontScale, string> = { sm: '87.5%', md: '100%', lg: '118.75%' };

export default function App() {
  const fontScale = useSettings((s) => s.fontScale);
  useEffect(() => {
    document.documentElement.style.fontSize = ROOT_FONT_PCT[fontScale];
  }, [fontScale]);
  return (
    <>
      <RouterProvider router={router} />
      {/* Cookieless visitor counts via Vercel Web Analytics (no personal data) */}
      <Analytics />
    </>
  );
}
