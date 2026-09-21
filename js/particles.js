/* ============================================================
   PARTICLES.JS — fond animé du hero
   - Un dessin de constellation qui apparaît UNE fois au chargement
   - Un nuage de particules discret et lent en arrière-plan
   Respecte prefers-reduced-motion (animation coupée si activé).
   ============================================================ */

const HeroCanvas = (() => {
  let canvas, ctx, width, height, dpr;
  let particles = [];
  let anchors = [];
  let reduceMotion = false;
  let rafId = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildAnchors();
  }

  // Points ancrés qui forment la "constellation" du hero
  function buildAnchors() {
    const count = width < 640 ? 6 : 9;
    anchors = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
    }));
  }

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      speedY: Math.random() * 0.12 + 0.03,
      drift: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.35 + 0.1,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function buildParticles() {
    const density = width < 640 ? 28 : 55;
    particles = Array.from({ length: density }, makeParticle);
  }

  function drawParticles(time) {
    ctx.save();
    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += Math.sin(time / 4000 + p.phase) * 0.1 + p.drift * 0.02;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(216, 178, 110, ${p.opacity})`;
      ctx.fill();
    });
    ctx.restore();
  }

  // Anime la constellation une seule fois (progress 0 -> 1) puis s'arrête
  function drawConstellation(progress) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 251, 250, 0.5)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(255, 251, 250, 0.85)";

    const edges = [];
    for (let i = 0; i < anchors.length - 1; i++) edges.push([i, i + 1]);

    const edgesToShow = Math.floor(edges.length * progress);
    for (let i = 0; i < edgesToShow; i++) {
      const [a, b] = edges[i];
      ctx.beginPath();
      ctx.moveTo(anchors[a].x, anchors[a].y);
      ctx.lineTo(anchors[b].x, anchors[b].y);
      ctx.globalAlpha = 0.4;
      ctx.stroke();
    }

    const pointsToShow = Math.floor(anchors.length * progress);
    for (let i = 0; i < pointsToShow; i++) {
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(anchors[i].x, anchors[i].y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function loop(time, startTime) {
    ctx.clearRect(0, 0, width, height);

    const introDuration = 1800; // ms
    const elapsed = time - startTime;
    const introProgress = Math.min(elapsed / introDuration, 1);

    drawConstellation(easeOutCubic(introProgress));
    if (!reduceMotion) drawParticles(time);

    if (introProgress < 1 || !reduceMotion) {
      rafId = requestAnimationFrame((t) => loop(t, startTime));
    }
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function init() {
    canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    resize();
    buildParticles();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        buildParticles();
      }, 200);
    });

    const startTime = performance.now();
    if (reduceMotion) {
      // Dessine juste l'état final, sans animation continue
      drawConstellation(1);
    } else {
      rafId = requestAnimationFrame((t) => loop(t, startTime));
    }
  }

  return { init };
})();
