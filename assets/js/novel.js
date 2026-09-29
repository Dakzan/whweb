/* ============================================
   WHITE HOLE — Novel: Arcs + Chapters + Search
   ============================================ */

(function () {
  'use strict';

  // Edita aquí títulos y enlaces de cada capítulo
  const ARCS = [
    {
      id: 1,
      title: 'Untamed Flame',
      available: true,
      chapters: [
        { num: 1, title: 'A Day Like Any Other', url: 'chapter-a1-c1.html' },
        { num: 2, title: 'Capítulo 2', url: 'https://getinkspired.com/es/u/dakzan/' },
        { num: 3, title: 'Capítulo 3', url: 'https://getinkspired.com/es/u/dakzan/' },
        { num: 4, title: 'Capítulo 4', url: 'https://getinkspired.com/es/u/dakzan/' },
        { num: 5, title: 'Capítulo 5', url: 'https://getinkspired.com/es/u/dakzan/' }
      ]
    },
    {
      id: 2,
      title: 'Rule Hunter',
      available: false,
      chapters: []
    },
    {
      id: 3,
      title: 'The Pale Book',
      available: false,
      chapters: []
    },
    {
      id: 4,
      title: 'Green-Eyed Dragon Girl',
      available: false,
      chapters: []
    },
    {
      id: 5,
      title: 'Reckless Star',
      available: false,
      chapters: []
    },
    {
      id: 6,
      title: 'Point of Origin',
      available: false,
      chapters: []
    }
  ];


  const READ_KEY = 'wh-read-chapters';
  function getReadSet() {
    try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function markRead(arcId, chNum) {
    const s = getReadSet();
    s.add(arcId + ':' + chNum);
    localStorage.setItem(READ_KEY, JSON.stringify([...s]));
          try { updateGlobalProgress(); } catch (e) {}
  }
  function arcProgress(arc) {
    const s = getReadSet();
    const total = (arc.chapters && arc.chapters.length) || 0;
    if (!total) return { read: 0, total: 0, pct: 0 };
    let read = 0;
    arc.chapters.forEach(ch => { if (s.has(arc.id + ':' + ch.num)) read++; });
    return { read, total, pct: Math.round((read / total) * 100) };
  }


  // Characters
  const CHARACTERS = [
    { name: 'Emiru Barielay', role: 'Keeper · Protagonista', img: '../assets/images/favicon.png', bio: 'Fuego indómito y decisión. Actúa cuando otros dudan.' },
    { name: 'Mahiru Kihara', role: 'Observadora · Ancla', img: '../assets/images/favicon-mahiru.png', bio: 'Mira en silencio y registra lo que el mundo prefiere olvidar.' },
    { name: 'Saffi Behar', role: 'Figura del círculo', img: '../assets/images/favicon-saffi.png', bio: 'Presencia pálida entre el colegio y los secretos del lore.' }
  ];
  const charGrid = document.getElementById('charactersGrid');
  if (charGrid) {
    CHARACTERS.forEach(ch => {
      const card = document.createElement('article');
      card.className = 'character-card';
      card.innerHTML = '<div class="character-avatar"><img src="' + ch.img + '" alt="' + ch.name + '" loading="lazy"></div>' +
        '<h3>' + ch.name + '</h3><span class="character-role">' + ch.role + '</span><p>' + ch.bio + '</p>';
      charGrid.appendChild(card);
    });
  }

  // Global novel progress
  function updateGlobalProgress() {
    const fill = document.getElementById('novelProgressFill');
    const pctEl = document.getElementById('novelProgressPct');
    const meta = document.getElementById('novelProgressMeta');
    if (!fill) return;
    let total = 0, read = 0;
    const s = getReadSet();
    ARCS.forEach(arc => {
      const chs = arc.chapters || [];
      total += chs.length;
      chs.forEach(ch => { if (s.has(arc.id + ':' + ch.num)) read++; });
    });
    const pct = total ? Math.round((read / total) * 100) : 0;
    fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (meta) meta.textContent = read + ' / ' + total + ' capítulos leídos';
  }
  try { updateGlobalProgress(); } catch (e) {}


  const grid = document.getElementById('arcsGrid');
  const searchInput = document.getElementById('arcsSearch');
  const searchClear = document.getElementById('arcsSearchClear');
  const searchCount = document.getElementById('arcsSearchCount');
  const emptyMsg = document.getElementById('arcsEmpty');
  const overlay = document.getElementById('chaptersOverlay');
  const chaptersList = document.getElementById('chaptersList');
  const chaptersTitle = document.getElementById('chaptersTitle');
  const chaptersArcLabel = document.getElementById('chaptersArcLabel');
  const chaptersClose = document.getElementById('chaptersClose');
  const chaptersBackdrop = document.getElementById('chaptersBackdrop');

  if (!grid) return;

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function renderArcs(filter) {
    const q = normalize(filter);
    grid.innerHTML = '';
    let visible = 0;

    // When searching, prefer direct chapter results
    if (q) {
      const chapterHits = [];
      ARCS.forEach((arc) => {
        (arc.chapters || []).forEach((ch) => {
          const hay = normalize('capítulo ' + ch.num + ' ' + ch.title + ' arco ' + arc.id + ' ' + arc.title);
          if (hay.includes(q)) {
            chapterHits.push({ arc, ch });
          }
        });
      });
      if (chapterHits.length) {
        chapterHits.forEach(({ arc, ch }) => {
          visible++;
          const key = arc.id + ':' + ch.num;
          const readSet = getReadSet();
          const isRead = readSet.has(key);
          const el = document.createElement('a');
          el.className = 'arc-card available chapter-hit' + (isRead ? ' is-read' : '');
          el.href = ch.url;
          if (/^https?:/i.test(ch.url)) { el.target = '_blank'; el.rel = 'noopener'; }
          el.innerHTML =
            '<div class="arc-glow"></div>' +
            '<div class="arc-inner">' +
              '<span class="arc-num">Arco ' + arc.id + ' · Cap. ' + ch.num + '</span>' +
              '<h4 class="arc-name">' + ch.title + '</h4>' +
              '<span class="arc-meta">' + arc.title + (isRead ? ' · Leído' : '') + '</span>' +
            '</div>';
          el.addEventListener('click', () => { try { markRead(arc.id, ch.num); } catch (e) {} });
          grid.appendChild(el);
        });
        if (searchCount) searchCount.textContent = visible + (visible === 1 ? ' capítulo' : ' capítulos');
        if (emptyMsg) emptyMsg.hidden = visible > 0;
        return;
      }
    }

    ARCS.forEach((arc) => {
      const arcLabel = 'Arco ' + arc.id;
      const haystack = normalize(
        arcLabel + ' ' + arc.title + ' ' +
        (arc.chapters || []).map(c => c.title + ' capítulo ' + c.num).join(' ')
      );
      const match = !q || haystack.includes(q);
      if (!match) return;
      visible++;

      const el = document.createElement(arc.available ? 'button' : 'div');
      if (arc.available) el.type = 'button';
      el.className = 'arc-card ' + (arc.available ? 'available' : 'locked');
      el.dataset.arc = String(arc.id);
      if (!arc.available) el.setAttribute('aria-disabled', 'true');

      const chCount = (arc.chapters && arc.chapters.length) ? arc.chapters.length : 0;
      const chLabel = chCount === 1 ? '1 capítulo' : (chCount + ' capítulos');
      const prog = arcProgress(arc);
      el.innerHTML =
        '<div class="arc-glow"></div>' +
        '<div class="arc-inner">' +
          '<span class="arc-num">' + arcLabel + '</span>' +
          '<h4 class="arc-name">' + arc.title + '</h4>' +
          '<span class="arc-meta">' + (arc.available ? chLabel : 'Próximamente') +
            (arc.available && prog.total ? ' · ' + prog.read + '/' + prog.total : '') +
          '</span>' +
          '<span class="arc-status ' + (arc.available ? 'open' : 'soon') + '">' +
            (arc.available ? 'Disponible' : 'Pronto') +
          '</span>' +
        '</div>';

      if (arc.available) {
        el.addEventListener('click', () => openChapters(arc));
      }
      grid.appendChild(el);
    });

    if (searchCount) {
      searchCount.textContent = q ? (visible + (visible === 1 ? ' resultado' : ' resultados')) : '';
    }
    if (emptyMsg) emptyMsg.hidden = visible > 0;
  }

  function openChapters(arc) {
    if (!overlay || !chaptersList) return;
    chaptersArcLabel.textContent = 'Arco ' + arc.id;
    chaptersTitle.textContent = arc.title;
    chaptersList.innerHTML = '';

    if (!arc.chapters || !arc.chapters.length) {
      const li = document.createElement('li');
      li.className = 'chapter-empty';
      li.textContent = 'Aún no hay capítulos publicados en este arco.';
      chaptersList.appendChild(li);
    } else {
      const readSet = getReadSet();
      arc.chapters.forEach((ch) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = ch.url;
        if (/^https?:/i.test(ch.url)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        const key = arc.id + ':' + ch.num;
        let isRead = readSet.has(key);
        a.className = 'chapter-link' + (isRead ? ' is-read' : '');
        a.innerHTML =
          '<span class="chapter-num">Cap. ' + ch.num + '</span>' +
          '<span class="chapter-title">' + ch.title + '</span>' +
          '<button type="button" class="chapter-read-btn' + (isRead ? ' is-read' : '') + '" title="Marcar leído / no leído" aria-label="Alternar leído">' +
            (isRead ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>') +
          '</button>' +
          '<svg class="chapter-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

        const progBtn = a.querySelector('.chapter-read-btn');
        progBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const s = getReadSet();
          if (s.has(key)) {
            s.delete(key);
            isRead = false;
          } else {
            s.add(key);
            isRead = true;
          }
          localStorage.setItem(READ_KEY, JSON.stringify([...s]));
          try { updateGlobalProgress(); } catch (e) {}
          progBtn.classList.toggle('is-read', isRead);
          progBtn.innerHTML = isRead ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>';
          a.classList.toggle('is-read', isRead);
          const q = document.getElementById('arcsSearch');
          renderArcs(q ? q.value : '');
        });

        a.addEventListener('click', (e) => {
          // navigating to chapter marks as read
          if (e.target.closest('.chapter-progress')) return;
          markRead(arc.id, ch.num);
        });
        li.appendChild(a);
        chaptersList.appendChild(li);
      });
    }

    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }
    overlay.hidden = false;
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeChapters() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    overlay.hidden = true;
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => renderArcs(searchInput.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        renderArcs('');
        searchInput.blur();
      }
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      renderArcs('');
      searchInput.focus();
    });
  }
  if (chaptersClose) chaptersClose.addEventListener('click', closeChapters);
  if (chaptersBackdrop) chaptersBackdrop.addEventListener('click', closeChapters);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeChapters();
    }
  });

  // Deep-link / search match opens chapter results: if query matches a chapter, still show arcs
  renderArcs('');
})();
