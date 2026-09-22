// ============================================================
// api/inscrire-notification.js
// Ajoute un email à la liste des personnes à prévenir quand un
// média est ajouté. Stocké dans manifests/abonnes.json, comme
// les autres manifestes du site.
// ============================================================

import { put, head, BlobNotFoundError } from '@vercel/blob';

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

    const manifestPath = 'manifests/abonnes.json';

    let abonnes = [];
    try {
      const manifestBlob = await head(manifestPath);
      const reponse = await fetch(manifestBlob.url);
      abonnes = await reponse.json();
    } catch (e) {
      if (!(e instanceof BlobNotFoundError)) throw e;
      abonnes = [];
    }

    if (!abonnes.includes(email)) {
      abonnes.push(email);
      await put(manifestPath, JSON.stringify(abonnes), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    }

    return res.status(200).json({ succes: true });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || 'Inscription impossible.' });
  }
}
