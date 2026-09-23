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
    texte: "J'espère que ce 'projet' te feras plaisir car j'y ai mis tout mon temps et mon amour. j'ai la chance d'avoir eu quelqu'un a qui offrir ce genre de choses/petites attentions. Merci"
  },

  // --- Texte d'ouverture (juste sous le hero) ---
  ouverture: `J'ai voulu créer ce site pour garder une trace
  de nous deux. Même s'il y a eu des hauts et
  des bas, je trouve que notre histoire est
  importante et qu'elle mérite de ne jamais être oublié`,

  // --- "Notre histoire" : les panneaux qui défilent à côté de la photo fixe ---
  histoire: [
    {
      date: "Le début",
      titre: "Nos débuts",
      texte: "Bien que j'etais timide au debut et n'osait pas te regarder, je n'oublierais jamais notre rencontre et surtout nos debuts aux soirées etudiantes et ta chambre chez mamie Monique"
    },
    {
      date: "Après",
      titre: "Notre complicité",
      texte: "On était tellement proches que tu me disais que j'étais comme tes sœurs, qu'on avait presque la même relation en dehors de l'amour. On allait jusqu'à accorder nos déguisements et j'en passe."
    },
    {
      date: "Aujourd'hui",
      titre: "Ce qu'on était devenu",
      texte: "Inséparables, une vraie connexion, du moins c'est ce que je pensais..."
    }
  ],

  // --- "Pourquoi toi" : la liste de raisons ---
  raisons: [
    "Tes petits trucs à toi comme la java et le poupoulélé (et ton doudou qu'il fallait recoudre tous les 2 jours).",
    "Ta douceur avec moi.",
    "Ton côté 'grande sœur', tu savais me remettre à ma place et me raisonner quand ca n'allait pas.",
    "Ta famille incroyable que je n'oublierai jamais. L'impression d'en avoir fait partie.",
    "Ta beauté inexplicable, une vraie déesse dont j'oublierai jamais le visage"
  ],

  // --- "Nos moments" : la timeline chronologique (vraie séquence) ---
  moments: [
    { date: "20 Sep. 2024", texte: "Notre première rencontre au WEI." },
    { date: "23 Sep. 2024", texte: "Notre premier bisous chez ta mamie." },
    { date: "Août 2025", texte: "Nos premières vacances ensemble." },
    { date: "Aujourd'hui", texte: "Fin ... ?" }
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

{ emoji: "💳", nom: "La carte NFC de la Saint Valentin 2025", note: "J'ai pris la liberté de le faire sur une carte pour que tu aies la possibilité de le garder pour toujours", media: "Carte_NFC.mp4", type: "video" },
{ emoji: "📽️", nom: "La vidéo specialement pour toi de Alain Eloy", note: "Comme tu aimes la VF de Rick, je voulais te faire plaisir en te faisant ce message par Alain Eloy en personne ", media: "Video_Alain_Eloy.mp4", type: "video" }

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
    signature: "— Ethanaël, je t'aime ... pour toujours",

    // --- Photos des lettres manuscrites que tu as écrites ---
    // Mets tes fichiers dans assets/images/lettres/ et renseigne le nom
    // + une légende courte (comme une date ou un mot-clé) pour chacune.
    images: [
      { fichier: "lettre-1.jpg", legende: "La toute première" },
      { fichier: "lettre-2.jpg", legende: "Celle de l'été 2025" }
    ]
  }
};
