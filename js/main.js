(() => {
  const cfg = window.FARO_CONFIG;
  document.getElementById('year').textContent = new Date().getFullYear();

  document.querySelectorAll('[data-facebook-link]').forEach(a => {
    a.href = cfg.meeting.facebookUrl || cfg.socials.facebook;
  });

  document.querySelectorAll('[data-nearest-link]').forEach(a => {
    a.href = cfg.meeting.nearestUrl || cfg.meeting.facebookUrl;
  });

  document.querySelectorAll('[data-meeting-status]').forEach(el => el.textContent = cfg.meeting.status);
  document.querySelectorAll('[data-meeting-title]').forEach(el => el.textContent = cfg.meeting.title);
  document.querySelectorAll('[data-meeting-description]').forEach(el => el.textContent = cfg.meeting.description);
  document.querySelectorAll('[data-meeting-schedule]').forEach(el => el.textContent = cfg.meeting.schedule);

  document.querySelectorAll('[data-meet-link]').forEach(a => {
    if (cfg.meeting.meetUrl) {
      a.href = cfg.meeting.meetUrl;
      a.textContent = (cfg.meeting.meetLabel || 'Entrar a Google Meet') + ' ↗';
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  });

  const socialLinks = document.getElementById('social-links');
  Object.entries(cfg.socials).forEach(([name, url]) => {
    if (!url || url.startsWith('[')) return;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = name.charAt(0).toUpperCase() + name.slice(1) + ' ↗';
    socialLinks.appendChild(a);
  });

  const faq = document.getElementById('faq-list');
  cfg.firstVisit.forEach(([q, answer]) => {
    const d = document.createElement('details');
    const s = document.createElement('summary');
    const p = document.createElement('p');
    s.textContent = q;
    p.textContent = answer;
    d.append(s, p);
    faq.appendChild(d);
  });

  Object.entries(cfg.photos || {}).forEach(([key, src]) => {
    if (!src) return;
    document.querySelectorAll(`[data-photo="${key}"]`).forEach(el => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add('has-image');
    });
  });

  const menuBtn = document.querySelector('.menu-button');
  const menu = document.getElementById('mobile-menu');
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  const header = document.querySelector('[data-header]');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: cfg.site.name,
    url: cfg.site.canonicalUrl,
    description: cfg.site.description,
    sameAs: Object.values(cfg.socials).filter(v => v && !v.startsWith('['))
  };
  document.getElementById('schema-org').textContent = JSON.stringify(schema);
})();
