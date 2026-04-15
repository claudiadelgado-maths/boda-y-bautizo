const LOOP_START_SECONDS = 0.75;
const LOOP_END_SECONDS = 97;

function initAudio() {
  const audio = document.getElementById("backgroundAudio");
  const audioToggle = document.getElementById("audioToggle");

  if (!audio || !audioToggle) {
    return {
      start: async () => {},
    };
  }

  let userMuted = false;
  let started = false;
  let resumeAfterVisibility = false;

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
    audio.muted = userMuted;
  }

  function updateButton() {
    const active = started && !audio.paused && !audio.muted;
    audioToggle.classList.toggle("is-active", active);
    audioToggle.setAttribute("aria-pressed", String(active));
    audioToggle.textContent = "M\u00fasica";
  }

  async function playAudio() {
    clampToLoop();
    applyMute();

    try {
      await audio.play();
      started = true;
    } catch (error) {
      // Si falla, dejamos el boton listo para un nuevo intento explicito.
    }

    updateButton();
  }

  async function start() {
    userMuted = false;
    await playAudio();
  }

  audio.addEventListener("loadedmetadata", clampToLoop);

  audio.addEventListener("play", updateButton);
  audio.addEventListener("pause", updateButton);

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
    audio.pause();
    applyMute();
    updateButton();
  });

  audioToggle.addEventListener("click", async () => {
    if (!started) {
      await start();
      return;
    }

    userMuted = !userMuted;
    applyMute();
    if (!userMuted && audio.paused) {
      await playAudio();
      return;
    }
    updateButton();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (started && !audio.paused) {
        resumeAfterVisibility = !userMuted;
        audio.pause();
      }
    } else if (resumeAfterVisibility) {
      resumeAfterVisibility = false;
      playAudio();
    } else {
      resumeAfterVisibility = false;
    }
    updateButton();
  });

  window.addEventListener("pagehide", () => {
    if (started && !audio.paused) {
      resumeAfterVisibility = !userMuted;
      audio.pause();
    }
    updateButton();
  });

  window.addEventListener("pageshow", () => {
    if (resumeAfterVisibility) {
      resumeAfterVisibility = false;
      playAudio();
    } else {
      resumeAfterVisibility = false;
    }
    updateButton();
  });

  updateButton();

  return {
    start,
  };
}
