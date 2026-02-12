// lib/prompt-validator.ts

export type PromptValidationResult = {
  ok: boolean;
  score: number;
  reasons: string[];
  normalized: string;
  blockedBy: {
    words: string[];
    patterns: string[];
  };
};

type Rule = {
  id: string;
  weight: number;
  // якщо матчиться — додаємо score
  test: (s: string) => boolean;
  reason: string;
};

function normalizePrompt(input: string) {
  return (input || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ВАЖЛИВО: це "risk filter", не ідеальний список.
// Мета: відсікати промпти, які найчастіше дають "чорні квадрати" / блок.
const bannedWords: Array<{ w: string; weight: number; reason: string }> = [
  // minors / underage
  { w: "child", weight: 10, reason: "Underage content risk" },
  { w: "kid", weight: 10, reason: "Underage content risk" },
  { w: "minor", weight: 10, reason: "Underage content risk" },
  { w: "underage", weight: 10, reason: "Underage content risk" },
  { w: "teen", weight: 10, reason: "Underage content risk" },
  { w: "toddler", weight: 10, reason: "Underage content risk" },
  { w: "baby", weight: 10, reason: "Underage content risk" },
  { w: "schoolgirl", weight: 10, reason: "Underage content risk" },
  { w: "schoolboy", weight: 10, reason: "Underage content risk" },
  { w: "loli", weight: 10, reason: "Underage content risk" },

  // sexual / explicit (часто блокується і дає censored output)
  { w: "nsfw", weight: 6, reason: "Explicit sexual content risk" },
  { w: "porn", weight: 8, reason: "Explicit sexual content risk" },
  { w: "sex", weight: 6, reason: "Explicit sexual content risk" },
  { w: "explicit", weight: 6, reason: "Explicit sexual content risk" },
  { w: "nude", weight: 5, reason: "Nudity risk" },
  { w: "naked", weight: 6, reason: "Nudity risk" },
  { w: "erotic", weight: 6, reason: "Explicit sexual content risk" },
  { w: "fetish", weight: 7, reason: "Explicit sexual content risk" },
  { w: "bdsm", weight: 8, reason: "Explicit sexual content risk" },
  { w: "bondage", weight: 8, reason: "Explicit sexual content risk" },

  // sexual violence / abuse
  { w: "rape", weight: 10, reason: "Sexual violence content risk" },
  { w: "incest", weight: 10, reason: "Sexual violence content risk" },
  { w: "bestiality", weight: 10, reason: "Sexual violence content risk" },

  // violence / gore
  { w: "gore", weight: 8, reason: "Graphic violence content risk" },
  { w: "beheading", weight: 9, reason: "Graphic violence content risk" },
  { w: "dismember", weight: 9, reason: "Graphic violence content risk" },
  { w: "torture", weight: 8, reason: "Graphic violence content risk" },
  { w: "murder", weight: 7, reason: "Violence content risk" },

  // self-harm
  { w: "suicide", weight: 10, reason: "Self-harm content risk" },
  { w: "self-harm", weight: 10, reason: "Self-harm content risk" },

  // impersonation / restricted
  { w: "celebrity", weight: 6, reason: "Impersonation/restricted content risk" },
];

// Патерни, які дуже часто тригерять модерацію
const bannedPatterns: Array<{ re: RegExp; weight: number; reason: string; id: string }> = [
  { id: "spread-legs", re: /\bspread\s*legs\b/i, weight: 10, reason: "Explicit pose instruction risk" },
  { id: "open-legs", re: /\bopen\s*legs\b/i, weight: 10, reason: "Explicit pose instruction risk" },
  { id: "between-legs", re: /\bbetween\s*(the\s*)?legs\b/i, weight: 10, reason: "Explicit anatomy framing risk" },

  { id: "underage-age", re: /\b(1[0-7])\s*(yo|year\s*old|years\s*old)\b/i, weight: 10, reason: "Underage age mention risk" },

  // "how to" незаконні штуки (зайде в блоки провайдерів)
  { id: "how-to-bomb", re: /\bhow\s*to\s*(make|build).*(bomb|explosive)\b/i, weight: 10, reason: "Illegal instructions risk" },
  { id: "how-to-drugs", re: /\bhow\s*to\s*(make|cook).*(drug|meth)\b/i, weight: 10, reason: "Illegal instructions risk" },

  // self-harm intent phrasing
  { id: "kill-myself", re: /\bkill\s*myself\b/i, weight: 10, reason: "Self-harm intent risk" },
];

// “Пом’якшуючий” контекст — якщо промпт явно про скульптуру/класичне мистецтво,
// деякі nudity-слова менш ризикові (але це не гарантія)
const safeContextHints = [
  "marble statue",
  "sculpture",
  "renaissance",
  "classical painting",
  "museum",
  "fine art",
];

export function validatePrompt(rawPrompt: string): PromptValidationResult {
  const normalized = normalizePrompt(rawPrompt);

  const reasons: string[] = [];
  let score = 0;

  const hitWords: string[] = [];
  const hitPatterns: string[] = [];

  // quick empty check
  if (!normalized) {
    return {
      ok: false,
      score: 999,
      reasons: ["Empty prompt"],
      normalized,
      blockedBy: { words: [], patterns: [] },
    };
  }

  // safe context reduces score a bit (never below 0)
  const hasSafeContext = safeContextHints.some((h) => normalized.includes(h));
  const safeContextDiscount = hasSafeContext ? 2 : 0;

  // word hits
  for (const bw of bannedWords) {
    if (normalized.includes(bw.w)) {
      score += bw.weight;
      reasons.push(bw.reason + ` ("${bw.w}")`);
      hitWords.push(bw.w);
    }
  }

  // pattern hits
  for (const bp of bannedPatterns) {
    if (bp.re.test(normalized)) {
      score += bp.weight;
      reasons.push(bp.reason + ` (${bp.id})`);
      hitPatterns.push(bp.id);
    }
  }

  score = Math.max(0, score - safeContextDiscount);

  // Порог:
  //  - 10+: майже точно блок/чорний квадрат
  //  - 6-9: часто блокується (залежить від моделі)
  //  - 0-5: зазвичай ок
  const ok = score < 6;

  return {
    ok,
    score,
    reasons: Array.from(new Set(reasons)),
    normalized,
    blockedBy: { words: Array.from(new Set(hitWords)), patterns: Array.from(new Set(hitPatterns)) },
  };
}
