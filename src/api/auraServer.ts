const BASE_URL = 'https://aura-server.zeabur.app/api';

export interface GemItem {
  id: number;
  quantity: number;
  metadata: {
    name: string;
    image: string;
    description: string;
  };
}

export async function loginWithPassword(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function registerWithPassword(username: string, password: string) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Register failed');
  return data;
}

export async function requestBindWallet(jwt: string, walletAddress: string) {
  const response = await fetch(`${BASE_URL}/bind-wallet/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ walletAddress }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request bind wallet failed');
  return data; // { nonce }
}

export async function confirmBindWallet(
  jwt: string,
  walletAddress: string,
  signature: string
) {
  const response = await fetch(`${BASE_URL}/bind-wallet/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ walletAddress, signature }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Confirm bind wallet failed');
  return data;
}

export async function unbindWallet(jwt: string, walletAddress: string) {
  const response = await fetch(`${BASE_URL}/unbind-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ walletAddress }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unbind wallet failed');
  return data;
}

export async function getUserGems(jwt: string): Promise<GemItem[]> {
  const response = await fetch(`${BASE_URL}/user/gems`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to get gems');
  return data;
}

export async function getUserDeck(jwt: string): Promise<number[]> {
  const response = await fetch(`${BASE_URL}/user/gem-deck`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to get gem deck');
  return data.deck;
}

export async function editGemDeck(
  jwt: string,
  deckArray: number[]
): Promise<number[]> {
  const response = await fetch(`${BASE_URL}/user/gem-deck`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ gems: deckArray }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update gem deck');
  return data.deck;
}

export async function loginWithGoogle(idToken: string) {
  const response = await fetch(`${BASE_URL}/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Google login failed');
  return data;
}
