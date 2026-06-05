import { BADGES } from '../content/badges';
import { ACHIEVEMENTS } from '../features/progress/achievements';
import { useActiveProfile } from '../stores/profileStore';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';

export default function InventoryScreen() {
  const profile = useActiveProfile();
  const { t, tl } = useT();
  if (!profile) return null;

  return (
    <div data-testid="inventory-screen" className="bg-world min-h-full p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Panel>
          <h2 className="font-pixel text-sm text-grass-dark">🧰 {t('badges')}</h2>
          <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-10">
            {BADGES.map((badge) => {
              const owned = profile.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  data-testid={`badge-${badge.id}`}
                  title={tl(badge.name)}
                  className={`mc-bevel flex h-12 w-12 items-center justify-center rounded
                    bg-dirt-light text-2xl ${owned ? '' : 'opacity-30 grayscale'}`}
                >
                  {badge.icon}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-pixel text-sm text-grass-dark">🏆 {t('achievements')}</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {ACHIEVEMENTS.map((a) => {
              const earned = profile.achievements.includes(a.id);
              return (
                <li key={a.id} className={`font-body font-bold ${earned ? '' : 'opacity-40'}`}>
                  {a.icon} {tl(a.name)} — <span className="text-sm">{tl(a.desc)}</span> {earned && '✅'}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-pixel text-sm text-grass-dark">📊 {t('stats')}</h2>
          <p className="mt-2 font-body font-bold">
            {t('questsDone')}: <span data-testid="stat-quests">{Object.keys(profile.quests).length}</span>
          </p>
          <p className="font-body font-bold">
            {t('bestStreak')}: 🔥<span data-testid="stat-streak">{profile.bestStreak}</span>
          </p>
        </Panel>
      </div>
    </div>
  );
}
