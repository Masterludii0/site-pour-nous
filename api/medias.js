// ============================================================
// api/medias.js
// GET /api/medias?dossier=moi  ->  { medias: [...] }
// Lu par nouvelles.html (aperçu) et dossier.html (grille complète).
// Comme tout le monde lit le même manifeste stocké sur Vercel Blob,
// un ajout fait par une personne apparaît pour tout le monde.
//
// La suppression d'un souvenir se fait uniquement depuis Cloudflare R2 :
// un média dont le fichier n'existe plus dans le bucket est masqué ici.
// ============================================================

import { lireManifeste } from '../lib/manifeste.js';
import { r2EstConfigure, urlPublique, clesExistantes } from '../lib/r2.js';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

// Retire les médias dont le fichier a été supprimé de R2. En cas de
// problème pour interroger R2, on n'écarte rien : mieux vaut afficher
// un média en trop que tout faire disparaître.
async function sansFichiersSupprimes(medias, dossier) {
  if (!r2EstConfigure() || !medias.length) return medias;
  try {
    const base = urlPublique();
    const prefixe = `${base}/nouvelles/`;
    const cles = await clesExistantes(dossier);
    return medias.filter((m) => {
      const url = String(m.url || '');
      if (!url.startsWith(prefixe)) return true; // ancien média (hors R2) : on garde
      return cles.has(url.slice(base.length + 1));
    });
  } catch (e) {
    console.error("Vérification des fichiers R2 impossible, aucun média masqué :", e);
    return medias;
  }
}

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
    const medias = await sansFichiersSupprimes(donnees, dossier);
    return res.status(200).json({ medias });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erreur: e.message || 'Erreur inconnue' });
  }
}
