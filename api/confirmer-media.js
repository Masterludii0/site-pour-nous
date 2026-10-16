// ============================================================
// api/confirmer-media.js
// Appelée par le client juste après qu'un fichier a été envoyé
// à Cloudflare R2 : ajoute son titre/description/url au manifeste
// JSON du dossier concerné (stocké, lui, sur Vercel Blob : c'est un
// tout petit fichier). C'est ce manifeste que tout le monde lit
// ensuite (via /api/medias) — d'où la synchronisation.
// ============================================================

import nodemailer from 'nodemailer';
import { lireManifeste, modifierManifeste } from '../lib/manifeste.js';

const DOSSIERS_AUTORISES = ['moi', 'morgane'];

function urlPublique() {
  let base = String(process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
  if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
  return base;
}

async function envoyerNotifications({ dossierNom, titre, lienDossier, exclure }) {
  // Si l'email n'est pas configuré, on n'envoie rien — silencieusement,
  // ça ne doit jamais faire échouer l'ajout du média lui-même.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  let abonnes = [];
  try {
    abonnes = (await lireManifeste('manifests/abonnes.json')).donnees;
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

    // On n'enregistre que des fichiers qui sont bien dans NOTRE bucket R2 :
    // sinon n'importe qui pourrait faire afficher une adresse quelconque
    // sur le site.
    const base = urlPublique();
    const urlTexte = String(url);
    if (!base || !urlTexte.startsWith(`${base}/nouvelles/`) || /[\s"'<>]/.test(urlTexte)) {
      return res.status(400).json({ erreur: 'Adresse de média non reconnue.' });
    }

    const nouveauMedia = {
      url: urlTexte,
      type: type === 'video' ? 'video' : 'image',
      titre: String(titre).slice(0, 100),
      description: String(description || '').slice(0, 500),
      date: new Date().toISOString(),
    };

    await modifierManifeste(`manifests/${dossier}.json`, (medias) => {
      medias.push(nouveauMedia);
      return { donnees: medias };
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
