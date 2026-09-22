// ============================================================
// api/medias.js
// GET /api/medias?dossier=moi  ->  { medias: [...] }
// Lu par nouvelles.html (aperçu) et dossier.html (grille complète).
// Comme tout le monde lit le même manifeste stocké sur Vercel Blob,
// un ajout fait par une personne apparaît pour tout le monde.
// ============================================================

import { head, BlobNotFoundError } from '@vercel/blob';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

export default async function handler(req, res) {
  const dossier = String(req.query.dossier || '');

  if (!DOSSIERS_AUTORISES.includes(dossier)) {
    return res.status(400).json({ erreur: 'Dossier inconnu' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      erreur:
        "BLOB_READ_WRITE_TOKEN est absent sur ce déploiement. Vérifie la connexion du Blob store à ce projet et l'environnement Production dans Vercel.",
    });
  }

  try {
    const manifestPath = `manifests/${dossier}.json`;
    const manifestBlob = await head(manifestPath);
    const reponse = await fetch(manifestBlob.url);
    const medias = await reponse.json();
    return res.status(200).json({ medias });
  } catch (e) {
    if (e instanceof BlobNotFoundError) {
      // Pas encore de manifeste = dossier vide pour l'instant, pas une erreur.
      return res.status(200).json({ medias: [] });
    }
    console.error(e);
    return res.status(500).json({ erreur: e.message || 'Erreur inconnue' });
  }
}
