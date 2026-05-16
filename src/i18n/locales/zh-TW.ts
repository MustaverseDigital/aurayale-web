export interface Translation {
  battle: {
    rewardToast: {
      title: string
      empty: string
      stamina: string
    }
    rewardClaimFailed: string
  }
  floatingMenu: {
    openAriaLabel: string
  }
  infoMenu: {
    aria: {
      dragPanel: string
      backToEncyclopedia: string
      collapse: string
      close: string
      viewCardDetail: string
      opacity: string
    }
    actions: {
      backToPreviousPage: string
      opacity: string
    }
    categories: {
      gameplay: string
      encyclopedia: string
      rarity: string
      shop: string
    }
    gameplay: {
      whatIsAurayale: { title: string; body: string }
      flow: { title: string; items: string[] }
      coreMechanics: {
        title: string
        items: Array<{ t: string; d: string }>
      }
    }
    encyclopedia: { title: string; hint: string }
    cardDetail: {
      cardLabel: string
      effect: string
      rarityExplanation: string
      tier: string
      tierOfFour: string
    }
    rarity: {
      fourCTitle: string
      fourCIntro: string
      levelsTitle: string
      fourC: Array<{ title: string; desc: string }>
      descriptions: {
        common: string
        rare: string
        epic: string
        legendary: string
      }
    }
    shop: {
      title: string
      body: string
      comingSoon: string
      devNotice: string
      eta: string
    }
  }
  cards: Record<string, { name: string; effect: string }>
}

const zhTW: Translation = {
  battle: {
    rewardToast: {
      title: "獎勵已領取",
      empty: "無獎勵項目",
      stamina: "體力",
    },
    rewardClaimFailed: "領獎流程失敗：{{message}}",
  },
  floatingMenu: {
    openAriaLabel: "開啟資訊選單",
  },
  infoMenu: {
    aria: {
      dragPanel: "拖曳資訊面板",
      backToEncyclopedia: "返回圖鑑",
      collapse: "收合資訊選單",
      close: "關閉",
      viewCardDetail: "查看 {{name}} 詳細資料",
      opacity: "調整資訊面板不透明度",
    },
    actions: {
      backToPreviousPage: "返回前頁",
      opacity: "不透明度",
    },
    categories: {
      gameplay: "遊戲玩法",
      encyclopedia: "寶石圖鑑",
      rarity: "稀有判別",
      shop: "寶石商店",
    },
    gameplay: {
      whatIsAurayale: {
        title: "什麼是 Aurayale",
        body: "Aurayale 是一款以「寶石」為主題的鏈上集換式對戰遊戲，玩家透過收集、合成、交易寶石卡片組成自己的牌組，進行回合制策略對戰。",
      },
      flow: {
        title: "遊戲流程",
        items: [
          "連接錢包，完成登入並領取起始牌組。",
          "於「Deck」頁面挑選 5 張寶石組成戰鬥牌組。",
          "進入「Battle」開始對局，每回合出牌與對手比拚屬性。",
          "勝場可獲得寶石碎片，於市場交易升級你的牌組。",
        ],
      },
      coreMechanics: {
        title: "核心機制",
        items: [
          { t: "屬性相剋", d: "火 / 水 / 風 / 土 / 光 / 暗 互相壓制" },
          { t: "升級系統", d: "兩張同色寶石可合成更高級的卡片" },
          { t: "稀有度判定", d: "依 4C 標準分為一般 / 稀有 / 史詩 / 傳說" },
          { t: "寶石市集", d: "與其他玩家直接以寶石換寶石" },
        ],
      },
    },
    encyclopedia: {
      title: "基礎寶石（24 種）",
      hint: "點擊任意卡片查看詳細資料（名稱、效果、稀有度）。每種寶石都有三個升級階段（基礎 / +1 / +2）。",
    },
    cardDetail: {
      cardLabel: "CARD",
      effect: "卡牌效果",
      rarityExplanation: "稀有度說明",
      tier: "等級",
      tierOfFour: "{{tier}} / 4",
    },
    rarity: {
      fourCTitle: "寶石稀有度的 4C 標準",
      fourCIntro: "Aurayale 沿用真實寶石業界的 4C 評鑑系統，綜合判定卡片的稀有度與市場價值。",
      levelsTitle: "稀有度級別",
      fourC: [
        {
          title: "Color · 顏色",
          desc: "顏色越純淨、飽和度越高的寶石價值越高。Aurayale 中分為冷色（藍/綠）、暖色（紅/黃）與中性（白/黑），每種色系有獨立的稀有曲線。",
        },
        {
          title: "Cut · 切工",
          desc: "切工決定光線折射的角度與火彩。遊戲中切工越精細的寶石，在戰鬥中觸發特效的機率越高。",
        },
        {
          title: "Clarity · 淨度",
          desc: "淨度衡量寶石內部包裹體與表面瑕疵的稀少程度。淨度越高的寶石可承載的附魔等級越高。",
        },
        {
          title: "Carat · 克拉",
          desc: "克拉指寶石的重量（體積）。同等品質下，克拉越大價值呈幾何級數成長，但也意味著更高的能量消耗。",
        },
      ],
      descriptions: {
        common: "常見的入門級寶石，容易在抽卡或日常任務中取得，適合新手組牌。",
        rare: "稀有等級寶石，具有較強的單體技能效果，通常需透過進階卡包獲得。",
        epic: "史詩等級寶石，擁有改變戰局的關鍵技能，是中後期牌組的核心。",
        legendary: "傳說等級寶石，極為罕見，擁有獨特的全場性效果與絢麗的視覺特效。",
      },
    },
    shop: {
      title: "寶石商店",
      body: "官方寶石商店即將開放。屆時可使用遊戲內貨幣或鏈上代幣，直接購買限定寶石、皮膚與升級素材。",
      comingSoon: "Coming Soon",
      devNotice: "商店功能尚在開發中，敬請期待。",
      eta: "ETA · 2026 Q3",
    },
  },
  cards: {
    "1":  { name: "烈焰紅寶石",   effect: "對單一目標造成 12 火屬性傷害，並附加 2 回合燃燒效果。" },
    "2":  { name: "深海藍寶石",   effect: "減速目標 20%，持續 2 回合。對冰結目標額外造成 5 傷害。" },
    "3":  { name: "翡翠之心",     effect: "回復我方友軍 10 點生命值，並淨化一個負面狀態。" },
    "4":  { name: "黃玉之光",     effect: "對前排目標造成 14 雷屬性傷害，有 25% 機率麻痺 1 回合。" },
    "5":  { name: "月光石",       effect: "為我方提供 1 回合無敵護盾（最多吸收 20 傷害）。" },
    "6":  { name: "琥珀之眼",     effect: "解除我方所有控制效果，並提升 15% 命中率。" },
    "7":  { name: "珊瑚紅淵",     effect: "對所有敵人造成 8 火屬性範圍傷害。" },
    "8":  { name: "珍珠白星",     effect: "為我方全體回復 6 點生命，並淨化所有減益。" },
    "9":  { name: "煙水晶",       effect: "提升我方友軍 20% 攻擊力，持續 3 回合。" },
    "10": { name: "紫晶幻夢",     effect: "對單一目標造成 13 暗屬性傷害，並偷取 1 回合行動權。" },
    "11": { name: "血玉龍息",     effect: "造成 22 火屬性傷害，並對自身回復等同於傷害值 30% 的生命。" },
    "12": { name: "冰霜結晶",     effect: "凍結目標 1 回合，並對下個出手的友軍給予 +30% 傷害加成。" },
    "13": { name: "雷電瑪瑙",     effect: "對 3 個隨機敵人各造成 16 雷屬性傷害，並降低其護甲 10%。" },
    "14": { name: "翠綠橄欖",     effect: "為我方全體回復 18 點生命，並提供 1 層持續性回血（每回合 +5）。" },
    "15": { name: "火蛋白石",     effect: "召喚一道火幕，反彈下次受到的傷害 50% 給攻擊者。" },
    "16": { name: "黑曜之矛",     effect: "對裝甲目標額外 +50% 傷害，造成 25 物理傷害並擊退 1 格。" },
    "17": { name: "海藍寶之淚",   effect: "對所有敵人造成 12 水屬性傷害，並使其攻擊力下降 15%。" },
    "18": { name: "帝王綠翡翠",   effect: "為單一友軍提供 2 回合無敵，並回復其至滿血。" },
    "19": { name: "虎眼石之怒",   effect: "造成 35 物理傷害，若擊殺目標則回滿 1 點專注並重置冷卻。" },
    "20": { name: "星辰藍寶",     effect: "降臨流星雨：3 回合內每回合對隨機敵人造成 18 傷害。" },
    "21": { name: "黃金太陽石",   effect: "我方全體獲得 +40% 暴擊率，持續 3 回合。" },
    "22": { name: "夜空黑曜",     effect: "進入潛行狀態 2 回合，期間攻擊必定暴擊。" },
    "23": { name: "永恆鑽石",     effect: "復活我方陣亡的英雄，並使其獲得 100% 攻擊力加成 2 回合。" },
    "24": { name: "創世聖石",     effect: "全場淨化：解除全體敵我所有狀態，我方額外獲得 1 回合行動權。" },
    "25": { name: "翠玉冰心",     effect: "對單一目標造成 10 冰屬性傷害，並降低其速度 25% 共 2 回合。" },
    "26": { name: "紅尖晶石",     effect: "對單一目標造成 13 火屬性傷害，若目標生命低於 50% 則必定暴擊。" },
    "27": { name: "金黃水晶",     effect: "為我方友軍提供 8 點臨時護盾，持續 2 回合。" },
    "28": { name: "粉鑽之心",     effect: "為我方全體回復 4 點生命，並提升 10% 防禦力，持續 2 回合。" },
    "29": { name: "黑碧璽",       effect: "反射對自身的下一次傷害的 30% 給攻擊者。" },
    "30": { name: "紫鋰輝石",     effect: "淨化我方所有負面狀態，並提升 15% 全屬性抗性 1 回合。" },
    "31": { name: "藍寶石之眼",   effect: "對 2 個隨機敵人各造成 14 水屬性傷害，有 30% 機率冰凍。" },
    "32": { name: "帝王托帕石",   effect: "為單一友軍提供 +50% 攻擊力，持續 2 回合。" },
    "33": { name: "摩根石之吻",   effect: "為我方全體回復 12 點生命，並淨化所有減益狀態。" },
    "34": { name: "沙弗萊石",     effect: "對所有敵人造成 10 風屬性傷害，使其攻擊力下降 20% 共 2 回合。" },
    "35": { name: "紅紋赤晶",     effect: "召喚紅光屏障，吸收下次受到的最多 30 點傷害。" },
    "36": { name: "坦桑石之星",   effect: "對單一目標造成 30 暗屬性傷害，並使其下回合無法行動。" },
    "37": { name: "帕拉伊巴碧璽", effect: "雷霆風暴：3 回合內每回合對所有敵人造成 12 雷屬性傷害。" },
    "38": { name: "亞歷山大石",   effect: "變色之力：依場上局勢選擇最有利屬性，造成 28 點傷害。" },
    "39": { name: "龍息之心",     effect: "古龍之力：對所有敵人造成 25 火屬性傷害，我方獲得 2 回合無敵。" },
    "40": { name: "創世虛空",     effect: "時空凍結：敵方下一回合無法行動，我方可額外出 1 張卡。" },
  },
}

export default zhTW
