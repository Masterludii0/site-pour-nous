// ============================================================
// api/commenter-media.js
// Ajoute un commentaire (auteur + texte) à un média, dans son
// manifeste. Synchronisé pour tout le monde comme le reste.
// (Le texte est stocké tel quel ; c'est l'affichage, côté site,
// qui neutralise le HTML.)
// ============================================================

import { modifierManifeste, ErreurHttp } from '../lib/manifeste.js';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      erreur: 'BLOB_READ_WRITE_TOKEN est absent sur ce déploiement.',
    });
  }

  try {
    const { dossier, url, auteur, texte } = req.body || {};

    if (!DOSSIERS_AUTORISES.includes(dossier)) {
      return res.status(400).json({ erreur: 'Dossier inconnu' });
    }
    if (!url || !texte || !String(texte).trim()) {
      return res.status(400).json({ erreur: 'Commentaire vide' });
    }

    const commentaire = {
      auteur: String(auteur || 'Anonyme').trim().slice(0, 40) || 'Anonyme',
      texte: String(texte).trim().slice(0, 500),
      date: new Date().toISOString(),
    };

    await modifierManifeste(`manifests/${dossier}.json`, (medias) => {
      const media = medias.find((m) => m.url === url);
      if (!media) throw new ErreurHttp(404, 'Média introuvable');

      if (!Array.isArray(media.commentaires)) media.commentaires = [];
      media.commentaires.push(commentaire);
      return { donnees: medias };
    });

    return res.status(200).json({ succes: true, commentaire });
  } catch (erreur) {
    if (erreur instanceof ErreurHttp) return res.status(erreur.statut).json({ erreur: erreur.message });
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || "Impossible d'ajouter le commentaire." });
  }
}
