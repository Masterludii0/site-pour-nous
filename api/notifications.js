/* ============================================================
   NOTIFICATIONS.JS — bannière d'inscription aux notifications
   ============================================================
   Contrairement au popup musique (qui redemande à chaque visite),
   ici on utilise localStorage : la réponse (oui ou non) est
   mémorisée durablement sur cet appareil/navigateur et on ne
   redemande jamais plus. C'est une reconnaissance par appareil,
   pas par personne — techniquement, aucun site ne peut reconnaître
   "Morgane" elle-même sans un vrai compte avec mot de passe.
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "notifState";

  function lireEtat() {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      return brut ? JSON.parse(brut) : null;
    } catch (e) {
      return null;
    }
  }

  function ecrireEtat(etat) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(etat));
    } catch (e) {
      // localStorage indisponible : le site continue de fonctionner,
      // juste sans mémoire (redemandera à chaque visite).
    }
  }

  // Utilisé par dossier-content.js pour exclure l'auteur de l'ajout
  // de sa propre notification.
  window.getNotifEmail = function () {
    const etat = lireEtat();
    return etat && etat.statut === "oui" ? etat.email : null;
  };

  const dejaRepondu = lireEtat();
  if (dejaRepondu) return;

  const banniere = document.createElement("div");
  banniere.className = "notif-banniere";
  banniere.innerHTML = `
    <button type="button" class="notif-banniere__fermer" data-notif-fermer aria-label="Fermer">&times;</button>
    <p class="notif-banniere__texte">
      Envie d'être averti·e par email quand une photo ou vidéo est ajoutée
      dans « Et maintenant ? » ?
    </p>
    <form class="notif-banniere__form" data-notif-form>
      <input type="email" placeholder="ton@email.com" required data-notif-email autocomplete="email">
      <button type="submit" class="notif-banniere__ok">M'avertir</button>
    </form>
    <button type="button" class="notif-banniere__non" data-notif-non>Non merci</button>
  `;

  function fermer(statut, email) {
    banniere.classList.remove("is-visible");
    ecrireEtat({ statut, email: email || null });
    setTimeout(() => banniere.remove(), 400);
  }

  banniere.addEventListener("click", (e) => {
    if (e.target.closest("[data-notif-non], [data-notif-fermer]")) {
      fermer("non");
    }
  });

  banniere.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = banniere.querySelector("[data-notif-email]");
    const email = emailInput.value.trim();
    if (!email) return;

    const boutonOk = banniere.querySelector(".notif-banniere__ok");
    boutonOk.disabled = true;
    boutonOk.textContent = "…";

    try {
      await fetch("/api/inscrire-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (erreur) {
      console.error("Inscription notification échouée :", erreur);
    }

    fermer("oui", email);
  });

  document.body.appendChild(banniere);
  setTimeout(() => banniere.classList.add("is-visible"), 2500);
})();
