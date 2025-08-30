import React from "react";
import { GemItem } from "../api/auraServer";

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
    <section className="p-4  mt-14">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Current Deck</h2>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          {isEditing ? selectedCards.length : currentDeck.length}/10
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 pt-8 bg-[#898cd2]/30 p-4 rounded-xl inset-shadow-sm inset-shadow-[#ffffff]/30">
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
                    src={`/img/${card.id.toString().padStart(3, "0")}.png`}
                    alt={card.metadata.name}
                    className="w-full aspect-[3/4] object-contain rounded mb-1"
                  />
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

export default DeckComponent; 