import { useEffect, useRef, useCallback } from "react";

interface WireframeMeshProps {
  className?: string;
  color?: [number, number, number]; // RGB
  opacity?: number;
}

/**
 * 數位神經突觸網路(Neural Synapse Network) — 高端版。
 *
 * 構圖 & 動態:
 *  - 節點以「Curl-Noise 風格的流場(flow field)」緩慢漂流,呈現有機的渦流感,非隨機抖動。
 *  - 節點尺寸採 power-law 分布:大多數很小,少數中等,極少為樞紐(視覺層次)。
 *  - 距離夠近的節點之間以雙層連線(shortRange 清晰 + longRange 微弱)織成一張大網。
 *  - 隨機節點放電時,只挑 1~2 條「activeNeighbors」加亮,避免單點放射過多。
 *  - 脈衝(白點)使用 ease-in-out 在連線上滑動,並用 canvas shadowBlur 帶出柔和光暈。
 *
 * 高級感渲染:
 *  - 每幀先疊一層暖紫光的徑向背景漸層,再畫節點,最後疊一層 vignette 暈邊。
 *  - 全域不透明度以慢速 sin 呼吸,讓整張網「活著」呼吸,而不是死板等亮。
 *
 * Props 與舊版相容(className / color / opacity),呼叫端不需修改。
 */

interface NeuralNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  /** 0..1,放電時拉高,每幀緩慢衰減 */
  energy: number;
  /** ~6% 是樞紐節點,稍大稍亮 */
  isHub: boolean;
  /** Power-law 抽樣的尺寸抖動(0.5..2.0) */
  sizeJitter: number;
  /**
   * 放電時被點亮的「鄰居索引」清單(1–2 條)。
   * 只有這些連線會被 energyBoost 加亮,避免一個節點點亮時所有連線都跟著亮。
   * 能量耗盡後清空。
   */
  activeNeighbors: number[];
  /**
   * 節點所屬的「飄移群組」(0 / 1 / 2)。
   * 三個群組各有自己的基礎漂移方向,讓畫面看起來像是三股不同方向的氣流。
   */
  group: 0 | 1 | 2;
}

interface NeuralPulse {
  fromIdx: number;
  toIdx: number;
  /** 0..1,沿連線從 from → to 的進度 */
  progress: number;
  speed: number;
}

export function WireframeMesh({
  className = "",
  color = [139, 92, 246], // purple-500
  opacity = 0.6,
}: WireframeMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NeuralNode[]>([]);
  const pulsesRef = useRef<NeuralPulse[]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 處理 DPR 確保畫面銳利
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // 第一次或視窗 resize 後重新生成節點
    if (nodesRef.current.length === 0) {
      // 小點密度加倍(每節點佔約 1750 px²)
      const density = 1750;
      const nodeCount = Math.max(280, Math.min(1280, Math.floor((W * H) / density)));
      const nodes: NeuralNode[] = [];
      for (let i = 0; i < nodeCount; i++) {
        // Power-law:大多數節點偏小,少數較大(視覺層次)
        const r = Math.random();
        const sizeJitter = 0.55 + Math.pow(r, 2.4) * 1.5;
        // 均勻分配到 3 個群組
        const group = (i % 3) as 0 | 1 | 2;
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          phase: Math.random() * Math.PI * 2,
          energy: Math.random() * 0.12,
          isHub: Math.random() < 0.03,
          sizeJitter,
          activeNeighbors: [],
          group,
        });
      }
      nodesRef.current = nodes;
      pulsesRef.current = [];
    }

    // 只連近距離鄰居,避免畫面被密集的長線弄亂
    const shortRange = Math.min(200, Math.max(80, Math.sqrt(W * H) / 10));
    const shortRangeSq = shortRange * shortRange;

    // Flow field 常數(現在只作為「擾動」用,主漂移方向由 GROUP_DRIFTS 控制)
    const FLOW_SCALE = 0.0028;
    const FLOW_TIME = 0.14;
    const FLOW_PERTURB = 0.025; // 擾動振幅:讓三股氣流仍帶有有機波動感

    /**
     * 三個群組的基礎漂移向量。約 120° 分佈,構成三股交錯的氣流:
     *  - Group 0:向上                 (大致 270° / 0,-1)
     *  - Group 1:向右下                (約 30°    / +0.87,+0.50)
     *  - Group 2:向左下                (約 150°   / -0.87,+0.50)
     * 數值控制在 0.04~0.05 區間,讓漂移夠明顯但不會過快。
     */
    const GROUP_DRIFTS: { vx: number; vy: number }[] = [
      { vx:  0.000, vy: -0.045 },
      { vx:  0.040, vy:  0.022 },
      { vx: -0.040, vy:  0.022 },
    ];

    // 邊界外溢的緩衝(用於 wrap-around)
    const WRAP_PADDING = 40;

    let time = 0;

    /**
     * 計算節點位置的「邊緣淡出」係數。
     * 四邊都漸層淡出,讓 wrap-around 看不出接縫(particles fade in/out at edges)。
     */
    const edgeFadeAt = (x: number, y: number): number => {
      // 底部依然採用較大範圍的淡出,讓神經網與下方內容自然融合
      const yProgress = y / H;
      const fadeStart = 0.7;
      const bottomFade = yProgress > fadeStart
        ? 1 - Math.pow((yProgress - fadeStart) / (1 - fadeStart), 1.4)
        : 1;
      // 頂部稍微淡出
      const topMargin = 50;
      const topFade = y < topMargin ? y / topMargin : 1;
      // 左右兩側中等寬度淡出,讓 wrap 進來的節點漸顯
      const sideMargin = 60;
      const leftFade = x < sideMargin ? x / sideMargin : 1;
      const rightFade = W - x < sideMargin ? (W - x) / sideMargin : 1;
      const sideFade = Math.min(leftFade, rightFade);
      return Math.max(0, Math.min(1, bottomFade))
        * Math.max(0, Math.min(1, topFade))
        * Math.max(0, Math.min(1, sideFade));
    };

    /** 從某節點向最近的鄰居發射 1 個脈衝(若有合法鄰居) */
    const fireFrom = (sourceIdx: number, excludeIdx: number = -1): boolean => {
      const nodes = nodesRef.current;
      const source = nodes[sourceIdx];
      const neighbors: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === sourceIdx || i === excludeIdx) continue;
        const dx = nodes[i].x - source.x;
        const dy = nodes[i].y - source.y;
        // 脈衝以短距離鄰居為主,看起來才像神經元放電
        if (dx * dx + dy * dy < shortRangeSq) neighbors.push(i);
      }
      if (neighbors.length === 0) return false;
      const targetIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      pulsesRef.current.push({
        fromIdx: sourceIdx,
        toIdx: targetIdx,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
      });
      return true;
    };

    /**
     * 為剛剛放電的節點挑出 1–2 個鄰近的鄰居,僅將這些連線標記為「被點亮」。
     */
    const setActiveLines = (sourceIdx: number) => {
      const nodes = nodesRef.current;
      const source = nodes[sourceIdx];
      const candidates: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === sourceIdx) continue;
        const dx = nodes[i].x - source.x;
        const dy = nodes[i].y - source.y;
        if (dx * dx + dy * dy < shortRangeSq) candidates.push(i);
      }
      const lineCount = Math.min(candidates.length, 1 + Math.floor(Math.random() * 2)); // 1..2
      const picked: number[] = [];
      for (let k = 0; k < lineCount; k++) {
        const pickIdx = Math.floor(Math.random() * candidates.length);
        picked.push(candidates[pickIdx]);
        candidates.splice(pickIdx, 1);
      }
      source.activeNeighbors = picked;
    };

    const animate = () => {
      time += 0.008;
      ctx.clearRect(0, 0, W, H);

      // ── 高級感渲染 1:背景徑向漸層 ──
      // 暖紫光集中在畫面上半部,讓焦點落在 Banner 主要視覺區
      const bgGrad = ctx.createRadialGradient(
        W * 0.5,
        H * 0.4,
        0,
        W * 0.5,
        H * 0.4,
        Math.max(W, H) * 0.75,
      );
      bgGrad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0.10)`);
      bgGrad.addColorStop(0.45, `rgba(${color[0]},${color[1]},${color[2]},0.04)`);
      bgGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 全域呼吸:整體透明度以非常慢的 sin 微微脈動
      const breath = 0.92 + 0.08 * Math.sin(time * 0.35);
      const effectiveOpacity = opacity * breath;

      const nodes = nodesRef.current;
      const pulses = pulsesRef.current;

      // ── 節點更新:三個群組各自固定方向漂移 + 流場擾動 ──
      for (const n of nodes) {
        const drift = GROUP_DRIFTS[n.group];

        // 流場擾動:讓每個節點在群組漂移方向之外仍有有機波動,避免「平移整塊」的死板感
        const fx =
          Math.sin(n.y * FLOW_SCALE + time * FLOW_TIME) -
          Math.cos(n.x * FLOW_SCALE * 1.3 + time * FLOW_TIME * 0.7);
        const fy =
          -Math.sin(n.x * FLOW_SCALE + time * FLOW_TIME) +
          Math.cos(n.y * FLOW_SCALE * 1.1 + time * FLOW_TIME * 0.9);

        // 速度 = 群組固定漂移 + 流場擾動(直接覆寫,確保群組方向佔主導)
        n.vx = drift.vx + fx * FLOW_PERTURB;
        n.vy = drift.vy + fy * FLOW_PERTURB;

        n.x += n.vx;
        n.y += n.vy;

        // ── Wrap-around:移出畫面時從對側回來,維持「永續方向漂移」 ──
        if (n.x < -WRAP_PADDING) n.x = W + WRAP_PADDING;
        else if (n.x > W + WRAP_PADDING) n.x = -WRAP_PADDING;
        if (n.y < -WRAP_PADDING) n.y = H + WRAP_PADDING;
        else if (n.y > H + WRAP_PADDING) n.y = -WRAP_PADDING;

        // 能量衰減
        n.energy *= 0.965;
        if (n.energy < 0.08 && n.activeNeighbors.length > 0) {
          n.activeNeighbors = [];
        }
      }

      // 自發放電:每幀以一定機率讓隨機節點開始放電(每次只發 1 條脈衝)
      if (Math.random() < 0.075 && nodes.length > 0) {
        const sourceIdx = Math.floor(Math.random() * nodes.length);
        nodes[sourceIdx].energy = 1;
        setActiveLines(sourceIdx);
        fireFrom(sourceIdx);
      }

      // 更新脈衝 — 抵達後讓目標放電,並有機率繼續往下一個鄰居傳播
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          const target = nodes[p.toIdx];
          target.energy = Math.max(target.energy, 0.9);
          setActiveLines(p.toIdx);
          if (Math.random() < 0.5) {
            fireFrom(p.toIdx, p.fromIdx);
          }
          pulses.splice(i, 1);
        }
      }

      // ── 繪製連線:只連短距離鄰居,讓畫面乾淨 ──
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= shortRangeSq) continue;
          const midX = (a.x + b.x) * 0.5;
          const midY = (a.y + b.y) * 0.5;
          const fade = edgeFadeAt(midX, midY);
          if (fade <= 0.02) continue;
          const d = Math.sqrt(d2);
          // 只有 activeNeighbors 中明確列出的邊才會被能量加亮
          const isActiveEdge =
            (a.activeNeighbors.length > 0 && a.activeNeighbors.indexOf(j) !== -1) ||
            (b.activeNeighbors.length > 0 && b.activeNeighbors.indexOf(i) !== -1);
          const energyBoost = isActiveEdge ? Math.max(a.energy, b.energy) : 0;

          const dist01 = d / shortRange;
          const lineAlpha = Math.min(
            1,
            ((1 - dist01) * 0.28 + energyBoost * 0.55) * effectiveOpacity * fade,
          );
          if (lineAlpha < 0.01) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${lineAlpha})`;
          ctx.lineWidth = 0.55 + energyBoost * 0.85;
          ctx.stroke();
        }
      }

      // ── 繪製脈衝:ease-in-out + shadowBlur 柔光暈 ──
      // 用 save/restore 包住 shadowBlur,避免污染其他繪製
      if (pulses.length > 0) {
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.85)`;
        for (const p of pulses) {
          const from = nodes[p.fromIdx];
          const to = nodes[p.toIdx];
          // sine ease-in-out:出發與抵達時稍慢,中間較快
          const eased = 0.5 - 0.5 * Math.cos(p.progress * Math.PI);
          const x = from.x + (to.x - from.x) * eased;
          const y = from.y + (to.y - from.y) * eased;
          const fade = edgeFadeAt(x, y);
          if (fade <= 0.02) continue;
          const a = effectiveOpacity * fade;
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // ── 繪製節點(神經元)— 單純的點,沒有光暈 ──
      for (const n of nodes) {
        const fade = edgeFadeAt(n.x, n.y);
        if (fade <= 0.02) continue;
        const pulsation = Math.sin(time * 1.4 + n.phase) * 0.22 + 0.78;
        const baseSize = (n.isHub ? 2.0 : 1.0) * n.sizeJitter;
        const size = baseSize + n.energy * (n.isHub ? 3.0 : 2.0);
        const hubBrightness = n.isHub ? 1.3 : 1.0;
        const nodeAlpha = Math.min(
          1,
          (0.4 + 0.6 * n.energy) * effectiveOpacity * fade * pulsation * hubBrightness,
        );
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        const coreShift = n.isHub ? 110 : 70;
        ctx.fillStyle = `rgba(${Math.min(color[0] + coreShift, 255)},${Math.min(color[1] + coreShift, 255)},${Math.min(color[2] + 40, 255)},${nodeAlpha})`;
        ctx.fill();
      }

      // ── 高級感渲染 2:Vignette 暈邊 ──
      // 邊緣略暗,把焦點留在中央,呈現電影感
      const vignette = ctx.createRadialGradient(
        W * 0.5,
        H * 0.45,
        Math.min(W, H) * 0.35,
        W * 0.5,
        H * 0.45,
        Math.max(W, H) * 0.85,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.75, "rgba(0,0,0,0.18)");
      vignette.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [color, opacity]);

  useEffect(() => {
    draw();

    const handleResize = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      // resize 後重新生成節點分佈
      nodesRef.current = [];
      pulsesRef.current = [];
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
