import { useEffect, useRef, useCallback } from "react";

interface WireframeMeshProps {
  className?: string;
  color?: [number, number, number]; // RGB
  opacity?: number;
}

/**
 * Animated 3D wireframe mesh terrain with flowing waves.
 * Renders on a <canvas> using requestAnimationFrame.
 */
export function WireframeMesh({
  className = "",
  color = [139, 92, 246], // purple-500
  opacity = 0.6,
}: WireframeMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle DPR for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // Grid config
    const cols = 80;
    const rows = 45;
    const perspective = 1000;
    const cameraHeight = 60;
    const gridDepth = 1500;
    const spreadX = 50;

    // Seeded pseudo-random for consistent jitter per vertex
    // (regenerated once, stays stable across frames)
    const seed = 42;
    function seededRandom(a: number, b: number): number {
      const h = Math.sin(a * 127.1 + b * 311.7 + seed) * 43758.5453;
      return h - Math.floor(h); // 0..1
    }

    // Pre-compute jitter offsets for each vertex (stable across frames)
    const jitterX: number[][] = [];
    const jitterZ: number[][] = [];
    const jitterStrength = 14; // how far vertices can shift from grid position

    for (let row = 0; row < rows; row++) {
      jitterX[row] = [];
      jitterZ[row] = [];
      for (let col = 0; col < cols; col++) {
        // Don't jitter edges too much to keep the mesh boundary clean
        const edgeFactor = Math.min(
          col / 3, (cols - 1 - col) / 3,
          row / 3, (rows - 1 - row) / 3,
          1
        );
        jitterX[row][col] = (seededRandom(row, col) - 0.5) * 2 * jitterStrength * edgeFactor;
        jitterZ[row][col] = (seededRandom(row + 100, col + 100) - 0.5) * 2 * jitterStrength * 0.6 * edgeFactor;
      }
    }

    let time = 0;

    // Helper: compute alpha factors for a given point
    const computeAlpha = (pt: { sy: number }, row: number, col: number, baseOpacity: number) => {
      const depthFactor = 1 - (row / rows);
      const depthAlpha = baseOpacity * (0.15 + 0.85 * depthFactor);

      const edgeDist = Math.abs(col - cols / 2) / (cols / 2);
      const edgeFade = Math.max(0.1, 1 - Math.pow(edgeDist, 1.5));

      // Bottom fade-out
      const yProgress = pt.sy / H;
      const fadeStart = 0.55;
      const bottomFade = yProgress > fadeStart
        ? 1 - Math.pow((yProgress - fadeStart) / (1 - fadeStart), 1.5)
        : 1;
      const clampedBottomFade = Math.max(0, Math.min(1, bottomFade));

      return { alpha: depthAlpha * edgeFade * clampedBottomFade, depthFactor };
    };

    // Draw a line between two points
    const drawLine = (
      x1: number, y1: number, x2: number, y2: number,
      alpha: number, width: number
    ) => {
      if (alpha < 0.01) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, W, H);

      // Compute 3D points projected to 2D (with jitter)
      const points: { x: number; y: number; z: number; sx: number; sy: number }[][] = [];

      for (let row = 0; row < rows; row++) {
        points[row] = [];
        for (let col = 0; col < cols; col++) {
          // World coordinates with jitter
          const x = (col - cols / 2) * spreadX + jitterX[row][col];
          const z = row * (gridDepth / rows) + 20 + jitterZ[row][col];

          // Wave height — more dramatic layered sine waves
          const wave1 = Math.sin(x * 0.012 + time * 1.4) * 80;
          const wave2 = Math.cos(z * 0.010 + time * 0.9) * 60;
          const wave3 = Math.sin((x + z) * 0.007 + time * 1.8) * 50;
          const wave4 = Math.sin(x * 0.020 + time * 2.5) * 30;
          const wave5 = Math.cos(z * 0.018 - time * 1.1) * 35;
          const wave6 = Math.sin(x * 0.035 - z * 0.005 + time * 0.6) * 20;
          const y = -(wave1 + wave2 + wave3 + wave4 + wave5 + wave6);

          const scale = perspective / (perspective + z);
          const sx = W / 2 + x * scale;

          const zProgress = row / (rows - 1);
          const baseSy = H * 1.15 - (H * 1.4) * zProgress;
          const sy = baseSy + (y - cameraHeight) * scale;

          points[row][col] = { x, y, z, sx, sy };
        }
      }

      // Draw grid lines — horizontal, vertical, AND diagonals for triangulated look
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pt = points[row][col];
          const { alpha: alphaBase, depthFactor } = computeAlpha(pt, row, col, opacity);

          // Horizontal lines (along columns)
          if (col < cols - 1) {
            const next = points[row][col + 1];
            drawLine(pt.sx, pt.sy, next.sx, next.sy, alphaBase * 0.85, depthFactor * 1.4 + 0.3);
          }

          // Vertical lines (along rows)
          if (row < rows - 1) {
            const next = points[row + 1][col];
            drawLine(pt.sx, pt.sy, next.sx, next.sy, alphaBase * 0.65, depthFactor * 1.0 + 0.2);
          }

          // Diagonal lines — alternate direction per cell to create triangles
          if (row < rows - 1 && col < cols - 1) {
            if ((row + col) % 2 === 0) {
              // Top-left to bottom-right diagonal
              const diag = points[row + 1][col + 1];
              drawLine(pt.sx, pt.sy, diag.sx, diag.sy, alphaBase * 0.5, depthFactor * 0.8 + 0.15);
            } else {
              // Top-right to bottom-left diagonal
              const topRight = points[row][col + 1];
              const bottomLeft = points[row + 1][col];
              drawLine(topRight.sx, topRight.sy, bottomLeft.sx, bottomLeft.sy, alphaBase * 0.5, depthFactor * 0.8 + 0.15);
            }
          }
        }
      }

      // Draw glowing dots at intersections (brighter at wave peaks)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pt = points[row][col];
          const depthFactor = 1 - (row / rows);
          const heightGlow = Math.max(0, -pt.y - cameraHeight * 0.2) / 50;

          const dotOpacity = Math.min(opacity + heightGlow * 0.6, 1) * (0.2 + 0.8 * depthFactor);
          const edgeDist = Math.abs(col - cols / 2) / (cols / 2);
          const edgeFade = Math.max(0.1, 1 - Math.pow(edgeDist, 1.5));

          // Bottom fade-out for dots
          const yProgress = pt.sy / H;
          const fadeStart = 0.55;
          const bottomFade = yProgress > fadeStart
            ? 1 - Math.pow((yProgress - fadeStart) / (1 - fadeStart), 1.5)
            : 1;
          const clampedBottomFade = Math.max(0, Math.min(1, bottomFade));

          const alpha = dotOpacity * edgeFade * clampedBottomFade;

          if (alpha > 0.05 && depthFactor > 0.05) {
            const dotSize = depthFactor * 1.2 + heightGlow * 1.0;
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${Math.min(color[0] + 80, 255)}, ${Math.min(color[1] + 80, 255)}, ${Math.min(color[2] + 50, 255)}, ${alpha * 0.95})`;
            ctx.fill();

            // Extra glow halo on high peaks
            if (heightGlow > 0.25) {
              ctx.beginPath();
              ctx.arc(pt.sx, pt.sy, dotSize * 2.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.12})`;
              ctx.fill();
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [color, opacity]);

  useEffect(() => {
    draw();

    const handleResize = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
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
