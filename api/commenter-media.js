// ============================================================
// api/commenter-media.js
// Ajoute un commentaire (auteur + texte) à un média, dans son
// manifeste. Synchronisé pour tout le monde comme le reste.
// (Le texte est stocké tel quel ; c'est l'affichage, côté site,
// qui neutralise le HTML.)
// ============================================================

import { put, head, BlobNotFoundError } from '@vercel/blob';

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

    const manifestPath = `manifests/${dossier}.json`;

    let medias = [];
    try {
      const manifestBlob = await head(manifestPath);
      const reponse = await fetch(manifestBlob.url);
      medias = await reponse.json();
    } catch (e) {
      if (!(e instanceof BlobNotFoundError)) throw e;
      medias = [];
    }

    const media = medias.find((m) => m.url === url);
    if (!media) {
      return res.status(404).json({ erreur: 'Média introuvable' });
    }

    if (!Array.isArray(media.commentaires)) media.commentaires = [];

    const commentaire = {
      auteur: String(auteur || 'Anonyme').trim().slice(0, 40) || 'Anonyme',
      texte: String(texte).trim().slice(0, 500),
      date: new Date().toISOString(),
    };
    media.commentaires.push(commentaire);

    await put(manifestPath, JSON.stringify(medias), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return res.status(200).json({ succes: true, commentaire });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || "Impossible d'ajouter le commentaire." });
  }
}
