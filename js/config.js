/* ============================================================
   CONFIG.JS — LE SEUL FICHIER QUE TU AS BESOIN DE MODIFIER
   ============================================================
   Change les valeurs ci-dessous avec vos infos. Tout le site
   (compte à rebours, histoire, galerie, lettre) se met à jour
   automatiquement. Aucune autre connaissance technique requise.
   ============================================================ */

const SITE_CONFIG = {

  // --- Identité ---
  prenom: "Toi",              // ton prénom
  partenaire: "Mon amour",    // le prénom de ta copine

  // --- Note du jour (remplace l'ancien compte à rebours) ---
  // Change ce texte aussi souvent que tu veux, c'est une petite note
  // que tu lui écris. La date du dessus se met à jour toute seule.
  noteDuJour: {
    titre: "Note du jour",
    texte: "Aujourd'hui, j'ai pensé à toi en buvant mon café. Rien de plus, juste ça."
  },

  // --- Texte d'ouverture (juste sous le hero) ---
  ouverture: `Il y a des rencontres qui ne ressemblent à aucune autre.
  La nôtre en fait partie. Ce site n'est pas un site — c'est une
  lettre un peu plus longue que les autres, pour te dire ce que
  je n'arrive jamais tout à fait à dire à voix haute.`,

  // --- "Notre histoire" : les panneaux qui défilent à côté de la photo fixe ---
  histoire: [
    {
      date: "Le début",
      titre: "Le premier regard",
      texte: "Raconte ici comment vous vous êtes rencontrés : le lieu, le moment, ce que tu as pensé la première fois que tu l'as vue."
    },
    {
      date: "Après",
      titre: "Les premiers mots",
      texte: "Le premier message, le premier rendez-vous, la première fois où tu as su que ce serait différent des autres."
    },
    {
      date: "Aujourd'hui",
      titre: "Ce que vous êtes devenus",
      texte: "Décris votre histoire aujourd'hui, ce que vous construisez ensemble, ce qui a changé depuis le premier jour."
    }
  ],

  // --- "Pourquoi toi" : la liste de raisons ---
  raisons: [
    "Ta façon de rire trop fort et de t'en excuser juste après.",
    "Comment tu rends les journées ordinaires un peu plus douces.",
    "Ta patience, même les jours où je n'en mérite pas autant.",
    "Cette manière que tu as de m'écouter, vraiment.",
    "Tout ce qu'on construit, à deux, sans jamais forcer."
  ],

  // --- "Nos moments" : la timeline chronologique (vraie séquence) ---
  moments: [
    { date: "Jan. 2023", texte: "Notre première rencontre." },
    { date: "Mars 2023", texte: "Notre premier voyage ensemble." },
    { date: "Déc. 2023", texte: "Le jour où on a emménagé ensemble." },
    { date: "Aujourd'hui", texte: "Et la suite continue de s'écrire." }
  ],

  // --- Galerie photo : mets tes fichiers dans assets/images/gallery/ ---
  // et renseigne juste le nom du fichier ici (voir le README dans ce dossier).
  galerie: [
    { fichier: "photo-1.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-2.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-3.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-4.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-5.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-6.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-7.jpg", legende: "Un souvenir à toi" },
    { fichier: "photo-8.jpg", legende: "Un souvenir à toi" }
  ],

  // --- Nos cadeaux : petite liste sous la galerie ---
  // Pour chaque cadeau, tu peux soit garder juste un emoji, soit mettre
  // une vraie photo/vidéo : mets le fichier dans assets/images/cadeaux/
  // et renseigne son nom dans "media" (laisse vide pour garder l'emoji).
  // "type" : "image" (par défaut) ou "video".
  cadeaux: [
    { emoji: "💫", nom: "Le bracelet", note: "Pour ton anniversaire", media: "", type: "image" },
    { emoji: "🧳", nom: "Le weekend surprise", note: "Notre premier voyage ensemble", media: "", type: "image" },
    { emoji: "✉️", nom: "La lettre manuscrite", note: "Écrite un soir de pluie", media: "", type: "image" }
  ],

  // --- La lettre finale ---
  lettre: {
    corps: `Je voulais un endroit rien qu'à nous, loin des messages qui
    s'effacent et des conversations qu'on oublie. Alors j'ai construit
    celui-ci, ligne par ligne, comme on écrit une lettre qu'on prend
    le temps de bien choisir.

    Merci d'être exactement qui tu es. Merci de rendre tout, même
    les journées les plus banales, un peu plus lumineuses.

    Je t'aime.`,
    signature: "— Toi, pour toujours",

    // --- Photos des lettres manuscrites que tu as écrites ---
    // Mets tes fichiers dans assets/images/lettres/ et renseigne le nom
    // + une légende courte (comme une date ou un mot-clé) pour chacune.
    images: [
      { fichier: "lettre-1.jpg", legende: "La toute première" },
      { fichier: "lettre-2.jpg", legende: "Celle du printemps" }
    ]
  }
};
