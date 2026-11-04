/* Document papers for the viewer. Built from each company's data, so every company has real-looking evidence.
   hl: keys to highlight for the condition in focus; pin: the condition's number shown on the highlight. */
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };

  function list(c) {
    if (!c.reg) return [];
    var out = [{ key: 'register', file: 'Register extract · ' + c.reg.number + '.pdf', kind: 'Official' }];
    var off = (c.owners || []).some(function (o) { return o.src === 'official'; });
    var made = (c.owners || []).some(function (o) { return o.src !== 'official'; });
    if (off) out.push({ key: 'owners', file: 'Shareholder register · certified.pdf', kind: 'Official' });
    if (made) out.push({ key: 'chart', file: 'Group structure (' + c.short + ').pdf', kind: 'Company-made' });
    (c.licences || []).forEach(function (l, i) { out.push({ key: 'licence:' + i, file: l.name + ' certificate.pdf', kind: 'Official' }); });
    out.push({ key: 'screening', file: 'Screening report · ' + SBC.date.long(c.screening.run) + '.pdf', kind: 'SBC run' });
    (c.target || []).forEach(function (k) {
      var l = SBC.presence(c, k);
      out.push({ key: 'local:' + k, file: l ? 'Gulf readiness evidence · ' + k + '.pdf' : 'Gulf readiness evidence · ' + k, kind: l ? 'Official' : 'Missing' });
    });
    return out;
  }
  function meta(c, key) { return list(c).filter(function (d) { return d.key === key; })[0] || { key: key, file: key, kind: '' }; }

  function render(c, key, hl, pin) {
    hl = hl || [];
    var H = function (k, text, warn) {
      var on = hl.indexOf(k) >= 0;
      return '<span class="hl' + (on ? ' on' : '') + (warn ? ' w' : '') + '">' + (on && pin ? '<span class="pin' + (warn ? ' w' : '') + '">' + pin + '</span>' : '') + text + '</span>';
    };
    var r = c.reg, D = SBC.date;
    if (key === 'register') {
      return '<div class="paper">' +
        '<div class="p-head"><b>' + esc(r.registry) + '</b><span>Extract printed ' + D.long(c.since || D.today) + '</span></div>' +
        (r.lang ? '<div class="p-note">Original in ' + esc(r.lang) + '. Shown in English.</div>' : '') +
        '<dl class="kv">' +
        '<dt>Company name</dt><dd>' + H('name', esc(r.name)) + '</dd>' +
        '<dt>Number</dt><dd>' + esc(r.number) + '</dd>' +
        '<dt>Status</dt><dd>' + H('status', esc(r.status) + (r.insolvency ? ' · insolvency noted' : ' · no insolvency or liquidation noted')) + '</dd>' +
        '<dt>Incorporated</dt><dd>' + D.long(r.incorporated) + '</dd>' +
        '<dt>Registered address</dt><dd>' + esc(r.address) + '</dd>' +
        '<dt>Directors</dt><dd>' + H('directors', esc(r.directors.join(', '))) + '</dd>' +
        '<dt>Last change</dt><dd>' + D.long(r.lastEntry) + '</dd>' +
        '</dl><div class="p-foot">Printed from the official register. Page 1 of 1</div></div>';
    }
    if (key === 'owners') {
      var groups = {};
      (c.owners || []).forEach(function (o, i) { if (o.src !== 'official') return; var g = o.of === 'self' ? c.name : o.of; (groups[g] = groups[g] || []).push({ o: o, i: i }); });
      return '<div class="paper serif">' +
        '<div class="p-head"><b>Shareholder register</b><span>Certified copy · ' + D.long(c.applied) + '</span></div>' +
        Object.keys(groups).map(function (g) {
          var holder = (c.owners || []).filter(function (o) { return o.name === g; })[0];
          return '<div class="p-sec"><div class="p-sub">' + esc(g) + (holder && holder.ref ? ' · ' + esc(holder.ref) : g === c.name ? ' · ' + esc(r.number) : '') + '</div>' +
            '<table class="p-tbl"><tr><th>Shareholder</th><th>Type</th><th class="r">Share</th></tr>' +
            groups[g].map(function (x) { return '<tr><td>' + H('o' + x.i, esc(x.o.name)) + '</td><td>' + (x.o.kind === 'person' ? 'Person' : 'Company') + '</td><td class="r">' + x.o.pct + '.00%</td></tr>'; }).join('') +
            '</table></div>';
        }).join('') +
        '<div class="p-sign"><span>Certified by a notary</span><span class="seal">CERTIFIED<br>COPY</span></div></div>';
    }
    if (key === 'chart') {
      var owners = c.owners || [], levels = [], prev = ['self'], guard = 0;
      while (guard++ < 6) {
        var row = []; owners.forEach(function (o, i) { if (prev.indexOf(o.of) >= 0) row.push({ o: o, i: i }); });
        if (!row.length) break; levels.push(row); prev = row.map(function (x) { return x.o.name; });
      }
      var node = function (x) {
        var made = x.o.src !== 'official', on = hl.indexOf('o' + x.i) >= 0;
        return '<div class="node' + (made ? ' made' : '') + (on ? ' on' : '') + '">' + (on && pin ? '<span class="pin' + (made ? ' w' : '') + '">' + pin + '</span>' : '') +
          '<b>' + esc(x.o.name) + '</b><span>' + (x.o.kind === 'person' ? 'Person' : 'Company') + ' \u00b7 ' + x.o.pct + '% of ' + esc(x.o.of === 'self' ? c.short : x.o.of.replace(/ (GmbH|Ltd|BV|AS|S\.L\.|Inc\.)$/, '')) + '</span></div>';
      };
      var rows = levels.slice().reverse().map(function (r) { return '<div class="trow">' + r.map(node).join('') + '</div>'; }).join('<div class="link" aria-hidden="true"></div>');
      return '<div class="paper"><span class="stamp">Company-made \u00b7 not official</span>' +
        '<div class="p-head"><b>' + esc(c.short) + '</b><span>Group structure</span></div>' +
        '<div class="p-note">Prepared by the company for the SBC Capital application.</div>' +
        '<div class="tree">' + rows + '<div class="link" aria-hidden="true"></div><div class="trow"><div class="node root"><b>' + esc(c.name) + '</b></div></div></div>' +
        '<div class="p-foot">Internal document. Not certified.</div></div>';
    }
    if (key.indexOf('licence:') === 0) {
      var l = c.licences[+key.split(':')[1]];
      var no = (l.issuer.replace(/[^A-Z]/g, '') || 'CERT') + '-' + (Math.abs(hash(c.id + l.name)) % 900000 + 100000);
      return '<div class="paper cert"><div class="p-head"><b>' + esc(l.issuer) + '</b><span>Certificate ' + no + '</span></div>' +
        '<div class="cert-t">Certificate</div><p>This certifies that the management system of</p>' +
        '<div class="cert-h">' + H('holder', esc(l.holder)) + '</div><p>' + esc(c.reg.address) + '</p>' +
        '<p>conforms to</p><div class="cert-s">' + esc(l.name) + '</div>' +
        '<dl class="kv"><dt>Issued</dt><dd>' + D.long(D.add(l.expires, -1095)) + '</dd><dt>Valid until</dt><dd>' + H('expires', D.long(l.expires), SBC.date.days(D.today, l.expires) < 90) + '</dd></dl>' +
        '<div class="p-foot">Check this certificate on the issuer’s public register.</div></div>';
    }
    if (key === 'screening') {
      var s = c.screening;
      var cell = function (p, kinds) {
        var h = s.hits.filter(function (x) { return x.name === p && kinds.indexOf(x.kind) >= 0; })[0];
        return h ? '<span class="p-hitc">Possible match</span>' : '<span class="p-clear">Clear</span>';
      };
      return '<div class="paper"><div class="p-head"><b>SBC Capital · Screening report</b><span>Run ' + D.long(s.run) + '</span></div>' +
        '<div class="p-note">Lists: [sanctions lists], PEP lists, and news from the last five years. Re-run every month while the mark is held.</div>' +
        '<table class="p-tbl"><tr><th>Party</th><th>Sanctions</th><th>PEP</th><th>News</th></tr>' +
        s.parties.map(function (p) {
          var row = '<td>' + esc(p) + '</td><td>' + cell(p, ['sanctions']) + '</td><td>' + cell(p, ['pep']) + '</td><td>' + cell(p, ['media']) + '</td>';
          var on = hl.indexOf('hit:' + p) >= 0;
          return '<tr class="' + (on ? 'rowhl' : '') + '">' + row + '</tr>';
        }).join('') + '</table>' +
        '<div class="p-sum">' + H('sanctions', s.hits.some(function (x) { return x.kind !== 'media'; }) ? 'A possible sanctions or PEP match needs an officer' : 'All parties clear on sanctions and PEP lists') + '</div>' +
        '<div class="p-sum">' + H('media', s.hits.some(function (x) { return x.kind === 'media'; }) ? 'A possible news match needs an officer' : 'No adverse media found') + '</div>' +
        s.hits.map(function (h) { return '<div class="p-hit' + (hl.indexOf('hit:' + h.name) >= 0 ? ' on' : '') + '">' + (hl.indexOf('hit:' + h.name) >= 0 && pin ? '<span class="pin">' + pin + '</span>' : '') + '<b>' + esc(h.name) + '</b><span>' + esc(h.note) + '</span></div>'; }).join('') +
        '</div>';
    }
    if (key.indexOf('local:') === 0) {
      var k = key.split(':')[1], loc = SBC.presence(c, k);
      if (!loc) return '<div class="missing"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A8231B" stroke-width="1.6" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 14h6"></path></svg>' +
        '<b>Not uploaded yet</b><span>No ICV certificate, local entity or agent agreement for ' + esc(k) + '.</span><span class="muted">Not a pass condition. It goes on the action plan, with agents SBC has reviewed.</span></div>';
      return '<div class="paper"><div class="p-head"><b>Gulf readiness evidence · ' + esc(k) + '</b><span>Uploaded by the company</span></div>' +
        '<dl class="kv">' + (loc.entity ? '<dt>Local entity</dt><dd>' + H('local', esc(loc.entity)) + '</dd>' : '') +
        (loc.agent ? '<dt>Agent agreement</dt><dd>' + H('local', 'Signed with ' + esc(loc.agent)) + '</dd>' : '') +
        (loc.icv ? '<dt>ICV certificate</dt><dd>' + H('local', 'Score ' + esc(loc.icv)) + '</dd>' : '') +
        '</dl><div class="p-foot">Copies on file. Originals seen by SBC.</div></div>';
    }
    if (key === 'record') {
      var m = c.mark || {};
      return '<div class="paper"><div class="p-head"><b>SBC-Qualified record</b><span>' + esc(m.id || '') + '</span></div>' +
        '<div class="cert-h" style="text-align:left">' + esc(c.name) + '</div><div class="p-note">' + esc(c.country) + ' · ' + esc(SBC_SEED.sectors[c.sector]) + '</div>' +
        '<dl class="kv"><dt>Mark</dt><dd>' + H('mark', 'Valid until ' + D.long(m.validTo) + ' · five checks · two officers') + '</dd>' +
        '<dt>Work on record</dt><dd>' + H('cap', (c.capabilities || []).map(function (x) { return esc(SBC_SEED.capabilities[x]); }).join(', ')) + '</dd>' +
        '<dt>References</dt><dd>' + H('refs', c.refs + ' relevant reference' + (c.refs === 1 ? '' : 's')) + '</dd>' +
        (c.target || []).map(function (k) { var x = SBC.presence(c, k); return '<dt>' + esc(k) + '</dt><dd>' + H('local:' + k, x ? esc(SBC.presenceText(x)) : 'No local presence yet') + '</dd>'; }).join('') +
        '<dt>Screening</dt><dd>Clear · last run ' + D.long(m.lastScreen) + '</dd></dl>' +
        '<div class="p-foot">Shared with the buyer only after two officers approve.</div></div>';
    }
    return '';
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

  window.SBCDocs = { list: list, meta: meta, render: render, esc: esc };
})();
