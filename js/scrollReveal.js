/* ============================================================
   SCROLLREVEAL.JS
   - Révèle en fondu les éléments marqués [data-reveal]
   - Gère le "story-reel" de la section Notre Histoire :
     l'image reste fixée (sticky) pendant que les panneaux de
     texte défilent ; le panneau actif change l'image affichée.
   ============================================================ */

const ScrollReveal = (() => {
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    // Léger décalage en cascade à l'intérieur d'un même groupe
    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      const children = group.querySelectorAll("[data-reveal]");
      children.forEach((el, i) => {
        el.style.setProperty("--reveal-delay", `${Math.min(i * 70, 350)}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  function initStoryReel() {
    const panels = document.querySelectorAll(".story-panel");
    const visuals = document.querySelectorAll(".story-visual");
    if (!panels.length || !visuals.length) return;

    const setActive = (index) => {
      panels.forEach((p, i) => p.classList.toggle("is-active", i === index));
      visuals.forEach((v, i) => v.classList.toggle("is-active", i === index));
    };

    setActive(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-panel-index"));
            setActive(index);
          }
        });
      },
      { threshold: 0.55, rootMargin: "-20% 0px -20% 0px" }
    );

    panels.forEach((p) => observer.observe(p));
  }

  function initTimelinePulse() {
    const dots = document.querySelectorAll(".timeline__dot");
    if (!dots.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    dots.forEach((d) => observer.observe(d));
  }

  function init() {
    initReveal();
    initStoryReel();
    initTimelinePulse();
  }

  return { init };
})();
