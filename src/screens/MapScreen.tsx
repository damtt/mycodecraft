import { useNavigate } from 'react-router';
import { WORLDS } from '../content/worlds';
import { QUESTS_BY_WORLD } from '../content/quests';
import { useActiveProfile } from '../stores/profileStore';
import { questStatus, worldUnlocked } from '../features/progress/unlocks';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';

const STATUS_ICON = { done: '✅', current: '⛏️', locked: '🔒' } as const;

export default function MapScreen() {
  const profile = useActiveProfile();
  const navigate = useNavigate();
  const { t, tl } = useT();
  if (!profile) return null;

  return (
    <div data-testid="map-screen" className="bg-world min-h-full p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {WORLDS.map((world) => {
          const unlocked = worldUnlocked(world.id, profile, QUESTS_BY_WORLD);
          return (
            <Panel key={world.id} className={unlocked ? '' : 'opacity-70'}>
              <h2 className="font-pixel text-sm text-grass-dark">
                {world.icon} {tl(world.name)} {!unlocked && `🔒 ${t('locked')}`}
              </h2>
              <p className="mt-1 font-body text-sm font-bold text-stone">{tl(world.tagline)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUESTS_BY_WORLD[world.id].map((quest, i) => {
                  const status = questStatus(quest, profile, QUESTS_BY_WORLD);
                  return (
                    <button
                      key={quest.id}
                      disabled={status === 'locked'}
                      onClick={() => navigate(`/quest/${quest.id}`)}
                      title={tl(quest.title)}
                      aria-label={`${t('questLabel')} ${quest.id}`}
                      className={`flex h-14 w-14 cursor-pointer flex-col items-center justify-center
                        rounded-md font-body font-black text-white mc-bevel
                        disabled:cursor-not-allowed
                        ${status === 'done' ? 'bg-grass' : status === 'current' ? 'bg-gold animate-pulse' : 'bg-stone'}`}
                    >
                      <span>{STATUS_ICON[status]}</span>
                      <span className="text-xs">{i + 1}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
