import type { Rewards } from '../lib/types';
import { BADGES } from '../content/badges';
import { ACHIEVEMENTS } from '../features/progress/achievements';
import { useT } from '../lib/i18n';
import Panel from './Panel';
import PixelButton from './PixelButton';

interface VictoryOverlayProps {
  rewards: Rewards;
  worldComplete?: boolean;
  hasNext: boolean;
  onNext(): void;
  onBackToMap(): void;
}

export default function VictoryOverlay({ rewards, worldComplete, hasNext, onNext, onBackToMap }: VictoryOverlayProps) {
  const { t, tl } = useT();
  const badge = rewards.newBadge ? BADGES.find((b) => b.id === rewards.newBadge) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/80" role="dialog" aria-modal="true" aria-labelledby="victory-title">
      <Panel className="w-96 text-center">
        <h2 id="victory-title" className="font-pixel text-lg text-grass-dark">🎉 {t('victory')}</h2>
        <p className="mt-3 font-body text-xl font-black">
          +{rewards.xpGained} {t('xpGained')}
          {rewards.dailyBonus && <span className="ml-2 text-gold">☀️ {t('dailyBonus')}</span>}
        </p>
        {rewards.leveledUp && (
          <p className="mt-2 animate-bounce font-pixel text-sm text-gold">⬆️ {t('levelUp')}</p>
        )}
        {badge && (
          <p className="mt-2 font-body font-bold">
            {t('newBadge')} <span className="text-2xl">{badge.icon}</span> {tl(badge.name)}
          </p>
        )}
        {rewards.newAchievements.map((id) => {
          const a = ACHIEVEMENTS.find((x) => x.id === id);
          return a ? (
            <p key={id} className="mt-1 font-body font-bold text-dirt">
              {a.icon} {t('newAchievement')} {tl(a.name)}
            </p>
          ) : null;
        })}
        {worldComplete && (
          <p className="mt-3 animate-pulse font-pixel text-xs text-grass-dark" data-testid="world-complete">
            🌍 {t('worldComplete')}
          </p>
        )}
        <div className="mt-5 flex justify-center gap-3">
          <PixelButton variant="stone" onClick={onBackToMap}>{t('backToMap')}</PixelButton>
          {hasNext && <PixelButton onClick={onNext}>{t('nextQuest')} →</PixelButton>}
        </div>
      </Panel>
    </div>
  );
}
