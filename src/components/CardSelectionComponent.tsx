import React from "react";
import { Check } from "lucide-react";
import { GemItem } from "../api/auraServer";

interface CardSelectionComponentProps {
  gems: GemItem[];
  currentDeck: number[];
  selectedCards: number[];
  setSelectedCards: React.Dispatch<React.SetStateAction<number[]>>;
  toggleCardSelection: (cardId: number) => void;
  getCardEffect: (id: number) => string;
  isEditing?: boolean;
}

const CardSelectionComponent: React.FC<CardSelectionComponentProps> = ({
  gems,
  currentDeck,
  selectedCards,
  toggleCardSelection,
  getCardEffect,
  isEditing = false,
}) => {
  const useSelected = isEditing;
  return (
    <section className="px-4 pt-0 pb-20 content">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Cards</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full  bg-black/30 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-secondary text-secondary-foreground">
            {useSelected ? selectedCards.length : currentDeck.length}/10 Selected
          </span>
        </div>
      </div>
      {gems.length === 0 && (
        <div className="space-y-4 bg-[#898cd2]/20  p-4 rounded-lg   w-full text-center">No Card</div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">

        {gems.map((gem) => {
          const isSelected = useSelected ? selectedCards.includes(gem.id) : false;
          const isInDeck = useSelected ? selectedCards.includes(gem.id) : currentDeck.includes(gem.id);
          return (
            <div
              key={gem.id}
              className={`rounded-lg bg-card bg-card-block text-card-foreground shadow-sm transition-all duration-200 ${isSelected
                ? "ring-2 ring-red-500 bg-red-900/10 scale-95"
                : isInDeck
                  ? "InDeck"
                  : "bg-gray-800 hover:bg-gray-700"
                } ${useSelected && selectedCards.length >= 10 && !isSelected
                  ? "opacity-50 cursor-not-allowed"
                  : isEditing
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
              onClick={() => {
                if (!isEditing) return;
                if (isSelected) {
                  // 允許在 Your Cards 直接取消選取
                  toggleCardSelection(gem.id);
                  return;
                }
                // 未選中時，僅在未滿 10 張時可加入
                if (selectedCards.length < 10) {
                  toggleCardSelection(gem.id);
                }
              }}
            >
              <div className={`p-2 flex flex-col space-y-1.5 relative overflow-hidden ${isSelected ? "scale-95" : ""}`}>
                <img
                  src={`/img/${gem.id.toString().padStart(3, "0")}.png`}
                  alt={gem.metadata?.name || `Card ${gem.id}`}
                  className={`aspect-[3/4] bg-card bg-card-1 rounded mb-2 object-contain w-full ${isSelected ? "scale-95" : ""}`}
                />
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">{getCardEffect(gem.id)}</div>
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-red-500 rounded-lg"></div>
                  )}
                  {isInDeck && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-green-400 bg-inDeck">
                      <Check className="w-12 h-12 mb-8 text-shadow-md" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CardSelectionComponent; 