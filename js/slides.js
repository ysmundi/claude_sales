/* Slide order + problem→solution mapping.
   Canonical order of every slide in the deck. Solution slides carry a
   `problem` key and are only included when that problem is assigned to at
   least one judge on the Problems slide. Everything else is always shown. */
window.DECK = {
  // canonical order by data-slide id
  order: [
    'title',
    'problems',
    'agenda',          // always shown: the personalized plan reveal
    'sol-wakeup',      // shown only if problem "wakeup" assigned to a judge
    'sol-temperature', // shown only if problem "temperature" assigned
    'sol-energy',      // shown only if problem "energy" assigned
    'features',
    'pricing',
    'ultra',
    'whyus',
    'recap',           // always shown: personalized recap + close-the-sale
    'close'
  ],
  // conditional solution slides → the problem that activates them
  conditional: {
    'sol-wakeup': 'wakeup',
    'sol-temperature': 'temperature',
    'sol-energy': 'energy'
  },
  // labels used for the live "needs" summary on the Problems slide
  problemLabels: {
    wakeup: 'Waking up',
    temperature: 'Temperature',
    energy: 'Energy / tiredness'
  },
  // problem → the Pod 5 feature that solves it (agenda + recap)
  featureFor: {
    wakeup: 'Smart Wake-Up (vibration + gradual temperature)',
    temperature: 'Dual-Zone Temperature Control',
    energy: 'AI Temperature Adjustments (deep & REM sleep)'
  },
  // product options for the recap / close-the-sale slide
  products: {
    pod5: {
      name: 'POD 5',
      price: 2999,
      priceLabel: '$2,999',
      perNight: '~$2 / night over 5 years',
      monthly: '$81 / mo financing'
    },
    ultra: {
      name: 'POD 5 ULTRA',
      price: 4999,
      priceLabel: '$4,999',
      perNight: 'adjustable base + snoring mitigation',
      monthly: '$135 / mo financing'
    }
  }
};
