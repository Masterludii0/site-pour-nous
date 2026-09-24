/* ============================================================
   DOSSIER-CONTENT.JS — page dossier.html
   - Charge les médias du dossier via /api/medias (synchronisé)
   - Grille : juste le média, sans titre/description visibles
   - Clic sur un média -> lightbox avec titre + description
   - Bouton "+" -> formulaire -> upload direct vers Vercel Blob
     -> confirmation via /api/confirmer-media -> tout le monde
     voit le nouvel ajout au prochain chargement de la page.
   ============================================================ */

(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const personneId = params.get("personne");
  const dossierMeta = NOUVELLES_CONFIG.dossiers.find((d) => d.id === personneId);

  const titreEl = document.querySelector("[data-dossier-titre]");
  const grilleEl = document.querySelector("[data-dossier-grille]");
  const videEl = document.querySelector("[data-dossier-vide]");
  const fab = document.querySelector("[data-uploader-fab]");

  if (!dossierMeta) {
    if (titreEl) titreEl.textContent = "Dossier introuvable";
    if (videEl) {
      videEl.hidden = false;
      videEl.textContent = "Ce dossier n'existe pas (ou plus).";
    }
    if (fab) fab.hidden = true;
    return;
  }

  if (titreEl) titreEl.textContent = dossierMeta.nom;
  document.title = `${dossierMeta.nom} — Et maintenant ?`;

  let mediasActuels = [];

  /* ---------- Chargement + rendu de la grille ---------- */
  function mediaCardHTML(media, index) {
    const inner =
      media.type === "video"
        ? `<video src="${media.url}" muted preload="metadata" class="media-card__media"></video>
           <span class="media-card__play" aria-hidden="true">▶</span>`
        : `<img src="${media.url}" alt="" loading="lazy" class="media-card__media">`;

    return `
      <figure class="media-card">
        <button type="button" class="media-card__trigger" data-media-index="${index}">
          ${inner}
        </button>
      </figure>
    `;
  }

  function renderGrid() {
    if (!mediasActuels.length) {
      grilleEl.innerHTML = "";
      videEl.hidden = false;
      videEl.textContent = "Rien pour l'instant. Sois le premier à ajouter un souvenir.";
      return;
    }
    videEl.hidden = true;
    grilleEl.innerHTML = mediasActuels.map(mediaCardHTML).join("");
  }

  async function chargerMedias() {
    try {
      const reponse = await fetch(`/api/medias?dossier=${encodeURIComponent(dossierMeta.id)}`);
      const donnees = await reponse.json();
      mediasActuels = (donnees.medias || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      mediasActuels = [];
    }
    renderGrid();
  }

  chargerMedias();

  /* ---------- Lightbox : titre + description visibles seulement ici ---------- */
  const lightbox = document.querySelector(".lightbox");
  const imgEl = lightbox.querySelector(".lightbox__img");
  const videoEl = lightbox.querySelector(".lightbox__video");
  const lbTitleEl = lightbox.querySelector("[data-lightbox-title]");
  const lbDescEl = lightbox.querySelector("[data-lightbox-description]");
  const deleteBtn = lightbox.querySelector("[data-lightbox-delete]");
  const closeBtn = lightbox.querySelector(".lightbox__close");

  let mediaOuvert = null;

  function openLightbox(media) {
    mediaOuvert = media;
    if (media.type === "video") {
      videoEl.src = media.url;
      videoEl.hidden = false;
      imgEl.hidden = true;
      imgEl.src = "";
    } else {
      imgEl.src = media.url;
      imgEl.hidden = false;
      videoEl.hidden = true;
      videoEl.pause();
      videoEl.src = "";
    }
    lbTitleEl.textContent = media.titre || "";
    lbDescEl.textContent = media.description || "";
    lbDescEl.hidden = !media.description;
    deleteBtn.disabled = false;
    deleteBtn.textContent = "Supprimer ce souvenir";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    videoEl.pause();
    videoEl.src = "";
    imgEl.src = "";
    mediaOuvert = null;
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".media-card__trigger");
    if (!trigger) return;
    const media = mediasActuels[Number(trigger.getAttribute("data-media-index"))];
    if (media) openLightbox(media);
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

  deleteBtn.addEventListener("click", async () => {
    if (!mediaOuvert) return;
    const confirmation = window.confirm("Supprimer ce souvenir ? C'est définitif.");
    if (!confirmation) return;

    deleteBtn.disabled = true;
    deleteBtn.textContent = "Suppression…";

    try {
      const reponse = await fetch("/api/supprimer-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossier: dossierMeta.id, url: mediaOuvert.url }),
      });

      if (!reponse.ok) {
        const donnees = await reponse.json().catch(() => ({}));
        throw new Error(donnees.erreur || `Erreur ${reponse.status}`);
      }

      closeLightbox();
      await chargerMedias();
    } catch (erreur) {
      console.error(erreur);
      window.alert(`La suppression a échoué : ${erreur.message}`);
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Supprimer ce souvenir";
    }
  });

  /* ---------- Ajout d'un souvenir (bouton + / formulaire) ---------- */
  const modal = document.querySelector("[data-uploader-modal]");
  const form = document.querySelector("[data-uploader-form]");
  const fileInput = document.querySelector("[data-uploader-file]");
  const titreInput = document.querySelector("[data-uploader-titre]");
  const descriptionInput = document.querySelector("[data-uploader-description]");
  const messageEl = document.querySelector("[data-uploader-message]");
  const submitBtn = document.querySelector("[data-uploader-submit]");
  const closeUploaderBtn = document.querySelector("[data-uploader-close]");

  function openModal() {
    modal.hidden = false;
    messageEl.textContent = "";
  }

  function closeModal() {
    modal.hidden = true;
    form.reset();
  }

  fab.addEventListener("click", openModal);
  closeUploaderBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fichier = fileInput.files[0];
    const titre = titreInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!fichier) {
      messageEl.textContent = "Choisis une photo ou une vidéo.";
      return;
    }
    if (!titre) {
      messageEl.textContent = "Ajoute un titre.";
      return;
    }

    submitBtn.disabled = true;
    messageEl.textContent = "Envoi en cours…";

    const estVideo =
      fichier.type.startsWith("video") || /\.(mov|mp4|m4v|webm|mkv|avi|3gp)$/i.test(fichier.name);
    const type = estVideo ? "video" : "image";
    const nomPropre = fichier.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const cheminBlob = `nouvelles/${dossierMeta.id}/${Date.now()}-${nomPropre}`;

    let blob;
    try {
      // Chargé dynamiquement (fonctionne dans un <script> classique,
      // pas besoin de convertir toute la page en modules).
      const { upload } = await import("https://esm.sh/@vercel/blob/client");
      messageEl.textContent = "Envoi en cours… ça peut prendre plusieurs minutes pour une vidéo, merci de patienter sans fermer la page.";
      blob = await upload(cheminBlob, fichier, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        // Indispensable pour les gros fichiers (vidéos) : découpe l'envoi
        // en plusieurs parties, les envoie avec des tentatives de reprise
        // en cas de coupure, au lieu d'une seule requête géante fragile.
        multipart: true,
        // Pas de onUploadProgress : sur Safari, ça force @vercel/blob à
        // envoyer le corps de la requête en ReadableStream, ce que Safari
        // affirme supporter (faux positif d'un test de détection connu
        // pour être cassé sur Safari) puis refuse réellement au moment
        // de l'envoi, avec l'erreur "ReadableStream uploading is not
        // supported". Sans ce callback, le SDK envoie un Blob classique,
        // qui fonctionne partout, y compris sur Safari/iPhone.
      });
    } catch (erreurEnvoi) {
      console.error("Échec de l'envoi vers Vercel Blob :", erreurEnvoi);

      // Le SDK @vercel/blob affiche toujours le même message générique
      // ("Failed to retrieve the client token"), quelle que soit la vraie
      // cause. On reproduit sa requête nous-mêmes pour lire la vraie
      // réponse JSON (qui, elle, contient le vrai message).
      let raison = erreurEnvoi.message || "erreur inconnue";
      try {
        const diagnostic = await fetch("/api/blob-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "blob.generate-client-token",
            payload: {
              pathname: cheminBlob,
              callbackUrl: `${window.location.origin}/api/blob-upload`,
              multipart: false,
            },
          }),
        });
        const donnees = await diagnostic.json().catch(() => ({}));
        if (donnees.error) raison = donnees.error;
      } catch (e) {
        // Le diagnostic lui-même a échoué : on garde le message d'origine.
      }

      messageEl.textContent = `Échec de l'envoi : ${raison}`;
      submitBtn.disabled = false;
      return;
    }

    try {
      const reponse = await fetch("/api/confirmer-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossier: dossierMeta.id,
          dossierNom: dossierMeta.nom,
          url: blob.url,
          type,
          titre,
          description,
          notifierEmail: window.getNotifEmail ? window.getNotifEmail() : null,
        }),
      });

      if (!reponse.ok) {
        const donnees = await reponse.json().catch(() => ({}));
        throw new Error(donnees.erreur || `Erreur ${reponse.status}`);
      }

      messageEl.textContent = "Ajouté !";
      await chargerMedias();
      setTimeout(closeModal, 700);
    } catch (erreurConfirmation) {
      console.error("Fichier envoyé mais non enregistré :", erreurConfirmation);
      messageEl.textContent = `Fichier envoyé mais pas enregistré : ${erreurConfirmation.message}`;
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
