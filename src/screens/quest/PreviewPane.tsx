import type { usePreview } from '../../features/preview/usePreview';
import { useT } from '../../lib/i18n';
import Panel from '../../components/Panel';

type Preview = ReturnType<typeof usePreview>;

export default function PreviewPane({ preview, isJs, className = '' }: { preview: Preview; isJs: boolean; className?: string }) {
  const { t } = useT();
  return (
    <Panel className={`flex min-h-0 flex-col !p-2 ${className}`}>
      <span className="font-pixel text-xs text-stone">👁 {t('preview')}</span>
      <iframe
        key={preview.reloadKey}
        ref={preview.iframeRef}
        title={t('preview')}
        sandbox="allow-scripts"
        srcDoc={preview.srcdoc}
        className="w-full flex-1 rounded bg-white"
      />
      {isJs && (
        <div className="mt-1 max-h-24 overflow-y-auto rounded bg-night p-2 font-mono text-xs text-green-400">
          <span className="text-stone">▸ {t('console')}</span>
          {preview.consoleLines.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </Panel>
  );
}
