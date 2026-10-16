// ============================================================
// lib/manifeste.js
// Lecture / modification des manifestes JSON stockés sur Vercel Blob
// (manifests/moi.json, manifests/morgane.json, manifests/abonnes.json).
//
// Pourquoi ce fichier existe : les adresses publiques de Vercel Blob
// passent par un cache (CDN). Relire le manifeste par cette adresse juste
// après l'avoir modifié renvoie parfois l'ANCIENNE version. Résultat avant
// ce correctif : un commentaire ajouté puis, peu après, un like, un envoi
// ou une suppression relisaient l'ancienne version, la modifiaient et
// l'écrasaient — le commentaire disparaissait.
//
// Ici :
//   1. la lecture contourne le cache (paramètre unique dans l'adresse) ;
//   2. l'écriture est conditionnelle (ifMatch sur l'ETag) : si quelqu'un
//      d'autre a écrit entre-temps, on relit et on recommence au lieu
//      d'écraser son travail.
//
// (Ce fichier est dans lib/ et non dans api/ : chaque fichier de api/ doit
// être une fonction Vercel.)
// ============================================================

import { put, head, BlobNotFoundError, BlobPreconditionFailedError } from '@vercel/blob';

// Erreur "attendue" avec un code HTTP à renvoyer au navigateur.
export class ErreurHttp extends Error {
  constructor(statut, message) {
    super(message);
    this.statut = statut;
  }
}

/**
 * Lit un manifeste. Renvoie { donnees, etag } ; si le manifeste n'existe
 * pas encore : { donnees: valeurParDefaut, etag: null }.
 */
export async function lireManifeste(chemin, valeurParDefaut = []) {
  let blob;
  try {
    blob = await head(chemin);
  } catch (e) {
    if (e instanceof BlobNotFoundError) {
      return { donnees: valeurParDefaut, etag: null };
    }
    throw e;
  }

  // Adresse unique à chaque lecture = jamais de version en cache.
  let reponse = await fetch(`${blob.url}?t=${Date.now()}`, { cache: 'no-store' });
  if (!reponse.ok) reponse = await fetch(blob.url, { cache: 'no-store' });
  if (!reponse.ok) {
    throw new Error(`Lecture du manifeste impossible (code ${reponse.status}).`);
  }
  return { donnees: await reponse.json(), etag: blob.etag || null };
}

/**
 * Modifie un manifeste de façon sûre.
 *
 * `transformer(donnees)` reçoit les données actuelles et renvoie
 * { donnees: nouvellesDonnees, resultat } — ou { resultat } seul pour ne
 * rien écrire. Il peut lancer une ErreurHttp pour refuser l'opération.
 * Si le manifeste a changé entre la lecture et l'écriture, la fonction est
 * rejouée sur les données à jour (jusqu'à 6 essais).
 */
export async function modifierManifeste(chemin, transformer, valeurParDefaut = []) {
  const ESSAIS_MAX = 6;

  for (let essai = 1; ; essai++) {
    const { donnees, etag } = await lireManifeste(chemin, valeurParDefaut);
    const sortie = (await transformer(donnees)) || {};

    if (sortie.donnees === undefined || sortie.donnees === null) {
      return sortie.resultat;
    }

    try {
      await put(chemin, JSON.stringify(sortie.donnees), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        cacheControlMaxAge: 60, // le minimum autorisé
        // Manifeste existant : on n'écrase que s'il n'a pas changé (ETag).
        // Manifeste pas encore créé : on refuse d'écraser un manifeste créé
        // entre-temps par quelqu'un d'autre.
        ...(etag ? { allowOverwrite: true, ifMatch: etag } : { allowOverwrite: false }),
      });
      return sortie.resultat;
    } catch (e) {
      const conflit =
        e instanceof BlobPreconditionFailedError || /already exists/i.test(String(e?.message));
      if (conflit && essai < ESSAIS_MAX) {
        // Quelqu'un a écrit juste avant nous : courte pause puis on recommence.
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));
        continue;
      }
      throw e;
    }
  }
}
