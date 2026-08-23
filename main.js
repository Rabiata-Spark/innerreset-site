(() => {
  "use strict";

  document.documentElement.classList.add("has-js");

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!menuToggle) return;
    menuToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) menuToggle.focus();
  };

  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (menuToggle.getAttribute("aria-expanded") === "true" && !header?.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        closeMenu({ returnFocus: true });
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionFigures = [...document.querySelectorAll("[data-motion]")];
  const motionRoot = "assets/motion/";
  let manifestPromise;

  const getManifest = () => {
    manifestPromise ??= fetch(`${motionRoot}manifest.json`, { cache: "force-cache" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
    return manifestPromise;
  };

  const clearVideo = (figure) => {
    const video = figure.querySelector("video");
    if (!video) return;
    video.pause();
    video.querySelectorAll("source").forEach((source) => source.removeAttribute("src"));
    video.removeAttribute("poster");
    video.load();
    figure.classList.remove("is-ready");
    delete figure.dataset.motionState;
  };

  const loadVideo = async (figure) => {
    if (reduceMotion.matches || figure.dataset.motionState) return;
    const video = figure.querySelector("video");
    const webm = video?.querySelector('source[type="video/webm"]');
    const mp4 = video?.querySelector('source[type="video/mp4"]');
    if (!video || !webm || !mp4) return;

    figure.dataset.motionState = "pending";
    const manifest = await getManifest();
    const clip = manifest?.clips?.[figure.dataset.motion];
    if (reduceMotion.matches || !clip?.webm || !clip?.mp4 || !clip?.poster?.jpg) {
      delete figure.dataset.motionState;
      return;
    }

    webm.src = `${motionRoot}${clip.webm}`;
    mp4.src = `${motionRoot}${clip.mp4}`;
    video.poster = `${motionRoot}${clip.poster.jpg}`;
    const handleVideoError = () => {
      const state = figure.dataset.motionState;
      if (state !== "pending" && state !== "loaded") return;
      clearVideo(figure);
      figure.dataset.motionState = "error";
    };
    video.addEventListener("error", handleVideoError, { once: true });
    mp4.addEventListener("error", handleVideoError, { once: true });
    video.addEventListener("loadeddata", () => {
      figure.classList.add("is-ready");
      figure.dataset.motionState = "loaded";
      if (figure.dataset.inView === "true" && !reduceMotion.matches) video.play().catch(() => {});
    }, { once: true });
    video.load();
  };

  const motionObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const video = entry.target.querySelector("video");
          entry.target.dataset.inView = String(entry.isIntersecting);
          if (entry.isIntersecting) {
            if (entry.target.dataset.motionState === "loaded") video?.play().catch(() => {});
            else loadVideo(entry.target);
          } else {
            video?.pause();
          }
        }
      }, { rootMargin: "80px 0px", threshold: .08 })
    : null;

  const applyMotionPreference = () => {
    for (const figure of motionFigures) {
      motionObserver?.unobserve(figure);
      if (reduceMotion.matches) {
        clearVideo(figure);
      } else if (motionObserver) {
        motionObserver.observe(figure);
      } else {
        figure.dataset.inView = "true";
        loadVideo(figure);
      }
    }
  };

  applyMotionPreference();
  reduceMotion.addEventListener("change", applyMotionPreference);

  if (!CSS.supports("animation-timeline: view()") && !reduceMotion.matches && "IntersectionObserver" in window) {
    const reveals = [...document.querySelectorAll(".reveal")];
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8%", threshold: .08 });
    reveals.forEach((element) => revealObserver.observe(element));
  }
})();
