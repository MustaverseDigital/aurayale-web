/**
 * AuraServer API 類型定義
 * 根據 API 文檔定義所有請求/回應類型
 */

// ==================== 共用類型 ====================

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
  idToken: string;
  chain_id?: string; // 選填，預設為 "bsc-testnet"
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
 * Farcaster 登入請求
 * 支援兩種登入方式：
 * 1. 使用 Privy Access Token（推薦，無需簽名）
 * 2. 使用錢包簽名（向後兼容）
 */
export interface FarcasterLoginRequest {
  // 方式 1: Privy Token（推薦）
  privyAccessToken?: string;
  chain_id?: string; // 選填，預設為 "bsc-testnet"
  
  // 方式 2: 錢包簽名（向後兼容）
  walletAddress?: string;
  signature?: string;
  message?: string; // 選填，預設會自動生成
  farcasterId?: string; // 選填，Farcaster ID (fid)
}

/**
 * Farcaster 登入回應
 */
export interface FarcasterLoginResponse {
  token: string;
  userId: number;
  chainId: 'bsc-testnet' | 'soneium-testnet' | string;
  walletAddress: string;
  gems: Record<string, unknown>;
  farcasterId?: string;
  farcasterUsername?: string;
  farcasterPfpUrl?: string;
  name: string;
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
  loginType: 'google' | 'password' | 'farcaster';
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
