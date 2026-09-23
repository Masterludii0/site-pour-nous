// ============================================================
// api/confirmer-media.js
// Appelée par le client juste après qu'un fichier a été envoyé
// à Vercel Blob : ajoute son titre/description/url au manifeste
// JSON du dossier concerné. C'est ce manifeste que tout le monde
// lit ensuite (via /api/medias) — d'où la synchronisation.
// ============================================================

import { put, head, BlobNotFoundError } from '@vercel/blob';
import nodemailer from 'nodemailer';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

async function envoyerNotifications({ dossierNom, titre, lienDossier, exclure }) {
  // Si l'email n'est pas configuré, on n'envoie rien — silencieusement,
  // ça ne doit jamais faire échouer l'ajout du média lui-même.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  let abonnes = [];
  try {
    const manifestBlob = await head('manifests/abonnes.json');
    const reponse = await fetch(manifestBlob.url);
    abonnes = await reponse.json();
  } catch (e) {
    abonnes = [];
  }

  const exclusion = String(exclure || '').trim().toLowerCase();
  const destinataires = abonnes.filter((email) => email !== exclusion);
  if (!destinataires.length) return;

  const transporteur = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporteur.sendMail({
    from: `"Et maintenant ?" <${process.env.GMAIL_USER}>`,
    to: destinataires,
    subject: `Nouveau souvenir dans "${dossierNom}"`,
    text: `${titre}\n\nVa y jeter un œil : ${lienDossier}`,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      erreur:
        "BLOB_READ_WRITE_TOKEN est absent sur ce déploiement. Vérifie la connexion du Blob store à ce projet et l'environnement Production dans Vercel.",
    });
  }

  try {
    const { dossier, dossierNom, url, type, titre, description, notifierEmail } = req.body || {};

    if (!DOSSIERS_AUTORISES.includes(dossier)) {
      return res.status(400).json({ erreur: 'Dossier inconnu' });
    }
    if (!url || !titre) {
      return res.status(400).json({ erreur: 'Informations manquantes' });
    }

    const manifestPath = `manifests/${dossier}.json`;

    let medias = [];
    try {
      const manifestBlob = await head(manifestPath);
      const reponse = await fetch(manifestBlob.url);
      medias = await reponse.json();
    } catch (e) {
      if (!(e instanceof BlobNotFoundError)) {
        // Une vraie erreur (pas juste "pas encore de manifeste") : on la
        // remonte au lieu de la masquer silencieusement.
        throw e;
      }
      medias = [];
    }

    const nouveauMedia = {
      url: String(url),
      type: type === 'video' ? 'video' : 'image',
      titre: String(titre).slice(0, 100),
      description: String(description || '').slice(0, 500),
      date: new Date().toISOString(),
    };

    medias.push(nouveauMedia);

    await put(manifestPath, JSON.stringify(medias), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    try {
      await envoyerNotifications({
        dossierNom: dossierNom || dossier,
        titre: nouveauMedia.titre,
        lienDossier: `https://${req.headers.host}/dossier.html?personne=${dossier}`,
        exclure: notifierEmail,
      });
    } catch (erreurEmail) {
      // L'ajout du média a réussi, on ne le fait pas échouer pour un
      // problème d'envoi d'email — juste consigné dans les logs.
      console.error('Envoi des notifications échoué :', erreurEmail);
    }

    return res.status(200).json({ succes: true, media: nouveauMedia });
  } catch (erreur) {
    console.error(erreur);
    return res.status(500).json({ erreur: erreur.message || "Impossible d'enregistrer ce média." });
  }
}