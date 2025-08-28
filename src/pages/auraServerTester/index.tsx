"use client"

import { useState, useEffect } from "react"
import { Wallet, Settings, User, AlertCircle, CheckCircle } from "lucide-react"

interface GemItem {
  id: number
  quantity: number
  metadata: {
    name: string
    image: string
    description: string
  }
}

// 客户端专用的 MetaMask 连接组件
interface MetaMaskButtonProps {
  onConnect: () => Promise<void>
  isLoading: boolean
  isConnected: boolean
  walletAddress: string
}

const MetaMaskButton = ({ onConnect, isLoading, isConnected, walletAddress }: MetaMaskButtonProps) => {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(typeof window !== "undefined" && typeof window.ethereum !== "undefined")
  }, [])

  return (
    <button
      onClick={onConnect}
      disabled={isLoading || !isInstalled}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isConnected ? "Wallet Connected" : "Connect MetaMask"}
    </button>
  )
}

// 客户端专用的 MetaMask 状态组件
const MetaMaskStatus = () => {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(typeof window !== "undefined" && typeof window.ethereum !== "undefined")
  }, [])

  if (!isInstalled) {
    return (
      <p className="text-sm text-gray-500">
        MetaMask not detected. Please install MetaMask extension.
      </p>
    )
  }

  return null
}

export default function AuraServerTester() {
  const [baseUrl, setBaseUrl] = useState("https://auragem.zeabur.app/api")
  const [walletAddress, setWalletAddress] = useState("")
  const [jwt, setJwt] = useState("")
  const [nonce, setNonce] = useState("")
  const [userName, setUserName] = useState("")
  const [gems, setGems] = useState<GemItem[]>([])
  const [currentDeck, setCurrentDeck] = useState<number[]>([])
  const [newDeck, setNewDeck] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setSuccess("Wallet connected successfully!")
      }
    } catch (err: any) {
      setError(`Failed to connect wallet: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Get nonce
  const getNonce = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (response.ok) {
        setNonce(data.nonce)
        setSuccess("Nonce received successfully!")
      } else {
        setError(data.error || "Failed to get nonce")
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Sign nonce and login
  const signAndLogin = async () => {
    if (!nonce || !walletAddress) {
      setError("Please get nonce first and connect wallet")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Sign the nonce with MetaMask
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [nonce, walletAddress],
      })

      // Login with signature
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          name: userName || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setJwt(data.token)
        setSuccess(`Login successful! User ID: ${data.userId}`)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err: any) {
      setError(`Login error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Get user gems
  const getUserGems = async () => {
    if (!jwt) {
      setError("Please login first to get JWT token")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${baseUrl}/user/gems`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setGems(data)
        setSuccess(`Found ${data.length} gems!`)
      } else {
        setError(data.error || "Failed to get gems")
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Get user gem deck
  const getUserDeck = async () => {
    if (!jwt) {
      setError("Please login first to get JWT token")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${baseUrl}/user/gem-deck`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentDeck(data.deck)
        setNewDeck(data.deck.join(", "))
        setSuccess("Gem deck loaded successfully!")
      } else {
        setError(data.error || "Failed to get gem deck")
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Edit user gem deck
  const editGemDeck = async () => {
    if (!jwt) {
      setError("Please login first to get JWT token")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Parse the new deck input
      const deckArray = newDeck
        .split(",")
        .map((id) => Number.parseInt(id.trim()))
        .filter((id) => !isNaN(id))

      if (deckArray.length !== 10) {
        setError("Deck must contain exactly 10 gem IDs")
        return
      }

      const response = await fetch(`${baseUrl}/user/gem-deck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          gems: deckArray,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentDeck(data.deck)
        setSuccess("Gem deck updated successfully!")
      } else {
        setError(data.error || "Failed to update gem deck")
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AuraServer API Tester</h1>
        <p className="text-gray-500">Test all AuraServer API endpoints with Web3 wallet integration</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Server Configuration */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Server Configuration
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">Base URL</label>
            <input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:3000/api"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </h2>
          <p className="text-sm text-gray-500 mt-1">Connect your MetaMask wallet to start testing</p>
        </div>
        <div className="p-6 space-y-4">
          <MetaMaskButton
            onConnect={connectWallet}
            isLoading={loading}
            isConnected={!!walletAddress}
            walletAddress={walletAddress}
          />

          {walletAddress && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Connected Address:</p>
              <p className="text-sm font-mono break-all">{walletAddress}</p>
            </div>
          )}

          <MetaMaskStatus />
        </div>
      </div>

      {/* Authentication */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication
          </h2>
          <p className="text-sm text-gray-500 mt-1">Two-step login process: Get nonce → Sign → Get JWT</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Name (Optional)</label>
            <input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={getNonce}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              1. Get Nonce
            </button>
            <button
              onClick={signAndLogin}
              disabled={loading || !nonce || !walletAddress}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              2. Sign & Login
            </button>
          </div>

          {nonce && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Nonce:</p>
              <p className="text-sm font-mono break-all">{nonce}</p>
            </div>
          )}

          {jwt && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">JWT Token:</p>
              <p className="text-sm font-mono break-all">{jwt}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Gems */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">User Gems (NFTs)</h2>
          <p className="text-sm text-gray-500 mt-1">Get your ERC1155 gems collection</p>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={getUserGems}
            disabled={loading || !jwt}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Get My Gems
          </button>

          {gems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Your Gems ({gems.length}):</h4>
              <div className="grid gap-3">
                {gems.map((gem) => (
                  <div key={gem.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{gem.metadata.name}</h5>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">ID: {gem.id}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{gem.metadata.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Quantity: {gem.quantity}</span>
                      {gem.metadata.image && (
                        <span className="px-2 py-1 border border-gray-200 text-gray-700 rounded-full text-sm">Has Image</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gem Deck Management */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gem Deck Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">View and edit your gem deck (exactly 10 gems required)</p>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={getUserDeck}
            disabled={loading || !jwt}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Get Current Deck
          </button>

          {currentDeck.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Current Deck:</p>
              <div className="flex flex-wrap gap-1">
                {currentDeck.map((gemId, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {gemId}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 my-4"></div>

          <div className="space-y-2">
            <label htmlFor="newDeck" className="block text-sm font-medium text-gray-700">
              New Deck (10 gem IDs, comma-separated)
            </label>
            <textarea
              id="newDeck"
              value={newDeck}
              onChange={(e) => setNewDeck(e.target.value)}
              placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">Enter exactly 10 gem IDs separated by commas</p>
          </div>

          <button
            onClick={editGemDeck}
            disabled={loading || !jwt}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Update Deck
          </button>
        </div>
      </div>
    </div>
  )
}
