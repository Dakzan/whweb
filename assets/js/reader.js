
(function () {
  'use strict';
  const body = document.getElementById('readerBody');
  if (!body) return;

  const block = (e) => { e.preventDefault(); return false; };
  body.addEventListener('copy', block);
  body.addEventListener('cut', block);
  body.addEventListener('contextmenu', block);
  body.addEventListener('selectstart', block);
  body.addEventListener('dragstart', block);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
      if (body.contains(document.activeElement) || window.getSelection()?.toString()) {
        const sel = window.getSelection();
        if (sel && body.contains(sel.anchorNode)) {
          e.preventDefault();
        }
      }
    }
  });
})();

(function markChapterRead() {
  try {
    const key = 'wh-read-chapters';
    const s = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    s.add('1:1');
    localStorage.setItem(key, JSON.stringify([...s]));
  } catch (e) {}
})();

(function () {
  try {
    localStorage.setItem('wh-continue', JSON.stringify({
      title: 'Arco 1 · Cap. 1 — A Day Like Any Other',
      url: location.pathname.split('/').pop() || 'chapter-a1-c1.html',
      full: location.href
    }));
    // relative from home
    localStorage.setItem('wh-continue', JSON.stringify({
      title: 'Arco 1 · Cap. 1',
      url: 'pages/chapter-a1-c1.html'
    }));
  } catch (e) {}
})();
