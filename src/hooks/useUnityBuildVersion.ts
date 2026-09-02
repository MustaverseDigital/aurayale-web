import { useEffect, useState } from "react";

/**
 * Unity build 的版本識別。
 *
 * 為什麼要有這個：loader / data / framework / wasm 是四個獨立的快取項目。
 * 過去四個檔名固定（/Build/Build.wasm.unityweb …），瀏覽器對每個檔案各自計算
 * 過期時間，於是新版推上去後玩家可能拿到「新 loader + 舊 wasm」——
 * 版本錯配讓 wasm 實例化失敗，卡在 90% 並拋出
 * `Not implemented: Class::FromIl2CppType` / `Maximum call stack size exceeded`，
 * 非得清快取才能救。
 *
 * 現在改成每次 build 一個 /Build/<buildId>/ 目錄，四個檔案同進同出，不可能混搭。
 * version.json 是唯一一個 no-store 的檔案，用來問「現在最新是哪一版」。
 */
export type UnityBuildVersion = {
  /** 例：20260902-0951-bd10359 */
  buildId: string;
  builtAt?: string;
};

type State =
  | { status: "loading"; version: null; error: null }
  | { status: "ready"; version: UnityBuildVersion; error: null }
  | { status: "error"; version: null; error: string };

export function useUnityBuildVersion(): State {
  const [state, setState] = useState<State>({
    status: "loading",
    version: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // cache: "no-store" 是這整套機制的關鍵：這個檔案一旦被快取，
    // 玩家就會繼續被指向舊的 buildId，等於白做。
    fetch("/Build/version.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`version.json responded ${res.status}`);
        return res.json() as Promise<UnityBuildVersion>;
      })
      .then((version) => {
        if (cancelled) return;
        if (!version?.buildId) throw new Error("version.json is missing buildId");
        setState({ status: "ready", version, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          version: null,
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
