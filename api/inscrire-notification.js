// ============================================================
// api/inscrire-notification.js
// Ajoute un email à la liste des personnes à prévenir quand un
// média est ajouté. Stocké dans manifests/abonnes.json, comme
// les autres manifestes du site.
// ============================================================

import { modifierManifeste } from '../lib/manifeste.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      erreur: "BLOB_READ_WRITE_TOKEN est absent sur ce déploiement.",
    });
  }

  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValide) {
      return res.status(400).json({ erreur: 'Adresse email invalide.' });
    }

    await modifierManifeste('manifests/abonnes.json', (abonnes) => {
      // Déjà inscrit : rien à écrire.
      if (abonnes.includes(email)) return {};
      abonnes.push(email);
      return { donnees: abonnes };
    });

    return res.status(200).json({ succes: true });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || 'Inscription impossible.' });
  }
}
