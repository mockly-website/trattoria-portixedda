/* ==========================================================================
   TRATTORIA PORTIXEDDA · Oristano
   JS difensivo: il contenuto è sempre visibile anche senza JS o observer.
   ========================================================================== */
(function () {
  "use strict";

  /* Abilita le "enhancement" (animazioni d'ingresso, preloader, ecc.).
     Se questo script non gira affatto, html non ha la classe .js e il CSS
     mostra tutto il contenuto senza nascondere nulla. */
  document.documentElement.classList.add("js");

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- PRELOADER ---------- */
  const preloader = $("#preloader");

  function hidePreloader() {
    if (!preloader || preloader.classList.contains("hidden")) return;
    preloader.classList.add("hidden");
  }
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 2800);
  window.addEventListener("scroll", hidePreloader, { passive: true, once: true });

  /* ---------- NAVBAR + BACK TO TOP + LINK ATTIVO ---------- */
  const nav = $("#nav");
  const toTop = $("#toTop");
  const sections = $$("main section[id]");
  const navLinkEls = $$(".nav-link");

  function updateActiveLink() {
    const pos = window.scrollY + 120;
    let current = "home";
    sections.forEach((section) => {
      if (pos >= section.offsetTop) current = section.id;
    });
    navLinkEls.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  function onScrollUI() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
    updateActiveLink();
    checkReveals();
    checkStats();
  }
  window.addEventListener("scroll", onScrollUI, { passive: true });

  /* ---------- MENU MOBILE ---------- */
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");

  function toggleMenu(force) {
    const open = typeof force === "boolean" ? force : !navLinks.classList.contains("open");
    navLinks.classList.toggle("open", open);
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    document.body.classList.toggle("menu-open", open);
  }

  hamburger.addEventListener("click", () => toggleMenu());
  $$("a", navLinks).forEach((link) => link.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(false);
  });

  /* ---------- SCROLL REVEAL (universale, senza IntersectionObserver) ---------- */
  const revealEls = $$(".reveal, .reveal-left, .reveal-right");

  function checkReveals() {
    const vh = window.innerHeight || document.documentElement.clientHeight || 600;
    revealEls.forEach((el) => {
      if (el.classList.contains("in-view")) return;
      const r = el.getBoundingClientRect();
      if (r.top <= vh - 30 && r.bottom >= 0) el.classList.add("in-view");
    });
  }
  window.addEventListener("resize", checkReveals, { passive: true });
  window.addEventListener("load", checkReveals);
  checkReveals();
  setTimeout(checkReveals, 400);
  setTimeout(checkReveals, 1500);

  /* ---------- CONTATORI (con rete di sicurezza) ---------- */
  const stats = $("#stats");
  let statsDone = false;

  function animateCounter(el) {
    const numEl = el.querySelector(".num") || el;
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (prefersReduced) {
      numEl.textContent = target.toLocaleString("it-IT", { minimumFractionDigits: decimals });
      return;
    }
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      numEl.textContent = value.toLocaleString("it-IT", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function checkStats() {
    if (statsDone || !stats) return;
    const r = stats.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 600;
    if (r.top < vh) {
      statsDone = true;
      $$(".stat-num", stats).forEach(animateCounter);
    }
  }
  checkStats();
  setTimeout(checkStats, 1200);

  /* ---------- TAB MENU ---------- */
  const tabs = $$(".menu-tab");
  const panels = $$(".menu-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const target = tab.dataset.target;
      panels.forEach((panel) => {
        const isActive = panel.id === target;
        panel.classList.toggle("active", isActive);
        if (isActive) {
          panel.style.animation = "none";
          void panel.offsetWidth;
          panel.style.animation = "";
        }
      });
    });
  });

  /* ---------- CAROUSEL RECENSIONI ---------- */
  const track = $("#carouselTrack");
  if (track) {
    const slides = $$(".review-slide", track);
    const dotsWrap = $("#carouselDots");
    let index = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.setAttribute("aria-label", "Vai alla recensione " + (i + 1));
      dot.addEventListener("click", () => { go(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    const dots = $$(".dot", dotsWrap);

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === index));
      dots.forEach((d, k) => {
        d.classList.toggle("active", k === index);
        d.setAttribute("aria-selected", String(k === index));
      });
    }
    function restart() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(() => go(index + 1), 6000);
    }

    const prevBtn = $("#prevBtn");
    const nextBtn = $("#nextBtn");
    if (prevBtn) prevBtn.addEventListener("click", () => { go(index - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { go(index + 1); restart(); });

    go(0);
    restart();
  }

  /* ---------- BACK TO TOP ---------- */
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" }));
  }

  /* ---------- ANNO FOOTER ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Primo calcolo */
  onScrollUI();
})();
