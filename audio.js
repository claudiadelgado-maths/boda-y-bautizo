const LOOP_START_SECONDS = 0.75;
const LOOP_END_SECONDS = 97;

function initAudio() {
  const audio = document.getElementById("backgroundAudio");
  const audioToggle = document.getElementById("audioToggle");

  let userMuted = false;
  let hiddenMuted = false;
  let started = false;
  let skipNextAudioToggleClick = false;

  function clampToLoop() {
    if (audio.currentTime < LOOP_START_SECONDS) {
      try {
        audio.currentTime = LOOP_START_SECONDS;
      } catch (error) {
        // Algunos navegadores bloquean el seek hasta que el medio esta listo.
      }
    }
  }

  function applyMute() {
    audio.muted = userMuted || hiddenMuted;
  }

  function updateButton() {
    const active = started && !audio.muted && !document.hidden;
    audioToggle.classList.toggle("is-active", active);
    audioToggle.setAttribute("aria-pressed", String(active));
    audioToggle.textContent = "M\u00fasica";
  }

  async function tryPlay(muteFirst = false) {
    clampToLoop();

    if (muteFirst && !started) {
      audio.muted = true;
    } else {
      applyMute();
    }

    try {
      await audio.play();
      started = true;

      if (!userMuted && !hiddenMuted) {
        audio.muted = false;
      }
    } catch (error) {
      // Bloqueado por el navegador: esperamos el primer gesto del usuario.
    }

    updateButton();
  }

  audio.addEventListener("loadedmetadata", clampToLoop);

  audio.addEventListener("canplay", () => {
    if (!started) {
      tryPlay(true);
    }
  });

  audio.addEventListener("play", updateButton);

  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime >= LOOP_END_SECONDS) {
      audio.currentTime = LOOP_START_SECONDS;
      if (!audio.paused) {
        audio.play().catch(() => {});
      }
    }
  });

  audio.addEventListener("error", () => {
    userMuted = true;
    audio.muted = true;
    updateButton();
  });

  audioToggle.addEventListener("click", async () => {
    if (skipNextAudioToggleClick) {
      skipNextAudioToggleClick = false;
      userMuted = false;
      hiddenMuted = false;
      applyMute();
      await tryPlay();
      return;
    }

    if (!started) {
      userMuted = false;
      hiddenMuted = false;
      applyMute();
      await tryPlay();
      return;
    }

    userMuted = !userMuted;
    applyMute();
    updateButton();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenMuted = true;
      applyMute();
    } else {
      hiddenMuted = false;
      applyMute();
      if (audio.paused && started && !userMuted) {
        tryPlay();
      }
    }
    updateButton();
  });

  window.addEventListener("pagehide", () => {
    hiddenMuted = true;
    applyMute();
    updateButton();
  });

  window.addEventListener("pageshow", () => {
    hiddenMuted = false;
    applyMute();
    if (audio.paused && started && !userMuted) {
      tryPlay();
    }
    updateButton();
  });

  function onFirstTouch(event) {
    if (event.target.closest("#audioToggle")) {
      skipNextAudioToggleClick = true;
    }

    if (!started) {
      tryPlay();
    }

    document.removeEventListener("pointerdown", onFirstTouch);
    document.removeEventListener("touchstart", onFirstTouch);
  }

  document.addEventListener("pointerdown", onFirstTouch, { passive: true });
  document.addEventListener("touchstart", onFirstTouch, { passive: true });

  tryPlay(true);
}
