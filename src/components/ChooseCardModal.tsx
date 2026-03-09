import { useState } from "react"
import { X, Check } from "lucide-react"
import { getCardImagePath } from "../lib/utils"

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-[60]">
      <div className="bg-[#3B2F36] backdrop-blur-sm border-2 border-[#877B8A]/50 rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#877B8A]/30 p-3 sm:p-6 flex justify-between items-center relative flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white text-center flex-1">Choose a Card</h2>
          <button
            onClick={handleClose}
            className="absolute right-3 sm:right-4 top-3 sm:top-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>

          {/* Diamond separator */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#877B8A] transform rotate-45" />
          </div>
        </div>

        {/* Card Grid - scrollable */}
        <div className="p-3 sm:p-6 pt-5 sm:pt-8 overflow-y-auto flex-1">
          {availableCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sm:w-16 sm:h-16"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </div>
              <p className="text-white text-base sm:text-lg font-semibold mb-2">No Available Cards</p>
              <p className="text-gray-400 text-xs sm:text-sm max-w-sm">
                You don&apos;t have any cards that match the requirements for this trade.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {availableCards.map((card) => {
                const isSelected = selectedCard?.id === card.id

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`group transition-all relative ${isSelected
                      ? "ring-2 ring-[#FFC800] scale-105 rounded-xl"
                      : "hover:scale-105 hover:ring-2 hover:ring-[#FFC800]/50 rounded-xl"
                      }`}
                  >
                    <div className="rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={getCardImagePath(card.id)}
                        alt={card.name}
                        className="w-full object-cover"
                      />
                      <div className="p-1 sm:p-2">
                        <div className="text-[10px] sm:text-xs font-semibold text-white truncate mb-0.5 sm:mb-1">{card.name}</div>
                        {!isForYouGet && (
                          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#FFC800] sm:w-[14px] sm:h-[14px]">
                              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                              <path d="M9 9h6v6H9z" fill="currentColor" />
                            </svg>
                            <span className="text-[10px] sm:text-xs font-semibold text-white">{card.quantity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-[#FFC800]/90 rounded-full p-0.5 sm:p-1 shadow-lg">
                        <Check size={16} className="text-white sm:hidden" />
                        <Check size={20} className="text-white hidden sm:block" />
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
          <div className="p-3 sm:p-6 pt-0 flex justify-center flex-shrink-0">
            <button
              onClick={handleConfirm}
              disabled={!selectedCard}
              className="bg-[#713DE9] text-white px-8 sm:px-12 py-2.5 sm:py-3 rounded-full font-bold text-base sm:text-lg border-2 border-[#877B8A]/50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

