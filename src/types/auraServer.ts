/**
 * AuraServer API 類型定義
 * 根據 API 文檔定義所有請求/回應類型
 */

// ==================== 共用類型 ====================

/**
 * 支援的鏈類型
 */
export type SupportedChain = 'bsc-testnet' | 'soneium-testnet' | string;

/**
 * 寶石項目
 */
export interface GemItem {
  id: number;
  quantity: number;
  metadata: {
    name: string;
    image: string;
    description: string;
  };
}

/**
 * API 錯誤回應
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
}

// ==================== 認證相關類型 ====================

/**
 * 用戶註冊請求
 */
export interface RegisterRequest {
  username: string;
  password: string;
}

/**
 * 用戶註冊回應
 */
export interface RegisterResponse {
  userId: number;
}

/**
 * 用戶登入請求
 */
export interface LoginRequest {
  username: string;
  password: string;
  chain_id?: string; // 選填，預設為 "bsc-testnet"
}

/**
 * 用戶登入回應
 */
export interface LoginResponse {
  token: string;
  userId: number;
  chainId: string;
  walletAddress: string | null;
  gems: Record<string, unknown>;
}

/**
 * Google 登入請求
 */
export interface GoogleLoginRequest {
  privyAccessToken: string;
  chain_id?: string; // 選填，預設為 "avax-fuji"
}

/**
 * Google 登入回應
 */
export interface GoogleLoginResponse {
  token: string;
  userId: number;
  chainId: string;
  walletAddress: string | null;
  gems: Record<string, unknown>;
  email: string;
  name: string;
}

/**
 * Privy 登入請求
 */
export interface PrivyLoginRequest {
  privyAccessToken?: string;
  chain_id?: string; // 選填，預設為 "bsc-testnet"
}

/**
 * 玩家實際使用的登入手段。
 * Privy 底下可能是 Google OAuth、email 或直接連錢包。
 */
export type LoginType = 'google' | 'email' | 'wallet' | 'password';

/**
 * Privy 登入回應
 */
export interface PrivyLoginResponse {
  token: string;
  userId: number;
  chainId: 'bsc-testnet' | 'soneium-testnet' | string;
  walletAddress: string;
  gems: Record<string, unknown>;
  loginType: LoginType;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
}


// ==================== 錢包相關類型 ====================

/**
 * 請求綁定錢包請求
 */
export interface BindWalletRequestRequest {
  walletAddress: string;
}

/**
 * 請求綁定錢包回應
 */
export interface BindWalletRequestResponse {
  nonce: string;
}

/**
 * 確認綁定錢包請求
 */
export interface BindWalletConfirmRequest {
  walletAddress: string;
  signature: string;
}

/**
 * 確認綁定錢包回應
 */
export interface BindWalletConfirmResponse {
  success: boolean;
}

/**
 * 解綁錢包回應
 */
export interface UnbindWalletResponse {
  success: boolean;
}

// ==================== 用戶相關類型 ====================

/**
 * 用戶基本資料
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  walletAddress: string | null;
  hasGoogleAccount: boolean;
  loginType: LoginType;
}

/**
 * 獲取用戶基本資料回應
 */
export interface UserProfileResponse {
  success: true;
  data: UserProfile;
}

/**
 * 獲取用戶基本資料錯誤回應
 */
export interface UserProfileErrorResponse {
  success: false;
  error: string;
}

/**
 * 獲取用戶寶石回應
 */
export type UserGemsResponse = GemItem[];

/**
 * 獲取用戶寶石牌組回應
 */
export interface UserGemDeckResponse {
  deck: number[];
}

/**
 * 更新用戶寶石牌組請求
 */
export interface UpdateGemDeckRequest {
  gems: number[];
}

/**
 * 更新用戶寶石牌組回應
 */
export interface UpdateGemDeckResponse {
  deck: number[];
}

/**
 * 用戶資訊（基於 API 登入回應構建）
 */
export interface UserInfo {
  token: string;
  userId: number;
  chainId?: SupportedChain | string; // 當前登入的鏈 ID
  name?: string;
  walletAddress?: string;
  deck?: number[];
  gems?: GemItem[];
  loginType?: LoginType; // 登入類型
  email?: string | null; // 來自 Privy 的 email（Google / email 登入）
  avatarUrl?: string | null; // 來自 Privy 的頭像
}

// ==================== 交易訂單相關類型 ====================

/**
 * 訂單狀態
 */
export type OrderStatus = 'ACTIVE' | 'FINALIZED' | 'CANCELED';

/**
 * 交易訂單
 */
export interface TradeOrder {
  orderId: string;
  owner: string;
  accepter: string | null;
  offeredTokenId: number;
  acceptedTokenId: number | null;
  wantedTokenIds: number[];
  status: OrderStatus;
  nonce: string;
  createdAt: string;
  acceptedAt: string | null;
  finalizedAt: string | null;
  finalOfferedTokenId: number | null;
  finalAcceptedTokenId: number | null;
  offeredUpgraded: boolean | null;
  acceptedUpgraded: boolean | null;
  txHash: string | null;
}

/**
 * 獲取活躍交易訂單查詢參數
 */
export interface ActiveOrdersQueryParams {
  page?: number;
  limit?: number;
  tier?: number;
  chain_id?: 'bsc-testnet' | 'soneium-testnet' | string; // 選填，指定鏈 ID
}

/**
 * 獲取活躍交易訂單回應
 */
export interface ActiveOrdersResponse {
  orders: TradeOrder[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * 獲取特定訂單回應
 */
export type OrderDetailResponse = TradeOrder;

/**
 * 獲取用戶訂單查詢參數
 */
export interface UserOrdersQueryParams {
  status?: 'active' | 'completed' | 'all';
  page?: number;
  limit?: number;
  chain_id?: string; // 選填，指定鏈 ID
}

/**
 * 獲取用戶訂單回應
 */
export interface UserOrdersResponse {
  orders: TradeOrder[];
  total: number;
  page: number;
  totalPages: number;
}

// ==================== 統計相關類型 ====================

/**
 * 獲取交易統計回應
 */
export interface StatsResponse {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalTradesCompleted: number;
  totalUpgrades: number;
  upgradeRate: number;
}

// ==================== 健康檢查相關類型 ====================

/**
 * 進程類型
 */
export type ProcessType = 'api-server' | 'event-listener';

/**
 * 事件監聽器狀態
 */
export type EventListenerStatus = 'running' | 'stopped' | 'unknown';

/**
 * 系統狀態
 */
export type SystemStatus = 'healthy' | 'unhealthy';

/**
 * 健康檢查回應
 */
export interface HealthCheckResponse {
  status: SystemStatus;
  eventListener: EventListenerStatus;
  dbConnected: boolean;
  rpcConnected: boolean;
  pendingTxs: number;
  failedTxs24h: number;
  lastBlockProcessed: number;
  serverWalletBalance: string;
  tradeServicesEnabled: boolean;
  processType: ProcessType;
  timestamp: string;
  error?: string;
}

// ==================== 廣告 / 獎勵相關類型 ====================

/**
 * 模擬廣告 SSV 回調請求
 */
export interface SimulateAdCallbackRequest {
  reward_item: string;
  user_id: number;
  timestamp: number;
  transaction_id: string;
}

/**
 * 模擬廣告 SSV 回調回應
 */
export interface SimulateAdCallbackResponse {
  ok: true;
  user_id: number;
  reward_item: string;
  timestamp: string;
  transaction_id: string;
}

/**
 * 已領取獎勵項目
 */
export interface ClaimedReward {
  source: string;
  rewardType: string;
  rewardValue: {
    amount: number;
    [key: string]: unknown;
  };
}

/**
 * 體力資訊
 */
export interface StaminaInfo {
  current: number;
  max: number;
}

/**
 * 領取獎勵回應
 */
export interface ClaimRewardResponse {
  claimed: ClaimedReward[];
  stamina: StaminaInfo;
}
