/* SBC officer console. One page, hash routes, every screen built from SBC.data and changed through SBC.act. */
(function () {
  var S = SBC, E = SBCDocs.esc, D = S.date, root = document.getElementById('root');
  var ui = { mine: false, tab: {}, sel: {}, outcome: {}, plan: {}, picks: {}, q: '', toast: null, dialog: null, last: '', mfocus: {} };

  /* ---------- icons ---------- */
  var I = {
    board: '<svg viewBox="0 0 24 24"><path d="M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z"/></svg>',
    companies: '<svg viewBox="0 0 24 24"><path d="M4 21V6l8-3 8 3v15M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/></svg>',
    opps: '<svg viewBox="0 0 24 24"><path d="M4 8h16l-1 12H5zM9 8V5h6v3"/></svg>',
    agents: '<svg viewBox="0 0 24 24"><path d="M16 20v-1a4 4 0 0 0-8 0v1M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/></svg>',
    audit: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3"/></svg>',
    rules: '<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/><path d="M4 7v13h12"/></svg>',
    swap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>',
    out: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
    file: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A8F9C" stroke-width="1.6" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>',
    check: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    brand: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 21 7v10l-9 5-9-5V7z" fill="#1F4FD1"/><path d="M12 12 21 7M12 12v10M12 12 3 7" stroke="#FFFFFF" stroke-width="1.2" fill="none"/></svg>',
    cube: '<span class="cube" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 21 7 12 12 3 7z" fill="#3A4366"/><path d="M3 7 12 12v10L3 17z" fill="#151926"/><path d="M21 7 12 12v10l9-5z" fill="#3D6AF0"/></svg></span>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
  };

  /* ---------- helpers ---------- */
  function route() { var h = (location.hash || '#board').slice(1).split('/'); return { name: h[0] || 'board', id: h[1] ? decodeURIComponent(h[1]) : '' }; }
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
  function badge(t, cls) { return '<span class="badge ' + (cls || '') + '">' + E(t) + '</span>'; }
  var STAGE = {
    check: ['In review', 'info'], sign: ['Second check', 'info'], uploading: ['Uploading', ''], plan: ['Conditionally Qualified', 'warn'],
    qualified: ['SBC-Qualified', 'ok'], notyet: ['Not yet', 'err']
  };
  function stageBadge(c) { var s = STAGE[c.stage] || [c.stage, '']; if (c.mark && c.mark.withdrawn) s = ['Mark withdrawn', 'err']; return badge(s[0], s[1]); }
  var STAT = { open: ['Open', ''], confirmed: ['Confirmed', 'ok'], requested: ['Requested', 'warn'], earlier: ['Earlier round', ''] };
  var KIND = { need: 'Need', tender: 'Tender', mandate: 'Mandate', request: 'Request' };
  var KT = { Official: 'ok', 'Company-made': 'warn', Missing: 'err', 'SBC run': 'info', 'SBC record': 'ok' };
  function partyName(o) { var p = S.party(o.from); return p ? p.name : ''; }
  function myMove() {
    var cs = S.data.companies, mine = function (c) { return !ui.mine || c.owner === S.me() || !c.owner; };
    var check = cs.filter(function (c) { return c.stage === 'check' && mine(c); });
    var sign = cs.filter(function (c) { return c.stage === 'sign' && mine(c); });
    var intro = S.data.opps.filter(function (o) { return o.stage === 'approve' || (o.stage === 'match' && S.match(o).ranked.length); });
    return { check: check, sign: sign, intro: intro, n: check.length + sign.length + intro.length };
  }
  function toast(msg, cube) { if (!msg) return; ui.toast = { msg: msg, cube: cube, at: Date.now() }; render(); var at = ui.toast.at; setTimeout(function () { if (ui.toast && ui.toast.at === at) { ui.toast = null; render(); } }, 2800); }
  function confirmBox(title, body, okLabel, fn, danger) { ui.dialog = { title: title, body: body, ok: okLabel, fn: fn, danger: danger }; render(); }

  /* ---------- shell ---------- */
  function shell(active, crumbs, body) {
    var mm = myMove(), toMatch = S.data.opps.filter(function (o) { return o.stage === 'match' || o.stage === 'approve'; }).length;
    var nav = [['board', 'Board', I.board, mm.n], ['companies', 'Companies', I.companies, ''], ['opps', 'Opportunities', I.opps, toMatch], ['agents', 'Agent panel', I.agents, ''], ['audit', 'Audit log', I.audit, ''], ['rules', 'Rules', I.rules, '']];
    var meName = S.officerName(S.me()), otherName = S.officerName(S.other(S.me()));
    return '<div class="app"><aside class="side" aria-label="Console">' +
      '<div class="ws">' + I.brand + 'SBC Capital<small>SBC officer console</small></div>' +
      '<nav class="nav" aria-label="Console">' + nav.map(function (n) { return '<a href="#' + n[0] + '" class="' + (active === n[0] ? 'on' : '') + '">' + n[2] + n[1] + (n[3] ? '<span class="ct">' + n[3] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="me"><div class="me-row"><span class="av">' + S.me() + '</span>' + E(meName) + '</div>' +
      '<button class="side-btn" data-a="switch">' + I.swap + 'Switch to ' + E(otherName) + '</button>' +
      '<button class="side-btn" data-a="reset">' + I.reset + 'Reset demo data</button>' +
      '<button class="side-btn" data-a="signout">' + I.out + 'Sign out</button></div></aside>' +
      '<main class="main"><div class="top">' + crumbs + '</div><div class="page">' + body + '</div></main></div>';
  }
  function crumbs(list) { return list.map(function (x, i) { return i === list.length - 1 ? '<b>' + E(x[0]) + '</b>' : '<a href="#' + x[1] + '">' + E(x[0]) + '</a><span>/</span>'; }).join(''); }

  /* ---------- sign in ---------- */
  function vSignin() {
    var f = ui.signin || (ui.signin = { em: '', pw: '', busy: false });
    return '<div class="signin-wrap"><section class="night" aria-label="SBC officer console"><div class="lat" aria-hidden="true"></div>' +
      '<div class="brand">' + I.brand.replace('18', '24').replace('18', '24') + 'SBC Capital</div>' +
      '<div class="hero" aria-hidden="true" data-hero-cube><svg viewBox="0 0 24 24"><path d="M12 2 21 7 12 12 3 7z" fill="#3D6AF0" stroke="#0E1220" stroke-width=".2"/><path d="M3 7 12 12v10L3 17z" fill="#1A1D24" stroke="#3D6AF0" stroke-width=".2"/><path d="M21 7 12 12v10l9-5z" fill="#1F4FD1" stroke="#0E1220" stroke-width=".2"/></svg></div>' +
      '<div class="claim"><span class="eyebrow">SBC officer console</span><h2>Every company checked by two officers before a buyer sees it.</h2><p>Staff access only. Every action you take is recorded in the audit log.</p></div></section>' +
      signinForm() + '</div>';
  }
  function signinForm() {
    var f = ui.signin;
    return '<section class="signin" aria-label="Sign in"><div><h1>Sign in</h1><span class="muted">SBC officer console</span></div>' +
      '<div class="demo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F4FD1" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="12" r="4"></circle><path d="M12 12h9M18 12v3"></path></svg>' +
      '<span class="k"><span>Demo officer account</span><span class="mono muted">officer@sbc-demo.test · Officer-demo-26</span></span><button class="btn" data-a="autofill">Autofill</button></div>' +
      '<label class="fl" for="em">Work email<input id="em" class="input" data-in="em" value="' + E(f.em) + '" placeholder="name@sbccapital.ae" autocomplete="off"></label>' +
      '<label class="fl" for="pw">Password<input id="pw" type="password" class="input" data-in="pw" value="' + E(f.pw) + '" placeholder="Password" autocomplete="off"></label>' +
      '<button class="btn pri lg" data-a="signin"' + (f.busy ? ' aria-disabled="true"' : '') + '>' + (f.busy ? '<span class="spin"></span>Signing in' : 'Sign in') + '</button>' +
      (f.err ? '<span class="muted" style="color:var(--err)">' + E(f.err) + '</span>' : '<span class="muted">Demo data only. Nothing you do here is real.</span>') +
      '<div class="sfoot"><span>Single sign-on for SBC staff · [SSO provider]</span><span>Prototype · demo data only</span></div></section>';
  }

  /* ---------- board ---------- */
  function seg(c, key) { var p = S.progress(c, key); return '<div class="seg" aria-hidden="true">' + p.statuses.map(function (s) { return '<span class="' + (s === 'confirmed' ? 'ok' : s === 'requested' ? 'ask' : s === 'earlier' ? 'lock' : '') + '"></span>'; }).join('') + '</div>'; }
  function vBoard() {
    var mm = myMove(), cs = S.data.companies, me = S.me();
    var mine = function (c) { return !ui.mine || c.owner === me || !c.owner; };
    var up = cs.filter(function (c) { return c.stage === 'uploading' && mine(c); });
    var fix = cs.filter(function (c) { return c.stage === 'plan' && mine(c); });
    var done = cs.filter(function (c) { return (c.stage === 'qualified' || c.stage === 'notyet') && c.decided && D.days(c.decided, D.today) <= 6; });
    function col(step, title, goal, cards, q) {
      return '<div class="col"><div class="chd"><span class="t">' + (step ? '<span class="step' + (q ? ' q' : '') + '">' + step + '</span>' : '') + E(title) + '<span class="ct">' + cards.length + '</span></span><span class="goal">' + E(goal) + '</span></div>' +
        (cards.length ? cards.join('') : '<div class="colempty">Nothing here</div>') + '</div>';
    }
    var checkCards = mm.check.map(function (c) {
      var p = S.progress(c, 'k1'), late = c.due && c.due < D.today, hit = (c.screening && c.screening.hits || []).some(function (h) { return h.kind !== 'media'; });
      var b = !c.owner ? badge('Unassigned') : late ? badge('Overdue', 'err') : hit ? badge('Screening alert', 'err') : c.review.scope ? badge('Gaps only', 'info') : p.needs ? badge(p.needs + ' flagged', 'warn') : badge('All met', 'ok');
      var btn = !c.owner ? '<button class="btn sm" data-a="take" data-id="' + c.id + '">Take</button>' : '<button class="btn sm' + (c.owner === me ? ' pri' : '') + '" data-a="nav" data-h="check/' + c.id + '">Check</button>';
      return '<div class="card' + (late ? ' late' : '') + '" data-a="nav" data-h="check/' + c.id + '" role="link" tabindex="0"><div class="c1"><span class="nm">' + E(c.short) + '</span><span class="mono">' + D.age(c.since) + '</span></div>' + seg(c, 'k1') + '<div class="cf">' + b + btn + '</div></div>';
    });
    var signCards = mm.sign.map(function (c) {
      var k1 = c.review.k1 || {}, late = c.due && c.due < D.today, own = k1.by === me;
      return '<div class="card' + (late ? ' late' : '') + (own ? ' wait' : '') + '" data-a="nav" data-h="sign/' + c.id + '" role="link" tabindex="0"><div class="c1"><span class="nm">' + E(c.short) + '</span><span class="mono">' + D.age(c.since) + '</span></div>' +
        '<span class="cs">Key 1 ' + E(S.officerName(k1.by)) + ' · ' + E(S.label(k1.outcome)) + '</span><div class="cf">' + (late ? badge('Overdue ' + D.days(c.due, D.today) + 'd', 'err') : own ? badge('Waiting for ' + S.officerName(S.other(me))) : badge('Ready to sign', 'info')) +
        (own ? '' : '<button class="btn sm pri" data-a="nav" data-h="sign/' + c.id + '">Sign</button>') + '</div></div>';
    });
    var introCards = mm.intro.map(function (o) {
      var own = o.picks && o.picks.by === me, n = o.stage === 'approve' ? o.picks.ids.length : S.match(o).ranked.length;
      return '<div class="card' + (own ? ' wait' : '') + '" data-a="nav" data-h="opp/' + o.id + '" role="link" tabindex="0"><div class="c1"><span class="nm">' + E(o.title) + '</span><span class="mono">' + D.age(o.picks ? o.picks.at : o.posted) + '</span></div>' +
        '<span class="cs">' + KIND[o.kind] + ' · ' + E(partyName(o)) + '</span><div class="cf">' + (o.stage === 'approve' ? (own ? badge('Waiting for ' + S.officerName(S.other(me))) : badge(n + ' matches', 'info')) : badge(n + ' ranked')) +
        (own ? '' : '<button class="btn sm' + (o.stage === 'approve' ? ' pri' : '') + '" data-a="nav" data-h="opp/' + o.id + '">' + (o.stage === 'approve' ? 'Approve' : 'Pick') + '</button>') + '</div></div>';
    });
    var upCards = up.map(function (c) {
      return '<div class="card wait" data-a="nav" data-h="company/' + c.id + '" role="link" tabindex="0"><div class="c1"><span class="nm">' + E(c.short) + '</span><span class="mono">' + D.age(c.since) + '</span></div>' +
        '<div class="cf"><div class="bar"><span style="width:' + Math.round(100 * c.uploads.done / c.uploads.total) + '%"></span></div><span class="mono muted">' + c.uploads.done + '/' + c.uploads.total + '</span></div>' +
        '<span class="cs">Missing: ' + E(c.uploads.missing[0]) + '</span><div class="cf"><span></span><button class="btn sm" data-a="remind" data-id="' + c.id + '">Remind</button></div></div>';
    });
    var fixCards = fix.map(function (c) {
      var it = c.plan ? c.plan.items : [], dn = it.filter(function (x) { return x.done; }).length;
      return '<div class="card wait" data-a="nav" data-h="company/' + c.id + '" role="link" tabindex="0"><div class="c1"><span class="nm">' + E(c.short) + '</span><span class="mono">' + D.age(c.since) + '</span></div>' +
        '<div class="seg" aria-hidden="true">' + it.map(function (x) { return '<span class="' + (x.done ? 'ok' : '') + '"></span>'; }).join('') + '</div>' +
        '<span class="cs">' + dn + ' of ' + it.length + ' done · due ' + D.short(c.due) + '</span><div class="cf"><span></span><button class="btn sm" data-a="remind" data-id="' + c.id + '">Remind</button></div></div>';
    });
    var doneCards = done.map(function (c) {
      return '<div class="card' + (c.decided === D.today ? ' new' : '') + '" data-a="nav" data-h="company/' + c.id + '" role="link" tabindex="0"><div class="c1"><span class="nm">' + E(c.short) + '</span><span class="mono">' + D.when(c.decided) + '</span></div><div class="cf">' + (c.stage === 'qualified' ? badge('SBC-Qualified', 'ok') : badge('Not yet', 'err')) + '</div></div>';
    });
    var nYour = checkCards.length + signCards.length + introCards.length, nCo = upCards.length + fixCards.length;
    return shell('board', '<b>Board</b>',
      '<div class="ttl"><h1>Board</h1><span class="sub">Rules check every upload first. You decide.</span><div class="acts"><div class="seg2" role="group" aria-label="Show"><button class="' + (!ui.mine ? 'on' : '') + '" data-a="mine" data-v="0">All</button><button class="' + (ui.mine ? 'on' : '') + '" data-a="mine" data-v="1">Mine</button></div></div></div>' +
      '<div class="groups"><span class="g todo">Your move <span class="ct">' + nYour + '</span></span><span class="g">Company’s move <span class="ct">' + nCo + '</span></span><span class="g">Done <span class="ct">' + doneCards.length + '</span></span></div>' +
      '<div class="cols">' +
      col('1', 'Check', 'Confirm what the rules found', checkCards) +
      col('2', 'Second check', 'Sign without seeing key 1', signCards) +
      col('3', 'Introduce', 'Approve who the buyer sees', introCards) +
      col('', 'Uploading', 'Waiting on the company', upCards) +
      col('', 'Fixing gaps', 'Action plan open', fixCards) +
      col('', 'Decided', 'Signed this week', doneCards) + '</div>');
  }

  /* ---------- review: key 1 (check) and key 2 (sign) ---------- */
  function vReview(id, key) {
    var c = S.company(id);
    if (!c) return vMissing();
    if ((key === 'k1' && c.stage !== 'check') || (key === 'k2' && c.stage !== 'sign')) { history.replaceState(null, '', '#company/' + id); return vCompany(id); }
    var ev = S.evaluate(c), ans = S.answers(c, key), k1ans = key === 'k2' ? S.answers(c, 'k1') : {};
    var k1 = c.review.k1 || {}, blocked = key === 'k2' && k1.by === S.me();
    var sel = ui.sel[id + key] || (ui.sel[id + key] = initSel(c, ev, ans));
    var ch = ev[sel.ci], lock = !S.inScope(c, ch.key);
    var statuses = ev.map(function (x) { return S.checkStatus(c, x, key); });
    var decided = statuses.filter(function (s) { return s !== 'open'; }).length;
    var reqs = S.requested(c, key), prop = reqs.length ? 'conditional' : 'qualified';
    var ready = decided === ev.length, allowed = { qualified: !reqs.length, conditional: !!reqs.length, notyet: true };
    var def = key === 'k2' && k1.outcome && allowed[k1.outcome] ? k1.outcome : prop, pick = ui.outcome[id + key];
    var out = ready ? (pick && allowed[pick] ? pick : def) : (key === 'k2' ? (k1.outcome || prop) : prop);
    ui.outcome['cur' + id + key] = out;

    var left = '<section class="panel" aria-label="Checks"><div class="ph">Checks<span class="ct">' + decided + '/' + ev.length + '</span></div><div style="padding:4px">' +
      ev.map(function (x, i) {
        var st = statuses[i], open = st === 'open' && x.conds.some(function (y) { return y.res === 'needs' && !ans[y.id]; });
        return '<button class="lrow' + (i === sel.ci ? ' on' : '') + (st === 'earlier' ? ' lock' : '') + '" data-a="pickcheck" data-i="' + i + '">' + (open && !blocked ? '<span class="flag" aria-label="Needs an officer"></span>' : '<span class="noflag"></span>') + '<span class="n">' + E(x.name) + '</span>' + badge(STAT[st][0], STAT[st][1]) + '</button>';
      }).join('') + '</div>' +
      '<div class="outc" role="radiogroup" aria-label="Outcome"><span class="lbl">Outcome</span>' +
      [['qualified', 'SBC-Qualified'], ['conditional', 'Conditionally Qualified'], ['notyet', 'Not yet']].map(function (o) {
        var dis = !ready || !allowed[o[0]] || blocked, tag = key === 'k2' ? (k1.outcome === o[0] ? 'Key 1' : '') : (o[0] === prop ? 'Rules' : '');
        return '<label class="opt' + (out === o[0] ? ' on' : '') + '" style="' + (dis && out !== o[0] ? 'opacity:.45;cursor:default' : dis ? 'cursor:default' : '') + '"><input type="radio" name="oc" data-ch="outcome" data-v="' + o[0] + '"' + (out === o[0] ? ' checked' : '') + (dis ? ' disabled' : '') + '>' + o[1] + (tag ? '<span class="rec">' + tag + '</span>' : '') + '</label>';
      }).join('') + '</div>' +
      '<div class="sendbar">' + sendButton(c, key, decided === ev.length, out, reqs, blocked) + '</div></section>';

    var mid;
    if (blocked) {
      mid = '<section class="panel"><div class="ph"><h2>Second check</h2></div><div class="blocked"><b>You signed key 1 on this file.</b><span class="sub">A different officer signs key 2, without seeing your answers first.</span><button class="btn pri" data-a="switch">' + I.swap + 'Switch to ' + E(S.officerName(S.other(S.me()))) + '</button></div></section>';
    } else if (lock) {
      mid = '<section class="panel"><div class="ph"><h2>' + E(ch.name) + '</h2>' + badge('Earlier round') + '</div><div class="allset">Confirmed by two officers in the last round. This re-check covers only the checks that had gaps.</div></section>';
    } else {
      var n = ch.conds.length, answered = ch.conds.filter(function (y) { return ans[y.id]; }).length;
      var first = -1; ch.conds.forEach(function (y, i) { if (first < 0 && !ans[y.id]) first = i; });
      var focus = sel.f != null && sel.f < n ? sel.f : (first >= 0 ? first : 0);
      var rows = '', ask = '', next = '';
      ch.conds.forEach(function (y, i) {
        var a = ans[y.id];
        if (a) {
          var k1a = k1ans[y.id], reveal = key === 'k2' ? '<span class="k1tag' + (k1a && k1a !== a ? ' diff' : '') + '">' + E(S.officerName(k1.by)) + ': ' + (k1a === 'request' ? 'Requested' : k1a ? 'Confirmed' : 'n/a') + '</span>' : '';
          rows += '<div class="q-done' + (i === focus ? ' on' : '') + '"><button class="hit" data-a="focus" data-i="' + i + '" aria-label="Show source for ' + E(y.text) + '"></button><span class="st ' + (a === 'confirm' ? 'ok' : 'ask') + '">' + (a === 'confirm' ? I.check : '') + '</span><span class="tx">' + E(y.text) + '</span><span class="bd">' + reveal + badge(a === 'confirm' ? 'Confirmed' : 'Requested', a === 'confirm' ? 'ok' : 'warn') + '<button class="btn sm" data-a="undo" data-c="' + y.id + '" aria-label="Change answer">Change</button></span></div>';
        } else if (i === first) {
          var m = SBCDocs.meta(c, y.doc), met = y.res === 'met';
          ask = '<div class="ask-card" role="group" aria-label="Condition"><span class="meta">' + badge(met ? 'Met' : 'Needs officer', met ? 'ok' : 'warn') + (i + 1) + ' of ' + n + '</span>' +
            '<span class="qt">' + E(y.text) + '</span>' +
            '<span><button class="srcb" data-a="focus" data-i="' + i + '"><span class="num' + (m.kind === 'Company-made' ? ' w' : m.kind === 'Missing' ? ' m' : '') + '">' + (i + 1) + '</span>' + I.file + '<span class="f2">' + E(m.file) + '</span>' + badge(m.kind, KT[m.kind]) + '</button></span>' +
            '<span class="why">' + E(y.why) + '</span>' +
            (!met && y.ai ? '<div class="aihint">' + I.cube + '<span><b>AI, later</b><span>' + E(y.ai) + '</span></span></div>' : '') +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            (met ? '<button class="btn pri" data-a="answer" data-c="' + y.id + '" data-v="confirm">Confirm</button><button class="btn" data-a="answer" data-c="' + y.id + '" data-v="request">Request</button>'
              : '<button class="btn pri" data-a="answer" data-c="' + y.id + '" data-v="request">Request</button><button class="btn" data-a="answer" data-c="' + y.id + '" data-v="confirm">Confirm</button>') + '</div></div>';
        } else {
          next += '<div class="q-next"><button class="hit" data-a="focus" data-i="' + i + '" aria-label="Show source"></button><span class="st pend"></span><span class="tx">' + E(y.text) + '</span></div>';
        }
      });
      var nreq = ch.conds.filter(function (y) { return ans[y.id] === 'request'; }).length;
      mid = '<section class="panel" style="min-width:0;overflow:hidden"><div class="ph"><h2>' + E(ch.name) + '</h2>' + badge(STAT[statuses[sel.ci]][0], STAT[statuses[sel.ci]][1]) + '<span class="ct">' + answered + '/' + n + '</span></div>' +
        '<div style="padding:10px 12px;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid var(--line)"><div class="prog" aria-hidden="true">' + ch.conds.map(function (y) { return '<span class="' + (ans[y.id] === 'confirm' ? 'done' : ans[y.id] ? 'ask' : '') + '"></span>'; }).join('') + '</div>' +
        '<span class="ran">' + (key === 'k1' ? 'Checked by rules ' + (c.review.round > 1 ? 'again' : 'on arrival') + ', ' + D.long(c.since) : 'Second check. ' + E(S.officerName(k1.by)) + '’s answer shows after yours.') + '</span></div>' +
        rows + ask + next + (first < 0 ? '<div class="allset">' + (nreq ? nreq + ' requested from the company.' : 'All ' + n + ' confirmed.') + '</div>' : '') + '</section>';
      sel.view = sel.f != null ? sel.f : focus;
    }

    var vc = blocked || lock ? ch.conds[0] : ch.conds[sel.view != null && sel.view < ch.conds.length ? sel.view : 0];
    var vm = SBCDocs.meta(c, vc.doc), pinN = ch.conds.indexOf(vc) + 1;
    var viewer = '<section class="viewer" aria-label="Document"><div class="vbar">' + I.file + '<span class="f">' + E(vm.file) + '</span>' + badge(vm.kind, KT[vm.kind]) + '</div><div class="stage">' + SBCDocs.render(c, vc.doc, blocked ? [] : vc.hl, pinN) + '</div></section>';

    var mode = key === 'k1' ? (c.review.round > 1 ? 'Re-check' : 'Check') : 'Second check';
    var late = c.due && c.due < D.today;
    return shell('board', crumbs([['Board', 'board'], [c.short, 'company/' + c.id], [mode]]),
      '<div class="ttl"><h1>' + E(c.name) + '</h1>' + badge(mode, 'info') + (late ? badge('Overdue ' + D.days(c.due, D.today) + 'd', 'err') : c.due ? badge('Due ' + D.short(c.due), 'mono') : '') +
      (key === 'k2' ? '<span class="sub">Key 1 by ' + E(S.officerName(k1.by)) + '</span>' : (!c.owner ? '<span class="sub">Unassigned. Answering takes the file.</span>' : '<span class="sub">' + E(S.officerName(c.owner)) + '</span>')) +
      '<div class="acts"><a class="btn" href="#company/' + c.id + '">Company record</a></div></div>' +
      '<div class="cg">' + left + mid + viewer + '</div>');
  }
  function initSel(c, ev, ans) {
    for (var i = 0; i < ev.length; i++) { if (!S.inScope(c, ev[i].key)) continue; if (ev[i].conds.some(function (y) { return !ans[y.id]; })) return { ci: i, f: null }; }
    for (var j = 0; j < ev.length; j++) if (S.inScope(c, ev[j].key)) return { ci: j, f: null };
    return { ci: 0, f: null };
  }
  function sendButton(c, key, all, out, reqs, blocked) {
    if (blocked) return '<button class="btn pri wide lg" disabled>Sign</button>';
    if (key === 'k1') {
      if (!all) return '<span class="hint">Answer every condition to send.</span><button class="btn pri wide lg" disabled>Send</button>';
      if (out === 'conditional') return '<span class="hint">' + reqs.length + ' gap' + (reqs.length === 1 ? '' : 's') + ' go on the action plan.</span><button class="btn pri wide lg" data-a="nav" data-h="plan/' + c.id + '">Next: action plan</button>';
      return '<span class="hint">A second officer signs next.</span><button class="btn pri wide lg" data-a="send">Send</button>';
    }
    if (!all) return '<span class="hint">Answer every condition to sign.</span><button class="btn pri wide lg" disabled>Sign</button>';
    return '<span class="hint">' + (out === 'qualified' ? 'Issues the SBC-Qualified mark.' : out === 'conditional' ? 'Sends the action plan to the company.' : 'Closes the file as Not yet.') + '</span><button class="btn pri wide lg" data-a="sign">Sign</button>';
  }

  /* ---------- action plan ---------- */
  function vPlan(id) {
    var c = S.company(id); if (!c) return vMissing();
    if (c.stage !== 'check') { history.replaceState(null, '', '#company/' + id); return vCompany(id); }
    var reqs = S.requested(c, 'k1');
    var items = ui.plan[id] || (ui.plan[id] = reqs.map(function (x, i) {
      var ag = x.rule === 'GR-1' ? S.data.agents.filter(function (a) { return a.country === x.country && a.status === 'active'; }) : [];
      ag.sort(function (a, b) { return (b.sectors.indexOf(c.sector) >= 0) - (a.sectors.indexOf(c.sector) >= 0); });
      return { id: 'p' + (i + 1), rule: x.rule, check: x.check, text: x.plan || x.text, due: D.add(D.today, 14), done: false, agents: ag.slice(0, 2).map(function (a) { return a.id; }), country: x.country };
    }));
    var left = '<section class="panel wrap"><div class="ph">Gaps<span class="ct">' + reqs.length + '</span></div>' + reqs.map(function (x) { return '<div class="q-done"><span class="st ask"></span><span class="tx">' + E(x.text) + '</span><span class="bd">' + badge(x.checkName) + '</span></div>'; }).join('') +
      '<div class="pb"><a class="btn sm" href="#check/' + c.id + '">' + I.chev + 'Back to checks</a></div></section>';
    var mid = '<section class="panel"><div class="ph">Action plan<span class="ct">' + items.length + ' item' + (items.length === 1 ? '' : 's') + '</span></div>' +
      items.map(function (it, i) {
        var ag = it.rule === 'GR-1' ? S.data.agents.filter(function (a) { return a.country === it.country && a.status === 'active'; }) : [];
        return '<div class="pl-item"><span class="n">' + (i + 1) + '</span><div><textarea id="pt' + i + '" data-in="ptext" data-i="' + i + '" aria-label="What the company needs to provide">' + E(it.text) + '</textarea>' +
          (ag.length ? '<div class="chips" role="group" aria-label="Suggested agents">' + ag.map(function (a) { var on = it.agents.indexOf(a.id) >= 0; return '<button class="chip' + (on ? ' on' : '') + '" data-a="pagent" data-i="' + i + '" data-g="' + a.id + '" aria-pressed="' + on + '">' + E(a.name) + ' · ' + E(a.city) + '</button>'; }).join('') + '</div>' : '') + '</div>' +
          '<label class="fl" for="pd' + i + '"><span class="muted">Due</span><input id="pd' + i + '" type="date" class="input" data-ch="pdue" data-i="' + i + '" value="' + it.due + '" min="' + D.today + '"></label></div>';
      }).join('') +
      '<div class="sendbar"><span class="hint">The company sees this plan once a second officer signs. It stays Conditionally Qualified and is not introduced until it is fixed.</span><button class="btn pri lg" data-a="sendplan">Send to a second officer</button></div></section>';
    var preview = '<section class="viewer" aria-label="Company view"><div class="vbar">' + I.file + '<span class="f">Action plan · company view</span>' + badge('Draft') + '</div><div class="stage"><div class="paper">' +
      '<div class="p-head"><b>SBC Capital</b><span>Draft · not sent</span></div><div style="font-weight:700;font-size:14px;margin-bottom:4px">Action plan for ' + E(c.name) + '</div>' +
      '<div class="p-note">Status while open: Conditionally Qualified. Not introduced to buyers.</div>' +
      '<table class="p-tbl"><tr><th>#</th><th>What we need</th><th>Due</th></tr>' + items.map(function (it, i) { return '<tr><td>' + (i + 1) + '</td><td>' + E(it.text) + '</td><td style="white-space:nowrap">' + D.short(it.due) + '</td></tr>'; }).join('') + '</table>' +
      (items.some(function (it) { return it.agents && it.agents.length; }) ? '<p style="margin-top:12px">Agents SBC has reviewed: ' + items.reduce(function (a, it) { return a.concat(it.agents || []); }, []).filter(function (v, i, s) { return s.indexOf(v) === i; }).map(function (g) { return E((S.agent(g) || {}).name); }).join(', ') + '. SBC refers you to an agent and does not act as one.</p>' : '') +
      '<div class="p-foot">Fixing these re-runs only the checks that had gaps.</div></div></div></section>';
    return shell('board', crumbs([['Board', 'board'], [c.short, 'company/' + c.id], ['Action plan']]),
      '<div class="ttl"><h1>' + E(c.name) + '</h1>' + badge('Action plan', 'warn') + '<span class="sub">Conditionally Qualified, signed by two officers</span></div><div class="cg">' + left + mid + preview + '</div>');
  }

  /* ---------- company record ---------- */
  function vCompany(id) {
    var c = S.company(id); if (!c) return vMissing();
    var tab = ui.tab['co' + id] || 'overview', me = S.me();
    var acts = '';
    if (c.stage === 'check') acts = '<a class="btn pri" href="#check/' + c.id + '">Open check</a>';
    if (c.stage === 'sign') acts = '<a class="btn pri" href="#sign/' + c.id + '">Open second check</a>';
    if (c.stage === 'plan') acts = '<button class="btn" data-a="remind" data-id="' + c.id + '">Remind company</button><button class="btn" data-a="fixes" data-id="' + c.id + '" title="Demo only. Phase 2 does this from the company portal">Demo: company sends fixes</button>';
    if (c.stage === 'uploading') acts = '<button class="btn" data-a="remind" data-id="' + c.id + '">Remind company</button>';
    if (c.stage === 'qualified') acts = '<button class="btn" data-a="recheck" data-id="' + c.id + '">Start re-check</button><button class="btn dan" data-a="withdraw" data-id="' + c.id + '">Withdraw mark</button>';
    var head = '<div class="ttl"><h1>' + E(c.name) + '</h1>' + stageBadge(c) + '<span class="sub">' + E(c.country) + ' · ' + E(S_sector(c)) + '</span><div class="acts">' + acts + '</div></div>';
    var tabs = '<div class="tabs" role="tablist">' + [['overview', 'Overview'], ['docs', 'Documents'], ['history', 'History']].map(function (t) { return '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="co' + id + '" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
    var body = '';
    if (tab === 'overview') {
      var leftp = [], rightp = [];
      if (c.stage === 'uploading') {
        leftp.push('<section class="panel"><div class="ph">Uploads<span class="ct">' + c.uploads.done + '/' + c.uploads.total + '</span></div><div class="pb" style="display:flex;flex-direction:column;gap:10px"><div class="bar" style="height:6px"><span style="width:' + Math.round(100 * c.uploads.done / c.uploads.total) + '%"></span></div>' +
          '<span class="sub">The rules run once every document is in. Still missing:</span>' + c.uploads.missing.map(function (m) { return '<div class="q-next" style="padding:0"><span class="st pend"></span><span class="tx" style="color:var(--ink)">' + E(m) + '</span></div>'; }).join('') + '</div></section>');
      } else if (c.stage === 'notyet' && !c.reg) {
        leftp.push('<section class="panel"><div class="ph">Decision</div><div class="pb">' + badge('Not yet', 'err') + ' <span class="sub">' + E(c.reason) + '. Signed by two officers on ' + D.long(c.decided) + '.</span></div></section>');
      } else if (c.reg) {
        var key = c.review.k2 ? 'k2' : 'k1', ev = S.evaluate(c);
        leftp.push('<section class="panel"><div class="ph">Checks<span class="ct">' + S.progress(c, key).done + '/5</span></div><table class="tbl"><tbody>' +
          ev.map(function (ch) {
            var st = S.checkStatus(c, ch, key), nn = ch.conds.filter(function (y) { return y.res === 'needs'; }).length;
            return '<tr><td class="nm" style="width:140px">' + E(ch.name) + '</td><td class="sub">' + E(nn ? nn + ' for an officer · ' + ch.conds.length + ' conditions' : 'All ' + ch.conds.length + ' met by the rules') + '</td><td class="r">' + badge(STAT[st][0], STAT[st][1]) + '</td></tr>';
          }).join('') + '</tbody></table></section>');
        if (c.stage === 'notyet') leftp.unshift('<section class="panel"><div class="ph">Decision</div><div class="pb">' + badge('Not yet', 'err') + ' <span class="sub">' + E(c.reason || '') + '. ' + D.long(c.decided) + '.</span></div></section>');
      }
      if (c.plan && !c.plan.draft) {
        leftp.push('<section class="panel"><div class="ph">Action plan<span class="ct">sent ' + D.short(c.plan.sent) + '</span></div><table class="tbl"><tbody>' + c.plan.items.map(function (it, i) {
          return '<tr><td class="mono muted" style="width:32px">' + (i + 1) + '</td><td>' + E(it.text) + (it.agents && it.agents.length ? '<div class="muted" style="font-size:12px">Agents: ' + it.agents.map(function (g) { return E((S.agent(g) || {}).name); }).join(', ') + '</div>' : '') + '</td><td class="mono" style="white-space:nowrap">' + D.short(it.due) + '</td><td class="r">' + (it.done ? badge('Done', 'ok') : badge('Open')) + '</td></tr>';
        }).join('') + '</tbody></table></section>');
      }
      var intros = [];
      S.data.opps.forEach(function (o) {
        (o.intros || []).forEach(function (x) { if (x.company === c.id) intros.push({ o: o, s: x.status, at: x.at }); });
        if (o.stage === 'approve' && o.picks && o.picks.ids.indexOf(c.id) >= 0) intros.push({ o: o, s: 'awaiting approval', at: o.picks.at });
      });
      if (c.stage === 'qualified' || intros.length) leftp.push('<section class="panel"><div class="ph">Introductions<span class="ct">' + intros.length + '</span></div>' + (intros.length ? '<table class="tbl"><tbody>' + intros.map(function (x) {
        return '<tr class="go" data-a="nav" data-h="opp/' + x.o.id + '"><td class="nm">' + E(x.o.title) + '</td><td class="sub">' + E(partyName(x.o)) + '</td><td class="r">' + introBadge(x.s) + '</td><td class="mono muted r" style="width:70px">' + D.short(x.at) + '</td></tr>';
      }).join('') + '</tbody></table>' : '<div class="empty">No introductions yet. The match rules include this company from today.</div>') + '</section>');
      if (c.mark) {
        var left = D.days(D.today, c.mark.validTo), off = c.mark.withdrawn;
        rightp.push('<section class="panel"><div class="ph">SBC-Qualified mark</div><div class="mark-card' + (off ? ' off' : '') + '"><span class="mark-ico" aria-hidden="true"></span><span style="display:flex;flex-direction:column;flex:1"><b>' + (off ? 'Withdrawn ' + D.long(c.mark.withdrawn) : 'Valid until ' + D.long(c.mark.validTo)) + '</b><span class="mono muted">' + E(c.mark.id) + '</span></span></div>' +
          (off ? '' : '<div style="padding:0 12px 12px;display:flex;flex-direction:column;gap:8px"><div class="cf"><div class="bar"><span style="width:' + Math.max(4, Math.round(100 * left / 365)) + '%;background:var(--ok)"></span></div><span class="mono muted">' + Math.round(left / 30.4) + ' mo left</span></div><span class="sub" style="font-size:12px">Screening re-runs monthly. Last run ' + D.long(c.mark.lastScreen) + ', clear.</span></div>') + '</section>');
      }
      var rv = c.review || {};
      rightp.push('<section class="panel"><div class="ph">Details</div><dl class="kvl">' +
        '<dt>Markets</dt><dd>' + E((c.target || []).join(', ')) + '</dd>' +
        (c.reg ? '<dt>Local presence</dt><dd>' + (c.target || []).map(function (k) { var l = S.presence(c, k); return E(k) + ': ' + (l ? E(S.presenceText(l)) : '<span class="muted">none yet</span>'); }).join('<br>') + '</dd>' : '') +
        '<dt>Work</dt><dd>' + E((c.capabilities || []).map(function (x) { return SBC_SEED.capabilities[x]; }).join(', ') || '—') + '</dd>' +
        '<dt>Contact</dt><dd>' + E(c.contact || '') + '</dd>' +
        (rv.k1 ? '<dt>Key 1</dt><dd>' + E(S.officerName(rv.k1.by)) + (rv.k1.at ? ' · ' + D.short(rv.k1.at) : '') + '</dd>' : '') +
        (rv.k2 ? '<dt>Key 2</dt><dd>' + E(S.officerName(rv.k2.by)) + (rv.k2.at ? ' · ' + D.short(rv.k2.at) : '') + '</dd>' : '') +
        '<dt>Owner</dt><dd>' + (c.owner ? E(S.officerName(c.owner)) : '<span class="muted">Unassigned</span>') + '</dd>' +
        '<dt>Applied</dt><dd>' + D.long(c.applied) + '</dd></dl></section>');
      body = '<div class="grid2"><div class="stack">' + leftp.join('') + '</div><div class="stack">' + rightp.join('') + '</div></div>';
    } else if (tab === 'docs') {
      var docs = SBCDocs.list(c), di = ui.tab['doc' + id] || (docs[0] || {}).key;
      body = docs.length ? '<div class="grid2" style="grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)"><section class="panel"><div class="ph">Documents<span class="ct">' + docs.length + '</span></div><div style="padding:4px">' +
        docs.map(function (d) { return '<button class="lrow' + (d.key === di ? ' on' : '') + '" data-a="tab" data-k="doc' + id + '" data-v="' + d.key + '">' + I.file + '<span class="n" style="font-weight:400">' + E(d.file) + '</span>' + badge(d.kind, KT[d.kind]) + '</button>'; }).join('') + '</div></section>' +
        '<section class="viewer" aria-label="Document"><div class="vbar">' + I.file + '<span class="f">' + E(SBCDocs.meta(c, di).file) + '</span></div><div class="stage">' + SBCDocs.render(c, di, [], 0) + '</div></section></div>'
        : '<section class="panel"><div class="empty">Documents appear here once the company finishes uploading.</div></section>';
    } else {
      body = auditTable(S.data.audit.filter(function (a) { return a.file === id; }), false);
    }
    return shell('companies', crumbs([['Companies', 'companies'], [c.short]]), head + tabs + body);
  }
  function S_sector(c) { return SBC_SEED.sectors[c.sector] || c.sector; }
  function introBadge(s) { var m = { released: ['Released', 'info'], meeting: ['Meeting set', 'info'], won: ['Won', 'ok'], lost: ['Lost', ''], declined: ['Declined', ''], 'awaiting approval': ['Awaiting approval', 'warn'] }[s] || [s, '']; return badge(m[0], m[1]); }

  /* ---------- companies ---------- */
  function vCompanies() {
    var tab = ui.tab.cos || 'all', q = (ui.q || '').toLowerCase();
    var groups = { all: function () { return true; }, review: function (c) { return c.stage === 'check' || c.stage === 'sign'; }, conditional: function (c) { return c.stage === 'plan'; }, qualified: function (c) { return c.stage === 'qualified'; }, uploading: function (c) { return c.stage === 'uploading'; }, notyet: function (c) { return c.stage === 'notyet'; } };
    var names = [['all', 'All'], ['review', 'In review'], ['conditional', 'Conditional'], ['qualified', 'Qualified'], ['uploading', 'Uploading'], ['notyet', 'Not yet']];
    var rows = S.data.companies.filter(groups[tab]).filter(function (c) { return !q || (c.name + ' ' + c.country + ' ' + S_sector(c)).toLowerCase().indexOf(q) >= 0; });
    var order = { check: 0, sign: 1, plan: 2, uploading: 3, qualified: 4, notyet: 5 };
    rows.sort(function (a, b) { return order[a.stage] - order[b.stage] || a.name.localeCompare(b.name); });
    function next(c) {
      if (c.stage === 'check') return (c.review.scope ? 'Gaps only' : 'Check') + ' · due ' + D.short(c.due);
      if (c.stage === 'sign') return 'Key 2 · due ' + D.short(c.due);
      if (c.stage === 'plan') return 'Plan due ' + D.short(c.due);
      if (c.stage === 'uploading') return c.uploads.done + '/' + c.uploads.total + ' documents';
      if (c.stage === 'qualified') return c.mark && c.mark.withdrawn ? 'Withdrawn' : 'Re-check ' + D.month(c.mark.validTo);
      return c.reason || '';
    }
    return shell('companies', '<b>Companies</b>',
      '<div class="ttl"><h1>Companies</h1><div class="acts"><input id="cq" class="input" style="width:240px" data-in="q" value="' + E(ui.q || '') + '" placeholder="Search companies" aria-label="Search companies"></div></div>' +
      '<div class="tabs" role="tablist">' + names.map(function (t) { var n = S.data.companies.filter(groups[t[0]]).length; return '<button role="tab" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="cos" data-v="' + t[0] + '">' + t[1] + ' <span class="ct">' + n + '</span></button>'; }).join('') + '</div>' +
      '<section class="panel"><table class="tbl"><thead><tr><th>Company</th><th>Country</th><th>Sector</th><th>Status</th><th>Valid until</th><th>Next</th><th>Owner</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (c) {
        return '<tr class="go" data-a="nav" data-h="company/' + c.id + '"><td class="nm">' + E(c.name) + '</td><td>' + E(c.country) + '</td><td class="sub">' + E(S_sector(c)) + '</td><td>' + stageBadge(c) + '</td><td class="mono">' + (c.mark && !c.mark.withdrawn ? D.month(c.mark.validTo) : '·') + '</td><td class="mono sub" style="font-size:12px">' + E(next(c)) + '</td><td class="sub">' + (c.owner ? E(S.officerName(c.owner)) : '·') + '</td></tr>';
      }).join('') : '<tr><td colspan="7"><div class="empty">No companies match “' + E(ui.q) + '”.</div></td></tr>') +
      '</tbody></table></section><span class="muted">' + rows.length + ' of ' + S.data.companies.length + ' companies</span>');
  }

  /* ---------- opportunities ---------- */
  function vOpps() {
    var tab = ui.tab.opps || 'match';
    var names = [['match', 'To match'], ['approve', 'Awaiting approval'], ['introduced', 'Introduced'], ['closed', 'Closed']];
    var rows = S.data.opps.filter(function (o) { return o.stage === tab; });
    return shell('opps', '<b>Opportunities</b>',
      '<div class="ttl"><h1>Opportunities</h1><span class="sub">Buyer needs, official tenders, investor mandates and directory requests</span></div>' +
      '<div class="tabs" role="tablist">' + names.map(function (t) { return '<button role="tab" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="opps" data-v="' + t[0] + '">' + t[1] + ' <span class="ct">' + S.data.opps.filter(function (o) { return o.stage === t[0]; }).length + '</span></button>'; }).join('') + '</div>' +
      '<section class="panel"><table class="tbl"><thead><tr><th>Opportunity</th><th>From</th><th>Kind</th><th>Country</th><th>Closes</th><th>Matches</th><th></th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (o) {
        var m = S.match(o), n = o.stage === 'approve' ? o.picks.ids.length : o.stage === 'match' ? m.ranked.length : o.intros.length;
        var st = o.stage === 'match' ? (n ? badge('Ready to pick', 'info') : badge('No match yet', 'warn')) : o.stage === 'approve' ? badge('Key 2', 'warn') : o.stage === 'introduced' ? badge('Introduced', 'info') : badge('Closed');
        return '<tr class="go" data-a="nav" data-h="opp/' + o.id + '"><td class="nm">' + E(o.title) + '</td><td class="sub">' + E(partyName(o)) + '</td><td>' + badge(KIND[o.kind]) + '</td><td>' + E((o.countries || [o.country]).join(', ')) + '</td><td class="mono">' + D.short(o.closes) + '</td><td class="mono">' + n + '</td><td class="r">' + st + '</td></tr>';
      }).join('') : '<tr><td colspan="7"><div class="empty">Nothing here right now.</div></td></tr>') + '</tbody></table></section>');
  }

  function vOpp(id) {
    var o = S.opp(id); if (!o) return vMissing();
    var me = S.me(), party = S.party(o.from) || {}, m = S.match(o);
    var stB = o.stage === 'match' ? badge('To match', 'info') : o.stage === 'approve' ? badge('Awaiting approval', 'warn') : o.stage === 'introduced' ? badge('Introduced', 'info') : badge('Closed');
    var head = '<div class="ttl"><h1>' + E(o.title) + '</h1>' + badge(KIND[o.kind]) + stB + '<span class="sub">' + E(party.name) + ' · ' + E(party.city) + '</span>' + badge('Closes ' + D.short(o.closes), 'mono') + '</div>';
    var reqs = '<section class="panel"><div class="ph">Requirements</div><dl class="kvl">' +
      '<dt>Sector</dt><dd>' + E((o.sectors || [o.sector]).map(function (s) { return SBC_SEED.sectors[s]; }).join(', ')) + '</dd>' +
      '<dt>Country</dt><dd>' + E((o.countries || [o.country]).join(', ')) + '</dd>' +
      (o.kind === 'mandate' ? '<dt>Ticket</dt><dd>' + E(o.value) + '</dd><dt>Company</dt><dd>Open to investment</dd>' : o.kind === 'request' ? '<dt>Company</dt><dd>' + E(S.company(o.company).name) + '</dd>' : '<dt>Work</dt><dd>' + E(SBC_SEED.capabilities[o.capability]) + '</dd><dt>Value</dt><dd>' + E(o.value) + '</dd>') +
      '<dt>Mark</dt><dd>SBC-Qualified and current</dd><dt>Source</dt><dd>' + E(o.source) + ' · ' + D.short(o.posted) + '</dd></dl><div class="pb sub" style="border-top:1px solid var(--line)">' + E(o.brief) + '</div></section>';
    var body = '';
    if (o.stage === 'match') {
      var pk = ui.picks[id] || (ui.picks[id] = m.ranked.slice(0, 3).map(function (r) { return r.c.id; }));
      var total = Math.max(1, (m.stages[0] ? m.stages[0].pass.length + m.stages[0].drop.length : 1));
      var funnel = m.skip ? '<section class="panel"><div class="ph">Four rule stages</div><div class="pb" style="display:flex;flex-direction:column;gap:8px"><span>' + E(party.name) + ' found ' + E(S.company(o.company).short) + ' in the directory.</span><span class="sub">Directory requests skip the four stages and go straight to two officers.</span></div></section>'
        : '<section class="panel"><div class="ph">Four rule stages<span class="ct">' + m.others + ' in other sectors</span></div><div class="funnel">' + m.stages.map(function (s, i) {
          var w = Math.max(14, Math.round(100 * s.pass.length / total));
          return '<div class="fstage"><span class="nm">' + E(s.name) + '</span><div><div class="fbar' + (i === 3 ? ' last' : '') + '" style="width:' + w + '%;animation-delay:' + (i * .08) + 's">' + s.pass.length + '</div>' +
            (s.pass.length && i < 3 ? '<div class="fdrop" style="color:var(--ink2)">' + s.pass.map(function (c) { return E(c.short); }).join(', ') + '</div>' : '') +
            (s.drop.length ? '<div class="fdrop">' + s.drop.map(function (d) { return 'Out: ' + E(d.c.short) + ' \u00b7 ' + E(d.why); }).join('<br>') + '</div>' : '') + '</div></div>';
        }).join('') + '</div><div class="pb sub" style="border-top:1px solid var(--line);font-size:12px">' + E(S.MATCH_RULES.map(function (r) { return r.stage + ': ' + r.text; }).join('. ')) + '.</div></section>';
      var short = '<section class="panel"><div class="ph">Shortlist<span class="ct">' + pk.length + ' picked</span></div>' +
        (m.ranked.length ? m.ranked.map(function (r, i) { var on = pk.indexOf(r.c.id) >= 0; return '<label class="mrow' + (on ? ' on' : '') + '"><input type="checkbox" data-ch="pick" data-v="' + r.c.id + '"' + (on ? ' checked' : '') + '><span><span class="nm">' + (i + 1) + '. ' + E(r.c.name) + '</span><br><span class="why2">' + E(r.why) + '</span></span><span>' + badge('Ranked ' + (i + 1)) + '</span></label>'; }).join('') +
          '<div class="sendbar"><span class="hint">A second officer approves each match before ' + E(party.name) + ' sees anything.</span><button class="btn pri lg" data-a="shortlist"' + (pk.length ? '' : ' disabled') + '>Send for approval</button></div>'
          : '<div class="empty">No qualified company fits yet. It stays open, and the rules run again when a company qualifies.</div>') + '</section>';
      body = '<div class="cg" style="grid-template-columns:300px minmax(0,1fr) minmax(0,1fr)">' + reqs + funnel + short + '</div>';
    } else if (o.stage === 'approve') {
      var own = o.picks.by === me, ids = o.picks.ids, ap = o.approvals || {};
      var f = ui.mfocus[id] && ids.indexOf(ui.mfocus[id]) >= 0 ? ui.mfocus[id] : ids.filter(function (x) { return !ap[x]; })[0] || ids[0];
      var fc = S.company(f), rk = m.ranked.map(function (r) { return r.c.id; }).indexOf(f);
      var all = ids.every(function (x) { return ap[x]; }), anyOk = ids.some(function (x) { return ap[x] === 'approve'; });
      var left2 = '<section class="panel"><div class="ph">Matches<span class="ct">' + ids.filter(function (x) { return ap[x]; }).length + '/' + ids.length + '</span></div><div style="padding:4px">' +
        ids.map(function (x) { var cc = S.company(x); return '<button class="lrow' + (x === f ? ' on' : '') + '" data-a="mfocus" data-v="' + x + '"><span class="n">' + E(cc.short) + '</span>' + (ap[x] === 'approve' ? badge('Approved', 'ok') : ap[x] === 'notfit' ? badge('Not a fit') : badge('Open')) + '</button>'; }).join('') + '</div>' +
        '<div class="sendbar">' + (own ? '<span class="hint">You picked these. A different officer approves and releases.</span><button class="btn pri" data-a="switch">' + I.swap + 'Switch to ' + E(S.officerName(S.other(me))) + '</button>'
          : '<span class="hint">Picked by ' + E(S.officerName(o.picks.by)) + ' on ' + D.short(o.picks.at) + '.</span><button class="btn pri wide lg" data-a="release"' + (all && anyOk ? '' : ' disabled') + '>Release to ' + E(party.name) + '</button><button class="btn sm" data-a="sendback">Send back for matching</button>') + '</div></section>';
      var whyRows = m.skip ? [['Directory request', 'Asked for by name. Skips the four stages.']] : [
        ['Eligible', 'Mark current until ' + D.long(fc.mark.validTo) + ', ' + S_sector(fc) + ', targets ' + (fc.target || []).join(', ')],
        ['Capable', o.kind === 'mandate' ? 'Open to investment' : SBC_SEED.capabilities[o.capability] + ' · ' + fc.refs + ' references'],
        ['Ready', (o.countries || [o.country]).map(function (k) { var l = S.presence(fc, k); return l ? k + ': ' + S.presenceText(l) : ''; }).filter(Boolean).join(' · ')],
        ['Ranked', rk >= 0 ? 'Number ' + (rk + 1) + ' of ' + m.ranked.length : 'Not ranked today']
      ];
      var mid2 = '<section class="panel"><div class="ph"><h2>' + E(fc.name) + '</h2></div>' +
        whyRows.map(function (w) { return '<div class="q-done"><span class="st ok">' + I.check + '</span><span class="tx" style="white-space:normal"><b style="font-weight:500">' + E(w[0]) + '</b> · <span class="sub">' + E(w[1]) + '</span></span><span></span></div>'; }).join('') +
        (own ? '' : '<div style="padding:12px;display:flex;gap:8px"><button class="btn ' + (ap[f] !== 'notfit' ? 'pri' : '') + '" data-a="approvem" data-v="approve" data-c="' + f + '">' + (ap[f] === 'approve' ? 'Approved' : 'Approve match') + '</button><button class="btn" data-a="approvem" data-v="notfit" data-c="' + f + '">' + (ap[f] === 'notfit' ? 'Marked not a fit' : 'Not a fit') + '</button></div>') + '</section>';
      var viewer2 = '<section class="viewer" aria-label="SBC record"><div class="vbar">' + I.file + '<span class="f">SBC record · ' + E(fc.short) + '</span>' + badge('SBC record', 'ok') + '</div><div class="stage">' + SBCDocs.render(fc, 'record', ['mark', 'cap'], 0) + '</div></section>';
      body = '<div class="cg">' + left2 + mid2 + viewer2 + '</div>';
    } else {
      var rows = o.intros.map(function (x) {
        var c = S.company(x.company), fin = x.status === 'won' || x.status === 'lost' || x.status === 'declined';
        return '<tr><td class="nm"><a href="#company/' + c.id + '">' + E(c.name) + '</a></td><td class="mono">' + D.short(x.at) + '</td><td>' + introBadge(x.status) + '</td><td class="r">' + (fin ? '' : '<span style="display:inline-flex;gap:6px">' + (x.status !== 'meeting' ? '<button class="btn sm" data-a="outcome" data-c="' + c.id + '" data-v="meeting">Meeting set</button>' : '') + '<button class="btn sm" data-a="outcome" data-c="' + c.id + '" data-v="won">Won</button><button class="btn sm" data-a="outcome" data-c="' + c.id + '" data-v="lost">Lost</button></span>') + '</td></tr>';
      }).join('');
      body = '<div class="grid2">' + '<section class="panel"><div class="ph">Introductions<span class="ct">released ' + (o.released ? D.short(o.released.at) + ' by ' + E(S.officerName(o.released.by)) : '') + '</span></div><table class="tbl"><thead><tr><th>Company</th><th>Updated</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table><div class="pb sub" style="border-top:1px solid var(--line);font-size:12px">A logged outcome is what the success commission is charged against.</div></section>' + reqs + '</div>';
    }
    return shell('opps', crumbs([['Opportunities', 'opps'], [o.title]]), head + body);
  }

  /* ---------- agents ---------- */
  function vAgents() {
    var ag = S.data.agents, exp = ag.filter(function (a) { return a.licenceTo && D.days(D.today, a.licenceTo) <= 60; }).length;
    return shell('agents', '<b>Agent panel</b>',
      '<div class="ttl"><h1>Agent panel</h1><span class="sub">Local agents SBC refers companies to. SBC is not the agent.</span><div class="acts"><button class="btn pri" data-a="addagent">Add agent</button></div></div>' +
      '<div class="stats"><div class="stat"><span>Agents</span><b>' + ag.length + '</b></div><div class="stat"><span>Referrals this quarter</span><b>' + ag.reduce(function (n, a) { return n + a.referrals; }, 0) + '</b></div><div class="stat"><span>Licence expiring in 60 days</span><b style="color:' + (exp ? 'var(--warn)' : 'inherit') + '">' + exp + '</b></div><div class="stat"><span>Waiting for review</span><b>' + ag.filter(function (a) { return a.status === 'review'; }).length + '</b></div></div>' +
      '<section class="panel"><table class="tbl"><thead><tr><th>Agent</th><th>Location</th><th>Sectors</th><th>Licence to</th><th class="r">Referrals</th><th>Status</th><th></th></tr></thead><tbody>' +
      ag.map(function (a) {
        var e = a.licenceTo && D.days(D.today, a.licenceTo) <= 60;
        return '<tr><td class="nm">' + E(a.name) + '</td><td>' + E(a.city) + ', ' + E(a.country) + '</td><td class="sub">' + E(a.sectors.map(function (s) { return SBC_SEED.sectors[s] || s; }).join(', ')) + '</td><td class="mono">' + (a.licenceTo ? D.month(a.licenceTo) : '·') + '</td><td class="mono r">' + a.referrals + '</td><td>' + (a.status === 'review' ? badge('Waiting for review', 'info') : e ? badge('Licence expiring', 'warn') : badge('Active', 'ok')) + '</td><td class="r">' + (a.status === 'review' ? '<button class="btn sm" data-a="approveagent" data-id="' + a.id + '">Approve</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></section>');
  }

  /* ---------- audit ---------- */
  function auditTable(rows, groupByDay) {
    if (!rows.length) return '<section class="panel"><div class="empty">Nothing recorded yet.</div></section>';
    var html = '', day = '';
    rows.forEach(function (a) {
      var d = a.t.slice(0, 10);
      if (groupByDay && d !== day) { day = d; html += '<tr><td colspan="6" class="muted" style="height:30px;font-size:12px;background:var(--wash)">' + (D.when(d) === 'Today' || D.when(d) === 'Yesterday' ? D.when(d) : D.long(d)) + '</td></tr>'; }
      var who = a.who === 'rules' ? '<span class="av" style="background:#E3EAFD;color:#1F4FD1">R</span>Rules' : a.who === 'company' ? '<span class="av" style="background:#E6E8EC;color:#3D4250">Co</span>Company' : '<span class="av">' + E(a.who) + '</span>' + E(S.officerName(a.who));
      var f = S.company(a.file) || S.opp(a.file), fl = f ? '<a href="#' + (S.company(a.file) ? 'company/' : 'opp/') + a.file + '">' + E(f.short || f.title) + '</a>' : E(a.file);
      html += '<tr><td class="mono muted" style="width:64px">' + a.t.slice(11, 16) + '</td><td><span style="display:inline-flex;align-items:center;gap:8px">' + who + '</span></td><td>' + E(a.action) + '</td><td>' + fl + '</td><td>' + (a.detail ? badge(a.detail, a.tag === 'sign' ? 'info' : a.tag === 'rules' ? 'ok' : '') : '') + '</td><td class="mono muted r">' + E(a.ver) + '</td></tr>';
    });
    return '<section class="panel"><table class="tbl"><thead><tr><th>Time</th><th>Who</th><th>Action</th><th>File</th><th>Detail</th><th class="r">Ver.</th></tr></thead><tbody>' + html + '</tbody></table></section>';
  }
  function vAudit() {
    var tab = ui.tab.audit || 'all';
    var rows = S.data.audit.slice().sort(function (a, b) { return a.t < b.t ? 1 : -1; }).filter(function (a) { return tab === 'all' || a.tag === tab; });
    return shell('audit', '<b>Audit log</b>',
      '<div class="ttl"><h1>Audit log</h1><span class="sub">Read only. Every signature, rule run and change.</span><div class="acts"><button class="btn" data-a="export">Export</button></div></div>' +
      '<div class="tabs" role="tablist">' + [['all', 'All'], ['sign', 'Signatures'], ['rules', 'Rules'], ['change', 'Changes']].map(function (t) { return '<button role="tab" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="audit" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      auditTable(rows, true));
  }

  /* ---------- rules ---------- */
  function vRules() {
    return shell('rules', '<b>Rules</b>',
      '<div class="ttl"><h1>Rules</h1><span class="sub">Every result on this console comes from these written rules. AI adds suggestions from stage 2.</span><div class="acts">' + badge('Version 1.0 · 15 Oct 2026', 'mono') + '</div></div>' +
      S.CHECKS.map(function (ch) {
        var rs = S.RULES.filter(function (r) { return r.check === ch.key; });
        return '<section class="panel"><div class="ph">' + E(ch.name) + '<span class="ct">' + rs.length + ' rule' + (rs.length === 1 ? '' : 's') + '</span></div><table class="tbl"><thead><tr><th style="width:80px">Rule</th><th>What it checks</th><th>Met when</th><th>Needs an officer when</th></tr></thead><tbody>' +
          rs.map(function (r) { return '<tr><td class="mono">' + r.id + '</td><td class="nm">' + E(r.text) + '</td><td class="sub">' + E(r.met) + '</td><td class="sub">' + E(r.needs) + '</td></tr>'; }).join('') + '</tbody></table></section>';
      }).join('') +
      '<section class="panel"><div class="ph">Match rules<span class="ct">4 stages</span></div><table class="tbl"><thead><tr><th style="width:80px">Rule</th><th>Stage</th><th>What it checks</th></tr></thead><tbody>' +
      S.MATCH_RULES.map(function (r) { return '<tr><td class="mono">' + r.id + '</td><td class="nm">' + r.stage + '</td><td class="sub">' + E(r.text) + '</td></tr>'; }).join('') + '</tbody></table></section>');
  }

  function vMissing() { return shell('', '<b>Not found</b>', '<section class="panel"><div class="empty">That record isn’t in the demo data. <a href="#board">Back to the board</a></div></section>'); }

  /* ---------- render ---------- */
  function render() {
    var r = route();
    if (!S.session.signedIn && r.name !== 'signin') { location.replace('#signin'); return; }
    if (S.session.signedIn && r.name === 'signin') { location.replace('#board'); return; }
    var act = document.activeElement, fid = act && act.id, s0 = act && act.selectionStart, s1 = act && act.selectionEnd, sy = window.scrollY;
    if (r.name === 'signin' && root.querySelector('.night') && ui.last === location.hash) { var sf = root.querySelector('.signin'); sf.outerHTML = signinForm(); return; }
    var views = { signin: vSignin, board: vBoard, check: function () { return vReview(r.id, 'k1'); }, sign: function () { return vReview(r.id, 'k2'); }, plan: function () { return vPlan(r.id); }, company: function () { return vCompany(r.id); }, companies: vCompanies, opps: vOpps, opp: function () { return vOpp(r.id); }, agents: vAgents, audit: vAudit, rules: vRules };
    var html = (views[r.name] || vBoard)();
    if (ui.toast) html += '<div class="toast" role="status">' + (ui.toast.cube ? I.cube : '') + E(ui.toast.msg) + '</div>';
    if (ui.dialog) html += '<div class="scrim" data-a="dclose"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">' + E(ui.dialog.title) + '</h2>' + (typeof ui.dialog.body === 'string' && ui.dialog.body.charAt(0) === '<' ? ui.dialog.body : '<p class="sub" style="margin:0">' + E(ui.dialog.body) + '</p>') + '<div class="row"><button class="btn" data-a="dclose">Cancel</button><button class="btn pri' + (ui.dialog.danger ? ' dan' : '') + '" data-a="dok"' + (ui.dialog.danger ? ' style="background:var(--err);border-color:var(--err)"' : '') + '>' + E(ui.dialog.ok) + '</button></div></div></div>';
    if (r.name !== 'signin') html += '<a class="back" href="/">' + I.chev + 'Portal preview</a>';
    var changed = ui.last !== location.hash;
    root.innerHTML = html;
    var pg = root.querySelector('.page'); if (pg && changed) pg.classList.add('enter');
    if (changed) { ui.last = location.hash; window.scrollTo(0, 0); } else window.scrollTo(0, sy);
    if (fid) { var el = document.getElementById(fid); if (el) { el.focus(); try { if (s0 != null) el.setSelectionRange(s0, s1); } catch (e) {} } }
    if (r.name === 'signin' && window.SBCHeroCube) window.SBCHeroCube();
    document.title = (r.name === 'signin' ? 'Sign in' : (root.querySelector('h1') || {}).textContent || 'Console') + ' · SBC officer console';
  }

  /* ---------- actions ---------- */
  var A = {
    nav: function (el) { go(el.dataset.h); },
    mine: function (el) { ui.mine = el.dataset.v === '1'; render(); },
    tab: function (el) { ui.tab[el.dataset.k] = el.dataset.v; render(); },
    take: function (el) { toast(S.act.take(el.dataset.id)); },
    remind: function (el) { toast(S.act.remind(el.dataset.id)); },
    switch: function () { ui.outcome = {}; toast(S.act.switchOfficer()); },
    reset: function () { confirmBox('Reset the demo data?', 'Every change made in this browser goes back to the starting data.', 'Reset', function () { ui.sel = {}; ui.outcome = {}; ui.plan = {}; ui.picks = {}; toast(S.act.reset()); go('board'); }); },
    signout: function () { S.act.signOut(); ui.signin = null; go('signin'); },
    autofill: function () {
      var f = ui.signin, em = 'officer@sbc-demo.test', pw = 'Officer-demo-26', i = 0; f.err = '';
      clearInterval(ui.typer); ui.typer = setInterval(function () { i++; f.em = em.slice(0, i); f.pw = pw.slice(0, Math.max(0, i - em.length + pw.length)).replace(/./g, '•'); if (i >= em.length) { f.pw = pw; clearInterval(ui.typer); } render(); }, 28);
    },
    signin: function () {
      var f = ui.signin; if (f.busy) return;
      if (!f.em || !f.pw) { f.err = 'Use Autofill to fill the demo account.'; render(); return; }
      f.busy = true; render(); setTimeout(function () { f.busy = false; S.act.signIn(); go('board'); toast('Welcome back, ' + S.officerName(S.me())); }, 700);
    },
    pickcheck: function (el) { var r = route(), key = r.name === 'sign' ? 'k2' : 'k1'; ui.sel[r.id + key] = { ci: +el.dataset.i, f: null }; render(); },
    focus: function (el) { var r = route(), key = r.name === 'sign' ? 'k2' : 'k1', s = ui.sel[r.id + key]; s.f = +el.dataset.i; render(); },
    answer: function (el) {
      var r = route(), key = r.name === 'sign' ? 'k2' : 'k1', s = ui.sel[r.id + key], c = S.company(r.id);
      S.act.answer(r.id, key, el.dataset.c, el.dataset.v); s.f = null;
      var ev = S.evaluate(c), ans = S.answers(c, key);
      if (ev[s.ci].conds.every(function (y) { return ans[y.id]; })) {
        var nx = initSel(c, ev, ans);
        if (nx.ci !== s.ci) setTimeout(function () { ui.sel[r.id + key] = nx; render(); }, 650);
      }
    },
    undo: function (el) { var r = route(), key = r.name === 'sign' ? 'k2' : 'k1'; S.act.undo(r.id, key, el.dataset.c); },
    send: function () { var r = route(); var c = S.company(r.id); var out = ui.outcome['cur' + r.id + 'k1']; toast(S.act.sendToSecond(r.id, out, null)); go('board'); },
    sendplan: function () { var r = route(), items = ui.plan[r.id]; toast(S.act.sendToSecond(r.id, 'conditional', items)); delete ui.plan[r.id]; go('board'); },
    pagent: function (el) { var r = route(), it = ui.plan[r.id][+el.dataset.i], g = el.dataset.g, k = it.agents.indexOf(g); if (k >= 0) it.agents.splice(k, 1); else it.agents.push(g); render(); },
    sign: function () {
      var r = route(), c = S.company(r.id), out = ui.outcome['cur' + r.id + 'k2'];
      var t = { qualified: ['Sign and issue the mark?', c.name + ' becomes SBC-Qualified for a year and joins the directory and the match pool.', 'Sign and issue'], conditional: ['Sign and send the action plan?', c.name + ' stays Conditionally Qualified and is not introduced until the plan is fixed.', 'Sign and send'], notyet: ['Sign as Not yet?', c.name + ' is told which check fell short and can apply again later.', 'Sign as Not yet'] }[out];
      confirmBox(t[0], t[1], t[2], function () { var msg = S.act.sign(r.id, out); toast(msg, out === 'qualified'); go(out === 'qualified' ? 'company/' + r.id : 'board'); }, out === 'notyet');
    },
    recheck: function (el) { confirmBox('Start a re-check?', 'The rules run all five checks again. The mark stays current until two officers sign.', 'Start re-check', function () { toast(S.act.recheck(el.dataset.id)); go('check/' + el.dataset.id); }); },
    withdraw: function (el) { confirmBox('Withdraw the mark?', 'The mark and its verify page show withdrawn at once, and the company leaves the directory and the match pool.', 'Withdraw', function () { toast(S.act.withdraw(el.dataset.id)); }, true); },
    fixes: function (el) { S.act.submitFixes(el.dataset.id); ui.sel = {}; toast('The company sent its fixes. The rules re-ran the checks with gaps'); go('board'); },
    shortlist: function () { var r = route(); toast(S.act.shortlist(r.id, ui.picks[r.id])); delete ui.picks[r.id]; render(); },
    mfocus: function (el) { ui.mfocus[route().id] = el.dataset.v; render(); },
    approvem: function (el) {
      var r = route(), o = S.opp(r.id); S.act.approveMatch(r.id, el.dataset.c, el.dataset.v);
      var nx = o.picks.ids.filter(function (x) { return !o.approvals[x]; })[0]; if (nx) { ui.mfocus[r.id] = nx; render(); }
    },
    release: function () { var r = route(), o = S.opp(r.id); confirmBox('Release to ' + partyName(o) + '?', 'They see the approved companies’ SBC records and can ask to meet.', 'Release', function () { toast(S.act.release(r.id), true); }); },
    sendback: function () { var r = route(); toast(S.act.sendBack(r.id)); },
    outcome: function (el) { toast(S.act.outcome(route().id, el.dataset.c, el.dataset.v)); },
    addagent: function () {
      ui.agentForm = { name: '', city: '', country: 'UAE', sectors: '' };
      confirmBox('Add an agent', '<div style="display:flex;flex-direction:column;gap:10px"><label class="fl" for="agn">Name<input id="agn" class="input" data-in="agn" placeholder="[Agent name] LLC"></label><label class="fl" for="agc">City<input id="agc" class="input" data-in="agc" placeholder="Dubai"></label><label class="fl" for="agk">Country<select id="agk" class="input" data-ch="agk"><option>UAE</option><option>KSA</option><option>Qatar</option><option>Bahrain</option><option>Oman</option><option>Kuwait</option></select></label><span class="muted">New agents wait for review before SBC refers anyone to them.</span></div>', 'Add for review', function () {
        var f = ui.agentForm; if (!f.name) { f.name = '[New agent] LLC'; }
        toast(S.act.addAgent({ name: f.name, city: f.city || f.country, country: f.country, sectors: [] }));
      });
    },
    approveagent: function (el) { toast(S.act.approveAgent(el.dataset.id)); },
    export: function () { toast('Export is not part of the preview'); },
    dclose: function (el, ev) { if (ev && ev.target !== el) return; ui.dialog = null; render(); },
    dok: function () { var fn = ui.dialog.fn; ui.dialog = null; fn(); render(); }
  };

  root.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-a]'); if (!el || !root.contains(el)) return;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var a = el.dataset.a; if (!A[a]) return;
    if (a === 'dclose' && ev.target !== el && el.classList.contains('scrim')) return;
    if (el.tagName === 'A' && el.getAttribute('href') && a === 'nav') ev.preventDefault();
    ev.stopPropagation(); A[a](el, ev);
  });
  root.addEventListener('keydown', function (ev) { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.card[data-a]')) { ev.preventDefault(); ev.target.click(); } if (ev.key === 'Escape' && ui.dialog) { ui.dialog = null; render(); } });
  root.addEventListener('input', function (ev) {
    var el = ev.target, k = el.dataset.in; if (!k) return;
    if (k === 'em' || k === 'pw') { ui.signin[k] = el.value; return; }
    if (k === 'q') { ui.q = el.value; render(); return; }
    if (k === 'ptext') { ui.plan[route().id][+el.dataset.i].text = el.value; var pv = root.querySelectorAll('.viewer .p-tbl tr')[+el.dataset.i + 1]; if (pv) pv.children[1].textContent = el.value; return; }
    if (k === 'agn') ui.agentForm.name = el.value; if (k === 'agc') ui.agentForm.city = el.value;
  });
  root.addEventListener('change', function (ev) {
    var el = ev.target, k = el.dataset.ch; if (!k) return;
    var r = route();
    if (k === 'outcome') { ui.outcome[r.id + (r.name === 'sign' ? 'k2' : 'k1')] = el.dataset.v; render(); }
    if (k === 'pdue') { ui.plan[r.id][+el.dataset.i].due = el.value || D.add(D.today, 14); render(); }
    if (k === 'pick') { var p = ui.picks[r.id], i = p.indexOf(el.dataset.v); if (el.checked && i < 0) p.push(el.dataset.v); if (!el.checked && i >= 0) p.splice(i, 1); render(); }
    if (k === 'agk') ui.agentForm.country = el.value;
  });
  window.addEventListener('hashchange', render);
  S.subscribe(render);
  render();
})();
