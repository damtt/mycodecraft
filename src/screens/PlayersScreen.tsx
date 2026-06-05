import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useProfiles } from '../stores/profileStore';
import { rankForXp } from '../features/progress/ranks';
import { useT } from '../lib/i18n';
import Panel from '../components/Panel';
import PixelButton from '../components/PixelButton';
import HoldToConfirm from '../components/HoldToConfirm';

export const AVATARS = ['🟩', '🐷', '🦊', '🐺', '💀', '🤖', '🐱', '🐸'];
const MAX_NAME = 12;

export default function PlayersScreen() {
  const { profiles, create, remove, select } = useProfiles();
  const navigate = useNavigate();
  const { t, tl } = useT();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const submit = () => {
    create(name.trim(), avatar);
    setCreating(false);
    setName('');
  };

  return (
    <div data-testid="players-screen" className="bg-world flex min-h-screen flex-col items-center gap-8 pt-16">
      <h1 className="font-pixel text-2xl text-white [text-shadow:3px_3px_0_#3d8527]">
        {t('choosePlayer')}
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((p) => (
          <Panel key={p.id} className="flex w-44 flex-col items-center gap-2">
            <button
              onClick={() => { select(p.id); navigate('/map'); }}
              className="flex cursor-pointer flex-col items-center gap-1"
              aria-label={p.name}
            >
              <span className="text-6xl">{p.avatar}</span>
              <span className="font-body text-lg font-black">{p.name}</span>
              <span className="font-pixel text-[10px]">
                {rankForXp(p.xp).icon} {tl(rankForXp(p.xp).name)}
              </span>
            </button>
            <HoldToConfirm label={t('holdToDelete')} onConfirm={() => remove(p.id)} className="text-xs" />
          </Panel>
        ))}

        {creating ? (
          <Panel className="flex w-64 flex-col gap-3">
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
                  role="radio"
                  aria-checked={avatar === a}
                  aria-label={a}
                  onClick={() => setAvatar(a)}
                  className={`cursor-pointer rounded p-1 ${avatar === a ? 'bg-grass/40 ring-2 ring-grass-dark' : ''}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <PixelButton disabled={name.trim() === ''} onClick={submit}>{t('create')}</PixelButton>
              <PixelButton variant="stone" onClick={() => setCreating(false)}>{t('cancel')}</PixelButton>
            </div>
          </Panel>
        ) : (
          <Panel className="flex w-44 items-center justify-center">
            <PixelButton onClick={() => setCreating(true)}>＋ {t('newPlayer')}</PixelButton>
          </Panel>
        )}
      </div>
    </div>
  );
}
