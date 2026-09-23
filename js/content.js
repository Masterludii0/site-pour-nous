/* ============================================================
   CONTENT.JS — construit les sections à partir de config.js
   Tu n'as normalement pas besoin de toucher ce fichier.
   ============================================================ */

(function renderContent() {
  const cfg = SITE_CONFIG;

  // --- Texte d'ouverture ---
  const ouvertureEl = document.querySelector("[data-ouverture]");
  if (ouvertureEl) ouvertureEl.textContent = cfg.ouverture.replace(/\s+/g, " ").trim();

  // --- Notre histoire (panneaux du story-reel) ---
  const histoireWrap = document.querySelector("[data-histoire-panels]");
  if (histoireWrap) {
    cfg.histoire.forEach((step, i) => {
      const panel = document.createElement("div");
      panel.className = "story-panel";
      panel.setAttribute("data-panel-index", i);
      panel.innerHTML = `
        <span class="story-panel__date">${step.date}</span>
        <h3 class="story-panel__title">${step.titre}</h3>
        <p class="story-panel__text">${step.texte}</p>
      `;
      histoireWrap.appendChild(panel);
    });
  }

  // --- Pourquoi toi (liste de raisons) ---
  const raisonsWrap = document.querySelector("[data-raisons]");
  if (raisonsWrap) {
    cfg.raisons.forEach((raison, i) => {
      const item = document.createElement("li");
      item.className = "reason";
      item.innerHTML = `
        <span class="reason__mark" aria-hidden="true"></span>
        <span class="reason__text">${raison}</span>
      `;
      raisonsWrap.appendChild(item);
    });
  }

  // --- Nos moments (timeline) ---
  const timelineWrap = document.querySelector("[data-timeline]");
  if (timelineWrap) {
    cfg.moments.forEach((moment) => {
      const item = document.createElement("li");
      item.className = "timeline__item";
      item.innerHTML = `
        <div class="timeline__dot" aria-hidden="true"></div>
        <div class="timeline__content">
          <span class="timeline__date">${moment.date}</span>
          <p class="timeline__text">${moment.texte}</p>
        </div>
      `;
      timelineWrap.appendChild(item);
    });
  }

  // --- Galerie ---
  const galerieWrap = document.querySelector("[data-galerie]");
  if (galerieWrap) {
    cfg.galerie.forEach((photo, i) => {
      const fig = document.createElement("button");
      fig.className = "gallery__item";
      fig.setAttribute("type", "button");
      fig.setAttribute("data-index", i);
      fig.innerHTML = `
        <img src="assets/images/gallery/${photo.fichier}"
             alt="${photo.legende}"
             loading="lazy"
             onerror="this.closest('.gallery__item').classList.add('gallery__item--empty')">
        <span class="gallery__placeholder" aria-hidden="true"></span>
      `;
      galerieWrap.appendChild(fig);
    });
  }

  // --- Nos cadeaux ---
  const cadeauxWrap = document.querySelector("[data-cadeaux]");
  if (cadeauxWrap && Array.isArray(cfg.cadeaux)) {
    cfg.cadeaux.forEach((cadeau) => {
      const item = document.createElement("li");
      item.className = "cadeau";

      let visuelHTML;
      if (cadeau.media) {
        const src = `assets/cadeaux/${cadeau.media}`;
        if (cadeau.type === "video") {
          visuelHTML = `
            <button type="button" class="cadeau__media">
              <video src="${src}" muted preload="metadata"></video>
              <span class="cadeau__play" aria-hidden="true">▶</span>
            </button>`;
        } else {
          visuelHTML = `
            <button type="button" class="cadeau__media">
              <img src="${src}" alt="${cadeau.nom}" loading="lazy"
                   onerror="this.closest('.cadeau__media').outerHTML='<span class=&quot;cadeau__icon&quot; aria-hidden=&quot;true&quot;>${cadeau.emoji || "🎁"}</span>'">
            </button>`;
        }
      } else {
        visuelHTML = `<span class="cadeau__icon" aria-hidden="true">${cadeau.emoji || "🎁"}</span>`;
      }

      item.innerHTML = `
        ${visuelHTML}
        <span class="cadeau__nom">${cadeau.nom}</span>
        ${cadeau.note ? `<span class="cadeau__note">${cadeau.note}</span>` : ""}
      `;
      cadeauxWrap.appendChild(item);
    });
  }

  // --- Lettre : photos des lettres manuscrites ---
  const lettreImagesWrap = document.querySelector("[data-lettre-images]");
  if (lettreImagesWrap && Array.isArray(cfg.lettre.images)) {
    cfg.lettre.images.forEach((photo, i) => {
      const item = document.createElement("button");
      item.className = "letter__image-item";
      item.setAttribute("type", "button");
      item.innerHTML = `
        <span class="letter__image-photo">
          <img src="assets/images/lettres/${photo.fichier}"
               alt="${photo.legende}"
               loading="lazy"
               onerror="this.style.display='none'; this.closest('.letter__image-item').classList.add('letter__image-item--empty')">
          <span class="letter__image-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.2 4.5 5.6 4c2-.3 3.8.6 4.9 2.1.9-1.5 2.8-2.4 4.8-2.1 3.4.5 5.1 4 3.6 7.7C21 16.4 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>
          </span>
        </span>
        <span class="letter__image-caption">${photo.legende}</span>
      `;
      lettreImagesWrap.appendChild(item);
    });
  }

  // --- Lettre : texte ---
  const lettreCorps = document.querySelector("[data-lettre-corps]");
  const lettreSignature = document.querySelector("[data-lettre-signature]");
  if (lettreCorps) {
    const paragraphs = cfg.lettre.corps
      .split(/\n\s*\n/)
      .map(p => `<p>${p.replace(/\s+/g, " ").trim()}</p>`)
      .join("");
    lettreCorps.innerHTML = paragraphs;
  }
  if (lettreSignature) lettreSignature.textContent = cfg.lettre.signature;

  // --- Titre du hero (utilise le prénom du/de la partenaire) ---
  document.querySelectorAll("[data-partenaire]").forEach(el => {
    el.textContent = cfg.partenaire;
  });

  // --- Note du jour ---
  const noteTitre = document.querySelector("[data-note-titre]");
  const noteTexte = document.querySelector("[data-note-texte]");
  const noteDate = document.querySelector("[data-note-date]");
  if (noteTitre) noteTitre.textContent = cfg.noteDuJour.titre;
  if (noteTexte) noteTexte.textContent = cfg.noteDuJour.texte;
  if (noteDate) {
    const aujourdhui = new Date();
    noteDate.textContent = aujourdhui.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }
})();
