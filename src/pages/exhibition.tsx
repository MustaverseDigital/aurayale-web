import { useEffect, useState } from "react";
import Head from "next/head";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useTranslation } from "react-i18next";
import { useUnityBuildVersion, type UnityBuildVersion } from "../hooks/useUnityBuildVersion";
import { useViewportRequirements } from "../context/ViewportRequirementsContext";
import { useCanvasWidth } from "../hooks/useCanvasWidth";
import { useUnityDevicePixelRatio } from "../hooks/useUnityDevicePixelRatio";
import { getOfflineStatus, prepareExhibitionOffline } from "../lib/exhibitionOffline";

export default function ExhibitionPage() {
  const { t } = useTranslation();
  const { status, version, error } = useUnityBuildVersion("/ExhibitionBuild/version.json", true);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failure, setFailure] = useState("");
  useEffect(() => { void getOfflineStatus().then(value => setReady(value.ready)).catch(() => {}); }, []);

  useEffect(() => { if (error) console.error("[Exhibition] build selection failed", error); }, [error]);

  async function prepare() {
    if (!version) return;
    setPreparing(true); setFailure("");
    try {
      await prepareExhibitionOffline(version, (done, total) => setProgress(Math.round(done / total * 100)));
      window.location.reload();
    } catch (cause) { console.error("[Exhibition] offline preparation failed", cause); setFailure("failed"); setPreparing(false); }
  }
  return <>
    <Head><title>{t("exhibition.title")} · Aurayale</title><meta name="robots" content="noindex" /></Head>
    {playing && version ? <ExhibitionPlayer key={version.buildId} version={version} onExit={() => setPlaying(false)} /> :
      <main className="min-h-dvh flex items-center justify-center bg-[#100d1c] p-6 text-white" style={{ backgroundImage: "linear-gradient(#100d1ccc,#100d1cee),url('/img/Aurayale_Bg.jpg')", backgroundSize: "cover" }}>
        <div className="w-full max-w-lg rounded-3xl border border-amber-200/20 bg-black/55 p-8 shadow-2xl">
          <img src="/img/logo.png" alt="Aurayale" width={220} className="mb-7" />
          <p className="text-xs tracking-[.22em] text-amber-200">AURAYALE · EXHIBITION</p>
          <h1 className="my-3 text-3xl font-semibold">{t("exhibition.title")}</h1>
          <p className="leading-7 text-white/75">{t("exhibition.description")}</p>
          <p className="my-5 text-sm leading-6 text-amber-100/80">{t("exhibition.localSave")}</p>
          {status === "loading" && <p role="status">{t("exhibition.loading")}</p>}
          {status === "error" && <p role="alert" className="text-red-300">{t("exhibition.buildUnavailable")}</p>}
          {failure && <p role="alert" className="my-3 text-red-300">{t("exhibition.prepareFailed")}</p>}
          <div className="flex flex-col gap-3">
            <button disabled={status !== "ready" || preparing} onClick={() => setPlaying(true)} className="rounded-xl bg-amber-200 px-5 py-3 font-semibold text-zinc-950 disabled:opacity-40">{t("exhibition.play")}</button>
            <button disabled={status !== "ready" || preparing} onClick={() => void prepare()} className="rounded-xl border border-white/25 px-5 py-3 disabled:opacity-40">{preparing ? t("exhibition.progress", { progress }) : t(ready ? "exhibition.updateOffline" : "exhibition.prepare")}</button>
            <p role="status" className="text-sm text-white/65">{t(ready ? "exhibition.offlineReady" : "exhibition.downloadFirst")}</p>
            {status === "error" && <button onClick={() => window.location.reload()} className="underline">{t("exhibition.retry")}</button>}
          </div>
        </div>
      </main>}
  </>;
}

function ExhibitionPlayer({ version, onExit }: { version: UnityBuildVersion; onExit: () => void }) {
  const { t } = useTranslation();
  const base = `/ExhibitionBuild/${version.buildId}`;
  const { unityProvider, isLoaded, loadingProgression, sendMessage, unload, initialisationError } = useUnityContext({
    loaderUrl: `${base}/Build.loader.js`, dataUrl: `${base}/Build.data.unityweb`,
    frameworkUrl: `${base}/Build.framework.unityweb`, codeUrl: `${base}/Build.wasm.unityweb`,
    streamingAssetsUrl: `${base}/StreamingAssets`, companyName: "MustaverseDigital",
    productName: "AurayaleExhibition", productVersion: version.buildId,
  });
  const { viewportHeight } = useViewportRequirements();
  const canvasWidth = useCanvasWidth(viewportHeight);
  const dpr = useUnityDevicePixelRatio({ canvasWidth, canvasHeight: viewportHeight });
  const [menu, setMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const failed = () => setStorageError(true);
    const notify = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      if (["deckInvalid", "stageUnavailable"].includes(key)) setNotice(key);
    };
    window.addEventListener("aurayale:exhibition-storage-error", failed);
    window.addEventListener("aurayale:exhibition-notice", notify);
    return () => {
      window.removeEventListener("aurayale:exhibition-storage-error", failed);
      window.removeEventListener("aurayale:exhibition-notice", notify);
    };
  }, []);
  async function exit() { if (isLoaded) await unload(); onExit(); }
  function reset() { sendMessage("WebBridge", "ResetExhibition"); setConfirmReset(false); setMenu(false); }
  return <main className="fixed inset-0 flex justify-center bg-[#100d1c] text-white">
    {!isLoaded && <div role="status" className="absolute inset-0 flex items-center justify-center">{initialisationError ? t("exhibition.buildUnavailable") : t("exhibition.progress", { progress: Math.round(loadingProgression * 100) })}</div>}
    <Unity unityProvider={unityProvider} devicePixelRatio={dpr.effectiveDevicePixelRatio} style={{ width: canvasWidth || "100%", height: viewportHeight || "100dvh", visibility: isLoaded ? "visible" : "hidden" }} />
    <button onClick={() => setMenu(!menu)} aria-label={t("exhibition.menu")} className="absolute right-3 top-3 z-50 rounded-full border border-white/25 bg-black/75 px-4 py-2">☰</button>
    {notice && <button role="alert" onClick={() => setNotice("")} className="absolute bottom-16 z-50 mx-3 rounded-xl bg-zinc-900 p-4">{t(`exhibition.${notice}`)} ×</button>}
    {storageError && <p role="alert" className="absolute bottom-3 z-50 mx-3 rounded-xl bg-red-950 p-4">{t("exhibition.storageFailed")}</p>}
    {menu && <div className="absolute right-3 top-16 z-50 flex max-w-xs flex-col gap-3 rounded-2xl border border-white/20 bg-zinc-950 p-5 shadow-xl">
      <p className="text-sm text-amber-100">{t("exhibition.localSave")}</p>
      <button disabled={!isLoaded} onClick={() => { sendMessage("WebBridge", "ReplayExhibitionTutorial"); setMenu(false); }}>{t("exhibition.replay")}</button>
      {confirmReset ? <><p>{t("exhibition.resetConfirm")}</p><button onClick={reset} className="text-red-300">{t("exhibition.confirmReset")}</button><button onClick={() => setConfirmReset(false)}>{t("exhibition.cancel")}</button></> : <button disabled={!isLoaded} onClick={() => setConfirmReset(true)}>{t("exhibition.nextPlayer")}</button>}
      <button onClick={() => void exit()}>{t("exhibition.back")}</button>
    </div>}
  </main>;
}
