(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navigation');
  function closeMenu() { menu?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); }
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  matchMedia('(min-width: 521px)').addEventListener('change', closeMenu);

  const dialog = document.querySelector('#film-dialog');
  const player = document.querySelector('#film-player');
  let lastTrigger;
  function closeFilm() { dialog.close(); }
  function filmUrls(provider, id, hash) {
    if (provider === 'youtube' && /^[a-zA-Z0-9_-]{11}$/.test(id)) return {
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      external: `https://www.youtube.com/watch?v=${id}`
    };
    if (provider === 'vimeo' && /^\d+$/.test(id) && (!hash || /^[a-zA-Z0-9]+$/.test(hash))) return {
      embed: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1${hash ? `&h=${hash}` : ''}`,
      external: `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`
    };
    return null;
  }
  document.querySelectorAll('[data-film]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const urls = filmUrls(trigger.dataset.provider, trigger.dataset.id, trigger.dataset.hash);
      if (!urls || !dialog) return;
      lastTrigger = trigger;
      document.querySelector('#film-title').textContent = trigger.dataset.title || 'Studio film';
      document.querySelector('#film-note').textContent = trigger.dataset.note || '';
      document.querySelector('#film-external').href = urls.external;
      const iframe = document.createElement('iframe');
      iframe.src = urls.embed;
      iframe.title = trigger.dataset.title || 'Film player';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      player.replaceChildren(iframe);
      dialog.showModal();
      dialog.querySelector('.film-close').focus();
    });
  });
  dialog?.querySelector('.film-close')?.addEventListener('click', closeFilm);
  dialog?.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeFilm();
  });
  dialog?.addEventListener('close', () => { player.replaceChildren(); lastTrigger?.focus(); });

  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('.work-grid .project-card');
  filters.forEach((button) => button.addEventListener('click', () => {
    document.querySelector('.work-grid').classList.toggle('is-filtered', button.dataset.filter !== 'all');
    filters.forEach((filter) => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
    let count = 0;
    cards.forEach((card) => { card.hidden = button.dataset.filter !== 'all' && button.dataset.filter !== card.dataset.category; if (!card.hidden) count++; });
    document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
  }));

  const backgroundVideo = document.querySelector('.hero-video');
  const motionButton = document.querySelector('.motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function setMotionState(paused) {
    const label = motionButton?.querySelector('.motion-label');
    const path = motionButton?.querySelector('svg path');
    if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
    if (path) {
      path.setAttribute('d', paused ? 'm7 4 14 8-14 8Z' : 'M8 4v16M16 4v16');
      path.setAttribute('fill', paused ? 'currentColor' : 'none');
    }
    motionButton?.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
  }
  if (backgroundVideo && !reducedMotion.matches) {
    backgroundVideo.play().catch(() => setMotionState(true));
    motionButton?.addEventListener('click', () => {
      if (backgroundVideo.paused) { backgroundVideo.play().then(() => setMotionState(false)).catch(() => {}); }
      else { backgroundVideo.pause(); setMotionState(true); }
    });
  } else if (motionButton) { motionButton.hidden = true; }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { backgroundVideo?.pause(); if (motionButton) motionButton.hidden = true; } });

  const form = document.querySelector('#contact-form');
  if (form) {
    const preset = new URLSearchParams(location.search).get('interest');
    const values = { '01': 'Film & television', '02': 'Branded content & production', '03': 'Animation & new worlds' };
    if (values[preset]) form.elements.interest.value = values[preset];
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const name = String(fields.get('name')).trim();
      const email = String(fields.get('email')).trim();
      const message = String(fields.get('message')).trim();
      if (!name || !message) { document.querySelector('#form-status').textContent = 'Please add your name and a little about your idea.'; return; }
      const interest = String(fields.get('interest'));
      const subject = `A new story: ${interest}`;
      const body = `Hello Stolen Tribe,\n\n${message}\n\nName: ${name}\nEmail: ${email}\nInterested in: ${interest}`;
      document.querySelector('#email-draft').value = `To: ${form.dataset.email}\nSubject: ${subject}\n\n${body}`;
      document.querySelector('#email-fallback').hidden = false;
      document.querySelector('#form-status').textContent = 'Your email draft is ready. Review it in your email app and send when you’re ready.';
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
    document.querySelector('#copy-draft')?.addEventListener('click', async () => {
      const draft = document.querySelector('#email-draft');
      try { await navigator.clipboard.writeText(draft.value); document.querySelector('#form-status').textContent = 'Draft copied. Paste it into your email app when you’re ready.'; }
      catch { draft.focus(); draft.select(); document.querySelector('#form-status').textContent = 'Your draft is selected. Copy it and paste it into your email app.'; }
    });
  }
})();
