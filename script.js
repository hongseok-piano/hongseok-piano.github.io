const root = document.documentElement;
const revealItems = document.querySelectorAll(".reveal");
const scenes = document.querySelectorAll("[data-scene]");
const favoriteItems = document.querySelectorAll(".favorite-repertoire li");
const composerSection = document.querySelector(".repertoire");
const composerItems = document.querySelectorAll(".repertoire-item");
const practiceLines = document.querySelectorAll(".practice-notes p");
const translatableItems = document.querySelectorAll("[data-en]");
const languageOptions = document.querySelectorAll(".language-option");
const metaDescription = document.querySelector('meta[name="description"]');

const pageMeta = {
  en: {
    lang: "en",
    dir: "ltr",
    title: "Choi Hongseok | Piano Major",
    description: "Study portfolio for Choi Hongseok, a piano major.",
  },
  zh: {
    lang: "zh-Hans",
    dir: "ltr",
    title: "Choi Hongseok | 钢琴专业",
    description: "Choi Hongseok 的钢琴学习档案。",
  },
  ko: {
    lang: "ko",
    dir: "ltr",
    title: "Choi Hongseok | 피아노 전공",
    description: "Choi Hongseok의 피아노 학습 포트폴리오.",
  },
  ja: {
    lang: "ja",
    dir: "ltr",
    title: "Choi Hongseok | ピアノ専攻",
    description: "Choi Hongseok のピアノ学習ポートフォリオ。",
  },
  he: {
    lang: "he",
    dir: "rtl",
    title: "Choi Hongseok | מגמת פסנתר",
    description: "תיק לימודי פסנתר של Choi Hongseok.",
  },
};

const sceneLooks = {
  Opening: { x: 72, y: 30, glow: 0.16, warmth: 0.08 },
  Legato: { x: 28, y: 38, glow: 0.12, warmth: 0.06 },
  Rubato: { x: 68, y: 42, glow: 0.18, warmth: 0.07 },
  Interpretation: { x: 34, y: 44, glow: 0.16, warmth: 0.08 },
  Resonance: { x: 50, y: 48, glow: 0.2, warmth: 0.1 },
  Cantabile: { x: 38, y: 36, glow: 0.14, warmth: 0.07 },
  Study: { x: 76, y: 56, glow: 0.13, warmth: 0.06 },
  Finale: { x: 50, y: 34, glow: 0.19, warmth: 0.1 },
};

let ticking = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function syncPageVisibility() {
  const isHidden = document.hidden || document.visibilityState === "hidden";
  document.body.dataset.pageVisibility = isHidden ? "hidden" : "visible";
}

function getStoredLanguage() {
  try {
    return localStorage.getItem("choiHongseokLanguage");
  } catch {
    return null;
  }
}

function storeLanguage(language) {
  try {
    localStorage.setItem("choiHongseokLanguage", language);
  } catch {
    // Language choice is still applied for this page load.
  }
}

function applyLanguage(language) {
  const nextLanguage = pageMeta[language] ? language : "en";
  const meta = pageMeta[nextLanguage];

  document.documentElement.lang = meta.lang;
  document.documentElement.dir = meta.dir;
  document.title = meta.title;
  document.body.dataset.language = nextLanguage;
  if (metaDescription) {
    metaDescription.setAttribute("content", meta.description);
  }

  translatableItems.forEach((item) => {
    item.textContent = item.dataset[nextLanguage] || item.dataset.en;
  });

  languageOptions.forEach((button) => {
    const isActive = button.dataset.language === nextLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  storeLanguage(nextLanguage);
}

function updateScrollProgress() {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const heroProgress = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
  const composerProgress = getComposerProgress();

  root.style.setProperty("--scroll", progress.toFixed(4));
  root.style.setProperty("--hero-progress", heroProgress.toFixed(4));
  root.style.setProperty("--hero-shift", `${(-42 * heroProgress).toFixed(2)}px`);
  root.style.setProperty("--composer-progress", composerProgress.toFixed(4));
  root.style.setProperty("--composer-line-progress", clamp(composerProgress * 1.28, 0, 1).toFixed(4));
  root.style.setProperty("--composer-glow-y", `${(18 + composerProgress * 58).toFixed(2)}%`);
  root.style.setProperty("--composer-glow-opacity", (0.12 + composerProgress * 0.34).toFixed(3));
  root.style.setProperty("--staff-one-x", `${(52 * progress).toFixed(2)}px`);
  root.style.setProperty("--staff-one-y", `${(-120 * progress).toFixed(2)}px`);
  root.style.setProperty("--staff-one-rotate", `${(-5 + heroProgress * 2).toFixed(2)}deg`);
  root.style.setProperty("--staff-two-x", `${(-64 * progress).toFixed(2)}px`);
  root.style.setProperty("--staff-two-y", `${(130 * progress).toFixed(2)}px`);
  root.style.setProperty("--staff-two-rotate", `${(4 - heroProgress * 2).toFixed(2)}deg`);
  root.style.setProperty("--note-opacity", (0.4 - heroProgress * 0.16).toFixed(3));
  root.style.setProperty("--note-one-x", `${(80 * progress).toFixed(2)}px`);
  root.style.setProperty("--note-one-y", `${(-260 * progress).toFixed(2)}px`);
  root.style.setProperty("--note-one-rotate", `${(-8 + heroProgress * 16).toFixed(2)}deg`);
  root.style.setProperty("--note-two-x", `${(-80 * progress).toFixed(2)}px`);
  root.style.setProperty("--note-two-y", `${(-180 * progress).toFixed(2)}px`);
  root.style.setProperty("--note-two-rotate", `${(11 - heroProgress * 10).toFixed(2)}deg`);
  root.style.setProperty("--note-three-x", `${(46 * progress).toFixed(2)}px`);
  root.style.setProperty("--note-three-y", `${(-420 * progress).toFixed(2)}px`);
  root.style.setProperty("--note-three-rotate", `${(4 + heroProgress * 14).toFixed(2)}deg`);
}

function getComposerProgress() {
  if (!composerSection) {
    return 0;
  }

  const rect = composerSection.getBoundingClientRect();
  const travel = window.innerHeight + rect.height;

  if (travel <= 0) {
    return 0;
  }

  return clamp((window.innerHeight - rect.top) / travel, 0, 1);
}

function syncActiveComposerItem() {
  if (!composerItems.length) {
    return;
  }

  const focusLine = window.innerHeight * 0.52;
  let activeItem = composerItems[0];
  let activeDistance = Number.POSITIVE_INFINITY;

  composerItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const isInView = rect.bottom > 0 && rect.top < window.innerHeight;
    const distance = Math.abs(rect.top + rect.height * 0.5 - focusLine);

    if (isInView && distance < activeDistance) {
      activeItem = item;
      activeDistance = distance;
    }
  });

  composerItems.forEach((item) => {
    item.classList.toggle("is-active", item === activeItem);
  });
}

function requestScrollUpdate() {
  if (ticking) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollProgress();
    syncActiveComposerItem();
    ticking = false;
  });
}

function revealVisibleItems() {
  revealItems.forEach((item) => {
    if (item.classList.contains("visible")) {
      return;
    }

    const rect = item.getBoundingClientRect();
    const appearsInViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (appearsInViewport) {
      item.classList.add("visible");
      revealObserver.unobserve(item);
    }
  });
}

function applySceneLook(sceneName) {
  const look = sceneLooks[sceneName] || sceneLooks.Opening;

  root.style.setProperty("--spot-x", `${look.x}%`);
  root.style.setProperty("--spot-y", `${look.y}%`);
  root.style.setProperty("--stage-glow", look.glow);
  root.style.setProperty("--stage-warmth", look.warmth);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  },
);

const sceneObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    const activeEntry = visibleEntries[0];

    if (!activeEntry) {
      return;
    }

    const activeScene = activeEntry.target.dataset.scene;

    scenes.forEach((scene) => {
      scene.classList.toggle("scene-active", scene === activeEntry.target);
    });
    document.body.dataset.scene = activeScene;
    applySceneLook(activeScene);
  },
  {
    threshold: [0.24, 0.42, 0.68],
  },
);

revealItems.forEach((item, index) => {
  item.style.setProperty("--item-index", index % 6);
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  if (item.classList.contains("repertoire-item")) {
    item.style.setProperty("--line-delay", `${(index % 4) * 80}ms`);
  }
  revealObserver.observe(item);
});

favoriteItems.forEach((item, index) => {
  item.style.setProperty("--item-index", index);
  item.style.setProperty("--phrase-delay", `${360 + index * 70}ms`);
});

practiceLines.forEach((item, index) => {
  item.style.setProperty("--item-index", index);
  item.style.setProperty("--phrase-delay", `${index * 120}ms`);
});

languageOptions.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.language);
  });
});

scenes.forEach((scene) => sceneObserver.observe(scene));

applyLanguage(getStoredLanguage() || "en");
syncPageVisibility();
if (scenes[0]) {
  scenes[0].classList.add("scene-active");
  document.body.dataset.scene = scenes[0].dataset.scene;
  applySceneLook(scenes[0].dataset.scene);
}
updateScrollProgress();
syncActiveComposerItem();
revealVisibleItems();
window.requestAnimationFrame(() => {
  document.body.dataset.motion = "ready";
  syncActiveComposerItem();
  revealVisibleItems();
});
window.setTimeout(revealVisibleItems, 320);
window.setTimeout(syncPageVisibility, 80);
window.setTimeout(syncPageVisibility, 360);
window.setInterval(syncPageVisibility, 1000);

window.addEventListener(
  "scroll",
  () => {
    requestScrollUpdate();
    revealVisibleItems();
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  requestScrollUpdate();
  syncActiveComposerItem();
  revealVisibleItems();
});
document.addEventListener("visibilitychange", syncPageVisibility);
