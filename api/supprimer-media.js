// ============================================================
// api/supprimer-media.js
// Retire un média du manifeste JSON du dossier, et supprime le
// fichier correspondant sur Vercel Blob pour ne rien laisser
// traîner. Comme pour l'ajout, tout le monde voit la suppression
// dès le prochain chargement (même manifeste partagé).
// ============================================================

import { put, head, del, BlobNotFoundError } from '@vercel/blob';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

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
    const { dossier, url } = req.body || {};

    if (!DOSSIERS_AUTORISES.includes(dossier)) {
      return res.status(400).json({ erreur: 'Dossier inconnu' });
    }
    if (!url) {
      return res.status(400).json({ erreur: 'URL manquante' });
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

    const mediasRestants = medias.filter((m) => m.url !== url);

    if (mediasRestants.length === medias.length) {
      return res.status(404).json({ erreur: 'Ce média est introuvable dans ce dossier.' });
    }

    await put(manifestPath, JSON.stringify(mediasRestants), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    // On supprime aussi le fichier lui-même. Si ça échoue, ce n'est pas
    // bloquant : le média a déjà disparu du manifeste, donc du site.
    try {
      await del(url);
    } catch (e) {
      console.error("Le fichier n'a pas pu être supprimé du stockage :", e);
    }

    return res.status(200).json({ succes: true });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || 'Suppression impossible.' });
  }
}
