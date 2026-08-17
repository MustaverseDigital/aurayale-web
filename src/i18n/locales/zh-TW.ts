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
  exitGame: {
    label: string
    ariaLabel: string
    confirm: string
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
      event: string
      gameplay: string
      encyclopedia: string
      rarity: string
      shop: string
    }
    event: {
      title: string
      badge: string
      description: string
      howToTitle: string
      howToItems: string[]
      rewardTitle: string
      rewardItems: string[]
      imagePlaceholder: string
      note: string
    }
    gameplay: {
      whatIsAurayale: { title: string; body: string }
      flow: { title: string; items: string[] }
      coreMechanics: {
        title: string
        items: Array<{ t: string; d: string }>
      }
    }
    encyclopedia: { title: string; hint: string; imageFailed: string }
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
  exitGame: {
    label: "離開遊戲",
    ariaLabel: "離開遊戲，返回官網",
    confirm: "確定要離開遊戲嗎？目前的進度不會保留。",
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
      event: "活動",
      gameplay: "遊戲玩法",
      encyclopedia: "寶石圖鑑",
      rarity: "稀有判別",
      shop: "寶石商店",
    },
    event: {
      title: "限時活動",
      badge: "進行中",
      description: "觀看廣告即可獲得寶石卡包！每次看完廣告，系統將隨機發放一個卡包，內含稀有寶石碎片，助你升級牌組。",
      howToTitle: "如何參與",
      howToItems: [
        "進入 Battle 對戰頁面。",
        "點擊畫面中的「觀看廣告」按鈕。",
        "完整觀看廣告（約 15–30 秒）。",
        "廣告結束後自動發放寶石卡包獎勵。",
      ],
      rewardTitle: "獎勵內容",
      rewardItems: [
        "寶石碎片（隨機稀有度）",
        "機率獲得稀有 / 史詩 / 傳說等級碎片",
        "每日可無限次參與",
      ],
      imagePlaceholder: "活動示意圖（即將上線）",
      note: "活動說明與獎勵內容可能隨版本更新調整，請以遊戲內公告為準。",
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
          "進入「Battle」開始對局，每回合打出寶石卡組成撲克牌型，以 ATK × Mult 結算傷害。",
          "勝場可獲得寶石碎片，於市場交易升級你的牌組。",
        ],
      },
      coreMechanics: {
        title: "核心機制",
        items: [
          { t: "牌型計分", d: "打出順子 / 同花 / 葫蘆等撲克牌型，傷害 = ATK × Mult" },
          { t: "升級系統", d: "兩張同色寶石可合成更高級的卡片" },
          { t: "稀有度判定", d: "依 4C 標準分為一般 / 稀有 / 史詩 / 傳說" },
          { t: "寶石市集", d: "與其他玩家直接以寶石換寶石" },
        ],
      },
    },
    encyclopedia: {
      title: "基礎寶石（24 種）",
      hint: "點擊任意卡片查看詳細資料（名稱、效果、稀有度）。每種寶石都有三個升級階段（基礎 / +1 / +2）。",
      imageFailed: "圖片載入失敗",
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
    "1":  { name: "烈焰紅寶石",   effect: "若牌型包含順子（Straight），ATK + 50。" },
    "2":  { name: "深海藍寶石",   effect: "若牌型包含順子（Straight），Mult + 15。" },
    "3":  { name: "翡翠之心",     effect: "目標牌點數 +1。" },
    "4":  { name: "黃玉之光",     effect: "目標牌點數 -1。" },
    "5":  { name: "月光石",       effect: "若所有牌點數皆為奇數，ATK + 50。" },
    "6":  { name: "琥珀之眼",     effect: "若所有牌點數皆為偶數，Mult + 10。" },
    "7":  { name: "珊瑚紅淵",     effect: "若牌型包含同花（Flush），ATK + 50。" },
    "8":  { name: "珍珠白星",     effect: "若牌型包含同花（Flush），Mult + 15。" },
    "9":  { name: "煙水晶",       effect: "將紅心（Heart）花色變更為黑桃（Spade）。" },
    "10": { name: "紫晶幻夢",     effect: "將黑桃（Spade）花色變更為梅花（Club）。" },
    "11": { name: "血玉龍息",     effect: "將方塊（Diamond）花色變更為紅心（Heart）。" },
    "12": { name: "冰霜結晶",     effect: "將梅花（Club）花色變更為方塊（Diamond）。" },
    "13": { name: "雷電瑪瑙",     effect: "若牌型包含兩對（Two Pair），ATK + 25。" },
    "14": { name: "翠綠橄欖",     effect: "若牌型包含兩對（Two Pair），Mult + 5。" },
    "15": { name: "火蛋白石",     effect: "若下一回合牌型包含兩對（Two Pair），ATK + 50。" },
    "16": { name: "黑曜之矛",     effect: "若牌型包含三條（Three of a Kind），ATK + 35。" },
    "17": { name: "海藍寶之淚",   effect: "若牌型包含三條（Three of a Kind），Mult + 10。" },
    "18": { name: "帝王綠翡翠",   effect: "若下一回合牌型包含三條（Three of a Kind），Mult + 15。" },
    "19": { name: "虎眼石之怒",   effect: "ATK + 15。" },
    "20": { name: "星辰藍寶",     effect: "Mult + 4。" },
    "21": { name: "黃金太陽石",   effect: "本回合 Mult 設為 1。下一回合 Mult x 3。" },
    "22": { name: "夜空黑曜",     effect: "若牌型包含順子（Straight），Mult x 2。" },
    "23": { name: "永恆鑽石",     effect: "每當牌型包含同花（Flush）時，永久 ATK + 10。" },
    "24": { name: "創世聖石",     effect: "每當牌型包含同花（Flush）時，永久 Mult + 4。" },
    "25": { name: "翠玉冰心",     effect: "若為黑桃同花（Spade Flush），獲得 Mult + 2，持續 3 回合。" },
    "26": { name: "紅尖晶石",     effect: "若為紅心同花（Heart Flush），3 回合內每回合恢復 5 HP。" },
    "27": { name: "金黃水晶",     effect: "若為方塊同花（Diamond Flush），3 回合內每回合永久 ATK + 5。" },
    "28": { name: "粉鑽之心",     effect: "若為梅花同花（Club Flush），3 回合內受到傷害減少 15%。" },
    "29": { name: "黑碧璽",       effect: "本回合 ATK - 25。下一回合 ATK + 100。" },
    "30": { name: "紫鋰輝石",     effect: "Mult 增加值等於所有牌點數之和。" },
    "31": { name: "藍寶石之眼",   effect: "ATK - 25。Mult + 30。" },
    "32": { name: "帝王托帕石",   effect: "若牌型包含兩對（Two Pair），恢復 20 HP。" },
    "33": { name: "摩根石之吻",   effect: "本回合 Mult - 5。下一回合 Mult + 15。" },
    "34": { name: "沙弗萊石",     effect: "若牌型包含葫蘆（Full House），受到傷害減少 50%。" },
    "35": { name: "紅紋赤晶",     effect: "Mult - 5。ATK + 30。" },
    "36": { name: "坦桑石之星",   effect: "若牌型包含三條（Three of a Kind），受到傷害減少 30%。" },
    "37": { name: "帕拉伊巴碧璽", effect: "ATK 設為 30。" },
    "38": { name: "亞歷山大石",   effect: "Mult 設為 10。" },
    "39": { name: "龍息之心",     effect: "ATK 增加值等於所有牌點數之和。" },
    "40": { name: "創世虛空",     effect: "受到傷害減少 15%。" },
  },
}

export default zhTW
