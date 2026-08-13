(() => {
  const cfg = window.FARO_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  $('#year').textContent = new Date().getFullYear();

  // ---- REUNIÓN ----
  $$('[data-facebook-link]').forEach(a => {
    a.href = cfg.meeting.facebookUrl || cfg.socials.facebook;
  });

  $$('[data-nearest-link]').forEach(a => {
    a.href = cfg.meeting.nearestUrl || cfg.meeting.facebookUrl || cfg.socials.facebook;
  });

  $$('[data-meeting-status]').forEach(el => el.textContent = cfg.meeting.status);
  $$('[data-meeting-title]').forEach(el => el.textContent = cfg.meeting.title);
  $$('[data-meeting-description]').forEach(el => el.textContent = cfg.meeting.description);
  $$('[data-meeting-schedule]').forEach(el => el.textContent = cfg.meeting.schedule);

  $$('[data-online-link]').forEach(a => {
    if (cfg.meeting.onlineUrl) {
      a.href = cfg.meeting.onlineUrl;
      a.textContent = `${cfg.meeting.onlineLabel || 'Entrar a la transmisión'} ↗`;
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  });

  // ---- TRANSMISIÓN EN VIVO: cuando está activa, es el primer contenido visible ----
  const live = cfg.live || {};
  const now = Date.now();
  const start = live.startsAt ? Date.parse(live.startsAt) : NaN;
  const end = live.endsAt ? Date.parse(live.endsAt) : NaN;
  const scheduledLive = Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end;
  const liveActive = Boolean(live.enabled || scheduledLive);
  const liveSection = $('[data-live-section]');

  if (liveActive) {
    liveSection.hidden = false;
    document.body.classList.add('is-live');
    $('[data-live-label]').textContent = live.label || 'TRANSMISIÓN EN VIVO';
    $('[data-live-title-top]').textContent = live.titleTop || 'ESTAMOS';
    $('[data-live-title-accent]').textContent = live.titleAccent || 'EN VIVO.';
    $('[data-live-description]').textContent = live.description || 'La Casa está transmitiendo. Entra desde donde estés.';

    const liveLink = $('[data-live-link]');
    const liveButton = $('[data-live-button]');
    const streamUrl = (live.url || cfg.meeting.onlineUrl || '').trim();
    liveButton.textContent = live.buttonLabel || 'Entrar a la transmisión';
    if (streamUrl) {
      liveLink.href = streamUrl;
    } else {
      liveLink.hidden = true;
    }

    if (live.embedUrl) {
      const media = $('[data-live-media]');
      const iframe = $('[data-live-embed]');
      iframe.src = live.embedUrl;
      media.hidden = false;
      $('[data-live-art]').hidden = true;
    }
  }

  // ---- MÚSICA DE CASA ----
  const music = cfg.music || {};
  const musicSection = $('[data-music-section]');
  const releasesRoot = $('#music-releases');

  if (!music.enabled || !(music.releases || []).length) {
    if (musicSection) musicSection.hidden = true;
  } else {
    (music.releases || []).forEach((release, releaseIndex) => {
      const article = document.createElement('article');
      article.className = 'music-release reveal';

      const cover = document.createElement('div');
      cover.className = 'music-cover-art';
      if (release.coverImage) {
        cover.style.backgroundImage = `url("${release.coverImage}")`;
        cover.classList.add('has-cover');
      }
      cover.innerHTML = `
        <span class="music-cover-label">FARO · MUSIC</span>
        <strong>${release.title || ''}</strong>
        <span class="music-cover-artist">${release.artist || ''}</span>
        <span class="music-vinyl" aria-hidden="true"></span>
      `;

      const info = document.createElement('div');
      info.className = 'music-release-info';
      const platformId = `music-platforms-${releaseIndex}`;
      info.innerHTML = `
        <p class="music-available"><span aria-hidden="true">●</span>${release.eyebrow || 'YA DISPONIBLE'}</p>
        <h3>${release.title || ''}</h3>
        <p class="music-artist">${release.artist || ''}</p>
        <button class="music-listen-button" type="button" aria-expanded="false" aria-controls="${platformId}">
          <span>Escuchar canción</span><span aria-hidden="true">＋</span>
        </button>
        <div class="music-platforms" id="${platformId}" hidden></div>
      `;

      const platformRoot = $('.music-platforms', info);
      (release.platforms || []).forEach((platform, index) => {
        if (!platform.url) return;
        const link = document.createElement('a');
        link.href = platform.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'music-platform';
        link.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${platform.name}</strong><em aria-hidden="true">↗</em>`;
        platformRoot.appendChild(link);
      });

      const toggle = $('.music-listen-button', info);
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        platformRoot.hidden = expanded;
        toggle.lastElementChild.textContent = expanded ? '＋' : '−';
      });

      article.append(cover, info);
      releasesRoot.appendChild(article);
    });
  }

  // ---- NEWSLETTER ----
  const newsletter = cfg.newsletter || {};
  const form = $('[data-newsletter-form]');
  const formStatus = $('[data-newsletter-status]');
  const newsletterSection = $('#newsletter');

  if (!newsletter.enabled) {
    newsletterSection.hidden = true;
  } else {
    let action = (newsletter.actionUrl || '').trim();
    const username = (newsletter.buttondownUsername || '').trim();
    if (!action && username) {
      action = `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(username)}`;
    }
    if (action) form.action = action;

    const tagInput = form.querySelector('input[name="tag"]');
    if (tagInput && newsletter.tag) tagInput.value = newsletter.tag;

    form.addEventListener('submit', event => {
      if (!action) {
        event.preventDefault();
        formStatus.textContent = 'El formulario ya está diseñado; falta conectar el servicio de newsletter en js/config.js.';
        formStatus.classList.add('is-warning');
      } else {
        formStatus.textContent = 'Te estamos llevando a confirmar tu suscripción…';
        formStatus.classList.remove('is-warning');
      }
    });
  }

  // ---- REDES ----
  const socialLinks = $('#social-links');
  Object.entries(cfg.socials || {}).forEach(([name, url]) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = `${name.charAt(0).toUpperCase() + name.slice(1)} ↗`;
    socialLinks.appendChild(a);
  });

  // ---- PRIMERA VISITA ----
  const faq = $('#faq-list');
  (cfg.firstVisit || []).forEach(([question, answer]) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const p = document.createElement('p');
    summary.textContent = question;
    p.textContent = answer;
    details.append(summary, p);
    faq.appendChild(details);
  });

  // ---- FOTOGRAFÍAS LOCALES ----
  Object.entries(cfg.photos || {}).forEach(([key, src]) => {
    if (!src) return;
    $$(`[data-photo="${key}"]`).forEach(el => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add('has-image');
    });
  });

  // ---- MENÚ ----
  const menuBtn = $('.menu-button');
  const menu = $('#mobile-menu');
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // ---- HEADER / REVEALS ----
  const header = $('[data-header]');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }), { threshold: .1 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  // ---- SCHEMA ----
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: cfg.site.name,
    url: cfg.site.canonicalUrl,
    description: cfg.site.description,
    sameAs: Object.values(cfg.socials || {}).filter(Boolean)
  };
  $('#schema-org').textContent = JSON.stringify(schema);
})();
