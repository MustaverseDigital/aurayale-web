import { useState } from "react"
import { X, Check } from "lucide-react"

interface Card {
  id: string
  name: string
  image: string
  quantity: number
}

interface ChooseCardModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (card: Card) => void
  availableCards: Card[]
  isForYouGet?: boolean
}

export function ChooseCardModal({ isOpen, onClose, onConfirm, availableCards, isForYouGet = false }: ChooseCardModalProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  // Reset selected card when modal closes
  const handleClose = () => {
    setSelectedCard(null)
    onClose()
  }

  if (!isOpen) return null

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  const handleConfirm = () => {
    if (selectedCard) {
      onConfirm(selectedCard)
      setSelectedCard(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-[#898cd2]/30 backdrop-blur-sm border-2 border-[#898cd2]/50 rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#898cd2]/30 p-6 flex justify-between items-center relative flex-shrink-0">
          <h2 className="text-xl font-bold text-white text-center flex-1">Choose a Card</h2>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Diamond separator */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-4 h-4 bg-[#898cd2] transform rotate-45" />
          </div>
        </div>

        {/* Card Grid - scrollable */}
        <div className="p-6 pt-8 overflow-y-auto flex-1">
          {availableCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </div>
              <p className="text-white text-lg font-semibold mb-2">No Available Cards</p>
              <p className="text-gray-400 text-sm max-w-sm">
                You don&apos;t have any cards that match the requirements for this trade.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {availableCards.map((card) => {
                const isSelected = selectedCard?.id === card.id

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`group transition-all relative ${isSelected
                      ? "ring-2 ring-[#898cd2] scale-105"
                      : "hover:scale-105 hover:ring-2 hover:ring-[#898cd2]/50"
                      }`}
                  >
                    <div className="border-2 border-[#898cd2] rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={`/img/${card.id.padStart(3, "0")}.png`}
                        alt={card.name}
                        className="w-full aspect-[3/4] object-cover"
                      />
                      <div className="p-2 border-t border-[#898cd2]/50">
                        <div className="text-xs font-semibold text-white truncate mb-1">{card.name}</div>
                        {!isForYouGet && (
                          <div className="flex items-center justify-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                              <path d="M9 9h6v6H9z" fill="currentColor" />
                            </svg>
                            <span className="text-xs font-semibold text-white">{card.quantity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#898cd2] rounded-full p-1 shadow-lg">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        {availableCards.length > 0 && (
          <div className="p-6 pt-0 flex justify-center flex-shrink-0">
            <button
              onClick={handleConfirm}
              disabled={!selectedCard}
              className="bg-[#898cd2] text-white px-12 py-3 rounded-full font-bold text-lg border-2 border-[#898cd2]/50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

