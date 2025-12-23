"use client";

import { useState } from "react";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useSwitchChain } from "wagmi";
import { Loader2, CheckCircle, AlertCircle, Search, Plus, Handshake, X, Network } from "lucide-react";
import {
  useTradeOrder,
  useCreateTradeOrder,
  useAcceptTradeOrder,
  useCancelTradeOrder,
} from "../../hooks/useTradeOrder";

export default function TestTradeOrderPage() {
  const { connectWallet } = usePrivy();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // BSC Testnet 配置
  const BSC_TESTNET_CHAIN_ID = 97;

  // 讀取訂單狀態
  const [readOrderId, setReadOrderId] = useState<string>("");
  const [readOrderIdValue, setReadOrderIdValue] = useState<bigint | undefined>(undefined);

  // 建立訂單狀態
  const [offeredTokenId, setOfferedTokenId] = useState<string>("");
  const [wantedTokenIds, setWantedTokenIds] = useState<string>("");

  // 接受訂單狀態
  const [acceptOrderId, setAcceptOrderId] = useState<string>("");
  const [acceptSelectedTokenId, setAcceptSelectedTokenId] = useState<string>("");

  // 取消訂單狀態
  const [cancelOrderId, setCancelOrderId] = useState<string>("");

  // Hooks
  const {
    data: orderData,
    isLoading: isReadingOrder,
    error: readError,
    refetch: refetchOrder,
  } = useTradeOrder(readOrderIdValue);

  const {
    createTradeOrder,
    hash: createHash,
    isPending: isCreatingPending,
    isConfirming: isCreatingConfirming,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useCreateTradeOrder();

  const {
    acceptTradeOrder,
    hash: acceptHash,
    isPending: isAcceptPending,
    isConfirming: isAcceptConfirming,
    isSuccess: isAcceptSuccess,
    error: acceptError,
  } = useAcceptTradeOrder();

  const {
    cancelTradeOrder,
    hash: cancelHash,
    isPending: isCancelPending,
    isConfirming: isCancelConfirming,
    isSuccess: isCancelSuccess,
    error: cancelError,
  } = useCancelTradeOrder();

  // 處理讀取訂單
  const handleReadOrder = () => {
    try {
      const orderId = BigInt(readOrderId);
      setReadOrderIdValue(orderId);
      refetchOrder();
    } catch (error) {
      alert("請輸入有效的訂單 ID");
    }
  };

  // 處理建立訂單
  const handleCreateOrder = () => {
    try {
      const offered = BigInt(offeredTokenId);
      const wanted = wantedTokenIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "")
        .map((id) => BigInt(id));
      createTradeOrder(offered, wanted);
    } catch (error) {
      alert("請輸入有效的 Token ID");
    }
  };

  // 處理接受訂單
  const handleAcceptOrder = () => {
    try {
      const orderId = BigInt(acceptOrderId);
      const selectedTokenId = BigInt(acceptSelectedTokenId);
      acceptTradeOrder(orderId, selectedTokenId);
    } catch (error) {
      alert("請輸入有效的訂單 ID 和 Token ID");
    }
  };

  // 處理取消訂單
  const handleCancelOrder = () => {
    try {
      const orderId = BigInt(cancelOrderId);
      cancelTradeOrder(orderId);
    } catch (error) {
      alert("請輸入有效的訂單 ID");
    }
  };

  // 格式化地址
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "N/A";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 格式化訂單資料
  const formatOrderData = (data: any) => {
    if (!data) return null;
    try {
      const [owner, offeredTokenId, wantedTokenIds, nonce, isActive, isCompleted, accepter, acceptedTokenId] = data;
      return {
        owner: owner as string,
        offeredTokenId: offeredTokenId?.toString() || "N/A",
        wantedTokenIds: Array.isArray(wantedTokenIds)
          ? wantedTokenIds.map((id: bigint) => id.toString()).join(", ")
          : "N/A",
        nonce: nonce?.toString() || "N/A",
        isActive: isActive ? "是" : "否",
        isCompleted: isCompleted ? "是" : "否",
        accepter: accepter as string,
        acceptedTokenId: acceptedTokenId?.toString() || "N/A",
      };
    } catch (error) {
      return null;
    }
  };

  const formattedOrderData = formatOrderData(orderData);

  // 切換到 BSC Testnet
  const handleSwitchToBSCTestnet = () => {
    if (switchChain) {
      switchChain({ chainId: BSC_TESTNET_CHAIN_ID });
    }
  };

  // 獲取鏈名稱
  const getChainName = (id: number | undefined) => {
    if (!id) return "未知";
    switch (id) {
      case 1:
        return "Ethereum Mainnet";
      case 11155111:
        return "Sepolia";
      case 137:
        return "Polygon";
      case 97:
        return "BSC Testnet";
      default:
        return `Chain ${id}`;
    }
  };

  const isBSCTestnet = chainId === BSC_TESTNET_CHAIN_ID;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">交易訂單測試頁面</h1>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <button
                onClick={connectWallet}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
                {isConnected ? "Wallet Connected" : "Connect Wallet"}
            </button>
            {isConnected && (
              <div className="text-sm text-gray-400 flex items-center gap-4">
                <div>
                  <span>地址: {formatAddress(address)}</span>
                  {chainId && (
                    <span className="ml-4">
                      鏈: <span className="font-semibold text-white">{getChainName(chainId)}</span> (ID: {chainId})
                    </span>
                  )}
                </div>
                {chainId !== BSC_TESTNET_CHAIN_ID && (
                  <button
                    onClick={handleSwitchToBSCTestnet}
                    disabled={isSwitchingChain}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                  >
                    {isSwitchingChain ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        切換中...
                      </>
                    ) : (
                      <>
                        <Network className="w-4 h-4" />
                        切換到 BSC Testnet
                      </>
                    )}
                  </button>
                )}
                {isBSCTestnet && (
                  <div className="px-3 py-1 bg-green-900/30 border border-green-600 rounded-lg text-green-200 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    已連接到 BSC Testnet
                  </div>
                )}
              </div>
            )}
          </div>
          {!isConnected && (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-yellow-200">
              <AlertCircle className="inline w-5 h-5 mr-2" />
              請先連接錢包以使用測試功能
            </div>
          )}
        </div>

        {/* 讀取交易訂單 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            讀取交易訂單
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">訂單 ID</label>
              <input
                type="text"
                value={readOrderId}
                onChange={(e) => setReadOrderId(e.target.value)}
                placeholder="輸入訂單 ID (例如: 1)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={handleReadOrder}
              disabled={!isConnected || !readOrderId || isReadingOrder}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isReadingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
              讀取訂單
            </button>

            {isReadingOrder && (
              <div className="text-blue-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                載入中...
              </div>
            )}

            {readError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">錯誤</div>
                  <div className="text-sm mt-1">{readError.message || String(readError)}</div>
                </div>
              </div>
            )}

            {formattedOrderData && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <div className="font-semibold mb-2 text-green-200 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  訂單資料
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">擁有者:</span>{" "}
                    <span className="font-mono">{formatAddress(formattedOrderData.owner)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">提供的 Token ID:</span>{" "}
                    <span className="font-mono">{formattedOrderData.offeredTokenId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">想要的 Token IDs:</span>{" "}
                    <span className="font-mono">{formattedOrderData.wantedTokenIds}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Nonce:</span>{" "}
                    <span className="font-mono">{formattedOrderData.nonce}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">是否啟用:</span> {formattedOrderData.isActive}
                  </div>
                  <div>
                    <span className="text-gray-400">是否完成:</span> {formattedOrderData.isCompleted}
                  </div>
                  <div>
                    <span className="text-gray-400">接受者:</span>{" "}
                    <span className="font-mono">{formatAddress(formattedOrderData.accepter)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">接受的 Token ID:</span>{" "}
                    <span className="font-mono">{formattedOrderData.acceptedTokenId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 建立交易訂單 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            建立交易訂單
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">提供的 Token ID</label>
              <input
                type="text"
                value={offeredTokenId}
                onChange={(e) => setOfferedTokenId(e.target.value)}
                placeholder="輸入提供的 Token ID (例如: 1)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">想要的 Token IDs (逗號分隔)</label>
              <input
                type="text"
                value={wantedTokenIds}
                onChange={(e) => setWantedTokenIds(e.target.value)}
                placeholder="輸入想要的 Token IDs (例如: 2, 3, 4)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={!isConnected || !offeredTokenId || !wantedTokenIds || isCreatingPending || isCreatingConfirming}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {(isCreatingPending || isCreatingConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCreatingPending ? "等待確認..." : isCreatingConfirming ? "確認中..." : "建立訂單"}
            </button>

            {createError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">錯誤</div>
                  <div className="text-sm mt-1">{createError.message || String(createError)}</div>
                </div>
              </div>
            )}

            {createHash && (
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 text-blue-200">
                <div className="font-semibold mb-1">交易 Hash</div>
                <div className="text-sm font-mono break-all">{createHash}</div>
              </div>
            )}

            {isCreateSuccess && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-green-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                訂單建立成功！
              </div>
            )}
          </div>
        </div>

        {/* 接受交易訂單 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            接受交易訂單
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">訂單 ID</label>
              <input
                type="text"
                value={acceptOrderId}
                onChange={(e) => setAcceptOrderId(e.target.value)}
                placeholder="輸入訂單 ID (例如: 1)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">選擇的 Token ID</label>
              <input
                type="text"
                value={acceptSelectedTokenId}
                onChange={(e) => setAcceptSelectedTokenId(e.target.value)}
                placeholder="輸入選擇的 Token ID (例如: 2)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={handleAcceptOrder}
              disabled={!isConnected || !acceptOrderId || !acceptSelectedTokenId || isAcceptPending || isAcceptConfirming}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {(isAcceptPending || isAcceptConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAcceptPending ? "等待確認..." : isAcceptConfirming ? "確認中..." : "接受訂單"}
            </button>

            {acceptError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">錯誤</div>
                  <div className="text-sm mt-1">{acceptError.message || String(acceptError)}</div>
                </div>
              </div>
            )}

            {acceptHash && (
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 text-blue-200">
                <div className="font-semibold mb-1">交易 Hash</div>
                <div className="text-sm font-mono break-all">{acceptHash}</div>
              </div>
            )}

            {isAcceptSuccess && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-green-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                訂單接受成功！
              </div>
            )}
          </div>
        </div>

        {/* 取消交易訂單 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <X className="w-5 h-5" />
            取消交易訂單
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">訂單 ID</label>
              <input
                type="text"
                value={cancelOrderId}
                onChange={(e) => setCancelOrderId(e.target.value)}
                placeholder="輸入訂單 ID (例如: 1)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={handleCancelOrder}
              disabled={!isConnected || !cancelOrderId || isCancelPending || isCancelConfirming}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {(isCancelPending || isCancelConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCancelPending ? "等待確認..." : isCancelConfirming ? "確認中..." : "取消訂單"}
            </button>

            {cancelError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">錯誤</div>
                  <div className="text-sm mt-1">{cancelError.message || String(cancelError)}</div>
                </div>
              </div>
            )}

            {cancelHash && (
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 text-blue-200">
                <div className="font-semibold mb-1">交易 Hash</div>
                <div className="text-sm font-mono break-all">{cancelHash}</div>
              </div>
            )}

            {isCancelSuccess && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-green-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                訂單取消成功！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

