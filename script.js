const SCENE_ORDER = ["cover", "story", "place", "time", "confirm"];
const EVENT_DATE = new Date("2026-08-22T18:00:00+02:00");

function initMenu() {
  // Abre y cierra el menu overlay por encima de toda la app.
  const body = document.body;
  const menuToggle = document.getElementById("menuToggle");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuClose = document.getElementById("menuClose");

  function setMenuState(isOpen) {
    body.classList.toggle("menu-open", isOpen);
    menuOverlay.classList.toggle("is-open", isOpen);
    menuOverlay.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  menuClose.addEventListener("click", () => setMenuState(false));

  menuOverlay.addEventListener("click", (event) => {
    if (event.target === menuOverlay) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  return setMenuState;
}

function initScenes(setMenuState) {
  // Mantiene el flujo lineal con transiciones suaves entre pantallas.
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const backButton = document.getElementById("backButton");
  let activeScene = "cover";

  function updateBackButton() {
    backButton.disabled = SCENE_ORDER.indexOf(activeScene) === 0;
  }

  function goToScene(sceneId) {
    if (!SCENE_ORDER.includes(sceneId) || sceneId === activeScene) {
      setMenuState(false);
      return;
    }

    const currentIndex = SCENE_ORDER.indexOf(activeScene);
    const nextIndex = SCENE_ORDER.indexOf(sceneId);

    scenes.forEach((scene) => {
      const isCurrent = scene.dataset.scene === activeScene;
      const isTarget = scene.dataset.scene === sceneId;

      scene.classList.remove("is-leaving-left");

      if (isCurrent && nextIndex > currentIndex) {
        scene.classList.add("is-leaving-left");
      }

      scene.classList.toggle("is-active", isTarget);
    });

    activeScene = sceneId;
    updateBackButton();
    setMenuState(false);
  }

  document.querySelectorAll("[data-scene-link]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      goToScene(control.dataset.sceneLink);
    });
  });

  document.querySelectorAll("[data-next-scene]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentIndex = SCENE_ORDER.indexOf(activeScene);
      const nextScene = SCENE_ORDER[Math.min(currentIndex + 1, SCENE_ORDER.length - 1)];
      goToScene(nextScene);
    });
  });

  backButton.addEventListener("click", () => {
    const currentIndex = SCENE_ORDER.indexOf(activeScene);
    const previousScene = SCENE_ORDER[Math.max(currentIndex - 1, 0)];
    goToScene(previousScene);
  });

  updateBackButton();
}

function initCoverRotation() {
  // Alterna automaticamente entre la imagen de la pareja y la del bebe.
  const images = Array.from(document.querySelectorAll("[data-rotating-image]"));
  let currentIndex = 0;

  if (images.length < 2) {
    return;
  }

  window.setInterval(() => {
    images[currentIndex].classList.remove("is-active");
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add("is-active");
  }, 2000);
}

function initCountdown() {
  // Actualiza la cuenta atras del evento en tiempo real.
  const days = document.getElementById("days");
  const hours = document.getElementById("hours");
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");

  function renderCountdown() {
    const now = new Date();
    const difference = EVENT_DATE.getTime() - now.getTime();

    if (difference <= 0) {
      days.textContent = "0";
      hours.textContent = "00";
      minutes.textContent = "00";
      seconds.textContent = "00";
      return;
    }

    const totalSeconds = Math.floor(difference / 1000);
    const dayValue = Math.floor(totalSeconds / 86400);
    const hourValue = Math.floor((totalSeconds % 86400) / 3600);
    const minuteValue = Math.floor((totalSeconds % 3600) / 60);
    const secondValue = totalSeconds % 60;

    days.textContent = String(dayValue);
    hours.textContent = String(hourValue).padStart(2, "0");
    minutes.textContent = String(minuteValue).padStart(2, "0");
    seconds.textContent = String(secondValue).padStart(2, "0");
  }

  renderCountdown();
  window.setInterval(renderCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const setMenuState = initMenu();
  initScenes(setMenuState);
  initCoverRotation();
  initCountdown();
  initAudio();
});
