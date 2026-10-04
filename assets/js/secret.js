(function () {
  'use strict';
  var gate = document.getElementById('secretGate');
  var content = document.getElementById('secretContent');
  var input = document.getElementById('secretPwdInput');
  var err = document.getElementById('secretPwdError');
  var btn = document.getElementById('secretPwdSubmit');
  var KEY = 'twkeeper04';

  function lock() {
    if (gate) {
      gate.hidden = false;
      gate.style.display = '';
      gate.classList.remove('unlocking');
    }
    if (content) {
      content.hidden = true;
      content.style.display = 'none';
      content.setAttribute('aria-hidden', 'true');
    }
  }

  function unlock() {
    if (!gate || !content) return;
    gate.classList.add('unlocking');
    setTimeout(function () {
      gate.hidden = true;
      gate.style.display = 'none';
      content.hidden = false;
      content.style.display = '';
      content.removeAttribute('aria-hidden');
      content.classList.add('revealed');
    }, 400);
  }

  lock();

  function tryUnlock() {
    var v = (input && input.value || '').trim().toLowerCase();
    if (v === KEY) {
      if (err) err.textContent = '';
      unlock();
    } else {
      if (err) err.textContent = 'Clave incorrecta';
      if (input) {
        input.classList.add('shake');
        setTimeout(function () { input.classList.remove('shake'); }, 450);
      }
    }
  }

  if (btn) btn.addEventListener('click', tryUnlock);
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  }
})();
