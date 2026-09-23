/* ============================================================
   MAIN.JS — navigation, menu mobile, lightbox, musique,
   et point d'entrée qui initialise tous les autres modules.
   ============================================================ */

(function () {
  "use strict";

  // ---------- Navigation : fond au scroll ----------
  function initNavScroll() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------- Menu mobile ----------
  function initMobileMenu() {
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".nav__links");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // ---------- Surlignage du lien de nav actif ----------
  function initActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".nav__links a");
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            links.forEach((link) => {
              link.classList.toggle(
                "is-active",
                link.getAttribute("href") === `#${id}`
              );
            });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // ---------- Lightbox : galerie ET photos de lettres ----------
  // Délégation d'événements : fonctionne même pour les éléments injectés
  // dynamiquement par content.js, sans avoir besoin de re-binder quoi que ce soit.
  const LIGHTBOX_TRIGGER_SELECTOR = ".gallery__item, .letter__image-item, .cadeau__media";

  function initLightbox() {
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox) return;

    const imgEl = lightbox.querySelector(".lightbox__img");
    const videoEl = lightbox.querySelector(".lightbox__video");
    const captionEl = lightbox.querySelector(".lightbox__caption");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    let lastFocused = null;

    const open = (item) => {
      const video = item.querySelector("video");
      const img = item.querySelector("img");

      if (video) {
        videoEl.src = video.src;
        videoEl.hidden = false;
        imgEl.hidden = true;
        imgEl.src = "";
        captionEl.textContent = video.getAttribute("aria-label") || "";
      } else if (img) {
        if (img.style.display === "none") return;
        imgEl.src = img.src;
        imgEl.alt = img.alt || "";
        imgEl.hidden = false;
        videoEl.hidden = true;
        videoEl.pause();
        videoEl.src = "";
        captionEl.textContent = img.alt || "";
      } else {
        return;
      }

      lastFocused = document.activeElement;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      imgEl.src = "";
      videoEl.pause();
      videoEl.src = "";
      if (lastFocused) lastFocused.focus();
    };

    document.addEventListener("click", (e) => {
      const item = e.target.closest(LIGHTBOX_TRIGGER_SELECTOR);
      if (!item) return;
      const isEmpty =
        item.classList.contains("gallery__item--empty") ||
        item.classList.contains("letter__image-item--empty");
      if (!isEmpty) open(item);
    });

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  }

  // ---------- Musique de fond ----------
  // ---------- Année dans le footer ----------
  function initFooterYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  // ---------- Initialisation générale ----------
  document.addEventListener("DOMContentLoaded", () => {
    initNavScroll();
    initMobileMenu();
    initActiveLink();
    initLightbox();
    initFooterYear();

    // NB : on appelle directement les modules (et non via window.X) car une
    // const déclarée en haut d'un script classique n'est jamais attachée à
    // l'objet window — window.ScrollReveal etc. valait donc toujours
    // "undefined" et ces lignes ne s'exécutaient jamais.
    if (typeof HeroCanvas !== "undefined") HeroCanvas.init();
    if (typeof ScrollReveal !== "undefined") ScrollReveal.init();
  });
})();
