import type { GameRoom, ChatMessage } from './types';

// ── Mock rooms ────────────────────────────────────────────────────────────

export const MOCK_ROOMS: GameRoom[] = [
  {
    id: '1',
    name: 'Global Leaders Summit',
    mode: '60mins',
    founders: [
      { kind: 'human', avatarId: 1, name: 'AlexK',  status: 'online' },
      { kind: 'human', avatarId: 2, name: 'Rohit',  status: 'online' },
      { kind: 'open' },
      { kind: 'open' },
    ],
    investors: [
      { kind: 'human', avatarId: 3, name: 'Meera',  status: 'online' },
      { kind: 'open' },
    ],
    privacy: 'open',
  },
  {
    id: '2',
    name: 'Boardroom Battle',
    mode: 'short',
    founders: [
      { kind: 'human', avatarId: 4, name: 'Jordan', status: 'online' },
      { kind: 'human', avatarId: 5, name: 'Taylor', status: 'online' },
      { kind: 'ai' },
      { kind: 'open' },
    ],
    investors: [
      { kind: 'ai' },
      { kind: 'ai' },
    ],
    privacy: 'password',
  },
  {
    id: '3',
    name: 'Market Masters',
    mode: 'full',
    founders: [
      { kind: 'human', avatarId: 6, name: 'Sage',   status: 'online' },
      { kind: 'human', avatarId: 7, name: 'Quinn',  status: 'online' },
      { kind: 'human', avatarId: 8, name: 'Avery',  status: 'online' },
      { kind: 'locked' },
    ],
    investors: [
      { kind: 'human', avatarId: 1, name: 'Alex',   status: 'online' },
      { kind: 'human', avatarId: 2, name: 'Roo',    status: 'online' },
    ],
    privacy: 'open',
  },
  {
    id: '4',
    name: 'Negotiation Nexus',
    mode: '60mins',
    founders: [
      { kind: 'human', avatarId: 3, name: 'Nadia',  status: 'online' },
      { kind: 'human', avatarId: 4, name: 'Ivan',   status: 'online' },
      { kind: 'open' },
      { kind: 'open' },
    ],
    investors: [
      { kind: 'human', avatarId: 5, name: 'Priya',  status: 'online' },
      { kind: 'open' },
    ],
    privacy: 'password',
  },
  {
    id: '5',
    name: 'Future Strategists',
    mode: 'short',
    founders: [
      { kind: 'human', avatarId: 6, name: 'Dev',    status: 'online' },
      { kind: 'open' },
      { kind: 'ai' },
      { kind: 'ai' },
    ],
    investors: [
      { kind: 'ai' },
      { kind: 'ai' },
    ],
    privacy: 'open',
  },
  {
    id: '6',
    name: 'Leadership Lab',
    mode: 'full',
    founders: [
      { kind: 'human', avatarId: 7, name: 'Zara',   status: 'online' },
      { kind: 'human', avatarId: 8, name: 'Max',    status: 'online' },
      { kind: 'human', avatarId: 1, name: 'Leo',    status: 'online' },
      { kind: 'ai' },
    ],
    investors: [
      { kind: 'human', avatarId: 2, name: 'Nina',   status: 'online' },
      { kind: 'human', avatarId: 3, name: 'Omar',   status: 'online' },
    ],
    privacy: 'password',
  },
  {
    id: '7',
    name: 'Deal Makers',
    mode: '60mins',
    founders: [
      { kind: 'human', avatarId: 4, name: 'Aria',   status: 'online' },
      { kind: 'open' },
      { kind: 'open' },
      { kind: 'ai' },
    ],
    investors: [
      { kind: 'open' },
      { kind: 'open' },
    ],
    privacy: 'open',
  },
];

// ── Mock chat feed ────────────────────────────────────────────────────────

export const MOCK_CHAT: ChatMessage[] = [
  { id: 'c1',  user: 'ShakeNbaby',     userColor: '#1de9d6', text: 'New ShakeNbaby Game just dropped. Usual password.',          time: '10:26 Today' },
  { id: 'c2',  user: 'BoardandContent',userColor: '#d4a843', text: 'What is password?',                                           time: '10:43 Today' },
  { id: 'c3',  user: 'BLUEGARBEVOIR',  userColor: '#1de9d6', text: 'Open room',                                                   time: '11:09 Today' },
  { id: 'c4',  user: 'Hamz78',         userColor: '#6a8fff', text: 'hello, whats the password...?',                               time: '11:34 Today' },
  { id: 'c5',  user: 'TomerC7',        userColor: '#d4a843', text: 'Join us',                                                     time: '12:38 Today' },
  { id: 'c6',  user: 'TAREE',          userColor: '#1de9d6', text: 'Hi anyone want play',                                         time: '04:42 Today' },
  { id: 'c7',  user: 'Minzu79',        userColor: '#b06aff', text: 'password please...',                                          time: '04:51 Today' },
  { id: 'c8',  user: 'jeanetteray31',  userColor: '#1de9d6', text: '1v1 open',                                                    time: '05:07 Today' },
  { id: 'c9',  user: 'enjoyed',        userColor: '#d4a843', text: "Senkuku join iqn game. Let's go :)",                         time: '05:12 Today' },
  { id: 'c10', user: 'TomerC7',        userColor: '#1de9d6', text: 'Tido join us',                                                time: '05:20 Today' },
  { id: 'c11', user: 'XXXYU',          userColor: '#6a8fff', text: '3+1',                                                         time: '05:45 Today' },
  { id: 'c12', user: 'Vivian',         userColor: '#d4a843', text: '3+1',                                                         time: '05:51 Today' },
];
