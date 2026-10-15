/* Minimal runtime for SBC prototype screens: holes, sc-for, sc-if, onClick, setState. */
(function () {
  var SVG = 'http://www.w3.org/2000/svg';
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  function look(path, scope) {
    if (path === 'true') return true; if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope[parts[0]];
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function interp(str, scope) {
    var whole = str.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
    if (whole) return look(whole[1], scope);
    return str.replace(HOLE, function (_, p) { var v = look(p, scope); return v == null ? '' : String(v); });
  }
  function build(node, scope, out, ns) {
    if (node.nodeType === 3) { out.push({ t: interp(node.nodeValue, scope) }); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = look(node.getAttribute('list').replace(/[{}\s]/g, ''), scope) || [], as = node.getAttribute('as');
      list.forEach(function (item) { var s = Object.create(scope); s[as] = item; kids(node, s, out, ns); });
      return;
    }
    if (tag === 'sc-if') { if (look(node.getAttribute('value').replace(/[{}\s]/g, ''), scope)) kids(node, scope, out, ns); return; }
    var nns = tag === 'svg' ? SVG : ns;
    var el = { tag: tag, ns: nns, a: {}, ev: {}, c: [] };
    for (var i = 0; i < node.attributes.length; i++) {
      var at = node.attributes[i], n = at.name;
      if (/^on/i.test(n) && /\{\{/.test(at.value)) { el.ev[n.slice(2).toLowerCase()] = look(at.value.replace(/[{}\s]/g, ''), scope); continue; }
      if (n.indexOf('hint-') === 0) continue;
      var v = interp(at.value, scope);
      if (v === false || v == null) continue;
      el.a[n] = String(v);
    }
    var src = tag === 'template' ? node.content : node;
    kids(src, scope, el.c, nns);
    out.push(el);
  }
  function kids(node, scope, out, ns) { for (var ch = node.firstChild; ch; ch = ch.nextSibling) build(ch, scope, out, ns); }
  function make(v) {
    if ('t' in v) return document.createTextNode(v.t);
    var el = v.ns ? document.createElementNS(v.ns, v.tag) : document.createElement(v.tag);
    patch(el, v); return el;
  }
  function patch(el, v) {
    var a = v.a, k;
    for (k in a) if (el.getAttribute(k) !== a[k]) el.setAttribute(k, a[k]);
    for (var i = el.attributes.length - 1; i >= 0; i--) { k = el.attributes[i].name; if (!(k in a)) el.removeAttribute(k); }
    el.__ev = v.ev;
    if (!el.__bound) { el.__bound = true; ['click', 'input', 'change'].forEach(function (t) { el.addEventListener(t, function (e) { var f = el.__ev && el.__ev[t]; if (typeof f === 'function') f(e); }); }); }
    morph(el, v.c);
  }
  function morph(parent, list) {
    var cur = parent.firstChild, i;
    for (i = 0; i < list.length; i++) {
      var v = list[i];
      if (!cur) { parent.appendChild(make(v)); continue; }
      var next = cur.nextSibling;
      if ('t' in v) { if (cur.nodeType === 3) { if (cur.nodeValue !== v.t) cur.nodeValue = v.t; } else parent.replaceChild(make(v), cur); }
      else if (cur.nodeType === 1 && cur.localName === v.tag) patch(cur, v);
      else parent.replaceChild(make(v), cur);
      cur = next;
    }
    while (cur) { var n = cur.nextSibling; parent.removeChild(cur); cur = n; }
  }
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (p) {
    var s = typeof p === 'function' ? p(this.state) : p; this.state = Object.assign({}, this.state, s);
    if (this.__render) this.__render();
  };
  window.DCLite = {
    mount: function (tpl, factory, root) {
      var Comp = factory(DCLogic), inst = new Comp({});
      var raf = 0;
      inst.__render = function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; draw(); }); };
      function draw() {
        var vals = inst.renderVals ? inst.renderVals() : {}, out = [];
        kids(tpl.content, vals, out, null); morph(root, out);
      }
      draw();
      if (inst.componentDidMount) inst.componentDidMount();
    }
  };
  function go(id) { if (window.parent !== window) window.parent.postMessage({ sbcGo: id }, '*'); else location.href = id + '.html'; }
  window.DCLite.go = go;
  if (window.parent === window && document.documentElement.getAttribute('data-home')) {
    document.addEventListener('DOMContentLoaded', function () {
      var a = document.createElement('a'); a.href = document.documentElement.getAttribute('data-home'); a.id = 'dc-home';
      a.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>Portal preview';
      a.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9998;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;background:rgba(15,17,21,.86);color:#FFFFFF;font:500 12px Geist,system-ui,sans-serif;text-decoration:none;box-shadow:0 8px 20px rgba(15,17,21,.2);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)';
      document.body.appendChild(a);
    });
  }
  var tw;
  function toast(msg) {
    var t = document.getElementById('dc-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'dc-toast'; t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);opacity:0;z-index:9999;display:flex;align-items:center;gap:10px;padding:10px 16px 10px 12px;border-radius:10px;background:#0F1115;color:#FFFFFF;font:500 13px Geist,system-ui,sans-serif;box-shadow:0 12px 30px rgba(15,17,21,.25);transition:opacity .2s,transform .25s cubic-bezier(.2,.8,.2,1);pointer-events:none;max-width:80%';
      document.body.appendChild(t);
    }
    t.innerHTML = '<span style="width:18px;height:18px;border-radius:999px;background:#2FA36B;display:grid;place-items:center;flex:none"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"><path d="M5 12l5 5 9-10"></path></svg></span>';
    t.appendChild(document.createTextNode(msg));
    requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; });
    clearTimeout(tw); tw = setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translate(-50%,16px)'; }, 2400);
  }
  function labelOf(el) {
    var c = el.cloneNode(true);
    [].forEach.call(c.querySelectorAll('.ct,.badge'), function (x) { x.remove(); });
    return c.textContent.replace(/[→↗]/g, '').replace(/\s+/g, ' ').trim();
  }
  function act(el, a) {
    if (a.copy && navigator.clipboard) navigator.clipboard.writeText(a.copy).catch(function () {});
    if (a.toggle) { var on = el.getAttribute('data-on') === '1'; el.setAttribute('data-on', on ? '0' : '1'); el.style.background = on ? '' : '#EEF2FD'; el.style.borderColor = on ? '' : '#1F4FD1'; el.style.color = on ? '' : '#1F4FD1'; toast(on ? 'Showing all files' : a.toast); return; }
    if (a.toast) toast(a.toast);
    if (a.done) {
      el.textContent = '';
      el.insertAdjacentHTML('beforeend', '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="margin-right:2px"><path d="M5 12l5 5 9-10"></path></svg>');
      el.appendChild(document.createTextNode(a.done));
      el.style.pointerEvents = 'none'; el.style.opacity = '.75'; el.setAttribute('aria-disabled', 'true');
      el.animate && el.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1.04)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    }
    if (a.go) setTimeout(function () { go(a.go); }, a.toast ? 650 : 0);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a[href],button'); if (!el) return;
    if (el.__ev && typeof el.__ev.click === 'function') return;
    var h = el.tagName === 'A' ? el.getAttribute('href') : null;
    var m = h && h.match(/^([A-Za-z0-9]+)\.dc\.html/);
    if (m) { e.preventDefault(); go(m[1]); return; }
    if (el.id === 'dc-home') return;
    if (h && h !== '#' && h !== '') return;
    e.preventDefault();
    var A = window.SBC_ACTIONS || {}, lab = labelOf(el);
    var a = (A.screen || {})[lab] || (A.all || {})[lab];
    act(el, a || { toast: (lab || 'This') + ' is not part of this prototype yet' });
  });
})();
