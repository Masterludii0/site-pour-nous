/* ============================================================
   MUSIC-PLAYER.JS — popup + widget de musique, sur toutes les pages
   ============================================================
   Le site est composé de plusieurs pages HTML séparées (pas une
   "single page app") : à chaque clic sur un lien, le navigateur
   recharge entièrement la page. Impossible donc de faire jouer un
   seul flux audio en continu sans coupure d'une page à l'autre —
   aucun site "statique" ne le peut.

   Ce script fait la meilleure chose possible dans ce cadre : il
   retient dans sessionStorage (mémoire du navigateur qui dure le
   temps de l'onglet ouvert, et s'efface quand elle ferme/revient
   plus tard) le choix "oui/non", le volume et la position de
   lecture. À chaque nouvelle page, il reprend automatiquement la
   musique quasiment là où elle en était, sans redemander la
   permission tant que c'est la même visite.
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "musicState";
  const AUDIO_SRC = `assets/audio/${MUSIC_CONFIG.fichier}`;

  function readState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeState(partial) {
    try {
      const current = readState() || {};
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(current, partial)));
    } catch (e) {
      // sessionStorage indisponible (navigation privée très restrictive, etc.) :
      // le site continue de fonctionner, juste sans mémoire entre les pages.
    }
  }

  const saved = readState();

  /* ---------- Élément audio (créé une fois, sur chaque page) ---------- */
  const audio = document.createElement("audio");
  audio.src = AUDIO_SRC;
  audio.loop = true;
  audio.preload = "none";
  document.body.appendChild(audio);

  /* ---------- Widget flottant ---------- */
  const player = document.createElement("div");
  player.className = "music-player";
  player.setAttribute("data-music-player", "");
  player.hidden = true;
  player.innerHTML = `
    <button type="button" class="music-player__toggle" data-music-toggle aria-label="Mettre en pause">
      <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="7" y="6" width="3.2" height="12" rx="1.6" fill="currentColor"/>
        <rect x="13.8" y="6" width="3.2" height="12" rx="1.6" fill="currentColor"/>
      </svg>
      <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true" hidden>
        <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor"/>
      </svg>
    </button>
    <div class="music-player__info">
      <span class="music-player__title" data-music-title></span>
    </div>
    <input type="range" class="music-player__volume" min="0" max="1" step="0.01"
           data-music-volume aria-label="Volume de la musique">
  `;
  document.body.appendChild(player);

  player.querySelector("[data-music-title]").textContent = MUSIC_CONFIG.titre;

  const toggleBtn = player.querySelector("[data-music-toggle]");
  const iconPause = player.querySelector(".icon-pause");
  const iconPlay = player.querySelector(".icon-play");
  const volumeInput = player.querySelector("[data-music-volume]");

  /* ---------- Popup de consentement ---------- */
  const consent = document.createElement("div");
  consent.className = "music-consent";
  consent.setAttribute("data-music-consent", "");
  consent.hidden = true;
  consent.innerHTML = `
    <div class="music-consent__card" role="dialog" aria-modal="true" aria-labelledby="music-consent-text">
      <p class="music-consent__text" id="music-consent-text">
        Veux-tu jouer notre musique pendant que tu découvres ce site que j'ai fait pour toi&nbsp;?
      </p>
      <div class="music-consent__actions">
        <button type="button" class="music-consent__btn music-consent__btn--yes" data-music-yes>Oui, avec plaisir</button>
        <button type="button" class="music-consent__btn music-consent__btn--no" data-music-no>Non merci</button>
      </div>
    </div>
  `;
  document.body.appendChild(consent);

  const yesBtn = consent.querySelector("[data-music-yes]");
  const noBtn = consent.querySelector("[data-music-no]");

  /* ---------- Fonctions d'affichage ---------- */
  function showWidget() {
    player.hidden = false;
  }

  function setPlayingUI(isPlaying) {
    iconPause.hidden = !isPlaying;
    iconPlay.hidden = isPlaying;
    toggleBtn.setAttribute("aria-label", isPlaying ? "Mettre en pause" : "Reprendre la musique");
    player.classList.toggle("is-paused", !isPlaying);
  }

  function play() {
    audio.play()
      .then(() => {
        setPlayingUI(true);
        writeState({ playing: true });
      })
      .catch(() => {
        // Certains navigateurs bloquent la reprise automatique sur une
        // nouvelle page. Le widget reste visible, en pause : un seul
        // tap sur le bouton suffit pour reprendre.
        setPlayingUI(false);
        writeState({ playing: false });
      });
  }

  function pause() {
    audio.pause();
    setPlayingUI(false);
    writeState({ playing: false });
  }

  /* ---------- Interactions ---------- */
  toggleBtn.addEventListener("click", () => {
    if (audio.paused) play();
    else pause();
  });

  volumeInput.addEventListener("input", () => {
    const v = Number(volumeInput.value);
    audio.volume = v;
    writeState({ volume: v });
  });

  audio.addEventListener("timeupdate", () => {
    writeState({ time: audio.currentTime });
  });

  yesBtn.addEventListener("click", () => {
    consent.hidden = true;
    writeState({ consent: "yes" });
    showWidget();
    play();
  });

  noBtn.addEventListener("click", () => {
    consent.hidden = true;
    writeState({ consent: "no", playing: false });
  });

  /* ---------- Reprise de la position sauvegardée ---------- */
  function resumeSavedTime() {
    if (!saved || !saved.time) return;
    if (audio.readyState >= 1) {
      audio.currentTime = saved.time;
    } else {
      audio.addEventListener("loadedmetadata", () => {
        audio.currentTime = saved.time;
      }, { once: true });
    }
  }

  /* ---------- Initialisation selon ce qui est déjà connu ---------- */
  const savedVolume = saved && typeof saved.volume === "number" ? saved.volume : 0.6;
  audio.volume = savedVolume;
  volumeInput.value = savedVolume;

  if (!saved || !saved.consent) {
    // Première page de cette visite : on demande la permission.
    consent.hidden = false;
  } else if (saved.consent === "yes") {
    showWidget();
    resumeSavedTime();
    if (saved.playing === false) {
      setPlayingUI(false);
    } else {
      play();
    }
  }
  // Si saved.consent === "no" : on ne montre ni popup ni widget,
  // elle a déjà répondu non pour cette visite.
})();
