/* ===================================================================
   Pod 5 Interactive Sales Presentation — controller
   Fully offline. No external requests.
   =================================================================== */
(function () {
  'use strict';

  var DECK = window.DECK;
  var COND = DECK.conditional;

  var stage = document.getElementById('stage');
  var setupEl = document.getElementById('setup');
  var counterEl = document.getElementById('counter');
  var judgeTagEl = document.getElementById('judgeTag');
  var needsSummary = document.getElementById('needsSummary');
  var progressBar = document.getElementById('progressBar');

  var slideEls = {};   // id -> element
  DECK.order.forEach(function (id) {
    slideEls[id] = stage.querySelector('[data-slide="' + id + '"]');
  });

  // problem keys (wakeup / temperature / energy)
  var PROBLEMS = Object.keys(COND).map(function (id) { return COND[id]; });
  // canonical problem order (matches DECK.order solution slides)
  var PROBLEM_ORDER = ['wakeup', 'temperature', 'energy'];

  // short phrases for badges / recap
  var SAID = {
    wakeup: 'trouble waking up',
    temperature: 'different temperature preferences',
    energy: 'waking up tired'
  };

  // assignments: problem key -> Set of judge numbers
  var assignments = {};
  PROBLEMS.forEach(function (p) { assignments[p] = new Set(); });

  var currentId = 'title';
  var judgeCount = 2;
  var sectionLabel = '';
  var started = false;
  var recapProd = 'pod5';

  function judgesFor(problem) {
    return Array.from(assignments[problem]).sort(function (a, b) { return a - b; });
  }
  function isAssigned(problem) { return assignments[problem].size > 0; }

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
      return !prob || isAssigned(prob);
    });
  }

  /* -------- count-up animation -------- */
  function fmtVal(v, opts) {
    if (opts.money) return '$' + v.toLocaleString('en-US');
    if (opts.pct) return v + '%';
    return '' + v;
  }
  function countUp(el, to, opts) {
    opts = opts || {};
    var dur = opts.dur || 850, start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtVal(Math.round(to * eased), opts);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* -------- judge label helpers -------- */
  function judgeListLabel(arr) {
    return arr.map(function (n) { return n; }).join(' · ');
  }
  function forJudgesLabel(arr) {
    return (arr.length === 1 ? 'FOR JUDGE ' : 'FOR JUDGES ') + judgeListLabel(arr);
  }

  /* -------- build per-card judge chips for the current judgeCount -------- */
  function buildChips() {
    stage.querySelectorAll('.prob-judges').forEach(function (box) {
      var problem = box.dataset.chips;
      box.innerHTML = '';
      for (var n = 1; n <= judgeCount; n++) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'judge-chip';
        chip.textContent = 'J' + n;
        chip.dataset.judge = n;
        chip.dataset.problem = problem;
        box.appendChild(chip);
      }
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
      if (id !== currentId) el.classList.remove('is-active');
    });

    // counter + progress
    var pos = list.indexOf(currentId) + 1;
    counterEl.textContent = pos + ' / ' + list.length;
    if (progressBar) progressBar.style.width = (pos / list.length * 100) + '%';

    // per-slide content + entry hooks
    if (currentId === 'agenda') renderAgenda();
    if (currentId === 'recap') renderRecap();
    if (COND[currentId]) renderBadge(currentId);
    updateProblemUI();

    // re-trigger entrance animations on the active slide
    var cur = slideEls[currentId];
    if (cur) {
      void cur.offsetWidth; // reflow so the animation restarts
      requestAnimationFrame(function () {
        cur.classList.add('is-active');
        if (currentId === 'sol-energy') animateBars();
        if (currentId === 'whyus') animateCompare();
        if (currentId === 'pricing') {
          var pa = cur.querySelector('.price-amt');
          if (pa) countUp(pa, parseInt(pa.dataset.v, 10), { money: true });
        }
      });
    }
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

  /* -------- solution-slide badge -------- */
  function renderBadge(slideId) {
    var problem = COND[slideId];
    var badge = slideEls[slideId].querySelector('.sol-badge');
    if (!badge) return;
    var arr = judgesFor(problem);
    if (arr.length === 0) { badge.innerHTML = ''; return; }
    badge.innerHTML =
      '<span class="sb-mention">Because you mentioned <b>' + SAID[problem] + '</b></span>' +
      '<span class="sb-judges">' + forJudgesLabel(arr) + '</span>';
  }

  /* -------- agenda (personalized plan) -------- */
  function renderAgenda() {
    var list = document.getElementById('agendaList');
    if (!list) return;
    list.innerHTML = '';
    var assigned = PROBLEM_ORDER.filter(isAssigned);
    if (assigned.length === 0) {
      var li = document.createElement('li');
      li.className = 'agenda-item full';
      li.innerHTML = '<span class="ai-num">★</span>' +
        '<span class="ai-text">The complete Pod 5 system<small>A full walkthrough of every feature</small></span>';
      list.appendChild(li);
      return;
    }
    assigned.forEach(function (p, i) {
      var arr = judgesFor(p);
      var li = document.createElement('li');
      li.className = 'agenda-item';
      li.style.animationDelay = (0.12 + i * 0.1) + 's';
      li.innerHTML =
        '<span class="ai-num">' + (i + 1) + '</span>' +
        '<span class="ai-text">' + DECK.featureFor[p].split(' (')[0] +
        '<small>For ' + SAID[p] + '</small></span>' +
        '<span class="ai-judges">' + forJudgesLabel(arr) + '</span>';
      list.appendChild(li);
    });
  }

  /* -------- recap (plan + close the sale) -------- */
  function renderRecap() {
    var list = document.getElementById('recapList');
    if (list) {
      list.innerHTML = '';
      var assigned = PROBLEM_ORDER.filter(isAssigned);
      if (assigned.length === 0) {
        var g = document.createElement('li');
        g.className = 'recap-row generic';
        g.innerHTML = '<span class="rr-said">We’ll set you up with the complete Pod 5 system.</span>';
        list.appendChild(g);
      } else {
        assigned.forEach(function (p, i) {
          var arr = judgesFor(p);
          var row = document.createElement('li');
          row.className = 'recap-row';
          row.style.animationDelay = (0.1 + i * 0.1) + 's';
          row.innerHTML =
            '<span class="rr-said">You said: ' + SAID[p].charAt(0).toUpperCase() + SAID[p].slice(1) +
            '<small>' + forJudgesLabel(arr) + '</small></span>' +
            '<span class="rr-arrow">→</span>' +
            '<span class="rr-solved">Solved by ' + DECK.featureFor[p] + '</span>';
          list.appendChild(row);
        });
      }
    }
    updateRecapProduct();
  }

  function updateRecapProduct() {
    var prod = DECK.products[recapProd];
    if (!prod) return;
    document.querySelectorAll('#recapToggle .prod-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.prod === recapProd);
    });
    var nameEl = document.getElementById('recapName');
    var priceEl = document.getElementById('recapPrice');
    var perNightEl = document.getElementById('recapPerNight');
    var monthlyEl = document.getElementById('recapMonthly');
    var stamp = document.getElementById('recapStamp');
    if (nameEl) nameEl.textContent = prod.name;
    if (perNightEl) perNightEl.textContent = prod.perNight;
    if (monthlyEl) monthlyEl.textContent = prod.monthly;
    if (priceEl) { priceEl.dataset.v = prod.price; countUp(priceEl, prod.price, { money: true }); }
    if (stamp) { stamp.style.transform = 'rotate(7deg) scale(1.12)'; setTimeout(function () { stamp.style.transform = 'rotate(7deg)'; }, 180); }
  }

  /* -------- Problems slide interactivity -------- */
  function updateProblemUI() {
    stage.querySelectorAll('.prob-card').forEach(function (c) {
      c.classList.toggle('selected', isAssigned(c.dataset.problem));
    });
    stage.querySelectorAll('.judge-chip').forEach(function (chip) {
      var on = assignments[chip.dataset.problem].has(parseInt(chip.dataset.judge, 10));
      chip.classList.toggle('on', on);
    });
    if (!needsSummary) return;
    var assigned = PROBLEM_ORDER.filter(isAssigned);
    if (assigned.length === 0) {
      needsSummary.textContent = 'Tap the judge(s) who mention each problem →';
    } else {
      var parts = assigned.map(function (p) {
        return DECK.problemLabels[p] + ' (' + judgesFor(p).map(function (n) { return 'J' + n; }).join(',') + ')';
      });
      needsSummary.innerHTML = 'Focusing on: <b>' + parts.join(' · ') + '</b>';
    }
  }

  function bindProblemChips() {
    // delegated: chips are rebuilt whenever judgeCount changes
    stage.querySelectorAll('.prob-grid').forEach(function (grid) {
      grid.addEventListener('click', function (e) {
        var chip = e.target.closest('.judge-chip');
        if (!chip) return;
        var p = chip.dataset.problem;
        var n = parseInt(chip.dataset.judge, 10);
        if (assignments[p].has(n)) assignments[p].delete(n); else assignments[p].add(n);
        updateProblemUI();
        // total slide count may change
        var list = activeList();
        counterEl.textContent = (list.indexOf(currentId) + 1) + ' / ' + list.length;
        if (progressBar) progressBar.style.width = ((list.indexOf(currentId) + 1) / list.length * 100) + '%';
      });
    });
  }

  /* -------- bar chart animation (slide sol-energy) -------- */
  function animateBars() {
    var slide = slideEls['sol-energy'];
    var bars = slide.querySelectorAll('.bar');
    bars.forEach(function (b) {
      b.style.height = '0';
      var pct = b.querySelector('.bar-pct');
      if (pct) pct.textContent = '0%';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bars.forEach(function (b) {
          var pct = parseFloat(b.dataset.h);   // value out of 60 (axis max)
          b.style.height = (pct / 60 * 100) + '%';
          var lbl = b.querySelector('.bar-pct');
          if (lbl) countUp(lbl, parseInt(lbl.dataset.v, 10), { pct: true, dur: 1100 });
        });
      });
    });
  }

  /* -------- comparison check/X pop-in (slide whyus) -------- */
  function animateCompare() {
    var cmp = slideEls['whyus'].querySelector('.cmp');
    if (!cmp) return;
    cmp.classList.remove('pop');
    void cmp.offsetWidth;
    var marks = cmp.querySelectorAll('.yes,.no');
    marks.forEach(function (m, i) { m.style.animationDelay = (i * 0.05) + 's'; });
    cmp.classList.add('pop');
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
    judgeCount = clampJudges(parseInt(document.getElementById('judgeCount').value, 10));
    buildChips();
    judgeTagEl.textContent = 'JUDGES: ' + judgeCount + (sectionLabel ? '  ·  ' + sectionLabel.toUpperCase() : '');
    setupEl.classList.add('hidden');
    started = true;
    currentId = 'title';
    fitStage();
    render();
  }
  function restart() {
    PROBLEMS.forEach(function (p) { assignments[p].clear(); });
    recapProd = 'pod5';
    started = false;
    currentId = 'title';
    setupEl.classList.remove('hidden');
    updateProblemUI();
  }

  function clampJudges(n) {
    if (isNaN(n) || n < 1) return 1;
    if (n > 8) return 8;
    return n;
  }

  /* -------- setup screen wiring -------- */
  function bindSetup() {
    var numEl = document.getElementById('judgeCount');
    document.getElementById('judgePick').addEventListener('click', function (e) {
      var btn = e.target.closest('.step-btn');
      if (!btn) return;
      numEl.value = clampJudges(parseInt(numEl.value, 10) + parseInt(btn.dataset.step, 10));
    });
    numEl.addEventListener('change', function () { numEl.value = clampJudges(parseInt(numEl.value, 10)); });
    document.getElementById('startBtn').addEventListener('click', function () {
      sectionLabel = document.getElementById('sectionInput').value.trim();
      startPresentation();
    });
  }

  /* -------- recap product toggle -------- */
  function bindRecapToggle() {
    var toggle = document.getElementById('recapToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('.prod-btn');
      if (!btn) return;
      recapProd = btn.dataset.prod;
      updateRecapProduct();
    });
  }

  /* -------- keyboard / clicker -------- */
  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      // allow typing in the setup fields
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
      }
    });
  }

  /* -------- nav arrows -------- */
  document.getElementById('navPrev').addEventListener('click', prev);
  document.getElementById('navNext').addEventListener('click', next);

  /* -------- init -------- */
  injectChrome();
  buildChips();
  bindProblemChips();
  bindSetup();
  bindRecapToggle();
  bindKeys();
  fitStage();
  updateProblemUI();
})();
