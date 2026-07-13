/**
 * 寶石鍛造所（/events/gem-forge）核心資料層。
 *
 * 設計重點（見 docs/gem-forge-plan.html）：
 * - ForgeEngine 是可抽換介面：第一版為規則式引導對話（RuleBasedForgeEngine），
 *   之後接 LLM API 時只要換一個 engine 實作，頁面不用動。
 * - 寶石 schema 固定，styleHints 為「視覺產出方式」保留欄位（目前留空方案）。
 * - 純前端：收藏存 localStorage，不打任何後端 API。
 */

export type GemElement = "fire" | "water" | "earth" | "wind" | "light" | "shadow";
export type GemRarity = "common" | "rare" | "epic" | "legendary";

export interface GemStats {
  /** 力量 */
  power: number;
  /** 守護 */
  guard: number;
  /** 靈性 */
  spirit: number;
}

export interface ForgedGem {
  id: string;
  name: string;
  element: GemElement;
  rarity: GemRarity;
  stats: GemStats;
  /** 由對話素材織成的短故事 */
  story: string;
  /** 視覺產出保留欄位：之後接 AI 生圖 / 規則式美術時的風格提示 */
  styleHints: string[];
  /** 原始對話回答，供之後接 LLM / 生圖時當素材 */
  answers: string[];
  createdAt: number;
}

export interface ChatMessage {
  role: "forge" | "user";
  text: string;
}

export type ForgeStep =
  | { type: "question"; message: string; hints?: string[] }
  | { type: "complete"; gem: ForgedGem; message: string };

/** 對話引擎介面：輸入完整對話歷史，回傳下一句提問或最終寶石。 */
export interface ForgeEngine {
  next(history: ChatMessage[]): Promise<ForgeStep>;
}

/* ------------------------------------------------------------------ */
/* 元素 / 稀有度 中繼資料（GemVisual 與卡面共用）                        */
/* ------------------------------------------------------------------ */

export const ELEMENT_META: Record<
  GemElement,
  { label: string; color: string; colorSoft: string; blurb: string }
> = {
  fire: { label: "焰", color: "#e2612e", colorSoft: "#5a2415", blurb: "在熔岩的怒吼中成形" },
  water: { label: "潮", color: "#3f8fc4", colorSoft: "#16344a", blurb: "凝結自深海最靜的一滴" },
  earth: { label: "壤", color: "#7fa14c", colorSoft: "#2c3a1a", blurb: "億年岩層裡緩慢醒來" },
  wind: { label: "嵐", color: "#8fc4bc", colorSoft: "#27423e", blurb: "被高空的風磨出稜角" },
  light: { label: "曜", color: "#e0b64f", colorSoft: "#4c3c14", blurb: "折射黎明的第一道光" },
  shadow: { label: "冥", color: "#9d6fe0", colorSoft: "#33244c", blurb: "自無星的夜裡剝落" },
};

export const RARITY_META: Record<
  GemRarity,
  { label: string; color: string; statBudget: number }
> = {
  common: { label: "凡晶", color: "#9aa8a1", statBudget: 9 },
  rare: { label: "秘石", color: "#4f9dd8", statBudget: 12 },
  epic: { label: "史詩", color: "#a06ce0", statBudget: 15 },
  legendary: { label: "傳說", color: "#d9a44a", statBudget: 18 },
};

/* ------------------------------------------------------------------ */
/* 規則式對話引擎（v1）                                                 */
/* ------------------------------------------------------------------ */

const QUESTIONS: { message: string; hints?: string[] }[] = [
  {
    message:
      "歡迎來到鍛造所，旅人。爐火已經升起——先告訴我，你的寶石誕生於什麼樣的地方？",
    hints: ["火山的心臟", "深海的裂縫", "古老的森林", "高空的風暴", "黎明的山頂", "無星的暗夜"],
  },
  {
    message: "很好，我看見它的胚胎了。那麼，將佩戴它的人是什麼樣的性子？",
    hints: ["勇往直前的戰士", "溫柔守護家人的人", "追逐星空的夢想家"],
  },
  {
    message: "爐火正旺。最後的素材——你希望這顆寶石替你守護什麼？",
  },
  {
    message: "成形之前，為它取個名字吧。（留空的話，就交給鍛造爐替你命名）",
  },
];

// 注意：避免過於通用的單字（如「地」「山」會誤傷「地方」「火山」），
// 多字詞在計分時以字數加權，讓「熔岩」「岩漿」比單一字更有代表性。
const ELEMENT_KEYWORDS: Record<GemElement, string[]> = {
  fire: ["火", "熔岩", "岩漿", "炎", "燃", "燒", "烈日", "太陽", "灼"],
  water: ["水", "海", "河", "冰", "雨", "潮", "湖", "淚", "霧"],
  earth: ["森", "林", "樹", "土", "大地", "岩層", "山谷", "山脈", "苔", "礦"],
  wind: ["風", "天空", "雲", "嵐", "高空", "羽", "飛"],
  light: ["光", "黎明", "晨", "星", "日出", "聖", "曙", "白晝"],
  shadow: ["夜", "暗", "影", "月", "黑", "冥", "幽", "深淵", "夢魘"],
};

const STAT_KEYWORDS: Record<keyof GemStats, string[]> = {
  power: ["勇", "戰", "強", "衝", "熱血", "冒險", "直前", "拳"],
  guard: ["守", "護", "家", "溫柔", "安", "穩", "陪伴", "照顧"],
  spirit: ["夢", "星", "智", "書", "想像", "藝術", "好奇", "追逐"],
};

/** 依元素給的命名素材（使用者留空名字時用） */
const NAME_POOLS: Record<GemElement, { prefixes: string[]; suffixes: string[] }> = {
  fire: { prefixes: ["燼", "焰", "赤", "曦"], suffixes: ["之心", "餘火", "晨曜", "殘響"] },
  water: { prefixes: ["汐", "淵", "滄", "露"], suffixes: ["之淚", "迴聲", "靜謐", "深眠"] },
  earth: { prefixes: ["苔", "磐", "翠", "壤"], suffixes: ["之脈", "年輪", "沉思", "根鳴"] },
  wind: { prefixes: ["嵐", "翎", "霄", "颯"], suffixes: ["之息", "遠行", "輕語", "掠影"] },
  light: { prefixes: ["曜", "晨", "煌", "澄"], suffixes: ["之誓", "初光", "凝輝", "破曉"] },
  shadow: { prefixes: ["冥", "宵", "魅", "玄"], suffixes: ["之瞳", "殘月", "低語", "夜幕"] },
};

/** 簡單字串雜湊，讓同樣的回答鍛出同一顆寶石（demo 時好重現） */
function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

function detectElement(text: string): GemElement {
  let best: GemElement = "light";
  let bestScore = 0;
  (Object.keys(ELEMENT_KEYWORDS) as GemElement[]).forEach((el) => {
    const score = ELEMENT_KEYWORDS[el].reduce(
      (acc, kw) => acc + (text.includes(kw) ? kw.length : 0),
      0
    );
    if (score > bestScore) {
      best = el;
      bestScore = score;
    }
  });
  if (bestScore > 0) return best;
  // 沒對到關鍵字時，用雜湊穩定分配一個元素
  const all: GemElement[] = ["fire", "water", "earth", "wind", "light", "shadow"];
  return all[hashText(text) % all.length];
}

/**
 * 稀有度由「素材豐富度」決定：描述越用心，稀有度越高。
 * 這是刻意的活動機制 —— 鼓勵現場玩家多聊幾句。
 */
function deriveRarity(answers: string[]): GemRarity {
  const totalLen = answers.join("").length;
  const richness = totalLen + (hashText(answers.join("|")) % 10);
  if (richness >= 80) return "legendary";
  if (richness >= 45) return "epic";
  if (richness >= 20) return "rare";
  return "common";
}

function deriveStats(personality: string, rarity: GemRarity, seed: number): GemStats {
  const budget = RARITY_META[rarity].statBudget;
  const bias: GemStats = { power: 1, guard: 1, spirit: 1 };
  (Object.keys(STAT_KEYWORDS) as (keyof GemStats)[]).forEach((stat) => {
    STAT_KEYWORDS[stat].forEach((kw) => {
      if (personality.includes(kw)) bias[stat] += 2;
    });
  });
  const biasTotal = bias.power + bias.guard + bias.spirit;
  const raw: GemStats = {
    power: Math.max(1, Math.round((bias.power / biasTotal) * budget)),
    guard: Math.max(1, Math.round((bias.guard / biasTotal) * budget)),
    spirit: Math.max(1, Math.round((bias.spirit / biasTotal) * budget)),
  };
  // 用 seed 做 ±1 的微調，讓同 rarity 不同回答仍有差異
  const wiggle = seed % 3;
  if (wiggle === 0) raw.power += 1;
  else if (wiggle === 1) raw.guard += 1;
  else raw.spirit += 1;
  return raw;
}

function buildName(userName: string, element: GemElement, seed: number): string {
  const trimmed = userName.trim();
  if (trimmed && trimmed !== "") return trimmed.slice(0, 12);
  const pool = NAME_POOLS[element];
  const prefix = pool.prefixes[seed % pool.prefixes.length];
  const suffix = pool.suffixes[(seed >>> 3) % pool.suffixes.length];
  return `${prefix}${suffix}`;
}

function buildStory(answers: string[], element: GemElement): string {
  const [origin, personality, wish] = answers;
  const meta = ELEMENT_META[element];
  const originLine = origin.trim() ? `它${meta.blurb}，記得${origin.trim()}的模樣。` : `它${meta.blurb}。`;
  const ownerLine = personality.trim()
    ? `如今它選擇了${personality.trim()}作為同行者，`
    : "如今它靜靜等待著同行者，";
  const wishLine = wish.trim()
    ? `並立下誓言——守護「${wish.trim()}」，直到爐火熄滅的那一天。`
    : "等待著一個值得守護的誓言。";
  return `${originLine}${ownerLine}${wishLine}`;
}

export class RuleBasedForgeEngine implements ForgeEngine {
  async next(history: ChatMessage[]): Promise<ForgeStep> {
    const userAnswers = history.filter((m) => m.role === "user").map((m) => m.text);

    if (userAnswers.length < QUESTIONS.length) {
      const q = QUESTIONS[userAnswers.length];
      return { type: "question", message: q.message, hints: q.hints };
    }

    const [origin, personality, wish, rawName] = userAnswers;
    const seed = hashText(userAnswers.join("|"));
    const element = detectElement(`${origin} ${wish}`);
    const rarity = deriveRarity([origin, personality, wish]);
    const gem: ForgedGem = {
      id: `gem-${Date.now().toString(36)}-${(seed % 0xffff).toString(16)}`,
      name: buildName(rawName, element, seed),
      element,
      rarity,
      stats: deriveStats(personality, rarity, seed),
      story: buildStory([origin, personality, wish], element),
      styleHints: [
        `element:${element}`,
        `rarity:${rarity}`,
        ...[origin, personality, wish].filter((a) => a.trim()).map((a) => `material:${a.trim().slice(0, 24)}`),
      ],
      answers: userAnswers,
      createdAt: Date.now(),
    };

    return {
      type: "complete",
      gem,
      message: `鏗——成了。${RARITY_META[rarity].label}級的「${gem.name}」，請收下吧。`,
    };
  }
}

/* ------------------------------------------------------------------ */
/* localStorage 收藏（純前端，不存後端）                                 */
/* ------------------------------------------------------------------ */

const COLLECTION_KEY = "gemForge.collection.v1";

export function loadCollection(): ForgedGem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COLLECTION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ForgedGem[]) : [];
  } catch {
    return [];
  }
}

export function saveToCollection(gem: ForgedGem): ForgedGem[] {
  const current = loadCollection();
  if (current.some((g) => g.id === gem.id)) return current;
  const next = [gem, ...current];
  try {
    window.localStorage.setItem(COLLECTION_KEY, JSON.stringify(next));
  } catch {
    // localStorage 滿 / 無痕模式：收藏失敗不阻斷體驗
  }
  return next;
}

export function removeFromCollection(id: string): ForgedGem[] {
  const next = loadCollection().filter((g) => g.id !== id);
  try {
    window.localStorage.setItem(COLLECTION_KEY, JSON.stringify(next));
  } catch {
    // 同上，靜默失敗
  }
  return next;
}
