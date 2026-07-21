require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://modernmint.netlify.app'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST']
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// In-memory store for game rooms (Source of Truth)
const rooms = {};

const COMPANY_DATA_MAP = {
  'CONTRACT FARMING': [[10,100,500,0], [100,200,1000,20], [1000,1000,250,200], [2000,2000,10000,400]],
  'AGRI IoT': [[100,10,1000,0], [500,300,3000,300], [1500,1500,6000,2000], [8000,8000,36000,7000]],
  'WALLET': [[50,10,1000,0], [1200,400,3000,400], [1500,2000,8000,1800], [7000,10000,36000,5000]],
  'SNACKS': [[10,20,1000,0], [300,200,1500,200], [1000,1100,7500,1500], [6000,4000,32000,8000]],
  'QUICK COMMERCE': [[10,30,100,0], [200,400,2500,100], [2000,1200,10000,800], [10000,4000,50000,6000]],
  'SMART STORAGE': [[200,200,2000,200], [3000,1600,5000,2000], [3000,5400,9000,4000], [10000,7500,40000,12000]],
  'RESTRO - CHAIN': [[150, 300, 1000, 200], [300, 400, 2000, 500], [1200, 1400, 4000, 2000], [12000, 8000, 26000, 15000]],
  'TRACEABILITY': [[30,30,300,0], [300,200,2000,200], [1200,2000,7500,1000], [10000,8000,38000,5000]],
  'ROBO - PACKAGING': [[100,150,1500,200], [1200,500,4000,1000], [5000,2500,15000,2000], [4000,9000,45000,8000]]
};

const MULTIPLIER_TABLE = {
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

const computeTotalRevenue = (player, room, roll) => {
  let total = 0;
  player.ownedCompanies.forEach(pCompany => {
     let sharingPlayers = 0;
     room.players.forEach(otherP => {
        const theirComp = otherP.ownedCompanies.find(c => c.name === pCompany.name);
        if (theirComp && theirComp.stage === pCompany.stage) {
          sharingPlayers += 1;
        }
     });
     const dataRow = COMPANY_DATA_MAP[pCompany.name];
     if (!dataRow) return;
     const stageIndex = pCompany.stage === 'L' ? 0 : pCompany.stage === 'G' ? 1 : pCompany.stage === 'S' ? 2 : 3;
     const baseRev = dataRow[stageIndex][1];
     let activeProjectedRev = baseRev;
     if (pCompany.prBoughtRound === room.round) {
         activeProjectedRev = baseRev * 2;
     }
     const dividedRev = sharingPlayers > 1 ? Math.floor(activeProjectedRev / sharingPlayers) : activeProjectedRev;
     const teamIndex = pCompany.team === 'RN' ? 0 : pCompany.team === 'GT' ? 1 : pCompany.team === 'GD' ? 2 : 3;
     const multi = MULTIPLIER_TABLE[roll][teamIndex];
     total += (dividedRev * multi);
  });
  return total;
};

const { generateMentorDeck } = require('./mentorCardsData');
const { generateEventDeck } = require('./eventCardsData');

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
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
    players: [],
    deals: [], // Store deals list
    royaltyAgreements: [], // Store formalized royalty deals
    mentorDeck: shuffle(generateMentorDeck()),
    eventDeck: eventDeck,
    activeEvent: eventDeck.shift(), // Round 1 starts with an event
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

app.post('/api/create-room', (req, res) => {
  // Generate a random 4 letter code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let roomId = '';
  for (let i = 0; i < 4; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  rooms[roomId] = createEmptyRoom();
  res.json({ roomId });
});

// LiveKit Token Generation
app.get('/api/livekit-token', (req, res) => {
  const roomName = req.query.room;
  const participantName = req.query.username;

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'room and username are required' });
  }

  // Ensure these are set in .env
  // LIVEKIT_API_KEY
  // LIVEKIT_API_SECRET
  // If not set, we'll return a mock or error
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    console.warn("LiveKit credentials missing. Returning mock token.");
    return res.json({ token: "mock_token_for_development" });
  }

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantName,
    name: participantName,
  });
  
  at.addGrant({ roomJoin: true, room: roomName });

  // Wait, toJwt might be async or sync depending on version.
  res.json({ token: "mock" }); // Removed this because we use the async route
});

app.get('/api/livekit-token-async', async (req, res) => {
  const roomName = req.query.room;
  const participantName = req.query.username;
  
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    console.warn("LiveKit credentials missing. Returning mock token.");
    return res.json({ token: "mock_token_for_development" });
  }
  
  try {
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: participantName,
    });
    at.addGrant({ roomJoin: true, room: roomName });
    const token = await at.toJwt();
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, username, role }) => {
    console.log(`Socket ${socket.id} is attempting to join room ${roomId} as username: "${username}" with role: "${role}"`);
    if (!rooms[roomId]) {
      // Auto-create room for development ease if it doesn't exist
      rooms[roomId] = createEmptyRoom();
    }
    
    socket.join(roomId);
    
    const roomState = rooms[roomId];
    
    // Check investor limit if joining as Investor
    let finalRole = role || 'Founder';
    if (finalRole === 'Investor') {
       const investorCount = roomState.players.filter(p => p.role === 'Investor').length;
       if (investorCount >= 2) {
          finalRole = 'Founder';
          socket.emit('notification', 'Maximum 2 Investors reached. You have joined as a Founder.');
       }
    }
    
    // Add player if not exists, or update socket ID if reconnecting
    const existingPlayer = username ? roomState.players.find(p => p.name === username) : null;
    if (existingPlayer) {
      if (existingPlayer.id !== socket.id) {
        console.log(`Found existing player "${username}" with old socket ID ${existingPlayer.id}. Reconnecting to new socket ID ${socket.id}.`);
        // Disconnect existing socket if it's different and active
        const activeSocket = io.sockets.sockets.get(existingPlayer.id);
        if (activeSocket) {
          console.log(`Force-disconnecting old active socket ${existingPlayer.id} for "${username}".`);
          activeSocket.disconnect(true);
        }
        existingPlayer.id = socket.id;
        if (role && existingPlayer.role !== role) {
           // Only update role if it's valid
           existingPlayer.role = finalRole;
        }
      } else {
        console.log(`Socket ${socket.id} is already registered as "${username}".`);
      }
    } else {
      console.log(`Creating new player entry for "${username}" with socket ID ${socket.id}`);
      roomState.players.push({
        id: socket.id,
        name: username || `Player ${roomState.players.length + 1}`,
        color: ['#ef4444', '#55ffb0', '#d4af37', '#00e1ff'][roomState.players.length % 4],
        isLocked: false,
        ownedCompanies: [],
        capital: 0, // Net Worth ($M)
        loan: 0,    // Loans ($K)
        survivalLoan: 0, // Survival Loans ($K)
        cash: 0,    // Cash in Hand ($K)
        valuation: 0, // Total Valuation ($M)
        actionCount: 0,
        mentorCards: [],
        boughtMentorRound: 0,
        lifelines: 2,
        currentPhase3Roll: null,
        role: finalRole // Set from join
      });
      
      // Round 1: Shuffle all Character tokens in random order
      if (roomState.round === 1) {
        shuffle(roomState.players);
      }
    }

    // Broadcast current state to the user who just joined
    socket.emit('game_state_update', roomState);
    
    if (roomState.round === 1) {
      setTimeout(() => {
        socket.emit('notification', 'ROUND 1: SKIPPING INVESTMENT PHASE. START BUILDING YOUR EMPIRE!');
      }, 1000); // Slight delay for dramatic effect
    }
    
    // Broadcast to everyone else that a new player joined
    socket.to(roomId).emit('game_state_update', roomState);
  });

  socket.on('take_loan', ({ roomId, amount, loanBreakdown, companiesString }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      const player = room.players.find(p => p.id === socket.id);
      if (player && loanBreakdown && Array.isArray(loanBreakdown)) {
        // Enforce Phase 1 turn order
        const activePlayer = room.players[room.phase1TurnIndex || 0];
        if (room.phase === 1 && (!activePlayer || activePlayer.id !== socket.id)) {
           socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
           return;
        }

        let actualLoanGranted = 0;
        
        loanBreakdown.forEach(req => {
          const comp = player.ownedCompanies.find(c => c.name === req.companyName);
          if (comp && comp.loanTakenStage !== comp.stage) {
            actualLoanGranted += req.amount;
            comp.loanTakenStage = comp.stage;
            comp.loan = (comp.loan || 0) + req.amount; // Track specific company loan
          }
        });
        
        if (actualLoanGranted > 0) {
          player.capital += (actualLoanGranted / 1000); // K to M
          player.loan += actualLoanGranted;
          player.cash += actualLoanGranted;
          // Phase 1 actions cost 0 AP
          
          io.to(roomId).emit('notification', `${player.name.toUpperCase()} RECEIVED LOAN $${actualLoanGranted}K FROM THE BANK FOR ${companiesString}`);
        } else {
          socket.emit('notification', 'ACTION REJECTED: You have already taken loans for the current stages of these companies.');
          return;
        }
      }
      io.to(roomId).emit('game_state_update', room);
    }
  });

  socket.on('offer_deal', ({ roomId, targetPlayer, cash, loan }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      const proposer = room.players.find(p => p.id === socket.id);
      const receiver = room.players.find(p => p.name.toLowerCase() === targetPlayer.toLowerCase());
      
      if (proposer && receiver) {
        // Enforce Phase 1 turn order
        const activePlayer = room.players[room.phase1TurnIndex || 0];
        if (room.phase === 1 && (!activePlayer || activePlayer.id !== socket.id)) {
           socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
           return;
        }

        if (cash > 0) {
          proposer.capital -= cash;
          receiver.capital += cash;
          proposer.cash -= (cash * 1000);
          receiver.cash += (cash * 1000);
        }
        if (loan > 0) {
          proposer.loan += (loan * 1000);
          receiver.loan -= (loan * 1000);
        }
      }

      const newDeal = {
        id: `DEAL-${rooms[roomId].deals.length + 1}`,
        proposer: proposer ? proposer.name : 'Unknown',
        partner: targetPlayer,
        cash: cash,
        loan: loan,
        status: 'Completed',
        terms: `Assumed $${loan}M Debt. Proposer: ${proposer ? proposer.name : 'Unknown'}`
      };
      rooms[roomId].deals.push(newDeal);
      rooms[roomId].dealCount += 1;
      // Phase 1 actions cost 0 AP
      
      io.to(roomId).emit('game_state_update', rooms[roomId]);
      io.to(roomId).emit('notification', `DEAL LOCKED BETWEEN ${proposer ? proposer.name : 'Unknown'} & ${targetPlayer}`);
    }
  });

  const companiesData = {
    'CONTRACT FARMING': [500, 1000, 25000, 70000],
    'AGRI IoT': [1000, 6000, 18000, 36000],
    'WALLET': [1000, 2000, 36000, 98000],
    'SNACKS': [1000, 7000, 25000, 220000],
    'QUICK COMMERCE': [1000, 2500, 100000, 320000],
    'SMART STORAGE': [2000, 12000, 18000, 40000],
    'RESTRO - CHAIN': [1000, 2000, 40000, 280000],
    'TRACEABILITY': [500, 2000, 7500, 38000],
    'ROBO - PACKAGING': [1500, 4000, 150000, 450000]
  };

  const investmentCostData = {
    'CONTRACT FARMING': [10, 100, 1000, 2000],
    'AGRI IoT': [100, 500, 1000, 8000],
    'WALLET': [100, 1000, 1500, 2500],
    'SNACKS': [10, 200, 1000, 4000],
    'QUICK COMMERCE': [10, 200, 2000, 10000],
    'SMART STORAGE': [200, 3000, 5000, 10000],
    'RESTRO - CHAIN': [50, 500, 1200, 12000],
    'TRACEABILITY': [50, 200, 500, 10000],
    'ROBO - PACKAGING': [100, 1200, 5000, 8000]
  };

  const teamUpgradeCosts = {
    'CONTRACT FARMING': [5, 10, 15, 20],
    'AGRI IoT': [5, 10, 15, 20],
    'WALLET': [5, 10, 15, 20],
    'SNACKS': [5, 10, 15, 20],
    'QUICK COMMERCE': [5, 10, 15, 20],
    'SMART STORAGE': [5, 10, 15, 20],
    'RESTRO - CHAIN': [5, 10, 15, 20],
    'TRACEABILITY': [5, 10, 15, 20],
    'ROBO - PACKAGING': [5, 10, 15, 20]
  };

  const multiplierTable = {
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

  socket.on('phase2_action', ({ roomId, actionType, companyName, amount, newName }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (player) {
        if (!player.ownedCompanies) player.ownedCompanies = [];

        // --- NEW: Enforce Turn Order ---
        const activePlayer = rooms[roomId].players[rooms[roomId].phase2TurnIndex];
        if (!activePlayer || activePlayer.id !== socket.id) {
           socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
           return;
        }

        if (actionType === 'rename_company' && companyName && newName) {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (comp) comp.customName = newName;
           io.to(roomId).emit('game_state_update', rooms[roomId]);
           return; // Early return for rename, no financial changes
        }

        // --- NEW: Calculate True Cost Securely ---
        let actualCost = 0;
        if (actionType === 'buy_pr') {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (!comp) return;
           if (comp.prBoughtRound === rooms[roomId].round) {
              socket.emit('notification', 'ACTION REJECTED: Max 1 PR Service per company per round.');
              return;
           }
           const prCosts = [100, 300, 500, 700];
           actualCost = prCosts[(comp.team || 1) - 1] || 100;
        } else if (actionType === 'upgrade_workforce' && companyName) {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (!comp) return;
           if (comp.workforceUpgradedRound === rooms[roomId].round) {
              socket.emit('notification', 'ACTION REJECTED: Max 1 Workforce Upgrade per company per round.');
              return;
           }
           if (teamUpgradeCosts[companyName]) {
              actualCost = teamUpgradeCosts[companyName][comp.stage];
           }
        } else if (actionType === 'buy_mentor') {
           if (player.boughtMentorRound === rooms[roomId].round) {
              socket.emit('notification', 'ACTION REJECTED: Max 1 Mentor Card per round.');
              return;
           }
           actualCost = 20; // 20K cost
        } else if (actionType === 'launch' && companyName) {
           if (player.ownedCompanies.length >= 4) {
              socket.emit('notification', 'ACTION REJECTED: Maximum portfolio limit of 4 companies reached.');
              return;
           }
           if (investmentCostData[companyName]) {
              actualCost = investmentCostData[companyName][0]; // Launch stage index = 0
           }
        } else if (actionType === 'stage_up' && companyName) {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (!comp) return;

           // Check if upgraded this round
           if (comp.upgradedRound === rooms[roomId].round) {
              socket.emit('notification', 'ACTION REJECTED: Company already staged up this round.');
              return;
           }

           if (comp.stage < 3 && investmentCostData[companyName]) {
              actualCost = investmentCostData[companyName][comp.stage + 1];
           } else {
              return;
           }
        }

        // 1. Deduct Cash securely based on actualCost, ignoring frontend amount
        player.cash -= actualCost; // Amount is in $K
        player.phase2Paid = (player.phase2Paid || 0) + actualCost; // Track spending for Phase 2 End Screen

        // 2. Company Upgrades
        if (actionType === 'launch' && companyName) {
           player.ownedCompanies.push({ name: companyName, stage: 0, team: 1 }); // 0 = Launch
        } else if (actionType === 'buy_pr' && companyName) {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (comp) comp.prBoughtRound = rooms[roomId].round;
        } else if (actionType === 'upgrade_workforce' && companyName) {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (comp) {
             comp.team = (comp.team || 1) + 1;
             comp.workforceUpgradedRound = rooms[roomId].round;
           }
        } else if (actionType === 'stage_up' && companyName) {
           const comp = player.ownedCompanies.find(c => c.name === companyName);
           if (comp && comp.stage < 3) {
             comp.stage += 1; // 1=Retain, 2=Grow, 3=Scale
             comp.upgradedRound = rooms[roomId].round;
           }
        } else if (actionType === 'buy_mentor') {
           player.boughtMentorRound = rooms[roomId].round;
           
           // Draw top card
           const drawnCard = rooms[roomId].mentorDeck.shift();
           
           // If deck is empty somehow, we could reshuffle, but skipping for now
           if (drawnCard) {
             if (drawnCard.type.toUpperCase() === 'PLAY NOW') {
               // Apply dynamic effect
               switch (drawnCard.effectType) {
                 case 'add_cash':
                   player.cash += drawnCard.effectValue || 0;
                   console.log(`Applied Play Now effect: add_cash ${drawnCard.effectValue}`);
                   break;
                 case 'free_stage_up':
                 case 'add_multiplier':
                 case 'free_stage_or_cash':
                 case 'add_multiplier_2':
                 case 'shield_event':
                 case 'peek_events':
                 case 'extra_loan':
                 case 'extra_actions':
                 case 'steal_cash':
                 case 'double_revenue':
                 case 'skip_rival_turn':
                 case 'free_tech_invest':
                 case 'mutual_draw':
                 case 'halve_rival_cash':
                 case 'cash_from_total_loans':
                 case 'end_game_valuation_boost':
                 case 'block_loans':
                 case 'lose_cash_20k':
                 case 'block_stage_up':
                 case 'forced_sale':
                 case 'lose_action':
                 case 'miss_turn':
                   console.log(`[MENTOR EFFECT TRIGGERED] -> PLAY NOW: ${drawnCard.effectType}. Wiring up logic pending.`);
                   break;
                 default:
                   console.log(`Unknown PLAY NOW effect: ${drawnCard.effectType}`);
                   break;
               }
             } else {
               player.mentorCards.push(drawnCard);
               console.log(`[MENTOR CARD SAVED] -> PLAY ANYTIME: ${drawnCard.effectType}. Player can trigger this later.`);
             }
             
             // Emit card to the specific buyer
             socket.emit('mentor_card_drawn', drawnCard);
           }
         }

        // 3. Recalculate Valuation
        let totalValuationK = 0;
        player.ownedCompanies.forEach(c => {
           if (companiesData[c.name] && companiesData[c.name][c.stage] !== undefined) {
              totalValuationK += companiesData[c.name][c.stage];
           }
        });
        player.valuation = totalValuationK / 1000; // Convert to $M

        // 4. Action Points Tracking (Counts UP)
        player.actionCount = (player.actionCount || 0) + 1;
        rooms[roomId].actionCount += 1;

        // 5. Recalculate Net Worth (Capital) dynamically
        player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);

        // Broadcast state
        io.to(roomId).emit('game_state_update', rooms[roomId]);
      }
    }
  });

  socket.on('lock_phase1', ({ roomId }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        // Enforce Phase 1 turn order
        const activePlayer = room.players[room.phase1TurnIndex || 0];
        if (!activePlayer || activePlayer.id !== socket.id) {
           socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
           return;
        }

        player.isLocked = true;
        room.phase1TurnIndex = (room.phase1TurnIndex || 0) + 1;
        
        // If all players have taken their turn in Phase 1, transition to Phase 2
        if (room.phase1TurnIndex >= room.players.length) {
          room.phase = 2;
          room.phase1TurnIndex = 0; // reset
          room.players.forEach(p => p.isLocked = false); // Reset locks
          
          // --- Phase 2 Sequential Turn Order Setup ---
          room.phase2TurnIndex = 0;
          
          const firstPlayer = room.players[0];
          io.to(roomId).emit('notification', `PHASE 2 BEGINS: It is ${firstPlayer ? firstPlayer.name : 'Unknown'}'s turn.`);
        } else {
          const nextPlayer = room.players[room.phase1TurnIndex];
          io.to(roomId).emit('notification', `It is now ${nextPlayer.name}'s turn.`);
        }
        
        io.to(roomId).emit('game_state_update', room);
      }
    }
  });

  // --- NEW: Role Selection ---
  socket.on('set_role', ({ roomId, role }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (player) {
        if (role === 'Investor') {
          const investorCount = rooms[roomId].players.filter(p => p.role === 'Investor').length;
          if (investorCount >= 2 && player.role !== 'Investor') {
            socket.emit('notification', 'ACTION REJECTED: Maximum 2 Investors allowed.');
            return;
          }
        }
        player.role = role;
        io.to(roomId).emit('game_state_update', rooms[roomId]);
      }
    }
  });

  // --- NEW: Repay Loan ---
  socket.on('repay_loan', ({ roomId, amount }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
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
          io.to(roomId).emit('game_state_update', rooms[roomId]);
        }
      }
    }
  });

  // --- NEW: Global Cash Transfer (Bailout) ---
  socket.on('transfer_cash', ({ roomId, targetPlayerId, amount }) => {
    if (rooms[roomId]) {
      const sender = rooms[roomId].players.find(p => p.id === socket.id);
      const receiver = rooms[roomId].players.find(p => p.id === targetPlayerId);
      if (sender && receiver && amount > 0) {
        sender.cash -= amount;
        receiver.cash += amount;
        
        // Recalculate net worths
        sender.capital = (sender.cash / 1000) + sender.valuation - (sender.loan / 1000);
        receiver.capital = (receiver.cash / 1000) + receiver.valuation - (receiver.loan / 1000);
        
        io.to(roomId).emit('notification', `${sender.name} transferred $${amount}K to ${receiver.name}.`);
        io.to(roomId).emit('game_state_update', rooms[roomId]);
      }
    }
  });

  // --- NEW: Resolve Bankruptcy ---
  socket.on('resolve_bankruptcy', ({ roomId, option, companyName }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (player) {
        if (option === 'crack_deal') {
          // Simply check if cash is >= 0 after potential transfers
          if (player.cash >= 0) {
            io.to(roomId).emit('notification', `${player.name} resolved bankruptcy via bailout!`);
            socket.emit('bankruptcy_cleared');
          } else {
            socket.emit('notification', 'You are still in debt. Transfer more cash or choose another option.');
          }
        } else if (option === 'sell_company') {
          const compIndex = player.ownedCompanies.findIndex(c => c.name === companyName);
          if (compIndex > -1) {
            const comp = player.ownedCompanies[compIndex];
            
            // Calculate refund: Original Launch Cost + All Stage Up Costs
            let totalInvested = 0;
            const compStageIndex = comp.stage === 'L' ? 0 : comp.stage === 'G' ? 1 : comp.stage === 'S' ? 2 : 3;
            
            if (investmentCostData[comp.name]) {
               for (let i = 0; i <= compStageIndex; i++) {
                 totalInvested += investmentCostData[comp.name][i];
               }
            }
            
            const activeLoan = comp.loan || 0;
            const refund = totalInvested - activeLoan;
            
            player.cash += refund;
            
            // Deduct from global stats
            player.loan -= activeLoan;
            
            // Remove company
            player.ownedCompanies.splice(compIndex, 1);
            
            // Recalculate valuation
            let totalValuationK = 0;
            player.ownedCompanies.forEach(c => {
               const stg = c.stage === 'L' ? 0 : c.stage === 'G' ? 1 : c.stage === 'S' ? 2 : 3;
               if (companiesData[c.name] && companiesData[c.name][stg] !== undefined) {
                  totalValuationK += companiesData[c.name][stg];
               }
            });
            player.valuation = totalValuationK / 1000;
            
            // Recalculate net worth
            player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
            
            io.to(roomId).emit('notification', `${player.name} sold ${comp.name} for $${refund}K to avoid bankruptcy.`);
            if (player.cash >= 0) {
               socket.emit('bankruptcy_cleared');
            }
          }
        } else if (option === 'survival_loan') {
           const shortfall = Math.abs(player.cash);
           const borrowAmount = shortfall; 
           
           player.cash += borrowAmount;
           player.survivalLoan = (player.survivalLoan || 0) + borrowAmount;
           player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000) - ((player.survivalLoan || 0) / 1000);
           
           io.to(roomId).emit('notification', `${player.name} took a $${borrowAmount}K SURVIVAL LOAN (30% Interest).`);
           if (player.cash >= 0) {
              socket.emit('bankruptcy_cleared');
           }
        } else if (option === 'restart') {
             player.ownedCompanies = [];
             player.loan = 0;
             player.survivalLoan = 0;
             player.cash = 500;
             player.valuation = 0;
             player.capital = (player.cash / 1000) + player.valuation - (player.loan / 1000);
             
             io.to(roomId).emit('notification', `${player.name} DECLARED FULL BANKRUPTCY and restarted with $500K.`);
             socket.emit('bankruptcy_cleared');
          }
        
        io.to(roomId).emit('game_state_update', rooms[roomId]);
      }
    }
  });

  socket.on('lock_turn', ({ roomId }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === socket.id);
      if (player) {
        player.isLocked = true;
        
        // Check if Phase 2 is finished (all players locked)
        const allLocked = rooms[roomId].players.every(p => p.isLocked);
        if (allLocked) {
          io.to(roomId).emit('phase2_end_trigger', rooms[roomId]);
        }
        
        io.to(roomId).emit('game_state_update', rooms[roomId]);
      }
    }
  });

  socket.on('force_next_phase', ({ roomId }) => {
    if (rooms[roomId]) {
      const currentPhase = rooms[roomId].phase;
      rooms[roomId].phase = currentPhase < 3 ? currentPhase + 1 : 1;
      
      // Reset player locks
      rooms[roomId].players.forEach(p => p.isLocked = false);
      
      io.to(roomId).emit('notification', `ADMIN FORCED TRANSITION TO PHASE ${rooms[roomId].phase}`);
      io.to(roomId).emit('game_state_update', rooms[roomId]);
    }
  });

  socket.on('end_phase2_turn', () => {
    // Find room for this socket
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    
    // Check if it's actually this player's turn
    const activePlayer = room.players[room.phase2TurnIndex];
    if (!activePlayer || activePlayer.id !== socket.id) {
       socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
       return;
    }

    activePlayer.isLocked = true;
    room.phase2TurnIndex += 1;
    
    // If all players have taken their turn, transition to Phase 3
    if (room.phase2TurnIndex >= room.players.length) {
      room.phase = 3;
      room.phase2TurnIndex = 0; // reset
      
      room.players.forEach(p => {
        p.isLocked = false; // reset locks for phase 3
        
        // Automatic Loan Interest (10%)
        if (p.loan > 0) {
           const interest = Math.round(p.loan * 0.10);
           p.cash -= interest;
           // Notify
           io.to(p.id).emit('notification', `PHASE 3 START: Paid $${interest}K (10%) interest on your $${p.loan}K loan.`);
        }
        
        // 30% Survival Loan Interest
        if (p.survivalLoan > 0) {
           const sInterest = Math.round(p.survivalLoan * 0.30);
           p.cash -= sInterest;
           io.to(p.id).emit('notification', `PHASE 3 START: Paid $${sInterest}K (30%) interest on your $${p.survivalLoan}K Survival Loan.`);
        }
      });
      io.to(roomId).emit('notification', 'PHASE 3: THE REVENUE ROLL BEGINS!');
    } else {
      const nextPlayer = room.players[room.phase2TurnIndex];
      io.to(roomId).emit('notification', `It is now ${nextPlayer.name}'s turn.`);
    }
    io.to(roomId).emit('game_state_update', room);
  });

  socket.on('initial_roll', () => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Enforce Phase 3 turn order
    const founders = room.players.filter(p => p.role === 'Founder');
    const activeFounder = founders[room.phase3TurnIndex || 0];
    if (!activeFounder || activeFounder.id !== socket.id) {
       socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
       return;
    }
    
    player.currentPhase3Roll = Math.floor(Math.random() * 10) + 1;
    socket.emit('initial_roll_result', { roll: player.currentPhase3Roll });
    io.to(roomId).emit('game_state_update', room);
  });

  socket.on('second_chance_roll', () => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    const player = room.players.find(p => p.id === socket.id);
    
    if (player && player.lifelines > 0) {
      // Enforce Phase 3 turn order
      const founders = room.players.filter(p => p.role === 'Founder');
      const activeFounder = founders[room.phase3TurnIndex || 0];
      if (!activeFounder || activeFounder.id !== socket.id) {
         socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
         return;
      }

      player.lifelines -= 1;
      const oldRoll = player.currentPhase3Roll || 1;
      const newRoll = Math.floor(Math.random() * 10) + 1;
      
      const oldTotal = computeTotalRevenue(player, room, oldRoll);
      const newTotal = computeTotalRevenue(player, room, newRoll);
      
      if (newTotal > oldTotal) {
         player.currentPhase3Roll = newRoll;
      }
      
      socket.emit('second_chance_result', { 
         roll: player.currentPhase3Roll, 
         remainingLifelines: player.lifelines,
         wasKept: newTotal > oldTotal,
         newRollTested: newRoll
      });
      io.to(roomId).emit('game_state_update', room);
    }
  });

  socket.on('propose_royalty_agreement', ({ targetPlayerId, founderId, investorId, companyName, percentage }) => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    const proposer = room.players.find(p => p.id === socket.id);
    const targetPlayer = room.players.find(p => p.id === targetPlayerId);
    if (!proposer || !targetPlayer) return;

    io.to(targetPlayerId).emit('royalty_proposal_received', {
      proposerId: proposer.id,
      proposerName: proposer.name,
      founderId,
      investorId,
      companyName,
      percentage
    });
    socket.emit('notification', `Proposed ${percentage}% royalty deal to ${targetPlayer.name}`);
  });

  socket.on('accept_royalty_agreement', ({ proposerId, founderId, investorId, companyName, percentage }) => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    const accepter = room.players.find(p => p.id === socket.id);
    const proposer = room.players.find(p => p.id === proposerId);
    if (!accepter || !proposer) return;

    // Check if agreement already exists
    const exists = room.royaltyAgreements.find(a => 
      a.founderId === founderId && a.investorId === investorId && a.companyName === companyName
    );
    
    if (!exists) {
       room.royaltyAgreements.push({
         founderId,
         investorId,
         companyName,
         percentage
       });
       const founder = room.players.find(p => p.id === founderId);
       const investor = room.players.find(p => p.id === investorId);
       io.to(roomId).emit('notification', `DEAL FINALIZED: ${investor.name} now has a ${percentage}% royalty on ${founder.name}'s ${companyName}`);
       io.to(roomId).emit('game_state_update', room);
    }
  });

  socket.on('reject_royalty_agreement', ({ proposerId }) => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    const rejecter = room.players.find(p => p.id === socket.id);
    if (rejecter) {
       io.to(proposerId).emit('notification', `${rejecter.name} rejected your royalty proposal.`);
    }
  });

  socket.on('claim_revenue', () => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.some(p => p.id === socket.id));
    if (!roomId) return;
    const room = rooms[roomId];
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Enforce Phase 3 turn order
    const founders = room.players.filter(p => p.role === 'Founder');
    const activeFounder = founders[room.phase3TurnIndex || 0];
    if (!activeFounder || activeFounder.id !== socket.id) {
       socket.emit('notification', 'ACTION REJECTED: It is not your turn!');
       return;
    }

    let totalActualRevenue = 0;
    const currentRoll = player.currentPhase3Roll || 1;

    player.ownedCompanies.forEach(pCompany => {
       // 1. Check for Revenue Divide Rule
       let sharingPlayers = 0;
       room.players.forEach(otherP => {
          const theirComp = otherP.ownedCompanies.find(c => c.name === pCompany.name);
          if (theirComp && theirComp.stage === pCompany.stage) {
            sharingPlayers += 1;
          }
       });

       const dataRow = COMPANY_DATA_MAP[pCompany.name];
       if (!dataRow) return;
       const stageIndex = pCompany.stage === 'L' ? 0 : pCompany.stage === 'G' ? 1 : pCompany.stage === 'S' ? 2 : 3;
       const baseRev = dataRow[stageIndex][1];
       
       // PR Services Double Effect
       let activeProjectedRev = baseRev;
       if (pCompany.prBoughtRound === room.round) {
           activeProjectedRev = baseRev * 2;
       }

       const dividedRev = sharingPlayers > 1 ? Math.floor(activeProjectedRev / sharingPlayers) : activeProjectedRev;
       
       const teamIndex = pCompany.team === 'RN' ? 0 : pCompany.team === 'GT' ? 1 : pCompany.team === 'GD' ? 2 : 3; 
       const multi = MULTIPLIER_TABLE[currentRoll][teamIndex];

       // 3. Final math
       const actualRevenue = dividedRev * multi;
       let founderRevenue = actualRevenue;

       // 3.5 Royalty Hook
       if (room.royaltyAgreements) {
          room.royaltyAgreements.forEach(agreement => {
             if (agreement.founderId === player.id && agreement.companyName === pCompany.name) {
                const royaltyCut = Math.floor((actualRevenue * agreement.percentage) / 100);
                const investor = room.players.find(p => p.id === agreement.investorId);
                if (investor && royaltyCut > 0) {
                   founderRevenue -= royaltyCut;
                   investor.cash += royaltyCut;
                   // notify investor
                   io.to(investor.id).emit('notification', `ROYALTY RECEIVED: $${royaltyCut}K from ${player.name}'s ${pCompany.name}`);
                }
             }
          });
       }
       
       totalActualRevenue += founderRevenue;
    });

    player.cash += totalActualRevenue;
    player.hasClaimedRevenue = true; // Mark that they've rolled for this round
    player.isLocked = true; // Lock UI feedback

    // 4. Bankruptcy Check
    if (player.cash < 0) {
       socket.emit('trigger_bankruptcy', { currentCash: player.cash });
    } else {
       socket.emit('notification', `CLAIMED REVENUE: $${totalActualRevenue}K`);
    }

    room.phase3TurnIndex = (room.phase3TurnIndex || 0) + 1;
    if (room.phase3TurnIndex < founders.length) {
       const nextFounder = founders[room.phase3TurnIndex];
       io.to(roomId).emit('notification', `It is now ${nextFounder.name}'s turn to roll.`);
    }

    // Emit immediate update so players see final cash values first
    io.to(roomId).emit('game_state_update', room);

    const allClaimed = founders.every(p => p.hasClaimedRevenue);
    if (allClaimed) {
      setTimeout(() => {
        if (!rooms[roomId]) return;
        const currentRoom = rooms[roomId];
        
        if (currentRoom.round >= 9) {
          currentRoom.phase = 4; // End Game Phase
          io.to(roomId).emit('notification', 'GAME OVER: 9 ROUNDS COMPLETED!');
        } else {
          const prevOrder = currentRoom.players.map(p => p.id);
          currentRoom.players.sort((a, b) => {
            const apA = a.actionCount || 0;
            const apB = b.actionCount || 0;
            if (apA !== apB) {
              return apA - apB; // Fewest AP spent goes first
            }
            return prevOrder.indexOf(a.id) - prevOrder.indexOf(b.id); // Tie breaker: went earlier in prev round
          });

          currentRoom.round += 1;
          currentRoom.phase = 1; // Back to Phase 1
          currentRoom.phase1TurnIndex = 0;
          currentRoom.phase2TurnIndex = 0;
          currentRoom.phase3TurnIndex = 0;
          
          // Reset player state for new round
          currentRoom.players.forEach(p => {
            p.hasClaimedRevenue = false;
            p.isLocked = false;
          });

          const firstPlayer = currentRoom.players[0];
          io.to(roomId).emit('notification', `PHASE 1 BEGINS: It is ${firstPlayer ? firstPlayer.name : 'Unknown'}'s turn.`);

          // Event Card Flip every 3 rounds (Round 1, 4, 7)
          if (currentRoom.round === 4 || currentRoom.round === 7) {
            currentRoom.activeEvent = currentRoom.eventDeck.shift();
            io.to(roomId).emit('notification', `NEW EVENT CARD: ${currentRoom.activeEvent.name}`);
            
            // Release Funds to Investors
            const fundAmount = currentRoom.round === 4 ? 5000 : 10000;
            currentRoom.players.forEach(p => {
               if (p.role === 'Investor') {
                  p.cash += fundAmount;
                  p.capital = (p.cash / 1000) + p.valuation - (p.loan / 1000);
                  io.to(roomId).emit('notification', `INVESTOR FUNDING: ${p.name} received $${fundAmount}K!`);
               }
            });
          }
        }
        io.to(roomId).emit('game_state_update', currentRoom);
      }, 5000); // 5 seconds delay so players have time to see their earnings and notifications
    }
  });

  socket.on('launch_company', ({ roomId, targetPlayerId }) => {
    if (rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === targetPlayerId);
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
    // Optional: handle player leaving logic
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Multiplayer server running on port ${PORT}`);
});
