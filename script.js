/* =========================================================
   KESAVAN SANMUGAM — DATA ANALYST PORTFOLIO
   Vanilla JS: navigation, scroll effects, counters, canvas grid
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Hero load-in ---------- */
  const hero = document.querySelector('.hero');
  requestAnimationFrame(() => {
    setTimeout(() => hero.classList.add('loaded'), 80);
  });

  /* ---------- Navbar: scrolled state + scroll progress ---------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 40);
    backToTop.classList.toggle('visible', scrollY > 500);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';

    updateActiveNavLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinksWrap = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinksWrap.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinksWrap.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active section indicator ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    let current = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  /* ---------- Fade-up on scroll (IntersectionObserver) ---------- */
  const fadeEls = document.querySelectorAll('.fade-up, .project-card');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ---------- Animated number counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Contact form: prevent real submission, show toast ---------- */
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  let toastTimer;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    showToast('Message sent! Thanks for reaching out — I\'ll reply soon.');
    contactForm.reset();
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3800);
  }

  /* ---------- Project card buttons (no backend / no real links available) ---------- */
  document.querySelectorAll('[data-action="view-project"]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Project details are summarized in the card above.');
    });
  });

  document.querySelectorAll('[data-action="view-tech"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      const tags = card.querySelector('.project-tags');
      tags.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tags.style.transition = 'transform 300ms ease';
      tags.style.transform = 'scale(1.03)';
      setTimeout(() => { tags.style.transform = 'scale(1)'; }, 300);
    });
  });

  /* ---------- Animated data-grid background (hero canvas) ---------- */
  const canvas = document.getElementById('dataGrid');
  const ctx = canvas.getContext('2d');
  let heroSection = document.querySelector('.hero');
  let width, height, points;
  const POINT_COUNT = 46;
  const MAX_DIST = 140;

  function resizeCanvas() {
    width = canvas.width = heroSection.offsetWidth;
    height = canvas.height = heroSection.offsetHeight;
  }

  function initPoints() {
    points = Array.from({ length: POINT_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);

    // Update + draw points
    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.35)';
      ctx.fill();
    });

    // Connect nearby points
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = `rgba(14, 165, 168, ${0.14 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawGrid);
  }

  function setupCanvas() {
    resizeCanvas();
    initPoints();
    drawGrid();
  }

  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setupCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
    });
  }

});