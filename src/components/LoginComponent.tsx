import React, { useRef, useEffect, useState }  from "react";

interface LoginComponentProps {
  username: string;
  password: string;
  loading: boolean;
  error: string;
  success: string;
  showRegister: boolean;
  onLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  onToggleRegister: () => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  username,
  password,
  loading,
  error,
  success,
  showRegister,
  onLogin,
  onToggleRegister,
  onUsernameChange,
  onPasswordChange,
}) => {
  return (
    <section className="Connect fixed w-full h-full bgImg z-2 flex flex-col ">
      <div className=" w-full h-full absolute -bottom-25"></div>
      <GemCanvas />
      <div className="bgDark"></div>
      {/* Logo置頂 */}
      <div className="w-full flex flex-col items-center pt-45 z-10">
        <img src="/img/logo.png" alt="" width="256px" className="" />
      </div>
      {/* Error置中 */}
      {(error || success) && (
        <div className="flex-1 flex items-center justify-center z-10">
          <div className={`text-sm bg-black/60 px-6 py-3 rounded-xl ${error ? "text-red-400" : "text-green-400"}`}>
            {error || success}
          </div>
        </div>
      )}
      {/* ConnectButton置底 */}
      <div className="w-full flex flex-col items-center justify-end pb-16 z-10 mt-auto gap-4">
        {/* ConnectButton 由父元件決定是否要加進來 */}
        <form
          onSubmit={onLogin}
          className="flex flex-col gap-2 "
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={onUsernameChange}
            className="input text-white px-3 py-2 rounded-xl  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={onPasswordChange}
            className="input text-white px-3 py-2 rounded-xl  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input"
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn rounded-xl px-3 py-2  btn-main  mb-5" disabled={loading}>
            {showRegister ? "Register" : "Login"}
          </button>

          <div className="text-gray-400 text-center">Other Login</div>
          <button type="submit" className="bgn bg-white/90 btn-white rounded-xl  px-3 py-2  btn-primary mb-10" disabled={loading}>
            Google Login
          </button>


          
          <button
            type="button"
            className="text-sm underline text-orange-300"
            onClick={onToggleRegister}
          >
            {showRegister ? "Have an account? Sign in." : "No account? Register. "}
          </button>
        </form>
      </div>
    </section>
    
  );
}; 
// 寶石動畫背景元件
const GemCanvas = () => {
    const canvasRef = useRef(null);
    const [gemImages, setGemImages] = useState([]);

    // 您可以在這裡替換或增加您自己的寶石圖片網址
    const gemImageUrls = [
        '/img/diamond.png',
        '/img/diamond2.png',
        '/img/diamond3.png'
    ];

    // 載入所有圖片
    useEffect(() => {
        const imagePromises = gemImageUrls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous"; // 處理跨域問題
                img.src = url;
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(err);
            });
        });

        Promise.all(imagePromises)
            .then(images => {
                setGemImages(images);
            })
            .catch(err => console.error("圖片載入失敗:", err));
    }, []); // 這個 effect 只在元件掛載時執行一次

    // 動畫邏輯
    useEffect(() => {
        if (gemImages.length === 0) return; // 如果圖片尚未載入，則不執行

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let gems = [];
        const gemCount = 20; // 增加寶石數量以獲得更豐富的效果
        let animationFrameId;
        let maxDistance;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // 計算中心到角落的最大距離
            maxDistance = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
        };

        // 將單一寶石重設回中心
        const resetGem = (gem) => {
            gem.z = 0; // z 代表離中心的距離
            gem.angle = Math.random() * Math.PI * 2; // 擴散的角度
            gem.speed = Math.random() * 0.5 + 0.2; // 擴散的速度
            gem.image = gemImages[Math.floor(Math.random() * gemImages.length)];
            gem.baseSize = Math.random() * 60 + 30;
            gem.rotation = Math.random() * Math.PI * 2;
            gem.rotationSpeed = (Math.random() - 0.5) * 0.01;
            return gem;
        };
        
        const createGem = () => {
            return resetGem({}); // 透過重設一個空物件來建立新的寶石
        };

        const init = () => {
            resizeCanvas();
            gems = [];
            for (let i = 0; i < gemCount; i++) {
                const gem = createGem();
                // 為了避免所有寶石同時從中心開始，將它們隨機分佈在不同距離
                gem.z = Math.random() * maxDistance;
                gems.push(gem);
            }
        };

        const drawGem = (gem) => {
            const normalizedDistance = gem.z / maxDistance;

            // 根據角度和距離(z)計算目前位置
            const currentX = canvas.width / 2 + Math.cos(gem.angle) * gem.z;
            const currentY = canvas.height / 2 + Math.sin(gem.angle) * gem.z;

            ctx.save();

            // --- 新增：淡出邏輯 ---
            const fadeStartDistance = 0.8; // 從 80% 的距離開始淡出
            let opacity = 1;
            if (normalizedDistance > fadeStartDistance) {
                // 在淡出區域內計算透明度，從 1 到 0
                opacity = Math.max(0, 1 - (normalizedDistance - fadeStartDistance) / (1 - fadeStartDistance));
            }
            ctx.globalAlpha = opacity;
            // --- 結束新增邏輯 ---

            ctx.translate(currentX, currentY);
            ctx.rotate(gem.rotation);

            // 外圍的寶石更大、更黑、更模糊
            const displaySize = gem.baseSize * normalizedDistance*1.5;
            const blurAmount = normalizedDistance * 4;
            const darkness = normalizedDistance * 0.9;

            // 如果太小或完全透明就不繪製
            if (displaySize < 1 || opacity <= 0) {
                ctx.restore();
                return;
            }

            ctx.filter = `blur(${blurAmount}px)`;
            ctx.drawImage(gem.image, -displaySize / 2, -displaySize / 2, displaySize, displaySize);

            if (darkness > 0) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
                ctx.fillRect(-displaySize / 2, -displaySize / 2, displaySize, displaySize);
            }

            ctx.restore();
        };

        const update = () => {
            // 根據距離排序，先畫遠的寶石
            gems.sort((a, b) => a.z - b.z);

            gems.forEach(gem => {
                gem.z += gem.speed;
                gem.rotation += gem.rotationSpeed;

                // 如果寶石超出畫面，就將它重設回中心
                if (gem.z > maxDistance) {
                    resetGem(gem);
                }
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            update();
            gems.forEach(drawGem);
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        window.addEventListener('resize', init);

        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gemImages]); // 當 gemImages 載入完成後，此 useEffect 會重新執行

    return <canvas ref={canvasRef} id="gem-canvas" className="fixed top-0 left-0 w-full h-full z-0 opacity-70"></canvas>;
};
export default LoginComponent; 