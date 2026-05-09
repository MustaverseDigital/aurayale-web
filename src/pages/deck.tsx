import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DeckComponent from "../components/DeckComponent";
import CardSelectionComponent from "../components/CardSelectionComponent";
import { getUserGems, getUserDeck, editGemDeck, GemItem } from "../api/auraServer";
import { Wallet, CornerDownLeft, Loader2 } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";

export default function DeckPage() {
  const router = useRouter();
  const { user } = useUser();
  const [gems, setGems] = useState<GemItem[]>([]);
  const [currentDeck, setCurrentDeck] = useState<number[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 新增玩家資訊
  const [username, setUsername] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  // 編輯模式
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const { safeAreaInsetBottom } = useViewportRequirements();

  useEffect(() => {
    if (!user?.token) {
      router.replace("/aurayale");
      return;
    }
    setLoading(true);
    Promise.all([
      getUserGems(user.token),
      getUserDeck(user.token)
    ]).then(([gems, deck]) => {
      setGems(gems);
      setCurrentDeck(Array.isArray(deck) ? deck : []);
    }).catch(e => {
      setError(e.message);
    }).finally(() => setLoading(false));
    setUsername(user.name || user.userId.toString());
    setWalletAddress(user.walletAddress || "");
  }, [router, user]);

  const toggleCardSelection = (cardId: number) => {
    if (!isEditing) return;
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else if (prev.length < 10) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  // 卡牌效果
  const getCardEffect = (id: number) => {
    // if (id >= 1 && id <= 6) return "+ 100 ATK";
    // if (id >= 7 && id <= 12) return "Pair + 200 ATK";
    // if (id >= 13 && id <= 18) return " + 1 Mult";
    // if (id >= 19 && id <= 24) return "Pair + 2 Mult";
    return "";
  };

  if (!user) return <div className="min-h-screen bgImg flex items-center justify-center text-[#050505]">請先登入</div>;

  return (
    <div className="min-h-screen bgImg text-[#050505] flex flex-col overflow-x-hidden">
      {/* 玩家資訊 header bar — sticky, full viewport width */}
      <header className="sticky top-0 z-30 py-2 px-3 sm:px-6 bg-[#050505] border-b border-[#050505] flex justify-between items-center w-full">
        <h1 className="text-base sm:text-lg font-black text-white">Edit Deck</h1>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Wallet className="w-5 h-5 text-white shrink-0" />
          <span className="font-semibold text-white bg-white/10 border border-white/20 py-1 px-2 sm:px-3 rounded-xl text-xs sm:text-sm truncate max-w-[60vw] sm:max-w-none">
            {username}
            {walletAddress ? (
              <span className="text-gray-300"> (0x...{walletAddress.slice(-5)})</span>
            ) : (
              <span className="text-gray-200 py-1 px-2 sm:px-3 rounded-xl bg-white/10 ml-1">Not bound</span>
            )}
          </span>
        </div>
      </header>

      {/* Main content — responsive max-width container */}
      <main
        className="flex-1 mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
        style={{
          paddingBottom: `calc(73px + ${safeAreaInsetBottom > 0 ? safeAreaInsetBottom : 0}px)`,
        }}
      >
        {error && (
          <div className="mx-3 sm:mx-4 mt-3 p-3 sm:p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}
        <DeckComponent
          currentDeck={currentDeck}
          selectedCards={selectedCards}
          gems={gems}
          setSelectedCards={setSelectedCards}
          toggleCardSelection={toggleCardSelection}
          isEditing={isEditing}
        />
        <div className="CardSelectionComponent">
          <CardSelectionComponent
            gems={gems}
            currentDeck={currentDeck}
            selectedCards={selectedCards}
            setSelectedCards={setSelectedCards}
            toggleCardSelection={toggleCardSelection}
            getCardEffect={getCardEffect}
            isEditing={isEditing}
          />
        </div>
      </main>

      {/* Bottom action bar — fixed full width, inner content respects max-w */}
      <div
        className="BattleComponent fixed bottom-0 inset-x-0 z-20 p-2 bg-white border-t border-[#d9d9d9] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] min-h-[57px]"
        style={{
          paddingBottom: safeAreaInsetBottom > 0 ? `calc(0.5rem + ${safeAreaInsetBottom}px)` : undefined,
        }}
      >
        <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl flex items-center gap-3">
          {/* 返回個人頁面 */}
          <button
            className="rounded-xl flex items-center justify-center h-10 w-10 shrink-0 text-sm bg-white border border-[#d9d9d9] text-[#050505] hover:border-[#050505] transition shadow-[0_2px_0_rgba(0,0,0,0.08)]"
            onClick={() => router.push("/platform")}
            title="返回個人頁面"
          >
            <CornerDownLeft className="w-5 h-5" />
          </button>

          {/* Edit + Battle (centered) */}
          <div className="flex-1 flex items-center justify-center gap-3">
            <button
              className={`rounded-xl px-6 py-2 text-sm font-bold transition inline-flex items-center justify-center h-10 w-28 whitespace-nowrap border ${
                !isEditing
                  ? "bg-[#050505] text-white border-[#050505] hover:bg-white hover:text-[#050505]"
                  : selectedCards.length === 10
                    ? "bg-[#050505] text-white border-[#050505] hover:bg-white hover:text-[#050505]"
                    : "bg-white text-[#050505] border-[#d9d9d9] hover:border-[#050505]"
                } shadow-[0_2px_0_rgba(0,0,0,0.12)] ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={async () => {
                if (!isEditing) {
                  setIsEditing(true);
                  setSelectedCards(currentDeck);
                  return;
                }
                if (isEditing && selectedCards.length === 10) {
                  try {
                    setSaving(true);
                    await editGemDeck(user.token, selectedCards);
                    setCurrentDeck([...selectedCards]);
                    setSelectedCards([]);
                    setIsEditing(false);
                  } catch (e: any) {
                    setError(e.message);
                  } finally {
                    setSaving(false);
                  }
                  return;
                }
                // isEditing 且未選滿 10 -> 取消
                setIsEditing(false);
                setSelectedCards([]);
              }}
              disabled={saving}
              title={!isEditing ? "編輯" : (selectedCards.length === 10 ? (saving ? "" : "儲存") : "取消")}
            >
              {!isEditing ? (
                "Edit"
              ) : selectedCards.length === 10 ? (
                saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                ) : (
                  "Save"
                )
              ) : (
                "Cancel"
              )}
            </button>

            <button
              className="rounded-xl px-8 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center justify-center h-10 w-28 whitespace-nowrap bg-[#050505] text-white border border-[#050505] hover:bg-white hover:text-[#050505] shadow-[0_2px_0_rgba(0,0,0,0.12)]"
              onClick={() => {
                localStorage.setItem("battleDeck", JSON.stringify(currentDeck));
                router.push("/battle");
              }}
              disabled={currentDeck.length !== 10 || loading || isEditing}
              title={currentDeck.length === 10 ? "前往戰鬥" : "需要 10 張卡片的牌組"}
            >
              Battle
            </button>
          </div>

          {/* spacer to balance the Return button on the left */}
          <div className="w-10 shrink-0" />
        </div>
      </div>
    </div>
  );
}
