import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DeckComponent from "../components/DeckComponent";
import CardSelectionComponent from "../components/CardSelectionComponent";
import { getUserGems, getUserDeck, editGemDeck, GemItem } from "../api/auraServer";
import { Wallet, CornerDownLeft, Loader2 } from "lucide-react";
import { useUser } from "../context/UserContext";

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

  useEffect(() => {
    if (!user?.token) {
      router.replace("/login");
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
    setUsername(user.username);
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

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">請先登入</div>;

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* 玩家資訊 header bar */}
      <header className="py-2 px-4 border-b border-[#898cd2]/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
        <h1 className="text-lg text-gray-400">Edit Deck</h1>

        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-white bg-black/30 py-1 px-3 rounded-xl">
            {username}
            {walletAddress ? (
              <span className="text-gray-300">(0x...{walletAddress.slice(-5)})</span>
            ) : (
              <span className="text-gray py-1 px-3 rounded-xl bg-gray-600/90 ">Not bound</span>
            )}
          </span>
        </div>

      </header>

      {error && <div className="p-4  bg-red-800 text-red-200">{error}</div>}
      <DeckComponent
        currentDeck={currentDeck}
        selectedCards={selectedCards}
        gems={gems}
        setSelectedCards={setSelectedCards}
        toggleCardSelection={toggleCardSelection}
        isEditing={isEditing}
      />
      {/* CardSelectionComponent */}
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
      {/* Bottom action bar: 編輯 / Battle */}
      <div className="BattleComponent fixed bottom-0 left-0 right-0 w-full p-2 backdrop-blur-md shadow-lg btnSection min-h-[57px]">
        {/* 返回個人頁面 */}
        <button
          className="btn btn-square rounded-xl flex items-center justify-center p-3 absolute left-2 bottom-2 text-sm bg-transparent hover:bg-white/10 transition"
          onClick={() => router.push("/profile")}
          title="返回個人頁面"
        >
          <CornerDownLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center gap-3">
          <button
            className={`btn rounded-xl text-shadow-sm px-6 py-2 text-white text-sm font-semibold transition inline-flex items-center justify-center h-10 w-28 whitespace-nowrap ${!isEditing
              ? "btn-primary "
              : selectedCards.length === 10
                ? "btn-success "
                : "btn-warning "
              } bg-opacity-90 hover:bg-opacity-100 ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
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
            className="btn btn-battle text-shadow-lg rounded-xl px-8 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition bg-opacity-90 hover:bg-opacity-100 inline-flex items-center justify-center h-10 w-28 whitespace-nowrap"
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
      </div>
      {/* 其他 deck 管理功能可陸續搬移進來 */}
    </div>
  );
} 