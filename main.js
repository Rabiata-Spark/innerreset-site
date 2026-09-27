(() => {
  "use strict";
  document.documentElement.classList.add("has-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  const smallScreen = window.matchMedia("(max-width: 1050px)");

  if (menu && nav) {
    const closeMenu = (restoreFocus = false) => {
      menu.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      if (restoreFocus) menu.focus();
    };
    menu.hidden = false;
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", (event) => {
      if (!event.target.closest("a") || !smallScreen.matches) return;
      closeMenu();
      // A collapsed navigation must not retain keyboard focus in a hidden link.
      const target = document.querySelector(event.target.closest("a").getAttribute("href"));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    smallScreen.addEventListener("change", () => closeMenu());
  }

  const tablist = document.querySelector(".experience-tabs");
  const tabs = Array.from(document.querySelectorAll("[data-experience]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  if (tablist && tabs.length === 2 && panels.length === 2) {
    tablist.setAttribute("role", "tablist");
    tabs.forEach((tab) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `${tab.dataset.experience}-example`);
    });
    panels.forEach((panel) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${panel.dataset.panel}-tab`);
      panel.tabIndex = 0;
    });
    const choose = (name, animate = true) => {
      if (!tabs.some((tab) => tab.dataset.experience === name)) return;
      tabs.forEach((tab) => {
        const selected = tab.dataset.experience === name;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        tab.classList.toggle("is-selected", selected);
      });
      panels.forEach((panel) => {
        const selected = panel.dataset.panel === name;
        panel.hidden = !selected;
        panel.classList.toggle("is-changing", selected && animate && !reduceMotion.matches);
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        choose(tab.dataset.experience);
      });
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        choose(tabs[next].dataset.experience);
        tabs[next].focus();
      });
    });
    document.querySelectorAll("[data-choose]").forEach((link) => {
      link.addEventListener("click", () => choose(link.dataset.choose));
    });
    const syncHash = () => {
      const name = location.hash === "#mind-example" ? "mind" : location.hash === "#carry-example" ? "carry" : null;
      if (name) choose(name, false);
    };
    choose(location.hash === "#mind-example" ? "mind" : "carry", false);
    window.addEventListener("hashchange", syncHash);
  }

  const process = document.querySelector(".process");
  if (process && "IntersectionObserver" in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      process.classList.add("is-inked");
      observer.disconnect();
    }, { threshold: .25 });
    observer.observe(process);
    reduceMotion.addEventListener("change", (event) => {
      if (event.matches) observer.disconnect();
    });
  }
})();
