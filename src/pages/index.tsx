"use client"

import { useState } from "react"
import { Gamepad2, Check, Book } from "lucide-react"
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
    
    <div className="min-h-screen  text-white flex flex-col ">
      {/* Login */}
    <section className="Connect fixed w-full h-full bgImg z-2  ">
      <div className="bgImgLogin w-full  h-full absolute -bottom-20"></div>
      <div className="bgDark"></div>
      <div className="absolute w-full left-0 top-15 z-2 flex justify-center flex-wrap">
        <div className="w-full flex justify-center ">
          <img src="/img/logo.png" alt="" width="256px"/>
        </div>
        <div className="w-full flex justify-center ">
          <img src="/img/logo2.png" alt="" width="128px"/>
        </div>
      </div>
      <div className="absolute bottom-10 w-full flex justify-center">
        <ConnectButton/>
      </div>
      
    </section>

      {/* Navbar */}
      <nav className="p-4 py-2 flex items-center justify-between shadow-xs shadow-stone-800 ">
        <div className="flex items-center gap-2">
          <img src="/img/logo.png" alt="" width="126px"/>
        </div>
        <ConnectButton />
      </nav>

      {/* Current Deck Section */}
      <section className="p-4">
        <div className="flex items-center justify-between -mb-5">
          <h2 className="text-lg font-semibold p-1 ml-2 px-3 rounded-md bg-gold-r bg-title-deck text-shadow-md">Current Deck</h2>
          <span className="inline-flex items-center rounded-full border px-2.5 py-1 mr-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md bg-gold-r">
            <Book className="w-4 h-4 mr-1 text-shadow-md" />
            {mockCurrentDeck.length}/10
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 p-2  pt-8 bg-deck rounded-xl">
          {Array.from({ length: 10 }).map((_, index) => {
            const cardId = mockCurrentDeck[index]
            const card = cardId ? mockGems.find((g) => g.id === cardId) : null

            return (
              <div
                key={index}
                className=""
              >
                
                {card ? (
                  <div className="bg-card bg-card-12 aspect-[3/4] flex items-center shadow-lg">
                    <div className="text-center p-1">
                      <div className="text-xs font-medium truncate hidden">{card.name}</div>
                      <div className={`text-xs px-1 rounded mt-1 ${getRarityColor(card.rarity)}`} hidden>{card.rarity}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card bg-card-empty aspect-[3/4] flex items-center justify-center text-gray-500 text-4xl">+</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Card Selection Section */}
      <section className="px-4 pt-0 pb-20 conetnt">
        <div className="flex items-center justify-between mb-4 hidden">
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
                className={`rounded-lg bg-card bg-card-block text-card-foreground shadow-sm cursor-pointer transition-all duration-200 ${isSelected
                  ? "ring-2 ring-blue-400 bg-blue-900/20"
                  : isInDeck
                    ? "InDeck"
                    : "bg-gray-800 hover:bg-gray-700"
                  } ${selectedCards.length >= 10 && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isInDeck && (selectedCards.length < 10 || isSelected)) {
                    toggleCardSelection(gem.id)
                  }
                }}
              >
                <div className="p-2  flex flex-col space-y-1.5 relative overflow-hidden">
                  <div className="aspect-[3/4] bg-card bg-card-1 rounded mb-2 flex items-center justify-center ">
                  </div>

                  <div className="space-y-1 ">
                    <h3 className="text-sm font-medium truncate hidden">{gem.name}</h3>
                    <h3 className="px-2 text-sm">{gem.effect} Effect + 10</h3>
                    <div className={`text-xs px-2 py-1 rounded text-center hidden ${getRarityColor(gem.rarity)}`}>
                      {gem.rarity}
                    </div>

                    {isSelected && (
                      <div className="absolute top-0 left-0 w-full h-full border border-gold rounded-lg flex items-center justify-center text-blue-400 text-xs">
                      </div>
                    )}

                    {isInDeck && (
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-green-400 bg-inDeck">
                        <Check className="w-12 h-12 mb-8 text-shadow-md" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Battle Section */}
      <section className="fixed flex justify-center  bottom-0 w-full p-2 backdrop-blur-md shadow-lg btnSection">
          <button className="btn btn-battle p-2 px-8">Battle</button>
      </section>
    </div>
  )
}
