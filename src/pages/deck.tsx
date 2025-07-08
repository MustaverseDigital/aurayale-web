import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DeckComponent from "../components/DeckComponent";
import CardSelectionComponent from "../components/CardSelectionComponent";
import { getUserGems, getUserDeck, editGemDeck, GemItem } from "../api/auraServer";

export default function DeckPage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string>("");
  const [gems, setGems] = useState<GemItem[]>([]);
  const [currentDeck, setCurrentDeck] = useState<number[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }
    setJwt(token);
    setLoading(true);
    Promise.all([
      getUserGems(token),
      getUserDeck(token)
    ]).then(([gems, deck]) => {
      setGems(gems);
      setCurrentDeck(Array.isArray(deck) ? deck : []);
    }).catch(e => {
      setError(e.message);
    }).finally(() => setLoading(false));
  }, [router]);

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

  return (
    <div className="min-h-screen text-white flex flex-col">
      {error && <div className="p-4 bg-red-800 text-red-200">{error}</div>}
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
      {(selectedCards.length === 10 || (selectedCards.length === 0 && currentDeck.length === 10)) && (
        <div className="BattleComponent fixed flex justify-center bottom-0 w-full p-2 backdrop-blur-md shadow-lg btnSection">
          <button
            className="btn btn-battle p-2 px-8 animate-fade-in"
            onClick={async () => {
              let deckToSend = selectedCards.length === 10 ? selectedCards : currentDeck;
              try {
                if (selectedCards.length === 10) {
                  await editGemDeck(jwt, selectedCards);
                  setCurrentDeck([...selectedCards]);
                  setSelectedCards([]);
                }
                localStorage.setItem("battleDeck", JSON.stringify(deckToSend));
                router.push("/battle");
              } catch (e: any) {
                setError(e.message);
              }
            }}
          >
            Battle
          </button>
        </div>
      )}
      {/* 其他 deck 管理功能可陸續搬移進來 */}
    </div>
  );
} 