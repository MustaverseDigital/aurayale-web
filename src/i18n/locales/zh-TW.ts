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
  site: {
    nav: {
      contact: string
      demo: string
      playNow: string
      login: string
      enterApp: string
      logout: string
    }
    hero: {
      eyebrow: string
      titleLine1: string
      titleLine2: string
      body: string
      ctaPrimary: string
      ctaSecondary: string
    }
    philosophy: {
      eyebrow: string
      titleLine1: string
      titleLine2: string
      body1: string
      body2: string
    }
    services: {
      title: string
      subtitle: string
      tcg: { label: string; title: string; desc: string }
      rwa: { label: string; title: string; desc: string }
      xr: { label: string; title: string; desc: string }
    }
    titles: {
      heading: string
      subtitle: string
      aurayaleLabel: string
      aurayaleDesc: string
      aurayaleCta: string
      dealLabel: string
      dealDesc: string
      dealCta: string
    }
    partners: string
    cta: {
      titleLine1: string
      titleLine2: string
      body: string
      button: string
    }
    contact: {
      titlePre: string
      titleAccent: string
      titlePost: string
      body: string
      form: {
        name: string
        namePlaceholder: string
        org: string
        orgPlaceholder: string
        email: string
        emailPlaceholder: string
        message: string
        messagePlaceholder: string
        submit: string
      }
      openForDeals: string
      communityTitle: string
      communityBody: string
      emailLabel: string
    }
    aurayale: {
      hero: {
        badge: string
        titleLine1: string
        titleLine2: string
        body: string
        ctaPrimary: string
        ctaSecondary: string
      }
      home: {
        eyebrow: string
        welcome: string
        title: string
        body: string
        cta: string
      }
      gemCuts: {
        title: string
        deckLine: string
        comboLine: string
      }
      swup: {
        badge: string
        titleLine1: string
        titleLine2: string
        body: string
        erc1155Title: string
        erc1155Desc: string
        vrfTitle: string
        vrfDesc: string
      }
      awards: {
        title: string
      }
      cta: {
        titleLine1: string
        titleLine2: string
        body: string
        button: string
      }
    }
    footer: {
      taglineDefault: string
      taglineAurayale: string
      contact: string
      offices: string
      rights: string
      privacy: string
      terms: string
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
  site: {
    nav: {
      contact: "聯絡我們",
      demo: "試玩 Demo",
      playNow: "立即遊玩",
      login: "登入",
      enterApp: "進入應用",
      logout: "登出",
    },
    hero: {
      eyebrow: "MUSTAVERSE STUDIO",
      titleLine1: "你的 IP，",
      titleLine2: "化為卡牌與虛擬資產。",
      body: "我們把品牌與角色打造成集換式卡牌遊戲，並串接區塊鏈上所有權與 XR 體驗。",
      ctaPrimary: "洽談合作",
      ctaSecondary: "遊玩 Aurayale",
    },
    philosophy: {
      eyebrow: "我們做什麼",
      titleLine1: "卡牌，",
      titleLine2: "是 IP 變成經濟的起點。",
      body1: "一張卡同時承載美術、規則與所有權。玩家本來就懂得社交、收藏與交易，這是從品牌走向活躍經濟最短的一條路。",
      body2: "我們設計完整的卡牌經濟：遊戲玩法、稀有度模型、鏈上資產與 XR 呈現。Aurayale 是我們自己的作品，也是成功案例。",
    },
    services: {
      title: "把你的 IP 交給我們，實現變現落地!",
      subtitle: "三個層次，可完全委託，也可單獨承接。",
      tcg: {
        label: "IP Card Game",
        title: "遊戲本體",
        desc: "卡牌設計、稀有度階層、數值平衡與多平台遊戲。玩家真正拿在手上、玩得到的部分。",
      },
      rwa: {
        label: "RWA",
        title: "實體與鏈上互通",
        desc: "實體卡對應 ERC-1155 代幣，讓收藏在兩端都具備價值。Aurayale 採用寶石產業的 4C 分級制度定義稀有度。",
      },
      xr: {
        label: "VR + AR = XR",
        title: "讓卡牌活起來",
        desc: "XR 開卡演出、空間化玩法，以及 AI 輔助的美術產線，建構於我們的Web技術棧。",
      },
    },
    titles: {
      heading: "自研作品",
      subtitle: "我們為自己打造的，也是能與你一起打造的。",
      aurayaleLabel: "集換式卡牌遊戲",
      aurayaleDesc: "在寶石宇宙中收集、升級並融合寶石卡牌。",
      aurayaleCta: "遊玩 Aurayale",
      dealLabel: "工具組",
      dealDesc: "把桌上遊戲搬到線上，直接開玩。",
      dealCta: "閱讀文件",
    },
    partners: "合作夥伴",
    cta: {
      titleLine1: "有 IP 嗎？",
      titleLine2: "一起把專屬卡牌做出來。",
      body: "告訴我們你擁有什麼、希望玩家怎麼玩。我們會與你一起規劃卡牌經濟、確權與 XR 三個層次。",
      button: "洽談合作",
    },
    contact: {
      titlePre: "一起打造",
      titleAccent: "遊戲的未來",
      titlePost: "。",
      body: "無論是合作提案、專案洽詢，或只是想打聲招呼，都歡迎與 Mustaverse Studio 聯繫。",
      form: {
        name: "姓名",
        namePlaceholder: "王小明",
        org: "公司／組織",
        orgPlaceholder: "貴公司名稱",
        email: "電子郵件",
        emailPlaceholder: "you@company.com",
        message: "專案說明",
        messagePlaceholder: "簡單描述你的 IP 與想達成的目標⋯⋯",
        submit: "送出訊息",
      },
      openForDeals: "開放合作洽談",
      communityTitle: "加入我們的社群",
      communityBody: "與創作者和玩家一起交流。",
      emailLabel: "電子郵件",
    },
    aurayale: {
      hero: {
        badge: "第一季：創世鑄造",
        titleLine1: "統御這片宇宙",
        titleLine2: "從一顆寶石開始。",
        body: "在寶石宇宙中收集、升級並融合寶石卡牌。",
        ctaPrimary: "開始冒險",
        ctaSecondary: "觀看預告",
      },
      home: {
        eyebrow: "首頁",
        welcome: "歡迎來到",
        title: "寶石宇宙",
        body: "穿越浩瀚的寶石宇宙，在各個寶石星球上挑戰強大的守護者，收集、升級並融合魔法寶石卡牌。",
        cta: "探索圖鑑",
      },
      gemCuts: {
        title: "輕策略，重樂趣",
        deckLine: "10 張寶石卡牌組，9 種符文",
        comboLine: "組出你的專屬連段，釋放炫目法術。",
      },
      swup: {
        badge: "SwUp System V1.0",
        titleLine1: "驅動鏈上卡牌",
        titleLine2: "的核心系統",
        body: "Aura 寶石不只是收藏品。",
        erc1155Title: "ERC-1155 多代幣標準",
        erc1155Desc: "省 Gas 的批次轉移，支援混合資產類型。",
        vrfTitle: "Chainlink VRF 整合",
        vrfDesc: "所有寶石生成事件皆採用可驗證隨機數。",
      },
      awards: {
        title: "獲得業界肯定",
      },
      cta: {
        titleLine1: "展開你的",
        titleLine2: "星際狩獵",
        body: "傳送門已開啟，無數寶石等待發掘。你能奪下最稀有的那一顆嗎？",
        button: "立即遊玩",
      },
    },
    footer: {
      taglineDefault: "我們把 IP 打造成集換式卡牌遊戲、鏈上資產與 XR 體驗。",
      taglineAurayale: "由 Mustaverse Studio 打造的鏈上集換式卡牌遊戲。",
      contact: "聯絡方式",
      offices: "據點",
      rights: "© 2026 Mustaverse Studio. 版權所有。",
      privacy: "隱私權政策",
      terms: "服務條款",
    },
  },
  cards: {
    "1":  { name: "Flame Ruby",               effect: "若牌型包含順子（Straight），ATK + 50。" },
    "2":  { name: "Deep-Sea Sapphire",        effect: "若牌型包含順子（Straight），Mult + 15。" },
    "3":  { name: "Heart of Jade",            effect: "目標牌點數 +1。" },
    "4":  { name: "Topaz Light",              effect: "目標牌點數 -1。" },
    "5":  { name: "Moonstone",                effect: "若所有牌點數皆為奇數，ATK + 50。" },
    "6":  { name: "Amber Eye",                effect: "若所有牌點數皆為偶數，Mult + 10。" },
    "7":  { name: "Coral Abyss",              effect: "若牌型包含同花（Flush），ATK + 50。" },
    "8":  { name: "Pearl Star",               effect: "若牌型包含同花（Flush），Mult + 15。" },
    "9":  { name: "Smoky Quartz",             effect: "將紅心（Heart）花色變更為黑桃（Spade）。" },
    "10": { name: "Amethyst Reverie",         effect: "將黑桃（Spade）花色變更為梅花（Club）。" },
    "11": { name: "Bloodstone Dragon Breath", effect: "將方塊（Diamond）花色變更為紅心（Heart）。" },
    "12": { name: "Frost Crystal",            effect: "將梅花（Club）花色變更為方塊（Diamond）。" },
    "13": { name: "Thunder Agate",            effect: "若牌型包含兩對（Two Pair），ATK + 25。" },
    "14": { name: "Verdant Olivine",          effect: "若牌型包含兩對（Two Pair），Mult + 5。" },
    "15": { name: "Fire Opal",                effect: "若下一回合牌型包含兩對（Two Pair），ATK + 50。" },
    "16": { name: "Obsidian Spear",           effect: "若牌型包含三條（Three of a Kind），ATK + 35。" },
    "17": { name: "Aquamarine Tears",         effect: "若牌型包含三條（Three of a Kind），Mult + 10。" },
    "18": { name: "Imperial Emerald",         effect: "若下一回合牌型包含三條（Three of a Kind），Mult + 15。" },
    "19": { name: "Tiger Eye Fury",           effect: "ATK + 15。" },
    "20": { name: "Star Sapphire",            effect: "Mult + 4。" },
    "21": { name: "Golden Sunstone",          effect: "本回合 Mult 設為 1。下一回合 Mult x 3。" },
    "22": { name: "Night Obsidian",           effect: "若牌型包含順子（Straight），Mult x 2。" },
    "23": { name: "Eternal Diamond",          effect: "每當牌型包含同花（Flush）時，永久 ATK + 10。" },
    "24": { name: "Genesis Stone",            effect: "每當牌型包含同花（Flush）時，永久 Mult + 4。" },
    "25": { name: "Jade Ice Heart",           effect: "若為黑桃同花（Spade Flush），獲得 Mult + 2，持續 3 回合。" },
    "26": { name: "Red Spinel",               effect: "若為紅心同花（Heart Flush），3 回合內每回合恢復 5 HP。" },
    "27": { name: "Citrine",                  effect: "若為方塊同花（Diamond Flush），3 回合內每回合永久 ATK + 5。" },
    "28": { name: "Pink Diamond Heart",       effect: "若為梅花同花（Club Flush），3 回合內受到傷害減少 15%。" },
    "29": { name: "Black Tourmaline",         effect: "本回合 ATK - 25。下一回合 ATK + 100。" },
    "30": { name: "Kunzite",                  effect: "Mult 增加值等於所有牌點數之和。" },
    "31": { name: "Sapphire Eye",             effect: "ATK - 25。Mult + 30。" },
    "32": { name: "Imperial Topaz",           effect: "若牌型包含兩對（Two Pair），恢復 20 HP。" },
    "33": { name: "Morganite Kiss",           effect: "本回合 Mult - 5。下一回合 Mult + 15。" },
    "34": { name: "Tsavorite",                effect: "若牌型包含葫蘆（Full House），受到傷害減少 50%。" },
    "35": { name: "Crimson Lattice",          effect: "Mult - 5。ATK + 30。" },
    "36": { name: "Tanzanite Star",           effect: "若牌型包含三條（Three of a Kind），受到傷害減少 30%。" },
    "37": { name: "Paraiba Tourmaline",       effect: "ATK 設為 30。" },
    "38": { name: "Alexandrite",              effect: "Mult 設為 10。" },
    "39": { name: "Dragon Breath Heart",      effect: "ATK 增加值等於所有牌點數之和。" },
    "40": { name: "Genesis Void",             effect: "受到傷害減少 15%。" },
  },
}

export default zhTW
