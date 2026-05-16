import type { Translation } from "./zh-TW"

const en: Translation = {
  battle: {
    rewardToast: {
      title: "Rewards Claimed",
      empty: "No reward items",
      stamina: "Stamina",
    },
    rewardClaimFailed: "Reward claim failed: {{message}}",
  },
  floatingMenu: {
    openAriaLabel: "Open info menu",
  },
  infoMenu: {
    aria: {
      dragPanel: "Drag info panel",
      backToEncyclopedia: "Back to encyclopedia",
      collapse: "Collapse info menu",
      close: "Close",
      viewCardDetail: "View details of {{name}}",
      opacity: "Adjust panel opacity",
    },
    actions: {
      backToPreviousPage: "Back",
      opacity: "Opacity",
    },
    categories: {
      gameplay: "Gameplay",
      encyclopedia: "Gem Encyclopedia",
      rarity: "Rarity",
      shop: "Gem Shop",
    },
    gameplay: {
      whatIsAurayale: {
        title: "What is Aurayale",
        body: "Aurayale is an on-chain collectible card battle game built around gems. Collect, fuse, and trade gem cards to build your deck, then duel opponents in turn-based strategy battles.",
      },
      flow: {
        title: "Game Flow",
        items: [
          "Connect your wallet, sign in, and claim your starter deck.",
          "On the Deck page, pick 5 gems to form your battle deck.",
          "Enter Battle and play cards each turn to outmatch your opponent.",
          "Win matches to earn gem fragments and trade for deck upgrades.",
        ],
      },
      coreMechanics: {
        title: "Core Mechanics",
        items: [
          { t: "Attribute Counters", d: "Fire / Water / Wind / Earth / Light / Dark counter each other" },
          { t: "Upgrade System", d: "Fuse two same-color gems into a higher-tier card" },
          { t: "Rarity Tiers", d: "4C standard: Common / Rare / Epic / Legendary" },
          { t: "Gem Marketplace", d: "Trade gems directly with other players" },
        ],
      },
    },
    encyclopedia: {
      title: "Base Gems (24 Types)",
      hint: "Tap any card to see its details (name, effect, rarity). Every gem has three upgrade stages (base / +1 / +2).",
    },
    cardDetail: {
      cardLabel: "CARD",
      effect: "Card Effect",
      rarityExplanation: "Rarity",
      tier: "Tier",
      tierOfFour: "{{tier}} / 4",
    },
    rarity: {
      fourCTitle: "The 4C Standard for Gem Rarity",
      fourCIntro: "Aurayale adopts the real-world gem industry's 4C grading system to determine each card's rarity and market value.",
      levelsTitle: "Rarity Tiers",
      fourC: [
        {
          title: "Color",
          desc: "Purer hues and higher saturation drive greater value. Aurayale groups gems into cool (blue/green), warm (red/yellow), and neutral (white/black) palettes, each with its own rarity curve.",
        },
        {
          title: "Cut",
          desc: "The cut determines how light refracts and how a gem fires. The finer the cut, the more often its battle effects trigger.",
        },
        {
          title: "Clarity",
          desc: "Clarity measures how rare a gem's internal inclusions and surface flaws are. Higher clarity supports stronger enchantment tiers.",
        },
        {
          title: "Carat",
          desc: "Carat is the weight (size) of the gem. At equal quality, value grows geometrically with carat — but so does the energy required to wield it.",
        },
      ],
      descriptions: {
        common: "Entry-level gems easily obtained through pulls or daily quests. Great for beginner decks.",
        rare: "Rare-tier gems with stronger single-target effects, typically pulled from advanced packs.",
        epic: "Epic-tier gems carrying game-changing skills. Core picks for mid- to late-game decks.",
        legendary: "Legendary-tier gems — extremely rare, with unique battlefield-wide effects and dazzling visuals.",
      },
    },
    shop: {
      title: "Gem Shop",
      body: "The official gem shop is launching soon. You'll be able to spend in-game currency or on-chain tokens to buy limited gems, skins, and upgrade materials.",
      comingSoon: "Coming Soon",
      devNotice: "The shop is under development. Stay tuned.",
      eta: "ETA · 2026 Q3",
    },
  },
  cards: {
    "1":  { name: "Flame Ruby",          effect: "Deal 12 Fire damage to a single target and inflict Burn for 2 turns." },
    "2":  { name: "Deep-Sea Sapphire",   effect: "Slow the target by 20% for 2 turns. Deal +5 damage to frozen targets." },
    "3":  { name: "Heart of Jade",       effect: "Restore 10 HP to an ally and cleanse one debuff." },
    "4":  { name: "Topaz Light",         effect: "Deal 14 Lightning damage to a front-row target with a 25% chance to paralyze for 1 turn." },
    "5":  { name: "Moonstone",           effect: "Grant an ally an Invincibility shield for 1 turn (absorbs up to 20 damage)." },
    "6":  { name: "Amber Eye",           effect: "Remove all crowd control from allies and boost accuracy by 15%." },
    "7":  { name: "Coral Abyss",         effect: "Deal 8 Fire damage to all enemies." },
    "8":  { name: "Pearl Star",          effect: "Restore 6 HP to all allies and cleanse every debuff." },
    "9":  { name: "Smoky Quartz",        effect: "Boost ally attack by 20% for 3 turns." },
    "10": { name: "Amethyst Reverie",    effect: "Deal 13 Dark damage to a single target and steal 1 turn." },
    "11": { name: "Bloodstone Dragon Breath", effect: "Deal 22 Fire damage; heal yourself for 30% of the damage dealt." },
    "12": { name: "Frost Crystal",       effect: "Freeze the target for 1 turn; the next allied attack gains +30% damage." },
    "13": { name: "Thunder Agate",       effect: "Deal 16 Lightning damage to 3 random enemies and reduce their armor by 10%." },
    "14": { name: "Verdant Olivine",     effect: "Restore 18 HP to all allies and apply a Regen stack (+5 HP per turn)." },
    "15": { name: "Fire Opal",           effect: "Summon a flame veil that reflects 50% of the next incoming damage." },
    "16": { name: "Obsidian Spear",      effect: "Deal 25 Physical damage with +50% bonus to armored targets and knock back 1 tile." },
    "17": { name: "Aquamarine Tears",    effect: "Deal 12 Water damage to all enemies and reduce their attack by 15%." },
    "18": { name: "Imperial Emerald",    effect: "Grant an ally Invincibility for 2 turns and restore them to full HP." },
    "19": { name: "Tiger Eye Fury",      effect: "Deal 35 Physical damage; on kill, refund 1 Focus and reset cooldown." },
    "20": { name: "Star Sapphire",       effect: "Summon a meteor shower: deal 18 damage to a random enemy each turn for 3 turns." },
    "21": { name: "Golden Sunstone",     effect: "Grant all allies +40% crit rate for 3 turns." },
    "22": { name: "Night Obsidian",      effect: "Enter Stealth for 2 turns; attacks during Stealth always crit." },
    "23": { name: "Eternal Diamond",     effect: "Revive a fallen ally and grant them +100% attack for 2 turns." },
    "24": { name: "Genesis Stone",       effect: "Full cleanse: remove all status from every unit; gain 1 extra turn." },
    "25": { name: "Jade Ice Heart",      effect: "Deal 10 Ice damage to a single target and reduce its speed by 25% for 2 turns." },
    "26": { name: "Red Spinel",          effect: "Deal 13 Fire damage to a single target; always crit if the target is below 50% HP." },
    "27": { name: "Citrine",             effect: "Grant an ally an 8-point temporary shield for 2 turns." },
    "28": { name: "Pink Diamond Heart",  effect: "Restore 4 HP to all allies and boost defense by 10% for 2 turns." },
    "29": { name: "Black Tourmaline",    effect: "Reflect 30% of the next incoming damage back to the attacker." },
    "30": { name: "Kunzite",             effect: "Cleanse all debuffs and grant +15% resistance to all attributes for 1 turn." },
    "31": { name: "Sapphire Eye",        effect: "Deal 14 Water damage to 2 random enemies with a 30% chance to freeze." },
    "32": { name: "Imperial Topaz",      effect: "Grant an ally +50% attack for 2 turns." },
    "33": { name: "Morganite Kiss",      effect: "Restore 12 HP to all allies and cleanse every debuff." },
    "34": { name: "Tsavorite",           effect: "Deal 10 Wind damage to all enemies and reduce their attack by 20% for 2 turns." },
    "35": { name: "Crimson Lattice",     effect: "Summon a crimson barrier that absorbs up to 30 incoming damage." },
    "36": { name: "Tanzanite Star",      effect: "Deal 30 Dark damage to a single target and stun it for the next turn." },
    "37": { name: "Paraiba Tourmaline",  effect: "Thunderstorm: deal 12 Lightning damage to all enemies each turn for 3 turns." },
    "38": { name: "Alexandrite",         effect: "Color shift: choose the most advantageous attribute on the field and deal 28 damage." },
    "39": { name: "Dragon Breath Heart", effect: "Ancient dragon's power: deal 25 Fire damage to all enemies; allies gain Invincibility for 2 turns." },
    "40": { name: "Genesis Void",        effect: "Spacetime freeze: enemies cannot act next turn; play 1 extra card this turn." },
  },
}

export default en
