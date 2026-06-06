export type Lang = 'en' | 'vi';
export type Localized = { en: string; vi: string };
export type WorldId = 'html' | 'css' | 'js';

export interface Step {
  text: Localized;
  hint?: Localized;
}

/**
 * Declarative pass conditions. DOM checks (elementExists, textIncludes,
 * attrEquals, computedStyle, elementCount) are evaluated INSIDE the preview
 * iframe; local checks (codeIncludes, consoleIncludes) are evaluated in the
 * parent against the raw code string / captured console lines.
 */
export type Check =
  | { type: 'elementExists'; selector: string; failMessage: Localized }
  | { type: 'textIncludes'; selector: string; value: string; failMessage: Localized }
  | { type: 'attrEquals'; selector: string; attr: string; value: string; failMessage: Localized }
  | { type: 'computedStyle'; selector: string; prop: string; equalsAny: string[]; failMessage: Localized }
  | { type: 'elementCount'; selector: string; min: number; failMessage: Localized }
  | { type: 'codeIncludes'; value: string; failMessage: Localized }
  | { type: 'consoleIncludes'; value: string; failMessage: Localized };

export interface Quest {
  id: string; // e.g. "html-03"
  world: WorldId;
  title: Localized;
  story: Localized; // 1–2 sentence blocky-world-flavored intro
  steps: Step[];
  starterCode: string;
  checks: [Check, ...Check[]]; // non-empty — a quest with no checks would vacuously pass
  xp: 50 | 75 | 100; // easy / medium / boss
  badge: string; // BadgeId — every quest drops one collectible
}

export interface World {
  id: WorldId;
  name: Localized;
  icon: string; // emoji
  tagline: Localized;
}

export interface BadgeDef {
  id: string;
  icon: string; // emoji
  name: Localized;
}

export interface QuestRecord {
  completedAt: string; // YYYY-MM-DD of FIRST completion
  usedHint: boolean; // from first completion (achievements use this)
}

export interface Streak {
  count: number;
  lastDay: string; // YYYY-MM-DD; '' = never played (callers must never pass '' to dayBefore())
}

export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji head
  xp: number;
  quests: Record<string, QuestRecord>;
  streak: Streak;
  bestStreak: number;
  badges: string[];
  achievements: string[];
  createdAt: string; // YYYY-MM-DD
}

export interface Rewards {
  firstTime: boolean;
  xpGained: number; // quest xp (0 on replay) + daily bonus
  dailyBonus: boolean; // +20 granted (first completion of the day)
  leveledUp: boolean;
  newBadge: string | null;
  newAchievements: string[];
  streak: number;
}
