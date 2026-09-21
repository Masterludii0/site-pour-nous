Dépose ici les photos de tes lettres manuscrites (scan ou photo au
téléphone, format vertical de préférence — ça correspond au cadrage
"polaroid" prévu dans le design).

Puis, dans js/config.js, section lettre.images, renseigne le nom
exact du fichier et une petite légende pour chacune :

  images: [
    { fichier: "lettre-1.jpg", legende: "La toute première" },
    { fichier: "lettre-2.jpg", legende: "Celle du printemps" }
  ]

Tu peux en ajouter autant que tu veux, juste en complétant ce tableau.
Tant qu'aucune photo n'est ajoutée, un joli emplacement vide (dégradé
+ petit cœur) s'affiche à la place — le site ne casse jamais.
