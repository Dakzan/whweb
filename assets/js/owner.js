(function () {
  'use strict';
  var img = document.getElementById('ownerAvatar');
  var wrap = document.getElementById('ownerAvatarWrap');
  var secretBtn = document.getElementById('ownerSecretBtn');
  if (!img) return;
  if (!wrap) wrap = img.parentElement;

  var html = document.documentElement;
  var NORMAL = '../assets/images/owner.png';
  var SECRET = '../assets/images/owner-secret.png';
  var eggOn = false;
  var uncovered = false;
  var prevTheme = 'mist';
  var taps = 0;
  var tapTimer = null;
  var holdT = null;
  var afkT = null;
  var AFK_MS = 4000;

  // Remove any leftover back-image clone
  if (wrap) {
    wrap.querySelectorAll('.owner-avatar-back').forEach(function (n) { n.remove(); });
  }
  img.src = NORMAL;

  function setTheme(id) {
    html.setAttribute('data-theme', id);
    try { localStorage.setItem('wh-theme', id); } catch (e) {}
    document.querySelectorAll('.theme-opt').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-theme') === id);
    });
  }

  function isEggTheme() {
    var t = html.getAttribute('data-theme') || '';
    return t === 'mist' || (eggOn && t === 'ember');
  }

  function updatePointer() {
    var allow = isEggTheme();
    img.style.pointerEvents = allow ? 'auto' : 'none';
    img.style.cursor = allow ? 'pointer' : 'default';
    if (wrap) {
      wrap.classList.toggle('egg-active', allow);
      wrap.style.pointerEvents = allow ? 'auto' : 'none';
    }
  }

  function resetAfk() {
    clearTimeout(afkT);
    if (!eggOn) return;
    afkT = setTimeout(fullReset, AFK_MS);
  }

  function fullReset() {
    if (!eggOn && !uncovered) return;
    eggOn = false;
    uncovered = false;
    clearTimeout(afkT);
    clearTimeout(holdT);
    setTheme(prevTheme || 'mist');
    img.classList.remove('owner-charging', 'owner-lid-open', 'owner-fade');
    if (wrap) wrap.classList.remove('lid-open', 'owner-awakened', 'show-secret');
    document.body.classList.remove('owner-awakened', 'owner-uncovered');
    img.src = NORMAL;
    if (secretBtn) secretBtn.hidden = true;
    updatePointer();
  }

  function activateEgg() {
    if (eggOn) return;
    eggOn = true;
    uncovered = false;
    prevTheme = html.getAttribute('data-theme') || 'mist';
    setTheme('ember');
    document.body.classList.add('owner-awakened');
    if (wrap) wrap.classList.add('owner-awakened');
    // Crossfade same img element (no clone)
    img.classList.add('owner-fade');
    setTimeout(function () {
      img.src = SECRET;
      img.classList.remove('owner-fade');
    }, 220);
    if (window.spawnBurst) {
      var r = img.getBoundingClientRect();
      window.spawnBurst(r.left + r.width / 2, r.top + r.height / 2, 20);
    }
    updatePointer();
    resetAfk();
  }

  function uncoverLid() {
    if (!eggOn || uncovered) return;
    uncovered = true;
    img.classList.add('owner-lid-open');
    if (wrap) wrap.classList.add('lid-open');
    document.body.classList.add('owner-uncovered');
    if (secretBtn) {
      secretBtn.hidden = false;
      secretBtn.removeAttribute('hidden');
    }
    if (window.spawnBurst) {
      var r = (wrap || img).getBoundingClientRect();
      window.spawnBurst(r.left + r.width / 2, r.top + r.height / 2, 14);
    }
    resetAfk();
  }

  updatePointer();
  new MutationObserver(updatePointer).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  img.addEventListener('click', function (e) {
    if (!isEggTheme()) { e.preventDefault(); return; }
    resetAfk();
    if (eggOn) return;
    if (html.getAttribute('data-theme') !== 'mist') return;
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(function () { taps = 0; }, 800);
    if (taps >= 4) {
      taps = 0;
      activateEgg();
    }
  });

  img.addEventListener('pointerdown', function () {
    if (!isEggTheme()) return;
    resetAfk();
    if (!eggOn || uncovered) return;
    if (html.getAttribute('data-theme') !== 'ember') return;
    img.classList.add('owner-charging');
    holdT = setTimeout(function () {
      img.classList.remove('owner-charging');
      uncoverLid();
    }, 2000);
  });
  function cancelHold() {
    clearTimeout(holdT);
    img.classList.remove('owner-charging');
  }
  img.addEventListener('pointerup', cancelHold);
  img.addEventListener('pointerleave', cancelHold);
  img.addEventListener('pointercancel', cancelHold);

  if (secretBtn) {
    secretBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      resetAfk();
      window.location.href = secretBtn.getAttribute('data-href') || 'secret.html';
    });
  }

  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function () { if (eggOn) resetAfk(); }, { passive: true });
  });
})();
