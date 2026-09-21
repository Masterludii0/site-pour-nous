/* ============================================================
   NOUVELLES-CONTENT.JS — construit la page nouvelles.html
   Interroge /api/medias pour chaque dossier : l'aperçu et la
   date affichés sont donc toujours à jour pour tout le monde.
   ============================================================ */

(function renderNouvelles() {
  const cfg = NOUVELLES_CONFIG;

  const titreEl = document.querySelector("[data-nouvelles-titre]");
  const texteEl = document.querySelector("[data-nouvelles-texte]");
  if (titreEl) titreEl.textContent = cfg.intro.titre;
  if (texteEl) texteEl.textContent = cfg.intro.texte.replace(/\s+/g, " ").trim();

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  const wrap = document.querySelector("[data-dossiers]");
  if (!wrap) return;

  async function chargerDossier(dossier) {
    let medias = [];
    try {
      const reponse = await fetch(`/api/medias?dossier=${encodeURIComponent(dossier.id)}`);
      const donnees = await reponse.json();
      medias = (donnees.medias || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      medias = [];
    }

    const dernier = medias[0];

    let previewHTML;
    if (!dernier) {
      previewHTML = `
        <div class="dossier-card__preview dossier-card__preview--empty">
          <span class="dossier-card__empty-icon" aria-hidden="true">＋</span>
        </div>`;
    } else if (dernier.type === "video") {
      previewHTML = `
        <div class="dossier-card__preview">
          <video src="${dernier.url}" muted preload="metadata"></video>
          <span class="dossier-card__play" aria-hidden="true">▶</span>
        </div>`;
    } else {
      previewHTML = `
        <div class="dossier-card__preview">
          <img src="${dernier.url}" alt="" loading="lazy">
        </div>`;
    }

    const card = document.createElement("a");
    card.className = "dossier-card";
    card.href = `dossier.html?personne=${encodeURIComponent(dossier.id)}`;
    card.innerHTML = `
      ${previewHTML}
      <div class="dossier-card__meta">
        <h3 class="dossier-card__name">${dossier.nom}</h3>
        <p class="dossier-card__date">${
          dernier ? `Mis à jour le ${formatDate(dernier.date)}` : "Pas encore de nouvelles"
        }</p>
      </div>
    `;
    wrap.appendChild(card);
  }

  cfg.dossiers.forEach(chargerDossier);
})();
