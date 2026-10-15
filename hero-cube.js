/* SBC hero cube: ink lattice with one lit cell. Renders into any element with data-hero-cube; keeps the element's fallback if WebGL is unavailable. */
(function () {
  if (!window.THREE) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function roundedBox(s, r, seg) {
    var g = new THREE.BoxGeometry(s, s, s, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal, h = s / 2 - r;
    var v = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      c.set(Math.max(-h, Math.min(h, v.x)), Math.max(-h, Math.min(h, v.y)), Math.max(-h, Math.min(h, v.z)));
      d.subVectors(v, c); if (d.lengthSq() < 1e-9) continue; d.normalize();
      p.setXYZ(i, c.x + d.x * r, c.y + d.y * r, c.z + d.z * r); n.setXYZ(i, d.x, d.y, d.z);
    }
    p.needsUpdate = true; n.needsUpdate = true; return g;
  }


  function grainTexture(kind) {
    var N = 512, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d'), img = g.createImageData(N, N), d = img.data;
    function h(x, y, s) { var n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
    function vn(x, y, s) { var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = h(xi, yi, s), b = h(xi + 1, yi, s), c2 = h(xi, yi + 1, s), e = h(xi + 1, yi + 1, s); return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + e) * u * v; }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var f = 0, amp = 0.5, fr = 4 / N * 8;
      for (var o = 0; o < 5; o++) { f += vn(x * fr, y * fr, o) * amp; fr *= 2.1; amp *= 0.5; }
      var speck = h(x, y, 9);
      var val = kind === 'stone' ? f * 0.75 + speck * 0.25 - (speck > 0.985 ? 0.35 : 0) : f * 0.55 + speck * 0.45;
      val = Math.max(0, Math.min(1, val)); var i = (y * N + x) * 4, b8 = Math.round(val * 255);
      d[i] = d[i + 1] = d[i + 2] = b8; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(kind === 'stone' ? 1 : 2, kind === 'stone' ? 1 : 2); t.anisotropy = 4; return t;
  }
  var GRAIN = null, STONE = null;
  function textured(mat, kind, bump) {
    if (kind === 'stone') { STONE = STONE || grainTexture('stone'); mat.bumpMap = STONE; mat.bumpScale = bump; }
    else { GRAIN = GRAIN || grainTexture('grain'); mat.bumpMap = GRAIN; mat.roughnessMap = GRAIN; mat.bumpScale = bump; }
    mat.needsUpdate = true; return mat;
  }

  function envFor(renderer, tint) {
    var es = new THREE.Scene();
    var sg = new THREE.SphereGeometry(10, 32, 16), cols = [], pos = sg.attributes.position;
    var top = new THREE.Color(tint.top), bot = new THREE.Color(tint.bot), tmp = new THREE.Color();
    for (var i = 0; i < pos.count; i++) { var t = (pos.getY(i) / 10 + 1) / 2; tmp.copy(bot).lerp(top, Math.pow(t, 1.5)); cols.push(tmp.r, tmp.g, tmp.b); }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    es.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    var box = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint.soft).multiplyScalar(0.8), side: THREE.DoubleSide }));
    box.position.set(0, 7, 3); box.lookAt(0, 0, 0); es.add(box);
    var rim = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint.rim).multiplyScalar(1.3), side: THREE.DoubleSide }));
    rim.position.set(-4, 2, -7); rim.lookAt(0, 0, 0); es.add(rim);
    var pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(es, 0.04).texture; pm.dispose(); return tex;
  }

  function cells(size, gap, mat, round) {
    var grp = new THREE.Group(), c = (size - gap) / 2, off = (c + gap) / 2, geo = roundedBox(c, round, 6), list = [];
    for (var x = -1; x <= 1; x += 2) for (var y = -1; y <= 1; y += 2) for (var z = -1; z <= 1; z += 2) {
      var m = new THREE.Mesh(geo, mat); m.position.set(x * off, y * off, z * off); m.userData.k = [x, y, z]; grp.add(m); list.push(m);
    }
    grp.userData.list = list; return grp;
  }

  function buildCell(scene, renderer) {
      scene.environment = envFor(renderer, { top: '#2A3150', bot: '#05070D', soft: '#C9D3F2', rim: '#3D6AF0' });
      var ink = textured(new THREE.MeshStandardMaterial({ color: '#151926', roughness: 0.95, metalness: 0, envMapIntensity: 0.4 }), 'grain', 0.007);
      var lit = textured(new THREE.MeshStandardMaterial({ color: '#1F4FD1', roughness: 0.95, emissive: '#1F4FD1', emissiveIntensity: 0.65, envMapIntensity: 0.3 }), 'grain', 0.006);
      var grp = cells(1.7, 0.06, ink, 0.05); scene.add(grp);
      grp.userData.list.forEach(function (m) { var k = m.userData.k; if (k[0] === 1 && k[1] === 1 && k[2] === 1) m.material = lit; });
      var glow = new THREE.PointLight('#5B82FF', 1.6, 2.6); glow.position.set(0.85, 0.85, 0.85); grp.add(glow);
      var k = new THREE.DirectionalLight('#FFFFFF', 0.4); k.position.set(-2, 4, 3); scene.add(k);
      var r = new THREE.DirectionalLight('#3D6AF0', 2.0); r.position.set(-3, 1, -4); scene.add(r);
      scene.add(new THREE.AmbientLight('#1B2240', 0.5));
      return grp;
  }
  document.querySelectorAll('[data-hero-cube]').forEach(function (el, idx) {
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    if (!renderer.getContext()) return;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
    el.innerHTML = ''; el.__live = true; el.style.position = el.style.position || 'relative';
    var halo = document.createElement('div');
    halo.style.cssText = 'position:absolute;left:50%;top:46%;width:90%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;filter:blur(30px);background:radial-gradient(circle at 60% 35%,rgba(61,106,240,.6),rgba(31,79,209,.14) 40%,transparent 68%)';
    var floor = document.createElement('div');
    floor.style.cssText = 'position:absolute;left:50%;bottom:4%;width:56%;height:10%;transform:translateX(-50%);border-radius:50%;pointer-events:none;filter:blur(14px);background:rgba(61,106,240,.32)';
    el.appendChild(halo); el.appendChild(floor);
    var cv = renderer.domElement; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:pan-y'; el.appendChild(cv);
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 0.6, 6.4); cam.lookAt(0, 0, 0);
    var obj = buildCell(scene, renderer), holder = new THREE.Group(); scene.remove(obj); holder.add(obj); scene.add(holder);
    obj.rotation.set(0.62, 0.78, 0);
    function size() { var w = el.clientWidth, h = el.clientHeight || w; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    size(); if (window.ResizeObserver) new ResizeObserver(size).observe(el); else addEventListener('resize', size);
    var drag = null, vy = 0, spin = reduce ? 0 : 0.0032, t0 = performance.now(), visible = true;
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; vy = (e.clientX - drag.x) * 0.008; holder.rotation.x = Math.max(-0.8, Math.min(0.8, holder.rotation.x + (e.clientY - drag.y) * 0.008)); holder.rotation.y += vy; drag.x = e.clientX; drag.y = e.clientY; });
    function up() { drag = null; cv.style.cursor = 'grab'; } cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(el);
    function frame(now) {
      requestAnimationFrame(frame); if (!visible) return;
      var t = (now - t0) / 1000;
      if (!drag) { holder.rotation.y += spin + vy; vy *= 0.94; holder.rotation.x *= 0.985; }
      var f = reduce ? 0 : Math.sin(t * 0.9) * 0.09; holder.position.y = f;
      floor.style.opacity = (0.95 - f * 2.5).toFixed(3); floor.style.transform = 'translateX(-50%) scale(' + (1 - f * 1.2).toFixed(3) + ')';
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  });
})();
