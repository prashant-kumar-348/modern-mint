const eventCardsData = [
  {
    id: 'E1',
    name: 'Bull Market',
    description: 'The market is booming. All PR costs are reduced by $100K.',
    effect: 'pr_discount_100'
  },
  {
    id: 'E2',
    name: 'Bear Market',
    description: 'Investors are hesitant. Loan interest is increased to 15%.',
    effect: 'loan_interest_15'
  },
  {
    id: 'E3',
    name: 'Tech Boom',
    description: 'Workforce upgrade costs are halved.',
    effect: 'workforce_discount_half'
  }
];

function generateEventDeck() {
  return [...eventCardsData];
}

module.exports = { generateEventDeck };
