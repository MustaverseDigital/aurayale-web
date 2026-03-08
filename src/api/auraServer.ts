import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  FarcasterLoginRequest,
  FarcasterLoginResponse,
  BindWalletRequestRequest,
  BindWalletRequestResponse,
  BindWalletConfirmRequest,
  BindWalletConfirmResponse,
  UnbindWalletResponse,
  UserGemsResponse,
  UserGemDeckResponse,
  UpdateGemDeckRequest,
  UpdateGemDeckResponse,
  ActiveOrdersQueryParams,
  ActiveOrdersResponse,
  OrderDetailResponse,
  UserOrdersQueryParams,
  UserOrdersResponse,
  GemItem,
} from '../types/auraServer';

// 重新導出 GemItem 以保持向後兼容
export type { GemItem } from '../types/auraServer';

const BASE_URL = 'https://aura-server.zeabur.app/api';

export async function loginWithPassword(
  username: string,
  password: string,
  chain_id?: string
): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, chain_id } as LoginRequest),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function registerWithPassword(
  username: string,
  password: string
): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password } as RegisterRequest),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Register failed');
  return data;
}

export async function requestBindWallet(
  jwt: string,
  walletAddress: string
): Promise<BindWalletRequestResponse> {
  const response = await fetch(`${BASE_URL}/bind-wallet/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ walletAddress } as BindWalletRequestRequest),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request bind wallet failed');
  return data;
}

export async function confirmBindWallet(
  jwt: string,
  walletAddress: string,
  signature: string
): Promise<BindWalletConfirmResponse> {
  const response = await fetch(`${BASE_URL}/bind-wallet/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      walletAddress,
      signature,
    } as BindWalletConfirmRequest),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Confirm bind wallet failed');
  return data;
}

export async function unbindWallet(jwt: string): Promise<UnbindWalletResponse> {
  const response = await fetch(`${BASE_URL}/unbind-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unbind wallet failed');
  return data;
}

export async function getUserGems(jwt: string): Promise<UserGemsResponse> {
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
  return (data as UserGemDeckResponse).deck;
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
    body: JSON.stringify({ gems: deckArray } as UpdateGemDeckRequest),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update gem deck');
  return (data as UpdateGemDeckResponse).deck;
}

export async function loginWithGoogle(
  idToken: string,
  chain_id?: string
): Promise<GoogleLoginResponse> {
  const requestBody: GoogleLoginRequest = {
    idToken,
    // Default Google (Privy) logins to Avalanche Fuji testnet
    chain_id: chain_id || 'avax-fuji-testnet',
  };

  const response = await fetch(`${BASE_URL}/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Google login failed');
  return data;
}

/**
 * 使用 Privy Access Token 進行 Farcaster 登入（推薦方式）
 * @param privyAccessToken Privy Access Token
 * @param chain_id 鏈 ID，選填，預設為 "soneium-testnet"
 * @returns Farcaster 登入回應
 */
export async function loginWithFarcasterByPrivy(
  privyAccessToken: string,
  chain_id?: string
): Promise<FarcasterLoginResponse> {
  const requestBody: FarcasterLoginRequest = {
    privyAccessToken,
    chain_id: chain_id || 'soneium-testnet', // 預設為 soneium-testnet
  };

  const response = await fetch(`${BASE_URL}/farcaster-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Farcaster login failed');
  return data;
}

/**
 * 使用錢包簽名進行 Farcaster 登入（向後兼容）
 * @param walletAddress 錢包地址
 * @param signature 簽名
 * @param options 可選參數
 * @returns Farcaster 登入回應
 */
export async function loginWithFarcaster(
  walletAddress: string,
  signature: string,
  options?: {
    message?: string;
    farcasterId?: string;
    chain_id?: string;
  }
): Promise<FarcasterLoginResponse> {
  const requestBody: FarcasterLoginRequest = {
    walletAddress,
    signature,
    message: options?.message,
    farcasterId: options?.farcasterId,
    chain_id: options?.chain_id || 'soneium-testnet', // 預設為 soneium-testnet
  };

  const response = await fetch(`${BASE_URL}/farcaster-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Farcaster login failed');
  return data;
}

/**
 * 獲取活躍交易訂單 (公開 API)
 * @param options 查詢參數，可選: page, limit, tier
 * @returns 返回活躍交易訂單列表和分頁資訊
 * @throws Error 若獲取失敗則丟出錯誤
 */
export async function getActiveTradeOrders(
  options?: ActiveOrdersQueryParams
): Promise<ActiveOrdersResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.tier !== undefined) params.append('tier', String(options.tier));
  if (options?.chain_id) params.append('chain_id', options.chain_id);

  const url = `${BASE_URL}/orders/active?${params.toString()}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || 'Failed to fetch active orders');
    } catch {
      throw new Error(
        `Failed to fetch active orders: ${response.status} ${response.statusText}`
      );
    }
  }
  const data = await response.json();
  return data;
}

/**
 * 獲取特定訂單 (公開 API)
 * @param orderId 訂單 ID (BigInt 字串或數字)
 * @returns 返回訂單詳情
 * @throws Error 若獲取失敗則丟出錯誤
 */
export async function getTradeOrder(
  orderId: string | number
): Promise<OrderDetailResponse> {
  const url = `${BASE_URL}/orders/${orderId}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || 'Failed to fetch order');
    } catch {
      throw new Error(
        `Failed to fetch order: ${response.status} ${response.statusText}`
      );
    }
  }
  const data = await response.json();
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
  options?: UserOrdersQueryParams
): Promise<UserOrdersResponse> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address');
  }
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.chain_id) params.append('chain_id', options.chain_id);
  const url = `${BASE_URL}/orders/user/${address}${
    params.toString() ? '?' + params.toString() : ''
  }`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || 'Failed to fetch user orders');
    } catch {
      throw new Error(
        `Failed to fetch user orders: ${response.status} ${response.statusText}`
      );
    }
  }
  const data = await response.json();
  return data;
}
