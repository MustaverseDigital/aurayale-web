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

/**
 * 獲取活躍交易訂單 (公開 API)
 * @param options 查詢參數，可選: page, limit, tier
 * @returns 返回活躍交易訂單列表和分頁資訊
 * @throws Error 若獲取失敗則丟出錯誤
 */
export async function getActiveTradeOrders(options?: {
  page?: number;
  limit?: number;
  tier?: number;
}) {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.tier !== undefined) params.append('tier', String(options.tier));

  const url = `${BASE_URL}/api/orders/active?${params.toString()}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || 'Failed to fetch active orders');
  return data;
}

/**
 * 獲取特定訂單 (公開 API)
 * @param orderId 訂單 ID (BigInt 字串或數字)
 * @returns 返回訂單詳情
 * @throws Error 若獲取失敗則丟出錯誤
 */
export async function getTradeOrder(orderId: string | number) {
  const url = `${BASE_URL}/api/orders/${orderId}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch order');
  }
  return data;
}

/**
 * 獲取用戶的訂單 (公開 API)
 * @param address 以太坊地址 (0x...)
 * @param options 可選查詢參數: status, page, limit
 * @returns 返回該地址訂單列表與分頁資訊
 * @throws Error 若獲取失敗則丟出錯誤
 */
export async function getUserTradeOrders(
  address: string,
  options?: {
    status?: 'active' | 'completed' | 'all';
    page?: number;
    limit?: number;
  }
) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid Ethereum address");
  }
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  const url = `${BASE_URL}/api/orders/user/${address}${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user orders');
  }
  return data;
}
