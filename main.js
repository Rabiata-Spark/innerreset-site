(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");

  const closeMenu = () => {
    if (!header || !menuToggle) return;
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (header && menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      header.classList.toggle("menu-open", willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("menu-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  const motionFigures = [...document.querySelectorAll("[data-motion]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionRoot = "assets/motion/";
  let motionManifestPromise;

  const getMotionManifest = () => {
    if (!motionManifestPromise) {
      motionManifestPromise = (async () => {
        try {
          const response = await fetch(`${motionRoot}manifest.json`, { cache: "force-cache" });
          if (!response.ok) return null;

          const manifest = await response.json();
          motionFigures.forEach((figure) => {
            const clip = manifest?.clips?.[figure.dataset.motion];
            if (!clip || typeof clip.poster !== "string") return;

            const posterPath = `${motionRoot}${clip.poster}`;
            const poster = figure.querySelector(".motion__poster");
            const video = figure.querySelector("video");
            if (poster) {
              poster.src = posterPath;
              poster.classList.remove("motion__poster--placeholder");
            }
            if (video) video.poster = posterPath;
          });
          return manifest;
        } catch {
          return null;
        }
      })();
    }
    return motionManifestPromise;
  };

  const loadMotion = async (figure) => {
    if (reduceMotion.matches || figure.dataset.motionLoaded === "true") return;

    const video = figure.querySelector("video");
    const source = video?.querySelector('source[type="video/mp4"]');
    if (!video || !source) return;

    figure.dataset.motionLoaded = "pending";
    const manifest = await getMotionManifest();

    if (reduceMotion.matches) {
      figure.dataset.motionLoaded = "false";
      return;
    }

    const clip = manifest?.clips?.[figure.dataset.motion];
    if (!clip || typeof clip.mp4 !== "string" || typeof clip.poster !== "string") {
      figure.dataset.motionLoaded = "false";
      return;
    }

    source.src = `${motionRoot}${clip.mp4}`;
    video.poster = `${motionRoot}${clip.poster}`;

    video.addEventListener(
      "loadeddata",
      () => {
        figure.classList.add("is-ready");
      },
      { once: true }
    );
    video.load();
    figure.dataset.motionLoaded = "true";
    if (figure.dataset.inView === "true") await video.play().catch(() => {});
  };

  const unloadMotion = (figure) => {
    const video = figure.querySelector("video");
    if (!video) return;
    video.pause();
    video.querySelectorAll("source[src]").forEach((source) => source.removeAttribute("src"));
    video.removeAttribute("src");
    video.load();
    figure.classList.remove("is-ready");
    figure.dataset.motionLoaded = "false";
  };

  let motionObserver;

  if ("IntersectionObserver" in window) {
    motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");
          entry.target.dataset.inView = String(entry.isIntersecting);
          if (entry.isIntersecting) {
            if (entry.target.dataset.motionLoaded === "true" && video) {
              video.play().catch(() => {});
            } else {
              loadMotion(entry.target);
            }
          } else if (video) {
            video.pause();
          }
        });
      },
      { rootMargin: "0px", threshold: 0.08 }
    );
  }

  const applyMotionPreference = () => {
    motionFigures.forEach((figure) => {
      if (reduceMotion.matches) {
        unloadMotion(figure);
      } else if (motionObserver) {
        motionObserver.observe(figure);
      } else {
        figure.dataset.inView = "true";
        loadMotion(figure);
      }
    });
  };

  getMotionManifest();
  applyMotionPreference();
  reduceMotion.addEventListener("change", applyMotionPreference);
})();
