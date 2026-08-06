(() => {
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  if (!tabs.length) return;

  const activate = (id) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === id);
      panel.hidden = panel.dataset.panel !== id;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = tabs[(index + 1) % tabs.length];
        next.focus();
        activate(next.dataset.tab);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prev = tabs[(index - 1 + tabs.length) % tabs.length];
        prev.focus();
        activate(prev.dataset.tab);
      }
    });
  });

  activate(
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset
      .tab || tabs[0].dataset.tab,
  );

  const nav = document.querySelector(".topnav");
  if (nav) {
    const onScroll = () =>
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
