/* ===================================================================
   Pod 5 Interactive Sales Presentation — controller
   Fully offline. No external requests.
   =================================================================== */
(function () {
  'use strict';

  var DECK = window.DECK;
  var COND = DECK.conditional;

  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');
  var setupEl = document.getElementById('setup');
  var counterEl = document.getElementById('counter');
  var judgeTagEl = document.getElementById('judgeTag');
  var needsSummary = document.getElementById('needsSummary');

  var slideEls = {};   // id -> element
  DECK.order.forEach(function (id) {
    slideEls[id] = stage.querySelector('[data-slide="' + id + '"]');
  });

  var selected = new Set();   // selected problem keys
  var currentId = 'title';
  var judgeCount = 2;
  var sectionLabel = '';
  var started = false;

  /* -------- inject shared chrome (FBLA tag + logo) on non-title slides -------- */
  function injectChrome() {
    DECK.order.forEach(function (id) {
      var el = slideEls[id];
      if (!el || el.classList.contains('no-chrome')) return;
      var tl = document.createElement('div');
      tl.className = 'chrome-tl';
      tl.innerHTML = '<span class="fbla">2026 FBLA</span><br><span class="school">NORTHERN ACADEMY</span>';
      var tr = document.createElement('div');
      tr.className = 'chrome-tr';
      tr.innerHTML = '<span class="eight">8</span><span class="wordmark">EIGHT<br>SLEEP</span>';
      el.appendChild(tl);
      el.appendChild(tr);
    });
  }

  /* -------- stage scaling: fit 1440x810 into the viewport -------- */
  function fitStage() {
    var s = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fitStage);

  /* -------- active (filtered + ordered) slide list -------- */
  function activeList() {
    return DECK.order.filter(function (id) {
      var prob = COND[id];
      return !prob || selected.has(prob);
    });
  }

  /* -------- render the current slide -------- */
  function render() {
    var list = activeList();
    if (list.indexOf(currentId) === -1) currentId = 'problems'; // safety
    DECK.order.forEach(function (id) {
      var el = slideEls[id];
      if (!el) return;
      el.classList.toggle('active', id === currentId);
    });
    // counter
    var pos = list.indexOf(currentId) + 1;
    counterEl.textContent = pos + ' / ' + list.length;
    // per-slide entry hooks
    if (currentId === 'sol-energy') animateBars();
    updateProblemUI();
  }

  function go(id) {
    if (!id) return;
    currentId = id;
    render();
  }

  function next() {
    var list = activeList();
    var i = list.indexOf(currentId);
    if (i < list.length - 1) go(list[i + 1]);
  }
  function prev() {
    var list = activeList();
    var i = list.indexOf(currentId);
    if (i > 0) go(list[i - 1]);
  }

  /* -------- Problems slide interactivity -------- */
  function updateProblemUI() {
    var cards = stage.querySelectorAll('.prob-card');
    cards.forEach(function (c) {
      c.classList.toggle('selected', selected.has(c.dataset.problem));
    });
    if (!needsSummary) return;
    if (selected.size === 0) {
      needsSummary.textContent = 'Tap each problem the judges mention →';
      needsSummary.classList.remove('orange');
    } else {
      var labels = Array.from(selected).map(function (k) { return DECK.problemLabels[k]; });
      needsSummary.innerHTML = 'Focusing on: <b>' + labels.join(' · ') + '</b>';
    }
  }

  function bindProblemCards() {
    stage.querySelectorAll('.prob-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var p = card.dataset.problem;
        if (selected.has(p)) selected.delete(p); else selected.add(p);
        updateProblemUI();
        // refresh counter (total may change)
        var list = activeList();
        counterEl.textContent = (list.indexOf(currentId) + 1) + ' / ' + list.length;
      });
    });
  }

  /* -------- bar chart animation (slide sol-energy) -------- */
  function animateBars() {
    var bars = stage.querySelectorAll('.slide[data-slide="sol-energy"] .bar');
    bars.forEach(function (b) { b.style.height = '0'; });
    // axis goes 0..60% over the 430px chart body (minus label space ~ use 388px usable)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bars.forEach(function (b) {
          var pct = parseFloat(b.dataset.h);   // value out of 60 (axis max)
          b.style.height = (pct / 60 * 100) + '%';
        });
      });
    });
  }

  /* -------- fullscreen -------- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    } else {
      (document.exitFullscreen || function () {}).call(document);
    }
  }

  /* -------- start / restart -------- */
  function startPresentation() {
    judgeTagEl.textContent = 'JUDGES: ' + judgeCount + (sectionLabel ? '  ·  ' + sectionLabel.toUpperCase() : '');
    setupEl.classList.add('hidden');
    started = true;
    currentId = 'title';
    fitStage();
    render();
  }
  function restart() {
    selected.clear();
    started = false;
    currentId = 'title';
    setupEl.classList.remove('hidden');
    updateProblemUI();
  }

  /* -------- setup screen wiring -------- */
  function bindSetup() {
    document.getElementById('judgePick').addEventListener('click', function (e) {
      var btn = e.target.closest('.judge-btn');
      if (!btn) return;
      this.querySelectorAll('.judge-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      judgeCount = parseInt(btn.dataset.n, 10);
    });
    document.getElementById('startBtn').addEventListener('click', function () {
      sectionLabel = document.getElementById('sectionInput').value.trim();
      startPresentation();
    });
  }

  /* -------- keyboard / clicker -------- */
  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      // allow typing in the section field
      if (e.target && e.target.tagName === 'INPUT') {
        if (e.key === 'Enter') document.getElementById('startBtn').click();
        return;
      }
      switch (e.key) {
        case 'ArrowRight': case ' ': case 'PageDown': case 'Enter':
          if (started) { e.preventDefault(); next(); } break;
        case 'ArrowLeft': case 'PageUp':
          if (started) { e.preventDefault(); prev(); } break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'r': case 'R': restart(); break;
        case 'h': case 'H': counterEl.classList.toggle('hidden'); break;
        case '1': if (currentId === 'problems') toggleProblemByIndex(0); break;
        case '2': if (currentId === 'problems') toggleProblemByIndex(1); break;
        case '3': if (currentId === 'problems') toggleProblemByIndex(2); break;
      }
    });
  }
  function toggleProblemByIndex(i) {
    var cards = stage.querySelectorAll('.prob-card');
    if (cards[i]) cards[i].click();
  }

  /* -------- nav arrows -------- */
  document.getElementById('navPrev').addEventListener('click', prev);
  document.getElementById('navNext').addEventListener('click', next);

  /* -------- init -------- */
  injectChrome();
  bindProblemCards();
  bindSetup();
  bindKeys();
  fitStage();
  updateProblemUI();
})();
