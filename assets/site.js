const homeModes = {
  capital: {
    title: "Ship autonomy without surrendering the treasury",
    description:
      "Capital can move, but only through the exact programs, spend envelopes, and simulations you approve.",
    command: `$ prkt agent run --agent alpha
  --strategy universal-defi
  --policy guarded-live
  --max-sol-per-tx-lamports 200000000
  --simulation required`,
    stats: [
      { value: "2 SOL", label: "daily envelope" },
      { value: "1", label: "blocked overflow" },
      { value: "Live", label: "devnet proof path" },
    ],
  },
  compliance: {
    title: "Give compliance something stronger than screenshots",
    description:
      "Policy proofs, session commitments, and explorer-verifiable verifier flows turn runtime claims into reviewable evidence.",
    command: `$ prkt policy show --agent alpha
$ prkt verify-session 9c3a1a2f-b0e5-413e-a041-db08608b2e81
$ prkt verify-tx 5tui25MrxDGhpZmzvgeE7sUkpkSHnh9uB3oJjZvPwkLHJn2iECEK95SDdYK1GZwEjwENfKfjaRPRyfGNWqPNUYDq`,
    stats: [
      { value: "44", label: "verified matrix steps" },
      { value: "0", label: "silent bypasses" },
      { value: "Proof", label: "anchored and reviewable" },
    ],
  },
  operators: {
    title: "Give operators a brake pedal, not a postmortem template",
    description:
      "Monitor balances, inspect logs, stop agents, trigger emergency lock, and keep unsupported execution paths fail-closed.",
    command: `$ prkt monitor overview
$ prkt audit --limit 50
$ prkt agent stop --agent alpha
$ prkt doctor`,
    stats: [
      { value: "24/7", label: "ops visibility" },
      { value: "Fast", label: "stop control" },
      { value: "Fail-closed", label: "unsupported paths" },
    ],
  },
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initReveal();
  initCounters();
  initHome();
  initDocs();
  initCopyButtons();
});

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(node) {
  const target = Number(node.dataset.counter);
  if (Number.isNaN(target)) {
    return;
  }

  const prefix = node.dataset.prefix || "";
  const suffix = node.dataset.suffix || "";
  const start = performance.now();
  const duration = 1200;

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function initHome() {
  if (document.body.dataset.page !== "home") {
    return;
  }

  const pills = Array.from(document.querySelectorAll("[data-mode]"));
  const title = document.querySelector("[data-hero-title]");
  const description = document.querySelector("[data-hero-description]");
  const command = document.querySelector("[data-hero-command]");
  const statNodes = Array.from(document.querySelectorAll("[data-hero-stat]"));
  if (!pills.length || !title || !description || !command || !statNodes.length) {
    return;
  }

  let activeMode = pills[0].dataset.mode;
  let userPinned = false;

  const applyMode = (mode) => {
    const config = homeModes[mode];
    if (!config) {
      return;
    }

    activeMode = mode;
    pills.forEach((pill) => {
      pill.setAttribute("aria-pressed", String(pill.dataset.mode === mode));
    });
    title.textContent = config.title;
    description.textContent = config.description;
    command.textContent = config.command;
    statNodes.forEach((node, index) => {
      const stat = config.stats[index];
      if (!stat) {
        return;
      }
      node.querySelector("strong").textContent = stat.value;
      node.querySelector("span").textContent = stat.label;
    });
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      userPinned = true;
      applyMode(pill.dataset.mode);
    });
  });

  applyMode(activeMode);

  window.setInterval(() => {
    if (userPinned) {
      return;
    }

    const order = Object.keys(homeModes);
    const nextIndex = (order.indexOf(activeMode) + 1) % order.length;
    applyMode(order[nextIndex]);
  }, 5200);
}

function initDocs() {
  if (document.body.dataset.page !== "docs") {
    return;
  }

  const cards = Array.from(document.querySelectorAll("[data-doc-card]"));
  const search = document.querySelector("[data-docs-search]");
  const resultNode = document.querySelector("[data-results-count]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const tocLinks = Array.from(document.querySelectorAll(".toc-links a"));
  const sideLinks = Array.from(document.querySelectorAll(".sidebar-links a"));

  let activeFilter = "all";

  const syncResults = () => {
    const term = (search?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const tags = (card.dataset.tags || "").toLowerCase();
      const text = card.textContent.toLowerCase();
      const filterMatch = activeFilter === "all" || tags.includes(activeFilter);
      const searchMatch = !term || text.includes(term);
      const visible = filterMatch && searchMatch;

      card.classList.toggle("is-hidden", !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (resultNode) {
      resultNode.textContent = `${visibleCount} section${visibleCount === 1 ? "" : "s"} visible`;
    }
  };

  if (search) {
    search.addEventListener("input", syncResults);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
      syncResults();
    });
  });

  const sections = cards.map((card) => document.getElementById(card.id)).filter(Boolean);
  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const href = `#${visible.target.id}`;
        [...tocLinks, ...sideLinks].forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === href);
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  syncResults();
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      if (!value) {
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        const original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = original;
        }, 1400);
      } catch (_error) {
        button.textContent = "Copy failed";
      }
    });
  });
}
