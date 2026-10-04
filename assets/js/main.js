/* ============================================
   WHITE HOLE — Core JS v3
   Theme · Sidebar only · Particles · Cursor glow
   ============================================ */

(function () {
  'use strict';

  // Global copy/select protection (except revealed anime keys)
  document.addEventListener('copy', (e) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.anchorNode;
    if (node && node.nodeType === 3) node = node.parentElement;
    if (node && node.closest && node.closest('.btn-password.is-revealed, .allow-copy')) return;
    e.preventDefault();
  });
  document.addEventListener('cut', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest && e.target.closest('.btn-password.is-revealed, .allow-copy, input, textarea')) return;
    e.preventDefault();
  });


  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEMES = [
    { id: 'dark', label: 'Oscuro', group: 'dark' },
    { id: 'void', label: 'Vacío', group: 'dark' },
    { id: 'ember', label: 'Ember', group: 'dark' },
    { id: 'abyss', label: 'Abismo', group: 'dark' },
    { id: 'aero', label: 'Aero', group: 'dark' },
    { id: 'halloween', label: 'Halloween', group: 'dark' },
    { id: 'light', label: 'Claro', group: 'light' },
    { id: 'aurora', label: 'Aurora', group: 'light' },
    { id: 'dawn', label: 'Amanecer', group: 'light' },
    { id: 'mist', label: 'Niebla', group: 'light' },
    { id: 'aero-light', label: 'Aero', group: 'light' }
  ];
  const LIGHT = { light:1, dawn:1, aurora:1, mist:1, 'aero-light':1 };
  const isOctober = (new Date()).getMonth() === 9;
  let savedTheme = localStorage.getItem('wh-theme') || 'dark';
  if (!THEMES.some(t => t.id === savedTheme)) savedTheme = 'dark';
  // Durante todo octubre, Halloween es el tema por defecto automático
  if (isOctober) {
    savedTheme = 'halloween';
    try { localStorage.setItem('wh-theme', 'halloween'); } catch (e) {}
  }
  html.setAttribute('data-theme', savedTheme);

  function applyTheme(id) {
    html.classList.add('theme-switching');
    html.setAttribute('data-theme', id);
    localStorage.setItem('wh-theme', id);
    document.querySelectorAll('.theme-opt').forEach(b => {
      b.classList.toggle('is-active', b.dataset.theme === id);
    });
    setTimeout(function () { html.classList.remove('theme-switching'); }, 900);
    if (window.spawnBurst && themeToggle) {
      const r = themeToggle.getBoundingClientRect();
      window.spawnBurst(r.left + r.width/2, r.top + r.height/2, 10);
    }
  }

  if (themeToggle) {
    let wrap = themeToggle.closest('.theme-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'theme-wrap';
      themeToggle.parentNode.insertBefore(wrap, themeToggle);
      wrap.appendChild(themeToggle);
    }
    let menu = document.getElementById('themeMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'themeMenu';
      menu.className = 'theme-menu';
      let darkH = '<div class="theme-menu-label">Oscuros</div><div class="theme-menu-grid">';
      let lightH = '<div class="theme-menu-label">Claros</div><div class="theme-menu-grid">';
      THEMES.forEach(t => {
        const btn = '<button type="button" class="theme-opt' + (t.id===savedTheme?' is-active':'') +
          '" data-theme="' + t.id + '"><span class="theme-swatch" data-t="' + t.id +
          '"></span><span class="theme-opt-label">' + t.label +
          '</span><span class="theme-opt-check">✓</span></button>';
        if (t.group === 'dark') darkH += btn; else lightH += btn;
      });
      menu.innerHTML = darkH + '</div>' + lightH + '</div>';
      wrap.appendChild(menu);
    }
    function closeThemeMenu() {
      if (!menu.classList.contains('open')) return;
      menu.classList.add('is-closing');
      menu.classList.remove('open');
      themeToggle.classList.remove('menu-open');
      setTimeout(function () { menu.classList.remove('is-closing'); }, 300);
    }
    function openThemeMenu() {
      menu.classList.remove('is-closing');
      menu.classList.add('open');
      themeToggle.classList.add('menu-open');
    }
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !menu.classList.contains('open');
      themeToggle.classList.add('is-pressing');
      setTimeout(function () { themeToggle.classList.remove('is-pressing'); }, 320);
      if (willOpen) openThemeMenu();
      else closeThemeMenu();
    });
    menu.addEventListener('click', (e) => {
      const opt = e.target.closest('.theme-opt');
      if (!opt) return;
      e.stopPropagation();
      applyTheme(opt.dataset.theme);
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closeThemeMenu();
    });
  }

  // ---- Background music (native <audio>, persists position across pages) ----
  const musicToggle = document.getElementById('musicToggle');
  // musicControls declared above
  let bgAudio = document.getElementById('bgMusic');
  let musicMuted = localStorage.getItem('wh-music-muted') === 'true';

  function resolveAudioSrc() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute('src') || '';
      if (src.includes('assets/js/main.js')) {
        return src.replace('js/main.js', 'audio/bgm.mp3');
      }
    }
    return 'assets/audio/bgm.mp3';
  }

  function saveMusicProgress() {
    if (!bgAudio) return;
    try {
      sessionStorage.setItem('wh-music-time', String(bgAudio.currentTime || 0));
      sessionStorage.setItem('wh-music-playing', (!bgAudio.paused && !musicMuted) ? '1' : '0');
    } catch (e) { /* ignore */ }
  }

  function restoreMusicProgress() {
    if (!bgAudio) return;
    try {
      const t = parseFloat(sessionStorage.getItem('wh-music-time') || '0');
      if (!isNaN(t) && t > 0) {
        const seek = function () {
          try { bgAudio.currentTime = t; } catch (e) { /* ignore */ }
        };
        if (bgAudio.readyState >= 1) seek();
        else bgAudio.addEventListener('loadedmetadata', seek, { once: true });
      }
    } catch (e) { /* ignore */ }
  }

  if (!bgAudio) {
    bgAudio = document.createElement('audio');
    bgAudio.id = 'bgMusic';
    bgAudio.loop = true;
    bgAudio.preload = 'auto';
    bgAudio.volume = 0.35;
    bgAudio.src = resolveAudioSrc();
    document.body.appendChild(bgAudio);
  } else {
    bgAudio.loop = true;
    bgAudio.volume = 0.35;
    if (!bgAudio.getAttribute('src')) bgAudio.src = resolveAudioSrc();
  }

  restoreMusicProgress();

  // Keep saving progress while playing
  setInterval(saveMusicProgress, 1500);
  window.addEventListener('pagehide', saveMusicProgress);
  window.addEventListener('beforeunload', saveMusicProgress);

  function updateMusicUI() {
    if (!musicToggle) return;
    musicToggle.classList.toggle('is-muted', musicMuted);
    musicToggle.setAttribute('aria-label', musicMuted ? 'Activar música' : 'Silenciar música');
    musicToggle.title = musicMuted ? 'Activar música' : 'Silenciar música';
  }

  function applyMusicState() {
    if (!bgAudio) return;
    try { bgAudio.muted = !!musicMuted; } catch (e) {}
    if (musicMuted) {
      bgAudio.pause();
      saveMusicProgress();
    } else {
      bgAudio.muted = false;
      const playPromise = bgAudio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () { /* needs gesture */ });
      }
    }
  }

  updateMusicUI();

  // Try autoplay; browsers may block until gesture
  const wasPlaying = sessionStorage.getItem('wh-music-playing');
  if (!musicMuted && (wasPlaying === null || wasPlaying === '1')) {
    applyMusicState();
  }

  // Unlock audio on first interaction (fixes silent "playing" state)
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked || !bgAudio) return;
    audioUnlocked = true;
    const vol = parseInt(localStorage.getItem('wh-music-vol') || '20', 10) / 100;
    bgAudio.volume = Math.min(1, Math.max(0, vol));
    bgAudio.muted = !!musicMuted;
    if (!musicMuted) {
      bgAudio.play().then(() => {
        // force a tiny seek to ensure audible pipeline
        try {
          const t = bgAudio.currentTime;
          bgAudio.currentTime = Math.max(0, t);
        } catch (e) {}
      }).catch(() => {});
    }
  }
  ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(ev => {
    document.addEventListener(ev, unlockAudio, { once: true, capture: true });
  });
  // Also try when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !musicMuted) applyMusicState();
  });

  if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
      // Mobile: show volume bar; always auto-hide after 2s idle
      if (window.matchMedia('(max-width: 900px)').matches) {
        e.preventDefault();
        e.stopPropagation();
        if (musicControls) {
          musicControls.classList.add('is-open', 'is-adjusting');
          clearTimeout(window.__volHideT);
          clearTimeout(window.__volHideT2);
          function hideVol() {
            musicControls.classList.remove('is-open', 'is-adjusting');
          }
          window.__volHideT = setTimeout(hideVol, 2000);
          // safety second timer
          window.__volHideT2 = setTimeout(hideVol, 2500);
        }
        return;
      }
      musicMuted = !musicMuted;
      localStorage.setItem('wh-music-muted', musicMuted ? 'true' : 'false');
      updateMusicUI();
      applyMusicState();
      saveMusicProgress();
      if (window.spawnBurst) {
        const rect = musicToggle.getBoundingClientRect();
        window.spawnBurst(rect.left + 23, rect.top + 23, 10);
      }
    });
  }

  // Save progress right before internal navigation
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      saveMusicProgress();
    }
  }, true);


  // Volume slider + percentage (opens to the left)
  const volumeSlider = document.getElementById('volumeSlider');
  const volumePct = document.getElementById('volumePct');
  const musicControls = document.querySelector('.music-controls');
  const savedVol = parseInt(localStorage.getItem('wh-music-vol') || '20', 10);
  if (bgAudio) bgAudio.volume = Math.min(1, Math.max(0, savedVol / 100));
  function setVolUI(v) {
    if (volumeSlider) volumeSlider.value = String(v);
    if (volumePct) volumePct.textContent = v + '%';
  }
  setVolUI(savedVol);
  if (volumeSlider) {
    let hideVolT;
    function openVol() {
      if (musicControls) musicControls.classList.add('is-adjusting', 'is-open');
      clearTimeout(hideVolT);
      clearTimeout(window.__volHideT);
      var ms = window.matchMedia('(max-width: 900px)').matches ? 2000 : 2000;
      hideVolT = setTimeout(function () {
        if (musicControls) {
          musicControls.classList.remove('is-adjusting', 'is-open');
        }
      }, ms);
      window.__volHideT = hideVolT;
    }
    volumeSlider.addEventListener('input', function () {
      var v = parseInt(volumeSlider.value, 10) || 0;
      if (bgAudio) bgAudio.volume = v / 100;
      try { localStorage.setItem('wh-music-vol', String(v)); } catch (e) {}
      setVolUI(v);
      openVol();
      if (window.matchMedia('(max-width: 900px)').matches) {
        clearTimeout(window.__volHideT);
        window.__volHideT = setTimeout(function () {
          if (musicControls) musicControls.classList.remove('is-open', 'is-adjusting');
        }, 2000);
      }
    });
    volumeSlider.addEventListener('pointerdown', openVol);
    volumeSlider.addEventListener('pointerup', openVol);
    volumeSlider.addEventListener('touchstart', openVol, { passive: true });
    if (musicControls) {
      musicControls.addEventListener('mouseenter', openVol);
      musicControls.addEventListener('mouseleave', function () {
        clearTimeout(hideVolT);
        hideVolT = setTimeout(function () {
          musicControls.classList.remove('is-adjusting', 'is-open');
        }, 2000);
      });
    }
  }

  // Resume after back-forward cache
  window.addEventListener('pageshow', (e) => {
    restoreMusicProgress();
    if (!musicMuted && sessionStorage.getItem('wh-music-playing') === '1') {
      applyMusicState();
    }
  });



  // ---- Black hole responsive ambient audio (home only) ----
  (function initBlackholeAudio() {
    const bh = document.querySelector('.blackhole, .blackhole-container, #blackhole');
    if (!bh) return;

    let ctx, osc, gain, lfo, filter;
    let started = false;

    function ensureAudio() {
      if (started) return;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 42;
        lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 8;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;
        gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        lfo.start();
        started = true;
      } catch (e) { /* ignore */ }
    }

    function setProximity(strength) {
      if (!started || !gain) return;
      const target = Math.min(0.12, Math.max(0, strength * 0.12));
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.linearRampToValueAtTime(target, now + 0.08);
      if (filter) filter.frequency.linearRampToValueAtTime(120 + strength * 200, now + 0.1);
      if (osc) osc.frequency.linearRampToValueAtTime(36 + strength * 28, now + 0.1);
    }

    document.addEventListener('pointerdown', ensureAudio, { once: true });
    if (musicToggle) {
      musicToggle.addEventListener('click', () => {
        ensureAudio();
        if (ctx && ctx.state === 'suspended') ctx.resume();
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (!started) return;
      const rect = bh.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = Math.max(rect.width, rect.height) * 0.85;
      const strength = Math.max(0, 1 - dist / radius);
      // respect global mute
      if (musicMuted) setProximity(0);
      else setProximity(strength * (bgAudio ? bgAudio.volume : 0.35));
    });

    document.addEventListener('mouseleave', () => setProximity(0));
  })();



  // ---- Prefetch all sections for instant navigation ----
  (function prefetchSite() {
    const pages = [
      'index.html',
      'pages/novel.html',
      'pages/library.html',
      'pages/owner.html',
      'pages/chapter-a1-c1.html'
    ];
    // resolve relative to current location
    const base = document.querySelector('script[src*="main.js"]');
    let root = '';
    if (base) {
      const src = base.getAttribute('src') || '';
      root = src.includes('../') ? '../' : '';
    }
    const urls = pages.map(p => {
      if (root === '../' && p.startsWith('pages/')) return p.replace('pages/', '');
      if (root === '../' && p === 'index.html') return '../index.html';
      return root + p;
    });
    // also prefetch css/js
    const assets = [
      root + 'assets/css/main.css',
      root + 'assets/css/home.css',
      root + 'assets/css/novel.css',
      root + 'assets/css/library.css',
      root + 'assets/css/owner.css',
      root + 'assets/css/reader.css',
      root + 'assets/js/library.js',
      root + 'assets/js/novel.js',
      root + 'assets/js/reader.js',
      root + 'assets/audio/bgm.mp3'
    ];
    const all = urls.concat(assets);
    const run = () => {
      all.forEach(href => {
        try {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = href;
          link.as = href.endsWith('.css') ? 'style' : (href.endsWith('.js') ? 'script' : (href.endsWith('.mp3') ? 'audio' : 'document'));
          document.head.appendChild(link);
        } catch (e) {}
      });
      // warm fetch
      all.forEach(href => {
        try { fetch(href, { credentials: 'same-origin' }).catch(() => {}); } catch (e) {}
      });
    };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 });
    else setTimeout(run, 600);
  })();


  // Online counter only (lightweight)
  (function () {
    const onlineEl = document.getElementById('onlineCount');
    if (!onlineEl) return;
    const tabId = sessionStorage.getItem('wh-tab-id') || (Date.now() + '-' + Math.random().toString(36).slice(2));
    sessionStorage.setItem('wh-tab-id', tabId);
    const CHANNEL = 'wh-online-v1';
    function beat() {
      try {
        const now = Date.now();
        const raw = JSON.parse(localStorage.getItem(CHANNEL) || '{}');
        // prune stale (>20s)
        Object.keys(raw).forEach(k => { if (now - raw[k] > 20000) delete raw[k]; });
        raw[tabId] = now;
        localStorage.setItem(CHANNEL, JSON.stringify(raw));
        onlineEl.textContent = String(Math.max(1, Object.keys(raw).length));
      } catch (e) {
        onlineEl.textContent = '1';
      }
    }
    beat();
    setInterval(beat, 5000);
    window.addEventListener('storage', (e) => {
      if (e.key === CHANNEL) beat();
    });
  })();




  // Continue reading
  (function () {
    const label = document.getElementById('continueReadingLabel');
    const btn = document.getElementById('continueReadingBtn');
    const cont = localStorage.getItem('wh-continue');
    if (cont && label && btn) {
      try {
        const data = JSON.parse(cont);
        label.textContent = 'Continuar: ' + (data.title || 'Lectura');
        btn.href = data.url;
      } catch (e) {}
    }
  })();


  // Offline cache of opened chapter pages
  (function () {
    if (!('caches' in window)) return;
    const path = location.pathname;
    if (path.indexOf('chapter') === -1) return;
    caches.open('wh-chapters-v1').then(cache => {
      cache.add(location.href).catch(() => {});
    });
  })();


  // blackhole-egg: hold 2s to absorb; only particles expel
  (function () {
    const bh = document.querySelector('.blackhole-container');
    if (!bh) return;
    let busy = false;
    let holdTimer = null;
    let holding = false;
    bh.style.cursor = 'pointer';
    bh.removeAttribute('title');

    function ensureStage() {
      let st = document.getElementById('bhStormStage');
      if (st) return st;
      st = document.createElement('div');
      st.id = 'bhStormStage';
      st.className = 'bh-storm-stage';
      st.innerHTML = '<canvas id="bhStormCanvas"></canvas><div class="bh-storm-flash"></div><div class="bh-storm-ring"></div><div class="bh-storm-ring delay"></div>';
      document.body.appendChild(st);
      return st;
    }

    function runStorm() {
      if (busy) return;
      busy = true;
      const st = ensureStage();
      const canvas = document.getElementById('bhStormCanvas');
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = '100%'; canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const r = bh.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      st.style.setProperty('--bh-x', (cx / W * 100) + '%');
      st.style.setProperty('--bh-y', (cy / H * 100) + '%');
      document.documentElement.style.setProperty('--bh-x', (cx / W * 100) + '%');
      document.documentElement.style.setProperty('--bh-y', (cy / H * 100) + '%');
      document.documentElement.style.setProperty('--bh-x-px', cx + 'px');
      document.documentElement.style.setProperty('--bh-y-px', cy + 'px');

      st.classList.add('active');
      document.body.classList.add('bh-storm-active', 'bh-swallowing', 'bh-event-horizon-expand');
      if (window.spawnBurst) {
        var br = bh.getBoundingClientRect();
        for (var bi = 0; bi < 6; bi++) {
          window.spawnBurst(br.left + br.width / 2, br.top + br.height / 2, 40);
        }
      }
      document.querySelectorAll('.floating-orbs, .bg-aurora, .bg-layer, .noise-overlay, #particles, .cursor-glow, .main-content').forEach(function(el){ el.classList.add('bh-bg-swallow'); });
      document.querySelectorAll('.top-bar, .sidebar, .site-footer, .sidebar-backdrop').forEach(function(el){ el.classList.add('bh-disintegrate'); });
      // content stays absorbed — no bh-expelling on UI

      const particles = [];
      for (let i = 0; i < 480; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * Math.max(W, H) * 0.6;
        particles.push({
          x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist,
          vx: 0, vy: 0, life: 1, hue: 175 + Math.random() * 90, size: 1 + Math.random() * 3
        });
      }

      const t0 = performance.now();
      function frame(now) {
        const elapsed = now - t0;
        ctx.clearRect(0, 0, W, H);
        const phase = elapsed < 2400 ? 'in' : (elapsed < 5200 ? 'hold' : 'out');

        particles.forEach(p => {
          const dx = cx - p.x, dy = cy - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (phase !== 'out') {
            const pull = (phase === 'in' ? 0.14 : 0.03) + 6 / d;
            p.vx += (dx / d) * pull; p.vy += (dy / d) * pull;
            p.vx *= 0.91; p.vy *= 0.91;
          } else {
            p.vx -= (dx / d) * 0.22; p.vy -= (dy / d) * 0.22;
            p.vx *= 0.97; p.vy *= 0.97; p.life -= 0.015;
          }
          p.x += p.vx; p.y += p.vy;
          if (p.life <= 0) return;
          ctx.beginPath();
          ctx.fillStyle = 'hsla(' + p.hue + ',80%,70%,' + (0.25 + p.life * 0.5) + ')';
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Event horizon core
        var coreR = 18 + Math.sin(elapsed * 0.008) * 4;
        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 8);
        grd.addColorStop(0, 'rgba(0,0,0,1)');
        grd.addColorStop(0.15, 'rgba(0,0,0,0.95)');
        grd.addColorStop(0.35, 'rgba(20,40,80,0.35)');
        grd.addColorStop(0.55, 'rgba(120,180,255,0.2)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 8, 0, Math.PI * 2);
        ctx.fill();
        // Photon ring
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,230,255,' + (phase === 'out' ? 0.2 : 0.85) + ')';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(160,200,255,0.9)';
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Accretion spokes
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(elapsed * 0.003);
        for (let i = 0; i < 16; i++) {
          ctx.rotate(Math.PI / 8);
          const g = ctx.createLinearGradient(0, 0, 180, 0);
          g.addColorStop(0, 'rgba(200,220,255,0)');
          g.addColorStop(0.4, 'rgba(180,210,255,' + (phase === 'out' ? 0.08 : 0.55) + ')');
          g.addColorStop(1, 'rgba(100,160,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(coreR * 2.4, -1.5, 140, 3);
        }
        ctx.restore();

        if (elapsed < 8500) requestAnimationFrame(frame);
        else {
          st.classList.remove('active');
          // quietly restore UI without expel animation
          document.body.classList.remove('bh-storm-active', 'bh-swallowing', 'bh-event-horizon-expand');
          document.querySelectorAll('.bh-bg-swallow').forEach(function(el){ el.classList.remove('bh-bg-swallow'); });
          document.querySelectorAll('.bh-disintegrate').forEach(function(el){ el.classList.remove('bh-disintegrate'); });
          busy = false;
        }
      }
      requestAnimationFrame(frame);
    }

    function startHold(e) {
      if (busy) return;
      holding = true;
      bh.classList.add('bh-holding');
      var r = bh.getBoundingClientRect();
      document.documentElement.style.setProperty('--bh-x', ((r.left + r.width / 2) / window.innerWidth * 100) + '%');
      document.documentElement.style.setProperty('--bh-y', ((r.top + r.height / 2) / window.innerHeight * 100) + '%');
      holdTimer = setTimeout(() => {
        if (!holding) return;
        holding = false;
        bh.classList.remove('bh-holding');
        runStorm();
      }, 2000);
    }
    function endHold() {
      holding = false;
      clearTimeout(holdTimer);
      bh.classList.remove('bh-holding');
    }

    bh.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startHold(e);
    });
    bh.addEventListener('pointerup', endHold);
    bh.addEventListener('pointerleave', endHold);
    bh.addEventListener('pointercancel', endHold);
  })();

  // Logo cycle Emiru <-> Mahiru every 6s; dark uses ruler variants
  (function () {
    const wrap = document.getElementById('siteLogoWrap') || document.querySelector('.site-logo-wrap');
    if (!wrap) return;
    const a = wrap.querySelector('.site-logo-a');
    const b = wrap.querySelector('.site-logo-b');
    if (!a || !b) return;

    function applyThemeSources() {
      const t = document.documentElement.getAttribute('data-theme') || 'dark';
      const light = {light:1,dawn:1,aurora:1,mist:1,'aero-light':1};
      const dark = !light[t];
      const aSrc = a.getAttribute(dark ? 'data-dark' : 'data-light');
      const bSrc = b.getAttribute(dark ? 'data-dark' : 'data-light');
      if (aSrc) a.src = aSrc;
      if (bSrc) b.src = bSrc;
    }
    applyThemeSources();

    const obs = new MutationObserver(applyThemeSources);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // force initial paint then cycle
    if (Math.random() < 0.5) wrap.classList.add('show-b');
    else wrap.classList.remove('show-b');
    wrap.classList.add('logo-enter');
    // smoother crossfade handled in CSS (1.2s)
    setInterval(() => {
      wrap.classList.toggle('show-b');
    }, 6000);
  })();





  // Rotating lore quotes with soft fade
  (function () {
    const el = document.getElementById('loreQuoteText');
    const cite = document.getElementById('loreQuoteCite');
    const loreWrap = document.getElementById('loreQuote');
    if (!el) return;
    const quotes = [
      { t: 'A pesar de su cruel personalidad, de ella nacía una innegable devoción por el mundo.', c: '', italic: false },
      { t: 'La humanidad sufrió cambios irreversibles, únicas en cada víctima, como si la voluntad de la reina se burlara en silencio de sus descendientes', c: '', italic: false },
      { t: 'A todo esto, ¿por qué tendría que disculparme con un ladrón?', c: '~Emiru', italic: false },
      { t: 'Difícil de asimilar, ¿no es así? Yo tuve una reacción parecida.', c: '~Mahiru', italic: false },
      { t: 'Si sus síntomas vuelven, ¿dónde se supone que busque ayuda?', c: '~Mahiru', italic: true },
      { t: '¿Un libro? Espera, ¿de dónde proviene esa luz?', c: '~Mahiru', italic: false },
      { t: '¿Y a ti qué te importa? Alguien como tú jamás podría entender cómo se sienten las personas', c: '~Emiru', italic: false },
      { t: 'Si realmente deseas superarte a ti misma, entonces podrás pasar la prueba', c: '~Aida', italic: true }
    ];
    let idx = Math.floor(Math.random() * quotes.length);
    function show(i) {
      var q = quotes[i];
      var body = q.italic ? ('<em>' + q.t + '</em>') : q.t;
      var attr = q.c ? (' ' + q.c) : '';
      el.innerHTML = '"' + body + '"' + attr;
      if (cite) {
        cite.textContent = '';
        cite.style.display = 'none';
      }
    }
    show(idx);
    setInterval(function () {
      if (loreWrap) loreWrap.classList.add('is-fading');
      setTimeout(function () {
        idx = (idx + 1) % quotes.length;
        show(idx);
        if (loreWrap) loreWrap.classList.remove('is-fading');
      }, 450);
    }, 8000);
  })();


  // Theater mode — fixed FAB above footer, never moves
  (function () {
    var btn = document.getElementById('theaterToggle');
    if (!btn) return;
    // Detach from flow so nothing in the page can reposition it
    if (btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    }
    btn.className = 'theater-fab theater-fixed';
    btn.style.bottom = 'calc(var(--footer-h, 56px) + 36px)';
    btn.setAttribute('type', 'button');
    function syncLabel() {
      var on = document.body.classList.contains('theater-mode');
      btn.innerHTML = on ? '<span aria-hidden="true">✕</span> Salir' : '<span aria-hidden="true">🎭</span> Teatro';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    syncLabel();
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var on = !document.body.classList.contains('theater-mode');
      if (on) {
        document.body.classList.remove('theater-exiting');
        document.body.classList.add('theater-mode');
      } else {
        document.body.classList.add('theater-exiting');
        document.body.classList.remove('theater-mode');
        setTimeout(function () { document.body.classList.remove('theater-exiting'); }, 420);
      }
      syncLabel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('theater-mode')) {
        document.body.classList.remove('theater-mode');
        syncLabel();
      }
    });
  })();





  // Halloween CSS decorations (no emoji)
  (function () {
    if (document.querySelector('.hw-deco')) return;
    var frag = document.createDocumentFragment();
    [
      ['hw-deco hw-pumpkin hw-p1',''],['hw-deco hw-pumpkin hw-p2',''],
      ['hw-deco hw-web',''],
      ['hw-float candy-corn f1',''],['hw-float lolli f2',''],['hw-float ghost f3',''],
      ['hw-float mini-pump f4',''],['hw-float candy-corn f5',''],['hw-float lolli f6',''],
      ['hw-float mini-pump f7',''],['hw-float ghost f8',''],
      ['hw-float candy-corn f9',''],['hw-float lolli f10',''],['hw-float ghost f11',''],
      ['hw-float mini-pump f12',''],['hw-float candy-corn f13',''],['hw-float lolli f14',''],
      ['hw-float star f15',''],['hw-float star f16','']
    ].forEach(function (row) {
      var el = document.createElement('div');
      el.className = row[0];
      el.setAttribute('aria-hidden', 'true');
      frag.appendChild(el);
    });
    document.body.appendChild(frag);
  })();

  // ---- Sidebar only (no top menu) ----
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  let backdrop = document.getElementById('sidebarBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebarBackdrop';
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function setBackdrop(open) {
    if (!backdrop) return;
    if (open && window.innerWidth <= 900) {
      backdrop.classList.add('visible');
    } else {
      backdrop.classList.remove('visible');
    }
  }

  function closeSidebar() {
    if (menuToggle) {
      menuToggle.classList.remove('active');
      menuToggle.classList.remove('is-open');
    }
    if (sidebar) {
      sidebar.classList.remove('expanded');
      sidebar.classList.remove('mobile-open');
    }
    document.body.classList.remove('sidebar-open');
    setBackdrop(false);
  }

  const SIDEBAR_KEY = 'wh-sidebar-open';
  function openSidebar() {
    if (!sidebar || !menuToggle) return;
    menuToggle.classList.add('active');
    menuToggle.classList.add('is-open');
    if (window.innerWidth > 900) {
      sidebar.classList.add('expanded');
      sidebar.classList.remove('mobile-open');
      document.body.classList.add('sidebar-open');
      setBackdrop(false);
    } else {
      sidebar.classList.add('mobile-open');
      sidebar.classList.remove('expanded');
      document.body.classList.add('sidebar-open');
      setBackdrop(true);
    }
    try { sessionStorage.setItem(SIDEBAR_KEY, '1'); } catch (e) {}
  }
  function closeSidebarManual() {
    closeSidebar();
    try { sessionStorage.setItem(SIDEBAR_KEY, '0'); } catch (e) {}
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = sidebar && (sidebar.classList.contains('expanded') || sidebar.classList.contains('mobile-open'));
      if (open) {
        closeSidebarManual();
      } else {
        openSidebar();
        if (window.spawnBurst) {
          const rect = menuToggle.getBoundingClientRect();
          window.spawnBurst(rect.left + 24, rect.top + 24, 10);
        }
      }
    });
  }
  try {
    if (sessionStorage.getItem(SIDEBAR_KEY) === '1' && window.innerWidth > 900) openSidebar();
  } catch (e) {}

  backdrop.addEventListener('click', closeSidebarManual);

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 900) return;
    if (!menuToggle || !menuToggle.classList.contains('active')) return;
    if (sidebar && sidebar.contains(e.target)) return;
    if (menuToggle.contains(e.target)) return;
    closeSidebarManual();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && sidebar) {
      sidebar.classList.remove('mobile-open');
      setBackdrop(false);
    }
  });

  // ---- Parallax layers ----
  (function () {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || !window.matchMedia('(pointer: fine)').matches) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    (function tick() {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      layers.forEach(el => {
        const d = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        el.style.transform = 'translate3d(' + (cx * d * 40) + 'px,' + (cy * d * 30) + 'px,0)';
      });
      requestAnimationFrame(tick);
    })();
  })();

  // ---- BH particle pull ----
  (function () {
    const bh = document.querySelector('.blackhole-container');
    if (!bh) return;
    window.__bhPull = { active: false, cx: 0, cy: 0, strength: 0 };
    window.addEventListener('mousemove', (e) => {
      const r = bh.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = Math.max(r.width, r.height) * 1.5;
      const strength = Math.max(0, 1 - dist / radius);
      window.__bhPull = { active: strength > 0.05, cx, cy, strength };
    }, { passive: true });
  })();


  // Close mobile sidebar when navigating
  document.querySelectorAll('.side-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 900) {
        try { sessionStorage.setItem('wh-sidebar-open', '0'); } catch (e) {}
        if (typeof closeSidebar === 'function') closeSidebar();
        else {
          var sb = document.getElementById('sidebar');
          var mt = document.getElementById('menuToggle');
          var bd = document.getElementById('sidebarBackdrop');
          if (sb) { sb.classList.remove('mobile-open', 'expanded'); }
          if (mt) mt.classList.remove('active');
          if (bd) bd.classList.remove('visible');
          document.body.classList.remove('sidebar-open');
        }
      }
    });
  });


  // Aero bubble interaction — soft magnetic orbit
  (function () {
    var orbs = document.querySelectorAll('.floating-orbs .orb');
    if (!orbs.length) return;
    var mx = -9999, my = -9999;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });
    (function tick() {
      var t = html.getAttribute('data-theme') || '';
      if (t === 'aero' || t === 'aero-light') {
        orbs.forEach(function (orb, i) {
          var r = orb.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = mx - cx, dy = my - cy;
          var d = Math.sqrt(dx * dx + dy * dy) || 1;
          var max = 280;
          if (d < max) {
            var pull = (1 - d / max) * 18 * (i % 2 === 0 ? 1 : -0.6);
            var ang = Math.atan2(dy, dx) + (i * 0.4);
            orb.style.translate = (Math.cos(ang) * pull) + 'px ' + (Math.sin(ang) * pull * 0.85) + 'px';
            orb.style.scale = String(1 + (1 - d / max) * 0.08);
          } else {
            orb.style.translate = '0px 0px';
            orb.style.scale = '1';
          }
        });
      }
      requestAnimationFrame(tick);
    })();
  })();

  // ---- Cursor glow ----
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let gx = -999, gy = -999;
    let tx = -999, ty = -999;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    function animGlow() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      cursorGlow.style.left = gx + 'px';
      cursorGlow.style.top = gy + 'px';
      requestAnimationFrame(animGlow);
    }
    animGlow();
  }

  // ---- Particles ----
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;
  let mouse = { x: -999, y: -999 };
  let animId;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function themeParticleHue() {
    const t = html.getAttribute('data-theme') || 'dark';
    const map = { dark: [190,210,230], void: [250,260,280], ember: [10,20,30], abyss: [160,175,190], aero: [190,200,210], halloween: [20,30,280], light: [200,215,230], dawn: [20,30,40], aurora: [260,275,290], mist: [160,170,180], 'aero-light': [190,205,215] };
    const arr = map[t] || map.dark;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function createParticle(x, y, burst = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? 1.2 + Math.random() * 3.5 : 0.12 + Math.random() * 0.35;
    // hues: cyan, blue, violet, teal, amber — NO pink
    const hues = [themeParticleHue()];
    return {
      x: x ?? Math.random() * w,
      y: y ?? Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: burst ? 1.8 + Math.random() * 2.8 : 0.5 + Math.random() * 1.5,
      life: burst ? 35 + Math.random() * 45 : 180 + Math.random() * 280,
      maxLife: burst ? 90 : 460,
      hue: hues[Math.floor(Math.random() * hues.length)],
      burst,
      spin: (Math.random() - 0.5) * 0.08
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(220, Math.floor((w * h) / 7000) + 80);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function spawnBurst(x, y, n = 20) {
    for (let i = 0; i < n; i++) {
      particles.push(createParticle(x, y, true));
    }
  }
  window.spawnBurst = spawnBurst;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const tnow = html.getAttribute('data-theme') || 'dark'; const isLight = !!(LIGHT && LIGHT[tnow]) || tnow === 'light';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vx += p.spin * 0.02;
      p.vy += p.spin * 0.02;

      if (p.burst) {
        p.vx *= 0.95;
        p.vy *= 0.95;
      } else {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 220) {
          p.vx += (dx / dist) * 0.045;
          p.vy += (dy / dist) * 0.045;
        }
        const pull = window.__bhPull;
        const storming = document.body.classList.contains('bh-storm-active');
        if (pull && (pull.active || storming)) {
          if (storming) {
            pull.active = true;
            pull.strength = Math.max(pull.strength || 0, 1);
          }
          const pdx = pull.cx - p.x, pdy = pull.cy - p.y;
          const pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
          const force = pull.strength * 0.55 * (1 - Math.min(1, pd / 560));
          p.vx += (pdx / pd) * force;
          p.vy += (pdy / pd) * force;
          if (pd < 28 + pull.strength * 40) {
            particles[i] = createParticle();
            continue;
          }
        }
        p.vx *= 0.992;
        p.vy *= 0.992;
      }

      if (p.life <= 0 || p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) {
        if (p.burst) particles.splice(i, 1);
        else particles[i] = createParticle();
        continue;
      }

      const alpha = Math.min(1, p.life / (p.maxLife * 0.28)) * (isLight ? 0.4 : 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 85%, ${isLight ? 48 : 72}%, ${alpha})`;
      ctx.fill();

      // soft outer glow
      if (p.r > 1.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.15})`;
        ctx.fill();
      }
    }

    // connections
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        if (a.burst || b.burst) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.strokeStyle = `hsla(210, 70%, 65%, ${0.14 * (1 - d / 100) * (isLight ? 0.55 : 1)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  // Click ripple bursts
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .anime-card, .modal-content')) return;
    spawnBurst(e.clientX, e.clientY, 8);
  });

  resize();
  initParticles();
  draw();
})();

;(function(){
  function tagTitle(){
    document.querySelectorAll('.site-title .title-glow, .site-title .title-hole').forEach(function (el) {
      el.setAttribute('data-text', el.textContent.trim());
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagTitle);
  else tagTitle();
})();

;(function(){
  if (document.querySelector('.reader-main')) {
    document.body.classList.add('wh-reader-page');
  }
})();
