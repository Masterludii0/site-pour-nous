import { put, head, BlobNotFoundError } from '@vercel/blob';

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
    if (!media) return res.status(404).json({ erreur: 'Média introuvable' });

    const likesActuels = typeof media.likes === 'number' ? media.likes : 0;
    media.likes = action === 'retirer' ? Math.max(0, likesActuels - 1) : likesActuels + 1;

    await put(manifestPath, JSON.stringify(medias), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
    });

    return res.status(200).json({ succes: true, likes: media.likes });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || 'Action impossible.' });
  }
}
