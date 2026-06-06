import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useProfiles } from '../stores/profileStore';
import { rankForXp } from '../features/progress/ranks';
import { playSound } from '../features/audio/sounds';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';
import PixelButton from '../components/PixelButton';
import HoldToConfirm from '../components/HoldToConfirm';
import Icon, { type IconName } from '../components/Icon';
import Avatar from '../components/Avatar';

export const AVATARS: IconName[] = ['green-tile', 'pig', 'fox', 'wolf', 'skull', 'robot', 'cat', 'frog'];
const MAX_NAME = 12;

export default function PlayersScreen() {
  const { profiles, create, remove, select } = useProfiles();
  const navigate = useNavigate();
  const { t, tl } = useT();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pendingDelete = profiles.find((p) => p.id === confirmDeleteId) ?? null;

  const submit = () => {
    if (name.trim() === '') return;
    create(name.trim(), avatar);
    setCreating(false);
    setName('');
    setAvatar(AVATARS[0]);
  };

  return (
    <div data-testid="players-screen" className="bg-world relative flex min-h-screen flex-col items-center gap-8 pt-16">
      <Link
        to="/"
        aria-label={t('backToTitle')}
        title={t('backToTitle')}
        className="absolute left-4 top-4 cursor-pointer font-pixel text-sm text-white drop-shadow"
      >
        <Icon name="previous" /> {t('home')}
      </Link>
      <h1 className="font-pixel text-2xl text-white [text-shadow:3px_3px_0_#3d8527]">
        {t('choosePlayer')}
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((p) => {
          const rank = rankForXp(p.xp);
          return (
            <Panel key={p.id} className="flex w-44 flex-col items-center gap-2">
              <button
                onClick={() => { playSound('select'); select(p.id); navigate('/map'); }}
                className="flex cursor-pointer flex-col items-center gap-1"
                aria-label={p.name}
              >
                <Avatar value={p.avatar} className="text-6xl" />
                <span className="font-body text-lg font-black">{p.name}</span>
                <span className="font-pixel text-sm leading-none">
                  <Icon name={rank.icon} /> <span className="text-[10px]">{tl(rank.name)}</span>
                </span>
              </button>
              <PixelButton variant="danger" className="text-xs" onClick={() => setConfirmDeleteId(p.id)}>
                {t('delete')}
              </PixelButton>
            </Panel>
          );
        })}

        {creating ? (
          <Panel className="flex w-64 flex-col gap-3">
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-3">
              <input
                autoFocus
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('playerName')}
                className="rounded border-2 border-stone p-2 font-body font-bold"
              />
              <p className="font-body text-sm font-bold">{t('pickAvatar')}</p>
              <div role="radiogroup" className="grid grid-cols-4 gap-1 text-3xl">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={avatar === a}
                    aria-label={a}
                    onClick={() => { playSound('click'); setAvatar(a); }}
                    className={`cursor-pointer rounded p-1 ${avatar === a ? 'bg-grass/40 ring-2 ring-grass-dark' : ''}`}
                  >
                    <Icon name={a} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <PixelButton type="submit" disabled={name.trim() === ''}>{t('create')}</PixelButton>
                <PixelButton type="button" variant="stone" onClick={() => setCreating(false)}>{t('cancel')}</PixelButton>
              </div>
            </form>
          </Panel>
        ) : (
          <Panel className="flex w-44 items-center justify-center">
            <PixelButton onClick={() => setCreating(true)}><Icon name="plus" /> {t('newPlayer')}</PixelButton>
          </Panel>
        )}
      </div>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={() => setConfirmDeleteId(null)}
        >
          <Panel className="w-full max-w-80 text-center" onClick={(e) => e.stopPropagation()}>
            <Avatar value={pendingDelete.avatar} className="text-5xl" />
            <h2 id="delete-title" className="mt-2 font-pixel text-base text-red-700">
              <Icon name="warning" /> {t('delete')} {pendingDelete.name}?
            </h2>
            <p className="mt-3 font-body font-bold text-stone-700">{t('deleteConfirm')}</p>
            <div className="mt-5 flex flex-col items-center gap-3">
              <HoldToConfirm
                label={t('holdToDelete')}
                onConfirm={() => { remove(pendingDelete.id); setConfirmDeleteId(null); }}
              />
              <PixelButton variant="stone" onClick={() => setConfirmDeleteId(null)}>
                {t('cancel')}
              </PixelButton>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
