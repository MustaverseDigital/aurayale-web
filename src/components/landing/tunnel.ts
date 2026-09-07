/**
 * 主視覺的極座標隧道。
 *
 * 把畫面重新映射成 (角度, 深度)：角度繞一圈對應影片的橫向，
 * 深度 = DEPTH / 半徑 + 時間。半徑越小代表越遠，影片在那裡被壓縮得越劇烈，
 * 所以中心自然形成一個無限遠的消失點。
 *
 * 整個效果是一個 fragment shader，一次全螢幕 pass，沒有迴圈也沒有多重取樣，
 * 比先前那套 canvas 2D 的網版便宜一個量級（實測 0.3～0.7ms／幀）。
 *
 * 下面的數值是在一份獨立的調參台上調出來的，不在這個 repo 裡。要重新調的話
 * 直接改這裡的常數即可 —— 全部都是 uniform，沒有任何一個被寫死在 shader 中。
 */

export type TunnelConfig = {
  /** 影片沿隧道被拉多長。越大越深、環越密 */
  DEPTH: number;
  /** 前進速度。負值是往後退 */
  SPEED: number;
  /** 隧道自己繞著中心轉的速度 */
  SPIN: number;
  /** 角度隨半徑偏移，把隧道扭成螺旋 */
  TWIST: number;
  /** 影片繞一圈重複幾次。大於 1 會出現對稱 */
  REPEAT: number;
  /** 橢圓壓縮 */
  SQUASH: number;
  /** 隧道口位置（0..1） */
  CX: number;
  CY: number;
  /** 接縫鏡射。影片四邊接不起來，直接 fract 會出現硬邊 */
  MIRROR_U: boolean;
  MIRROR_V: boolean;
  /** 中心（無限遠）收掉多少，不收會有高頻雜訊閃爍 */
  CORE_FADE: number;
  CORE_COLOR: string;
  /** 外緣溶進頁面底色 */
  EDGE_FADE: number;
  EDGE_START: number;
  /** 深度霧：越遠越淡，這是縱深感的來源 */
  FOG: number;
  FOG_COLOR: string;
  VIGNETTE: number;
  GRAY: number;
  CONTRAST: number;
  BRIGHT: number;
  SAT: number;
  /** 把畫面映射到兩個品牌色之間 */
  TINT_MIX: number;
  TINT_LOW: string;
  TINT_HIGH: string;
  /** 三通道取樣在不同深度，模擬鏡頭色散 */
  ABERR: number;
  ABERR_RADIAL: number;
  RING_COUNT: number;
  RING_WIDTH: number;
  RING_ALPHA: number;
  SPOKE_COUNT: number;
  SPOKE_ALPHA: number;
  LINE_COLOR: string;
  GRAIN: number;
  SCAN: number;
  SCAN_PITCH: number;
  /** 前進速度週期性快慢。等速久看會膩 */
  PULSE: number;
  PULSE_S: number;
  /** 隧道口跟著滑鼠微微移動 */
  PARALLAX: number;
  FPS_CAP: number;
  GROUND: string;
  /** 下緣壓暗的不透明度，交給 .mv-hero-scrim */
  SCRIM: number;
};

export const TUNNEL: TunnelConfig = {
  DEPTH: 0.78,
  SPEED: -0.1,
  SPIN: 0.485,
  TWIST: 0.34,
  REPEAT: 5,
  SQUASH: 1,
  CX: 0.5,
  CY: 0.5,
  MIRROR_U: false,
  MIRROR_V: true,
  CORE_FADE: 0.28,
  CORE_COLOR: "#0f0e0c",
  EDGE_FADE: 1,
  EDGE_START: 0.3,
  FOG: 1,
  FOG_COLOR: "#141210",
  VIGNETTE: 0.2,
  GRAY: 0.5,
  CONTRAST: 1.3,
  BRIGHT: 0.9,
  SAT: 1.52,
  TINT_MIX: 0,
  TINT_LOW: "#000000",
  TINT_HIGH: "#dcbd73",
  ABERR: 0.018,
  ABERR_RADIAL: 0.62,
  RING_COUNT: 22,
  RING_WIDTH: 0.02,
  RING_ALPHA: 0.34,
  SPOKE_COUNT: 12,
  SPOKE_ALPHA: 0,
  LINE_COLOR: "#ebebeb",
  GRAIN: 0.4,
  SCAN: 0.18,
  SCAN_PITCH: 5,
  PULSE: 0.32,
  PULSE_S: 9,
  PARALLAX: 0.105,
  FPS_CAP: 60,
  GROUND: "#0f0e0c",
  SCRIM: 0.8,
};

const VS = `attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `precision highp float;
uniform sampler2D uTex;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;

uniform float uDepth, uSpeed, uSpin, uTwist, uRepeat, uSquash, uCX, uCY;
uniform float uMirrorU, uMirrorV;
uniform float uCoreFade, uEdgeFade, uEdgeStart, uFog, uVignette;
uniform vec3  uCoreColor, uFogColor, uGround;
uniform float uGray, uContrast, uBright, uSat, uTintMix;
uniform vec3  uTintLow, uTintHigh;
uniform float uAberr, uAberrRadial;
uniform float uRingCount, uRingWidth, uRingAlpha, uSpokeCount, uSpokeAlpha;
uniform vec3  uLineColor;
uniform float uGrain, uScan, uScanPitch;
varying vec2 vUv;

const float TAU = 6.283185307;

float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/* 影片的四邊接不起來，直接 fract 每繞一圈會閃過一條硬邊。
   鏡射（ping-pong）就完全連續，代價是畫面會對稱一次。 */
float wrap(float x, float mirrorOn){
  float f = fract(x);
  float m = 1.0 - abs(fract(x * 0.5) * 2.0 - 1.0);
  return mix(f, m, mirrorOn);
}

vec3 tap(sampler2D t, float au, float depth){
  return texture2D(t, vec2(wrap(au, uMirrorU), wrap(depth, uMirrorV))).rgb;
}

void main(){
  vec2 c = vec2(uCX, uCY) + uMouse;
  vec2 p = (vUv - c) * vec2(uRes.x / uRes.y * uSquash, 1.0);
  float r = length(p) + 0.0018;
  float a = atan(p.y, p.x);

  a += uTwist / r;        // 螺旋
  a += uTime * uSpin;     // 自轉

  float au = (a / TAU + 0.5) * uRepeat;
  float depth = uDepth / r + uTime * uSpeed;

  vec3 col;
  if (uAberr > 0.0001) {
    float k = uAberr * mix(1.0, clamp(r * 1.6, 0.0, 1.0), uAberrRadial);
    col.r = tap(uTex, au, depth + k).r;
    col.g = tap(uTex, au, depth).g;
    col.b = tap(uTex, au, depth - k).b;
  } else {
    col = tap(uTex, au, depth);
  }

  col = mix(vec3(luma(col)), col, 1.0 - uGray);
  col = (col - 0.5) * uContrast + 0.5;
  col *= uBright;
  col = mix(vec3(luma(col)), col, uSat);
  col = max(col, 0.0);
  col = mix(col, mix(uTintLow, uTintHigh, clamp(luma(col), 0.0, 1.0)), uTintMix);

  // 半徑越小＝越遠＝越淡
  col = mix(col, uFogColor, uFog * (1.0 - smoothstep(0.0, 0.55, r)));

  if (uRingAlpha > 0.001 && uRingCount > 0.5) {
    float e = abs(fract(depth * uRingCount) - 0.5) * 2.0;
    col = mix(col, uLineColor, smoothstep(1.0 - uRingWidth, 1.0, e) * uRingAlpha);
  }
  if (uSpokeAlpha > 0.001 && uSpokeCount > 0.5) {
    float e = abs(fract(au * uSpokeCount / max(uRepeat, 1.0)) - 0.5) * 2.0;
    col = mix(col, uLineColor, smoothstep(0.93, 1.0, e) * uSpokeAlpha);
  }

  col = mix(uCoreColor, col, smoothstep(0.0, uCoreFade + 0.02, r));
  col = mix(col, uGround, smoothstep(uEdgeStart, uEdgeStart + 0.55, r) * uEdgeFade);

  if (uScan > 0.001) {
    col *= 1.0 - uScan * step(0.5, fract(gl_FragCoord.y / uScanPitch));
  }
  if (uGrain > 0.001) {
    col += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain * 0.22;
  }
  col *= 1.0 - uVignette * smoothstep(0.34, 0.92, length(vUv - vec2(0.5, 0.46)) * 1.45);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const UNIFORMS = [
  "uTex", "uRes", "uTime", "uMouse",
  "uDepth", "uSpeed", "uSpin", "uTwist", "uRepeat", "uSquash", "uCX", "uCY",
  "uMirrorU", "uMirrorV",
  "uCoreFade", "uEdgeFade", "uEdgeStart", "uFog", "uVignette",
  "uCoreColor", "uFogColor", "uGround",
  "uGray", "uContrast", "uBright", "uSat", "uTintMix", "uTintLow", "uTintHigh",
  "uAberr", "uAberrRadial",
  "uRingCount", "uRingWidth", "uRingAlpha", "uSpokeCount", "uSpokeAlpha", "uLineColor",
  "uGrain", "uScan", "uScanPitch",
] as const;

type UniformName = (typeof UNIFORMS)[number];

function toVec3(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV === "development") {
      console.error("[tunnel]", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export type TunnelRenderer = {
  /** 影片有新的一幀時呼叫。貼圖上傳很貴，不需要每個 rAF 都做 */
  upload(source: TexImageSource): void;
  /** timeSec 是「已經套過呼吸」的模擬時間，不是牆上時鐘 */
  render(widthPx: number, heightPx: number, timeSec: number, mx: number, my: number): void;
  dispose(): void;
};

/**
 * 建一個隧道 renderer。回傳 null 代表這個環境沒有 WebGL —— 呼叫端要退回 poster。
 *
 * 所有 WebGL 狀態都包在這裡，元件那邊只需要「有新影格就 upload、每幀 render」。
 */
export function createTunnelRenderer(
  canvas: HTMLCanvasElement,
  config: TunnelConfig = TUNNEL
): TunnelRenderer | null {
  const gl =
    (canvas.getContext("webgl", { antialias: false, alpha: false, depth: false }) as
      | WebGLRenderingContext
      | null) ??
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!gl || gl.isContextLost()) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VS);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV === "development") {
      console.error("[tunnel]", gl.getProgramInfoLog(program));
    }
    return null;
  }
  gl.useProgram(program);

  const u = {} as Record<UniformName, WebGLUniformLocation | null>;
  UNIFORMS.forEach((name) => {
    u[name] = gl.getUniformLocation(program, name);
  });

  // 一個蓋滿畫面的大三角形，比兩個三角形的 quad 少一條對角接縫
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 影片不是 2 的次方，只能 CLAMP + LINEAR，不能開 mipmap。
  // 繞圈的接續是在 shader 裡用 wrap() 處理的。
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.uniform1i(u.uTex, 0);

  // 不會變的參數只設一次
  const f = (name: UniformName, value: number) => gl.uniform1f(u[name], value);
  f("uDepth", config.DEPTH);
  f("uSpeed", config.SPEED);
  f("uSpin", config.SPIN);
  f("uTwist", config.TWIST);
  f("uRepeat", config.REPEAT);
  f("uSquash", config.SQUASH);
  f("uCX", config.CX);
  f("uCY", config.CY);
  f("uMirrorU", config.MIRROR_U ? 1 : 0);
  f("uMirrorV", config.MIRROR_V ? 1 : 0);
  f("uCoreFade", config.CORE_FADE);
  f("uEdgeFade", config.EDGE_FADE);
  f("uEdgeStart", config.EDGE_START);
  f("uFog", config.FOG);
  f("uVignette", config.VIGNETTE);
  f("uGray", config.GRAY);
  f("uContrast", config.CONTRAST);
  f("uBright", config.BRIGHT);
  f("uSat", config.SAT);
  f("uTintMix", config.TINT_MIX);
  f("uAberr", config.ABERR);
  f("uAberrRadial", config.ABERR_RADIAL);
  f("uRingCount", config.RING_COUNT);
  f("uRingWidth", config.RING_WIDTH);
  f("uRingAlpha", config.RING_ALPHA);
  f("uSpokeCount", config.SPOKE_COUNT);
  f("uSpokeAlpha", config.SPOKE_ALPHA);
  f("uGrain", config.GRAIN);
  f("uScan", config.SCAN);
  f("uScanPitch", config.SCAN_PITCH);
  gl.uniform3fv(u.uCoreColor, toVec3(config.CORE_COLOR));
  gl.uniform3fv(u.uFogColor, toVec3(config.FOG_COLOR));
  gl.uniform3fv(u.uGround, toVec3(config.GROUND));
  gl.uniform3fv(u.uTintLow, toVec3(config.TINT_LOW));
  gl.uniform3fv(u.uTintHigh, toVec3(config.TINT_HIGH));
  gl.uniform3fv(u.uLineColor, toVec3(config.LINE_COLOR));

  let disposed = false;

  return {
    upload(source) {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    },
    render(widthPx, heightPx, timeSec, mx, my) {
      if (disposed) return;
      if (canvas.width !== widthPx || canvas.height !== heightPx) {
        canvas.width = widthPx;
        canvas.height = heightPx;
      }
      gl.viewport(0, 0, widthPx, heightPx);
      gl.uniform2f(u.uRes, widthPx, heightPx);
      gl.uniform1f(u.uTime, timeSec);
      gl.uniform2f(u.uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // 這裡刻意不呼叫 WEBGL_lose_context.loseContext()：
      // 換頁時 React 會沿用同一個 <canvas>，一旦把 context 弄丟，
      // 下一頁在同一張 canvas 上 getContext 拿到的還是那個死掉的 context，
      // shader 編譯全部失敗，結果就是整頁退回 poster。
      // 釋放 GPU 物件就夠了，context 本身跟著 canvas 一起被回收。
    },
  };
}
