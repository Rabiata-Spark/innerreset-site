(() => {
  "use strict";

  document.documentElement.classList.add("has-js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
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
      menuToggle.setAttribute("aria-expanded", String(menuToggle.getAttribute("aria-expanded") !== "true"));
    });
    siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (menuToggle.getAttribute("aria-expanded") === "true" && !header?.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu({ returnFocus: true });
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  let wordIndex = 0;
  for (const heading of document.querySelectorAll("h1, h2")) {
    const label = (heading.innerText || heading.textContent).trim().replace(/\s+/g, " ");
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
          continue;
        }
        const mask = document.createElement("span");
        const word = document.createElement("span");
        mask.className = "word-mask";
        mask.setAttribute("aria-hidden", "true");
        word.className = "word-mask__word";
        word.style.setProperty("--word-index", String(wordIndex++));
        word.textContent = part;
        mask.append(word);
        fragment.append(mask);
      }
      node.replaceWith(fragment);
    }
    heading.classList.add("word-heading");
    heading.setAttribute("aria-label", label);
    wordIndex = 0;
  }

  const revealTargets = [...document.querySelectorAll(".reveal, .word-heading")];
  const showReveal = (element) => element.classList.add(element.matches(".word-heading") ? "is-word-visible" : "is-revealed");
  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          showReveal(entry.target);
          observer.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -8%", threshold: .08 })
    : null;
  for (const element of revealTargets) {
    if (element.closest(".hero") || !revealObserver) requestAnimationFrame(() => showReveal(element));
    else revealObserver.observe(element);
  }

  const motionFigures = [...document.querySelectorAll("[data-motion]")];
  const motionRoot = "assets/motion/";
  let manifestPromise;
  const getManifest = () => {
    manifestPromise ??= fetch(`${motionRoot}manifest.json?v=4`, { cache: "force-cache" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
    return manifestPromise;
  };

  const markPosterReady = (figure, clip) => {
    if (!clip?.poster?.jpg || (clip.webm && clip.mp4)) return;
    const poster = figure.querySelector(".motion__poster img");
    if (!poster) return;
    const showPoster = () => figure.classList.add("is-poster-ready");
    if (poster.complete && poster.naturalWidth) showPoster();
    else poster.addEventListener("load", showPoster, { once: true });
  };
  getManifest().then((manifest) => {
    for (const figure of motionFigures) markPosterReady(figure, manifest?.clips?.[figure.dataset.motion]);
  });

  const clearVideo = (figure) => {
    const video = figure.querySelector("video");
    if (!video) return;
    video.pause();
    video.autoplay = false;
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
    if (reduceMotion.matches) {
      delete figure.dataset.motionState;
      return;
    }
    if (!clip?.webm || !clip?.mp4) {
      figure.dataset.motionState = clip?.poster?.jpg ? "poster" : "unavailable";
      return;
    }
    if (!clip.poster?.jpg) {
      figure.dataset.motionState = "unavailable";
      return;
    }
    webm.src = `${motionRoot}${clip.webm}`;
    mp4.src = `${motionRoot}${clip.mp4}`;
    video.poster = `${motionRoot}${clip.poster.jpg}`;
    const handleVideoError = () => {
      if (!/[pl]ending|loaded/.test(figure.dataset.motionState || "")) return;
      clearVideo(figure);
      figure.dataset.motionState = "error";
    };
    video.addEventListener("error", handleVideoError, { once: true });
    mp4.addEventListener("error", handleVideoError, { once: true });
    video.addEventListener("loadeddata", () => {
      figure.classList.add("is-ready");
      figure.dataset.motionState = "loaded";
      if (figure.dataset.inView === "true" && !document.hidden && !reduceMotion.matches) video.play().catch(() => {});
    }, { once: true });
    video.load();
  };

  const motionObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const video = entry.target.querySelector("video");
          entry.target.dataset.inView = String(entry.isIntersecting);
          if (entry.isIntersecting) {
            if (entry.target.dataset.motionState === "loaded" && !document.hidden) video?.play().catch(() => {});
            else loadVideo(entry.target);
          } else video?.pause();
        }
      }, { rootMargin: "80px 0px", threshold: .08 })
    : null;

  const applyMotionPreference = () => {
    for (const figure of motionFigures) {
      motionObserver?.unobserve(figure);
      if (reduceMotion.matches) clearVideo(figure);
      else if (motionObserver) motionObserver.observe(figure);
      else {
        figure.dataset.inView = "true";
        loadVideo(figure);
      }
    }
  };
  applyMotionPreference();
  reduceMotion.addEventListener("change", applyMotionPreference);
  document.addEventListener("visibilitychange", () => {
    for (const figure of motionFigures) {
      const video = figure.querySelector("video");
      if (document.hidden) video?.pause();
      else if (figure.dataset.inView === "true" && figure.dataset.motionState === "loaded" && !reduceMotion.matches) video?.play().catch(() => {});
    }
  });

  if (finePointer.matches) {
    for (const button of document.querySelectorAll(".button")) {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--mag-x", `${((event.clientX - rect.left) / rect.width - .5) * 16}px`);
        button.style.setProperty("--mag-y", `${((event.clientY - rect.top) / rect.height - .5) * 16}px`);
      });
      button.addEventListener("pointerleave", () => {
        button.style.setProperty("--mag-x", "0px");
        button.style.setProperty("--mag-y", "0px");
      });
    }
    for (const card of document.querySelectorAll(".experience-card")) {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--glow-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        card.style.setProperty("--glow-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--glow-x", "50%");
        card.style.setProperty("--glow-y", "62%");
      });
    }
  }

  let disposeHeroGlow = () => {};
  const createHeroGlow = () => {
    if (reduceMotion.matches) return () => {};
    const field = document.querySelector(".motion--hero");
    if (!field) return () => {};
    const canvas = document.createElement("canvas");
    canvas.className = "hero-glow-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return () => {};
    field.prepend(canvas);
    const vertex = `#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}`;
    const fragment = `#version 300 es\nprecision highp float;out vec4 o;uniform vec2 r;uniform float t;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}float f(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+1.7;a*=.5;}return v;}void main(){vec2 u=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);float q=f(u*2.4+vec2(t*.018,-t*.012));float veil=smoothstep(.82,.04,length(u*vec2(.82,1.)));float e=smoothstep(.28,.78,q)*veil;vec3 a=vec3(.941,.784,.553),b=vec3(.478,.361,1.);vec3 c=mix(a,b,clamp(u.x*.42+q*.72+.42,0.,1.))*e*.16;o=vec4(c,e*.38);}`;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) {
      canvas.remove();
      return () => {};
    }
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return () => {};
    }
    gl.useProgram(program);
    const resolution = gl.getUniformLocation(program, "r");
    const time = gl.getUniformLocation(program, "t");
    const resize = () => {
      const rect = field.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    };
    let visible = false;
    let frame = 0;
    const draw = (now) => {
      frame = 0;
      if (!visible || document.hidden || reduceMotion.matches) return;
      gl.uniform1f(time, now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { threshold: .02 });
    const sizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    resize();
    observer.observe(field);
    sizeObserver?.observe(field);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", wake);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      sizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", wake);
      canvas.remove();
    };
  };
  const syncHeroGlow = () => {
    disposeHeroGlow();
    disposeHeroGlow = createHeroGlow();
  };
  syncHeroGlow();
  reduceMotion.addEventListener("change", syncHeroGlow);
})();
