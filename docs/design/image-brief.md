# Mustaverse 官網 算圖需求清單（v3：宇宙／科技調性 + 冷青暖琥珀雙色調）

給算圖用的規格書。每一張圖底下的 `Prompt` 區塊可以直接整段複製丟給算圖模型。

> **v3 改了什麼**：不再要求純灰階。改成一組**去彩度的雙色調**（冷青為主、暖琥珀為輔，
> 壓在近黑底上），也就是參考圖那隻網點蝴蝶的配色。題材維持 v2 的宇宙／科技方向。
>
> **v2 改了什麼**：第一版的題材（珠寶棚拍、工作檯靜物、桌遊骰子）和網站調性不搭，
> 全部改成「宇宙 × 科技」：天文銅版畫、軌道圖、星圖、等高線掃描、感測器畫面。
> 「自研作品」那兩張（Aurayale / DEAL）已確定沿用原本的遊戲主視覺，**不需要算**。

---

## 0. 全部圖片的共同規則（重要，請先讀）

### 0.1 調性：宇宙 × 科技，兩種質感各佔一半

兩張參考圖代表兩個極端，成品要落在中間：

| 參考 | 抓的是 |
|---|---|
| 天文銅版畫那組（小行星表面、日食山稜、Newton's Cenotaph、古星圖） | 高對比黑白、細密的線刻與點刻、檔案圖版的年代感、構圖對稱莊重 |
| 深色 HUD 拼貼那張（網格分割、等高線、十字定位、煙塵） | 冷調近黑、畫面被格線切塊、等高線／掃描線疊層、儀器感 |

**要的是**：像是「一份用現代儀器重新掃描過的古天文圖版」。
既有銅版畫的線條密度與莊重，又有掃描資料的網格與冷感。

**避免**：彩色星雲照（NASA 那種紫紅色）、賽博龐克霓虹、機器人、電路板特寫、
區塊鏈方塊鎖鏈圖示、水晶球算命感、發光的科技藍。

### 0.2 交付「乾淨連續調」，不要自己先做網點或馬賽克

網站的前端會即時疊三層：**馬賽克格子 → 網點 → 掃描線**。
來圖如果自己先做過網點、點陣、馬賽克，兩層網格會互相干涉產生摩爾紋，畫面會糊掉。

- ✅ 要的是：**乾淨的高對比連續調影像**，暗部紮實、亮部有層次
- ❌ 不要：halftone、dithering、pixelation、CRT 掃描線、報紙印刷質感
- ⚠️ 例外：**線刻／點刻（engraving / stipple）的筆觸是可以的**，那是畫的內容不是後製網格

### 0.3 形要大、要讀得出來

前端的馬賽克格子約 26px。整體構圖如果全是細碎紋理，疊上格子後會變成一片灰。
每張圖都要有**一個明確的大形**（一顆星球的弧線、一道山稜、一個圓形儀器輪廓），
細節則作為那個大形的填充。

### 0.4 色彩：冷青 × 暖琥珀雙色調

不是純灰階，也不是全彩。是**一組壓得很低的雙色調**：整體偏冷青灰，只有畫面裡的
光源／核心帶暖琥珀，其餘全部沉進近黑。參考圖那隻網點蝴蝶就是這個配色。

| 角色 | 色票 | 用在哪 |
|---|---|---|
| 底 | `#050506` ~ `#0d0f11` | 畫面大部分面積，要沉得下去 |
| 冷青（主） | `#3c4c52` → `#7f9aa0` → `#b8ccd0` | 主體的中間調到亮部，佔畫面的冷色調性 |
| 暖琥珀（輔） | `#a8703a` → `#c79a52` → `#e6d3ae` | 只給光源、核心、發熱處，**面積要小** |
| 高光 | `#f2f4f0` | 極小面積的星點與邊緣 |

規則：

- **冷暖比例大約 8:2**。暖色是點綴，不是第二主角；整幅看起來仍要像單色調
- **彩度壓低**：任何一處的飽和度都不要超過中等，看起來要接近「上了色的黑白照」
- 暗部要壓得下去，最暗處接近 `#050506`，才能和頁面底色 `#0f0e0c` 接得起來
- 亮部不要爆掉，主體最亮處留在 `#e6e8e4` 左右
- **不要品牌金當主色**：`#c8a75a` 在網站上只留給按鈕。上表的暖琥珀比它更偏棕、
  彩度更低，是photographic的暖色不是 UI 的強調色
- 不要洋紅、紫、螢光綠這類會跳出這組雙色調的顏色

### 0.5 構圖
- **畫面裡不要有任何文字、字母、數字、logo、浮水印、UI 元件**（文字全部由網頁疊上去）
- 每張圖底下都會標「留白區」：那塊區域要是低對比的暗部或空景，不要放主體
- 主體不要頂邊，四周各留約 8% 的餘裕（網頁會裁切）

### 0.6 輸出
- PNG 或高品質 JPG，長邊不小於下方標示的尺寸
- 檔名照下方指定，直接覆蓋到指定路徑（這些路徑都已經接在程式裡了）

---

## 1. 首頁主視覺（優先度：高）

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/home_hero.jpg`（覆蓋現有） |
| 尺寸 | 2560 × 1440（16:9） |
| 用途 | `/` 首頁 hero 全幅底圖，同時是 `home_banner.mp4` 的 poster |
| 留白區 | **左下 60% × 下 45%**：標題「你的 IP，化為卡牌與虛擬資產。」與兩顆按鈕壓在這裡，這塊要是低對比暗部 |
| 視覺重心 | 靠右上，讓左下留給文字 |

### Prompt

```
A duotone astronomical plate in the style of a 19th-century copperplate engraving,
re-scanned with modern survey instruments.
Subject: the curved limb of a vast planet occupying the upper right of the frame, its
surface rendered in dense engraved hatching and stipple; a thin elliptical orbital
ring passes in front of it; faint topographic contour lines trace across the visible
terrain like survey data laid over an old print.
Composition: the planet limb sweeps through the upper-right third; the lower-left 60%
of the frame is empty deep space, almost featureless, falling to near-black.
Lighting: hard raking light from the upper right; extreme terminator contrast between
the lit crescent and the shadowed hemisphere.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: antique scientific engraving crossed with a cold instrument scan. Fine line work
and stipple texture, archival plate feel, subtle paper grain.
Aspect ratio 16:9.
Absolutely no text, no letters, no numbers, no logos, no watermarks, no UI elements,
no scale bars, no grid labels.
No magenta, no purple, no neon green, no saturated blue, no purple nebula.
The brand gold #c8a75a is reserved for buttons on the site - keep the amber browner
and less saturated than that.
No halftone dots, no dithering, no pixelation, no mosaic, no scan lines as a
post-process - deliver a clean continuous-tone image.
```

---

## 2. Aurayale 遊戲頁主視覺（優先度：高）

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/aurayale_hero.jpg`（覆蓋現有） |
| 尺寸 | 2560 × 1440（16:9） |
| 用途 | `/aurayale` hero 全幅底圖，同時是 `banner.mp4` 的 poster |
| 留白區 | **左下 55% × 下 45%**：標題「統御這片宇宙／從一顆寶石開始。」與按鈕在這裡 |
| 視覺重心 | 右半，可以往上延伸 |

### Prompt

```
A duotone cinematic key visual: a colossal crystalline monolith with sharp geometric
facets rising from a shattered planetary plain, seen against an empty starfield.
The facets are rendered in engraved hatching; faint survey contour lines wrap the
terrain around its base, as if the landscape has been laser-scanned.
Composition: the monolith and ridgeline occupy the right 45% of the frame; the
lower-left 55% is smooth dark plain and empty sky with almost no detail.
Lighting: hard backlight low on the horizon, rim-lighting every facet edge, long
shadows raking toward the lower left, thin atmospheric haze catching the light.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: epic monochrome matte painting with the line discipline of an antique
astronomical engraving. Wide anamorphic framing, subtle grain.
Aspect ratio 16:9.
Absolutely no text, no letters, no numbers, no logos, no watermarks, no UI elements,
no characters or human figures.
No magenta, no purple, no neon green, no saturated blue, no purple nebula.
The brand gold #c8a75a is reserved for buttons on the site - keep the amber browner
and less saturated than that.
No halftone dots, no dithering, no pixelation, no mosaic - clean continuous-tone
image.
```

---

## 3. 三個委託層次（優先度：高，共 3 張）

`/` 首頁「把你的 IP 交給我們」區塊的三列索引。**這三張要彼此明顯不同**，
不然那個區塊的層次會塌掉。三張都照 §0.4 的雙色調、無文字、主體居中、四周留 8% 餘裕。

### 3a. 遊戲本體 / IP Card Game

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/service_tcg.jpg`（覆蓋現有） |
| 尺寸 | 1600 × 1200（4:3） |

意象：一副牌 = 一整櫃的天文玻璃底片。

```
A duotone archival photograph of a rack of astronomical glass photographic plates,
arranged in an overlapping fan like a dealt hand of cards. Each rectangular plate holds
a different engraved star field, and the plates catch a hard raking light along their
edges.
Composition: the fanned plates centred and filling the frame; background falls to
near-black at the edges.
Lighting: single hard source from the upper left, crisp specular edges on the glass,
deep shadow between the plates.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: museum archive photography crossed with antique astronomical plate engraving.
Sharp, formal, symmetrical.
Aspect ratio 4:3.
No text, no letters, no numbers, no catalogue labels, no logos, no watermarks.
No magenta, no purple, no neon green, no saturated blue. No halftone dots, no dithering, no pixelation, no mosaic - clean
continuous-tone image.
```

### 3b. 實體與鏈上互通 / RWA

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/service_rwa.jpg`（覆蓋現有） |
| 尺寸 | 1600 × 1200（4:3） |

意象：同一顆天體的兩種存在 —— 左邊是刻版，右邊是掃描資料。

```
A duotone diptych of one and the same celestial body rendered twice, side by side,
perfectly aligned: on the left an antique copperplate engraving of the sphere in dense
stipple and hatching; on the right the identical sphere as a cold wireframe survey scan
built from contour lines and a fine measurement lattice.
Composition: strictly symmetrical, the two spheres the same size, a single hairline gap
running vertically between them; background near-black.
Lighting: matched hard light from the upper left on both halves so they read as the same
object in two media.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: scientific plate comparison, formal and centred, archival on one side and
instrument-generated on the other.
Aspect ratio 4:3.
No text, no letters, no numbers, no axis labels, no logos, no watermarks.
No magenta, no purple, no neon green, no saturated blue. No halftone dots, no dithering, no pixelation, no mosaic - clean
continuous-tone image.
```

### 3c. 讓卡牌活起來 / XR + AI

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/service_xr.jpg`（覆蓋現有） |
| 尺寸 | 1600 × 1200（4:3） |

意象：平面的圖版上，浮出一個立體的星座。

```
A duotone photograph of a flat engraved star chart lying on a dark surface, with a
translucent volumetric constellation rising out of its surface into the air above -
points of light joined by thin lines, hanging in three dimensions over the flat plate.
Composition: the plate occupying the lower third, the projected constellation blooming
into empty dark space in the upper two thirds.
Lighting: the projection is the brightest element in the frame; the plate is rim-lit
only; background near-black with faint volumetric haze catching the light.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: dramatic black-and-white studio photography with practical haze, the plate itself
in antique engraving style.
Aspect ratio 4:3.
No text, no letters, no numbers, no constellation names, no logos, no watermarks,
no hands, no faces.
No magenta, no purple, no neon green, no saturated blue. No halftone dots, no dithering, no pixelation, no mosaic - clean
continuous-tone image.
```

---

## 4. SwUp 系統圖（優先度：中）

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/swup_system.jpg`（覆蓋現有） |
| 尺寸 | 1600 × 1200（4:3） |
| 用途 | `/aurayale` 的 SwUp System 技術面板右側 |

意象：兩個天體之間的軌道轉移 —— 交換與升級。

```
A duotone orbital transfer diagram rendered as an antique astronomical engraving:
two spheres of different size held in the frame, joined by a long elliptical transfer
trajectory drawn as a fine engraved line, with smaller tick marks stepping along the
path. Faint concentric orbit rings surround each sphere.
Composition: symmetrical, the two spheres balanced left and right, the trajectory arcing
between them through the centre; background falling to near-black at the edges.
Lighting: hard light from the upper left, each sphere showing a crisp terminator, the
trajectory line self-luminous and thin.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: precise scientific plate engraving, formal and centred, instrument-drawn.
Aspect ratio 4:3.
No text, no letters, no numbers, no arrows with labels, no legends, no logos,
no watermarks, no UI elements.
No magenta, no purple, no neon green, no saturated blue. No halftone dots, no dithering, no pixelation, no mosaic - clean
continuous-tone image.
```

---

## 5. Aurayale 遊戲介紹段（優先度：中）

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/aurayale_home.jpg`（覆蓋現有） |
| 尺寸 | 1600 × 1200（4:3） |
| 用途 | `/aurayale` 的 `#home` 區塊左側圖 |

```
A duotone view of a crystalline planet's surface from low altitude: fields of
angular mineral spires rising out of a fractured plain, with survey contour lines
threading between them as if the terrain has just been mapped. A hard low sun sits
behind the spires, throwing long shadows toward the camera.
Composition: spires filling the right half, the contoured plain and its long shadows
leading in from the lower left, empty dark sky above.
Lighting: hard low backlight, strong rim light on every spire edge, deep foreground
shadow, thin atmospheric haze.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: photoreal landscape cinematography with engraved line detail in the rock,
wide lens, subtle grain.
Aspect ratio 4:3.
No text, no letters, no numbers, no logos, no watermarks, no figures, no vehicles.
No magenta, no purple, no neon green, no saturated blue. No halftone dots, no dithering, no pixelation, no mosaic - clean
continuous-tone image.
```

---

## 6. 聯絡頁影像（優先度：低）

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/contact_visual.jpg`（覆蓋現有） |
| 尺寸 | 1600 × 1200（4:3） |
| 用途 | `/contact` 右欄影像 |

意象：觀測儀器 —— 「我們在看，也歡迎你來談」。

```
A duotone photograph of a large antique equatorial telescope mount seen from below
against an open night sky, its brass-free machined rings and graduated circles rendered
with hard engraved edges. Fine contour-like survey lines trace faintly across the sky
behind it.
Composition: the instrument's circular mounting ring dominating the upper two thirds
as one strong round form, the sky and horizon dark and empty below.
Lighting: hard moonlight from the left, crisp specular edges on the machined rings,
deep shadow inside the mount.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: archival scientific instrument photography, formal and centred, medium-format
look.
Aspect ratio 4:3.
No text, no letters, no numbers, no engraved scale markings that read as digits,
no logos, no watermarks, no hands, no faces.
No magenta, no purple, no neon green, no saturated blue. No halftone dots, no dithering, no pixelation, no mosaic - clean
continuous-tone image.
```

---

## 7. 社群分享圖 OG cover（優先度：低）

| 項目 | 內容 |
|---|---|
| 路徑 | `public/images/og-cover.png`（覆蓋現有） |
| 尺寸 | 1200 × 630 |
| 用途 | `_document.tsx` 的 `og:image` / `twitter:image` |

⚠️ 這張**例外**：分享卡片不會經過網站的 CSS 處理，所以要自己把字排上去。
交付兩個版本：

1. `og-cover-base.jpg` — 只有底圖，1200×630，規格同上
2. `og-cover.png` — 在底圖上加字：左半放白色（`#f2f2f3`）無襯線粗體
   `Your IP.` / `On cards, on-chain.` 兩行，下方一行小字灰色（`#a3a3a8`）
   `MUSTAVERSE STUDIO`（全大寫、字距寬）。字型用 Geist 或近似的幾何無襯線。

底圖 Prompt：

```
A duotone banner image in antique astronomical engraving style: the curved limb of a
planet with a thin elliptical orbital ring, occupying the right side of the frame,
surface rendered in dense engraved hatching, faint survey contour lines across the
terrain. The left half of the frame is empty deep space falling to near-black.
Composition: subject strictly in the right 45%; left 55% is dark negative space.
Lighting: single hard directional key from the upper right, deep shadows, crisp
engraved highlights along the limb.
Palette: a heavily desaturated duotone on near-black - not grayscale, not full colour.
Cool slate-teal (#3c4c52 through #7f9aa0 to #b8ccd0) carries the mid-tones and highlights
of the subject. A small amount of warm amber (#a8703a through #c79a52 to #e6d3ae) appears
only at the light source or the glowing core, roughly 20% of the coloured area against
80% cool. Deepest shadows near #050506, brightest highlights near #e6e8e4. Saturation
stays low everywhere - it must read like a tinted black-and-white photograph, never like
a colour one.
Style: 19th-century scientific plate crossed with a cold instrument scan, fine line
work, subtle paper grain.
Aspect ratio 1200:630.
No text, no letters, no numbers, no logos, no watermarks.
No magenta, no purple, no neon green, no saturated blue, no purple nebula.
The brand gold #c8a75a is reserved for buttons on the site - keep the amber browner
and less saturated than that.
No halftone dots, no dithering, no pixelation, no mosaic - clean continuous-tone
image.
```

---

## 8. 不需要算的（已確定沿用原圖）

| 路徑 | 說明 |
|---|---|
| `public/images/index_aurayale.jpg` | 自研作品的 Aurayale 主視覺，沿用原本的遊戲 key art，**且維持彩色**（程式已設定不轉灰階） |
| `public/images/index_deal.jpg` | 自研作品的 DEAL 主視覺，同上 |
| `public/images/card_01~04.png` | Gem Cuts 的卡牌扇形，是實際卡面，不動 |
| `public/images/Logo.svg`、`Partners_*.svg` | 品牌與夥伴標記 |

這兩張產品圖在網站上會疊一層很淡的馬賽克格子當質感，但顏色維持原樣。

---

## 9. 影片（不是算圖，但同一批要處理）

兩支 hero 影片維持現有內容，只需要重新壓縮：

| 檔案 | 待辦 |
|---|---|
| `public/images/banner.mp4` | 已重壓過，確認在 2 MB 以內即可 |
| `public/images/home_banner.mp4` | **原始解析度只有 320×570**，在桌機 hero 上是放大三倍，本身就糊。目前靠馬賽克遮掉了，但如果想要清晰的 hero，這支要重拍或找原始素材重壓 |

兩支都**不需要**先調色，網站的 CSS 會即時處理（去彩度 + 抖動網版 + 掃描線）。
先把顏色壓掉反而會讓之後想調整時沒有回頭路。

參考指令：

```bash
ffmpeg -i input.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart output.mp4
```
