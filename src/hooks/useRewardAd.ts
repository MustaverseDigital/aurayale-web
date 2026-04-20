import { useCallback } from "react";
import { useUser } from "../context/UserContext";
import { simulateAdCallback, claimReward } from "../api/auraServer";
import type { ClaimedReward, StaminaInfo } from "../types/auraServer";

/**
 * 廣告流程事件狀態
 * - viewed: 廣告看完 + simulate-callback + claim 均成功
 * - dismissed: 廣告被使用者關閉
 * - done: adBreak 流程結束（含 placementInfo，不論結果）
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

export interface RewardAdEventPayload {
  status: RewardAdStatus;
  transaction_id?: string;
  claimed?: ClaimedReward[];
  stamina?: StaminaInfo;
  message?: string;
  placementInfo?: Record<string, unknown>;
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
  /** Unity 場景上的 GameObject 名稱，預設 "Web" */
  unityGameObject?: string;
  /** 接收事件的 public method 名稱，預設 "OnAdBreakResult" */
  unityMethod?: string;
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

export function useRewardAd(options: UseRewardAdOptions = {}) {
  const { user } = useUser();
  const {
    sendMessage,
    unityGameObject = "Web",
    unityMethod = "OnAdBreakResult",
    onResult,
    rewardItem = "stamina",
    adBreakName = "reward-ad",
  } = options;

  const emit = useCallback(
    (payload: RewardAdEventPayload) => {
      if (sendMessage) {
        try {
          sendMessage(unityGameObject, unityMethod, JSON.stringify(payload));
        } catch (err) {
          console.error("[useRewardAd] sendMessage failed", err);
        }
      }
      if (onResult) onResult(payload);
    },
    [sendMessage, unityGameObject, unityMethod, onResult]
  );

  const claim = useCallback(async (): Promise<RewardAdEventPayload> => {
    let payload: RewardAdEventPayload;
    if (!user) {
      payload = { status: "error", message: "Not logged in" };
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
          message: err instanceof Error ? err.message : String(err),
        };
      }
    }
    emit(payload);
    return payload;
  }, [user, emit]);

  const showRewardAd = useCallback(() => {
    if (!user) {
      emit({ status: "error", message: "Not logged in" });
      return;
    }
    const w = window as unknown as {
      adBreak?: (config: Record<string, unknown>) => void;
    };
    if (typeof w.adBreak !== "function") {
      emit({ status: "unavailable", message: "adBreak not available" });
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
            timestamp: Math.floor(Date.now() / 1000),
            transaction_id: transactionId,
          });
          const result = await claimReward(user.token);
          emit({
            status: "viewed",
            transaction_id: transactionId,
            claimed: result.claimed,
            stamina: result.stamina,
          });
        } catch (err) {
          console.error("[useRewardAd] simulate/claim failed", err);
          emit({
            status: "error",
            transaction_id: transactionId,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      },
      adDismissed: () => {
        console.log("[useRewardAd] adDismissed", { transactionId });
        emit({ status: "dismissed", transaction_id: transactionId });
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
