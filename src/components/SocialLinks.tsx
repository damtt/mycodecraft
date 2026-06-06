/** GitHub + X profile links with inline pixel-friendly marks. Shared by the
 * title screen footer and the settings "About" section. */
export default function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      <a
        href="https://github.com/damtt/mycodecraft"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 transition-colors hover:text-night"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>
        GitHub
      </a>
      <span aria-hidden="true">·</span>
      <a
        href="https://x.com/henrytran_sg"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X"
        className="inline-flex items-center transition-colors hover:text-night"
      >
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M12.6 0h2.45l-5.36 6.12L16 16h-4.94l-3.87-5.06L2.76 16H.3l5.73-6.55L0 0h5.06l3.5 4.63L12.6 0Zm-.86 14.54h1.36L4.33 1.39H2.87l8.87 13.15Z" />
        </svg>
      </a>
    </div>
  );
}
