export interface TutorialStep {
  id: number;
  chapterNumber: number;
  chapterTitle: string;
  title: string;
  description: string;
  targetId: string | null;
  rulebookPage: string;
  visualPhase?: 1 | 2 | 3;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ── CHAPTER 1: BEFORE YOU START ──────────────────────────────────────────
  {
    id: 1,
    chapterNumber: 1,
    chapterTitle: "Chapter 1: Before You Start",
    title: "Game Overview & Objective",
    description: "Modern Mint is a fast-paced business strategy adventure played over 9 rounds (Rulebook Page 2, 6). Your goal is to build companies, secure capital, negotiate deals, and achieve the highest Net Value by the end of Round 9.",
    targetId: "none",
    rulebookPage: "Page 2, 6",
    visualPhase: 1,
  },
  {
    id: 2,
    chapterNumber: 1,
    chapterTitle: "Chapter 1: Before You Start",
    title: "Players, Roles & Winners",
    description: "The game supports 2–6 players (Rulebook Page 2, 5). In 4–6 player games, 2 players act as Investors (funding deals) and others are Founders (building companies). In 2–3 player games, all players are Founders and 1 Dummy Investor deck is used. At the end of Round 9: 2–3 players have 1 Founder winner; 4–6 players have 2 winners (1 Founder + 1 Investor with highest Net Value, Page 7).",
    targetId: "tutorial-player-roster",
    rulebookPage: "Page 2, 5, 7",
    visualPhase: 1,
  },
  {
    id: 3,
    chapterNumber: 1,
    chapterTitle: "Chapter 1: Before You Start",
    title: "Starting Funds & Materials",
    description: "Each Founder receives a Player Mat, Founder Sheet, 4 Stage Cubes (L/R/G/S), and $500K in starting cash from the Bank (Rulebook Page 5). Investors receive an Investor Mat, Sheet, and cash ($2,000K before Round 1, plus additional funds before Rounds 4 and 7).",
    targetId: "tutorial-player-roster",
    rulebookPage: "Page 5",
    visualPhase: 1,
  },

  // ── CHAPTER 2: UNDERSTAND THE BOARD ──────────────────────────────────────
  {
    id: 4,
    chapterNumber: 2,
    chapterTitle: "Chapter 2: Understand the Board",
    title: "The Central Arena Board",
    description: "The center board features 9 startup companies in orbit (Wallet, Quick Commerce, Snacks, Restro-Chain, Contract Farming, Agri IoT, Smart Storage, Robo-Packaging, Traceability), the 9-round timeline track, Turn Order Track, and Action Point Tracker (Rulebook Page 3, 4).",
    targetId: "tutorial-game-board",
    rulebookPage: "Page 3, 4",
    visualPhase: 1,
  },
  {
    id: 5,
    chapterNumber: 2,
    chapterTitle: "Chapter 2: Understand the Board",
    title: "Stage Cubes, Team Tokens & Cards",
    description: "Founders track growth using colored Stage Cubes (L = Launch, R = Retain, G = Grow, S = Scale). Upgrading teams takes numbered Team Tokens (2, 3, 4) from the pool (Rulebook Page 10, 13). The board also houses Event Cards, Mentor Cards, Bankruptcy Card, and the Bank.",
    targetId: "tutorial-game-board",
    rulebookPage: "Page 3, 4, 10, 13",
    visualPhase: 1,
  },

  // ── CHAPTER 3: UNDERSTAND THE ROUND ──────────────────────────────────────
  {
    id: 6,
    chapterNumber: 3,
    chapterTitle: "Chapter 3: Understand the Round",
    title: "Three-Phase Round Structure",
    description: "Each round follows 3 sequential phases: Phase 1 (Fundraise — pitch, negotiate & take bank loans; skipped in Round 1, Rulebook Page 6, 8) → Phase 2 (Company Actions — launch, stage-up, upgrade team, PR, mentor cards, Page 6, 10) → Phase 3 (Revenue Roll — D10 roll, payouts, loan interest, turn order update, Page 7, 12).",
    targetId: "tutorial-game-board",
    rulebookPage: "Page 4, 5, 6, 7, 13",
    visualPhase: 1,
  },

  // ── CHAPTER 4: PHASE 1: FUNDRAISE ────────────────────────────────────────
  {
    id: 7,
    chapterNumber: 4,
    chapterTitle: "Chapter 4: Phase 1: Fundraise",
    title: "Pitching & Raising Capital",
    description: "During Phase 1 (Rounds 2–9), Founders pitch their business strategy to Investors to secure capital (Rulebook Page 6, 8). Investors listen to pitches, structure term proposals, and commit funds once deals are agreed upon.",
    targetId: "tutorial-action-bar",
    rulebookPage: "Page 6, 8",
    visualPhase: 1,
  },
  {
    id: 8,
    chapterNumber: 4,
    chapterTitle: "Chapter 4: Phase 1: Fundraise",
    title: "Bank Loans & Stage Limits",
    description: "Founders can take Bank Loans without spending Action Points. Loan flow: TAKE BANK LOAN → choose company → check available limit → enter amount → select multiple companies if needed → click FINALISE LOAN (Rulebook Page 8). Each company stage has a maximum loan limit. Multiple loans across different companies are allowed. Loan details are logged in the Action Tracker and Current Loan + Interest area.",
    targetId: "tutorial-action-bar",
    rulebookPage: "Page 8",
    visualPhase: 1,
  },

  // ── CHAPTER 5: DEAL TYPES ────────────────────────────────────────────────
  {
    id: 9,
    chapterNumber: 5,
    chapterTitle: "Chapter 5: Deal Types",
    title: "Five Deal Structures",
    description: "Investors and Founders can negotiate 5 deal structures (Rulebook Page 9): 1. Equity Deal (cash for % ownership), 2. Royalty / Revenue Sharing Deal (cash for % of round revenue), 3. Loan Deal (lending cash at predefined interest rate), 4. Hybrid Deal (Equity + Loan or Equity + Royalty), 5. Convertible Note (loan converting to equity at trigger stage).",
    targetId: "tutorial-action-bar",
    rulebookPage: "Page 9",
    visualPhase: 1,
  },
  {
    id: 10,
    chapterNumber: 5,
    chapterTitle: "Chapter 5: Deal Types",
    title: "Negotiating & Recording Deals",
    description: "Deal flow: OFFER A DEAL → choose target player(s) → discuss and negotiate terms (voice chat is available) → Deal Sheet appears → enter deal terms → press APPLY (Rulebook Page 8, 9). Both players immediately record the deal terms on their mats/sheets.",
    targetId: "tutorial-action-bar",
    rulebookPage: "Page 8, 9",
    visualPhase: 1,
  },

  // ── CHAPTER 6: PHASE 2: COMPANY ACTIONS ──────────────────────────────────
  {
    id: 11,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Phase 2: Company Actions",
    title: "Launch & Stage Up Companies",
    description: "In Phase 2, Founders perform company actions (1 Action Point each): 1. Launch Company (max 4 companies total, starts at Team Level 1, Rulebook Page 10), 2. Stage Up (advance L → R → G → S; max 1 stage-up per company per round, no skipping stages unless a card allows it).",
    targetId: "tutorial-action-bar",
    rulebookPage: "Page 6, 10",
    visualPhase: 2,
  },
  {
    id: 12,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Phase 2: Company Actions",
    title: "Team Upgrades & PR Services",
    description: "3. Upgrade Team (pay upgrade cost, take Team Token 2, 3, or 4 from pool to increase multiplier; max 1 upgrade per company per round, Rulebook Page 10), 4. PR Services (pay PR fee based on team level to double projected revenue next payout; max 1 PR per company per round, Page 11).",
    targetId: "tutorial-action-bar",
    rulebookPage: "Page 10, 11",
    visualPhase: 2,
  },
  {
    id: 13,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Phase 2: Company Actions",
    title: "Mentor Cards ($20K Fee)",
    description: "5. Mentor Card (pay $20K fee, draw 1 Mentor Card from central deck; 1 Action Point; max 1 Mentor action per round, Rulebook Page 11, 13). Cards are 'Play Now' (played immediately) or 'Play Anytime' (saved for tactical timing). Mentor Card text can override standard game rules!",
    targetId: "tutorial-card-area",
    rulebookPage: "Page 11, 13",
    visualPhase: 2,
  },

  // ── CHAPTER 7: ACTION POINTS AND TURN ORDER ─────────────────────────────
  {
    id: 14,
    chapterNumber: 7,
    chapterTitle: "Chapter 7: Action Points & Turn Order",
    title: "Action Point Costs",
    description: "Every company action (Launch, Stage Up, Team Upgrade, PR Services, Mentor Card) costs 1 Action Point. Bank loans and fundraising deals cost 0 Action Points (Rulebook Page 13). Each action advances your disc 1 space on the Action Point Tracker.",
    targetId: "tutorial-trackers",
    rulebookPage: "Page 6, 7, 13",
    visualPhase: 2,
  },
  {
    id: 15,
    chapterNumber: 7,
    chapterTitle: "Chapter 7: Action Points & Turn Order",
    title: "Calculating Future Turn Order",
    description: "At the end of each round, turn order for the next round is determined by the Action Point Tracker (Rulebook Page 4, 7). The player with the fewest Action Points goes FIRST, followed by the next lowest. In case of a tie, the player who went earlier in the previous round goes first.",
    targetId: "tutorial-trackers",
    rulebookPage: "Page 4, 7",
    visualPhase: 3,
  },

  // ── CHAPTER 8: PHASE 3: REVENUE ROLL ─────────────────────────────────────
  {
    id: 16,
    chapterNumber: 8,
    chapterTitle: "Chapter 8: Phase 3: Revenue Roll",
    title: "D10 Roll & Revenue Formula",
    description: "In Phase 3, Founders roll the D10 die once for all owned companies (Rulebook Page 7, 12). Formula: Actual Revenue = Projected Revenue × Multiplier (Page 21). Projected Revenue depends on your company's stage. Multiplier depends on your team level and D10 roll result.",
    targetId: "tutorial-player-info",
    rulebookPage: "Page 7, 12, 21",
    visualPhase: 3,
  },
  {
    id: 17,
    chapterNumber: 8,
    chapterTitle: "Chapter 8: Phase 3: Revenue Roll",
    title: "Revenue Sharing & Investor Payouts",
    description: "Revenue Divide: If two or more Founders are at the same stage of the same company, Projected Revenue is divided equally among them (Rulebook Page 12, 13). Investor Payouts: Investors never roll dice. If an Investor holds a royalty or loan deal, they collect their share immediately after that Founder's Revenue Roll.",
    targetId: "tutorial-player-info",
    rulebookPage: "Page 7, 12, 13",
    visualPhase: 3,
  },
  {
    id: 18,
    chapterNumber: 8,
    chapterTitle: "Chapter 8: Phase 3: Revenue Roll",
    title: "Payouts & Loan Interest",
    description: "If Actual Revenue is positive, collect cash from the Bank. If Actual Revenue is negative, pay the Bank (Rulebook Page 12). Loan Interest: Founders must pay 10% interest on outstanding bank loans during Phase 3 of each subsequent round (Page 8, 21).",
    targetId: "tutorial-player-info",
    rulebookPage: "Page 7, 8, 12, 21",
    visualPhase: 3,
  },

  // ── CHAPTER 9: BANKRUPT AND SECOND CHANCE ───────────────────────────────
  {
    id: 19,
    chapterNumber: 9,
    chapterTitle: "Chapter 9: Bankruptcy & Second Chance",
    title: "Second Chance Rerolls",
    description: "Second Chance represents help from friends and family — two one-time re-roll lifelines per game (Rulebook Page 12). If your revenue roll results in a loss, you can use a Second Chance to reroll the D10 die and keep the better result.",
    targetId: "tutorial-game-board",
    rulebookPage: "Page 12",
    visualPhase: 3,
  },
  {
    id: 20,
    chapterNumber: 9,
    chapterTitle: "Chapter 9: Bankruptcy & Second Chance",
    title: "Bankruptcy Action Plan",
    description: "If unable to cover losses during Phase 3 and Second Chance is unavailable/declined, play the Bankruptcy Card (Rulebook Page 12): 1. Crack a Deal (negotiate a bailout with rivals), 2. Sell a Company (receive launch + stage upgrade costs minus loan), 3. Take Survival Bank Loan (30% interest per round, up to 2x shortfall), 4. Restart (lose all companies & cash, get $500K to rebuild).",
    targetId: "tutorial-game-board",
    rulebookPage: "Page 12",
    visualPhase: 3,
  },

  // ── CHAPTER 10: EVENT CARDS, MENTOR CARDS AND SPECIAL EFFECTS ────────────
  {
    id: 21,
    chapterNumber: 10,
    chapterTitle: "Chapter 10: Event & Mentor Cards",
    title: "Event Cards (3-Round Impact)",
    description: "After every 3rd round (Rounds 3, 6, 9), flip an Event Card from the main board (Rulebook Page 4, 7, 13). Event Cards represent market shifts (e.g. PR discounts, Bear Market 15% interest, Tech Boom) affecting all players for the next 3 rounds.",
    targetId: "tutorial-card-area",
    rulebookPage: "Page 4, 7, 13",
    visualPhase: 1,
  },
  {
    id: 22,
    chapterNumber: 10,
    chapterTitle: "Chapter 10: Event & Mentor Cards",
    title: "Mentor Card Timing & Overrides",
    description: "Mentor Cards are green (positive) or red (negative) (Rulebook Page 11, 13). Play Now cards trigger immediately; Play Anytime cards can be held for tactical timing. Rule Priority: Mentor Card text can override standard game rules — always follow the exact text on the card!",
    targetId: "tutorial-card-area",
    rulebookPage: "Page 11, 13",
    visualPhase: 2,
  },

  // ── CHAPTER 11: WINNING THE GAME ─────────────────────────────────────────
  {
    id: 23,
    chapterNumber: 11,
    chapterTitle: "Chapter 11: Winning the Game",
    title: "Net Value Formula",
    description: "The game ends after Round 9. Players calculate Net Value (Rulebook Page 6, 7, 21). Exact Formula: Net Value = (Equity % × Company Valuation) + Cash in Hand - (Outstanding Loan + Interest). Make sure to subtract your outstanding loan and interest!",
    targetId: "tutorial-player-info",
    rulebookPage: "Page 6, 7, 21",
    visualPhase: 1,
  },
  {
    id: 24,
    chapterNumber: 11,
    chapterTitle: "Chapter 11: Winning the Game",
    title: "Declaring Winners",
    description: "Winner Determination: In 2–3 player games, 1 winner is declared (the Founder with the highest Net Value). In 4–6 player games, 2 winners are declared (1 Founder and 1 Investor with the highest Net Value in their respective role, Rulebook Page 7, 21).",
    targetId: "tutorial-player-roster",
    rulebookPage: "Page 6, 7, 21",
    visualPhase: 1,
  },

  // ── CHAPTER 12: QUICK MODE AND COMPLETION ───────────────────────────────
  {
    id: 25,
    chapterNumber: 12,
    chapterTitle: "Chapter 12: Quick Mode & Completion",
    title: "Quick Mode & Completion",
    description: "Quick Mode is an alternate faster variant for beginners (Rulebook Page 21): 6 rounds only; turn order is clockwise (no AP tracking); revenue sharing is ignored (100% revenue to each Founder); 1 Event Card revealed after Round 3. You have completed the Modern Mint beginner tutorial! In a real game, players finish their Phase 1 decisions and use LOCK THE DEAL only when they are ready to end the fundraising phase. Do not press it during this tutorial. Close the tutorial when you are ready to play normally.",
    targetId: "none",
    rulebookPage: "Page 21",
    visualPhase: 1,
  },
];

export interface MockPlayer {
  id: string;
  name: string;
  color: string;
  role: string;
  capital: number;
  loan: number;
  cash: number;
  valuation: number;
  actionCount: number;
  isLocal?: boolean;
  avatarId?: number;
  ownedCompanies?: Array<{ name: string; stage: number; team: string }>;
}

export const MOCK_TUTORIAL_PLAYERS: MockPlayer[] = [
  {
    id: "p1",
    name: "Commander",
    color: "#55ffb0",
    role: "Founder",
    capital: 500,
    loan: 0,
    cash: 500,
    valuation: 1500,
    actionCount: 3,
    isLocal: true,
    avatarId: 1,
    ownedCompanies: [
      { name: "Wallet", stage: 1, team: "RN" },
      { name: "Snacks", stage: 0, team: "RN" }
    ]
  },
  {
    id: "p2",
    name: "Alpha Bot",
    color: "#ef4444",
    role: "Founder",
    capital: 500,
    loan: 0,
    cash: 500,
    valuation: 1000,
    actionCount: 2,
    avatarId: 2,
    ownedCompanies: [
      { name: "Agri IoT", stage: 0, team: "GT" }
    ]
  },
  {
    id: "p3",
    name: "Delta Bot",
    color: "#d4af37",
    role: "Investor",
    capital: 2000,
    loan: 0,
    cash: 2000,
    valuation: 2000,
    actionCount: 1,
    avatarId: 3,
    ownedCompanies: []
  },
  {
    id: "p4",
    name: "Omega Bot",
    color: "#00e1ff",
    role: "Founder",
    capital: 500,
    loan: 0,
    cash: 500,
    valuation: 1200,
    actionCount: 4,
    avatarId: 4,
    ownedCompanies: [
      { name: "Smart Storage", stage: 0, team: "GD" }
    ]
  }
];
