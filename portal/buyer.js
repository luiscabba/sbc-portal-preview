/* SBC buyer portal. Directory of SBC-Qualified companies, introductions, needs and tenders, and a mark check, all on SBC.data. */
(function () {
  var S = SBC, E = SBCDocs.esc, D = S.date, root = document.getElementById('root');
  var GULF = ['UAE', 'KSA', 'Qatar', 'Bahrain', 'Oman', 'Kuwait'];
  var ui = { toast: null, dialog: null, last: '', f: null, fFor: null, post: null, ask: {}, pick: null, vq: '', vres: null };

  var I = {
    dir: '<svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10"/></svg>',
    needs: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    intros: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg>',
    post: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    verify: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M9 12l2 2 4-4"/></svg>',
    brand: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 21 7v10l-9 5-9-5V7z" fill="#0E7C86"/><path d="M12 12 21 7M12 12v10M12 12 3 7" stroke="#FFFFFF" stroke-width="1.2" fill="none"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    sector: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
    gulf: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    refs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/></svg>',
    tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    cube: '<span class="cube" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 21 7 12 12 3 7z" fill="#3A4366"/><path d="M3 7 12 12v10L3 17z" fill="#151926"/><path d="M21 7 12 12v10l9-5z" fill="#2BB3BE"/></svg></span>'
  };

  function route() { var h = (location.hash || '#dir').slice(1).split('/'); return { name: h[0] || 'dir', id: h[1] || '' }; }
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
  function badge(t, cls) { return '<span class="badge ' + (cls || '') + '">' + E(t) + '</span>'; }
  function me() { return S.party(S.session.buyer) || S.party('b-adwu'); }
  function toast(msg, cube) { if (!msg) return; ui.toast = { msg: msg, cube: cube, at: Date.now() }; render(); var at = ui.toast.at; setTimeout(function () { if (ui.toast && ui.toast.at === at) { ui.toast = null; render(); } }, 2800); }
  function capName(k) { return SBC_SEED.capabilities[k] || k; }
  function secName(k) { return SBC_SEED.sectors[k] || k; }
  function dir() { return S.data.companies.filter(S.markCurrent); }
  function mine() { var b = me(); return S.data.opps.filter(function (o) { return o.from === b.id && o.kind !== 'mandate'; }); }
  function myNeeds() { return mine().filter(function (o) { return o.kind !== 'request' || !o.need; }); }
  function reqFor(nid) { return mine().filter(function (o) { return o.kind === 'request' && o.need === nid; }); }
  function deadline(o) { return o.kind === 'tender' && o.dates ? o.dates.bids : o.closes; }
  function gulfLine(c) {
    return (c.target || []).map(function (k) { var l = S.presence(c, k); return l ? k + ' ' + (l.entity ? 'entity' : l.agent ? 'agent' : 'ICV') : ''; }).filter(Boolean).join(', ') || 'No Gulf presence yet';
  }
  /* what the buyer is allowed to know about a company: only intros the company accepted, or a request the buyer made by name */
  function relation(c) {
    var out = null;
    mine().forEach(function (o) {
      (o.intros || []).forEach(function (x) {
        if (x.company !== c.id || x.status === 'released' || x.status === 'declined') return;
        out = { o: o, x: x, kind: x.status };
      });
      if (!out && o.kind === 'request' && o.company === c.id && o.stage !== 'closed' && !(o.intros || []).length) out = { o: o, kind: 'asked' };
    });
    return out;
  }
  function relText(r) {
    if (!r) return '';
    return { asked: ['You asked SBC', 'Two officers review the request before ' + 'the company hears of it.'], meeting: ['Introduced to you', 'For ' + r.o.title + '. SBC is arranging the first meeting.'], won: ['You chose them', 'For ' + r.o.title + '.'], lost: ['You passed', 'On ' + r.o.title + '.'] }[r.kind] || ['', ''];
  }
  function checksFor(c) {
    var at = c.decided || (c.mark && c.mark.issued), l = (c.licences || [])[0], own = (c.owners || []).filter(function (o) { return o.kind === 'person'; });
    var gr = (c.target || []).map(function (k) { var p = S.presence(c, k); return p ? k + ': ' + S.presenceText(p) : ''; }).filter(Boolean).join('. ');
    return [
      { n: 'Identity', d: at, t: (c.reg ? c.reg.registry : 'Company register') + '. Name, status and directors match.' },
      { n: 'Ownership', d: at, t: own.length + ' owner' + (own.length === 1 ? '' : 's') + ', every one on an official record.' },
      { n: 'Licences', d: at, t: l ? l.name + ', valid to ' + D.month(l.expires) + '. Holder matches.' : 'Sector licences checked.' },
      { n: 'Screening', d: c.mark ? c.mark.lastScreen : at, t: 'Company and owners against sanctions lists. Clear.' },
      { n: 'Gulf readiness', d: at, t: (gr || 'Local presence checked') + '.' }
    ];
  }
  function myCaps() { var a = []; myNeeds().forEach(function (o) { if (o.stage !== 'closed') (o.capabilities || [o.capability]).forEach(function (k) { if (k && a.indexOf(k) < 0) a.push(k); }); }); return a; }

  /* ---------- shell ---------- */
  function shell(active, crumb, body) {
    var b = me(), open = myNeeds().filter(function (o) { return o.stage !== 'closed'; }).length;
    var meet = 0; mine().forEach(function (o) { (o.intros || []).forEach(function (x) { if (x.status === 'meeting') meet++; }); });
    var nav = [['dir', 'Directory', I.dir, ''], ['needs', 'Your needs', I.needs, open || ''], ['intros', 'Introductions', I.intros, meet || ''], ['post', 'Post a need', I.post, ''], ['verify', 'Check a mark', I.verify, '']];
    var opts = S.data.buyers.map(function (x) { return '<option value="' + x.id + '"' + (x.id === b.id ? ' selected' : '') + '>' + E(x.name) + '</option>'; }).join('');
    return '<div class="app"><aside class="side" aria-label="Buyer portal">' +
      '<div class="ws">' + I.brand + 'SBC Capital<small>Buyer portal</small></div>' +
      '<div class="acct"><b>' + E(b.name) + '</b><span>' + E(b.type) + ' buyer · ' + E(b.city) + '</span></div>' +
      '<nav class="nav" aria-label="Buyer portal">' + nav.map(function (n) { return '<a href="#' + n[0] + '" class="' + (active === n[0] ? 'on' : '') + '">' + n[2] + n[1] + (n[3] ? '<span class="ct">' + n[3] + '</span>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="me"><label class="demo-sw" for="acct">Demo account<select id="acct" data-ch="acct">' + opts + '</select></label>' +
      '<button class="side-btn" data-a="reset">' + I.reset + 'Reset demo data</button></div></aside>' +
      '<main class="main"><div class="top">' + crumb + '</div><div class="page">' + body + '</div></main></div>';
  }

  /* ---------- directory ---------- */
  function filters() {
    var b = me();
    if (!ui.f || ui.fFor !== b.id) { ui.f = { q: '', sort: 'new', gulf: GULF.indexOf(b.country) >= 0 ? [b.country] : [], sector: [], ptype: [], other: [] }; ui.fFor = b.id; }
    return ui.f;
  }
  var TEST = {
    gulf: function (c, v) { return !!S.presence(c, v); },
    sector: function (c, v) { return c.sector === v; },
    ptype: function (c, v) { return Object.keys(c.local || {}).some(function (k) { var l = c.local[k] || {}; return v === 'entity' ? !!l.entity : !!l.agent; }); },
    other: function (c, v) { return v === 'raising' ? !!c.raising : D.days(c.mark.issued, D.today) <= 90; }
  };
  var GROUPS = [['gulf', 'Gulf presence'], ['sector', 'Sector'], ['ptype', 'Presence type'], ['other', 'Other']];
  var VAL = { ptype: { entity: 'Local entity', agent: 'Local agent' }, other: { raising: 'Open to investment', fresh: 'Mark under 3 months' } };
  function valName(g, v) { return g === 'sector' ? secName(v) : VAL[g] ? VAL[g][v] : v; }
  function apply(list, f, skip) {
    var q = f.q.trim().toLowerCase();
    return list.filter(function (c) {
      if (q) {
        var hay = [c.name, c.city, c.country, secName(c.sector)].concat((c.capabilities || []).map(capName)).join(' ').toLowerCase();
        if (q.split(/\s+/).some(function (w) { return hay.indexOf(w) < 0; })) return false;
      }
      return GROUPS.every(function (g) { var sel = f[g[0]]; return g[0] === skip || !sel.length || sel.some(function (v) { return TEST[g[0]](c, v); }); });
    });
  }
  function vDir() {
    var f = filters(), all = dir(), list = apply(all, f), want = myCaps();
    list.sort(function (a, b) { return f.sort === 'name' ? a.name.localeCompare(b.name) : f.sort === 'refs' ? b.refs - a.refs : (a.mark.issued < b.mark.issued ? 1 : -1); });
    var opts = {
      gulf: GULF, sector: Object.keys(SBC_SEED.sectors), ptype: ['entity', 'agent'], other: ['raising', 'fresh']
    };
    var rail = '<aside class="rail" aria-label="Filters">' + GROUPS.map(function (g) {
      var base = apply(all, f, g[0]);
      return '<fieldset><legend>' + g[1] + '</legend>' + opts[g[0]].map(function (v) {
        var n = base.filter(function (c) { return TEST[g[0]](c, v); }).length, on = f[g[0]].indexOf(v) >= 0, id = 'f-' + g[0] + '-' + v;
        return '<label class="' + (n || on ? '' : 'zero') + '" for="' + id + '"><input type="checkbox" id="' + id + '" data-ch="facet" data-g="' + g[0] + '" data-v="' + v + '"' + (on ? ' checked' : '') + '>' + E(valName(g[0], v)) + '<span class="c">' + n + '</span></label>';
      }).join('') + '</fieldset>';
    }).join('') + '</aside>';
    var chips = []; GROUPS.forEach(function (g) { f[g[0]].forEach(function (v) { chips.push('<span class="fchip"><span class="k">' + g[1] + ':</span>&nbsp;' + E(valName(g[0], v)) + '<button data-a="unf" data-g="' + g[0] + '" data-v="' + v + '" aria-label="Remove ' + E(valName(g[0], v)) + '">×</button></span>'); }); });
    if (f.q.trim()) chips.unshift('<span class="fchip"><span class="k">Search:</span>&nbsp;' + E(f.q.trim()) + '<button data-a="unq" aria-label="Clear search">×</button></span>');
    var cards = list.map(function (c) {
      var r = relation(c), rt = relText(r);
      var caps = (c.capabilities || []).map(function (k) { return '<span class="cap' + (want.indexOf(k) >= 0 ? ' fit' : '') + '"' + (want.indexOf(k) >= 0 ? ' title="Fits one of your open needs"' : '') + '>' + E(capName(k)) + '</span>'; }).join('');
      var five = '<div class="five">' + S.CHECKS.map(function (ch) { return '<span>' + I.tick + E(ch.name) + '</span>'; }).join('') + '</div>';
      var right = r ? '<span class="asked">' + I.shield.replace('<svg', '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"') + E(rt[0]) + '</span><small>' + E(rt[1]) + '</small><span class="sp"></span>' + (r.kind === 'meeting' ? '<a class="btn sm pri" href="#intros/' + r.o.id + '">Open the pack</a>' : '') + '<a class="btn sm" href="#co/' + c.id + '">View profile</a>'
        : '<small>Mark since ' + D.month(c.mark.issued) + '<br>Screened ' + D.short(c.mark.lastScreen) + ', clear</small><span class="sp"></span><a class="btn pri" href="#co/' + c.id + '" data-a="askgo" data-v="' + c.id + '">Ask SBC to introduce</a><a class="btn sm" href="#co/' + c.id + '">View profile</a>';
      return '<article class="cocard"><div class="l"><div class="coname"><a href="#co/' + c.id + '"><b>' + E(c.name) + '</b></a><span class="qmark"><i></i>SBC-Qualified</span></div>' +
        '<div class="facts"><span>' + I.pin + E(c.city === c.country ? c.city : c.city + ', ' + c.country) + '</span><span>' + I.sector + E(secName(c.sector)) + '</span><span>' + I.gulf + E(gulfLine(c)) + '</span><span>' + I.refs + c.refs + ' Gulf-relevant reference' + (c.refs === 1 ? '' : 's') + '</span></div>' +
        '<div class="caps">' + caps + '</div>' + five + '</div><div class="r">' + right + '</div></article>';
    }).join('');
    if (!list.length) cards = '<section class="panel"><div class="empty" style="display:flex;flex-direction:column;gap:10px;align-items:center"><b style="color:var(--ink);font-weight:500">No SBC-Qualified company matches these filters.</b><span>Remove a filter, or post a need and SBC will look for you.</span><span style="display:flex;gap:8px"><button class="btn" data-a="clear">Clear filters</button><a class="btn pri" href="#post">Post a need</a></span></div></section>';
    return shell('dir', '<b>Directory</b>',
      '<div class="ttl"><h1>Directory</h1><span class="sub">SBC-Qualified companies you can ask to meet</span></div>' +
      '<div class="trust">' + I.shield + '<span>Every company here passed five written checks and was signed by two SBC officers. SBC sells no placement.</span><a href="#verify">Check a mark</a></div>' +
      '<div class="filt"><div class="search">' + I.search + '<input class="input" id="dq" data-in="q" value="' + E(f.q) + '" placeholder="Search companies, capabilities, countries" aria-label="Search the directory"></div>' +
      '<select class="input" id="dsort" data-ch="sort" aria-label="Sort" style="width:auto"><option value="new"' + (f.sort === 'new' ? ' selected' : '') + '>Newest mark first</option><option value="name"' + (f.sort === 'name' ? ' selected' : '') + '>Name A to Z</option><option value="refs"' + (f.sort === 'refs' ? ' selected' : '') + '>Most references</option></select></div>' +
      '<div class="fchips">' + chips.join('') + (chips.length ? '<button class="linkbtn" data-a="clear">Clear filters</button>' : '<span class="muted">No filters on</span>') + '<span class="rescount">' + list.length + ' of ' + all.length + ' companies</span></div>' +
      '<div class="dirwrap">' + rail + '<div class="cards">' + cards + '</div></div>');
  }

  /* ---------- profile ---------- */
  function vCo(id) {
    var c = S.company(id);
    if (!c || !S.markCurrent(c)) return shell('dir', '<a href="#dir">Directory</a><span>/</span><b>Not found</b>', '<section class="panel"><div class="empty">This company is not in the directory. Its mark may have been withdrawn. <a href="#dir">Back to the directory</a></div></section>');
    var r = relation(c), rt = relText(r), want = myCaps();
    var big = '<div class="five big">' + checksFor(c).map(function (x) { return '<span>' + E(x.n) + '<em>' + D.short(x.d) + '</em><small>' + E(x.t) + '</small></span>'; }).join('') + '</div>';
    var pres = (c.target || []).map(function (k) { var l = S.presence(c, k); return '<tr><td class="nm">' + k + '</td><td' + (l ? '' : ' class="sub"') + '>' + E(l ? S.presenceText(l) : 'Planned') + '</td><td class="r">' + (l ? badge('Reviewed', 'ok') : badge('Not yet')) + '</td></tr>'; }).join('');
    var left = '<div class="phead"><a class="muted" href="#dir" style="text-decoration:none">← Directory</a><div class="coname"><h1>' + E(c.name) + '</h1><span class="qmark lg"><i></i>SBC-Qualified</span></div>' +
      '<div class="facts"><span>' + I.pin + E(c.city === c.country ? c.city : c.city + ', ' + c.country) + '</span><span>' + I.sector + E(secName(c.sector)) + '</span><span>' + I.gulf + E(gulfLine(c)) + '</span><span>' + I.refs + c.refs + ' Gulf-relevant references</span><span class="mono muted">' + E(c.mark.id) + '</span></div>' +
      '<p>' + E(c.summary || (c.short + ' works in ' + secName(c.sector).toLowerCase() + ': ' + (c.capabilities || []).map(capName).join(', ').toLowerCase() + '.')) + '</p></div>' +
      '<section class="panel"><div class="ph">Five checks<span class="ct">Signed by two SBC officers, ' + D.long(c.decided || c.mark.issued) + '</span></div><div class="pb">' + big + '</div></section>' +
      '<div class="grid2" style="grid-template-columns:1fr 1fr"><section class="panel"><div class="ph">Capabilities</div><div class="pb caps">' + (c.capabilities || []).map(function (k) { return '<span class="cap' + (want.indexOf(k) >= 0 ? ' fit' : '') + '">' + E(capName(k)) + '</span>'; }).join('') + '</div>' +
      '<dl class="kvl" style="border-top:1px solid var(--line)"><dt>References</dt><dd>' + E((c.references || ['[Reference 1]', '[Reference 2]', '[Reference 3]']).join(' · ')) + '</dd><dt>Founded</dt><dd>' + (c.reg && c.reg.incorporated ? c.reg.incorporated.slice(0, 4) : '[year]') + '</dd></dl></section>' +
      '<section class="panel"><div class="ph">Gulf presence</div><table class="tbl ptbl"><tbody>' + pres + '</tbody></table></section></div>' +
      '<section class="panel"><div class="ph">Mark</div><dl class="kvl"><dt>Valid until</dt><dd>' + D.long(c.mark.validTo) + '</dd><dt>Last screening</dt><dd>' + D.long(c.mark.lastScreen) + ', clear. Runs every month.</dd><dt>Check it</dt><dd><a href="#verify/' + c.mark.id + '">Check ' + E(c.mark.id) + '</a></dd></dl></section>' +
      '<span class="muted">This is what SBC shows every buyer. The full file stays with SBC.</span>';
    var a = ui.ask[c.id] || (ui.ask[c.id] = { need: '', note: '' });
    var needs = myNeeds().filter(function (o) { return o.stage !== 'closed' && o.kind !== 'request'; });
    if (a.need === '' && needs.length) { var fit = needs.filter(function (o) { return (o.capabilities || [o.capability]).some(function (k) { return (c.capabilities || []).indexOf(k) >= 0; }); })[0]; a.need = fit ? fit.id : '__none'; }
    var side;
    if (r) {
      side = '<aside class="askp"><div class="hd"><b>' + E(rt[0]) + '</b><span class="sub">' + E(rt[1]) + '</span></div><div class="bd">' +
        (r.kind === 'asked' ? '<ol class="steps4"><li class="on">You asked</li><li class="on">SBC checks the fit</li><li>Two officers approve</li><li>' + E(c.short) + ' accepts, you get the pack and meet</li></ol><a class="btn wide" href="#needs/' + (r.o.need || r.o.id) + '">Follow it in your needs</a>'
          : r.kind === 'meeting' ? '<a class="btn pri wide lg" href="#intros/' + r.o.id + '">Open the pack</a>' : '<a class="btn wide" href="#intros/' + r.o.id + '">See the introduction</a>') + '</div></aside>';
    } else {
      side = '<aside class="askp"><div class="hd"><b>Ask SBC to introduce</b><span class="sub">SBC checks the fit, two officers approve, and the company accepts before you meet.</span></div><div class="bd">' +
        '<label class="fl" for="ask-need">For which need?<select class="input" id="ask-need" data-ch="askneed" data-v="' + c.id + '">' + needs.map(function (o) { return '<option value="' + o.id + '"' + (a.need === o.id ? ' selected' : '') + '>' + E(o.title) + ' · ' + (o.kind === 'tender' ? 'tender' : 'posted ' + D.short(o.posted)) + '</option>'; }).join('') + '<option value="__none"' + (a.need === '__none' ? ' selected' : '') + '>Not tied to a need yet</option></select></label>' +
        '<label class="fl" for="ask-note">Note for SBC, optional<textarea class="input" id="ask-note" data-in="asknote" data-v="' + c.id + '" placeholder="What you want to discuss">' + E(a.note) + '</textarea></label>' +
        '<ol class="steps4"><li class="on">You ask</li><li>SBC checks the fit against your need</li><li>Two officers approve</li><li>' + E(c.short) + ' accepts, you get the pack and meet</li></ol>' +
        '<button class="btn pri lg wide" data-a="ask" data-v="' + c.id + '">Send to SBC</button><span class="muted" style="font-size:11.5px">' + E(c.short) + ' sees your name and need only after two officers approve.</span></div></aside>';
    }
    return shell('dir', '<a href="#dir">Directory</a><span>/</span><b>' + E(c.short) + '</b>', '<div class="prof"><div class="stack">' + left + '</div>' + side + '</div>');
  }

  /* ---------- needs ---------- */
  function stageOf(o) {
    if (o.stage === 'closed') return ['Closed', ''];
    if (o.stage === 'approve') return [o.kind === 'request' ? 'Second officer approving' : 'Second officer approving', 'warn'];
    if (o.stage === 'introduced') { var m = (o.intros || []).some(function (x) { return x.status === 'meeting'; }); return m ? ['Ready to meet', 'ok'] : ['Waiting for companies', 'info']; }
    return [o.kind === 'request' ? 'Two officers reviewing' : 'Matching', 'info'];
  }
  function introsText(o) {
    var it = o.intros || [], t = [];
    var meet = it.filter(function (x) { return x.status === 'meeting'; }).length, wait = it.filter(function (x) { return x.status === 'released'; }).length, won = it.filter(function (x) { return x.status === 'won'; }).length;
    if (meet) t.push(meet + ' to meet'); if (wait) t.push('waiting for ' + wait); if (won) t.push(won + ' chosen');
    if (o.picks && o.stage === 'approve') t.push(o.picks.ids.length + ' picked');
    reqFor(o.id).forEach(function (r) { t.push('Asked for ' + S.company(r.company).short); });
    if (o.kind === 'request') t.push('Asked for ' + S.company(o.company).short);
    return t.join(' · ') || '—';
  }
  function leftCell(o) {
    if (o.stage === 'closed') return '<span class="left gone"><span class="rg"></span>Closed</span>';
    var n = D.days(D.today, deadline(o)), tot = Math.max(1, D.days(o.posted, deadline(o))), p = Math.max(0, Math.min(100, Math.round(100 * n / tot)));
    if (n < 0) return '<span class="left gone"><span class="rg"></span>Passed</span>';
    return '<span class="left' + (n < 14 ? ' soon' : '') + '"><span class="rg" style="--p:' + p + '"></span>' + (n === 0 ? 'Today' : n + ' day' + (n === 1 ? '' : 's')) + '</span>';
  }
  function vNeeds(id) {
    var list = myNeeds().sort(function (a, b) { if ((a.stage === 'closed') !== (b.stage === 'closed')) return a.stage === 'closed' ? 1 : -1; return deadline(a) < deadline(b) ? -1 : 1; });
    if (!list.length) return shell('needs', '<b>Your needs</b>', '<div class="ttl"><h1>Your needs and tenders</h1></div><section class="panel"><div class="empty">Nothing posted yet. <a href="#post">Post a need or tender</a> and SBC will match it.</div></section>');
    var sel = S.opp(id) && list.indexOf(S.opp(id)) >= 0 ? S.opp(id) : list[0];
    var rows = list.map(function (o) {
      var st = stageOf(o);
      return '<tr class="go" data-a="need" data-v="' + o.id + '"' + (o === sel ? ' style="background:var(--r-t)"' : '') + ' tabindex="0"><td>' + leftCell(o) + '</td><td class="nm">' + E(o.title) + '<div class="muted" style="font-weight:400;font-size:11.5px">' + (o.stage === 'closed' ? 'Closed ' + D.short(o.closedAt || o.closes) : (o.kind === 'tender' ? 'Bids ' : 'Closes ') + D.short(deadline(o))) + '</div></td>' +
        '<td><span class="kind' + (o.kind === 'tender' ? ' tender' : '') + '">' + (o.kind === 'tender' ? 'Tender' : o.kind === 'request' ? 'Request' : 'Need') + '</span></td><td>' + badge(st[0], st[1]) + '</td><td class="sub">' + E(introsText(o)) + '</td></tr>';
    }).join('');
    return shell('needs', '<b>Your needs</b>',
      '<div class="ttl"><h1>Your needs and tenders</h1><div class="acts"><a class="btn pri" href="#post">Post a need or tender</a></div></div>' +
      '<div class="grid2" style="grid-template-columns:minmax(0,1.45fr) minmax(0,1fr)"><section class="panel"><table class="tbl"><thead><tr><th>Time left</th><th>Title</th><th>Type</th><th>Stage</th><th>Introductions</th></tr></thead><tbody>' + rows + '</tbody></table></section>' + needDetail(sel) + '</div>');
  }
  function needDetail(o) {
    var isReq = o.kind === 'request', m = isReq ? null : S.match(o), it = o.intros || [];
    var acc = it.filter(function (x) { return x.status !== 'released' && x.status !== 'declined'; }).length, wait = it.filter(function (x) { return x.status === 'released'; }).length;
    var reqs = reqFor(o.id);
    var steps = [
      ['done', 'Posted', isReq ? 'From the directory' : 'By you', D.short(o.posted)],
      ['done', isReq ? 'You asked by name' : 'Rules matched', isReq ? S.company(o.company).name : (m.stages[0].pass.length + ' eligible, ' + m.ranked.length + ' ranked' + (reqs.length ? '. Plus ' + reqs.length + ' you asked for' : '')), D.short(o.posted)],
      [o.picks ? 'done' : o.stage === 'match' ? 'cur' : '', o.picks ? 'Officer 1 ' + (isReq ? 'confirmed it' : 'picked ' + o.picks.ids.length) : 'Officer 1 picks', o.picks ? 'Names stay with SBC until both officers sign' : 'An SBC officer reviews the ranked list', o.picks ? D.short(o.picks.at) : ''],
      [o.released ? 'done' : o.stage === 'approve' ? 'cur' : '', o.released ? 'Officer 2 approved' : 'Officer 2 approves', o.released ? 'A different officer signed the introductions' : 'A different officer checks the picks', o.released ? D.short(o.released.at) : o.stage === 'approve' ? 'Now' : ''],
      [o.released && !wait ? 'done' : o.released ? 'cur' : '', 'Companies accept', o.released ? acc + ' accepted' + (wait ? ', ' + wait + ' still deciding' : '') : 'Each one, before you see its pack', ''],
      [acc ? 'done' : '', 'Your introductions', acc ? 'Packs ready to open' : 'Packs, then meetings', '']
    ];
    if (o.stage === 'closed') steps.push(['done', 'Closed', it.some(function (x) { return x.status === 'won'; }) ? 'You chose ' + it.filter(function (x) { return x.status === 'won'; }).map(function (x) { return S.company(x.company).short; }).join(', ') : 'No company chosen', D.short(o.closedAt || o.closes)]);
    var tl = '<div class="tl2">' + steps.map(function (s) { return '<div class="stp ' + s[0] + '"><span class="dot2">' + (s[0] === 'done' ? I.tick : '') + '</span><span><b>' + E(s[1]) + '</b><span>' + E(s[2]) + '</span></span><span class="when">' + s[3] + '</span></div>'; }).join('') + '</div>';
    var dates = o.kind === 'tender' && o.dates ? '<div class="dates3"><div><span>Questions by</span><b>' + D.short(o.dates.questions) + '</b></div><div><span>Bids due</span><b>' + D.short(o.dates.bids) + '</b></div><div><span>Opening</span><b>' + D.short(o.dates.opening) + '</b></div></div>'
      : '<div class="dates3"><div><span>Posted</span><b>' + D.short(o.posted) + '</b></div><div><span>Closes</span><b>' + D.short(o.closes) + '</b></div><div><span>Time left</span><b>' + (o.stage === 'closed' ? 'Closed' : Math.max(0, D.days(D.today, o.closes)) + ' days') + '</b></div></div>';
    var caps = isReq ? secName(o.sector) : (o.capabilities || [o.capability]).map(capName).join(', ');
    return '<section class="panel"><div class="ndh"><div style="display:flex;gap:8px;align-items:center"><span class="kind' + (o.kind === 'tender' ? ' tender' : '') + '">' + (o.kind === 'tender' ? 'Tender' : isReq ? 'Request' : 'Need') + '</span><span class="mono muted">' + E(o.ref || o.id.toUpperCase()) + '</span></div><h2>' + E(o.title) + '</h2><span class="sub">' + E(caps) + ' · ' + E(o.country) + ' · ' + E(o.value || '') + '</span>' + (o.brief ? '<span style="color:var(--ink2)">' + E(o.brief) + '</span>' : '') + '</div>' + dates +
      '<div class="ph" style="border-top:1px solid var(--line)">Progress</div>' + tl +
      '<div class="pb" style="border-top:1px solid var(--line);display:flex;gap:8px">' + (acc ? '<a class="btn pri" href="#intros/' + o.id + '">Open the packs</a>' : '') + (o.stage !== 'closed' ? '<button class="btn" data-a="edit">Edit</button><button class="btn" data-a="close" data-v="' + o.id + '">Close ' + (o.kind === 'tender' ? 'tender' : 'need') + '</button>' : '') + '</div></section>';
  }

  /* ---------- post ---------- */
  function vPost() {
    var b = me(), f = ui.post || (ui.post = { kind: 'need', title: '', sector: 'water', caps: [], country: GULF.indexOf(b.country) >= 0 ? b.country : 'UAE', value: '', closes: D.add(D.today, 30), ref: '', questions: D.add(D.today, 14), opening: D.add(D.today, 33), brief: '', err: '' });
    var capsFor = Object.keys(SBC_SEED.capabilities);
    var draft = { kind: f.kind, sector: f.sector, capability: f.caps[0], capabilities: f.caps, country: f.country };
    var live = f.caps.length ? S.match(draft).ranked.length : null;
    var form = '<section class="panel"><div class="ph">What you need</div><div class="form2">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span class="seg2" role="group" aria-label="Type"><button data-a="kind" data-v="need" class="' + (f.kind === 'need' ? 'on' : '') + '" aria-pressed="' + (f.kind === 'need') + '">Need</button><button data-a="kind" data-v="tender" class="' + (f.kind === 'tender' ? 'on' : '') + '" aria-pressed="' + (f.kind === 'tender') + '">Tender</button></span><span class="sub">A tender has a reference and fixed dates. A need stays open until you close it.</span></div>' +
      '<label class="fl" for="p-title">Title<input class="input" id="p-title" data-in="title" value="' + E(f.title) + '" placeholder="' + (f.kind === 'tender' ? 'RO membrane replacement, Taweelah' : 'Desalination plant maintenance') + '"></label>' +
      '<div class="row2">' + (f.kind === 'tender' ? '<label class="fl" for="p-ref">Tender reference<input class="input mono" id="p-ref" data-in="ref" value="' + E(f.ref) + '" placeholder="ADWU-T-2026-115"></label>' : '<label class="fl" for="p-value">Value<input class="input" id="p-value" data-in="value" value="' + E(f.value) + '" placeholder="[AED value]"></label>') +
      '<label class="fl" for="p-sector">Sector<select class="input" id="p-sector" data-ch="psector">' + Object.keys(SBC_SEED.sectors).map(function (k) { return '<option value="' + k + '"' + (k === f.sector ? ' selected' : '') + '>' + E(secName(k)) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="fl" style="font-weight:500;flex-direction:row;gap:8px">Capabilities<span class="muted" style="font-weight:400">The rules match companies on these</span></div><div class="capick">' +
      capsFor.map(function (k) { var on = f.caps.indexOf(k) >= 0; return '<label class="' + (on ? 'on' : '') + '" for="pc-' + k + '"><input type="checkbox" id="pc-' + k + '" data-ch="pcap" data-v="' + k + '"' + (on ? ' checked' : '') + '>' + E(capName(k)) + '</label>'; }).join('') + '</div>' +
      '<div class="row2"><label class="fl" for="p-country">Where<select class="input" id="p-country" data-ch="pcountry">' + GULF.map(function (k) { return '<option' + (k === f.country ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>' +
      (f.kind === 'tender' ? '<label class="fl" for="p-value">Value<input class="input" id="p-value" data-in="value" value="' + E(f.value) + '" placeholder="[AED value]"></label>' : '<label class="fl" for="p-closes">Closes<input type="date" class="input mono" id="p-closes" data-in="closes" value="' + E(f.closes) + '"></label>') + '</div>' +
      (f.kind === 'tender' ? '<div class="row3"><label class="fl" for="p-q">Questions by<input type="date" class="input mono" id="p-q" data-in="questions" value="' + E(f.questions) + '"></label><label class="fl" for="p-closes">Bids due<input type="date" class="input mono" id="p-closes" data-in="closes" value="' + E(f.closes) + '"></label><label class="fl" for="p-open">Opening<input type="date" class="input mono" id="p-open" data-in="opening" value="' + E(f.opening) + '"></label></div>' : '') +
      '<label class="fl" for="p-brief">Scope<textarea class="input" id="p-brief" data-in="brief" placeholder="What the work is, where, and anything a company must already have">' + E(f.brief) + '</textarea></label>' +
      (f.err ? '<span class="ferr" role="alert">' + E(f.err) + '</span>' : '') +
      '<div style="display:flex;justify-content:flex-end;gap:8px"><a class="btn" href="#needs">Cancel</a><button class="btn pri lg" data-a="postit">' + (f.kind === 'tender' ? 'Post tender' : 'Post need') + '</button></div></div></section>';
    var side = '<div class="side-note"><section class="panel"><div class="ph">What happens next</div><div class="pb"><ol class="steps4"><li>The rules check every SBC-Qualified company: eligible, capable, ready, ranked</li><li>An SBC officer picks the shortlist</li><li>A second officer approves it</li><li>Each company accepts, then you get its pack</li></ol></div></section>' +
      '<section class="panel"><div class="ph">Who sees this</div><div class="pb sub">Only SBC officers. A company sees your ' + (f.kind === 'tender' ? 'tender' : 'need') + ' when SBC introduces it to you, never before.</div></section>' +
      '<section class="panel"><div class="ph">Right now<span class="ct">live count</span></div><div class="pb" style="display:flex;flex-direction:column;gap:4px">' + (live == null ? '<span class="sub">Pick a capability to see how many SBC-Qualified companies fit.</span>' : '<b style="font:500 22px \'Geist Mono\',monospace">' + live + '</b><span class="sub">SBC-Qualified compan' + (live === 1 ? 'y fits' : 'ies fit') + ' on sector, capability and presence in ' + E(f.country) + '.' + (live ? '' : ' SBC can still look further for you.') + '</span>') + '</div></section></div>';
    return shell('post', '<b>Post a need</b>', '<div class="ttl"><h1>Post a need or tender</h1></div><div class="postg">' + form + side + '</div>');
  }

  /* ---------- introductions ---------- */
  function vIntros(id) {
    var packs = [], all = [];
    mine().forEach(function (o) { (o.intros || []).forEach(function (x) { all.push({ o: o, x: x }); if (x.status !== 'released' && x.status !== 'declined') packs.push({ o: o, x: x }); }); });
    all.sort(function (a, b) { return a.x.at < b.x.at ? 1 : -1; });
    var active = packs.filter(function (p) { return p.x.status === 'meeting'; });
    var pool = id ? packs.filter(function (p) { return p.o.id === id; }) : active;
    if (!pool.length) pool = active.length ? active : packs;
    var cur = pool.filter(function (p) { return ui.pick && p.o.id + ':' + p.x.company === ui.pick; })[0] || pool[0];
    var body = '';
    if (cur) {
      var c = S.company(cur.x.company), m = S.match(cur.o).ranked.filter(function (r) { return r.c.id === c.id; })[0];
      var tabs = pool.length > 1 ? '<div class="pk-tabs" role="tablist">' + pool.map(function (p) { var k = p.o.id + ':' + p.x.company; return '<button role="tab" aria-selected="' + (p === cur) + '" class="' + (p === cur ? 'on' : '') + '" data-a="pick" data-v="' + k + '">' + E(S.company(p.x.company).short) + '</button>'; }).join('') + '</div>' : '';
      var st = { meeting: 'SBC is arranging the first meeting', won: 'You chose this company', lost: 'You passed on this company' }[cur.x.status];
      body += '<section class="night-hero" aria-label="Introduction pack"><div class="lat" aria-hidden="true"></div><div style="display:flex;flex-direction:column;gap:0">' + tabs +
        '<span class="eyebrow">Introduced by SBC Capital · ' + E(cur.o.title) + '</span><h1>' + E(c.name) + '</h1>' +
        '<p>' + E(m ? m.why : 'Asked for by name in the directory') + '. ' + E(st) + '.</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (cur.x.status === 'meeting' ? '<button class="btn pri lg" data-a="choose" data-o="' + cur.o.id + '" data-v="' + c.id + '">Choose this company</button><button class="btn lg" data-a="pass" data-o="' + cur.o.id + '" data-v="' + c.id + '">Pass</button>' : '') + '<button class="btn lg" data-a="pack">Download pack</button><a class="btn lg" href="#co/' + c.id + '">Full profile</a></div></div>' +
        '<div class="pk-checks">' + checksFor(c).map(function (x) { return '<div><span class="ok2">' + I.tick + '</span><b>' + E(x.n) + '</b><span class="mono">' + D.short(x.d) + '</span></div>'; }).join('') + '<div class="pk-mark"><span class="qmark"><i></i>SBC-Qualified</span><span class="mono">' + E(c.mark ? c.mark.id : '') + '</span></div></div></section>';
    } else {
      body += '<section class="panel"><div class="empty">No packs to open yet. A pack appears here once two officers approve an introduction and the company accepts it.</div></section>';
    }
    body += '<section class="panel"><div class="ph">All introductions<span class="ct">' + all.length + '</span></div>' + (all.length ? '<table class="tbl"><thead><tr><th>Company</th><th>For</th><th>Status</th><th class="r">Updated</th></tr></thead><tbody>' + all.map(function (p) {
      var hidden = (p.x.status === 'released' || p.x.status === 'declined') && p.o.kind !== 'request';
      var b = { released: ['Waiting for the company to accept', 'info'], meeting: ['Meeting being arranged', 'ok'], won: ['Chosen', 'ok'], lost: ['Passed', ''], declined: ['Not available', ''] }[p.x.status] || [p.x.status, ''];
      return '<tr' + (hidden ? '' : ' class="go" data-a="pick" data-v="' + p.o.id + ':' + p.x.company + '"') + '><td class="nm">' + (hidden ? '<span class="muted" style="font-weight:400">Name shared once they accept</span>' : E(S.company(p.x.company).name)) + '</td><td class="sub">' + E(p.o.title) + '</td><td>' + badge(b[0], b[1]) + '</td><td class="mono muted r">' + D.short(p.x.at) + '</td></tr>';
    }).join('') + '</tbody></table>' : '<div class="empty">No introductions yet. Post a need, or ask SBC to introduce a company from the directory.</div>') + '</section>';
    return shell('intros', '<b>Introductions</b>', body);
  }

  /* ---------- check a mark ---------- */
  function lookup(q) {
    q = (q || '').trim(); if (!q) return null;
    var k = q.toLowerCase(), c = S.data.companies.filter(function (x) { return x.mark && (x.mark.id.toLowerCase() === k || x.name.toLowerCase() === k || x.short.toLowerCase() === k); })[0];
    if (!c) c = S.data.companies.filter(function (x) { return x.mark && k.length > 3 && x.name.toLowerCase().indexOf(k) >= 0; })[0];
    return { q: q, c: c || null };
  }
  function vVerify(id) {
    if (id && ui.vq !== id && !ui.vres) { ui.vq = id; ui.vres = lookup(id); }
    var r = ui.vres, res = '';
    if (r) {
      var c = r.c;
      if (!c) res = '<div class="vres bad" role="status"><h2>No SBC mark found for “' + E(r.q) + '”</h2><span>Check the number on the certificate, or ask the company for its verify link. Do not rely on a mark you cannot find here.</span></div>';
      else if (c.mark.withdrawn) res = '<div class="vres bad" role="status"><h2>Withdrawn</h2><span>' + E(c.name) + '’s mark ' + E(c.mark.id) + ' was withdrawn on ' + D.long(c.mark.withdrawn) + '. Do not rely on it.</span></div>';
      else if (!S.markCurrent(c)) res = '<div class="vres bad" role="status"><h2>Not current</h2><span>' + E(c.name) + '’s mark ' + E(c.mark.id) + ' is not current. It may be under re-check.</span></div>';
      else res = '<div class="vres ok2" role="status"><span class="qmark lg" style="width:fit-content"><i></i>SBC-Qualified</span><h2>' + E(c.name) + ' is SBC-Qualified</h2><dl class="kvl" style="padding:0;grid-template-columns:130px 1fr"><dt>Mark</dt><dd class="mono">' + E(c.mark.id) + '</dd><dt>Issued</dt><dd>' + D.long(c.mark.issued) + '</dd><dt>Valid until</dt><dd>' + D.long(c.mark.validTo) + '</dd><dt>Last screening</dt><dd>' + D.long(c.mark.lastScreen) + ', clear</dd><dt>Five checks</dt><dd>All passed, signed by two officers</dd></dl><span><a class="btn sm" href="#co/' + c.id + '">Open in the directory</a></span></div>';
    }
    var samples = ['SBC-Q-2026-0004', 'SBC-Q-2026-0008', 'SBC-Q-2025-0117'];
    return shell('verify', '<b>Check a mark</b>', '<div class="ttl"><h1>Check a mark</h1><span class="sub">Anyone can check that an SBC mark is current. The same page sits behind every verify link.</span></div>' +
      '<div class="vbox"><div class="stack"><section class="panel"><div class="pb" style="display:flex;flex-direction:column;gap:10px"><label class="fl" for="vq">Mark number or company name<span style="display:flex;gap:8px"><input class="input mono" id="vq" data-in="vq" value="' + E(ui.vq) + '" placeholder="SBC-Q-2026-0004" style="flex:1"><button class="btn pri" data-a="vcheck">Check</button></span></label>' +
      '<span class="sub" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">Try:' + samples.map(function (s) { return '<button class="btn sm mono" data-a="vtry" data-v="' + s + '">' + s + '</button>'; }).join('') + '</span></div></section>' + res + '</div>' +
      '<section class="panel"><div class="ph">What a current mark means</div><div class="pb sub" style="display:flex;flex-direction:column;gap:8px"><span>The company passed five written checks: identity, ownership, licences, screening and Gulf readiness.</span><span>Two different SBC officers signed it.</span><span>Screening runs again every month. A mark lasts a year, then the full check runs again.</span></div></section></div>');
  }

  /* ---------- render ---------- */
  function render() {
    var r = route(), act = document.activeElement, fid = act && act.id, s0 = act && act.selectionStart, s1 = act && act.selectionEnd, sy = window.scrollY;
    var html = r.name === 'co' ? vCo(r.id) : r.name === 'needs' ? vNeeds(r.id) : r.name === 'post' ? vPost() : r.name === 'intros' ? vIntros(r.id) : r.name === 'verify' ? vVerify(r.id) : vDir();
    if (ui.toast) html += '<div class="toast" role="status">' + (ui.toast.cube ? I.cube : '') + E(ui.toast.msg) + '</div>';
    if (ui.dialog) html += '<div class="scrim" data-a="dclose"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">' + E(ui.dialog.title) + '</h2><p class="sub" style="margin:0">' + E(ui.dialog.body) + '</p><div class="row"><button class="btn" data-a="dclose">Cancel</button><button class="btn pri" data-a="dok">' + E(ui.dialog.ok) + '</button></div></div></div>';
    html += '<a class="back" href="/">' + I.chev + 'Portal preview</a>';
    var changed = ui.last !== location.hash;
    root.innerHTML = html;
    var pg = root.querySelector('.page'); if (pg && changed) pg.classList.add('enter');
    if (changed) { ui.last = location.hash; window.scrollTo(0, 0); } else window.scrollTo(0, sy);
    if (fid) { var el = document.getElementById(fid); if (el) { el.focus(); try { if (s0 != null) el.setSelectionRange(s0, s1); } catch (e) {} } }
    if (ui.focus) { var fe = document.getElementById(ui.focus); ui.focus = null; if (fe) fe.focus(); }
    document.title = ((root.querySelector('h1') || {}).textContent || 'Buyer portal') + ' · SBC buyer portal';
  }

  var A = {
    unf: function (el) { var a = ui.f[el.dataset.g], i = a.indexOf(el.dataset.v); if (i >= 0) a.splice(i, 1); render(); },
    unq: function () { ui.f.q = ''; render(); },
    clear: function () { ui.f.q = ''; GROUPS.forEach(function (g) { ui.f[g[0]] = []; }); render(); },
    askgo: function (el, ev) { ui.focus = 'ask-need'; },
    ask: function (el) {
      var c = S.company(el.dataset.v), a = ui.ask[c.id] || {}, nid = a.need && a.need !== '__none' ? a.need : null;
      ui.dialog = { title: 'Ask SBC to introduce ' + c.short + '?', body: 'SBC checks the fit' + (nid ? ' against ' + S.opp(nid).title : '') + '. Two officers approve before ' + c.short + ' hears of you.', ok: 'Send to SBC', fn: function () { var m = S.act.askIntro(me().id, c.id, nid, (a.note || '').trim()); ui.ask[c.id] = null; toast(m, true); } };
      render();
    },
    need: function (el) { go('needs/' + el.dataset.v); },
    edit: function () { toast('Editing a posted need is not part of the preview'); },
    close: function (el) { var o = S.opp(el.dataset.v); ui.dialog = { title: 'Close ' + o.title + '?', body: 'SBC stops matching it. Introductions already made stay open.', ok: 'Close it', fn: function () { toast(S.act.closeNeed(o.id)); } }; render(); },
    kind: function (el) { ui.post.kind = el.dataset.v; ui.post.err = ''; render(); },
    postit: function () {
      var f = ui.post; f.err = '';
      if (f.title.trim().length < 3) f.err = 'Give it a title, like the name you use internally.';
      else if (!f.caps.length) f.err = 'Pick at least one capability. The rules match companies on these.';
      else if (f.kind === 'tender' && !f.ref.trim()) f.err = 'Add the tender reference from your notice.';
      else if (!f.closes || f.closes <= D.today) f.err = (f.kind === 'tender' ? 'Bids are due' : 'The closing date is') + ' in the past. Pick a later date.';
      else if (f.kind === 'tender' && !(f.questions <= f.closes && f.closes <= f.opening)) f.err = 'Dates are out of order. Questions come before bids, and bids before opening.';
      if (f.err) { render(); return; }
      var id = S.act.postNeed({ kind: f.kind, title: f.title.trim(), from: me().id, sector: f.sector, capabilities: f.caps.slice(), country: f.country, value: f.value.trim(), closes: f.closes, ref: f.ref.trim(), questions: f.questions, opening: f.opening, brief: f.brief.trim() });
      ui.post = null; go('needs/' + id); toast((f.kind === 'tender' ? 'Tender' : 'Need') + ' posted. The rules have matched it', true);
    },
    pick: function (el) { ui.pick = el.dataset.v; var o = el.dataset.v.split(':')[0]; if (route().name === 'intros' && route().id && route().id !== o) go('intros/' + o); else render(); },
    choose: function (el) { var c = S.company(el.dataset.v), o = el.dataset.o; ui.dialog = { title: 'Choose ' + c.short + '?', body: 'SBC records your choice and tells ' + c.short + '. Other introductions for ' + S.opp(o).title + ' stay open until you pass on them.', ok: 'Choose ' + c.short, fn: function () { toast(S.act.buyerOutcome(o, c.id, 'won'), true); } }; render(); },
    pass: function (el) { toast(S.act.buyerOutcome(el.dataset.o, el.dataset.v, 'lost')); },
    pack: function () { toast('The pack download is not part of the preview'); },
    vcheck: function () { ui.vres = lookup(ui.vq); render(); },
    vtry: function (el) { ui.vq = el.dataset.v; ui.vres = lookup(ui.vq); render(); },
    reset: function () { ui.dialog = { title: 'Reset the demo data?', body: 'Every change made in this browser goes back to the starting data.', ok: 'Reset', fn: function () { ui.f = null; ui.post = null; ui.ask = {}; ui.pick = null; toast(S.act.reset()); go('dir'); } }; render(); },
    dclose: function () { ui.dialog = null; render(); },
    dok: function () { var fn = ui.dialog.fn; ui.dialog = null; fn(); render(); }
  };
  root.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-a]'); if (!el || !root.contains(el) || el.disabled) return;
    var a = el.dataset.a; if (!A[a]) return;
    if (a === 'dclose' && el.classList.contains('scrim') && ev.target !== el) return;
    if (el.tagName === 'A' && a === 'askgo') { A[a](el, ev); return; }
    ev.preventDefault(); ev.stopPropagation(); A[a](el, ev);
  });
  root.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && ui.dialog) { ui.dialog = null; render(); return; }
    if (ev.key === 'Enter' && ev.target.id === 'vq') { ui.vres = lookup(ui.vq); render(); return; }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('tr[data-a]')) { ev.preventDefault(); A[ev.target.dataset.a](ev.target); }
  });
  root.addEventListener('input', function (ev) {
    var el = ev.target, k = el.dataset.in; if (!k) return;
    if (k === 'q') { ui.f.q = el.value; render(); return; }
    if (k === 'asknote') { (ui.ask[el.dataset.v] = ui.ask[el.dataset.v] || { need: '', note: '' }).note = el.value; return; }
    if (k === 'vq') { ui.vq = el.value; return; }
    if (ui.post) { ui.post[k] = el.value; if (ui.post.err) { ui.post.err = ''; render(); } }
  });
  root.addEventListener('change', function (ev) {
    var el = ev.target, k = el.dataset.ch; if (!k) return;
    if (k === 'acct') { S.act.setBuyer(el.value); ui.f = null; ui.post = null; ui.ask = {}; ui.pick = null; toast('Viewing as ' + me().name); go('dir'); return; }
    if (k === 'facet') { var a = ui.f[el.dataset.g], i = a.indexOf(el.dataset.v); if (el.checked && i < 0) a.push(el.dataset.v); if (!el.checked && i >= 0) a.splice(i, 1); ui.focus = el.id; render(); return; }
    if (k === 'sort') { ui.f.sort = el.value; render(); return; }
    if (k === 'askneed') { (ui.ask[el.dataset.v] = ui.ask[el.dataset.v] || { need: '', note: '' }).need = el.value; return; }
    if (k === 'psector') { ui.post.sector = el.value; render(); return; }
    if (k === 'pcountry') { ui.post.country = el.value; render(); return; }
    if (k === 'pcap') { var c = ui.post.caps, j = c.indexOf(el.dataset.v); if (el.checked && j < 0) c.push(el.dataset.v); if (!el.checked && j >= 0) c.splice(j, 1); ui.post.err = ''; ui.focus = el.id; render(); return; }
  });
  window.addEventListener('hashchange', function () { var r = route(); if (r.name === 'verify' && r.id && r.id !== ui.vq) { ui.vq = r.id; ui.vres = lookup(r.id); } render(); });
  S.subscribe(render);
  render();
})();
