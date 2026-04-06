/* =============================================
   FINCA MI TESORO — main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────
  // 1. AÑO DINÁMICO EN EL FOOTER
  // ─────────────────────────────────────────
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  // ─────────────────────────────────────────
  // 2. MENÚ HAMBURGER (mobile)
  // ─────────────────────────────────────────
  const navEl       = document.querySelector('nav');
  const hamburger   = document.querySelector('.nav-hamburger');
  const mobileLinks = document.querySelectorAll('.nav-links a');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navEl.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar menú al hacer clic en cualquier enlace
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navEl.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar menú al hacer clic fuera del navbar
    document.addEventListener('click', (e) => {
      if (!navEl.contains(e.target)) {
        navEl.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ─────────────────────────────────────────
  // 3. SMOOTH SCROLL para enlaces internos
  // ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ─────────────────────────────────────────
  // 3. SCROLL-TRIGGERED FADE IN
  //    (mismo comportamiento que el original)
  // ─────────────────────────────────────────
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.beneficio-card, .porque-item, .paso, .blog-card, .gal-item, .novilla-card, .raza-banner, .ficha-box'
  ).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
  });


  // ─────────────────────────────────────────
  // 4. ENLACE ACTIVO EN LA NAVBAR
  // ─────────────────────────────────────────
  const sections = document.querySelectorAll('section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--dorado-claro)' : '';
    });
  }, { passive: true });


  // ─────────────────────────────────────────
  // 5. FORMULARIO DE CONTACTO
  // ─────────────────────────────────────────
  const btnForm = document.getElementById('btnForm');
  if (btnForm) {
    btnForm.addEventListener('click', () => {
      const original = btnForm.textContent;
      btnForm.textContent = '⏳ Enviando...';
      btnForm.disabled = true;
      setTimeout(() => {
        btnForm.textContent = '✅ ¡Mensaje enviado!';
        setTimeout(() => {
          btnForm.textContent = original;
          btnForm.disabled = false;
        }, 3000);
      }, 1200);
    });
  }

});
