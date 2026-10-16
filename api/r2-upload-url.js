// ============================================================
// api/r2-upload-url.js
// Délivre une URL d'envoi signée, valable 15 minutes, pour que le
// navigateur envoie le fichier DIRECTEMENT à Cloudflare R2 (sans
// repasser par cette fonction, dont la requête est limitée à ~4,5 Mo
// — beaucoup trop petit pour une vidéo).
//
// Garde-fous (R2 est gratuit jusqu'à 10 Go, puis facturé) :
//   - taille maximale par fichier,
//   - formats autorisés uniquement,
//   - refus d'un envoi qui ferait dépasser la limite de stockage
//     (9 Go par défaut, réglable avec la variable R2_LIMITE_GO),
//     pour ne jamais payer par accident.
//
// Variables d'environnement requises (Vercel → Settings → Environment
// Variables, cochées sur Production) :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_BUCKET, R2_PUBLIC_URL
// ============================================================

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

const TYPES_AUTORISES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

const MAX_FICHIER_OCTETS = 1.2 * 1024 ** 3; // 1,2 Go par fichier
const VARIABLES_REQUISES = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
];

function creerClientR2() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    // Sans ces deux lignes, les versions récentes du SDK ajoutent un
    // contrôle d'intégrité (checksum) à l'URL signée que le navigateur ne
    // sait pas fournir : l'envoi échouerait avec "SignatureDoesNotMatch".
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

function urlPublique() {
  let base = String(process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
  return base;
}

async function stockageUtilise(client, bucket) {
  let total = 0;
  let jeton;
  do {
    const reponse = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: jeton })
    );
    for (const objet of reponse.Contents || []) total += objet.Size || 0;
    jeton = reponse.IsTruncated ? reponse.NextContinuationToken : undefined;
  } while (jeton);
  return total;
}

const enMo = (octets) => Math.round(octets / (1024 * 1024));
const enGo = (octets) => (octets / 1024 ** 3).toFixed(2).replace('.', ',');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  const manquantes = VARIABLES_REQUISES.filter((nom) => !process.env[nom]);
  if (manquantes.length) {
    return res.status(500).json({
      erreur: `Configuration Cloudflare R2 incomplète : il manque ${manquantes.join(
        ', '
      )} dans les variables d'environnement Vercel (cochées sur Production). Ajoute-les puis redéploie.`,
    });
  }

  // Erreur classique : coller l'adresse de l'API S3 (…r2.cloudflarestorage.com)
  // au lieu de l'adresse publique (https://pub-….r2.dev). L'API S3 exige une
  // authentification : les médias s'enverraient mais ne s'afficheraient jamais.
  if (/cloudflarestorage\.com/i.test(urlPublique())) {
    return res.status(500).json({
      erreur:
        "R2_PUBLIC_URL est mal réglée : elle contient l'adresse de l'API (…r2.cloudflarestorage.com). Mets l'adresse publique du bucket (Settings → Public Development URL, du type https://pub-xxxx.r2.dev), puis redéploie.",
    });
  }

  try {
    const { dossier, nomFichier, contentType, taille } = req.body || {};

    if (!DOSSIERS_AUTORISES.includes(dossier)) {
      return res.status(400).json({ erreur: 'Dossier inconnu' });
    }

    const type = String(contentType || '').toLowerCase();
    if (!TYPES_AUTORISES.includes(type)) {
      return res.status(400).json({
        erreur: `Format non pris en charge (${type || 'inconnu'}). Utilise JPG, PNG, WebP, GIF, MP4, MOV ou WebM.`,
      });
    }

    const octets = Number(taille);
    if (!Number.isFinite(octets) || octets <= 0) {
      return res.status(400).json({ erreur: 'Taille du fichier invalide.' });
    }
    if (octets > MAX_FICHIER_OCTETS) {
      return res.status(400).json({
        erreur: `Fichier trop lourd (${enMo(octets)} Mo). Maximum : ${enGo(
          MAX_FICHIER_OCTETS
        )} Go — compresse la vidéo avant de l'envoyer.`,
      });
    }

    const client = creerClientR2();
    const bucket = process.env.R2_BUCKET;

    const limiteOctets = (Number(process.env.R2_LIMITE_GO) || 9) * 1024 ** 3;
    const utilise = await stockageUtilise(client, bucket);
    if (utilise + octets > limiteOctets) {
      return res.status(400).json({
        erreur: `Le stockage gratuit est presque plein (${enGo(utilise)} Go utilisés sur ${enGo(
          limiteOctets
        )} Go autorisés). Supprime d'anciens souvenirs pour faire de la place.`,
      });
    }

    const nomPropre =
      String(nomFichier || 'fichier')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(-80) || 'fichier';
    const cle = `nouvelles/${dossier}/${Date.now()}-${nomPropre}`;

    const commande = new PutObjectCommand({
      Bucket: bucket,
      Key: cle,
      ContentType: type,
      ContentLength: octets,
    });
    // "content-type" est signé : le navigateur ne peut envoyer QUE le type
    // vérifié plus haut (sinon R2 refuse), la liste des formats autorisés
    // ne peut donc pas être contournée. "content-length" l'est déjà par
    // défaut : la taille réellement envoyée doit être celle déclarée.
    const uploadUrl = await getSignedUrl(client, commande, {
      expiresIn: 900,
      signableHeaders: new Set(['content-type']),
    });

    return res.status(200).json({
      uploadUrl,
      publicUrl: `${urlPublique()}/${cle}`,
    });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({
      erreur: erreur.message || "Impossible de préparer l'envoi.",
    });
  }
}
