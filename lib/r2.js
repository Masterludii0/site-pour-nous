// ============================================================
// lib/r2.js
// Petits outils pour interroger Cloudflare R2 depuis les fonctions.
//
// Le site ne permet plus de supprimer un souvenir : la suppression se
// fait uniquement depuis le tableau de bord Cloudflare (R2 → ton bucket).
// Pour qu'un fichier supprimé là-bas disparaisse aussi du site, /api/medias
// vérifie quels fichiers existent encore dans le bucket.
// ============================================================

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const VARIABLES_REQUISES = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
];

export function r2EstConfigure() {
  return VARIABLES_REQUISES.every((nom) => process.env[nom]);
}

export function urlPublique() {
  let base = String(process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
  return base;
}

/**
 * Renvoie l'ensemble des clés (chemins) des fichiers présents dans le
 * dossier R2 `nouvelles/<dossier>/`.
 */
export async function clesExistantes(dossier) {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  const cles = new Set();
  let jeton;
  do {
    const reponse = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET,
        Prefix: `nouvelles/${dossier}/`,
        ContinuationToken: jeton,
      })
    );
    for (const objet of reponse.Contents || []) cles.add(objet.Key);
    jeton = reponse.IsTruncated ? reponse.NextContinuationToken : undefined;
  } while (jeton);

  return cles;
}
