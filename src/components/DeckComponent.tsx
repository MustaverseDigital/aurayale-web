import React from "react";
import { GemItem } from "../api/auraServer";
import { getCardImagePath } from "../lib/utils";

interface DeckComponentProps {
  currentDeck: number[];
  selectedCards: number[];
  gems: GemItem[];
  setSelectedCards: React.Dispatch<React.SetStateAction<number[]>>;
  toggleCardSelection: (cardId: number) => void;
  isEditing?: boolean;
}

const DeckComponent: React.FC<DeckComponentProps> = ({
  currentDeck,
  selectedCards,
  gems,
  setSelectedCards,
  isEditing = false,
}) => {
  return (
    <section className="px-4 pb-4 pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-[#050505]">Current Deck</h2>
        <span className="inline-flex items-center rounded-full border border-[#050505] bg-[#050505] px-2.5 py-0.5 text-xs font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          {isEditing ? selectedCards.length : currentDeck.length}/10
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 pt-8 bg-white p-4 rounded-xl border border-[#d6d6d6] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        {Array.from({ length: 10 }).map((_, index) => {
          const useSelected = isEditing;
          const cardId = useSelected ? selectedCards[index] : currentDeck[index];
          const card = gems.find((g) => g.id === cardId);
          return (
            <div key={index} className="">
              {card ? (
                <div
                  className={`text-center p-1 ${useSelected ? "cursor-pointer hover:opacity-70" : ""}`}
                  onClick={() => {
                    if (!isEditing) return;
                    setSelectedCards((prev) => prev.filter((id, i) => i !== index));
                  }}
                  title={useSelected ? "Click to remove" : ""}
                >
                  <img
                    src={getCardImagePath(card.id)}
                    alt={card.metadata.name}
                    className="w-full aspect-[3/4] object-contain rounded mb-1"
                  />
                </div>
              ) : (
                <div className="bg-[#f4f4f1] border border-dashed border-[#bdbdbd] aspect-[3/4] flex items-center justify-center text-[#9a9a9a] text-4xl">
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

export default DeckComponent; 
