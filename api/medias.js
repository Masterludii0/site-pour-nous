// ============================================================
// api/medias.js
// GET /api/medias?dossier=moi  ->  { medias: [...] }
// Lu par nouvelles.html (aperçu) et dossier.html (grille complète).
// Comme tout le monde lit le même manifeste stocké sur Vercel Blob,
// un ajout fait par une personne apparaît pour tout le monde.
// ============================================================

import { lireManifeste } from '../lib/manifeste.js';

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
    // Pas de cache : on veut toujours la version la plus récente.
    res.setHeader('Cache-Control', 'no-store');
    const { donnees } = await lireManifeste(`manifests/${dossier}.json`);
    return res.status(200).json({ medias: donnees });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erreur: e.message || 'Erreur inconnue' });
  }
}
