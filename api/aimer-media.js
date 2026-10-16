// ============================================================
// api/aimer-media.js
// Ajoute ou retire un like sur un média, dans son manifeste.
// ============================================================

import { modifierManifeste, ErreurHttp } from '../lib/manifeste.js';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ erreur: "BLOB_READ_WRITE_TOKEN est absent sur ce déploiement." });
  }

  try {
    const { dossier, url, action } = req.body || {};
    if (!DOSSIERS_AUTORISES.includes(dossier)) return res.status(400).json({ erreur: 'Dossier inconnu' });
    if (!url) return res.status(400).json({ erreur: 'URL manquante' });

    const likes = await modifierManifeste(`manifests/${dossier}.json`, (medias) => {
      const media = medias.find((m) => m.url === url);
      if (!media) throw new ErreurHttp(404, 'Média introuvable');

      const likesActuels = typeof media.likes === 'number' ? media.likes : 0;
      media.likes = action === 'retirer' ? Math.max(0, likesActuels - 1) : likesActuels + 1;
      return { donnees: medias, resultat: media.likes };
    });

    return res.status(200).json({ succes: true, likes });
  } catch (erreur) {
    if (erreur instanceof ErreurHttp) return res.status(erreur.statut).json({ erreur: erreur.message });
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || 'Action impossible.' });
  }
}
