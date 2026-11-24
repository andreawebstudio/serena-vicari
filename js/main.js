(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- Menu burger (solo mobile/tablet) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  var toggleLabel = toggle ? toggle.querySelector('.sr-only') : null;

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Voce di menu attiva ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav ul a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);

  if (hasIO) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var a = map[entry.target.id];
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'location'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- Fade-up all'ingresso + effetti approccio ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (hasIO) {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Come funziona: percorso che si disegna ---------- */
  var journey = document.querySelector('[data-journey]');
  if (journey) {
    if (hasIO) {
      var jObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            journey.classList.add('is-active');
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      jObs.observe(journey);
    } else {
      journey.classList.add('is-active');
    }
  }

  /* ---------- FAQ accordion (tutte chiuse all'avvio) ---------- */
  document.querySelectorAll('[data-accordion] .faq-q button').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (!open) {
        panel.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { panel.classList.add('is-open'); });
        });
      } else {
        panel.classList.remove('is-open');
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { panel.hidden = true; return; }
        var done = function (e) {
          if (e.target !== panel) return;
          if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true;
          panel.removeEventListener('transitionend', done);
        };
        panel.addEventListener('transitionend', done);
      }
    });
  });

  /* ---------- Modulo contatti ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      var invalid = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !f.checkValidity());
        f.setAttribute('aria-invalid', String(bad));
        return bad;
      });
      if (invalid.length) {
        e.preventDefault();
        status.textContent = 'Compila i campi obbligatori contrassegnati con *.';
        invalid[0].focus();
        return;
      }
      if (form.dataset.draft === 'true') {
        // Modalità bozza: nessun invio e nessuna simulazione di invio.
        e.preventDefault();
        status.innerHTML = 'Il modulo sarà attivo a breve. Nel frattempo puoi scrivermi su <a href="https://www.instagram.com/serena_extension_ciglia_/" target="_blank" rel="noopener">Instagram</a>.';
      }
    });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
    });
  }

  /* ---------- Anno dinamico ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
