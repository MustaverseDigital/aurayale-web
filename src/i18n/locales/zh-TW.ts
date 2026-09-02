export interface Translation {
  battle: {
    rewardToast: {
      title: string
      empty: string
      stamina: string
    }
    rewardClaimFailed: string
    loading: string
    versionFailed: string
  }
  floatingMenu: {
    openAriaLabel: string
  }
  exitGame: {
    label: string
    ariaLabel: string
    confirm: string
    exitInPanel: string
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
      shop: string
    }
    event: {
      title: string
      badge: string
      description: string
      entryTitle: string
      entryBody: string
      howToTitle: string
      howToItems: string[]
      rewardTitle: string
      rewardBody: string
      note: string
    }
    gameplay: {
      whatIsAurayale: { title: string; body: string }
      flow: { title: string; items: string[] }
      coreMechanics: {
        title: string
        heading: string
        body: string
      }
    }
    encyclopedia: {
      title: string
      hint: string
      imageFailed: string
      imageComingSoon: string
      eventCardTitle: string
      eventCardHint: string
      eventCardBadge: string
    }
    cardDetail: {
      cardLabel: string
      effect: string
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
    loading: "Loading Game...",
    versionFailed: "無法取得遊戲版本：{{message}}",
  },
  floatingMenu: {
    openAriaLabel: "開啟資訊選單",
  },
  exitGame: {
    label: "離開遊戲",
    ariaLabel: "離開遊戲，返回官網",
    confirm: "確定要離開遊戲嗎？目前的進度不會保留。",
    exitInPanel: "離開遊戲",
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
      shop: "寶石商店",
    },
    event: {
      title: "限時活動",
      badge: "進行中",
      description: "參加期間限定活動的排行榜！在排行榜中取得高分，爭取高名次，獲得限定活動的各項獎勵。",
      entryTitle: "活動入口",
      entryBody: "點擊主畫面右下角的活動 Icon，即可進入活動頁面。",
      howToTitle: "如何參與",
      howToItems: [
        "進入活動頁面。",
        "點擊該次活動的排行榜關卡。",
        "對敵人造成傷害累積分數，在排行榜上留下自己的名次。",
        "前三名*的玩家可以獲得該次活動的限定獎勵。",
      ],
      rewardTitle: "獎勵內容",
      rewardBody: "隨活動不同會有不同的獎勵，詳情請見當下活動說明。",
      note: "*實際可以獲得獎勵的名次以當下活動為準。活動說明與獎勵內容可能隨版本更新調整，請以遊戲內公告為準。",
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
          "於「Deck」頁面選擇 10 張寶石卡組成戰鬥牌組。",
          "進入「Battle」開始對局。每回合抽取 6 張撲克牌，並將寶石手牌補至 5 張；使用寶石調整撲克牌或強化 ATK、MULT 與生存能力。",
          "系統會計算場上成立的所有組合；各組合的 ATK 與 MULT 分別加總，套用寶石效果後，以 Total ATK × Total MULT 結算傷害。",
          "戰鬥勝利後可獲得寶石碎片，並於市場交易或升級牌組。",
        ],
      },
      coreMechanics: {
        title: "核心機制",
        heading: "組合計分",
        body: "同一手牌可以同時成立多種組合，所有成立的組合都會計分。",
      },
    },
    encyclopedia: {
      title: "基礎寶石（40 種）",
      hint: "點擊任意卡片查看名稱與效果。每種基礎寶石仍有三個升級階段（基礎／+1／+2）。",
      imageFailed: "圖片載入失敗",
      imageComingSoon: "卡圖準備中",
      eventCardTitle: "活動限定卡",
      eventCardHint: "僅於特定活動期間取得，不列入 40 種基礎寶石。",
      eventCardBadge: "活動限定",
    },
    cardDetail: {
      cardLabel: "CARD",
      effect: "卡牌效果",
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
    "1":   { name: "Flame Ruby",               effect: "如果手牌包含符文連鎖 III 以上，則攻擊 +75。" },
    "2":   { name: "Deep-Sea Sapphire",        effect: "如果手牌包含符文連鎖 III 以上，則倍數 +15。" },
    "3":   { name: "Heart of Jade",            effect: "將一張目標撲克牌的點數增加1。" },
    "4":   { name: "Topaz Light",              effect: "將一張目標撲克牌的點數減少1。" },
    "5":   { name: "Moonstone",                effect: "將本回合攻擊設定為250，然後倍數 +3。" },
    "6":   { name: "Amber Eye",                effect: "恢復20 HP。" },
    "7":   { name: "Coral Abyss",              effect: "如果手牌包含同色共鳴 III 以上，則攻擊 +60。" },
    "8":   { name: "Pearl Star",               effect: "如果手牌包含同色共鳴 III 以上，則倍數 +10。" },
    "9":   { name: "Smoky Quartz",             effect: "將場上所有紅心花色設定為黑桃。" },
    "10":  { name: "Amethyst Reverie",         effect: "將場上所有黑桃花色設定為梅花。" },
    "11":  { name: "Bloodstone Dragon Breath", effect: "將場上所有方塊花色設定為紅心。" },
    "12":  { name: "Frost Crystal",            effect: "將場上所有梅花花色設定為方塊。" },
    "13":  { name: "Thunder Agate",            effect: "如果手牌包含符文共鳴 II 以上，則攻擊 +40。" },
    "14":  { name: "Verdant Olivine",          effect: "如果手牌包含符文共鳴 II 以上，則倍數 +5。" },
    "15":  { name: "Fire Opal",                effect: "下回合：如果手牌包含符文共鳴 II 以上，則攻擊 +75。" },
    "16":  { name: "Obsidian Spear",           effect: "如果手牌包含符文共鳴 III 以上，則攻擊 +100。" },
    "17":  { name: "Aquamarine Tears",         effect: "如果手牌包含符文共鳴 III 以上，則倍數 +20。" },
    "18":  { name: "Imperial Emerald",         effect: "下回合：如果手牌包含符文共鳴 III 以上，則倍數 +30。" },
    "19":  { name: "Tiger Eye Fury",           effect: "攻擊 +15。" },
    "20":  { name: "Star Sapphire",            effect: "倍數 +4。" },
    "21":  { name: "Golden Sunstone",          effect: "如果手牌包含符文連鎖 III 以上，則本回合倍數 -10，下回合倍數 +30。" },
    "22":  { name: "Night Obsidian",           effect: "如果手牌包含符文連鎖 III 以上，則本回合倍數 ×2。" },
    "23":  { name: "Eternal Diamond",          effect: "如果手牌包含同色共鳴 III 以上，則攻擊永久 +15。" },
    "24":  { name: "Genesis Stone",            effect: "如果手牌包含同色共鳴 III 以上，則倍數永久 +2。" },
    "25":  { name: "Jade Ice Heart",           effect: "如果手牌包含同色共鳴 III 以上，則倍數 +2（持續3回合）。" },
    "26":  { name: "Red Spinel",               effect: "如果手牌包含同色共鳴 III 以上，則每回合恢復15 HP（持續3回合）。" },
    "27":  { name: "Citrine",                  effect: "如果手牌包含同色共鳴 III 以上，則接下來3回合每回合永久獲得攻擊 +10（持續3回合）。" },
    "28":  { name: "Pink Diamond Heart",       effect: "如果手牌包含同色共鳴 III 以上，則受到的傷害減少15%（持續3回合）。" },
    "29":  { name: "Black Tourmaline",         effect: "如果手牌包含符文連鎖 III 以上，則本回合攻擊 -25，下回合攻擊 +125。" },
    "30":  { name: "Kunzite",                  effect: "如果手牌包含符文連鎖 IV 以上，則倍數 +（6張撲克牌點數總和）。" },
    "31":  { name: "Sapphire Eye",             effect: "如果手牌包含符文連鎖 III 以上，則本回合攻擊 -25、倍數 +30。" },
    "32":  { name: "Imperial Topaz",           effect: "如果手牌包含符文共鳴 II 以上，則恢復50 HP。" },
    "33":  { name: "Morganite Kiss",           effect: "如果手牌包含符文連鎖 III 以上，則本回合倍數 -5，下回合倍數 +15。" },
    "34":  { name: "Tsavorite",                effect: "如果手牌包含符文連鎖 IV 以上，則本回合受到的傷害減少50%。" },
    "35":  { name: "Crimson Lattice",          effect: "如果手牌包含符文連鎖 III 以上，則本回合倍數 -5、攻擊 +100。" },
    "36":  { name: "Tanzanite Star",           effect: "如果手牌包含符文共鳴 III 以上，則本回合受到的傷害減少30%。" },
    "37":  { name: "Paraiba Tourmaline",       effect: "本回合攻擊 +150、倍數 -10。" },
    "38":  { name: "Alexandrite",              effect: "本回合倍數 +25、攻擊 -100。" },
    "39":  { name: "Dragon Breath Heart",      effect: "攻擊 +（6張撲克牌點數總和）。" },
    "40":  { name: "Genesis Void",             effect: "本回合受到的傷害減少15%。" },
    "41":  { name: "Aura Genesis",             effect: "如果手牌包含完美共鳴 II 以上，則本回合攻擊 +100、倍數 +20。" },
  },
}

export default zhTW
