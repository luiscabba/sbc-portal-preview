/* SBC company portal. One page, hash routes, built from SBC.data for the demo account picked in the sidebar. */
(function () {
  var S = SBC, E = SBCDocs.esc, D = S.date, root = document.getElementById('root');
  var ui = { toast: null, busy: {}, reg: null, last: '' };

  var I = {
    status: '<svg viewBox="0 0 24 24"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
    checklist: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    plan: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    intros: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg>',
    mark: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M14 4v5h5"/></svg>',
    updates: '<svg viewBox="0 0 24 24"><path d="M12 8v4l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9"/></svg>',
    brand: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 21 7v10l-9 5-9-5V7z" fill="#1F4FD1"/><path d="M12 12 21 7M12 12v10M12 12 3 7" stroke="#FFFFFF" stroke-width="1.2" fill="none"/></svg>',
    tick: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    doc: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>',
    lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3"/></svg>',
    cube: '<span class="cube" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 21 7 12 12 3 7z" fill="#3A4366"/><path d="M3 7 12 12v10L3 17z" fill="#151926"/><path d="M21 7 12 12v10l9-5z" fill="#3D6AF0"/></svg></span>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
  };
  var COUNTRIES = ['UAE', 'KSA', 'Qatar', 'Bahrain', 'Oman', 'Kuwait'];
  var HOME = ['Australia', 'Canada', 'Germany', 'India', 'Ireland', 'Italy', 'Japan', 'Malta', 'Netherlands', 'Norway', 'Singapore', 'South Korea', 'Spain', 'United Kingdom', 'United States'];

  function route() { var h = (location.hash || '#status').slice(1).split('/'); return { name: h[0] || 'status', id: h[1] || '' }; }
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
  function badge(t, cls) { return '<span class="badge ' + (cls || '') + '">' + E(t) + '</span>'; }
  function me() { return S.company(S.session.company) || S.company('orrin'); }
  function toast(msg, cube) { if (!msg) return; ui.toast = { msg: msg, cube: cube, at: Date.now() }; render(); var at = ui.toast.at; setTimeout(function () { if (ui.toast && ui.toast.at === at) { ui.toast = null; render(); } }, 2800); }
  function stageLabel(c) {
    if (c.mark && c.mark.withdrawn) return ['Mark withdrawn', 'err'];
    return { uploading: ['Uploading', ''], check: ['With SBC', 'info'], sign: ['With SBC', 'info'], plan: ['Conditionally Qualified', 'warn'], qualified: ['SBC-Qualified', 'ok'], notyet: ['Not yet', 'err'] }[c.stage] || [c.stage, ''];
  }
  function myIntros(c) {
    var out = [];
    S.data.opps.forEach(function (o) { (o.intros || []).forEach(function (x) { if (x.company === c.id) out.push({ o: o, x: x }); }); });
    return out.sort(function (a, b) { return a.x.at < b.x.at ? 1 : -1; });
  }

  /* ---------- shell ---------- */
  function shell(active, crumb, body) {
    var c = me(), plan = c.plan && !c.plan.draft ? c.plan.items : [], left = plan.filter(function (x) { return !x.done; }).length;
    var fresh = myIntros(c).filter(function (i) { return i.x.status === 'released'; }).length;
    var nav = [['status', 'Status', I.status, ''], ['checklist', 'Checklist', I.checklist, c.stage === 'uploading' ? S.uploads(c).missing.length + ' left' : '']];
    if (plan.length) nav.push(['plan', 'Action plan', I.plan, left && c.stage === 'plan' ? left + ' left' : '']);
    nav.push(['intros', 'Introductions', I.intros, fresh || ''], ['mark', 'Your mark', I.mark, ''], ['updates', 'Updates', I.updates, '']);
    var opts = S.data.companies.map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.id ? ' selected' : '') + '>' + E(x.short) + ' · ' + E(stageLabel(x)[0]) + '</option>'; }).join('');
    return '<div class="app"><aside class="side" aria-label="Company portal">' +
      '<div class="ws">' + I.brand + 'SBC Capital<small>Company portal</small></div>' +
      '<div class="acct"><b>' + E(c.short) + '</b><span>Company account · ' + E(c.country) + '</span></div>' +
      '<nav class="nav" aria-label="Company portal">' + nav.map(function (n) { return '<a href="#' + n[0] + '" class="' + (active === n[0] ? 'on' : '') + '">' + n[2] + n[1] + (n[3] ? '<span class="ct">' + n[3] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="me"><label class="demo-sw" for="acct">Demo account<select id="acct" data-ch="acct">' + opts + '<option value="__new">Register a new company</option></select></label>' +
      '<button class="side-btn" data-a="reset">' + I.reset + 'Reset demo data</button></div></aside>' +
      '<main class="main"><div class="top">' + crumb + '<span class="sp"></span><span class="mono muted">' + (c.mark && !c.mark.withdrawn ? E(c.mark.id) : 'Applied ' + D.long(c.applied)) + '</span></div><div class="page">' + body + '</div></main></div>';
  }

  /* ---------- status ---------- */
  function vStatus() {
    var c = me(), st = stageLabel(c), rv = c.review || {}, u = S.uploads(c);
    var idx = { uploading: 1, check: 2, sign: 3, plan: 5, qualified: 5, notyet: 5 }[c.stage];
    var gaps = c.review && c.review.scope;
    var sent = c.stage === 'check' ? c.since : c.sent || (rv.k1 && rv.k1.at ? D.add(rv.k1.at, -2) : D.add(c.decided || c.since, -4));
    var steps = [
      ['Registered', D.short(c.applied)],
      ['Evidence sent', c.stage === 'uploading' ? u.done + ' of ' + u.total : D.short(sent)],
      ['Officer 1', idx > 2 ? D.short((rv.k1 && rv.k1.at) || c.decided || c.since) : idx === 2 ? (gaps ? 'Gaps only' : 'Reviewing') : 'Next'],
      ['Officer 2', idx > 3 ? D.short((rv.k2 && rv.k2.at) || c.decided || c.since) : idx === 3 ? 'Reviewing' : 'Next'],
      [c.stage === 'qualified' ? 'SBC-Qualified' : c.stage === 'plan' ? 'Conditional' : c.stage === 'notyet' ? 'Not yet' : 'Decision', idx === 5 ? D.short(c.decided || c.since) : 'About [10] working days']
    ];
    var track = '<div class="track">' + steps.map(function (s, i) {
      var cls = (i < idx ? 'done' : i === idx ? 'cur' : '') + (i === 4 && c.stage === 'notyet' ? ' no' : '');
      return '<div class="tk ' + cls + '">' + (i === idx ? '<span class="here">You are here</span>' : '') + '<span class="dot">' + (i < idx ? '<span style="color:#FFFFFF">' + (cls.indexOf('no') > 0 ? '\u2715' : I.tick) + '</span>' : '') + '</span><b>' + E(s[0]) + '</b><span>' + E(s[1]) + '</span></div>';
    }).join('') + '</div>';

    var needs = [];
    if (c.stage === 'uploading') u.missing.forEach(function (m) { needs.push(['Upload ' + m.charAt(0).toLowerCase() + m.slice(1), 'Required for your review', 'checklist', 'Upload']); });
    if (c.stage === 'uploading' && u.ready) needs.push(['Send your evidence to SBC', 'Everything required is in', 'checklist', 'Send']);
    if (c.stage === 'plan') (c.plan.items || []).forEach(function (it) { if (!it.done) needs.push([it.text, 'Due ' + D.long(it.due), 'plan', 'Open']); });
    myIntros(c).forEach(function (i) { if (i.x.status === 'released') needs.push([(i.o.kind === 'mandate' ? 'An investor' : 'A buyer') + ' wants to meet you', S.party(i.o.from).name + ' · ' + i.o.title, 'intros', 'View']); });
    var needsP = '<section class="panel"><div class="ph">Needs you<span class="ct">' + needs.length + '</span></div>' +
      (needs.length ? needs.slice(0, 6).map(function (n) { return '<div class="ev"><span class="ico">' + I.doc + '</span><span><b>' + E(n[0]) + '</b><span class="h">' + E(n[1]) + '</span></span><span></span><a class="btn sm' + (n[3] !== 'Upload' ? ' pri' : '') + '" href="#' + n[2] + '">' + n[3] + '</a></div>'; }).join('')
        : '<div class="empty">Nothing needs you right now.</div>') + '</section>';
    var next = {
      uploading: 'Upload the required documents. The rules check your file as soon as you send it.',
      check: gaps ? 'The rules re-ran the checks that had gaps. An SBC officer is confirming them.' : 'The rules have checked your file. An SBC officer is confirming each result.',
      sign: 'A second officer checks your file separately. Nothing reaches a buyer until both sign.',
      plan: 'Fix the items on your action plan. Only the checks with gaps run again.',
      qualified: 'SBC can introduce you to buyers and investors whose needs fit. Screening re-runs every month.',
      notyet: 'You can apply again once this is fixed: ' + (c.reason || 'see your updates') + '.'
    }[c.stage];
    var nextP = '<section class="panel"><div class="ph">What happens next</div><div class="pb" style="display:flex;flex-direction:column;gap:10px"><span>' + E(next) + '</span><span class="muted">Questions: [contact email]</span></div></section>';
    var checksP = '';
    if (c.reg && c.stage !== 'uploading') {
      var req = c.plan && !c.plan.draft ? c.plan.items.map(function (x) { return x.check; }) : [];
      checksP = '<section class="panel"><div class="ph">Your five checks</div><table class="tbl"><tbody>' + S.CHECKS.map(function (ch) {
        var b = c.stage === 'check' || c.stage === 'sign' ? (c.review.scope && c.review.scope.indexOf(ch.key) < 0 ? badge('Passed', 'ok') : badge('In review', 'info'))
          : c.stage === 'plan' ? (req.indexOf(ch.key) >= 0 ? badge('On your plan', 'warn') : badge('Passed', 'ok')) : c.stage === 'qualified' ? badge('Passed', 'ok') : badge('Closed');
        return '<tr><td class="nm">' + E(ch.name) + '</td><td class="r">' + b + '</td></tr>';
      }).join('') + '</tbody></table></section>';
    }
    var hero = c.stage === 'qualified' && !(c.mark && c.mark.withdrawn) ? '<a class="qual" href="#mark" style="text-decoration:none"><span class="mark-ico" aria-hidden="true"></span><span style="display:flex;flex-direction:column"><b>You are SBC-Qualified</b><span>Valid until ' + D.long(c.mark.validTo) + '. See your mark.</span></span></a>' : '';
    return shell('status', '<b>Status</b>',
      '<div class="ttl"><h1>Your review</h1>' + badge(st[0], st[1]) + (c.stage !== 'uploading' ? '<span class="sub">Round ' + (rv.round || 1) + '</span>' : '') + '</div>' + hero +
      '<section class="panel">' + track + '</section>' +
      '<div class="grid2"><div class="stack">' + needsP + checksP + '</div><div class="stack">' + nextP + '</div></div>');
  }

  /* ---------- checklist ---------- */
  function vChecklist() {
    var c = me(), u = S.uploads(c), open = c.stage === 'uploading';
    var pct = Math.round(100 * u.done / u.total);
    var head = '<section class="panel"><div class="headcard"><span class="ring" style="--p:' + pct + '"><b>' + u.done + '/' + u.total + '</b></span><span style="display:flex;flex-direction:column;gap:2px"><span class="big">' + (open ? 'Evidence checklist' : 'Your evidence') + '</span><span class="sub">' +
      (open ? (u.missing.length ? u.missing.length + ' required document' + (u.missing.length === 1 ? '' : 's') + ' left. Upload at your own pace.' : 'Everything required is in. Send it when you are ready.') : 'Locked and sent ' + D.long(c.since) + '. The rules and two officers work from this version.') +
      '</span></span><span class="right">' + (open ? '<button class="btn pri lg" data-a="send"' + (u.ready ? '' : ' disabled') + '>Send to SBC</button>' : badge('Sent', 'ok')) + '</span></div></section>';
    var have = open ? u.have : S.EVIDENCE.map(function (e) { return e.name; }).filter(function (n) { return !c.uploads || c.uploads.have.indexOf(n) >= 0 || !S.EVIDENCE.filter(function (e) { return e.name === n; })[0].optional; });
    var rows = S.EVIDENCE.map(function (e) {
      var got = have.indexOf(e.name) >= 0, busy = ui.busy[e.name];
      var right = !open ? '<span class="muted" style="display:inline-flex;gap:4px;align-items:center">' + I.lock + 'Locked</span>' :
        busy ? '<button class="btn sm" disabled><span class="spin" style="border-color:rgba(0,0,0,.15);border-top-color:#1F4FD1"></span>Uploading</button>' :
        got ? '<button class="btn sm" data-a="remove" data-n="' + E(e.name) + '">Remove</button>' : '<button class="btn sm' + (e.optional ? '' : ' pri') + '" data-a="upload" data-n="' + E(e.name) + '">Upload</button>';
      return '<div class="ev' + (got ? ' done' : '') + '"><span class="ico' + (got ? ' ok' : '') + '">' + (got ? I.tick : I.doc) + '</span><span><b>' + E(e.name) + '</b><span class="h">' + E(e.hint) + '</span></span>' +
        (got ? badge('Uploaded', 'ok') : e.optional ? badge('Optional') : badge('Needed', 'warn')) + right + '</div>';
    }).join('');
    return shell('checklist', '<b>Checklist</b>', head + '<section class="panel">' + rows + '</section>' +
      '<span class="muted">Nothing reaches a buyer while you upload. Files are encrypted, checked by written rules, then by two SBC officers.' + (open ? '' : ' If your plan asks for something new, upload it from the action plan.') + '</span>');
  }

  /* ---------- action plan ---------- */
  function vPlan() {
    var c = me();
    if (!c.plan || c.plan.draft) return shell('plan', '<b>Action plan</b>', '<div class="ttl"><h1>Action plan</h1></div><section class="panel"><div class="empty">You have no action plan. SBC sets one only when a check finds a gap.</div></section>');
    var items = c.plan.items, done = items.filter(function (x) { return x.done; }).length, left = items.length - done, active = c.stage === 'plan';
    var due = items.reduce(function (m, x) { return !m || x.due > m ? x.due : m; }, null), dleft = D.days(D.today, due);
    var head = '<section class="panel"><div class="headcard"><span class="ring" style="--p:' + Math.round(100 * done / items.length) + '"><b>' + done + '/' + items.length + '</b></span><span style="display:flex;flex-direction:column;gap:2px"><span class="big">' +
      (active ? (left ? left + ' left to do' : 'All done. Send it to SBC') : c.stage === 'qualified' ? 'Plan closed' : 'Sent to SBC') + '</span><span class="sub">' +
      (active ? 'You can be introduced to buyers once these are done. Each one was set by an SBC officer.' : c.stage === 'qualified' ? 'Fixed and signed by two officers.' : 'The rules re-ran the checks with gaps. An officer is confirming them.') +
      '</span></span><span class="right">' + (active ? '<b>' + Math.max(0, dleft) + ' days</b><span class="muted">to ' + D.long(due) + '</span>' : badge(c.stage === 'qualified' ? 'Closed' : 'With SBC', c.stage === 'qualified' ? 'ok' : 'info')) + '</span></div></section>';
    var rows = items.map(function (it) {
      var ags = (it.agents || []).map(function (g) { return S.agent(g); }).filter(Boolean);
      return '<div class="todo' + (it.done ? ' done' : '') + '"><input type="checkbox" id="pi' + it.id + '" data-ch="tick" data-v="' + it.id + '"' + (it.done ? ' checked' : '') + (active ? '' : ' disabled') + ' aria-label="Mark done">' +
        '<label for="pi' + it.id + '" style="display:flex;flex-direction:column;gap:4px;cursor:' + (active ? 'pointer' : 'default') + '"><span class="t">' + E(it.text) + '</span>' +
        (ags.length ? '<span class="s">Agents SBC has reviewed: ' + ags.map(function (a) { return E(a.name) + ', ' + E(a.city); }).join(' · ') + '</span>' + (active && !it.done ? '<span><button class="btn sm" data-a="askagent" data-v="' + E(ags[0].name) + '">Ask SBC for an introduction</button></span>' : '') : '') + '</label>' +
        (active && !it.done ? (ui.busy['p' + it.id] ? '<button class="btn sm" disabled><span class="spin" style="border-color:rgba(0,0,0,.15);border-top-color:#1F4FD1"></span>Uploading</button>' : '<button class="btn sm" data-a="pupload" data-v="' + it.id + '">Upload proof</button>') : badge(S.CHECKS.filter(function (x) { return x.key === it.check; })[0].name)) + '<span class="mono muted" style="text-align:right">' + D.short(it.due) + '</span></div>';
    }).join('');
    return shell('plan', '<b>Action plan</b>' + badge('Conditionally Qualified', 'warn'),
      head + '<section class="panel"><div class="ph">To do<span class="ct">Upload proof or tick when done. SBC confirms each one.</span></div>' + rows +
      (active ? '<div class="sendbar" style="flex-direction:row;align-items:center;justify-content:space-between"><span class="hint">Sending re-runs only the checks with gaps. You stay Conditionally Qualified until two officers sign.</span><button class="btn pri lg" data-a="fixes"' + (left ? ' disabled' : '') + '>Send to SBC</button></div>' : '') + '</section>' +
      '<span class="muted">SBC refers you to an agent. SBC does not act as your agent.</span>');
  }

  /* ---------- introductions ---------- */
  function vIntros() {
    var c = me(), all = myIntros(c);
    if (c.stage !== 'qualified') return shell('intros', '<b>Introductions</b>', '<div class="ttl"><h1>Introductions</h1></div><section class="panel"><div class="empty">Introductions start once you are SBC-Qualified. Two officers approve every one before anyone sees your record.</div></section>');
    var fresh = all.filter(function (i) { return i.x.status === 'released'; })[0], body = '';
    if (fresh) {
      var o = fresh.o, p = S.party(o.from) || {}, inv = o.kind === 'mandate', m = S.match(o), r = m.ranked.filter(function (x) { return x.c.id === c.id; })[0];
      body += '<section class="night-hero" aria-label="New introduction"><div class="lat" aria-hidden="true"></div><div><span class="eyebrow">New · approved by two SBC officers</span>' +
        '<h1>' + (o.kind === 'request' ? 'A buyer asked for you by name.' : inv ? 'An investor wants to meet you.' : 'A buyer wants to meet you.') + '</h1>' +
        '<p>' + E(p.name) + (inv ? ' is looking for ' : ' needs ') + E(o.title.charAt(0).toLowerCase() + o.title.slice(1)) + '. SBC thinks you fit.</p>' +
        '<div style="display:flex;gap:8px"><button class="btn pri lg" data-a="respond" data-o="' + o.id + '" data-v="accept">Accept introduction</button><button class="btn lg" data-a="respond" data-o="' + o.id + '" data-v="decline">Decline</button></div></div>' +
        '<div class="meetline"><span class="who"><b>' + E(c.short) + '</b><span>You · SBC-Qualified</span></span><span class="wire"></span><span class="hub">' + I.cube + '</span><span class="wire"></span><span class="who them"><b>' + E(p.name) + '</b><span>' + (inv ? 'Investor' : 'Buyer') + ' · ' + E(p.city) + '</span></span></div></section>' +
        '<div class="three"><section class="panel"><div class="ph">' + (inv ? 'The mandate' : 'The need') + '</div><dl class="kvl"><dt>What</dt><dd>' + E(o.title) + '</dd><dt>Where</dt><dd>' + E((o.countries || [o.country]).join(', ')) + '</dd><dt>' + (inv ? 'Ticket' : 'Value') + '</dt><dd>' + E(o.value) + '</dd><dt>Closes</dt><dd>' + D.long(o.closes) + '</dd></dl></section>' +
        '<section class="panel"><div class="ph">Why SBC matched you</div><div class="pb">' + E(r ? r.why : o.kind === 'request' ? 'They found you in the directory and asked to meet you.' : 'Your record fits what they asked for.') + '</div></section>' +
        '<section class="panel"><div class="ph">What they see</div><div class="pb">Your five checks, your mark and this match note. Nothing else from your file.</div></section></div>';
    }
    body += '<section class="panel"><div class="ph">All introductions<span class="ct">' + all.length + '</span></div>' + (all.length ? '<table class="tbl"><thead><tr><th>Opportunity</th><th>From</th><th>Status</th><th class="r">Updated</th></tr></thead><tbody>' + all.map(function (i) {
      var b = { released: ['Waiting for you', 'warn'], meeting: ['Meeting being arranged', 'info'], won: ['Won', 'ok'], lost: ['Not chosen', ''], declined: ['Declined', ''] }[i.x.status] || [i.x.status, ''];
      return '<tr><td class="nm">' + E(i.o.title) + '</td><td class="sub">' + E((S.party(i.o.from) || {}).name) + '</td><td>' + badge(b[0], b[1]) + '</td><td class="mono muted r">' + D.short(i.x.at) + '</td></tr>';
    }).join('') + '</tbody></table>' : '<div class="empty">No introductions yet. SBC introduces you when a buyer or investor need fits your record. You don’t need to do anything.</div>') + '</section>';
    return shell('intros', '<b>Introductions</b>', body);
  }

  /* ---------- your mark ---------- */
  function vMark() {
    var c = me(), m = c.mark, live = c.stage === 'qualified' && m && !m.withdrawn, rv = c.review || {};
    var url = 'https://[verify.sbccapital.ae]/' + (m ? m.id : '');
    if (!live) {
      return shell('mark', '<b>Your mark</b>', '<div class="ttl"><h1>Your mark</h1>' + (m && m.withdrawn ? badge('Withdrawn ' + D.short(m.withdrawn), 'err') : '') + '</div><div class="grid2"><section class="panel"><div class="pb" style="padding:28px;display:flex;flex-direction:column;gap:8px">' +
        (m && m.withdrawn ? '<b>Your mark was withdrawn on ' + D.long(m.withdrawn) + '.</b><span class="sub">Its verify page now shows withdrawn. You can apply again once the reason is fixed.</span>' : '<b>Your mark appears here once two officers sign.</b><span class="sub">It is valid for a year, and anyone can check it is current from its verify page.</span>') +
        '</div></section><div style="padding:20px"><div class="mcard off"><div class="top2"><span class="ind">SBC</span><span class="mono">SBC-Q-[ID]</span></div><b>SBC-Qualified</b><span>' + E(c.name) + '</span></div></div></div>');
    }
    var embed = '<a href="' + url + '">\n  <img src="https://[verify.sbccapital.ae]/badge/' + m.id + '.svg" alt="SBC-Qualified">\n</a>';
    return shell('mark', '<b>Your mark</b>' + badge('Active', 'ok'),
      '<section class="night-hero" aria-label="SBC-Qualified"><div class="lat" aria-hidden="true"></div><div>' +
      '<span class="chip2">' + I.tick + 'Officer 1 signed</span><span class="chip2">' + I.tick + 'Officer 2 signed</span>' +
      '<h1>You are SBC-Qualified.</h1><p>SBC can now introduce you to Gulf buyers and investors whose needs fit. Valid until ' + D.long(m.validTo) + '.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" data-a="copy" data-v="' + E(url) + '">Copy verification link</button><button class="btn" data-a="cert">Download certificate</button></div></div>' +
      '<div class="mcard"><div class="top2"><span class="ind">SBC</span><span class="mono">' + E(m.id) + '</span></div><b>SBC-Qualified</b><span>' + E(c.name) + '</span><span class="mono">SBC Capital · Dubai · valid to ' + D.month(m.validTo) + '</span></div></section>' +
      '<div class="grid2"><section class="panel"><div class="ph">For your website</div><div class="pb" style="display:flex;flex-direction:column;gap:10px"><span class="sub">Add the badge. Buyers click it to check you are current.</span><div class="code">' + E(embed) + '</div><span><button class="btn sm" data-a="copy" data-v="' + E(embed) + '">Copy code</button></span></div></section>' +
      '<section class="panel"><div class="ph">Keeping it current</div><dl class="kvl"><dt>Screening</dt><dd>Every month · last run ' + D.long(m.lastScreen) + ', clear</dd><dt>Full re-check</dt><dd>' + D.month(D.add(m.validTo, -30)) + '</dd><dt>Issued</dt><dd>' + D.long(m.issued) + '</dd></dl></section></div>');
  }

  /* ---------- updates ---------- */
  function vUpdates() {
    var c = me(), oppIds = myIntros(c).map(function (i) { return i.o.id; });
    var MAP = { 'Ran the five checks': 'The rules checked your file', 'Ran the checks with gaps': 'The rules re-ran the checks with gaps', 'Took the file': 'An SBC officer started your review', 'Signed key 1': 'The first officer signed', 'Signed key 2': 'The second officer signed', 'Sent the action plan': 'SBC sent your action plan', 'Issued the mark': 'Your mark was issued', 'Renewed the mark': 'Your mark was renewed', 'Reminded the company': 'SBC sent you a reminder', 'Monthly screening': 'Monthly screening ran', 'Withdrew the mark': 'Your mark was withdrawn', 'Started a re-check': 'SBC started a re-check', 'Released introduction': 'SBC introduced you' };
    var rows = S.data.audit.filter(function (a) {
      if (a.file === c.id) return true;
      if (oppIds.indexOf(a.file) >= 0 && /introduction/.test(a.action) && a.detail.indexOf(c.short) >= 0) return true;
      return false;
    }).sort(function (a, b) { return a.t < b.t ? 1 : -1; });
    var who = function (a) { return a.who === 'company' ? 'You' : a.who === 'rules' ? 'Rules' : 'SBC'; };
    var text = function (a) {
      if (a.who === 'company') return a.action.replace(/^Uploaded a document$/, 'You uploaded a document').replace(/^Sent the evidence to SBC$/, 'You sent your evidence to SBC').replace(/^Registered$/, 'You registered').replace(/^Marked a plan item done$/, 'You marked a plan item done').replace(/^Sent fixes for the action plan$/, 'You sent your fixes').replace(/^Accepted an introduction$/, 'You accepted an introduction').replace(/^Declined an introduction$/, 'You declined an introduction').replace(/^Uploaded 2 documents$/, 'You uploaded 2 documents');
      return MAP[a.action] || a.action;
    };
    var isR = function (a) { return a.who === 'rules' && /checks|screening/i.test(a.action); };
    var detail = function (a) { return a.action === 'Signed key 1' ? '' : /introduction/.test(a.action) ? S.opp(a.file).title : a.detail; };
    return shell('updates', '<b>Updates</b>', '<div class="ttl"><h1>Updates</h1><span class="sub">Everything that has happened on your file</span></div><section class="panel timeline">' +
      (rows.length ? rows.map(function (a) { return '<div class="tl"><span class="d">' + D.short(a.t) + ' ' + a.t.slice(11, 16) + '</span><span class="av" style="' + (a.who === 'company' ? 'background:#E6E8EC;color:#3D4250' : isR(a) ? 'background:#E3EAFD;color:#1F4FD1' : '') + '">' + (a.who === 'company' ? 'Y' : isR(a) ? 'R' : 'S') + '</span><span><b style="font-weight:500">' + E(text(a)) + '</b>' + (detail(a) ? '<br><span class="muted">' + E(detail(a)) + '</span>' : '') + '</span></div>'; }).join('')
        : '<div class="empty">Nothing yet.</div>') + '</section>');
  }

  /* ---------- register ---------- */
  function vRegister() {
    var f = ui.reg || (ui.reg = { step: 0, name: '', country: 'Germany', city: '', sector: 'water', contact: '', email: '', target: ['UAE'], raising: false, err: '' });
    var steps = ['Company', 'Contact', 'Gulf plans', 'Review'];
    var nav = '<div class="steps">' + steps.map(function (s, i) { return '<div class="s' + (i === f.step ? ' on' : i < f.step ? ' done' : '') + '"><span class="n">' + (i < f.step ? '✓' : i + 1) + '</span>' + s + '</div>'; }).join('') + '<span class="muted" style="font-size:12px;padding:12px 8px">About ten minutes. Demo data only.</span></div>';
    var form = '';
    if (f.step === 0) form = '<label class="fl" for="rn">Legal company name<span class="muted">As it appears on your registration</span><input id="rn" class="input" data-in="name" value="' + E(f.name) + '" placeholder="Tidewater Pumps GmbH"></label>' +
      '<div class="row2"><label class="fl" for="rc">Country of registration<select id="rc" class="input" data-ch="country">' + HOME.map(function (h) { return '<option' + (h === f.country ? ' selected' : '') + '>' + h + '</option>'; }).join('') + '</select></label><label class="fl" for="ry">City<input id="ry" class="input" data-in="city" value="' + E(f.city) + '" placeholder="Hamburg"></label></div>' +
      '<label class="fl" for="rs">Sector<select id="rs" class="input" data-ch="sector">' + Object.keys(SBC_SEED.sectors).map(function (k) { return '<option value="' + k + '"' + (k === f.sector ? ' selected' : '') + '>' + SBC_SEED.sectors[k] + '</option>'; }).join('') + '</select></label>';
    if (f.step === 1) form = '<label class="fl" for="rp">Contact person<input id="rp" class="input" data-in="contact" value="' + E(f.contact) + '" placeholder="Full name"></label><label class="fl" for="re">Work email<input id="re" class="input" type="email" data-in="email" value="' + E(f.email) + '" placeholder="name@company.com"></label>';
    if (f.step === 2) form = '<span class="fl">Where in the Gulf do you want to work?</span><div class="checks2">' + COUNTRIES.map(function (k) { var on = f.target.indexOf(k) >= 0; return '<label class="cbx' + (on ? ' on' : '') + '"><input type="checkbox" data-ch="target" data-v="' + k + '"' + (on ? ' checked' : '') + '>' + k + '</label>'; }).join('') + '</div>' +
      '<label class="cbx' + (f.raising ? ' on' : '') + '" style="width:fit-content"><input type="checkbox" data-ch="raising"' + (f.raising ? ' checked' : '') + '>Open to investment from Gulf investors</label><span class="muted">A local agent or ICV certificate is not needed to apply. If you are short, your action plan lists agents SBC has reviewed.</span>';
    if (f.step === 3) form = '<dl class="kvl" style="padding:0"><dt>Company</dt><dd>' + E(f.name) + '</dd><dt>Registered in</dt><dd>' + E(f.country) + (f.city ? ', ' + E(f.city) : '') + '</dd><dt>Sector</dt><dd>' + E(SBC_SEED.sectors[f.sector]) + '</dd><dt>Contact</dt><dd>' + E(f.contact) + ' · ' + E(f.email) + '</dd><dt>Gulf markets</dt><dd>' + E(f.target.join(', ')) + '</dd><dt>Investment</dt><dd>' + (f.raising ? 'Open to it' : 'Not now') + '</dd></dl><span class="muted">Next you upload your evidence. Nothing reaches a buyer until two SBC officers sign.</span>';
    return '<div class="reg-top">' + I.brand + '<b>SBC Capital</b><span class="muted">Apply to be SBC-Qualified</span><span class="sp" style="flex:1"></span><span class="muted">Already applied? <a href="#status">Back to the portal</a></span></div>' +
      '<div class="reg">' + nav + '<section class="panel"><div class="ph"><span class="mono muted" style="font-weight:400">Step ' + (f.step + 1) + ' of 4</span><h2 style="margin-left:6px">' + steps[f.step] + '</h2></div><div class="form">' + form +
      (f.err ? '<span class="err" role="alert">' + E(f.err) + '</span>' : '') +
      '<div style="display:flex;justify-content:space-between;margin-top:6px">' + (f.step ? '<button class="btn" data-a="rback">Back</button>' : '<a class="btn" href="#status">Cancel</a>') + '<button class="btn pri" data-a="rnext">' + (f.step === 3 ? 'Create account' : 'Continue') + '</button></div></div></section></div>';
  }

  /* ---------- render ---------- */
  function render() {
    var r = route(), act = document.activeElement, fid = act && act.id, s0 = act && act.selectionStart, s1 = act && act.selectionEnd, sy = window.scrollY;
    var views = { status: vStatus, checklist: vChecklist, plan: vPlan, intros: vIntros, mark: vMark, updates: vUpdates, register: vRegister };
    var html = (views[r.name] || vStatus)();
    if (ui.toast) html += '<div class="toast" role="status">' + (ui.toast.cube ? I.cube : '') + E(ui.toast.msg) + '</div>';
    if (ui.dialog) html += '<div class="scrim" data-a="dclose"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">' + E(ui.dialog.title) + '</h2><p class="sub" style="margin:0">' + E(ui.dialog.body) + '</p><div class="row"><button class="btn" data-a="dclose">Cancel</button><button class="btn pri" data-a="dok">' + E(ui.dialog.ok) + '</button></div></div></div>';
    html += '<a class="back" href="/">' + I.chev + 'Portal preview</a>';
    var changed = ui.last !== location.hash;
    root.innerHTML = html;
    var pg = root.querySelector('.page'); if (pg && changed) pg.classList.add('enter');
    if (changed) { ui.last = location.hash; window.scrollTo(0, 0); } else window.scrollTo(0, sy);
    if (fid) { var el = document.getElementById(fid); if (el) { el.focus(); try { if (s0 != null) el.setSelectionRange(s0, s1); } catch (e) {} } }
    document.title = ((root.querySelector('h1') || root.querySelector('h2') || {}).textContent || 'Company portal') + ' · SBC company portal';
  }

  var A = {
    upload: function (el) {
      var n = el.dataset.n, c = me(); ui.busy[n] = 1; render();
      setTimeout(function () { delete ui.busy[n]; toast(S.act.upload(c.id, n)); }, 650);
    },
    remove: function (el) { S.act.removeUpload(me().id, el.dataset.n); },
    pupload: function (el) {
      var v = el.dataset.v, c = me(); ui.busy['p' + v] = 1; render();
      setTimeout(function () { delete ui.busy['p' + v]; S.act.tickPlan(c.id, v, true); toast('Uploaded. Marked done'); }, 650);
    },
    send: function () { var c = me(); ui.dialog = { title: 'Send your evidence to SBC?', body: 'Your files lock as this version. The rules check them straight away, then two officers review them.', ok: 'Send to SBC', fn: function () { toast(S.act.submitEvidence(c.id), true); go('status'); } }; render(); },
    fixes: function () { var c = me(); ui.dialog = { title: 'Send your fixes to SBC?', body: 'The rules re-run only the checks that had gaps. Two officers then sign again.', ok: 'Send to SBC', fn: function () { toast(S.act.sendFixes(c.id), true); go('status'); } }; render(); },
    askagent: function (el) { toast('SBC will put you in touch with ' + el.dataset.v); },
    respond: function (el) { toast(S.act.respond(el.dataset.o, me().id, el.dataset.v), el.dataset.v === 'accept'); },
    copy: function (el) {
      var t = el.dataset.v, done = function () { toast('Copied'); };
      try { navigator.clipboard.writeText(t).then(done, function () { toast('Select the text to copy it'); }); } catch (e) { toast('Select the text to copy it'); }
    },
    cert: function () { toast('The certificate download is not part of the preview'); },
    reset: function () { ui.dialog = { title: 'Reset the demo data?', body: 'Every change made in this browser goes back to the starting data.', ok: 'Reset', fn: function () { toast(S.act.reset()); go('status'); } }; render(); },
    rback: function () { ui.reg.step--; ui.reg.err = ''; render(); },
    rnext: function () {
      var f = ui.reg; f.err = '';
      if (f.step === 0 && f.name.trim().length < 3) f.err = 'Enter the company’s legal name.';
      if (f.step === 1 && !f.contact.trim()) f.err = 'Enter a contact person.';
      if (f.step === 1 && !f.err && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) f.err = 'Enter a work email, like name@company.com.';
      if (f.step === 2 && !f.target.length) f.err = 'Pick at least one Gulf country.';
      if (f.err) { render(); return; }
      if (f.step < 3) { f.step++; render(); return; }
      var id = S.act.register({ name: f.name.trim(), country: f.country, city: f.city.trim(), sector: f.sector, contact: f.contact.trim(), email: f.email.trim(), target: f.target.slice(), raising: f.raising });
      S.act.setCompany(id); ui.reg = null; go('checklist'); toast('Account created. Upload your evidence next');
    },
    dclose: function (el, ev) { if (ev && ev.target !== el) return; ui.dialog = null; render(); },
    dok: function () { var fn = ui.dialog.fn; ui.dialog = null; fn(); render(); }
  };
  root.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-a]'); if (!el || !root.contains(el)) return;
    if (el.disabled) return;
    var a = el.dataset.a; if (!A[a]) return;
    if (a === 'dclose' && ev.target !== el && el.classList.contains('scrim')) return;
    ev.stopPropagation(); A[a](el, ev);
  });
  root.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && ui.dialog) { ui.dialog = null; render(); } });
  root.addEventListener('input', function (ev) { var k = ev.target.dataset.in; if (k && ui.reg) { ui.reg[k] = ev.target.value; if (ui.reg.err) { ui.reg.err = ''; render(); } } });
  root.addEventListener('change', function (ev) {
    var el = ev.target, k = el.dataset.ch; if (!k) return;
    if (k === 'acct') { if (el.value === '__new') { ui.reg = null; go('register'); } else { S.act.setCompany(el.value); toast('Viewing as ' + me().short); go('status'); } return; }
    if (k === 'tick') { S.act.tickPlan(me().id, el.dataset.v, el.checked); return; }
    if (k === 'country' || k === 'sector') { ui.reg[k] = el.value; return; }
    if (k === 'target') { var t = ui.reg.target, i = t.indexOf(el.dataset.v); if (el.checked && i < 0) t.push(el.dataset.v); if (!el.checked && i >= 0) t.splice(i, 1); ui.reg.err = ''; render(); return; }
    if (k === 'raising') { ui.reg.raising = el.checked; render(); }
  });
  window.addEventListener('hashchange', render);
  S.subscribe(render);
  render();
})();
