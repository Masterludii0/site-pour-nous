// ============================================================
// api/blob-upload.js
// Délivre un jeton d'upload à usage unique pour que le navigateur
// envoie le fichier DIRECTEMENT à Vercel Blob (sans repasser par
// cette fonction, qui a une limite de taille de requête ~4.5 Mo —
// trop petit pour une vidéo). C'est le mécanisme officiel de
// @vercel/blob pour les uploads faits depuis le client.
// ============================================================

import { handleUpload } from '@vercel/blob/client';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

export default async function handler(request, response) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(500).json({
      error:
        "BLOB_READ_WRITE_TOKEN est absent sur ce déploiement. Vérifie que le Blob store est bien connecté à ce projet ET que la variable est activée pour l'environnement Production dans Vercel, puis redéploie.",
    });
  }

  const body = request.body;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const dossier = pathname.split('/')[1]; // "nouvelles/<dossier>/..."
        if (!DOSSIERS_AUTORISES.includes(dossier)) {
          throw new Error('Dossier inconnu');
        }
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/quicktime',
            'video/webm',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024, // 5 Go
          // Par défaut le jeton expire après 30s, bien trop court pour
          // l'envoi d'une vidéo de plusieurs centaines de Mo / quelques Go
          // sur une connexion normale. On le rend valable 4h.
          validUntil: Math.floor(Date.now() / 1000) + 4 * 60 * 60,
        };
      },
      onUploadCompleted: async () => {
        // La confirmation (mise à jour du manifeste) est faite
        // explicitement par le client via /api/confirmer-media,
        // donc rien à faire ici.
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
