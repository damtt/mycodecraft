import { rankForXp, nextRank } from '../features/progress/ranks';

export default function XpBar({ xp }: { xp: number }) {
  const rank = rankForXp(xp);
  const next = nextRank(xp);
  const pct = next
    ? Math.round(((xp - rank.minXp) / (next.minXp - rank.minXp)) * 100)
    : 100;
  return (
    <div className="flex items-center gap-2" title={`${xp} XP`}>
      <span className="font-pixel text-xs">{rank.icon}</span>
      <div className="h-3 w-28 rounded-full bg-night/30">
        <div
          data-testid="xp-fill"
          className="h-3 rounded-full bg-gradient-to-r from-grass to-diamond"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-pixel text-[10px] text-night">Lv{rank.level}</span>
    </div>
  );
}
