(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeStatus = document.getElementById("theme-status");
  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("primary-navigation");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themeStorageKey = "portfolio-theme";

  // Apply a saved theme, or use the visitor's system preference on first visit.
  function setTheme(theme, announce = false) {
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeIcon.textContent = isDark ? "☀" : "☾";
    document.querySelector('meta[name="theme-color"]').content = isDark ? "#171918" : "#f8f6f0";
    petals.setTheme(isDark);
    syncProjectModalPreview(isDark);

    if (announce) {
      themeStatus.textContent = `${isDark ? "Dark" : "Light"} mode enabled.`;
    }
  }

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(themeStorageKey);
  } catch {
    themeStatus.textContent = "Theme preference storage is unavailable; your system theme will be used.";
  }
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme, true);
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      themeStatus.textContent = "Theme changed, but this browser could not save your preference.";
    }
  });

  // Keep the mobile navigation keyboard-operable and synchronize its ARIA state.
  function closeMenu(returnFocus = false) {
    navigation.classList.add("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    if (returnFocus) menuToggle.focus();
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    navigation.classList.toggle("hidden", isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", `${isOpen ? "Open" : "Close"} navigation menu`);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  window.matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });

  // Highlight the navigation item for the section currently in view.
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

  // Filter project cards and announce the number of matching results.
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const projectCards = [...document.querySelectorAll(".project-card")];
  const filterStatus = document.getElementById("filter-status");
  const projectEmptyState = document.getElementById("project-empty-state");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", String(selected));
      });

      projectCards.forEach((card) => {
        const visible = selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      projectEmptyState.hidden = visibleCount > 0;
      filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "project" : "projects"} shown.`;
    });
  });

  // Open the project gallery dialog from a card without presenting placeholder content as real work.
  const projectModal = document.getElementById("project-modal");
  const projectModalPanel = projectModal.querySelector(".project-modal-panel");
  const projectModalClose = document.getElementById("project-modal-close");
  const projectModalTitle = document.getElementById("project-modal-title");
  const projectModalIntro = document.getElementById("project-modal-intro");
  const projectModalPreview = document.getElementById("project-modal-preview");
  const projectModalPlaceholder = document.getElementById("project-modal-placeholder");
  const projectModalImage = document.getElementById("project-modal-image");
  const projectModalCaption = document.getElementById("project-modal-preview-caption");
  let projectModalTrigger = null;

  const projectDetails = [
    ["type", document.getElementById("project-modal-type")],
    ["overview", document.getElementById("project-modal-overview")],
    ["problem", document.getElementById("project-modal-problem")],
    ["features", document.getElementById("project-modal-features")],
    ["technologies", document.getElementById("project-modal-technologies")],
    ["contribution", document.getElementById("project-modal-contribution")],
    ["learning", document.getElementById("project-modal-learning")]
  ];

  function syncProjectModalPreview(isDark) {
    if (!projectModalTrigger) return;

    const themeImage = isDark
      ? projectModalTrigger.dataset.projectImageDark
      : projectModalTrigger.dataset.projectImageLight;
    const fallbackImage = isDark
      ? projectModalTrigger.dataset.projectImageLight
      : projectModalTrigger.dataset.projectImageDark;
    const imagePath = (themeImage || projectModalTrigger.dataset.projectImage || fallbackImage || "").trim();

    if (!imagePath) {
      projectModalImage.removeAttribute("src");
      projectModalImage.hidden = true;
      projectModalPlaceholder.hidden = false;
      projectModalCaption.hidden = false;
      projectModalCaption.textContent = "Placeholder artwork — add your real project screenshots using the light/dark image fields on the project card.";
      return;
    }

    projectModalImage.alt = `${projectModalTitle.textContent} project screenshot`;
    projectModalPlaceholder.hidden = true;
    projectModalCaption.hidden = true;
    projectModalImage.hidden = false;
    if (projectModalImage.getAttribute("src") !== imagePath) projectModalImage.src = imagePath;
  }

  function openProjectModal(card) {
    projectModalTrigger = card;
    const title = card.dataset.projectTitle || "[Add your real project name]";
    projectModalTitle.textContent = title;
    projectModalIntro.textContent = "Add details about a project you created. This portfolio does not yet contain verified project information.";

    projectDetails.forEach(([key, element]) => {
      element.textContent = card.dataset[`project${key[0].toUpperCase()}${key.slice(1)}`] || `[Add ${key} details]`;
    });

    syncProjectModalPreview(root.classList.contains("dark"));

    projectModal.hidden = false;
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => {
      projectModal.classList.add("is-open");
      projectModalClose.focus();
    });
  }

  function closeProjectModal() {
    if (projectModal.hidden) return;
    projectModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    projectModal.hidden = true;
    if (projectModalTrigger) projectModalTrigger.focus();
    projectModalTrigger = null;
  }

  projectCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `${card.dataset.projectTitle}. Open project details.`);
    card.addEventListener("click", () => openProjectModal(card));
    card.addEventListener("keydown", (event) => {
      if (event.target !== card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProjectModal(card);
      }
    });
  });

  projectModalImage.addEventListener("error", () => {
    projectModalImage.hidden = true;
    projectModalPlaceholder.hidden = false;
    projectModalCaption.hidden = false;
    projectModalCaption.textContent = "The selected screenshot could not be loaded. Check the image path in this project's data attributes.";
  });

  projectModalClose.addEventListener("click", closeProjectModal);
  projectModal.addEventListener("click", (event) => {
    if (event.target === projectModal || event.target.hasAttribute("data-modal-dismiss")) {
      closeProjectModal();
    }
  });

  projectModalPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...projectModalPanel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden);

    if (focusable.length === 0) {
      event.preventDefault();
      projectModalPanel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !projectModal.hidden) closeProjectModal();
  });

  // Validate locally, describe field errors, and never send form data anywhere.
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  const fields = [
    {
      input: document.getElementById("contact-name"),
      error: document.getElementById("name-error"),
      message: "Please enter your name."
    },
    {
      input: document.getElementById("contact-email"),
      error: document.getElementById("email-error"),
      message: "Please enter a valid email address."
    },
    {
      input: document.getElementById("contact-message"),
      error: document.getElementById("message-error"),
      message: "Please enter a message."
    }
  ];

  function validateField(field) {
    const value = field.input.value.trim();
    const isValid = value.length > 0 && (field.input.type !== "email" || field.input.validity.valid);
    field.input.setAttribute("aria-invalid", String(!isValid));
    field.error.textContent = isValid ? "" : field.message;
    field.error.hidden = isValid;
    return isValid;
  }

  fields.forEach((field) => {
    field.input.addEventListener("blur", () => validateField(field));
    field.input.addEventListener("input", () => {
      if (field.input.hasAttribute("aria-invalid")) validateField(field);
      formSuccess.hidden = true;
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formSuccess.hidden = true;
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      invalidFields[0].input.focus();
      return;
    }

    contactForm.reset();
    fields.forEach((field) => {
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
      field.error.hidden = true;
    });
    formSuccess.hidden = false;
    formSuccess.focus();
  });

  // Draw a small, subtle canvas layer; stop it entirely for reduced motion.
  const canvas = document.getElementById("sakura-canvas");
  const context = canvas.getContext("2d");
  const cursorCanvas = document.getElementById("sakura-cursor-canvas");
  const cursorContext = cursorCanvas.getContext("2d");
  const cursorBlossom = document.getElementById("sakura-cursor");
  const petals = (() => {
    const count = 18;
    const maxCursorPetals = 48;
    const flakes = [];
    const cursorPetals = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrameTime = 0;
    let lastCursorPoint = null;
    let cursorDistance = 0;
    let lastCursorPetalTime = 0;
    let isDark = false;
    let sceneId = "home";
    let activeSection = document.getElementById("home");
    let cursorSection = null;
    let colors = [];

    const scenePalettes = {
      home: ["rgba(218, 113, 143, 0.9)", "rgba(245, 171, 187, 0.84)"],
      about: ["rgba(218, 125, 153, 0.9)", "rgba(238, 165, 186, 0.84)"],
      skills: ["rgba(220, 126, 154, 0.9)", "rgba(236, 179, 194, 0.84)"],
      projects: ["rgba(218, 125, 153, 0.9)", "rgba(244, 183, 199, 0.86)"],
      journey: ["rgba(218, 125, 153, 0.9)", "rgba(232, 178, 194, 0.84)"],
      contact: ["rgba(224, 116, 143, 0.92)", "rgba(246, 173, 186, 0.86)"],
      footer: ["rgba(218, 125, 153, 0.92)", "rgba(244, 183, 199, 0.88)"]
    };

    function updateColors() {
      const palette = scenePalettes[sceneId] || scenePalettes.home;
      colors = isDark
        ? palette.map((color, index) => index === 0
          ? "rgba(177, 203, 255, 0.94)"
          : sceneId === "skills" || sceneId === "contact"
            ? "rgba(238, 204, 132, 0.78)"
            : "rgba(177, 203, 255, 0.82)")
        : palette;
      flakes.forEach((petal, index) => {
        petal.color = colors[index % colors.length];
      });
      cursorPetals.forEach((petal, index) => {
        petal.color = colors[index % colors.length];
      });
    }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      cursorCanvas.width = canvas.width;
      cursorCanvas.height = canvas.height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      cursorCanvas.style.width = `${width}px`;
      cursorCanvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      cursorContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      while (flakes.length < count) flakes.push(createPetal(true));
    }

    function createPetal(randomizeY = false) {
      const bounds = getActiveBounds();
      const sectionWidth = Math.max(1, bounds.right - bounds.left);
      const sectionHeight = Math.max(1, bounds.bottom - bounds.top);
      return {
        x: bounds.left + Math.random() * sectionWidth,
        y: randomizeY ? bounds.top + Math.random() * sectionHeight : bounds.top - 16,
        size: 4 + Math.random() * 5,
        speed: 0.35 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.025,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    function addCursorPetal(x, y) {
      while (cursorPetals.length > maxCursorPetals - 2) cursorPetals.shift();
      cursorPetals.push({
        x: x + (Math.random() - 0.5) * 7,
        y: y + (Math.random() - 0.5) * 7,
        size: 5 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.06,
        drift: (Math.random() - 0.5) * 1.1,
        speed: 0.45 + Math.random() * 0.6,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      cursorPetals.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        size: 4 + Math.random() * 3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.06,
        drift: (Math.random() - 0.5) * 1.1,
        speed: 0.45 + Math.random() * 0.6,
        life: 0.9,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function getActiveBounds() {
      return getSectionBounds(activeSection);
    }

    function getSectionBounds(sectionElement) {
      if (!sectionElement) return { left: 0, right: width, top: 0, bottom: height };
      const section = sectionElement.getBoundingClientRect();
      return {
        left: Math.max(0, section.left),
        right: Math.min(width, section.right),
        top: Math.max(0, section.top),
        bottom: Math.min(height, section.bottom)
      };
    }

    function draw(timestamp) {
      const frameScale = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 16.67, 2.5) : 1;
      lastFrameTime = timestamp;
      context.clearRect(0, 0, width, height);
      const bounds = getActiveBounds();

      if (bounds.right > bounds.left && bounds.bottom > bounds.top) {
        context.save();
        context.beginPath();
        context.rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
        context.clip();
        flakes.forEach((petal, index) => {
          context.save();
          context.translate(petal.x, petal.y);
          context.rotate(petal.angle);
          context.fillStyle = petal.color;
          context.beginPath();
          context.ellipse(0, 0, petal.size * 0.55, petal.size, 0, 0, Math.PI * 2);
          context.fill();
          context.restore();

          petal.x += (petal.drift + Math.sin(petal.y * 0.008 + index) * 0.2) * frameScale;
          petal.y += petal.speed * frameScale;
          petal.angle += petal.spin * frameScale;
          if (petal.y > bounds.bottom + 16 || petal.x < bounds.left - 16 || petal.x > bounds.right + 16) {
            const nextPetal = createPetal();
            nextPetal.y = bounds.top - Math.random() * Math.min(bounds.bottom - bounds.top, 240);
            flakes[index] = nextPetal;
          }
        });
        context.restore();
      }

      cursorContext.clearRect(0, 0, width, height);
      const cursorBounds = getSectionBounds(cursorSection);
      if (cursorSection && cursorBounds.right > cursorBounds.left && cursorBounds.bottom > cursorBounds.top) {
        cursorContext.save();
        cursorContext.beginPath();
        cursorContext.rect(cursorBounds.left, cursorBounds.top, cursorBounds.right - cursorBounds.left, cursorBounds.bottom - cursorBounds.top);
        cursorContext.clip();
      for (let index = cursorPetals.length - 1; index >= 0; index -= 1) {
        const petal = cursorPetals[index];
        cursorContext.save();
        cursorContext.globalAlpha = petal.life;
        cursorContext.translate(petal.x, petal.y);
        cursorContext.rotate(petal.angle);
        cursorContext.fillStyle = petal.color;
        cursorContext.beginPath();
        cursorContext.ellipse(0, 0, petal.size * 0.55, petal.size, 0, 0, Math.PI * 2);
        cursorContext.fill();
        cursorContext.restore();

        petal.x += petal.drift * frameScale;
        petal.y += petal.speed * frameScale;
        petal.angle += petal.spin * frameScale;
        petal.life -= 0.016 * frameScale;
        if (petal.life <= 0) cursorPetals.splice(index, 1);
      }
        cursorContext.restore();
      }
      context.restore();
      frameId = window.requestAnimationFrame(draw);
    }

    function handlePointerMove(event) {
      if (event.pointerType !== "mouse" || reduceMotion.matches) return;
      const hoveredSection = document.elementFromPoint(event.clientX, event.clientY)?.closest(".scene-section");
      if (hoveredSection !== cursorSection) {
        cursorSection = hoveredSection;
        cursorPetals.length = 0;
        lastCursorPoint = null;
        cursorDistance = 0;
      }
      if (!cursorSection) {
        cursorBlossom.classList.remove("is-visible");
        return;
      }

      cursorBlossom.style.left = `${event.clientX + 14}px`;
      cursorBlossom.style.top = `${event.clientY + 14}px`;
      cursorBlossom.classList.add("is-visible");

      const bounds = getSectionBounds(cursorSection);
      const insideSection = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom;
      const point = { x: event.clientX, y: event.clientY };

      if (!insideSection) {
        lastCursorPoint = point;
        return;
      }

      const now = performance.now();
      if (lastCursorPoint) {
        cursorDistance += Math.hypot(point.x - lastCursorPoint.x, point.y - lastCursorPoint.y);
      }
      if (cursorDistance >= 8 && now - lastCursorPetalTime >= 18) {
        addCursorPetal(point.x, point.y);
        cursorDistance = 0;
        lastCursorPetalTime = now;
      }
      lastCursorPoint = point;
    }

    function start() {
      if (reduceMotion.matches || frameId || document.hidden) return;
      frameId = window.requestAnimationFrame(draw);
    }

    function stop() {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      cursorPetals.length = 0;
      context.clearRect(0, 0, width, height);
      cursorContext.clearRect(0, 0, width, height);
    }

    function setTheme(darkMode) {
      isDark = darkMode;
      updateColors();
    }

    function setScene(nextSceneId, nextSection) {
      if (sceneId === nextSceneId) return;
      sceneId = nextSceneId;
      activeSection = nextSection;
      cursorPetals.length = 0;
      cursorSection = null;
      lastCursorPoint = null;
      cursorDistance = 0;
      cursorBlossom.classList.remove("is-visible");
      updateColors();
      const bounds = getActiveBounds();
      for (let index = 0; index < flakes.length; index += 1) {
        const petal = createPetal();
        petal.y = bounds.top - Math.random() * Math.min(bounds.bottom - bounds.top, 240);
        flakes[index] = petal;
      }
    }

    resize();
    updateColors();
    start();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", () => cursorBlossom.classList.remove("is-visible"), { passive: true });
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    reduceMotion.addEventListener("change", () => reduceMotion.matches ? stop() : start());

    return { setTheme, setScene };
  })();

  // Fade scenes into view and tint the shared petal layer for the current scene.
  const sceneSections = [...document.querySelectorAll(".scene-section")];
  if (!reduceMotion.matches) {
    const revealItems = sceneSections.flatMap((section) => [
      ...section.querySelectorAll(
        ".scene-content > *, .scene-content .skill-card, .scene-content .project-card, .scene-content .timeline-item"
      )
    ]);
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealItems.forEach((item, index) => {
      item.classList.add("scroll-reveal");
      item.style.setProperty("--reveal-delay", `${(index % 4) * 85}ms`);
      revealObserver.observe(item);
    });
  }

  const sceneIntersectionRatios = new Map();
  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("scene-in-view", entry.isIntersecting);
      sceneIntersectionRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    });

    const dominantScene = [...sceneIntersectionRatios.entries()]
      .filter(([, ratio]) => ratio > 0.1)
      .sort((a, b) => b[1] - a[1])[0];
    if (dominantScene) {
      petals.setScene(dominantScene[0].id || "footer", dominantScene[0]);
    }
  }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "-12% 0px -12% 0px" });

  sceneSections.forEach((section) => sceneObserver.observe(section));

  // Move scene artwork more slowly than its section; skip all movement for reduced motion.
  let parallaxFrame = 0;
  function updateParallax() {
    parallaxFrame = 0;
    sceneSections.forEach((section) => {
      const art = section.querySelector(".scene-art");
      if (!art) return;
      if (reduceMotion.matches) {
        art.style.transform = "";
        return;
      }
      const offset = Math.max(-24, Math.min(24, -section.getBoundingClientRect().top * 0.045));
      art.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  function scheduleParallax() {
    if (parallaxFrame || reduceMotion.matches) return;
    parallaxFrame = window.requestAnimationFrame(updateParallax);
  }

  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax, { passive: true });
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches && parallaxFrame) {
      window.cancelAnimationFrame(parallaxFrame);
      parallaxFrame = 0;
    }
    updateParallax();
  });
  scheduleParallax();

  setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme.matches ? "dark" : "light");
  document.getElementById("current-year").textContent = String(new Date().getFullYear());
})();
