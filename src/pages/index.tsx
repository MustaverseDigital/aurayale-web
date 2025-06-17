"use client"

import { useState, useEffect, useRef } from "react"
import { Gamepad2, Check } from "lucide-react"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import {
  getNonce as apiGetNonce,
  signAndLogin as apiSignAndLogin,
  getUserGems as apiGetUserGems,
  getUserDeck as apiGetUserDeck,
  editGemDeck as apiEditGemDeck,
  GemItem,
} from "../api/auraServer"

export default function DeckManager() {
  const { address, isConnected } = useAccount();
  const [jwt, setJwt] = useState("")
  const [gems, setGems] = useState<GemItem[]>([])
  const [currentDeck, setCurrentDeck] = useState<number[]>([])
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 背景音樂音量控制
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2
    }
  }, [])

  // 自動登入/登出流程
  useEffect(() => {
    const login = async () => {
      setLoading(true)
      setError("")
      try {
        if (!address) return
        const nonce = await apiGetNonce()
        // RainbowKit 只負責連接錢包，簽名流程可在這裡自動觸發
        // 這裡用 window.ethereum 兼容所有錢包
        const signature = await window.ethereum.request({ method: "personal_sign", params: [nonce, address] })
        const { token } = await apiSignAndLogin(address, signature)
        setJwt(token)
        const gems = await apiGetUserGems(token)
        setGems(gems)
        const deck = await apiGetUserDeck(token)
        setCurrentDeck(Array.isArray(deck) ? deck : [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (isConnected && address) {
      login()
    } else {
      setJwt("")
      setGems([])
      setCurrentDeck([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  // 取得卡片
  const handleGetGems = async () => {
    if (!jwt) return
    setLoading(true)
    setError("")
    try {
      const gems = await apiGetUserGems(jwt)
      setGems(gems)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // 取得牌組
  const handleGetDeck = async () => {
    if (!jwt) return
    setLoading(true)
    setError("")
    try {
      const deck = await apiGetUserDeck(jwt)
      setCurrentDeck(Array.isArray(deck) ? deck : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // build 牌組
  const handleUpdateDeck = async () => {
    if (selectedCards.length !== 10) return
    setLoading(true)
    setError("")
    try {
      const newDeck = await apiEditGemDeck(jwt, selectedCards)
      setCurrentDeck(Array.isArray(newDeck) ? newDeck : [])
      setSelectedCards([])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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
    switch (rarity?.toLowerCase?.()) {
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
    <div className="min-h-screen text-white flex flex-col ">
      {/* 背景音樂 */}
      <audio ref={audioRef} src="/img/bgm/bgm.mp3" autoPlay loop hidden />
      {/* RainbowKit ConnectButton 取代所有登入/登出流程 */}
      {!jwt && (
        <section className="Connect fixed w-full h-full bgImg z-2 flex flex-col">
          <div className="bgImgLogin w-full h-full absolute -bottom-20"></div>
          <div className="bgDark"></div>
          {/* Logo置頂 */}
          <div className="w-full flex flex-col items-center pt-12 z-10">
            <img src="/img/logo.png" alt="" width="256px" className="mb-2" />
            <img src="/img/logo2.png" alt="" width="128px" className="mb-2" />
          </div>
          {/* Error置中 */}
          {error && (
            <div className="flex-1 flex items-center justify-center z-10">
              <div className="text-red-400 text-sm bg-black/60 px-6 py-3 rounded-xl">{error}</div>
            </div>
          )}
          {/* ConnectButton置底 */}
          <div className="w-full flex justify-center items-end pb-16 z-10 mt-auto">
            <ConnectButton />
          </div>
        </section>
      )}

      {/* Navbar */}
      <nav className="p-4 py-2 flex items-center justify-between shadow-xs shadow-stone-800 ">
        <div className="flex items-center gap-2">
          <img src="/img/logo.png" alt="" width="126px" />
        </div>
        <ConnectButton />
      </nav>

      {error && (
        <div className="p-4 bg-red-800 text-red-200">{error}</div>
      )}

      {/* Current Deck Section */}
      <section className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Deck</h2>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            {(selectedCards.length > 0 ? selectedCards.length : currentDeck.length)}/10
          </span>
          <button
            className="ml-4 px-3 py-1 bg-gray-700 rounded text-xs"
            onClick={handleGetDeck}
            disabled={loading || !jwt}
          >
            重新取得牌組
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 p-2 pt-8 bg-deck rounded-xl">
          {Array.from({ length: 10 }).map((_, index) => {
            const useSelected = selectedCards.length > 0
            const cardId = useSelected ? selectedCards[index] : currentDeck[index]
            const card = gems.find((g) => g.id === cardId)
            return (
              <div key={index} className="">
                {card ? (
                  <div
                    className={`text-center p-1 ${useSelected ? 'cursor-pointer hover:opacity-70' : ''}`}
                    onClick={() => {
                      if (useSelected) {
                        setSelectedCards((prev) => prev.filter((id, i) => i !== index))
                      }
                    }}
                    title={useSelected ? '點擊移除' : ''}
                  >
                    <img src={`/img/${card.id.toString().padStart(3, '0')}.png`} alt={card.metadata.name} className="w-full aspect-[3/4] object-contain rounded mb-1" />
                    <div className="text-xs font-medium truncate">{card.metadata.name}</div>
                    <div className={`text-xs px-1 rounded mt-1 ${getRarityColor('unknown')}`}>{'unknown'}</div>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">你的卡片</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-secondary text-secondary-foreground">
              {selectedCards.length}/10 已選
            </span>
            <button
              className="ml-2 px-3 py-1 bg-gray-700 rounded text-xs"
              onClick={handleGetGems}
              disabled={loading || !jwt}
            >
              重新取得卡片
            </button>
            {selectedCards.length === 10 && (
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
                onClick={handleUpdateDeck}
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-1" />
                {loading ? "更新中..." : "更新牌組"}
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {gems.map((gem) => {
            const isSelected = selectedCards.includes(gem.id)
            const isInDeck = currentDeck.includes(gem.id)
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
                <div className="p-2 flex flex-col space-y-1.5 relative overflow-hidden">
                  <img src={`/img/${gem.id.toString().padStart(3, '0')}.png`} alt={gem.metadata.name} className="aspect-[3/4] bg-card bg-card-1 rounded mb-2 object-contain w-full" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium truncate">{gem.metadata.name}</h3>
                    <div className={`text-xs px-2 py-1 rounded text-center ${getRarityColor('unknown')}`}>{'unknown'}</div>
                    <div className="text-xs text-gray-400">數量: {gem.quantity}</div>
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-full h-full border border-gold rounded-lg flex items-center justify-center text-blue-400 text-xs"></div>
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
      <section className="fixed flex justify-center bottom-0 w-full p-2 backdrop-blur-md shadow-lg btnSection">
        <button className="btn btn-battle p-2 px-8">Battle</button>
      </section>
    </div>
  )
}