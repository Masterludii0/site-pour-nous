/* ============================================================
   NOUVELLES-CONFIG.JS — configuration de la page "Et maintenant ?"
   ============================================================
   Les photos/vidéos ne sont plus listées ici à la main : elles sont
   ajoutées directement depuis le site (bouton + sur chaque dossier)
   et stockées sur Vercel Blob. Ce fichier ne définit plus que la
   liste des dossiers qui existent et le texte d'intro.

   Pour ajouter un nouveau dossier (une nouvelle personne) : ajoute
   juste une ligne { id, nom } ci-dessous, et le même id dans le
   tableau DOSSIERS_AUTORISES des fichiers api/*.js.
   ============================================================ */

const NOUVELLES_CONFIG = {
  intro: {
    titre: "Et maintenant ?",
    texte: `Loin des messages qui s'effacent et des stories qui
    disparaissent au bout de 24h, un endroit simple pour se dire
    "qu'est-ce qu'on devient". Chacun son dossier — appuie sur le
    petit bouton "+" pour y ajouter une photo ou une vidéo.`
  },

  dossiers: [
    { id: "moi", nom: "Moi" },
    { id: "morgane", nom: "Morgane" }
  ]
};
