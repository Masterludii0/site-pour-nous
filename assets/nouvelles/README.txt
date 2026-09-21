Dépose ici tes photos/vidéos de "nouvelles", un sous-dossier par
personne (déjà créés : moi/ et morgane/).

Pour ajouter un nouveau média :
1. Mets le fichier dans le bon sous-dossier (ex: assets/nouvelles/moi/plage.jpg)
2. Ajoute une ligne dans js/nouvelles-config.js, dans le tableau
   "medias" du bon dossier :

   { fichier: "plage.jpg", type: "image", date: "2026-03-02", legende: "Un dimanche" }

   - type : "image" ou "video"
   - date : format AAAA-MM-JJ (sert à trier et afficher "mis à jour le...")
   - legende : optionnelle

Pour ajouter un nouveau dossier (une nouvelle personne), copie un
bloc { id, nom, medias: [] } dans nouvelles-config.js et crée le
sous-dossier assets/nouvelles/<id>/ correspondant.
