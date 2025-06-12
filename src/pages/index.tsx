"use client"

import { useState } from "react"
import { Gamepad2, Check } from "lucide-react"
import { ConnectButton } from '@rainbow-me/rainbowkit';


// Mock data for demonstration
const mockGems = [
  { id: 1, name: "Fire Crystal", rarity: "common" },
  { id: 2, name: "Water Sapphire", rarity: "rare" },
  { id: 3, name: "Earth Diamond", rarity: "epic" },
  { id: 4, name: "Air Ruby", rarity: "legendary" },
  { id: 5, name: "Lightning Opal", rarity: "rare" },
  { id: 6, name: "Ice Emerald", rarity: "common" },
  { id: 7, name: "Shadow Onyx", rarity: "epic" },
  { id: 8, name: "Light Pearl", rarity: "legendary" },
  { id: 9, name: "Nature Jade", rarity: "common" },
  { id: 10, name: "Metal Platinum", rarity: "rare" },
  { id: 11, name: "Void Obsidian", rarity: "epic" },
  { id: 12, name: "Spirit Quartz", rarity: "common" },
]

const mockCurrentDeck = [1, 2, 3, 4, 5, 6, 7, 8] // 8 cards in current deck

export default function DeckManager() {
  const [selectedCards, setSelectedCards] = useState<number[]>([])

  // Toggle card selection (visual only)
  const toggleCardSelection = (cardId: number) => {
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId)
      } else if (prev.length < 10) {
        return [...prev, cardId]
      }
      return prev
    })
  }

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">CardGame</span>
        </div>
        <ConnectButton />
      </nav>

      {/* Current Deck Section */}
      <section className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Deck</h2>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            {mockCurrentDeck.length}/10
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, index) => {
            const cardId = mockCurrentDeck[index]
            const card = cardId ? mockGems.find((g) => g.id === cardId) : null

            return (
              <div
                key={index}
                className="aspect-[3/4] bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center"
              >
                {card ? (
                  <div className="text-center p-1">
                    <div className="text-xs font-medium truncate">{card.name}</div>
                    <div className={`text-xs px-1 rounded mt-1 ${getRarityColor(card.rarity)}`}>{card.rarity}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">Empty</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Card Selection Section */}
      <section className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Cards</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-secondary text-secondary-foreground">
              {selectedCards.length}/10 selected
            </span>
            {selectedCards.length === 10 && (
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors">
                <Check className="w-4 h-4 mr-1" />
                Update Deck
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {mockGems.map((gem) => {
            const isSelected = selectedCards.includes(gem.id)
            const isInDeck = mockCurrentDeck.includes(gem.id)

            return (
              <div
                key={gem.id}
                className={`rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer transition-all duration-200 ${isSelected
                  ? "ring-2 ring-blue-400 bg-blue-900/20"
                  : isInDeck
                    ? "ring-2 ring-green-400 bg-green-900/20"
                    : "bg-gray-800 hover:bg-gray-700"
                  } ${selectedCards.length >= 10 && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isInDeck && (selectedCards.length < 10 || isSelected)) {
                    toggleCardSelection(gem.id)
                  }
                }}
              >
                <div className="p-3 flex flex-col space-y-1.5">
                  <div className="aspect-[3/4] bg-gray-700 rounded mb-2 flex items-center justify-center">
                    <div className="text-gray-400 text-xs">Card Image</div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium truncate">{gem.name}</h3>
                    <div className={`text-xs px-2 py-1 rounded text-center ${getRarityColor(gem.rarity)}`}>
                      {gem.rarity}
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-center text-blue-400 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Selected
                      </div>
                    )}

                    {isInDeck && (
                      <div className="flex items-center justify-center text-green-400 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        In Deck
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
