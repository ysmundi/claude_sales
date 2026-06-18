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
  var focusedProblem = 'wakeup';   // which problem card the number keys act on
  var judgeCount = 2;
  var started = false;
  // per-judge product pick on the recap slide: judge number -> 'pod5' | 'ultra'
  var judgeProduct = {};

  function judgesFor(problem) {
    return Array.from(assignments[problem]).sort(function (a, b) { return a - b; });
  }
  function isAssigned(problem) { return assignments[problem].size > 0; }
  function problemsForJudge(n) {
    return PROBLEM_ORDER.filter(function (p) { return assignments[p].has(n); });
  }

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
    if (currentId === 'recap') renderRecap();
    if (currentId === 'summary') renderSummary();
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
    renderJudgeProducts();
  }

  // make sure every current judge has a product (default Pod 5)
  function ensureJudgeProducts() {
    for (var n = 1; n <= judgeCount; n++) {
      if (judgeProduct[n] !== 'pod5' && judgeProduct[n] !== 'ultra') judgeProduct[n] = 'pod5';
    }
  }

  // build the per-judge product toggles + the combined totals
  function renderJudgeProducts() {
    ensureJudgeProducts();
    var listEl = document.getElementById('judgeProdList');
    if (listEl) {
      listEl.innerHTML = '';
      for (var n = 1; n <= judgeCount; n++) {
        var sel = judgeProduct[n];
        var li = document.createElement('li');
        li.className = 'jp-row';
        li.style.animationDelay = (0.08 + (n - 1) * 0.07) + 's';
        li.innerHTML =
          '<span class="jp-judge">JUDGE ' + n + '</span>' +
          '<div class="jp-toggle">' +
            '<button type="button" class="jp-btn' + (sel === 'pod5' ? ' active' : '') +
              '" data-judge="' + n + '" data-prod="pod5">POD 5</button>' +
            '<button type="button" class="jp-btn' + (sel === 'ultra' ? ' active' : '') +
              '" data-judge="' + n + '" data-prod="ultra">POD 5 ULTRA</button>' +
          '</div>';
        listEl.appendChild(li);
      }
    }
    renderTotals();
  }

  function renderTotals() {
    var totalsEl = document.getElementById('recapTotals');
    if (!totalsEl) return;
    var counts = { pod5: 0, ultra: 0 };
    for (var n = 1; n <= judgeCount; n++) counts[judgeProduct[n]]++;
    var rows = '';
    ['pod5', 'ultra'].forEach(function (key) {
      if (!counts[key]) return;
      var prod = DECK.products[key];
      rows += '<div class="rt-line"><span>' + counts[key] + '× ' + prod.name + '</span>' +
        '<span>' + prod.priceLabel + ' each</span></div>';
    });
    totalsEl.innerHTML = rows;
  }

  /* -------- per-judge summary (final slide) -------- */
  function renderSummary() {
    var list = document.getElementById('summaryList');
    if (!list) return;
    list.innerHTML = '';
    for (var n = 1; n <= judgeCount; n++) {
      var probs = problemsForJudge(n);
      var li = document.createElement('li');
      li.className = 'summary-row';
      li.style.animationDelay = (0.1 + (n - 1) * 0.1) + 's';
      var body;
      if (probs.length === 0) {
        body = '<span class="sr-pair generic"><span class="sr-feat">' +
          'The complete Pod 5 system — every feature, end to end</span></span>';
      } else {
        body = probs.map(function (p) {
          return '<span class="sr-pair">' +
            '<span class="sr-said">' + SAID[p].charAt(0).toUpperCase() + SAID[p].slice(1) + '</span>' +
            '<span class="sr-arrow">→</span>' +
            '<span class="sr-feat">' + DECK.featureFor[p] + '</span></span>';
        }).join('');
      }
      li.innerHTML =
        '<span class="sr-judge">JUDGE ' + n + '</span>' +
        '<span class="sr-body">' + body + '</span>';
      list.appendChild(li);
    }
  }

  /* -------- Problems slide interactivity -------- */
  function updateProblemUI() {
    stage.querySelectorAll('.prob-card').forEach(function (c) {
      c.classList.toggle('selected', isAssigned(c.dataset.problem));
      c.classList.toggle('focused', c.dataset.problem === focusedProblem);
    });
    stage.querySelectorAll('.judge-chip').forEach(function (chip) {
      var on = assignments[chip.dataset.problem].has(parseInt(chip.dataset.judge, 10));
      chip.classList.toggle('on', on);
    });
    // prominent per-card banner showing which judge(s) this problem belongs to
    stage.querySelectorAll('.prob-assigned').forEach(function (el) {
      var arr = judgesFor(el.dataset.assigned);
      el.textContent = arr.length
        ? (arr.length === 1 ? 'JUDGE ' + arr[0] : 'JUDGES ' + arr.join(' · '))
        : '';
    });
    if (!needsSummary) return;
    var assigned = PROBLEM_ORDER.filter(isAssigned);
    if (assigned.length === 0) {
      needsSummary.innerHTML = '↑ ↓ pick a problem · press <b>1–' + judgeCount +
        '</b> for the judge(s) who mention it';
    } else {
      var parts = assigned.map(function (p) {
        return DECK.problemLabels[p] + ' (' + judgesFor(p).map(function (n) { return 'J' + n; }).join(',') + ')';
      });
      needsSummary.innerHTML = 'Focusing on: <b>' + parts.join(' · ') + '</b>';
    }
  }

  // toggle a judge on a problem (shared by chip clicks and number keys)
  function toggleJudge(p, n) {
    if (!assignments[p] || n < 1 || n > judgeCount) return;
    if (assignments[p].has(n)) assignments[p].delete(n); else assignments[p].add(n);
    updateProblemUI();
    // total slide count may change
    var list = activeList();
    counterEl.textContent = (list.indexOf(currentId) + 1) + ' / ' + list.length;
    if (progressBar) progressBar.style.width = ((list.indexOf(currentId) + 1) / list.length * 100) + '%';
  }

  // move the keyboard focus between problem cards
  function moveProblemFocus(delta) {
    var i = PROBLEM_ORDER.indexOf(focusedProblem);
    if (i < 0) i = 0;
    focusedProblem = PROBLEM_ORDER[(i + delta + PROBLEM_ORDER.length) % PROBLEM_ORDER.length];
    updateProblemUI();
  }

  function bindProblemChips() {
    // delegated: chips are rebuilt whenever judgeCount changes
    stage.querySelectorAll('.prob-grid').forEach(function (grid) {
      grid.addEventListener('click', function (e) {
        var card = e.target.closest('.prob-card');
        if (!card) return;
        focusedProblem = card.dataset.problem;   // clicking a card focuses it
        var chip = e.target.closest('.judge-chip');
        if (chip) toggleJudge(chip.dataset.problem, parseInt(chip.dataset.judge, 10));
        else updateProblemUI();
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
    judgeTagEl.textContent = 'JUDGES: ' + judgeCount;
    setupEl.classList.add('hidden');
    started = true;
    currentId = 'title';
    fitStage();
    render();
  }
  function restart() {
    PROBLEMS.forEach(function (p) { assignments[p].clear(); });
    focusedProblem = 'wakeup';
    judgeProduct = {};
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
      startPresentation();
    });
  }

  /* -------- recap per-judge product toggle -------- */
  function bindRecapToggle() {
    var listEl = document.getElementById('judgeProdList');
    if (!listEl) return;
    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.jp-btn');
      if (!btn) return;
      judgeProduct[parseInt(btn.dataset.judge, 10)] = btn.dataset.prod;
      renderJudgeProducts();
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
      // Problems slide: arrows pick a problem, number keys assign judges to it
      if (started && currentId === 'problems') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          moveProblemFocus(e.key === 'ArrowUp' ? -1 : 1);
          return;
        }
        if (/^[1-8]$/.test(e.key)) {
          e.preventDefault();
          toggleJudge(focusedProblem, parseInt(e.key, 10));
          return;
        }
      }
      // Recap slide: number keys flip that judge's product (Pod 5 ↔ Ultra)
      if (started && currentId === 'recap' && /^[1-8]$/.test(e.key)) {
        var jn = parseInt(e.key, 10);
        if (jn <= judgeCount) {
          e.preventDefault();
          judgeProduct[jn] = judgeProduct[jn] === 'ultra' ? 'pod5' : 'ultra';
          renderJudgeProducts();
        }
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
