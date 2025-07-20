import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DeckComponent from "../components/DeckComponent";
import CardSelectionComponent from "../components/CardSelectionComponent";
import { getUserGems, getUserDeck, editGemDeck, GemItem } from "../api/auraServer";
import { Wallet, CornerDownLeft } from "lucide-react";
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
    if (id >= 1 && id <= 6) return "+ 100 ATK";
    if (id >= 7 && id <= 12) return "Pair + 200 ATK";
    if (id >= 13 && id <= 18) return " + 1 Mult";
    if (id >= 19 && id <= 24) return "Pair + 2 Mult";
    return "";
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">請先登入</div>;

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* 玩家資訊 header bar */}
      <header class="py-2 px-4 bg-[#2f334d]/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
          <h1 class="text-lg text-gray-400">Edit Deck</h1>

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
        />
      </div>
      {/* BattleComponent */}
       <div className="BattleComponent fixed flex justify-center bottom-0 w-full p-2 backdrop-blur-md shadow-lg btnSection min-h-[57px]">
        <button
          className="btn btn-sub rounded-xl flex items-center justify-center p-2 absolute left-2 bottom-2"
          onClick={async () => {
            if (selectedCards.length === 10) {
              try {
                setLoading(true);
                await editGemDeck(user.token, selectedCards);
                setCurrentDeck([...selectedCards]);
                setSelectedCards([]);
              } catch (e: any) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            }
            router.push("/profile");
          }}
          title="返回個人頁面"
        >
          <CornerDownLeft className="w-6 h-6" />
        </button>
      {((selectedCards.length === 10) || (selectedCards.length === 0 && currentDeck.length === 10)) && (
       
          <button
            className="btn btn-battle p-2 px-8 animate-fade-in"
            onClick={async () => {
              try {
                setLoading(true);
                if (selectedCards.length === 10) {
                  await editGemDeck(user.token, selectedCards);
                  setCurrentDeck([...selectedCards]);
                  setSelectedCards([]);
                  localStorage.setItem("battleDeck", JSON.stringify(selectedCards));
                } else {
                  localStorage.setItem("battleDeck", JSON.stringify(currentDeck));
                }
                router.push("/battle");
              } catch (e: any) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Battle
          </button>
        
      )}
      </div>
      {/* 其他 deck 管理功能可陸續搬移進來 */}
    </div>
  );
} 