import { Server as SocketServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { generateMentorDeck, MentorCard } from "./mentorCardsData";
import { generateEventDeck, EventCard } from "./eventCardsData";


// In-memory game rooms dictionary
const rooms: Record<string, any> = {};

const MULTIPLIER_TABLE: Record<number, number[]> = {
  1:  [-2, -3, -4,  0],
  2:  [-2, -2, -2, -1],
  3:  [-1, -1,  0,  1],
  4:  [-1,  0,  1,  2],
  5:  [ 0,  0,  1,  2],
  6:  [ 0,  1,  2,  3],
  7:  [ 1,  1,  2,  3],
  8:  [ 1,  2,  3,  4],
  9:  [ 2,  2,  3,  4],
  10: [ 2,  2,  4,  5]
};

const COMPANY_DATA_MAP: Record<string, number[][]> = {
  'CONTRACT FARMING': [[10,100,500,0], [100,200,1000,20], [1000,1000,2500,200], [2000,2000,10000,400]],
  'AGRI IoT': [[100,10,1000,0], [500,300,3000,300], [1500,1500,6000,2000], [8000,8000,36000,7000]],
  'WALLET': [[50,10,1000,0], [1200,400,3000,400], [1500,2000,8000,1800], [7000,10000,36000,5000]],
  'SNACKS': [[10,20,1000,0], [300,200,1500,200], [1000,1100,7500,1500], [6000,4000,32000,8000]],
  'QUICK COMMERCE': [[10,30,100,0], [200,400,2500,100], [2000,1200,10000,800], [10000,4000,50000,6000]],
  'SMART STORAGE': [[200,200,2000,200], [3000,1600,5000,2000], [3000,5400,9000,4000], [10000,7500,40000,12000]],
  'RESTRO - CHAIN': [[150, 300, 1000, 200], [300, 400, 2000, 500], [1200, 1400, 4000, 2000], [12000, 8000, 26000, 15000]],
  'TRACEABILITY': [[30,30,300,0], [300,200,2000,200], [1200,2000,7500,1000], [10000,8000,38000,5000]],
  'ROBO - PACKAGING': [[100,150,1500,200], [1200,500,4000,1000], [5000,2500,15000,2000], [4000,9000,45000,8000]]
};

const getStageIndex = (stage: string | number): number => {
  if (stage === 'L' || stage === 0) return 0;
  if (stage === 'R' || stage === 1) return 1;
  if (stage === 'G' || stage === 2) return 2;
  if (stage === 'S' || stage === 3) return 3;
  return 0;
};

const computeTotalRevenue = (player: any, room: any, roll: number): number => {
  let total = 0;
  player.ownedCompanies.forEach((pCompany: any) => {
     let sharingPlayers = 0;
     room.players.forEach((otherP: any) => {
        const theirComp = otherP.ownedCompanies.find((c: any) => c.name === pCompany.name);
        if (theirComp && getStageIndex(theirComp.stage) === getStageIndex(pCompany.stage)) {
          sharingPlayers += 1;
        }
     });

     const dataRow = COMPANY_DATA_MAP[pCompany.name];
     if (!dataRow) return;
     const stageIndex = getStageIndex(pCompany.stage);
     const baseRev = dataRow[stageIndex][1];

     const teamIndex = (pCompany.team === 'RN' || player.color === '#ef4444') ? 0 :
                        (pCompany.team === 'GT' || player.color === '#55ffb0') ? 1 :
                        (pCompany.team === 'GD' || player.color === '#d4af37') ? 2 : 3;

     const currentRoll = roll || 2;
     let finalMulti = MULTIPLIER_TABLE[currentRoll]?.[teamIndex] ?? 1;

     if (player.mentorMultiplier) {
       finalMulti += player.mentorMultiplier;
     }

     const dividedRev = sharingPlayers > 1 ? Math.floor(baseRev / 2) : baseRev;
     let actualRevenue = dividedRev * finalMulti;

     if (pCompany.doubleRevenueRound === room.round) {
       actualRevenue *= 2;
     }
     if (pCompany.techBoostRound === room.round) {
       actualRevenue += 50;
     }
     if (player.riskMultiplierActive === room.round) {
       if (roll >= 5) {
         actualRevenue *= 2;
       } else if (roll <= 2) {
         actualRevenue = Math.floor(actualRevenue / 2);
       }
     }
     total += actualRevenue;
  });
  return total;
};

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

const createEmptyRoom = () => {
  const eventDeck = shuffle(generateEventDeck());
  return {
    players: [] as any[],
    deals: [] as any[],
    royaltyAgreements: [] as any[],
    mentorDeck: shuffle(generateMentorDeck()),
    eventDeck: eventDeck,
    activeEvent: eventDeck.shift() as EventCard | undefined,
    capital: 100,
    globalLoan: 10,
    actionCount: 0,
    dealCount: 0,
    phase: 2,
    round: 1,
    turn: 'All',
    phase2TurnIndex: 0
  };
};

export function setupSocket(server: HttpServer): SocketServer {

  const allowedOrigins = (process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const io = new SocketServer(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin) {
        callback(null, true);
        return;
      }

      // Local development
      const isLocal =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:");

      // Vercel deployments
      const isVercel =
        origin.endsWith(".vercel.app");

      // Explicitly configured frontend URLs
      const isAllowed =
        allowedOrigins.includes(origin);

      if (isLocal || isVercel || isAllowed) {
        callback(null, true);
        return;
      }

      callback(new Error(`Socket.IO CORS blocked: ${origin}`));
    },

    methods: ["GET", "POST"],

    credentials: true,
  },
});

  const applyMentorCardEffect = (player: any, room: any, card: MentorCard, targetPlayerId: string, companyName: string, socket?: Socket) => {
    const effect = card.effectType;
    let success = true;

    switch (effect) {
      case 'free_stage_up': {
        const comp = player.ownedCompanies.find((c: any) => c.name.toUpperCase() === companyName.toUpperCase());
        if (comp) {
          const currentIndex = getStageIndex(comp.stage);
          if (currentIndex < 3) {
            comp.stage = ['L', 'R', 'G', 'S'][currentIndex + 1];
            player.valuation += (comp.valuation / 1000);
            player.capital += comp.valuation / 1000;
            io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name}'s ${comp.name} advanced to Stage ${comp.stage} for free!`);
          } else {
            success = false;
            if (socket) socket.emit('notification', 'Company is already at maximum stage.');
          }
        } else {
          success = false;
          if (socket) socket.emit('notification', 'Company not found.');
        }
        break;
      }
      case 'add_multiplier': {
        player.mentorMultiplier = 1;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} gets +1 on company multiplier next roll!`);
        break;
      }
      case 'add_multiplier_2': {
        player.mentorMultiplier = 2;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} gets +2 on company multiplier next roll!`);
        break;
      }
      case 'free_stage_or_cash': {
        // default to 10k cash
        player.cash += 10;
        player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} claimed $10K cash option!`);
        break;
      }
      case 'free_pr': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} gets free PR for ${companyName}!`);
        break;
      }
      case 'free_workforce': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} gets free workforce upgrades this round!`);
        break;
      }
      case 'shield_event': {
        player.eventShieldActive = true;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} gained an Event Shield!`);
        break;
      }
      case 'peek_events': {
        const topTwo = room.eventDeck.slice(0, 2);
        if (socket) {
          socket.emit('notification', `PEEK EVENTS: Next is ${topTwo.map((e: any) => e.name).join(' & ')}`);
        }
        break;
      }
      case 'peek_event_1': {
        const topOne = room.eventDeck[0];
        if (socket) {
          socket.emit('notification', `PEEK EVENT: Next is ${topOne ? topOne.name : 'None'}`);
        }
        break;
      }
      case 'draw_two_cards': {
        const cardsDrawn = [room.mentorDeck.shift(), room.mentorDeck.shift()].filter(Boolean);
        player.mentorCards.push(...cardsDrawn);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} drew 2 Mentor cards!`);
        break;
      }
      case 'risk_multiplier': {
        player.riskMultiplierActive = room.round;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} activated Risk Multiplier for this round!`);
        break;
      }
      case 'quick_launch_retain': {
        const compTemplate = { name: "CONTRACT FARM", icon: "🌾", invest: 50, revenue: 80, valuation: 100, loan: 10 };
        const newComp = { ...compTemplate, stage: 'S', team: player.color === '#ef4444' ? 'RN' : 'GT' };
        player.ownedCompanies.push(newComp);
        player.cash -= 50;
        player.valuation += (newComp.valuation / 1000);
        player.capital += (newComp.valuation - newComp.loan) / 1000;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} quick-launched ${newComp.name} at Scale!`);
        break;
      }
      case 'extra_loan': {
        player.cash += 50;
        player.loan += 50;
        player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} borrowed extra $50K from the bank.`);
        break;
      }
      case 'extra_actions': {
        player.extraActions = 2;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} has 2 extra actions this round!`);
        break;
      }
      case 'force_dice_6': {
        player.currentPhase3Roll = 6;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} locked roll to 6!`);
        break;
      }
      case 'steal_cash': {
        room.players.forEach((p: any) => {
          if (p.id !== player.id) {
            p.cash = Math.max(0, p.cash - 5);
            p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000);
            player.cash += 5;
          }
        });
        player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} collected $5K from every player!`);
        break;
      }
      case 'half_cost_stage_up': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} got half cost stage up!`);
        break;
      }
      case 'double_revenue': {
        const comp = player.ownedCompanies.find((c: any) => c.name.toUpperCase() === companyName.toUpperCase());
        if (comp) {
          comp.doubleRevenueRound = room.round;
          io.to(room.id).emit('notification', `MENTOR EFFECT: Double revenue set on ${comp.name}!`);
        } else {
          success = false;
        }
        break;
      }
      case 'half_cost_all_stages': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: Half upgrades cost set for ${companyName}!`);
        break;
      }
      case 'tech_revenue_boost': {
        const comp = player.ownedCompanies.find((c: any) => c.name.toUpperCase() === companyName.toUpperCase());
        if (comp) {
          comp.techBoostRound = room.round;
          io.to(room.id).emit('notification', `MENTOR EFFECT: Tech boost +$50K set on ${comp.name}!`);
        } else {
          success = false;
        }
        break;
      }
      case 'discard_all_mentors': {
        room.players.forEach((p: any) => {
          p.mentorCards = [];
        });
        io.to(room.id).emit('notification', `MENTOR EFFECT: ALL PLAYERS DISCARDED MENTOR CARDS!`);
        break;
      }
      case 'skip_rival_turn': {
        const target = room.players.find((p: any) => p.id === targetPlayerId);
        if (target) {
          target.isLocked = true;
          io.to(room.id).emit('notification', `MENTOR EFFECT: ${target.name}'s turn was skipped!`);
        } else {
          success = false;
        }
        break;
      }
      case 'reduce_tax': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: Tax reduced by 50% for ${companyName}!`);
        break;
      }
      case 'free_tech_invest': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: Free tech investment unlocked!`);
        break;
      }
      case 'mutual_draw': {
        const target = room.players.find((p: any) => p.id === targetPlayerId);
        if (target) {
          const card1 = room.mentorDeck.shift();
          const card2 = room.mentorDeck.shift();
          if (card1) player.mentorCards.push(card1);
          if (card2) target.mentorCards.push(card2);
          io.to(room.id).emit('notification', `MENTOR EFFECT: Both ${player.name} & ${target.name} drew 1 card!`);
        } else {
          success = false;
        }
        break;
      }
      case 'halve_rival_cash': {
        const target = room.players.find((p: any) => p.id === targetPlayerId);
        if (target) {
          target.cash = Math.floor(target.cash / 2);
          target.capital = (target.cash / 1000) + target.valuation - (target.loan / 1000);
          io.to(room.id).emit('notification', `MENTOR EFFECT: ${target.name}'s cash was halved!`);
        } else {
          success = false;
        }
        break;
      }
      case 'auto_roll_6': {
        player.currentPhase3Roll = 6;
        io.to(room.id).emit('notification', `MENTOR EFFECT: Roll auto-set to 6!`);
        break;
      }
      case 'cash_from_total_loans': {
        let totalLoans = 0;
        room.players.forEach((p: any) => {
          totalLoans += p.loan;
        });
        const bonus = Math.round(totalLoans * 0.20);
        player.cash += bonus;
        player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} received $${bonus}K from total loan volume!`);
        break;
      }
      case 'end_game_valuation_boost': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: Valuation boost set for ${companyName} at game end!`);
        break;
      }
      case 'sell_company_half_price': {
        const comp = player.ownedCompanies.find((c: any) => c.name.toUpperCase() === companyName.toUpperCase());
        if (comp) {
          player.ownedCompanies = player.ownedCompanies.filter((c: any) => c.name !== comp.name);
          const refund = Math.floor(comp.valuation / 2);
          player.cash += refund;
          player.valuation -= (comp.valuation / 1000);
          player.loan -= comp.loan;
          player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
          io.to(room.id).emit('notification', `MENTOR EFFECT: Sold ${comp.name} for $${refund}K.`);
        } else {
          success = false;
        }
        break;
      }
      case 'block_loans': {
        player.loansBlocked = true;
        io.to(room.id).emit('notification', `MENTOR EFFECT: Loans blocked for ${player.name}!`);
        break;
      }
      case 'lose_cash_20k': {
        player.cash = Math.max(0, player.cash - 20);
        player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} lost $20K cash.`);
        break;
      }
      case 'block_stage_up': {
        io.to(room.id).emit('notification', `MENTOR EFFECT: Upgrades blocked for ${companyName}!`);
        break;
      }
      case 'forced_sale': {
        const comp = player.ownedCompanies.find((c: any) => c.name.toUpperCase() === companyName.toUpperCase());
        if (comp) {
          player.ownedCompanies = player.ownedCompanies.filter((c: any) => c.name !== comp.name);
          const refund = Math.floor(comp.valuation / 2);
          player.cash += refund;
          player.valuation -= (comp.valuation / 1000);
          player.loan -= comp.loan;
          player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
          io.to(room.id).emit('notification', `MENTOR EFFECT: Forced sale of ${comp.name} completed.`);
        } else {
          success = false;
        }
        break;
      }
      case 'lose_action': {
        player.actionCount = Math.max(0, player.actionCount - 1);
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} has 1 less action!`);
        break;
      }
      case 'miss_turn': {
        player.isLocked = true;
        io.to(room.id).emit('notification', `MENTOR EFFECT: ${player.name} missed their turn!`);
        break;
      }
      default: {
        success = false;
        break;
      }
    }

    return success;
  };

  const resolveAIBankruptcyIfNeeded = (player: any, room: any, io: any, roomId: string) => {
    if (player.is_ai && player.cash < 0) {
      console.log(`[AI Bankruptcy] Resolving for ${player.name}`);
      while (player.cash < 0) {
        if (player.ownedCompanies.length > 0) {
          const comp = player.ownedCompanies.shift();
          let totalInvested = 0;
          const compStageIndex = getStageIndex(comp.stage);
          if (INVESTMENT_COST_DATA[comp.name]) {
             for (let stg = 0; stg <= compStageIndex; stg++) {
                totalInvested += INVESTMENT_COST_DATA[comp.name][stg];
             }
          } else {
             totalInvested = comp.invest || 50;
          }
          player.cash += totalInvested;
          player.valuation -= (comp.valuation / 1000);
          player.loan = Math.max(0, player.loan - comp.loan);
          player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
          io.to(roomId).emit('notification', `ASSET LIQUIDATION: ${player.name} sold ${comp.name} for $${totalInvested}K.`);
        } else {
          player.cash += 50;
          player.survivalLoan = (player.survivalLoan || 0) + 50;
          player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - (player.survivalLoan / 1000);
          io.to(roomId).emit('notification', `SURVIVAL LOAN: ${player.name} accepted a $50K survival loan.`);
        }
      }
      io.to(roomId).emit('notification', `BANKRUPTCY SOLVED: ${player.name} has resolved their shortfall.`);
    }
  };

  const addAIPlayers = (room: any) => {
    const humanPlayer = room.players[0];
    if (!humanPlayer) return;

    const names = ["Alpha Bot", "Delta Bot", "Omega Bot", "Sigma Bot"];
    const colors = ['#ef4444', '#55ffb0', '#d4af37', '#00e1ff'];
    const humanColor = humanPlayer.color;
    const humanRole = humanPlayer.role;

    const availableColors = colors.filter(c => c !== humanColor);
    const availableNames = names;

    let aiRoles: string[] = [];
    if (humanRole === 'Investor') {
      aiRoles = ['Founder', 'Founder', 'Founder'];
    } else {
      aiRoles = ['Founder', 'Founder', 'Investor'];
    }

    for (let i = 0; i < 3; i++) {
      const role = aiRoles[i];
      const color = availableColors[i % availableColors.length];
      const name = `${availableNames[i]} (${role})`;
      const startCash = role === 'Investor' ? 2000 : 500;
      const startCapital = startCash / 1000;
      
      room.players.push({
        id: 'ai_' + Math.random().toString(36).substring(2, 15),
        name: name,
        color: color,
        isLocked: false,
        ownedCompanies: [],
        capital: startCapital,
        loan: 0,
        survivalLoan: 0,
        lastRevenueClaimed: 0,
        cash: startCash,
        valuation: 0,
        actionCount: 0,
        avatarId: role === 'Investor' ? 5 : (i + 1),
        mentorCards: [],
        boughtMentorRound: 0,
        lifelines: 2,
        currentPhase3Roll: null,
        role: role,
        is_ai: true
      });
    }
  };

  const playAIPhase1 = (room: any, player: any, io: any, roomId: string) => {
    console.log(`[AI Phase 1] Running for ${player.name}`);
    let actualLoanGranted = 0;
    let companiesString = "";

    if (player.role?.toLowerCase() === 'founder' && player.ownedCompanies.length > 0) {
      const companyToLoan = player.ownedCompanies.find((c: any) => c.loanTakenStage !== c.stage);
      if (companyToLoan && player.cash < 20) {
        const dataRow = COMPANY_DATA_MAP[companyToLoan.name];
        if (dataRow) {
          const stageIndex = getStageIndex(companyToLoan.stage);
          const maxLoan = dataRow[stageIndex][3];
          if (maxLoan > 0) {
            companyToLoan.loanTakenStage = companyToLoan.stage;
            companyToLoan.loan = (companyToLoan.loan || 0) + maxLoan;
            actualLoanGranted = maxLoan;
            companiesString = companyToLoan.name;
          }
        }
      }
    }

    if (actualLoanGranted > 0) {
       player.cash += actualLoanGranted;
       player.loan += actualLoanGranted;
       player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
       io.to(roomId).emit('notification', `LOAN SUCCESS: ${player.name} borrowed $${actualLoanGranted}K against ${companiesString}.`);
    }

    player.isLocked = true;
    io.to(roomId).emit('notification', `${player.name.toUpperCase()} FINISHED ACTIONS IN PHASE 1.`);
    
    room.phase1TurnIndex = (room.phase1TurnIndex || 0) + 1;
    if (room.phase1TurnIndex >= room.players.length) {
       room.phase = 2;
       room.phase2TurnIndex = 0;
       room.players.forEach((p: any) => { p.isLocked = false; });
       const firstP = room.players[0];
       io.to(roomId).emit('notification', `PHASE 2 BEGINS: It is ${firstP ? firstP.name : 'Unknown'}'s turn.`);
    } else {
       const nextP = room.players[room.phase1TurnIndex];
       if (nextP) {
          io.to(roomId).emit('notification', `IT IS NOW ${nextP.name.toUpperCase()}'S TURN.`);
       }
    }
    io.to(roomId).emit('game_state_update', room);
    triggerAIIfNeeded(room, io, roomId);
  };

  const playAIPhase2 = (room: any, player: any, io: any, roomId: string) => {
    console.log(`[AI Phase 2] Running for ${player.name}`);
    
    if (player.role?.toLowerCase() === 'founder') {
      if (player.ownedCompanies.length < 2) {
        const templates = [
          'CONTRACT FARMING', 'AGRI IoT', 'WALLET', 'SNACKS', 'QUICK COMMERCE',
          'SMART STORAGE', 'RESTRO - CHAIN', 'TRACEABILITY', 'ROBO - PACKAGING'
        ];
        const unowned = templates.filter(name => !player.ownedCompanies.some((c: any) => c.name === name));
        if (unowned.length > 0) {
          const companyName = unowned[Math.floor(Math.random() * unowned.length)];
          const dataRow = COMPANY_DATA_MAP[companyName];
          if (dataRow) {
            const stage = 'L';
            const team = player.color === '#ef4444' ? 'RN' :
                         player.color === '#55ffb0' ? 'GT' :
                         player.color === '#d4af37' ? 'GD' : 'BL';
            
            const invest = dataRow[0][0];
            const revenue = dataRow[0][1];
            const valuation = dataRow[0][2];
            const loan = dataRow[0][3];

            const icons: Record<string, string> = {
              'CONTRACT FARMING': '🌾', 'AGRI IoT': '📡', 'WALLET': '👛', 'SNACKS': '🍿',
              'QUICK COMMERCE': '⚡', 'SMART STORAGE': '📦', 'RESTRO - CHAIN': '🍔',
              'TRACEABILITY': '🔍', 'ROBO - PACKAGING': '🤖'
            };

            const newCompany = {
              name: companyName,
              icon: icons[companyName] || '🏢',
              invest,
              revenue,
              valuation,
              loan,
              stage,
              team
            };
            
            player.ownedCompanies.push(newCompany);
            player.valuation += (newCompany.valuation / 1000);
            player.loan += newCompany.loan;
            player.cash -= newCompany.invest;
            player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
            
            room.actionCount += 1;
            player.actionCount = (player.actionCount || 0) + 1;
            
            io.to(roomId).emit('notification', `${player.name.toUpperCase()} LAUNCHED ${newCompany.name.toUpperCase()} (STAGE ${stage})`);
            io.to(roomId).emit('game_state_update', room);
          }
        }
      } else {
        const compToUpgrade = player.ownedCompanies.find((c: any) => getStageIndex(c.stage) < 3 && c.upgradedRound !== room.round);
        if (compToUpgrade) {
          const currentIndex = getStageIndex(compToUpgrade.stage);
          const dataRow = COMPANY_DATA_MAP[compToUpgrade.name];
          if (dataRow) {
            const nextStageIndex = currentIndex + 1;
            const stageUpCost = dataRow[nextStageIndex][0];
            const nextValuation = dataRow[nextStageIndex][2];
            const nextLoan = dataRow[nextStageIndex][3];

            player.cash -= stageUpCost;
            compToUpgrade.stage = ['L', 'R', 'G', 'S'][nextStageIndex];
            compToUpgrade.upgradedRound = room.round;
            
            const oldValuation = compToUpgrade.valuation || 0;
            compToUpgrade.valuation = nextValuation;
            compToUpgrade.loan = nextLoan;

            player.valuation = player.valuation - (oldValuation / 1000) + (nextValuation / 1000);
            player.loan = player.loan - compToUpgrade.loan + nextLoan;
            player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);

            room.actionCount += 1;
            player.actionCount = (player.actionCount || 0) + 1;

            io.to(roomId).emit('notification', `${player.name.toUpperCase()} UPGRADED ${compToUpgrade.name.toUpperCase()} TO STAGE ${compToUpgrade.stage}`);
            io.to(roomId).emit('game_state_update', room);
          }
        }
      }
    } else {
      if (player.boughtMentorRound !== room.round) {
         player.cash -= 20;
         player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
         player.boughtMentorRound = room.round;
         const card = room.mentorDeck.shift();
         if (card) {
            if (card.type === 'PLAY NOW') {
               applyMentorCardEffect(player, room, card, '', '');
               io.to(roomId).emit('notification', `${player.name.toUpperCase()} PLAYED NOW: ${card.name.toUpperCase()}`);
            } else {
               player.mentorCards.push(card);
               io.to(roomId).emit('notification', `${player.name.toUpperCase()} BOUGHT AND STORED: ${card.name.toUpperCase()}`);
            }
         }
         io.to(roomId).emit('game_state_update', room);
      }
    }

    player.isLocked = true;
    room.phase2TurnIndex = (room.phase2TurnIndex || 0) + 1;
    
    if (room.phase2TurnIndex >= room.players.length) {
       room.phase = 3;
       room.phase3TurnIndex = 0;
       room.players.forEach((p: any) => {
         p.isLocked = false;
         if (p.loan > 0) {
            const interestRate = room.activeEvent?.effect === 'loan_interest_15' ? 0.15 : 0.10;
            const interest = Math.round(p.loan * interestRate);
            p.cash -= interest;
            p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000) - ((p.survivalLoan || 0) / 1000);
            if (p.is_ai) {
               resolveAIBankruptcyIfNeeded(p, room, io, roomId);
            }
            io.to(p.id).emit('notification', `PHASE 3 START: Paid $${interest}K (10%) interest on your $${p.loan}K loan.`);
         }
         if (p.survivalLoan > 0) {
            const sInterest = Math.round(p.survivalLoan * 0.30);
            p.cash -= sInterest;
            p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000) - ((p.survivalLoan || 0) / 1000);
            if (p.is_ai) {
               resolveAIBankruptcyIfNeeded(p, room, io, roomId);
            }
            io.to(p.id).emit('notification', `PHASE 3 START: Paid $${sInterest}K (30%) interest on your $${p.survivalLoan}K Survival Loan.`);
         }
       });
       io.to(roomId).emit('notification', 'PHASE 3: REVENUE GENERATION PHASE. IT IS TIME TO ROLL THE DICE!');
    } else {
       const nextP = room.players[room.phase2TurnIndex];
       if (nextP) {
          io.to(roomId).emit('notification', `IT IS NOW ${nextP.name.toUpperCase()}'S TURN.`);
       }
    }
    io.to(roomId).emit('game_state_update', room);
    triggerAIIfNeeded(room, io, roomId);
  };

  const playAIPhase3 = (room: any, player: any, io: any, roomId: string) => {
    console.log(`[AI Phase 3] Running for ${player.name}`);

    const roll = Math.floor(Math.random() * 10) + 1;
    player.currentPhase3Roll = roll;
    io.to(roomId).emit('notification', `${player.name.toUpperCase()} ROLLED A ${roll}!`);
    io.to(roomId).emit('initial_roll_result', { playerId: player.id, roll: roll });
    io.to(roomId).emit('game_state_update', room);

    setTimeout(() => {
       const currentRoom = rooms[roomId];
       if (!currentRoom) return;
       const currentPlayer = currentRoom.players.find((p: any) => p.id === player.id);
       if (!currentPlayer) return;

       let totalActualRevenue = 0;
       if (currentPlayer.role?.toLowerCase() === 'founder') {
         currentPlayer.ownedCompanies.forEach((pCompany: any) => {
            let sharingPlayers = 0;
            currentRoom.players.forEach((otherP: any) => {
               const theirComp = otherP.ownedCompanies.find((c: any) => c.name === pCompany.name);
               if (theirComp && getStageIndex(theirComp.stage) === getStageIndex(pCompany.stage)) {
                 sharingPlayers += 1;
               }
            });

            const dataRow = COMPANY_DATA_MAP[pCompany.name];
            if (dataRow) {
              const stageIndex = getStageIndex(pCompany.stage);
              const baseRev = dataRow[stageIndex][1];
              const teamIndex = currentPlayer.color === '#ef4444' ? 0 :
                                 currentPlayer.color === '#55ffb0' ? 1 :
                                 currentPlayer.color === '#d4af37' ? 2 : 3;

              let finalMulti = MULTIPLIER_TABLE[roll]?.[teamIndex] ?? 1;
              if (currentPlayer.mentorMultiplier) {
                finalMulti += currentPlayer.mentorMultiplier;
              }

              const dividedRev = sharingPlayers > 1 ? Math.floor(baseRev / 2) : baseRev;
              let actualRevenue = dividedRev * finalMulti;

              if (pCompany.doubleRevenueRound === currentRoom.round) {
                actualRevenue *= 2;
              }
              if (pCompany.techBoostRound === currentRoom.round) {
                actualRevenue += 50;
              }
              totalActualRevenue += actualRevenue;
            }
         });
       }

       currentPlayer.lastRevenueClaimed = totalActualRevenue;
       currentPlayer.cash += totalActualRevenue;
       currentPlayer.capital = (currentPlayer.cash / 1000) + currentPlayer.valuation - (currentPlayer.loan / 1000) - ((currentPlayer.survivalLoan || 0) / 1000);
       currentPlayer.hasClaimedRevenue = true;
       currentPlayer.isLocked = true;
       currentRoom.phase3TurnIndex = (currentRoom.phase3TurnIndex || 0) + 1;

       io.to(roomId).emit('notification', `${currentPlayer.name.toUpperCase()} CLAIMED $${totalActualRevenue}K REVENUE ON DICE ROLL ${roll}.`);
       resolveAIBankruptcyIfNeeded(currentPlayer, currentRoom, io, roomId);
       io.to(roomId).emit('game_state_update', currentRoom);

       const phase3Founders = currentRoom.players.filter((p: any) => p.role?.toLowerCase() === 'founder');
       const allClaimed = phase3Founders.every((p: any) => p.hasClaimedRevenue);
       
       if (allClaimed) {
          setTimeout(() => {
            currentRoom.round += 1;
            currentRoom.phase = 1;
            currentRoom.actionCount = 0;
            currentRoom.dealCount = 0;
            currentRoom.phase1TurnIndex = 0;
            currentRoom.phase2TurnIndex = 0;
            currentRoom.phase3TurnIndex = 0;

            currentRoom.players.forEach((p: any) => {
              p.isLocked = false;
              p.hasClaimedRevenue = false;
              p.currentPhase3Roll = null;
              p.mentorMultiplier = 0;
              p.riskMultiplierActive = 0;
              p.extraActions = 0;
            });

            const firstPlayer = currentRoom.players[0];
            io.to(roomId).emit('notification', `PHASE 1 BEGINS: It is ${firstPlayer ? firstPlayer.name : 'Unknown'}'s turn.`);
            io.to(roomId).emit('game_state_update', currentRoom);
            
            triggerAIIfNeeded(currentRoom, io, roomId);
          }, 5000);
       } else {
          io.to(roomId).emit('game_state_update', currentRoom);
          triggerAIIfNeeded(currentRoom, io, roomId);
       }
    }, 1500);
  };

  

    const triggerAIIfNeeded = (room: any, io: any, roomId: string) => {
    let activePlayer: any = null;
    if (room.phase === 1) {
      activePlayer = room.players[room.phase1TurnIndex || 0];
    } else if (room.phase === 2) {
      activePlayer = room.players[room.phase2TurnIndex || 0];
    } else if (room.phase === 3) {
      const phase3Founders = room.players.filter((p: any) => p.role?.toLowerCase() === 'founder');
      activePlayer = phase3Founders[room.phase3TurnIndex || 0];
    }

    if (activePlayer && activePlayer.is_ai) {
      setTimeout(() => {
        const currentRoom = rooms[roomId];
        if (!currentRoom) return;
        let currentActive: any = null;
        if (currentRoom.phase === 1) {
          currentActive = currentRoom.players[currentRoom.phase1TurnIndex || 0];
        } else if (currentRoom.phase === 2) {
          currentActive = currentRoom.players[currentRoom.phase2TurnIndex || 0];
        } else if (currentRoom.phase === 3) {
          const currentPhase3Founders = currentRoom.players.filter((p: any) => p.role?.toLowerCase() === 'founder');
          currentActive = currentPhase3Founders[currentRoom.phase3TurnIndex || 0];
        }
        
        if (currentActive && currentActive.is_ai) {
          if (currentRoom.phase === 1 && !currentActive.isLocked) {
            playAIPhase1(currentRoom, currentActive, io, roomId);
          } else if (currentRoom.phase === 2 && !currentActive.isLocked) {
            playAIPhase2(currentRoom, currentActive, io, roomId);
          } else if (currentRoom.phase === 3 && !currentActive.hasClaimedRevenue) {
            playAIPhase3(currentRoom, currentActive, io, roomId);
          }
        }
      }, 2000);
    }
  };

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, username, role, avatarId }) => {
      console.log(`Socket ${socket.id} is attempting to join room ${roomId} as username: "${username}" with role: "${role}" and avatarId: ${avatarId}`);
      if (!rooms[roomId]) {
        rooms[roomId] = createEmptyRoom();
      }
      
      socket.join(roomId);
      const roomState = rooms[roomId];
      
      let finalRole = role ? (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) : 'Founder';
      if (finalRole === 'Investor') {
         const investorCount = roomState.players.filter((p: any) => p.role === 'Investor').length;
         if (investorCount >= 2) {
            finalRole = 'Founder';
            socket.emit('notification', 'Maximum 2 Investors reached. You have joined as a Founder.');
         }
      }
      
      const existingPlayer = username ? roomState.players.find((p: any) => p.name === username) : null;
      if (existingPlayer) {
        if (existingPlayer.id !== socket.id) {
          console.log(`Found existing player "${username}" with old socket ID ${existingPlayer.id}. Reconnecting to new socket ID ${socket.id}.`);
          const activeSocket = io.sockets.sockets.get(existingPlayer.id);
          if (activeSocket) {
            console.log(`Force-disconnecting old active socket ${existingPlayer.id} for "${username}".`);
            activeSocket.disconnect(true);
          }
          existingPlayer.id = socket.id;
          if (role && existingPlayer.role !== role) {
             existingPlayer.role = finalRole;
          }
        } else {
          console.log(`Socket ${socket.id} is already registered as "${username}".`);
        }
        if (avatarId) {
          existingPlayer.avatarId = avatarId;
        }
      } else {
        console.log(`Creating new player entry for "${username}" with socket ID ${socket.id} and avatarId ${avatarId}`);

        // Remove an AI bot if we are adding a human player and the room is full (>= 4 players)
        if (roomState.players.length >= 4) {
           const aiIndex = roomState.players.findIndex((p: any) => p.is_ai);
           if (aiIndex !== -1) {
              console.log(`Evicting AI bot ${roomState.players[aiIndex].name} to make room for human player ${username}`);
              roomState.players.splice(aiIndex, 1);
           }
        }

        const startCash = finalRole === 'Investor' ? 2000 : 500;
        const startCapital = startCash / 1000;
        roomState.players.push({
          id: socket.id,
          name: username || `Player ${roomState.players.length + 1}`,
          color: ['#ef4444', '#55ffb0', '#d4af37', '#00e1ff'][roomState.players.length % 4],
          isLocked: false,
          ownedCompanies: [],
          capital: startCapital,
          loan: 0,
          survivalLoan: 0,
          lastRevenueClaimed: 0,
          cash: startCash,
          valuation: 0,
          actionCount: 0,
          avatarId: avatarId || (finalRole === 'Investor' ? 5 : 1),
          mentorCards: [],
          boughtMentorRound: 0,
          lifelines: 2,
          currentPhase3Roll: null,
          role: finalRole
        });
        
        if (roomState.players.filter((p: any) => !p.is_ai).length === 1) {
          addAIPlayers(roomState);
        }

        if (roomState.round === 1) {
          shuffle(roomState.players);
        }
      }

      io.to(roomId).emit('game_state_update', roomState);
      
      if (roomState.round === 1) {
        setTimeout(() => {
          socket.emit('notification', 'ROUND 1: SKIPPING INVESTMENT PHASE. START BUILDING YOUR EMPIRE!');
        }, 1000);
      }
      
      if (roomState.phase === 3) {
        triggerAIIfNeeded(roomState, io, roomId);
      } else {
        triggerAIIfNeeded(roomState, io, roomId);
      }
    });

    socket.on('take_loan', ({ roomId, amount, loanBreakdown, companiesString }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player && loanBreakdown && Array.isArray(loanBreakdown)) {
          const activePlayer = room.players[room.phase1TurnIndex || 0];
          if (room.phase === 1 && (!activePlayer || activePlayer.id !== socket.id)) {
             socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
             return;
          }

          let actualLoanGranted = 0;
          
          loanBreakdown.forEach((req: any) => {
             const companyName = req.companyName;
             const comp = player.ownedCompanies.find((c: any) => c.name === companyName);
             if (comp && comp.loanTakenStage !== comp.stage) {
               actualLoanGranted += req.amount;
               comp.loanTakenStage = comp.stage;
               comp.loan = (comp.loan || 0) + req.amount; // Track specific company loan
             }
          });

          if (actualLoanGranted > 0) {
             player.cash += actualLoanGranted;
             player.loan += actualLoanGranted;
             player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
             
             room.actionCount += 1;
             player.actionCount = (player.actionCount || 0) + 1;
             
             io.to(roomId).emit('game_state_update', room);
             io.to(roomId).emit('notification', `LOAN SUCCESS: ${player.name} borrowed $${actualLoanGranted}K against ${companiesString}.`);
          } else {
             socket.emit('notification', 'LOAN REJECTED: You have already taken loans for the current stages of these companies.');
          }
        }
      }
    });

    socket.on('repay_loan', ({ roomId, amount }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player && amount > 0 && player.cash >= amount) {
          let remainingRepayment = amount;
          
          // Repay Survival Loan first (highest interest)
          if (player.survivalLoan > 0) {
            const payToSurvival = Math.min(player.survivalLoan, remainingRepayment);
            player.survivalLoan -= payToSurvival;
            remainingRepayment -= payToSurvival;
          }
          
          // Repay standard loan with remainder
          if (remainingRepayment > 0 && player.loan > 0) {
            const payToStandard = Math.min(player.loan, remainingRepayment);
          player.loan -= payToStandard;
          remainingRepayment -= payToStandard;
          }
          
          const totalRepaid = amount - remainingRepayment;
          if (totalRepaid > 0) {
            player.cash -= totalRepaid;
            player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
            io.to(roomId).emit('notification', `${player.name} repaid $${totalRepaid}K in loans.`);
            io.to(roomId).emit('game_state_update', room);
          }
        } else {
          socket.emit('notification', 'ACTION REJECTED: Insufficient cash or invalid amount.');
        }
      }
    });

    socket.on('transfer_cash', ({ roomId, targetPlayerId, amount }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const sender = room.players.find((p: any) => p.id === socket.id);
        const receiver = room.players.find((p: any) => p.id === targetPlayerId);
        if (sender && receiver && amount > 0) {
           sender.cash -= amount;
           receiver.cash += amount;
           
           sender.capital = (sender.cash / 1000) + sender.valuation - (sender.loan / 1000) - ((sender.survivalLoan || 0) / 1000);
           receiver.capital = (receiver.cash / 1000) + receiver.valuation - (receiver.loan / 1000) - ((receiver.survivalLoan || 0) / 1000);
           
           io.to(roomId).emit('notification', `${sender.name} transferred $${amount}K to ${receiver.name}.`);
           io.to(roomId).emit('game_state_update', room);
        }
      }
    });

    socket.on('force_next_phase', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const currentPhase = room.phase;
        room.phase = currentPhase < 3 ? currentPhase + 1 : 1;
        room.players.forEach((p: any) => p.isLocked = false);
        
        io.to(roomId).emit('notification', `ADMIN FORCED TRANSITION TO PHASE ${room.phase}`);
        io.to(roomId).emit('game_state_update', room);
        if (room.phase === 3) {
          triggerAIIfNeeded(room, io, roomId);
        } else {
          triggerAIIfNeeded(room, io, roomId);
        }
      }
    });

    socket.on('offer_deal', ({ roomId, targetPlayer, cash, loan }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const proposer = room.players.find((p: any) => p.id === socket.id);
        const partner = room.players.find((p: any) => p.name === targetPlayer);
        
        if (proposer && partner) {
           const newDeal = {
              id: `deal_${Date.now()}`,
              proposer: proposer.name,
              partner: partner.name,
              cash: Number(cash) || 0,
              loan: Number(loan) || 0,
              status: 'pending'
           };
           room.deals.push(newDeal);
           io.to(roomId).emit('game_state_update', room);
           io.to(roomId).emit('notification', `NEW DEAL SHEET: ${proposer.name} offered a deal to ${partner.name}.`);
        }
      }
    });

    socket.on('propose_royalty_deal', ({ roomId, proposerName, partnerName, cash, equity, loan, royalty, terms }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const proposer = room.players.find((p: any) => p.name === proposerName);
        const partner = room.players.find((p: any) => p.name === partnerName);

        if (proposer && partner) {
          const proposalId = `proposal_${Date.now()}`;
          const royaltyProposal = {
            id: proposalId,
            proposer: proposerName,
            partner: partnerName,
            cash: Number(cash) || 0,
            equity: Number(equity) || 0,
            loan: Number(loan) || 0,
            royalty: Number(royalty) || 0,
            terms: terms || '',
            proposerSigned: true,
            partnerSigned: false
          };

          const newDeal = {
            id: proposalId,
            proposer: proposerName,
            partner: partnerName,
            cash: Number(cash) || 0,
            equity: Number(equity) || 0,
            loan: Number(loan) || 0,
            royalty: Number(royalty) || 0,
            terms: terms || '',
            status: 'pending'
          };
          room.deals.push(newDeal);

          io.to(partner.id).emit('royalty_proposal_received', royaltyProposal);
          io.to(roomId).emit('game_state_update', room);
          io.to(roomId).emit('notification', `NEW DEAL SHEET: ${proposer.name} offered a deal to ${partner.name}.`);
        }
      }
    });

    socket.on('accept_royalty_deal', ({ roomId, proposal }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const proposer = room.players.find((p: any) => p.name === proposal.proposer);
        const partner = room.players.find((p: any) => p.name === proposal.partner);

        if (proposer && partner) {
          const dealCost = Number(proposal.cash) || 0;
          const loanAssumed = Number(proposal.loan) || 0;

          if (partner.cash < dealCost) {
            socket.emit('notification', 'INSUFFICIENT FUNDS: You do not have enough cash to accept this deal!');
            return;
          }

          partner.cash -= dealCost;
          proposer.cash += dealCost;

          proposer.loan = Math.max(0, proposer.loan - loanAssumed);
          partner.loan += loanAssumed;

          proposer.capital = (proposer.cash / 1000) + proposer.valuation - (proposer.loan / 1000) - ((proposer.survivalLoan || 0) / 1000);
          partner.capital = (partner.cash / 1000) + partner.valuation - (partner.loan / 1000) - ((partner.survivalLoan || 0) / 1000);

          room.royaltyAgreements.push({
            id: `agreement_${Date.now()}`,
            ...proposal,
            partnerSigned: true
          });

          const existingDeal = room.deals.find((d: any) => d.id === proposal.id);
          if (existingDeal) {
            existingDeal.status = 'accepted';
          }

          room.dealCount += 1;
          io.to(roomId).emit('game_state_update', room);
          io.to(roomId).emit('notification', `ROYALTY DEAL FORMALIZED: ${proposer.name} and ${partner.name} signed!`);
        }
      }
    });

    socket.on('reject_royalty_deal', ({ roomId, proposal }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const proposer = room.players.find((p: any) => p.name === proposal.proposer);
        
        const existingDeal = room.deals.find((d: any) => d.id === proposal.id);
        if (existingDeal) {
          existingDeal.status = 'rejected';
        }

        if (proposer) {
          io.to(proposer.id).emit('notification', `${proposal.partner} rejected your Royalty Deal proposal.`);
        }
        io.to(roomId).emit('game_state_update', room);
      }
    });

    socket.on('propose_royalty_agreement', ({ roomId, targetPlayerId, founderId, investorId, companyName, percentage }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const proposer = room.players.find((p: any) => p.id === socket.id);
        const targetPlayer = room.players.find((p: any) => p.id === targetPlayerId);
        if (proposer && targetPlayer) {
           io.to(targetPlayerId).emit('royalty_proposal_received', {
             proposerId: proposer.id,
             proposerName: proposer.name,
             founderId,
             investorId,
             companyName,
             percentage
           });
           socket.emit('notification', `Proposed ${percentage}% royalty deal to ${targetPlayer.name}`);
        }
      }
    });

    socket.on('accept_royalty_agreement', ({ roomId, proposerId, founderId, investorId, companyName, percentage }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const accepter = room.players.find((p: any) => p.id === socket.id);
        const proposer = room.players.find((p: any) => p.id === proposerId);
        if (accepter && proposer) {
           const exists = room.royaltyAgreements.find((a: any) => 
             a.founderId === founderId && a.investorId === investorId && a.companyName === companyName
           );
           
           if (!exists) {
              room.royaltyAgreements.push({
                founderId,
                investorId,
                companyName,
                percentage
              });
              const founder = room.players.find((p: any) => p.id === founderId);
              const investor = room.players.find((p: any) => p.id === investorId);
              if (founder && investor) {
                 io.to(roomId).emit('notification', `DEAL FINALIZED: ${investor.name} now has a ${percentage}% royalty on ${founder.name}'s ${companyName}`);
              }
              io.to(roomId).emit('game_state_update', room);
           }
        }
      }
    });

    socket.on('reject_royalty_agreement', ({ roomId, proposerId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const rejecter = room.players.find((p: any) => p.id === socket.id);
        if (rejecter && proposerId) {
           io.to(proposerId).emit('notification', `${rejecter.name} rejected your Royalty Deal proposal.`);
        }
      }
    });

    socket.on('claim_revenue', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        
        if (player) {
           const currentRoll = player.currentPhase3Roll || 2;
           let totalActualRevenue = 0;

           player.ownedCompanies.forEach((pCompany: any) => {
              let sharingPlayers = 0;
              room.players.forEach((otherP: any) => {
                 const theirComp = otherP.ownedCompanies.find((c: any) => c.name === pCompany.name);
                 if (theirComp && getStageIndex(theirComp.stage) === getStageIndex(pCompany.stage)) {
                   sharingPlayers += 1;
                 }
              });

              const dataRow = COMPANY_DATA_MAP[pCompany.name];
              if (!dataRow) return;
              const stageIndex = getStageIndex(pCompany.stage);
              const baseRev = dataRow[stageIndex][1];

              const teamIndex = (pCompany.team === 'RN' || player.color === '#ef4444') ? 0 :
                                 (pCompany.team === 'GT' || player.color === '#55ffb0') ? 1 :
                                 (pCompany.team === 'GD' || player.color === '#d4af37') ? 2 : 3;

              let finalMulti = MULTIPLIER_TABLE[currentRoll]?.[teamIndex] ?? 1;
              if (player.mentorMultiplier) {
                finalMulti += player.mentorMultiplier;
              }

              const dividedRev = sharingPlayers > 1 ? Math.floor(baseRev / 2) : baseRev;
              let actualRevenue = dividedRev * finalMulti;

              if (pCompany.doubleRevenueRound === room.round) {
                actualRevenue *= 2;
              }
              if (pCompany.techBoostRound === room.round) {
                actualRevenue += 50;
              }
              if (player.riskMultiplierActive === room.round) {
                if (currentRoll >= 5) {
                  actualRevenue *= 2;
                } else if (currentRoll <= 2) {
                  actualRevenue = Math.floor(actualRevenue / 2);
                }
              }
              totalActualRevenue += actualRevenue;
           });

           player.lastRevenueClaimed = totalActualRevenue;
           player.cash += totalActualRevenue;
           player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
           player.hasClaimedRevenue = true;
           player.isLocked = true;
           room.phase3TurnIndex = (room.phase3TurnIndex || 0) + 1;

           io.to(roomId).emit('game_state_update', room);
           io.to(roomId).emit('notification', `${player.name.toUpperCase()} CLAIMED $${totalActualRevenue}K REVENUE ON DICE ROLL ${currentRoll}.`);

           if (player.cash < 0) {
              const shortfall = Math.abs(player.cash);
              socket.emit('trigger_bankruptcy', { shortfall });
              io.to(roomId).emit('notification', `BANKRUPTCY ALERT: ${player.name} went bankrupt by -$${shortfall}K!`);
           }

           const phase3Founders = room.players.filter((p: any) => p.role?.toLowerCase() === 'founder');
           const allClaimed = phase3Founders.every((p: any) => p.hasClaimedRevenue);
           
           if (allClaimed) {
              setTimeout(() => {
                room.round += 1;
                room.phase = 1;
                room.actionCount = 0;
                room.dealCount = 0;
                room.phase1TurnIndex = 0;
                room.phase2TurnIndex = 0;
                room.phase3TurnIndex = 0;

                room.players.forEach((p: any) => {
                  p.isLocked = false;
                  p.hasClaimedRevenue = false;
                  p.currentPhase3Roll = null;
                  
                  // round resets for mentor modifiers
                  p.mentorMultiplier = 0;
                  p.riskMultiplierActive = 0;
                  p.extraActions = 0;
                });

                const firstPlayer = room.players[0];
                io.to(roomId).emit('notification', `PHASE 1 BEGINS: It is ${firstPlayer ? firstPlayer.name : 'Unknown'}'s turn.`);

                if (room.round === 4 || room.round === 7) {
                  room.activeEvent = room.eventDeck.shift();
                  if (room.activeEvent) {
                    io.to(roomId).emit('notification', `NEW EVENT CARD: ${room.activeEvent.name}`);
                  }
                  
                  const fundAmount = room.round === 4 ? 5000 : 10000;
                  room.players.forEach((p: any) => {
                     if (p.role === 'Investor') {
                        p.cash += fundAmount;
                        p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000);
                        io.to(roomId).emit('notification', `INVESTOR FUNDING: ${p.name} received $${fundAmount}K!`);
                     }
                  });
                }
                io.to(roomId).emit('game_state_update', room);
                triggerAIIfNeeded(room, io, roomId);
              }, 5000);
           } else {
              triggerAIIfNeeded(room, io, roomId);
           }
        }
      }
    });

    socket.on('phase2_action', ({ roomId, actionType, companyName, cost, teamColor, targetPlayerId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        
        if (player) {
           const activePlayer = room.players[room.phase2TurnIndex || 0];
           if (!activePlayer || activePlayer.id !== socket.id) {
              socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
              return;
           }

           if (actionType === 'launch') {
               const dataRow = COMPANY_DATA_MAP[companyName];
               if (dataRow) {
                  const stage = 'L';
                  const team = player.color === '#ef4444' ? 'RN' :
                               player.color === '#55ffb0' ? 'GT' :
                               player.color === '#d4af37' ? 'GD' : 'BL';
                  
                  const invest = dataRow[0][0];
                  const revenue = dataRow[0][1];
                  const valuation = dataRow[0][2];
                  const loan = dataRow[0][3];

                  const icons: Record<string, string> = {
                    'CONTRACT FARMING': '🌾',
                    'AGRI IoT': '📡',
                    'WALLET': '👛',
                    'SNACKS': '🍿',
                    'QUICK COMMERCE': '⚡',
                    'SMART STORAGE': '📦',
                    'RESTRO - CHAIN': '🍔',
                    'TRACEABILITY': '🔍',
                    'ROBO - PACKAGING': '🤖'
                  };

                  const newCompany = {
                    name: companyName,
                    icon: icons[companyName] || '🏢',
                    invest,
                    revenue,
                    valuation,
                    loan,
                    stage,
                    team
                  };
                  
                  player.ownedCompanies.push(newCompany);
                  player.valuation += (newCompany.valuation / 1000);
                  player.loan += newCompany.loan;
                  player.cash -= newCompany.invest;
                  player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
                  
                  room.actionCount += 1;
                  player.actionCount = (player.actionCount || 0) + 1;
                  
                  io.to(roomId).emit('game_state_update', room);
                  io.to(roomId).emit('notification', `${player.name.toUpperCase()} LAUNCHED ${newCompany.name.toUpperCase()} (STAGE ${stage})`);
               }
           } else if (actionType === 'stage_up') {
              const comp = player.ownedCompanies.find((c: any) => c.name === companyName);
              if (comp) {
                 if (comp.upgradedRound === room.round) {
                    socket.emit('notification', 'ACTION REJECTED: Company already staged up this round.');
                    return;
                 }
                 const currentIndex = getStageIndex(comp.stage);
                 if (currentIndex < 3) {
                    const dataRow = COMPANY_DATA_MAP[comp.name];
                    if (dataRow) {
                       const nextStageIndex = currentIndex + 1;
                       const stageUpCost = dataRow[nextStageIndex][0];
                       const nextValuation = dataRow[nextStageIndex][2];
                       const nextLoan = dataRow[nextStageIndex][3];

                       player.cash -= stageUpCost;
                       
                       comp.stage = ['L', 'R', 'G', 'S'][nextStageIndex];
                       comp.upgradedRound = room.round;
                       
                       const oldValuation = comp.valuation || 0;
                       comp.valuation = nextValuation;
                       comp.loan = nextLoan;

                       player.valuation = player.valuation - (oldValuation / 1000) + (nextValuation / 1000);
                       player.loan = player.loan - comp.loan + nextLoan;
                       player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);

                       room.actionCount += 1;
                       player.actionCount = (player.actionCount || 0) + 1;

                       io.to(roomId).emit('game_state_update', room);
                       io.to(roomId).emit('notification', `${player.name.toUpperCase()} UPGRADED ${comp.name.toUpperCase()} TO STAGE ${comp.stage}`);
                    }
                 } else {
                    socket.emit('notification', 'MAX STAGE REACHED: Company is already at maximum level.');
                 }
              }
            } else if (actionType === 'buy_pr') {
               const comp = player.ownedCompanies.find((c: any) => c.name === companyName);
               if (comp) {
                  if (comp.prBoughtRound === room.round) {
                     socket.emit('notification', 'ACTION REJECTED: Max 1 PR Service per company per round.');
                     return;
                  }
                  const prCosts = [100, 300, 500, 700];
                  let actualCost = prCosts[(comp.team || 1) - 1] || 100;
                  if (room.activeEvent?.effect === 'pr_discount_100') {
                     actualCost = Math.max(0, actualCost - 100);
                  }
                  
                  player.cash -= actualCost;
                  comp.prBoughtRound = room.round;
                  player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
                  
                  room.actionCount += 1;
                  player.actionCount = (player.actionCount || 0) + 1;
                  
                  io.to(roomId).emit('game_state_update', room);
                  io.to(roomId).emit('notification', `${player.name.toUpperCase()} BOUGHT PR SERVICES FOR ${comp.name.toUpperCase()}`);
               }
            } else if (actionType === 'upgrade_workforce') {
               const comp = player.ownedCompanies.find((c: any) => c.name === companyName);
               if (comp) {
                  if (comp.workforceUpgradedRound === room.round) {
                     socket.emit('notification', 'ACTION REJECTED: Max 1 Workforce Upgrade per company per round.');
                     return;
                  }
                  const currentIndex = getStageIndex(comp.stage);
                  const workforceCosts = [5, 10, 15, 20];
                  let actualCost = workforceCosts[currentIndex] || 5;
                  if (room.activeEvent?.effect === 'workforce_discount_half') {
                     actualCost = Math.round(actualCost / 2);
                  }
                  
                  player.cash -= actualCost;
                  comp.team = (comp.team || 1) + 1;
                  comp.workforceUpgradedRound = room.round;
                  player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
                  
                  room.actionCount += 1;
                  player.actionCount = (player.actionCount || 0) + 1;
                  
                  io.to(roomId).emit('game_state_update', room);
                  io.to(roomId).emit('notification', `${player.name.toUpperCase()} UPGRADED WORKFORCE FOR ${comp.name.toUpperCase()}`);
               }
            }
        }
      }
    });

    socket.on('lock_phase1', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        
        if (player) {
           player.isLocked = true;
           io.to(roomId).emit('game_state_update', room);
           io.to(roomId).emit('notification', `${player.name.toUpperCase()} FINISHED ACTIONS IN PHASE 1.`);

           const activePlayer = room.players[room.phase1TurnIndex || 0];
           if (activePlayer && activePlayer.id === socket.id) {
              room.phase1TurnIndex = (room.phase1TurnIndex || 0) + 1;
              
              if (room.phase1TurnIndex >= room.players.length) {
                 room.phase = 2;
                 room.phase2TurnIndex = 0;
                 
                 room.players.forEach((p: any) => {
                   p.isLocked = false;
                 });
                 
                 const firstP = room.players[0];
                 io.to(roomId).emit('notification', `PHASE 2 BEGINS: It is ${firstP ? firstP.name : 'Unknown'}'s turn.`);
              } else {
                 const nextP = room.players[room.phase1TurnIndex];
                 if (nextP) {
                    io.to(roomId).emit('notification', `IT IS NOW ${nextP.name.toUpperCase()}'S TURN.`);
                 }
              }
              io.to(roomId).emit('game_state_update', room);
              triggerAIIfNeeded(room, io, roomId);
           }
        }
      }
    });

    socket.on('end_phase2_turn', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        
        if (player) {
           player.isLocked = true;
           io.to(roomId).emit('game_state_update', room);

           const activePlayer = room.players[room.phase2TurnIndex || 0];
           if (activePlayer && activePlayer.id === socket.id) {
              room.phase2TurnIndex = (room.phase2TurnIndex || 0) + 1;
              
              if (room.phase2TurnIndex >= room.players.length) {
                 room.phase = 3;
                 room.phase3TurnIndex = 0;
                 
                 room.players.forEach((p: any) => {
                   p.isLocked = false;
                   
                   if (p.loan > 0) {
                      const interestRate = room.activeEvent?.effect === 'loan_interest_15' ? 0.15 : 0.10;
                       const interest = Math.round(p.loan * interestRate);
                      p.cash -= interest;
                      p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000) - ((p.survivalLoan || 0) / 1000);
                      if (p.is_ai) {
                         resolveAIBankruptcyIfNeeded(p, room, io, roomId);
                      }
                      io.to(p.id).emit('notification', `PHASE 3 START: Paid $${interest}K (${Math.round(interestRate * 100)}%) interest on your $${p.loan}K loan.`);
                   }
                   if (p.survivalLoan > 0) {
                      const sInterest = Math.round(p.survivalLoan * 0.30);
                      p.cash -= sInterest;
                      p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000) - ((p.survivalLoan || 0) / 1000);
                      if (p.is_ai) {
                         resolveAIBankruptcyIfNeeded(p, room, io, roomId);
                      }
                      io.to(p.id).emit('notification', `PHASE 3 START: Paid $${sInterest}K (30%) interest on your $${p.survivalLoan}K Survival Loan.`);
                   }
                 });
                 
                 io.to(roomId).emit('notification', 'PHASE 3: REVENUE GENERATION PHASE. IT IS TIME TO ROLL THE DICE!');
              } else {
                 const nextP = room.players[room.phase2TurnIndex];
                 if (nextP) {
                    io.to(roomId).emit('notification', `IT IS NOW ${nextP.name.toUpperCase()}'S TURN.`);
                 }
              }
              io.to(roomId).emit('game_state_update', room);
              triggerAIIfNeeded(room, io, roomId);
           }
        }
      }
    });

    socket.on('lock_turn', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player) {
           player.isLocked = true;
           io.to(roomId).emit('game_state_update', room);
           
           const activePlayer = room.players[room.phase3TurnIndex || 0];
           if (activePlayer && activePlayer.id === socket.id) {
              room.phase3TurnIndex = (room.phase3TurnIndex || 0) + 1;
              
              if (room.phase3TurnIndex >= room.players.length) {
                 io.to(roomId).emit('notification', 'ROUND ENDED: Proceeding to next round.');
              }
              io.to(roomId).emit('game_state_update', room);
              triggerAIIfNeeded(room, io, roomId);
           }
        }
      }
    });

    socket.on('initial_roll', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player) {
           const roll = Math.floor(Math.random() * 10) + 1;
           player.currentPhase3Roll = roll;

           io.to(roomId).emit('game_state_update', room);
           io.to(roomId).emit('initial_roll_result', { playerId: player.id, roll: roll });
           io.to(roomId).emit('notification', `${player.name.toUpperCase()} ROLLED A ${roll}!`);
        }
      }
    });

    socket.on('second_chance_roll', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player && player.lifelines > 0) {
           player.lifelines -= 1;
           const oldRoll = player.currentPhase3Roll || 1;
           const newRoll = Math.floor(Math.random() * 10) + 1;
           
           const oldTotal = computeTotalRevenue(player, room, oldRoll);
           const newTotal = computeTotalRevenue(player, room, newRoll);
           
           if (newTotal > oldTotal) {
              player.currentPhase3Roll = newRoll;
           }
           
           io.to(roomId).emit('game_state_update', room);
           io.to(roomId).emit('second_chance_result', { 
              playerId: player.id,
              roll: player.currentPhase3Roll, 
              remainingLifelines: player.lifelines,
              wasKept: newTotal > oldTotal,
              newRollTested: newRoll
           });
           io.to(roomId).emit('notification', `${player.name.toUpperCase()} USED SECOND CHANCE! NEW ROLL: ${newRoll} (${newTotal > oldTotal ? 'KEPT' : 'DISCARDED'}).`);
        }
      }
    });

    socket.on('roll_dice', ({ roomId, playerRoll }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player) {
           const finalRoll = playerRoll || Math.floor(Math.random() * 10) + 1;
           player.currentPhase3Roll = finalRoll;
           
           io.to(roomId).emit('game_state_update', room);
           io.to(roomId).emit('initial_roll_result', { playerId: player.id, roll: finalRoll });
           io.to(roomId).emit('notification', `${player.name.toUpperCase()} ROLLED A ${finalRoll}!`);
        }
      }
    });

    socket.on('buy_mentor_card', ({ roomId }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player) {
           if (player.boughtMentorRound === room.round) {
              socket.emit('notification', 'ACTION REJECTED: You can only buy 1 mentor card per round.');
              return;
           }

           player.cash -= 20;
           player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
           player.boughtMentorRound = room.round;

           const card = room.mentorDeck.shift();
           if (card) {
              if (card.type === 'PLAY NOW') {
                 // Instant Execution (Play Now Cards)
                 socket.emit('mentor_card_drawn', card);
                 applyMentorCardEffect(player, room, card, '', '', socket);
                 io.to(roomId).emit('notification', `${player.name.toUpperCase()} PLAYED NOW: ${card.name.toUpperCase()}`);
              } else {
                 // Storage & Deferred Execution (Play Anytime Cards)
                 player.mentorCards.push(card);
                 io.to(roomId).emit('notification', `${player.name.toUpperCase()} BOUGHT AND STORED: ${card.name.toUpperCase()}`);
              }
           }
           
           io.to(roomId).emit('game_state_update', room);
        }
      }
    });

    socket.on('play_mentor_card', ({ roomId, cardId, targetPlayerId, companyName }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        if (player) {
           const cardIndex = player.mentorCards.findIndex((c: any) => c.id === cardId);
           if (cardIndex !== -1) {
              const card = player.mentorCards[cardIndex];
              const success = applyMentorCardEffect(player, room, card, targetPlayerId, companyName, socket);
              if (success) {
                 player.mentorCards.splice(cardIndex, 1);
                 io.to(roomId).emit('game_state_update', room);
                 io.to(roomId).emit('notification', `${player.name.toUpperCase()} PLAYED: ${card.name.toUpperCase()}`);
              }
           }
        }
      }
    });

    socket.on('resolve_bankruptcy', ({ roomId, option, companyName }) => {
      if (rooms[roomId]) {
        const room = rooms[roomId];
        const player = room.players.find((p: any) => p.id === socket.id);
        
        if (player && player.cash < 0) {
           if (option === 'loan') {
              // Survival Loan: $50K cash for 10% lifetime fee
              player.cash += 50;
              player.survivalLoan = (player.survivalLoan || 0) + 50;
              player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - (player.survivalLoan / 1000);
              
              io.to(roomId).emit('notification', `SURVIVAL LOAN: ${player.name} accepted a $50K survival loan.`);
           } else if (option === 'sell' && companyName) {
              const compIndex = player.ownedCompanies.findIndex((c: any) => c.name === companyName);
              if (compIndex !== -1) {
                 const comp = player.ownedCompanies[compIndex];
                 
                 // Refund calculation: Launch Cost + Upgrade Costs
                 let totalInvested = 0;
                 const compStageIndex = getStageIndex(comp.stage);
                 
                 if (INVESTMENT_COST_DATA[comp.name]) {
                    for (let stg = 0; stg <= compStageIndex; stg++) {
                       totalInvested += INVESTMENT_COST_DATA[comp.name][stg];
                    }
                 } else {
                    totalInvested = comp.invest;
                 }

                 player.ownedCompanies.splice(compIndex, 1);
                 player.cash += totalInvested;
                 player.valuation -= (comp.valuation / 1000);
                 player.loan = Math.max(0, player.loan - comp.loan);
                 player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);

                 io.to(roomId).emit('notification', `ASSET LIQUIDATION: ${player.name} sold ${comp.name} for $${totalInvested}K.`);
              }
           }

           if (player.cash >= 0) {
              socket.emit('bankruptcy_cleared');
              io.to(roomId).emit('notification', `BANKRUPTCY SOLVED: ${player.name} has resolved their shortfall.`);
           }
           io.to(roomId).emit('game_state_update', room);
        }
      }
    });

    socket.on('launch_company', ({ roomId, targetPlayerId }) => {
      if (rooms[roomId]) {
        const player = rooms[roomId].players.find((p: any) => p.id === targetPlayerId);
        if (player) {
          const COMPANY_TEMPLATES = [
            { name: "CONTRACT FARM", icon: "🌾", invest: 50, revenue: 80, valuation: 100, loan: 10 },
            { name: "AGRI IoT", icon: "📡", invest: 60, revenue: 100, valuation: 120, loan: 15 },
            { name: "WALLET", icon: "💳", invest: 75, revenue: 120, valuation: 150, loan: 20 },
            { name: "SNACKS", icon: "🍿", invest: 40, revenue: 60, valuation: 80, loan: 5 },
            { name: "QUICK COMM", icon: "⚡", invest: 90, revenue: 150, valuation: 200, loan: 30 },
            { name: "SMART STOR", icon: "📦", invest: 55, revenue: 90, valuation: 110, loan: 12 },
            { name: "RESTRO CHAIN", icon: "🍔", invest: 70, revenue: 110, valuation: 140, loan: 18 },
            { name: "TRACEABILITY", icon: "🔍", invest: 45, revenue: 70, valuation: 90, loan: 8 },
            { name: "ROBO-PACK", icon: "🤖", invest: 80, revenue: 130, valuation: 160, loan: 25 }
          ];

          const companyIndex = player.ownedCompanies.length;
          if (companyIndex >= 4) {
             socket.emit('notification', 'Maximum of 4 companies allowed.');
             return;
          }
          if (companyIndex < COMPANY_TEMPLATES.length) {
            const template = COMPANY_TEMPLATES[companyIndex];
            const stage = ['L', 'G', 'S'][companyIndex % 3];
            const team = player.color === '#ef4444' ? 'RN' :
                         player.color === '#55ffb0' ? 'GT' :
                         player.color === '#d4af37' ? 'GD' : 'BL';
            
            const newCompany = {
              ...template,
              stage,
              team
            };
            
            player.ownedCompanies.push(newCompany);
            player.valuation += (newCompany.valuation / 1000);
            player.loan += newCompany.loan;
            player.capital += (newCompany.valuation - newCompany.loan) / 1000;
            player.cash -= newCompany.invest;
            
            rooms[roomId].actionCount += 1;
            player.actionCount = (player.actionCount || 0) + 1;
            
            io.to(roomId).emit('game_state_update', rooms[roomId]);
            io.to(roomId).emit('notification', `${player.name.toUpperCase()} LAUNCHED ${newCompany.name.toUpperCase()} (STAGE ${stage})`);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

const INVESTMENT_COST_DATA: Record<string, number[]> = {
  'CONTRACT FARMING': [50, 100, 1000, 2000],
  'AGRI IoT': [60, 300, 1500, 8000],
  'WALLET': [75, 400, 2000, 10000],
  'SNACKS': [40, 200, 1100, 4000],
  'QUICK COMMERCE': [90, 400, 1200, 4000],
  'SMART STORAGE': [55, 1600, 5400, 7500],
  'RESTRO - CHAIN': [70, 400, 1400, 8000],
  'TRACEABILITY': [45, 200, 2000, 8000],
  'ROBO - PACKAGING': [80, 500, 2500, 9000]
};
