
const BASE_URL = "https://auragem.zeabur.app/api"

export interface GemItem {
    id: number
    quantity: number
    metadata: {
      name: string
      image: string
      description: string
    }
  }
  
  export async function getNonce() {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Failed to get nonce")
    return data.nonce
  }
  
  export async function signAndLogin(
    walletAddress: string,
    signature: string,
    userName?: string
  ) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        signature,
        name: userName || undefined,
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Login failed")
    return data
  }
  
  export async function getUserGems(jwt: string): Promise<GemItem[]> {
    const response = await fetch(`${BASE_URL}/user/gems`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Failed to get gems")
    return data
  }
  
  export async function getUserDeck(jwt: string): Promise<number[]> {
    const response = await fetch(`${BASE_URL}/user/gem-deck`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Failed to get gem deck")
    return data.deck
  }
  
  export async function editGemDeck(jwt: string, deckArray: number[]): Promise<number[]> {
    const response = await fetch(`${BASE_URL}/user/gem-deck`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ gems: deckArray }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Failed to update gem deck")
    return data.deck
  }