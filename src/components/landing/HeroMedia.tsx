import { useEffect, useRef, useState } from "react";
import { createTunnelRenderer, TUNNEL, type TunnelRenderer } from "./tunnel";

/**
 * Hero 的影片主視覺：極座標隧道（見 tunnel.ts）。
 *
 * 疊起來的層序：
 * 1. <video>：解碼來源。不顯示，但必須留在 DOM 裡 —— 脫離文件的 video
 *    會被瀏覽器暫停，貼圖就永遠停在第一格。
 * 2. WebGL canvas：整個效果，一次全螢幕 pass。
 * 3. 由下往上的壓暗漸層，讓文字壓在畫面下緣仍可讀。
 *
 * 沒有 WebGL 時退回 poster 圖（連影片都不放，因為未經處理的原始影片
 * 跟這個版面的調性差太遠，寧可給一張已經調過色的靜態圖）。
 */

/** 裝置像素比上限。隧道是單一 pass，但 4K 螢幕上全開仍然沒必要 */
const MAX_DPR = 2;

export function HeroMedia({ src, poster }: { src: string; poster: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !video || !canvas) return;

    const build = (): TunnelRenderer | null => {
      try {
        return createTunnelRenderer(canvas);
      } catch {
        return null;
      }
    };

    let renderer = build();
    if (!renderer) {
      setFailed(true);
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frameId = 0;
    let videoFrameId = 0;
    let inView = true;
    let last = 0;
    let simTime = 0;
    let pendingUpload = true;
    // 滑鼠視差：目標值由 pointermove 寫入，實際值每幀追過去，才不會跟著游標抽動
    let targetX = 0;
    let targetY = 0;
    let mx = 0;
    let my = 0;

    const ready = () => video.readyState >= 2 && video.videoWidth > 0;

    /**
     * 貼圖上傳比 shader 本身貴（1080p 約 8MB／次）。影片通常是 24～30fps，
     * 沒必要每個 rAF 都傳一次，用 requestVideoFrameCallback 只在真的有新影格時上傳。
     */
    type WithRVFC = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (id: number) => void;
    };
    const rvfcVideo = video as WithRVFC;
    const hasRvfc = typeof rvfcVideo.requestVideoFrameCallback === "function";

    const queueVideoFrame = () => {
      if (!hasRvfc) return;
      videoFrameId = rvfcVideo.requestVideoFrameCallback!(() => {
        pendingUpload = true;
        queueVideoFrame();
      });
    };
    queueVideoFrame();

    const draw = (timeSec: number) => {
      if (!renderer || !ready()) return false;
      if (pendingUpload || !hasRvfc) {
        renderer.upload(video);
        pendingUpload = false;
      }
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return false;
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      renderer.render(
        Math.max(1, Math.round(width * dpr)),
        Math.max(1, Math.round(height * dpr)),
        timeSec,
        mx * TUNNEL.PARALLAX,
        -my * TUNNEL.PARALLAX
      );
      return true;
    };

    // 關閉動態時只畫一張靜態的，不跑迴圈
    if (reduceMotion) {
      let cancelled = false;
      let timer = 0;
      const once = () => {
        if (cancelled) return;
        if (!draw(0)) timer = window.setTimeout(once, 200);
      };
      once();
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
        if (hasRvfc && videoFrameId) rvfcVideo.cancelVideoFrameCallback?.(videoFrameId);
        renderer?.dispose();
      };
    }

    const onPointerMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width - 0.5;
      targetY = (e.clientY - r.top) / r.height - 0.5;
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      // 捲出畫面或切到別的分頁就不畫，別在背景燒電
      if (!inView || document.hidden) {
        last = now;
        return;
      }
      const cap = 1000 / TUNNEL.FPS_CAP;
      if (now - last < cap) return;
      const dt = Math.min(100, now - last);
      last = now;

      // 速度呼吸：模擬時間自己累積，直接把 now 乘上係數會造成跳動
      const breathe = 1 + TUNNEL.PULSE * Math.sin((now / 1000) * ((Math.PI * 2) / TUNNEL.PULSE_S));
      simTime += (dt / 1000) * breathe;

      mx += (targetX - mx) * 0.08;
      my += (targetY - my) * 0.08;

      draw(simTime);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(wrap);
    last = performance.now();
    frameId = requestAnimationFrame(tick);

    // GPU 重置或瀏覽器回收 context 時會掉。preventDefault 之後瀏覽器會嘗試還原，
    // 所以先停下來、還原時重建就好，不要直接退回 poster 再也回不來。
    const onLost = (e: Event) => {
      e.preventDefault();
      renderer?.dispose();
      renderer = null;
    };
    const onRestored = () => {
      renderer = build();
      pendingUpload = true;
      if (!renderer) setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(frameId);
      if (hasRvfc && videoFrameId) rvfcVideo.cancelVideoFrameCallback?.(videoFrameId);
      observer.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="mv-media mv-tunnel absolute inset-0 z-0"
      style={{ ["--mv-scrim-o" as string]: String(TUNNEL.SCRIM) }}
    >
      {/* 解碼來源。不顯示，但必須留在 DOM，否則瀏覽器會把它暫停。 */}
      <video
        ref={videoRef}
        className="mv-tunnel__source"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>

      {failed ? (
        // 沒有 WebGL：給一張已經調過色的靜態圖，不放未處理的原始影片
        <img className="mv-hero-media mv-tunnel__fallback" src={poster} alt="" aria-hidden="true" />
      ) : (
        <canvas ref={canvasRef} className="mv-hero-media mv-tunnel__canvas" aria-hidden="true" />
      )}

      {/* 由下往上壓暗，讓文字壓在畫面下緣仍可讀（漸層定義在 .mv-hero-scrim） */}
      <div className="mv-hero-scrim absolute inset-0 z-[4]" />
    </div>
  );
}
