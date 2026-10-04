/* WHITE HOLE — Infinite carousel (scroll-based, high performance) */
(function () {
  'use strict';

  var track = document.getElementById('carouselTrack');
  var wrapper = document.getElementById('carouselWrapper');
  if (!track || !wrapper) return;

  var setW = 0;
  var x = 0;
  var dragging = false;
  var moved = false;
  var startPX = 0;
  var startX = 0;
  var lastPX = 0;
  var lastT = 0;
  var vel = 0;
  var autoId = 0;
  var momId = 0;
  var resumeT = 0;
  var ready = false;
  var reduced = false;
  var AUTO = 0.5;
  var RESUME = 10000;

  track.style.willChange = 'transform';
  track.style.backfaceVisibility = 'hidden';

  function orig() {
    return Array.prototype.slice.call(track.querySelectorAll('.anime-card:not(.is-clone)'));
  }

  function apply() {
    track.style.transform = 'translate3d(' + x + 'px,0,0)';
  }

  function norm() {
    if (!ready || setW <= 0) return;
    // Map into [-setW, 0)
    if (x <= -setW || x > 0) {
      x = ((x % setW) + setW) % setW;
      if (x > 0) x -= setW;
      if (x <= -setW) x = 0;
    }
  }

  function cloneNode(src) {
    var c = src.cloneNode(true);
    c.classList.add('is-clone');
    c.setAttribute('aria-hidden', 'true');
    var imgs = c.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].removeAttribute('loading');
      imgs[i].draggable = false;
    }
    return c;
  }

  function measureSet(cards) {
    if (!cards.length) return 0;
    var gap = 16;
    try {
      var st = getComputedStyle(track);
      gap = parseFloat(st.columnGap || st.gap) || 16;
    } catch (e) {}
    var w = 0;
    for (var i = 0; i < cards.length; i++) {
      w += cards[i].offsetWidth;
      w += gap;
    }
    return w;
  }

  function build() {
    var clones = track.querySelectorAll('.anime-card.is-clone');
    for (var i = 0; i < clones.length; i++) clones[i].parentNode.removeChild(clones[i]);

    var cards = orig();
    if (!cards.length) { ready = false; return; }

    // Ensure fixed card widths for stable loop
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.flex = '0 0 auto';
    }

    void track.offsetWidth;
    setW = measureSet(cards);
    if (setW < 100) { ready = false; return; }

    // Prepend 1 full set
    for (var i = cards.length - 1; i >= 0; i--) {
      track.insertBefore(cloneNode(cards[i]), track.firstChild);
    }
    // Append 2 full sets
    for (var r = 0; r < 2; r++) {
      for (var j = 0; j < cards.length; j++) {
        track.appendChild(cloneNode(cards[j]));
      }
    }

    x = -setW;
    apply();
    ready = true;
  }

  function stopAuto() {
    if (autoId) { cancelAnimationFrame(autoId); autoId = 0; }
  }
  function stopMom() {
    if (momId) { cancelAnimationFrame(momId); momId = 0; }
  }

  function autoTick() {
    if (dragging || momId || document.hidden) { autoId = 0; return; }
    x -= AUTO;
    if (x <= -setW) x += setW;
    apply();
    autoId = requestAnimationFrame(autoTick);
  }
  function startAuto() {
    stopAuto();
    if (!ready || reduced) return;
    autoId = requestAnimationFrame(autoTick);
  }
  function scheduleResume() {
    clearTimeout(resumeT);
    resumeT = setTimeout(function () {
      if (!dragging) startAuto();
    }, RESUME);
  }

  function px(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onDown(e) {
    dragging = true;
    moved = false;
    stopAuto();
    stopMom();
    wrapper.classList.add('dragging');
    startPX = px(e);
    startX = x;
    lastPX = startPX;
    lastT = performance.now();
    vel = 0;
  }
  function onMove(e) {
    if (!dragging) return;
    var p = px(e);
    if (Math.abs(p - startPX) > 4) moved = true;
    if (e.cancelable && moved) e.preventDefault();
    x = startX + (p - startPX);
    // Lightweight normalize during drag
    if (x <= -setW) {
      x += setW;
      startX += setW;
    } else if (x > 0) {
      x -= setW;
      startX -= setW;
    }
    apply();
    var now = performance.now();
    var dt = now - lastT;
    if (dt > 8) {
      vel = (p - lastPX) / dt;
      lastPX = p;
      lastT = now;
    }
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    wrapper.classList.remove('dragging');
    function coast() {
      vel *= 0.94;
      if (Math.abs(vel) < 0.015) {
        momId = 0;
        norm();
        apply();
        scheduleResume();
        return;
      }
      x += vel * 16;
      if (x <= -setW) x += setW;
      else if (x > 0) x -= setW;
      apply();
      momId = requestAnimationFrame(coast);
    }
    momId = requestAnimationFrame(coast);
  }

  track.addEventListener('click', function (e) {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    var card = e.target.closest('.anime-card');
    if (!card || !card.classList.contains('is-clone')) return;
    var id = card.getAttribute('data-id');
    if (!id) return;
    var o = track.querySelector('.anime-card:not(.is-clone)[data-id="' + id + '"]');
    if (o) {
      e.preventDefault();
      e.stopPropagation();
      o.click();
    }
  }, true);

  wrapper.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove, { passive: false });
  window.addEventListener('mouseup', onUp);
  wrapper.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);

  track.querySelectorAll('img').forEach(function (img) {
    img.draggable = false;
    img.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  function boot() {
    build();
    if (ready) startAuto();
  }

  var pending = 0;
  orig().forEach(function (card) {
    var img = card.querySelector('img');
    if (img && !img.complete) {
      pending++;
      img.addEventListener('load', function () { if (--pending <= 0) boot(); });
      img.addEventListener('error', function () { if (--pending <= 0) boot(); });
    }
  });
  if (pending === 0) requestAnimationFrame(function () { requestAnimationFrame(boot); });

  window.addEventListener('load', boot);
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var ratio = setW ? x / setW : -1;
      build();
      x = ratio * setW;
      norm();
      apply();
    }, 120);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto();
    else if (!dragging) scheduleResume();
  });


  const animeData = {
    bocchi: {
      title: 'Bocchi the Rock!',
      tags: ['Comedia', 'Música', 'Slice of Life', '2022'],
      password: 'sphinxanimehd',
      links: [
        { label: 'Season 1', url: 'https://drive.google.com/drive/folders/1ArF3NDcAcrV3XSi-OHt8y6iruMXENEd7' }
      ]
    },
    rezero: {
      title: 'Re:Zero kara Hajimeru Isekai Seikatsu',
      tags: ['Isekai', 'Drama', 'Fantasía', 'Suspense'],
      password: 'sphinxanimehd',
      links: [
        { label: 'S1 Director\'s Cut (1-10)', url: 'https://www.mediafire.com/folder/274e9e22vv9ly/Re+Zero+Director\'s+Cut+(1080p)' },
        { label: 'S1 Director\'s Cut (11-13)', url: 'https://www.mediafire.com/folder/z1dt2zud5krz2/Re+Zero+Director\'s+Cut+11+-+13+(1080p)' },
        { label: 'OVA Prequel', url: 'https://drive.google.com/drive/folders/1e9iBZbAqApC5fVakTVZyJqa6xEtkUrOl' },
        { label: 'OVA Pre-Arc 3', url: 'https://drive.google.com/drive/folders/1E_ENtunFxFKHMVJcTawesvTI8PpXXHK7', note: 'dengeki-plus' },
        { label: 'Season 2 (1-17)', url: 'https://www.mediafire.com/folder/rppaez51ziznj/Re+Zero+Kara+Hajimeru+Isekai+Seikatsu+S2' },
        { label: 'Season 2 (18-25)', url: 'https://www.mediafire.com/folder/tmw81tzhybbi0/Re+Zero+Kara+Hajimeru+Isekai+Seikatsu+S2+(18-)' },
        { label: 'Season 3 (1-12)', url: 'https://www.mediafire.com/folder/hsx9aif3hitfd/Re+Zero+Kara+Hajimeru+Isekai+Seikatsu+3rd+Season+(1080p)' },
        { label: 'Season 3 (13-16)', url: 'https://www.mediafire.com/folder/zgcr9ytnidtng/Re+Zero+Kara+Hajimeru+Isekai+Seikatsu+3rd+Season+(1080p,+13+-+16)' },
        { label: 'Break Time S1-Petit', url: 'https://youtu.be/IKAZ2eOwwUg' },
        { label: 'Break Time S2', url: 'https://drive.google.com/drive/folders/1GhPgADMuhopAK5sGZ_gE0q1sQiFQL4Lc' },
        { label: 'Break Time S3', url: 'https://drive.google.com/drive/folders/1ZXIhoe2ZMKIFzn90ijsh_cmQzR-oPfJu' },
        { label: 'Season 4 & Break Time', url: 'https://hoshinofuruki.blogspot.com/p/proyectos.html' },
        { label: 'S4 Drive', url: 'https://drive.google.com/drive/u/1/folders/1v1-rR42n0R4ybJinGygE2m2yYmfU4yYd' }
      ]
    },
    shana: {
      title: 'Shakugan no Shana',
      tags: ['Acción', 'Fantasía', 'Romance', '2005'],
      password: 'sphinxanimehd',
      links: [
        { label: 'Season 1', url: 'https://drive.google.com/drive/folders/1pp1m9b30fQ6Y5dhn4Zkx7BHATnsHdKQu' },
        { label: 'Season 2 (1-14)', url: 'https://drive.google.com/drive/folders/1kfU5sfYdpKCkKp4Oew7wXgeMgyHL1ZtR' },
        { label: 'Season 2 (15-24)', url: 'https://drive.google.com/drive/folders/1P4k8i_ZIz3TNGB7rwdC6oorZ6WXGB878' },
        { label: 'Movie', url: 'https://drive.google.com/drive/folders/1wyX-yQwpBzsB0Kv4rN70v8DC8LEP02uM' },
        { label: 'Season 3 (1-11)', url: 'https://drive.google.com/drive/folders/1ctM4Ttf1bdXWhJZl57TdvoURMSQAp2o-' },
        { label: 'Season 3 (12-21)', url: 'https://drive.google.com/drive/folders/19pCRknobSpqnFmrAISKfmEAFP7GTQOZ5' },
        { label: 'Season 3 (22-24)', url: 'https://drive.google.com/drive/folders/1FtBAc8hgIsAU_akldcE_IvySd2sSoa-6' }
      ]
    },
    fate: {
      title: 'Fate Series',
      tags: ['Acción', 'Fantasía', 'Sobrenatural', 'Franchise'],
      password: 'sphinxanimehd',
      links: [
        { label: 'Fate/Zero S1-1', url: 'https://drive.google.com/drive/folders/1byUMN_ykbjmhfKdK84NIuV086L-gYMMN' },
        { label: 'Fate/Zero S1-2', url: 'https://drive.google.com/drive/folders/1921rXEOi5xxwR-FpRDMIh2uPfjZWwuBS' },
        { label: 'Fate/Zero S2-1', url: 'https://drive.google.com/drive/folders/1fRN3YqYIzcrm0NlDX91bLar3qbNOEMVr' },
        { label: 'Fate/Zero S2-2', url: 'https://drive.google.com/drive/folders/1_2y3sW2KLeExfpbLOc0Hu1ESpm_3V-uK' },
        { label: 'Lord El-Melloi II', url: 'https://bz.beatz-anime.net/Zero-Anime%20mp4/[Z-A]%20Fate/[Z-A]%20Lord%20El-Melloi%20II%20Sei%20no%20Jikenbo%20Rail%20Zeppelin%20Grace%20Note' },
        { label: 'FSN 2006 pt1', url: 'https://drive.google.com/drive/folders/1S9cFG9gDA8vuLc7vdsbdBeSJQGbmb2bp', note: 'dengeki-plus' },
        { label: 'FSN 2006 pt2', url: 'https://drive.google.com/drive/folders/1xc9JbYMoXeFh4YkJhGJ0touADXx2wNbL', note: 'dengeki-plus' },
        { label: 'UBW pt1', url: 'https://drive.google.com/drive/folders/1MexiyeS7rDTVG06Xv1AGwFzgytWRgneV' },
        { label: 'UBW pt2', url: 'https://drive.google.com/drive/folders/1-hUTIbtYZZBGng8laBtTUSmiiGIn9Jt4' },
        { label: "Heaven's Feel 1", url: 'https://drive.google.com/drive/folders/1aFOh4Lsy3uDRvvoN6qOn8m6EXM9y3dWP' },
        { label: "Heaven's Feel 2", url: 'https://mega.nz/folder/CPRyiBoT#iQKQ03nFfHvXYJhRazVafw' },
        { label: "Heaven's Feel 3", url: 'https://drive.google.com/drive/folders/14Tu7BvDisZCv3NVpL9cAsvy-Jt6VOFs3' },
        { label: 'Carnival Phantasm', url: 'https://todo-anime.net/animes?q=carnival' },
        { label: 'Prisma Illya S1 + SP', url: 'https://paste.japan-paw.net/?v=4644' },
        { label: 'Prisma Illya 2wei! + SP', url: 'https://paste.japan-paw.net/?v=4645' },
        { label: 'Prisma Illya 2wei Herz! + SP', url: 'https://paste.japan-paw.net/?v=4646' },
        { label: 'Prisma Illya 3rei!! + SP', url: 'https://paste.japan-paw.net/?v=6584' },
        { label: 'Prisma Illya otros SP', url: 'https://todo-anime.net/animes?tipo%5B%5D=2&tipo%5B%5D=4&order=created&q=kaleid+liner' },
        { label: 'Sekka no Chikai', url: 'https://mega.nz/file/ZCQwCSpZ#bma1B1HLJhc5vyJOuYf4igW14W_IjZ4krjXXagPn3rY' },
        { label: 'Sekka no Chikai SP', url: 'https://todo-anime.net/ver/6986/fate-kaleid-liner-prisma-illya-movie-sekka-no-chikai-special/episodio-1' },
        { label: 'Licht Namae no Nai Shoujo', url: 'https://mega.nz/folder/V2wCwAJZ#O75N2Bvgd1hANkTciaSfwQ' },
        { label: 'Fate/Apocrypha', url: 'https://t.me/joinchat/AAAAAEhU4xHEqGqq6fdYTg' },
        { label: 'Last Encore 1-12', url: 'https://drive.google.com/drive/folders/1q1bkZcYV9s-rSJX8HpNmUfX66uJsY4pd' },
        { label: 'Last Encore 13', url: 'https://drive.google.com/drive/folders/1DUt-PYolnnU2skN2W9TkT7Y70Zt6c6RS' },
        { label: "Emiya Family", url: 'https://bz.beatz-anime.net/Zero-Anime%20mp4/[Z-A]%20Fate/[Z-A]%20Emiya-san%20Chi%20no%20Kyou%20no%20Gohan' },
        { label: 'FGO First Order', url: 'https://drive.google.com/drive/folders/1mhS2KmOjE0H_fbtq7O_dECN7oh8j9zQN' },
        { label: 'FGO Moonlight/Lostroom', url: 'https://drive.google.com/drive/folders/18xOs0RG2Biu2PDkHcP4AKPmLX8BtWgOB' },
        { label: 'FGO Babylonia Initium', url: 'https://mega.nz/folder/C7QynYBK#3LPNsBPbaODpsQpyoBrKog' },
        { label: 'FGO Babylonia', url: 'https://www.mediafire.com/folder/b9ud1ci78wix0/%5BDragoniwa%5D_Fate_Grand_Order_Zettai_Majuu_Sensen_Babylonia_%5BBD%5D' },
        { label: 'FGO Camelot 1', url: 'https://drive.google.com/drive/folders/1vaMEyy0nDU_aPIdYn5xNxtZA7l7_ihC_' },
        { label: 'FGO Camelot 2', url: 'https://drive.google.com/drive/folders/1kBQAqU3NgPYabc60EtJxB8J3C0H2DOIQ' },
        { label: 'FGO Solomon', url: 'https://drive.google.com/drive/folders/10WkQzI0Pfa2gs9z6QjhwRUbrGPwzWtSu' },
        { label: 'Strange Fake Whispers', url: 'https://bz.beatz-anime.net/Zero-Anime%20mp4/[Z-A]%20Fate/[Z-A]%20Fate%20strange%20Fake/[Z-A]%20Fate%20strange%20Fake%20-Whispers%20of%20Dawn-%20(2023)%20(WEB%201080p)%20MP4' },
        { label: 'Strange Fake (Próximamente)', url: '#', disabled: true }
      ]
    },
    monogatari: {
      title: 'Monogatari Series',
      tags: ['Misterio', 'Sobrenatural', 'Drama', 'Franchise'],
      password: 'sphinxanimehd',
      links: [
        { label: 'Bakemonogatari 1-9', url: 'https://drive.google.com/drive/folders/1Yj9mxgUOHT3BLSzmOgcsTCJFMJb0PdPK' },
        { label: 'Bakemonogatari 10-15', url: 'https://drive.google.com/drive/folders/1VtK8QvHthX_PZk8WtPXdmJTj079tzjXd' },
        { label: 'Nisemonogatari', url: 'https://drive.google.com/drive/folders/1K1X6Ax-G2Dvu2dNlr7xlF9FXNqy87EYA' },
        { label: 'Nekomonogatari (Kuro)', url: 'https://drive.google.com/drive/folders/1_Lt7u7AY7PuybgstOPBwe_dd_pjJI_kr' },
        { label: 'Nekomonogatari (Shiro)', url: 'https://drive.google.com/drive/folders/10srqb0k9VNoHstrKRZiuzclFK50r-GEk' },
        { label: 'Kabukimonogatari', url: 'https://drive.google.com/drive/folders/1O9wqn7V6bPtWrFIqjn_6XSA26PrDa-0P' },
        { label: 'Otorimonogatari', url: 'https://drive.google.com/drive/folders/1mrXYCq01Coslw9TdKDwT5PxyZT0m_PjP' },
        { label: 'Onimonogatari', url: 'https://drive.google.com/drive/folders/1OmP1SwZSSvlrQiNAbGGblaQps7HxVGaE' },
        { label: 'Koimonogatari', url: 'https://drive.google.com/drive/folders/13ROtiz3jktmY_Hn__5rlbnA-vbLp9TmQ' },
        { label: 'Hanamonogatari', url: 'https://drive.google.com/drive/folders/1b6IZTAHrnDc8MfF9BRAGUzVbmO7tbt0l' },
        { label: 'Tsukimonogatari', url: 'https://drive.google.com/drive/folders/1dwD8K8qYoqgJB4owhtjC1OjR3Ge-APKD' },
        { label: 'Owarimonogatari S1 (1-11)', url: 'https://drive.google.com/drive/folders/11f65Hh3MPSYgsftM1ZKALhnQE9pE8SdH' },
        { label: 'Owarimonogatari S1 (12-13)', url: 'https://drive.google.com/drive/folders/1G66Y0o7u5vjhpXHaALgId3J8EEmUCAt9' },
        { label: 'Kizu Tekketsu', url: 'https://drive.google.com/drive/folders/1vk_ckeXBRxZypWuwm5INVdBDXBHPEq_9' },
        { label: 'Kizu Nekketsu', url: 'https://drive.google.com/drive/folders/1eTsqaaj7ISHMSTTsGZK27iFU1axR7lLy' },
        { label: 'Kizu Reiketsu', url: 'https://drive.google.com/drive/folders/14QUzvEkeAWIVLeoKEJLhIhpUbURPlbGv' },
        { label: 'Koyomimonogatari', url: 'https://drive.google.com/drive/folders/1GGMDasRpSEg5y58hM13IvyJ8F7gK6qP5' },
        { label: 'Owarimonogatari S2', url: 'https://drive.google.com/drive/folders/1NF7s4xODaP3uZZxKWOnIIHqsaWvSK5hz' },
        { label: 'Zoku Owari 1-3', url: 'https://drive.google.com/drive/folders/1DuxM-oFimJKXlXoSz0UpkYrU7kgdeTxs' },
        { label: 'Zoku Owari 4-6', url: 'https://drive.google.com/drive/folders/12uqDwzVDAr1qS14t17baf-_r2SAzvvqO' },
        { label: 'Off & Monster Season', url: 'https://todo-anime.net/anime/4753/monogatari-series-off-monster-season' }
      ]
    },
    umamusume: {
      title: 'Uma Musume: Pretty Derby',
      tags: ['Deportes', 'Música', 'Comedia', '2021'],
      links: [
        { label: 'Cinderella Gray pt1', url: 'https://paste.japan-paw.net/?v=6857' },
        { label: 'Cinderella Gray pt2', url: 'https://paste.japan-paw.net/?v=7654' },
        { label: 'Season 1', url: 'https://www.fireload.com/folder/ef9f93c46167ff6e7e9e72452d538784/SphinxAnime_UM4-MUSU-S1' },
        { label: 'BNW no Chikai + Umayon', url: 'https://www.fireload.com/folder/e648161503a6add7e06dcc002a1f294a/SphinxAnime_UM4-MUSU-S1-SP3C1' },
        { label: 'Season 2', url: 'https://www.fireload.com/folder/f385f43cbff4c146df28478b109bc62c/SphinxAnime_UM4-MUSU-S2' },
        { label: 'Season 3', url: 'https://paste.japan-paw.net/?v=2309' },
        { label: 'Shin Jidai no Tobira', url: 'https://www.fireload.com/folder/t5EOfETKHwZ71vpebbrBDOGyR6KWskC7/UM4MUSM3PD-SHINJIDAI-M0V' },
        { label: 'Road to the Top', url: 'https://www.fireload.com/folder/K6JtAJ2NeCxqk4AedNgvieIo8Pyaqg6Z/UM4MUSU-R04DT0PMOV' },
        { label: 'Umayuru', url: 'https://www.jkanime.net/umayuru-pretty-gray/' }
      ]
    },
    seraph: {
      title: 'Owari no Seraph',
      tags: ['Acción', 'Drama', 'Vampiros', '2015'],
      password: 'sphinxanimehd',
      links: [
        { label: 'Season 1', url: 'https://drive.google.com/drive/folders/1L7jigxXQKWv_RJT0ReK9InbT9jZ9JZbS' },
        { label: 'Season 2', url: 'https://drive.google.com/drive/folders/1CXJbOotQ-_kFInpl5OEtzzdlJGeHTd93' }
      ]
    }
  };

  let currentAnimeId = null;
  // Keys pre-seed placeholder
  const revealedKeys = new Set(JSON.parse(sessionStorage.getItem('wh-revealed-keys') || '[]'));

  function persistRevealed() {
    try { sessionStorage.setItem('wh-revealed-keys', JSON.stringify([...revealedKeys])); } catch (e) {}
  }

  // Pre-reveal all anime keys
  Object.keys(animeData).forEach(id => {
    if (animeData[id].password) revealedKeys.add(id);
  });
  persistRevealed();

  function renderDownloads(data) {
    if (!modalDownloads) return;
    modalDownloads.innerHTML = '';
    const links = data.links || [];
    if (!links.length) {
      const empty = document.createElement('p');
      empty.className = 'download-empty';
      empty.textContent = 'Enlaces próximamente.';
      modalDownloads.appendChild(empty);
      return;
    }
    links.forEach((item) => {
      if (item.disabled || item.url === '#') {
        const span = document.createElement('span');
        span.className = 'dl-chip is-soon';
        span.textContent = item.label;
        modalDownloads.appendChild(span);
        return;
      }
      const a = document.createElement('a');
      a.className = 'dl-chip';
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = item.label + (item.note ? ' · ' + item.note : '');
      modalDownloads.appendChild(a);
    });
  }

  function openModal(card) {
    const id = card.dataset.id;
    currentAnimeId = id;
    const data = animeData[id] || { title: card.dataset.title, tags: ['Anime'], links: [] };
    const img = card.querySelector('img');

    modalImg.src = img.src;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalTags.innerHTML = (data.tags || []).map(t => '<span>' + t + '</span>').join('');

    renderDownloads(data);

    if (modalPasswordBtn) {
      if (data.password) {
        modalPasswordBtn.hidden = false;
        if (revealedKeys.has(id)) {
          modalPasswordBtn.classList.add('is-revealed');
          modalPasswordBtn.querySelector('span').textContent = data.password;
          modalPasswordBtn.title = 'Clave revelada';
        } else {
          modalPasswordBtn.classList.remove('is-revealed');
          modalPasswordBtn.querySelector('span').textContent = 'Ver clave';
          modalPasswordBtn.title = 'Ver clave de extraíbles';
        }
      } else {
        modalPasswordBtn.hidden = true;
        modalPasswordBtn.classList.remove('is-revealed');
      }
    }

    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    if (window.spawnBurst) {
      const rect = card.getBoundingClientRect();
      window.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    }
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  track.querySelectorAll('.anime-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (Math.abs(velX) > 0.3 || Math.abs(currentX - scrollLeft) > 8) return;
      openModal(card);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
  });

  if (modalPasswordBtn) {
    modalPasswordBtn.addEventListener('click', () => {
      const data = animeData[currentAnimeId];
      if (!data || !data.password) return;
      const span = modalPasswordBtn.querySelector('span');
      // Once revealed, stay revealed
      if (modalPasswordBtn.classList.contains('is-revealed')) return;
      modalPasswordBtn.classList.add('is-revealed');
      span.textContent = data.password;
      modalPasswordBtn.title = 'Clave revelada';
      if (currentAnimeId) {
        revealedKeys.add(currentAnimeId);
        persistRevealed();
      }
    });
  }

  // ---- 3D Tilt on cards ----
  track.querySelectorAll('.anime-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('search-hidden')) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -12;
      const tiltY = (x - 0.5) * 12;
      card.style.transform = `translateY(-16px) scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---- Search filter ----
  const searchInput = document.getElementById('animeSearch');
  const searchClear = document.getElementById('searchClear');
  const searchCount = document.getElementById('searchCount');
  const cards = Array.from(track.querySelectorAll('.anime-card'));

  let emptyMsg = document.getElementById('carouselEmpty');
  if (!emptyMsg) {
    emptyMsg = document.createElement('div');
    emptyMsg.id = 'carouselEmpty';
    emptyMsg.className = 'carousel-empty';
    emptyMsg.textContent = 'No se encontraron animes con ese nombre.';
    wrapper.parentNode.insertBefore(emptyMsg, wrapper.nextSibling);
  }

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function applySearch() {
    const q = normalize(searchInput.value);
    let visible = 0;

    cards.forEach(card => {
      const title = normalize(card.dataset.title || card.querySelector('h3')?.textContent || '');
      const id = normalize(card.dataset.id || '');
      const match = !q || title.includes(q) || id.includes(q);
      card.classList.toggle('search-hidden', !match);
      if (match) visible++;
    });

    if (searchClear) searchClear.hidden = !q;
    if (searchCount) {
      if (q) {
        searchCount.textContent = visible === 0
          ? 'Sin resultados'
          : visible === 1
            ? '1 anime encontrado'
            : visible + ' animes encontrados';
        searchCount.classList.add('has-filter');
      } else {
        searchCount.textContent = '';
        searchCount.classList.remove('has-filter');
      }
    }

    emptyMsg.classList.toggle('visible', visible === 0 && q.length > 0);

    // reset carousel position after filter
    currentX = 0;
    track.style.transform = 'translateX(0)';
    velX = 0;
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        applySearch();
        searchInput.blur();
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }


  // Genre filter
  const genreToggle = document.getElementById('genreFilterToggle');
  const genrePanel = document.getElementById('genreFilterPanel');
  let activeGenre = 'all';

  if (genreToggle && genrePanel) {
    genreToggle.addEventListener('click', () => {
      genrePanel.classList.toggle('open');
    });
    genrePanel.querySelectorAll('.genre-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        genrePanel.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeGenre = chip.dataset.genre || 'all';
        applyGenreFilter();
      });
    });
  }

  function applyGenreFilter() {
    if (!track) return;
    track.querySelectorAll('.anime-card').forEach(card => {
      const id = card.dataset.id;
      const data = animeData[id];
      if (!data) return;
      const tags = data.tags || [];
      const show = activeGenre === 'all' || tags.some(tg => String(tg).toLowerCase().includes(String(activeGenre).toLowerCase()));
      card.classList.remove('filter-in', 'filter-out');
      if (show) {
        card.style.display = '';
        card.classList.remove('search-hidden');
        // force reflow then animate in
        void card.offsetWidth;
        card.classList.add('filter-in');
      } else {
        card.classList.add('filter-out');
        card.classList.add('search-hidden');
        setTimeout(() => {
          if (card.classList.contains('search-hidden')) card.style.display = 'none';
        }, 280);
      }
    });
  }

})();
