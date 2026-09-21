// ============================================================
// api/confirmer-media.js
// Appelée par le client juste après qu'un fichier a été envoyé
// à Vercel Blob : ajoute son titre/description/url au manifeste
// JSON du dossier concerné. C'est ce manifeste que tout le monde
// lit ensuite (via /api/medias) — d'où la synchronisation.
// ============================================================

import { put, head } from '@vercel/blob';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  try {
    const { dossier, url, type, titre, description } = req.body || {};

    if (!DOSSIERS_AUTORISES.includes(dossier)) {
      return res.status(400).json({ erreur: 'Dossier inconnu' });
    }
    if (!url || !titre) {
      return res.status(400).json({ erreur: 'Informations manquantes' });
    }

    const manifestPath = `manifests/${dossier}.json`;

    let medias = [];
    try {
      const manifestBlob = await head(manifestPath);
      const reponse = await fetch(manifestBlob.url);
      medias = await reponse.json();
    } catch (e) {
      // Pas encore de manifeste pour ce dossier : première entrée.
      medias = [];
    }

    const nouveauMedia = {
      url: String(url),
      type: type === 'video' ? 'video' : 'image',
      titre: String(titre).slice(0, 100),
      description: String(description || '').slice(0, 500),
      date: new Date().toISOString(),
    };

    medias.push(nouveauMedia);

    await put(manifestPath, JSON.stringify(medias), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return res.status(200).json({ succes: true, media: nouveauMedia });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: "Impossible d'enregistrer ce média." });
  }
}
