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
          maximumSizeInBytes: 200 * 1024 * 1024, // 200 Mo
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
