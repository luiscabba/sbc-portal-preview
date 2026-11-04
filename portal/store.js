/* SBC portal store: demo state kept in this browser, the written rules, the match rules and every action.
   Every view reads from SBC.data and changes it only through SBC.act, which also writes the audit log. */
(function () {
  var KEY = 'sbc-portal-demo', VERSION = 5;
  var seed = window.SBC_SEED;
  var listeners = [];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function fresh(prev) { return { v: VERSION, data: clone(seed), session: { officer: 'A', signedIn: prev ? !!prev.session.signedIn : false, company: 'orrin', buyer: 'b-adwu' } }; }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === VERSION && s.data) return s; } catch (e) {}
    return fresh();
  }
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function notify() { listeners.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }
  window.addEventListener('storage', function (e) { if (e.key === KEY) { state = load(); notify(); } });

  /* ---------- dates: the demo runs on a fixed calendar so it reads the same every day ---------- */
  var TODAY = seed.today;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function d(s) { var p = String(s).slice(0, 10).split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function iso(dt) { return dt.toISOString().slice(0, 10); }
  function addDays(s, n) { var x = d(s); x.setUTCDate(x.getUTCDate() + n); return iso(x); }
  function days(a, b) { return Math.round((d(b) - d(a)) / 864e5); }
  var date = {
    today: TODAY,
    add: addDays,
    days: days,
    short: function (s) { if (!s) return ''; var x = d(s); return x.getUTCDate() + ' ' + MON[x.getUTCMonth()]; },
    long: function (s) { if (!s) return ''; var x = d(s); return x.getUTCDate() + ' ' + MON[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); },
    month: function (s) { if (!s) return ''; var x = d(s); return MON[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); },
    dow: function (s) { return DOW[d(s).getUTCDay()]; },
    age: function (s) { var n = days(s, TODAY); return n <= 0 ? 'Today' : n + 'd'; },
    when: function (s) { var n = days(s, TODAY); if (n <= 0) return 'Today'; if (n === 1) return 'Yesterday'; if (n < 7) return DOW[d(s).getUTCDay()]; return date.short(s); },
    left: function (s) { var n = days(TODAY, s); return n; },
    stamp: function () { var t = new Date(); return TODAY + 'T' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0'); }
  };

  /* ---------- lookups ---------- */
  function D() { return state.data; }
  function company(id) { return D().companies.filter(function (c) { return c.id === id; })[0]; }
  function opp(id) { return D().opps.filter(function (o) { return o.id === id; })[0]; }
  function party(id) { return D().buyers.concat(D().investors).filter(function (p) { return p.id === id; })[0]; }
  function agent(id) { return D().agents.filter(function (a) { return a.id === id; })[0]; }
  function officerName(id) { return id && D().officers[id] ? D().officers[id].name : ''; }
  function me() { return state.session.officer; }
  function other(id) { return id === 'A' ? 'B' : 'A'; }

  /* ---------- the written rules ---------- */
  var CHECKS = [
    { key: 'identity', name: 'Identity' },
    { key: 'ownership', name: 'Ownership' },
    { key: 'licences', name: 'Licences' },
    { key: 'screening', name: 'Screening' },
    { key: 'readiness', name: 'Gulf readiness' }
  ];
  var RULES = [
    { id: 'ID-1', check: 'identity', text: 'The registered name matches the application', met: 'Same name on the register', needs: 'The names differ' },
    { id: 'ID-2', check: 'identity', text: 'The company is active, with no insolvency or liquidation', met: 'Active on the register', needs: 'Any other status' },
    { id: 'ID-3', check: 'identity', text: 'The signatory is on the register', met: 'Listed as a director', needs: 'Not listed' },
    { id: 'OWN-1', check: 'ownership', text: 'Each owner is on an official record', met: 'On a register or a certified list', needs: 'Only on a company-made document' },
    { id: 'OWN-2', check: 'ownership', text: 'Ownership is traced to the people who own it', met: 'Every chain ends in people', needs: 'A holding company with no official owner record' },
    { id: 'LIC-1', check: 'licences', text: 'Each licence is current, with 90 days or more left', met: '90 days or more left', needs: 'Expired, or under 90 days left' },
    { id: 'LIC-2', check: 'licences', text: 'Every licence names the same company', met: 'Holder matches the register', needs: 'A different holder' },
    { id: 'SCR-1', check: 'screening', text: 'No sanctions or PEP match for the company, its owners or directors', met: 'All parties clear', needs: 'Any possible match' },
    { id: 'SCR-2', check: 'screening', text: 'No adverse media in the last five years', met: 'Nothing found', needs: 'Any possible match' },
    { id: 'GR-1', check: 'readiness', text: 'Local content and presence meet the target country’s rules', met: 'ICV certificate, local entity or agent agreement on file', needs: 'None on file. Goes on the action plan, never a fail' }
  ];
  var MATCH_RULES = [
    { id: 'M-1', stage: 'Eligible', text: 'The mark is current, and the sector and country fit' },
    { id: 'M-2', stage: 'Capable', text: 'Has done this kind of work. For investors: open to investment' },
    { id: 'M-3', stage: 'Ready', text: 'Has a local presence in the country' },
    { id: 'M-4', stage: 'Ranked', text: 'Ordered by relevant references' }
  ];

  var EVIDENCE = [
    { name: 'Certificate of incorporation or trade licence', hint: 'As issued in your home country' },
    { name: 'Register extract', hint: 'From your company register, less than three months old' },
    { name: 'Shareholder register', hint: 'Certified, showing every shareholder' },
    { name: 'Ownership chart', hint: 'Every company up to the people who own it' },
    { name: 'IDs for owners and directors', hint: 'Names and dates of birth, for screening' },
    { name: 'Licences and certifications', hint: 'Sector licences, ISO and similar' },
    { name: 'Audited accounts, last two years', hint: 'Signed by your auditor' },
    { name: 'Company profile and references', hint: 'Work of the kind you want in the Gulf' },
    { name: 'Declaration signed by a director', hint: 'Confirms the file is true and complete' },
    { name: 'ICV certificate', hint: 'If you have one. Not a pass condition', optional: true },
    { name: 'Local entity or agent agreement', hint: 'If you have one. Not a pass condition', optional: true }
  ];
  function uploads(c) {
    var have = (c.uploads && c.uploads.have) || [];
    var missing = EVIDENCE.filter(function (e) { return !e.optional && have.indexOf(e.name) < 0; }).map(function (e) { return e.name; });
    return { have: have, done: have.length, total: EVIDENCE.length, missing: missing, ready: !missing.length };
  }
  function presence(c, country) { var l = (c.local || {})[country] || {}; return l.icv || l.entity || l.agent ? l : null; }
  function presenceText(l) {
    if (!l) return '';
    var a = [];
    if (l.entity) a.push('Local entity ' + l.entity);
    if (l.agent) a.push('Agent ' + l.agent);
    if (l.icv) a.push('ICV ' + l.icv);
    return a.join(' · ');
  }

  function evaluate(c) {
    if (!c.reg) return null;
    var checks = { identity: [], ownership: [], licences: [], screening: [], readiness: [] };
    var r = c.reg;
    checks.identity.push({ rule: 'ID-1', text: 'Name matches the register', res: r.name === c.name ? 'met' : 'needs', why: r.name + ', ' + r.number, doc: 'register', hl: ['name'] });
    var active = (r.status === 'Active' || r.status === 'Registered') && !r.insolvency;
    checks.identity.push({ rule: 'ID-2', text: 'Active, no insolvency', res: active ? 'met' : 'needs', why: 'Status: ' + r.status + '. Last entry ' + date.long(r.lastEntry), doc: 'register', hl: ['status'] });
    var signs = (r.directors || []).indexOf(c.signatory) >= 0;
    checks.identity.push({ rule: 'ID-3', text: 'Signatory is on the register', res: signs ? 'met' : 'needs', why: c.signatory + (signs ? ', listed as director' : ' is not listed'), doc: 'register', hl: ['directors'] });

    var made = [];
    (c.owners || []).forEach(function (o, i) {
      if (o.src === 'official') {
        checks.ownership.push({ rule: 'OWN-1', text: o.name + ' owns ' + o.pct + '%' + (o.of === 'self' ? '' : ' of ' + o.of.replace(/ (GmbH|Ltd|BV|AS|S\.L\.|Inc\.)$/, '')),
          res: 'met', why: o.ref ? 'Matches ' + o.ref : (o.kind === 'person' ? 'A person, on the certified list' : 'On the certified list'), doc: 'owners', hl: ['o' + i] });
      } else made.push({ o: o, i: i });
    });
    if (made.length) {
      made.forEach(function (m) {
        var parent = (c.owners || []).filter(function (x) { return x.name === m.o.of; })[0];
        var ref = parent && parent.ref ? parent.ref : '';
        checks.ownership.push({ rule: 'OWN-2', text: m.o.of + ' traced to its owners', res: 'needs',
          why: 'Only the company’s own chart names an owner. Needs the register record' + (ref ? ', ' + ref : '') + '.',
          doc: 'chart', hl: ['o' + m.i], ai: 'Reads ' + m.o.name + ' as the owner of ' + m.o.of + ' from the chart.',
          plan: 'Official register record for ' + m.o.of + (ref ? ' (' + ref + ')' : '') });
      });
    } else {
      var people = (c.owners || []).filter(function (o) { return o.kind === 'person'; });
      checks.ownership.push({ rule: 'OWN-2', text: 'Traced to the people who own it', res: 'met', why: people.map(function (p) { return p.name; }).join(', '), doc: 'owners',
        hl: (c.owners || []).map(function (o, i) { return o.kind === 'person' ? 'o' + i : null; }).filter(Boolean) });
    }

    (c.licences || []).forEach(function (l, i) {
      var left = days(TODAY, l.expires);
      checks.licences.push({ rule: 'LIC-1', text: l.name + ' is current', res: left >= 90 ? 'met' : 'needs',
        why: left < 0 ? 'Expired ' + date.long(l.expires) : 'Valid until ' + date.long(l.expires) + (left < 90 ? ', ' + left + ' days left' : ''),
        doc: 'licence:' + i, hl: ['expires'], ai: left < 90 ? 'Checks the issuer’s public register for a renewal date.' : '', plan: left < 90 ? 'Renewed ' + l.name + ' certificate' : '' });
    });
    var same = (c.licences || []).every(function (l) { return l.holder === c.name; });
    checks.licences.push({ rule: 'LIC-2', text: 'Every licence names ' + c.short, res: same ? 'met' : 'needs', why: same ? 'Holder matches the register' : 'A licence names a different holder', doc: 'licence:0', hl: ['holder'] });

    var s = c.screening || { hits: [], parties: [] };
    var sp = s.hits.filter(function (h) { return h.kind === 'sanctions' || h.kind === 'pep'; });
    if (sp.length) sp.forEach(function (h) {
      checks.screening.push({ rule: 'SCR-1', text: 'Not the ' + h.name + ' on ' + (h.kind === 'pep' ? 'a PEP list' : 'a sanctions list'), res: 'needs', why: h.note, doc: 'screening', hl: ['hit:' + h.name],
        ai: 'Name and birth year both match. Likely the same person.', plan: 'Identity documents to clear the screening match for ' + h.name, hit: h.kind });
    });
    else checks.screening.push({ rule: 'SCR-1', text: 'No sanctions or PEP match', res: 'met', why: s.parties.length + ' parties clear on ' + date.long(s.run), doc: 'screening', hl: ['sanctions'] });
    var media = s.hits.filter(function (h) { return h.kind === 'media'; });
    if (media.length) media.forEach(function (h) {
      checks.screening.push({ rule: 'SCR-2', text: 'Not the ' + h.name + ' in the news', res: 'needs', why: h.note, doc: 'screening', hl: ['hit:' + h.name],
        ai: 'Different birth year and country. Likely not the same person.', plan: 'Identity documents to clear the news match for ' + h.name });
    });
    else checks.screening.push({ rule: 'SCR-2', text: 'No adverse media', res: 'met', why: 'News searched, last five years', doc: 'screening', hl: ['media'] });

    (c.target || []).forEach(function (country) {
      var l = presence(c, country);
      var nAg = D().agents.filter(function (a) { return a.country === country && a.status === 'active'; }).length;
      checks.readiness.push({ rule: 'GR-1', text: 'Local content and presence meet ' + country + ' rules', res: l ? 'met' : 'needs',
        why: l ? presenceText(l) : 'None yet. Goes on the action plan, not a fail.', doc: 'local:' + country, hl: ['local'],
        ai: l ? '' : 'Drafts the plan item with ' + nAg + ' panel agent' + (nAg === 1 ? '' : 's') + '.',
        plan: l ? '' : 'ICV certificate, local entity or a signed agent agreement for ' + country, country: country });
    });

    return CHECKS.map(function (ch) {
      var n = {};
      return { key: ch.key, name: ch.name, conds: checks[ch.key].map(function (x) { n[x.rule] = (n[x.rule] || 0); x.id = x.rule + '.' + n[x.rule]++; return x; }) };
    });
  }

  /* answers for one key: 'all' means every condition confirmed except those listed as requested */
  function answers(c, key) {
    var k = c.review && c.review[key];
    if (!k) return {};
    if (k.answers === 'all') {
      var out = {}; (evaluate(c) || []).forEach(function (ch) { ch.conds.forEach(function (x) { out[x.id] = 'confirm'; }); });
      (k.requested || []).forEach(function (id) { out[id] = 'request'; });
      return out;
    }
    return k.answers || {};
  }
  function inScope(c, checkKey) { var s = c.review && c.review.scope; return !s || s.indexOf(checkKey) >= 0; }
  function checkStatus(c, ch, key) {
    if (!inScope(c, ch.key)) return 'earlier';
    var a = answers(c, key), open = 0, req = 0;
    ch.conds.forEach(function (x) { if (!a[x.id]) open++; else if (a[x.id] === 'request') req++; });
    return open ? 'open' : req ? 'requested' : 'confirmed';
  }
  function progress(c, key) {
    var ev = evaluate(c); if (!ev) return { done: 0, total: 5, statuses: [] };
    var st = ev.map(function (ch) { return checkStatus(c, ch, key); });
    return { done: st.filter(function (s) { return s !== 'open'; }).length, total: st.length, statuses: st, needs: ev.reduce(function (n, ch) { return n + (inScope(c, ch.key) ? ch.conds.filter(function (x) { return x.res === 'needs'; }).length : 0); }, 0) };
  }
  function requested(c, key) {
    var a = answers(c, key), out = [];
    (evaluate(c) || []).forEach(function (ch) { if (!inScope(c, ch.key)) return; ch.conds.forEach(function (x) { if (a[x.id] === 'request') out.push(Object.assign({ check: ch.key, checkName: ch.name }, x)); }); });
    return out;
  }
  function proposal(c, key) { return requested(c, key).length ? 'conditional' : 'qualified'; }

  /* ---------- the match rules ---------- */
  function markCurrent(c) { return c.stage === 'qualified' && c.mark && !c.mark.withdrawn && c.mark.validTo >= TODAY; }
  function match(o) {
    var cos = D().companies;
    if (o.kind === 'request') {
      var c = company(o.company);
      return { skip: true, stages: [], ranked: c ? [{ c: c, why: 'Asked for by name in the directory' }] : [] };
    }
    var sectors = o.sectors || [o.sector], countries = o.countries || [o.country];
    var inSector = cos.filter(function (c) { return sectors.indexOf(c.sector) >= 0; });
    var s1 = [], d1 = [];
    inSector.forEach(function (c) {
      if (!markCurrent(c)) d1.push({ c: c, why: c.stage === 'notyet' ? 'Not yet' : 'Not SBC-Qualified yet' });
      else if (!(c.target || []).some(function (t) { return countries.indexOf(t) >= 0; })) d1.push({ c: c, why: 'Not targeting ' + countries.join(' or ') });
      else s1.push(c);
    });
    var s2 = [], d2 = [];
    s1.forEach(function (c) {
      var want = o.capabilities || [o.capability];
      var ok = o.kind === 'mandate' ? c.raising : want.some(function (k) { return (c.capabilities || []).indexOf(k) >= 0; });
      if (ok) s2.push(c); else d2.push({ c: c, why: o.kind === 'mandate' ? 'Not open to investment' : 'No ' + want.map(function (k) { return (seed.capabilities[k] || '').toLowerCase(); }).join(' or ') + ' work on record' });
    });
    var s3 = [], d3 = [];
    s2.forEach(function (c) {
      var l = null; countries.forEach(function (k) { l = l || presence(c, k); });
      if (l) s3.push(c); else d3.push({ c: c, why: 'No local presence in ' + countries.join(' or ') });
    });
    var ranked = s3.slice().sort(function (a, b) { return b.refs - a.refs; }).map(function (c) {
      var l = null; countries.forEach(function (k) { l = l || presence(c, k); });
      return { c: c, why: c.refs + ' relevant reference' + (c.refs === 1 ? '' : 's') + ' · ' + presenceText(l) };
    });
    return {
      skip: false, ranked: ranked, others: cos.length - inSector.length,
      stages: [
        { name: 'Eligible', rule: 'M-1', pass: s1, drop: d1 },
        { name: 'Capable', rule: 'M-2', pass: s2, drop: d2 },
        { name: 'Ready', rule: 'M-3', pass: s3, drop: d3 },
        { name: 'Ranked', rule: 'M-4', pass: ranked.map(function (r) { return r.c; }), drop: [] }
      ]
    };
  }

  /* ---------- audit ---------- */
  function log(who, action, file, detail, tag, ver) {
    D().audit.unshift({ t: date.stamp(), who: who, action: action, file: file || '', detail: detail || '', tag: tag || 'change', ver: ver || '' });
  }
  function commit(msg) { save(); notify(); return msg; }

  function nextMarkId() {
    var n = 0; D().companies.forEach(function (c) { if (c.mark) { var m = +String(c.mark.id).split('-').pop(); if (m > n) n = m; } });
    return 'SBC-Q-2026-' + String(n + 1).padStart(4, '0');
  }

  /* ---------- actions ---------- */
  var act = {
    signIn: function () { state.session.signedIn = true; return commit(); },
    signOut: function () { state.session.signedIn = false; return commit(); },
    setCompany: function (id) { state.session.company = id; return commit(); },
    setBuyer: function (id) { state.session.buyer = id; return commit(); },
    switchOfficer: function () { state.session.officer = other(me()); return commit('Now signed in as ' + officerName(me())); },
    reset: function () { state = fresh(state); save(); notify(); return 'Demo data reset'; },

    take: function (id) { var c = company(id); c.owner = me(); log(me(), 'Took the file', id, 'Assigned', 'change'); return commit(c.short + ' is yours'); },

    answer: function (id, key, condId, v) {
      var c = company(id), rv = c.review;
      if (!rv[key]) rv[key] = { by: me(), answers: {} };
      if (rv[key].answers === 'all') rv[key].answers = answers(c, key);
      rv[key].by = me();
      rv[key].answers[condId] = v;
      if (key === 'k1' && !c.owner) c.owner = me();
      return commit();
    },
    undo: function (id, key, condId) { var c = company(id), k = c.review[key]; if (!k) return; if (k.answers === 'all') k.answers = answers(c, key); delete k.answers[condId]; return commit(); },

    sendToSecond: function (id, outcome, planItems) {
      var c = company(id), rv = c.review;
      rv.k1.sent = true; rv.k1.at = TODAY; rv.k1.outcome = outcome; rv.k1.by = me();
      if (planItems) c.plan = { draft: true, items: planItems };
      c.stage = 'sign'; c.since = TODAY; c.due = date.add(TODAY, 2);
      log(me(), 'Signed key 1', id, 'Proposed: ' + label(outcome), 'sign', 'v' + (rv.round + 1));
      return commit('Sent to a second officer');
    },

    sign: function (id, outcome) {
      var c = company(id), rv = c.review;
      if (rv.k1 && rv.k1.by === me()) return 'A different officer has to sign';
      rv.k2 = rv.k2 || { answers: {} }; rv.k2.by = me(); rv.k2.at = TODAY;
      c.decided = TODAY; c.outcome = outcome; c.since = TODAY; c.due = null;
      log(me(), 'Signed key 2', id, label(outcome), 'sign', 'v' + (rv.round + 1));
      if (outcome === 'qualified') {
        c.stage = 'qualified';
        var keep = c.mark && !c.mark.withdrawn && c.mark.validTo >= TODAY;
        c.mark = { id: keep ? c.mark.id : nextMarkId(), issued: keep ? c.mark.issued : TODAY, validTo: date.add(TODAY, 365), lastScreen: TODAY };
        c.plan = null; rv.scope = null;
        log('rules', keep ? 'Renewed the mark' : 'Issued the mark', id, c.mark.id, 'change');
        return commit(c.short + ' is SBC-Qualified');
      }
      if (outcome === 'conditional') {
        c.stage = 'plan'; c.due = null;
        var items = (c.plan && c.plan.items) || requested(c, 'k1').map(function (x, i) { return { id: 'p' + (i + 1), rule: x.rule, check: x.check, text: x.plan || x.text, due: date.add(TODAY, 14), done: false }; });
        c.plan = { sent: TODAY, items: items };
        c.due = items.reduce(function (m, it) { return !m || it.due > m ? it.due : m; }, null);
        log(me(), 'Sent the action plan', id, items.length + ' item' + (items.length === 1 ? '' : 's') + ' · due ' + date.short(c.due), 'change');
        return commit('Action plan sent to ' + c.short);
      }
      c.stage = 'notyet'; c.reason = c.reason || 'Decided by two officers';
      return commit(c.short + ' is marked Not yet');
    },

    remind: function (id) { var c = company(id); log(me(), 'Reminded the company', id, c.stage === 'plan' ? 'Action plan' : 'Uploads', 'change'); return commit('Reminder sent to ' + c.short); },

    recheck: function (id) {
      var c = company(id);
      c.review = { round: (c.review ? c.review.round : 1) + 1, scope: null, k1: null, k2: null };
      c.stage = 'check'; c.since = TODAY; c.due = date.add(TODAY, 3); c.owner = me();
      log('rules', 'Ran the five checks', id, 'Re-check', 'rules', 'v1.0');
      log(me(), 'Started a re-check', id, 'Mark stays current', 'change');
      return commit('Re-check started. The mark stays current meanwhile');
    },
    withdraw: function (id) {
      var c = company(id);
      if (c.mark) c.mark.withdrawn = TODAY;
      c.stage = 'notyet'; c.outcome = 'notyet'; c.decided = TODAY; c.since = TODAY; c.reason = 'Mark withdrawn by SBC';
      log(me(), 'Withdrew the mark', id, c.mark ? c.mark.id : '', 'sign');
      return commit('Mark withdrawn');
    },

    /* the company sends its fixes (phase 2 does this from the company portal) */
    submitFixes: function (id) {
      var c = company(id), checks = {};
      (c.plan ? c.plan.items : []).forEach(function (it) { checks[it.check] = 1; });
      (c.target || []).forEach(function (k) {
        var gr = (c.plan ? c.plan.items : []).filter(function (it) { return it.rule === 'GR-1' && (!it.country || it.country === k); });
        if (!gr.length || presence(c, k)) return;
        var pick = gr.filter(function (it) { return it.agents && it.agents.length; })[0];
        var ag = pick ? agent(pick.agents[0]) : D().agents.filter(function (a) { return a.country === k && a.status === 'active'; })[0];
        c.local[k] = c.local[k] || {}; c.local[k].agent = ag ? ag.name : '[Agent] LLC';
      });
      if (c.plan) c.plan.items.forEach(function (it) { it.done = true; });
      c.review = { round: (c.review ? c.review.round : 1) + 1, scope: Object.keys(checks), k1: null, k2: null };
      c.stage = 'check'; c.since = TODAY; c.due = date.add(TODAY, 3);
      log('company', 'Sent fixes for the action plan', id, Object.keys(checks).length + ' check' + (Object.keys(checks).length === 1 ? '' : 's'), 'change');
      log('rules', 'Ran the checks with gaps', id, Object.keys(checks).join(', '), 'rules', 'v1.0');
      return commit();
    },

    /* company portal */
    upload: function (id, name) {
      var c = company(id); c.uploads = c.uploads || { have: [] };
      if (c.uploads.have.indexOf(name) < 0) c.uploads.have.push(name);
      log('company', 'Uploaded a document', id, name, 'change');
      return commit(name + ' uploaded');
    },
    removeUpload: function (id, name) { var c = company(id), h = c.uploads.have, i = h.indexOf(name); if (i >= 0) h.splice(i, 1); return commit(); },
    submitEvidence: function (id) {
      var c = company(id), u = uploads(c), city = c.city || '';
      c.reg = c.reg || { registry: '[Company register], ' + c.country, number: '[registration number]', name: c.name, status: 'Active', insolvency: false, incorporated: c.founded || '2012-01-01', address: (c.address || '[registered address]') + (city ? ', ' + city : ''), directors: [c.contact], lastEntry: D().today };
      c.signatory = c.signatory || c.contact;
      c.owners = c.owners || [{ name: c.contact, kind: 'person', pct: 100, of: 'self', src: 'official' }];
      c.licences = c.licences || [{ name: 'ISO 9001:2015', issuer: '[Certification body]', holder: c.name, expires: date.add(TODAY, 640) }];
      c.screening = { run: TODAY, parties: [c.name].concat(c.owners.filter(function (o) { return o.kind === 'person'; }).map(function (o) { return o.name; })), hits: [] };
      c.local = c.local || {};
      (c.target || []).forEach(function (k) { c.local[k] = c.local[k] || {}; if (u.have.indexOf('Local entity or agent agreement') >= 0 && !presence(c, k)) c.local[k].agent = '[Agent named in your upload]'; if (u.have.indexOf('ICV certificate') >= 0 && !c.local[k].icv) c.local[k].icv = '[score]'; });
      c.review = { round: 1, scope: null, k1: null, k2: null };
      c.stage = 'check'; c.since = TODAY; c.sent = TODAY; c.due = date.add(TODAY, 3); c.owner = null;
      log('company', 'Sent the evidence to SBC', id, u.done + ' of ' + u.total + ' documents', 'change');
      log('rules', 'Ran the five checks', id, 'First review', 'rules', 'v1.0');
      return commit('Sent to SBC. The rules have checked your file');
    },
    tickPlan: function (id, itemId, done) {
      var c = company(id), it = c.plan.items.filter(function (x) { return x.id === itemId; })[0];
      it.done = done; if (done) log('company', 'Marked a plan item done', id, it.text, 'change');
      return commit();
    },
    sendFixes: function (id) { var c = company(id); act.submitFixes(id); return 'Sent to SBC. The rules re-ran the checks with gaps'; },
    respond: function (oid, cid, v) {
      var o = opp(oid), it = o.intros.filter(function (x) { return x.company === cid; })[0];
      it.status = v === 'accept' ? 'meeting' : 'declined'; it.at = TODAY;
      log('company', v === 'accept' ? 'Accepted an introduction' : 'Declined an introduction', oid, company(cid).short, 'change');
      return commit(v === 'accept' ? 'Accepted. SBC will arrange the first meeting' : 'Declined. SBC will let them know');
    },
    register: function (f) {
      var id = 'co' + (D().companies.length + 1) + '-' + String(Date.now()).slice(-4);
      var short = f.name.replace(/,? (GmbH|Ltd\.?|Limited|LLC|Inc\.?|S\.A\.|S\.L\.|BV|AS|AB|Pty Ltd|Pvt Ltd|S\.r\.l\.|Co\., Ltd\.)$/i, '');
      D().companies.push({ id: id, name: f.name, short: short, country: f.country, city: f.city, sector: f.sector, target: f.target, applied: TODAY, stage: 'uploading', since: TODAY, owner: null,
        capabilities: [], refs: 0, raising: !!f.raising, contact: f.contact, email: f.email, founded: null, uploads: { have: [] }, isNew: true });
      log('company', 'Registered', id, f.country + ' \u00b7 ' + (f.target || []).join(', '), 'change');
      return commit() || id;
    },

    /* opportunities */
    shortlist: function (oid, ids) {
      var o = opp(oid);
      o.picks = { by: me(), at: TODAY, ids: ids }; o.approvals = {}; o.stage = 'approve';
      log(me(), o.kind === 'request' ? 'Confirmed the request' : 'Picked ' + ids.length + ' match' + (ids.length === 1 ? '' : 'es'), oid, 'Key 1', 'sign');
      return commit('Sent for a second officer’s approval');
    },
    approveMatch: function (oid, cid, v) { var o = opp(oid); o.approvals = o.approvals || {}; o.approvals[cid] = v; return commit(); },
    release: function (oid) {
      var o = opp(oid);
      if (o.picks && o.picks.by === me()) return 'A different officer has to release it';
      var ids = o.picks.ids.filter(function (id) { return o.approvals[id] === 'approve'; });
      ids.forEach(function (id) { o.intros.push({ company: id, status: 'released', at: TODAY }); });
      o.stage = ids.length ? 'introduced' : 'match'; o.released = { by: me(), at: TODAY };
      log(me(), 'Released introduction', oid, ids.map(function (id) { return company(id).short; }).join(', ') || 'None approved', 'sign');
      return commit(ids.length ? 'Released to ' + (party(o.from) || {}).name : 'Nothing approved. Back to matching');
    },
    sendBack: function (oid) { var o = opp(oid); o.stage = 'match'; o.picks = null; o.approvals = {}; log(me(), 'Sent back for matching', oid, '', 'change'); return commit('Sent back for matching'); },
    outcome: function (oid, cid, status) {
      var o = opp(oid), it = o.intros.filter(function (x) { return x.company === cid; })[0];
      it.status = status; it.at = TODAY;
      if (status === 'won' || status === 'lost') { if (o.intros.every(function (x) { return x.status === 'won' || x.status === 'lost' || x.status === 'declined'; })) o.stage = 'closed'; }
      log(me(), 'Logged the outcome', oid, company(cid).short + ' · ' + status, 'change');
      return commit('Outcome logged');
    },

    /* buyers */
    postNeed: function (f) {
      var n = D().opps.length + 1, id = (f.kind === 'tender' ? 't' : 'n') + n + '-' + String(Date.now()).slice(-4);
      var o = { id: id, kind: f.kind, title: f.title, from: f.from, country: f.country, sector: f.sector, capability: f.capabilities[0], capabilities: f.capabilities,
        value: f.value || '[value]', posted: TODAY, closes: f.closes, stage: 'match', source: 'Posted', brief: f.brief || '', intros: [] };
      if (f.kind === 'tender') { o.ref = f.ref; o.dates = { questions: f.questions, bids: f.closes, opening: f.opening }; }
      D().opps.push(o);
      log('buyer', f.kind === 'tender' ? 'Posted a tender' : 'Posted a need', id, f.title, 'change');
      commit(); return id;
    },
    askIntro: function (bid, cid, nid, note) {
      var c = company(cid), nd = nid ? opp(nid) : null, id = 'r' + (D().opps.length + 1) + '-' + String(Date.now()).slice(-4);
      D().opps.push({ id: id, kind: 'request', title: nd ? nd.title : 'Meet ' + c.short, from: bid, company: cid, need: nid || null, country: nd ? nd.country : (party(bid) || {}).country,
        sector: c.sector, value: nd ? nd.value : '', posted: TODAY, closes: nd ? nd.closes : date.add(TODAY, 30), stage: 'match', source: 'Directory',
        brief: 'Found ' + c.short + ' in the directory and asked to meet them.' + (note ? ' Note: ' + note : ''), intros: [] });
      log('buyer', 'Asked for an introduction', id, c.short + ' · from the directory', 'change');
      return commit('Sent to SBC. Two officers will review it');
    },
    buyerOutcome: function (oid, cid, status) {
      var o = opp(oid), it = o.intros.filter(function (x) { return x.company === cid; })[0];
      it.status = status; it.at = TODAY;
      if (o.intros.every(function (x) { return x.status === 'won' || x.status === 'lost' || x.status === 'declined'; })) o.stage = 'closed';
      log('buyer', status === 'won' ? 'Chose a company' : 'Passed on a company', oid, company(cid).short, 'change');
      return commit(status === 'won' ? 'Recorded. SBC will tell ' + company(cid).short : 'Recorded. SBC will let them know');
    },
    closeNeed: function (oid) { var o = opp(oid); o.stage = 'closed'; o.closedAt = TODAY; log('buyer', 'Closed a need', oid, o.title, 'change'); return commit('Closed'); },

    addAgent: function (a) {
      a.id = 'a' + (D().agents.length + 1); a.referrals = 0; a.status = 'review'; a.licenceTo = a.licenceTo || null;
      D().agents.push(a);
      log(me(), 'Added an agent', '', a.name, 'change');
      return commit(a.name + ' added for review');
    },
    approveAgent: function (id) { var a = agent(id); a.status = 'active'; log(me(), 'Approved an agent', '', a.name, 'sign'); return commit(a.name + ' is on the panel'); }
  };

  function label(o) { return { qualified: 'SBC-Qualified', conditional: 'Conditionally Qualified', notyet: 'Not yet' }[o] || o; }

  window.SBC = {
    get data() { return state.data; },
    get session() { return state.session; },
    subscribe: function (f) { listeners.push(f); },
    act: act, date: date, label: label,
    company: company, opp: opp, party: party, agent: agent, officerName: officerName, me: me, other: other,
    CHECKS: CHECKS, RULES: RULES, MATCH_RULES: MATCH_RULES,
    evaluate: evaluate, answers: answers, checkStatus: checkStatus, progress: progress, requested: requested, proposal: proposal, inScope: inScope,
    match: match, markCurrent: markCurrent, presence: presence, presenceText: presenceText, EVIDENCE: EVIDENCE, uploads: uploads
  };
})();
