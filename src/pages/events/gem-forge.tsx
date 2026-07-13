import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { Noto_Serif_TC } from "next/font/google";
import {
  RuleBasedForgeEngine,
  loadCollection,
  removeFromCollection,
  saveToCollection,
  RARITY_META,
  ELEMENT_META,
  type ChatMessage,
  type ForgedGem,
} from "@/lib/gemForge";
import { GemCard } from "@/components/gemforge/GemCard";
import { GemVisual } from "@/components/gemforge/GemVisual";

const gemSerif = Noto_Serif_TC({
  weight: ["600", "700", "900"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-gem-serif",
});

type Phase = "intro" | "chat" | "forging" | "result" | "collection";

/**
 * 寶石鍛造所（企劃：docs/gem-forge-plan.html）
 *
 * 黑客松 demo ＋ Game Night 線下活動共用的獨立活動頁：
 * - 匿名體驗：不掛 Privy / UserContext / AuraServer，零登入摩擦。
 * - 對話引擎走 ForgeEngine 介面，目前是規則式（RuleBasedForgeEngine），
 *   之後接 LLM 只要換 engine。
 * - 收藏純 localStorage，不打後端。
 */
export default function GemForgePage() {
  const engine = useMemo(() => new RuleBasedForgeEngine(), []);

  const [phase, setPhase] = useState<Phase>("intro");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [gem, setGem] = useState<ForgedGem | null>(null);
  const [forgeMessage, setForgeMessage] = useState("");
  const [collection, setCollection] = useState<ForgedGem[]>([]);
  const [viewingGem, setViewingGem] = useState<ForgedGem | null>(null);
  const [toast, setToast] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setCollection(loadCollection());
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const showToast = (text: string) => {
    setToast(text);
    later(() => setToast(""), 2200);
  };

  const isSaved = gem !== null && collection.some((g) => g.id === gem.id);

  /** 把引擎的下一步（提問或成品）演出來：打字延遲 → 訊息進場 */
  const advance = async (history: ChatMessage[]) => {
    setIsTyping(true);
    setHints([]);
    const step = await engine.next(history);
    later(() => {
      setIsTyping(false);
      if (step.type === "question") {
        setMessages((prev) => [...prev, { role: "forge", text: step.message }]);
        setHints(step.hints ?? []);
      } else {
        setGem(step.gem);
        setForgeMessage(step.message);
        setPhase("forging");
        later(() => setPhase("result"), 2600);
      }
    }, 700);
  };

  const startForge = () => {
    setMessages([]);
    setGem(null);
    setForgeMessage("");
    setPhase("chat");
    void advance([]);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    // 命名回合允許空白送出（交給鍛造爐命名），其他回合忽略空輸入
    const userCount = messages.filter((m) => m.role === "user").length;
    if (!trimmed && userCount < 3) return;
    if (isTyping) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: trimmed || "（交給爐火決定）" }];
    setMessages(next);
    setInput("");
    void advance(next);
  };

  const saveGem = () => {
    if (!gem) return;
    setCollection(saveToCollection(gem));
    showToast("已收進你的寶石匣");
  };

  const shareGem = async (target: ForgedGem) => {
    const text = `我在 Aurayale 寶石鍛造所鍛出了${RARITY_META[target.rarity].label}級寶石「${target.name}」——${target.story}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        showToast("分享文字已複製");
      }
    } catch {
      // 使用者取消分享：不做事
    }
  };

  const deleteGem = (id: string) => {
    setCollection(removeFromCollection(id));
    setViewingGem(null);
    showToast("已從寶石匣移除");
  };

  return (
    <div className={`gem-forge-page ${gemSerif.variable} flex flex-col`}>
      <Head>
        <title>寶石鍛造所 | Aurayale</title>
        <meta
          name="description"
          content="與鍛造師對話，把你的想像鍛成一顆專屬寶石 — Aurayale 活動體驗"
        />
      </Head>

      {/* 頂欄 */}
      <header className="flex items-center justify-between px-5 py-4 max-w-md w-full mx-auto">
        <button
          onClick={() => {
            setViewingGem(null);
            setPhase("intro");
          }}
          className="gem-serif text-sm font-bold tracking-[0.3em] text-[#c8a75a]"
        >
          寶石鍛造所
        </button>
        <button
          onClick={() => {
            setViewingGem(null);
            setPhase("collection");
          }}
          className="gem-btn-ghost text-xs px-3 py-1.5 rounded-full"
        >
          寶石匣（{collection.length}）
        </button>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pb-8 flex flex-col">
        {phase === "intro" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <GemVisual
              gem={{
                id: "intro",
                name: "",
                element: "light",
                rarity: "legendary",
                stats: { power: 0, guard: 0, spirit: 0 },
                story: "",
                styleHints: [],
                answers: [],
                createdAt: 0,
              }}
              size={150}
            />
            <div>
              <p className="text-[11px] tracking-[0.4em] text-[#6b7568] uppercase mb-3">
                Aurayale Event
              </p>
              <h1 className="gem-serif text-3xl font-black text-[#f2ede2] leading-snug">
                把你的想像
                <br />
                鍛成一顆寶石
              </h1>
              <p className="text-sm text-[#8d978f] leading-relaxed mt-4 max-w-[38ch] mx-auto">
                在 Aurayale
                的世界深處有一座只在活動之夜開爐的鍛造所。與鍛造師聊上幾句——說出它誕生的地方、佩戴者的性子、想守護的事物——爐火會替你把這些話語鍛成一顆獨一無二的寶石。
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 w-full">
              <button
                onClick={startForge}
                className="gem-btn-primary gem-serif w-full max-w-65 py-3.5 rounded-full text-base font-bold tracking-[0.2em]"
              >
                開始鍛造
              </button>
              <p className="text-[10px] text-[#6b7568] tracking-wider">
                免登入・約一分鐘・寶石只存在你的裝置上
              </p>
            </div>
          </div>
        )}

        {phase === "chat" && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`gem-msg max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "forge"
                      ? "gem-msg-forge text-[#e8dfc8]"
                      : "gem-msg-user text-[#d5e5f0] ml-auto"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div className="gem-msg gem-msg-forge inline-flex items-center gap-1.5 px-4 py-3">
                  <span className="gem-typing-dot" />
                  <span className="gem-typing-dot" />
                  <span className="gem-typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {hints.length > 0 && !isTyping && (
              <div className="flex flex-wrap gap-2 py-3">
                {hints.map((h) => (
                  <button
                    key={h}
                    onClick={() => send(h)}
                    className="gem-hint-chip text-xs px-3 py-1.5"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="gem-panel flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 mt-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="對鍛造師說……"
                className="flex-1 bg-transparent text-sm text-[#e8e5da] placeholder-[#5d675f] outline-none"
                maxLength={80}
              />
              <button
                type="submit"
                disabled={isTyping}
                className="gem-btn-primary text-sm font-bold px-5 py-2 rounded-full disabled:opacity-40"
              >
                送出
              </button>
            </form>
          </div>
        )}

        {phase === "forging" && gem && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="relative flex items-center justify-center">
              <span className="gem-forging-ring absolute w-44 h-44" />
              <span className="gem-forging-ring absolute w-44 h-44" style={{ animationDelay: "0.5s" }} />
              <div className="gem-forging-pulse">
                <GemVisual gem={gem} size={140} />
              </div>
            </div>
            <p className="gem-serif text-lg text-[#c8a75a] tracking-[0.3em] font-bold">
              鍛造中⋯⋯
            </p>
          </div>
        )}

        {phase === "result" && gem && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 py-4">
            <p className="gem-msg text-sm text-[#c8a75a] text-center max-w-[36ch] leading-relaxed">
              {forgeMessage}
            </p>
            <div className="gem-result-enter w-full">
              <GemCard gem={gem} />
            </div>
            <div className="flex flex-col gap-2.5 w-full max-w-85">
              <div className="flex gap-2.5">
                <button
                  onClick={saveGem}
                  disabled={isSaved}
                  className="gem-btn-primary flex-1 py-3 rounded-full text-sm font-bold disabled:opacity-50"
                >
                  {isSaved ? "已在寶石匣" : "收進寶石匣"}
                </button>
                <button
                  onClick={() => void shareGem(gem)}
                  className="gem-btn-ghost flex-1 py-3 rounded-full text-sm font-bold"
                >
                  分享
                </button>
              </div>
              <button
                onClick={startForge}
                className="gem-btn-ghost py-3 rounded-full text-sm"
              >
                再鍛一顆
              </button>
            </div>
          </div>
        )}

        {phase === "collection" && !viewingGem && (
          <div className="flex-1 py-2">
            <h1 className="gem-serif text-xl font-bold text-[#f2ede2] mb-1">我的寶石匣</h1>
            <p className="text-xs text-[#6b7568] mb-5">
              收藏存在這台裝置的瀏覽器裡，共 {collection.length} 顆。
            </p>
            {collection.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-[#8d978f] mb-6">爐火還沒替你鍛出任何寶石。</p>
                <button
                  onClick={startForge}
                  className="gem-btn-primary px-8 py-3 rounded-full text-sm font-bold"
                >
                  去鍛第一顆
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {collection.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setViewingGem(g)}
                    className="gem-panel rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                  >
                    <GemVisual gem={g} size={72} />
                    <span className="gem-serif text-sm font-bold text-[#f2ede2] leading-tight">
                      {g.name}
                    </span>
                    <span className="text-[10px] tracking-[0.2em]" style={{ color: RARITY_META[g.rarity].color }}>
                      {RARITY_META[g.rarity].label}・{ELEMENT_META[g.element].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === "collection" && viewingGem && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 py-4">
            <div className="gem-result-enter w-full">
              <GemCard gem={viewingGem} />
            </div>
            <div className="flex gap-2.5 w-full max-w-85">
              <button
                onClick={() => void shareGem(viewingGem)}
                className="gem-btn-primary flex-1 py-3 rounded-full text-sm font-bold"
              >
                分享
              </button>
              <button
                onClick={() => deleteGem(viewingGem.id)}
                className="gem-btn-ghost flex-1 py-3 rounded-full text-sm"
              >
                移除
              </button>
              <button
                onClick={() => setViewingGem(null)}
                className="gem-btn-ghost flex-1 py-3 rounded-full text-sm"
              >
                返回
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 gem-panel rounded-full px-5 py-2.5 text-sm text-[#e8dfc8] z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
