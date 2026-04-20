import { useCallback } from "react";
import { useUser } from "../context/UserContext";
import { simulateAdCallback, claimReward } from "../api/auraServer";
import type { ClaimedReward, StaminaInfo } from "../types/auraServer";

/**
 * 廣告流程事件狀態（React 端內部使用）
 * - viewed: 廣告看完 + simulate-callback + claim 均成功
 * - dismissed: 廣告被使用者關閉，無獎勵
 * - done: adBreak 流程結束（僅紀錄，不送 Unity）
 * - claimed: 手動觸發 claim 成功（非透過廣告流程）
 * - error: 任何步驟失敗
 * - unavailable: window.adBreak 不存在
 */
export type RewardAdStatus =
  | "viewed"
  | "dismissed"
  | "done"
  | "claimed"
  | "error"
  | "unavailable";

/**
 * 錯誤碼（配合 Unity OnRewardAdFailed 使用）
 */
export type RewardAdErrorCode =
  | "not_logged_in"
  | "ad_unavailable"
  | "dismissed"
  | "simulate_failed"
  | "claim_failed"
  | "unknown";

export interface RewardAdEventPayload {
  status: RewardAdStatus;
  code?: RewardAdErrorCode;
  transaction_id?: string;
  claimed?: ClaimedReward[];
  stamina?: StaminaInfo;
  message?: string;
  placementInfo?: Record<string, unknown>;
}

/**
 * Unity 收到的成功 payload（OnRewardAdSuccess）
 */
export interface UnityRewardAdSuccessPayload {
  transactionId: string | null;
  rewardItem: string;
  timestamp: number;
  claimed?: ClaimedReward[];
  stamina?: StaminaInfo;
}

/**
 * Unity 收到的失敗 payload（OnRewardAdFailed）
 */
export interface UnityRewardAdFailedPayload {
  reason: string;
  code: RewardAdErrorCode;
  timestamp: number;
  transactionId?: string | null;
}

type UnitySendMessage = (
  gameObjectName: string,
  methodName: string,
  parameter?: string | number
) => void;

export interface UseRewardAdOptions {
  /**
   * react-unity-webgl 的 sendMessage；提供時會把事件 JSON.stringify 後送給 Unity。
   */
  sendMessage?: UnitySendMessage;
  /** Unity 場景上的 GameObject 名稱，預設 "WebBridge" */
  unityGameObject?: string;
  /** 成功事件的 public method 名稱，預設 "OnRewardAdSuccess" */
  unitySuccessMethod?: string;
  /** 失敗事件的 public method 名稱，預設 "OnRewardAdFailed" */
  unityFailedMethod?: string;
  /** 每次事件發生時於 React 端的 callback，可用來跳 alert / 更新 UI */
  onResult?: (payload: RewardAdEventPayload) => void;
  /** simulate-callback 的 reward_item，預設 "stamina" */
  rewardItem?: string;
  /** adBreak name，預設 "reward-ad" */
  adBreakName?: string;
}

function generateTransactionId(): string {
  return `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowEpochSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function useRewardAd(options: UseRewardAdOptions = {}) {
  const { user } = useUser();
  const {
    sendMessage,
    unityGameObject = "WebBridge",
    unitySuccessMethod = "OnRewardAdSuccess",
    unityFailedMethod = "OnRewardAdFailed",
    onResult,
    rewardItem = "stamina",
    adBreakName = "reward-ad",
  } = options;

  const sendToUnity = useCallback(
    (method: string, data: unknown) => {
      if (!sendMessage) return;
      try {
        sendMessage(unityGameObject, method, JSON.stringify(data));
      } catch (err) {
        console.error("[useRewardAd] sendMessage failed", err);
      }
    },
    [sendMessage, unityGameObject]
  );

  const emit = useCallback(
    (payload: RewardAdEventPayload) => {
      const timestamp = nowEpochSeconds();

      switch (payload.status) {
        case "viewed": {
          const data: UnityRewardAdSuccessPayload = {
            transactionId: payload.transaction_id ?? null,
            rewardItem,
            timestamp,
            claimed: payload.claimed,
            stamina: payload.stamina,
          };
          sendToUnity(unitySuccessMethod, data);
          break;
        }
        case "claimed": {
          const data: UnityRewardAdSuccessPayload = {
            transactionId: payload.transaction_id ?? null,
            rewardItem,
            timestamp,
            claimed: payload.claimed,
            stamina: payload.stamina,
          };
          sendToUnity(unitySuccessMethod, data);
          break;
        }
        case "dismissed": {
          const data: UnityRewardAdFailedPayload = {
            reason: payload.message ?? "Ad dismissed by user",
            code: payload.code ?? "dismissed",
            timestamp,
            transactionId: payload.transaction_id ?? null,
          };
          sendToUnity(unityFailedMethod, data);
          break;
        }
        case "unavailable": {
          const data: UnityRewardAdFailedPayload = {
            reason: payload.message ?? "adBreak not available",
            code: payload.code ?? "ad_unavailable",
            timestamp,
          };
          sendToUnity(unityFailedMethod, data);
          break;
        }
        case "error": {
          const data: UnityRewardAdFailedPayload = {
            reason: payload.message ?? "unknown error",
            code: payload.code ?? "unknown",
            timestamp,
            transactionId: payload.transaction_id ?? null,
          };
          sendToUnity(unityFailedMethod, data);
          break;
        }
        case "done":
          // 不主動通知 Unity（與 viewed/dismissed 重複），僅做本地紀錄
          break;
      }

      if (onResult) onResult(payload);
    },
    [rewardItem, unitySuccessMethod, unityFailedMethod, sendToUnity, onResult]
  );

  const claim = useCallback(async (): Promise<RewardAdEventPayload> => {
    let payload: RewardAdEventPayload;
    if (!user) {
      payload = {
        status: "error",
        code: "not_logged_in",
        message: "Not logged in",
      };
    } else {
      try {
        const result = await claimReward(user.token);
        payload = {
          status: "claimed",
          claimed: result.claimed,
          stamina: result.stamina,
        };
      } catch (err) {
        payload = {
          status: "error",
          code: "claim_failed",
          message: err instanceof Error ? err.message : String(err),
        };
      }
    }
    emit(payload);
    return payload;
  }, [user, emit]);

  const showRewardAd = useCallback(() => {
    if (!user) {
      emit({
        status: "error",
        code: "not_logged_in",
        message: "Not logged in",
      });
      return;
    }
    const w = window as unknown as {
      adBreak?: (config: Record<string, unknown>) => void;
    };
    if (typeof w.adBreak !== "function") {
      emit({
        status: "unavailable",
        code: "ad_unavailable",
        message: "adBreak not available",
      });
      return;
    }

    const transactionId = generateTransactionId();

    w.adBreak({
      type: "reward",
      name: adBreakName,
      beforeReward: (showAdFn: () => void) => {
        showAdFn();
      },
      adViewed: async () => {
        console.log("[useRewardAd] adViewed", { transactionId });
        try {
          await simulateAdCallback({
            reward_item: rewardItem,
            user_id: user.userId,
            timestamp: nowEpochSeconds(),
            transaction_id: transactionId,
          });
        } catch (err) {
          console.error("[useRewardAd] simulate-callback failed", err);
          emit({
            status: "error",
            code: "simulate_failed",
            transaction_id: transactionId,
            message: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        try {
          const result = await claimReward(user.token);
          emit({
            status: "viewed",
            transaction_id: transactionId,
            claimed: result.claimed,
            stamina: result.stamina,
          });
        } catch (err) {
          console.error("[useRewardAd] claim failed", err);
          emit({
            status: "error",
            code: "claim_failed",
            transaction_id: transactionId,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      },
      adDismissed: () => {
        console.log("[useRewardAd] adDismissed", { transactionId });
        emit({
          status: "dismissed",
          code: "dismissed",
          transaction_id: transactionId,
        });
      },
      adBreakDone: (placementInfo: Record<string, unknown>) => {
        console.log("[useRewardAd] adBreakDone", {
          transactionId,
          placementInfo,
        });
        emit({
          status: "done",
          transaction_id: transactionId,
          placementInfo,
        });
      },
    });
  }, [user, emit, rewardItem, adBreakName]);

  return { showRewardAd, claim };
}
