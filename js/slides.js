/* Slide order + problem→solution mapping.
   Canonical order of every slide in the deck. Solution slides carry a
   `problem` key and are only included when that problem is selected on
   the Problems slide. Everything else is always shown. */
window.DECK = {
  // canonical order by data-slide id
  order: [
    'title',
    'problems',
    'sol-wakeup',      // shown only if problem "wakeup" selected
    'sol-temperature', // shown only if problem "temperature" selected
    'sol-energy',      // shown only if problem "energy" selected
    'features',
    'pricing',
    'ultra',
    'whyus',
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
  }
};
