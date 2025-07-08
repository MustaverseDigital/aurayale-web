import React from "react";
import { Check } from "lucide-react";
import { GemItem } from "../api/auraServer";

interface DeckSectionProps {
  currentDeck: number[];
  selectedCards: number[];
  gems: GemItem[];
  setSelectedCards: React.Dispatch<React.SetStateAction<number[]>>;
  toggleCardSelection: (cardId: number) => void;
}

const DeckSection: React.FC<DeckSectionProps> = ({
  currentDeck,
  selectedCards,
  gems,
  setSelectedCards,
  toggleCardSelection,
}) => {
  return (
    <section className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Current Deck</h2>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          {selectedCards.length > 0 ? selectedCards.length : currentDeck.length}/10
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 p-2 pt-8 bg-deck rounded-xl">
        {Array.from({ length: 10 }).map((_, index) => {
          const useSelected = selectedCards.length > 0;
          const cardId = useSelected ? selectedCards[index] : currentDeck[index];
          const card = gems.find((g) => g.id === cardId);
          return (
            <div key={index} className="">
              {card ? (
                <div
                  className={`text-center p-1 ${useSelected ? "cursor-pointer hover:opacity-70" : ""}`}
                  onClick={() => {
                    if (selectedCards.length === 0) {
                      setSelectedCards(currentDeck.length ? [...currentDeck] : []);
                      setTimeout(() => toggleCardSelection(cardId), 0);
                    } else if (useSelected) {
                      setSelectedCards((prev) => prev.filter((id, i) => i !== index));
                    }
                  }}
                  title={useSelected ? "Click to remove" : ""}
                >
                  <img
                    src={`/img/${card.id.toString().padStart(3, "0")}.png`}
                    alt={card.metadata.name}
                    className="w-full aspect-[3/4] object-contain rounded mb-1"
                  />
                  <div className="text-xs font-medium truncate">{card.metadata.name}</div>
                </div>
              ) : (
                <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">
                  +
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DeckSection; 