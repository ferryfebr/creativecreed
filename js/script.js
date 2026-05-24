/* =========================================
   DC Creative Creed – Main Script & Loader
   js/script.js
   ========================================= */

(function () {
  "use strict";

  const THEME_KEY = "dc-creed-theme";

  // 1. Immediately apply saved theme to prevent visual flash
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }

  // Helper to load component dynamically
  function loadComponent(selector, url, callback) {
    const el = document.querySelector(selector);
    if (!el) return;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return response.text();
      })
      .then((html) => {
        el.outerHTML = html;
        if (callback) callback();
      })
      .catch((err) => console.error(err));
  }

  // Initialize Navbar events & toggles
  function initNavbarHandlers(isRoot) {
    const navbar = document.getElementById("navbar");
    const themeToggle = document.getElementById("themeToggle");
    const searchToggle = document.getElementById("searchToggle");
    const searchPopup = document.getElementById("searchPopup");
    const searchInput = document.getElementById("searchInput");
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(
      ".nav-btn:not(.nav-btn--icon):not(.theme-toggle)",
    );

    if (!navbar) return;

    // Theme Toggle Sync
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light-theme");
        localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
      });
    }

    // Search Toggle
    if (searchToggle && searchPopup && searchInput) {
      searchToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = searchPopup.classList.toggle("is-open");
        if (isOpen) {
          setTimeout(() => searchInput.focus(), 50);
        }
      });

      document.addEventListener("click", (e) => {
        if (!searchPopup.contains(e.target) && e.target !== searchToggle) {
          searchPopup.classList.remove("is-open");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          searchPopup.classList.remove("is-open");
          searchInput.blur();
        }
      });
    }

    // Active Nav Links Clicking
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        navLinks.forEach((l) => l.classList.remove("nav-btn--active"));
        this.classList.add("nav-btn--active");
      });
    });

    // Mobile Hamburger
    if (hamburger && navMenu) {
      const closeMobileMenu = () => {
        hamburger.classList.remove("is-open");
        navMenu.classList.remove("is-open");
        document.body.style.overflow = "";
      };

      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("is-open");
        navMenu.classList.toggle("is-open");
        document.body.style.overflow = navMenu.classList.contains("is-open")
          ? "hidden"
          : "";
      });

      navLinks.forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
          closeMobileMenu();
        }
      });
    }

    // Scroll Shadow
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 10) {
          navbar.style.boxShadow = "0 4px 32px rgba(0,0,0,0.6)";
        } else {
          navbar.style.boxShadow = "";
        }
      },
      { passive: true },
    );
  }

  // Initialize Footer event handlers
  function initFooterHandlers() {
    const cols = document.querySelectorAll(".footer-col");
    const emailLink = document.querySelector(".footer-email");
    const yearEl = document.querySelector(".footer-year");

    // Reveal Animation
    if (cols.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const delay = el.dataset.delay || 0;
              setTimeout(() => {
                el.classList.add("is-visible");
              }, Number(delay));
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.15 },
      );

      cols.forEach((col, index) => {
        col.dataset.delay = index * 120;
        observer.observe(col);
      });
    }

    // Copy Email to Clipboard
    if (emailLink) {
      emailLink.setAttribute("title", "Klik untuk menyalin email");
      emailLink.style.cursor = "pointer";

      emailLink.addEventListener("click", (e) => {
        e.preventDefault();
        const email = emailLink.textContent.trim();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(() => {
            showToast("Email disalin: " + email);
          });
        } else {
          const temp = document.createElement("input");
          temp.value = email;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
          showToast("Email disalin: " + email);
        }
      });
    }

    // Footer Year
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // Helper for email copying toast
  function showToast(message) {
    const existing = document.getElementById("footer-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "footer-toast";
    toast.textContent = message;

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "2rem",
      left: "50%",
      transform: "translateX(-50%) translateY(10px)",
      background: "#cc2229",
      color: "#fff",
      padding: "0.6rem 1.4rem",
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontFamily: "'Barlow', sans-serif",
      fontWeight: "600",
      letterSpacing: "0.04em",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(10px)";
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 350);
    }, 2500);
  }

  // Initialize Projects modal logic (index.html only)
  function initProjectsHandler() {
    const projectCards = document.querySelectorAll(".project-card");
    const modal = document.getElementById("projectModal");
    const modalExpandBg = document.getElementById("modalExpandBg");
    const modalClose = document.getElementById("modalClose");
    const modalOverlay = document.getElementById("modalOverlay");
    const modalVideo = document.getElementById("modalVideo");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");

    if (!modal) return;

    function openModal(card) {
      const meta = card.querySelector(".project-card__meta");
      if (!meta) return;
      const title = meta.querySelector(".meta-title").innerHTML;
      const desc = meta.querySelector(".meta-desc").innerHTML;
      const imgSrc = meta.querySelector(".meta-img").textContent;

      modalTitle.innerHTML = title;
      modalDesc.innerHTML = desc;
      const videoSource = modalVideo.querySelector('source');
      videoSource.src = imgSrc;
      modalVideo.load();

      const rect = card.getBoundingClientRect();
      modalExpandBg.style.top = rect.top + "px";
      modalExpandBg.style.left = rect.left + "px";
      modalExpandBg.style.width = rect.width + "px";
      modalExpandBg.style.height = rect.height + "px";

      const wrapperWidth = Math.min(window.innerWidth * 0.50, 550);
      const wrapperHeight = Math.min(window.innerHeight * 0.60, 600);
      const wrapperLeft = (window.innerWidth - wrapperWidth) / 2;
      const wrapperTop = Math.max((window.innerHeight - wrapperHeight) / 2, 40);

      modal.classList.add("is-animating");
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          modalExpandBg.style.top = wrapperTop + "px";
          modalExpandBg.style.left = wrapperLeft + "px";
          modalExpandBg.style.width = wrapperWidth + "px";
          modalExpandBg.style.height = wrapperHeight + "px";
          modal.classList.add("is-active");
        });
      });
    }

    function closeModal() {
      modal.classList.remove("is-active");
      setTimeout(() => {
        modal.classList.remove("is-animating");
        document.body.style.overflow = "";
        modalVideo.querySelector('source').src = "";
        modalVideo.load();
      }, 400);
    }

    projectCards.forEach((card) => {
      card.addEventListener("click", () => openModal(card));
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
  }

  // Orchestrate component loading and layout initialization
  function init() {
    const isRoot = !window.location.pathname.includes("/html/");
    const pathPrefix = isRoot ? "" : "../";

    // Load Navbar
    loadComponent(
      "#navbar-placeholder",
      pathPrefix + "html/navbar.html",
      () => {
        // Adjust links depending on subfolder vs root
        if (!isRoot) {
          const logoLink = document.querySelector(".navbar__logo");
          if (logoLink) logoLink.setAttribute("href", "../index.html");

          const worksLink = document.querySelector(
            '.navbar__menu .nav-btn[href="index.html"]',
          );
          if (worksLink) worksLink.setAttribute("href", "../index.html");

          // Perbaiki link untuk halaman subfolder
          const htmlLinks = document.querySelectorAll(
            '.navbar__menu .nav-btn[href^="html/"]',
          );
          htmlLinks.forEach((link) => {
            const currentHref = link.getAttribute("href");
            link.setAttribute("href", currentHref.replace("html/", ""));
          });
        } else {
          const logoLink = document.querySelector(".navbar__logo");
          if (logoLink) logoLink.setAttribute("href", "#");

          const worksLink = document.querySelector(
            '.navbar__menu .nav-btn[href="index.html"]',
          );
          if (worksLink) {
            worksLink.setAttribute("href", "#");
            worksLink.classList.add("nav-btn--active");
          }
        }

        // Setup theme/search/hamburger handlers
        initNavbarHandlers(isRoot);
      },
    );

    // Load Footer
    loadComponent(
      "#footer-placeholder",
      pathPrefix + "html/footer.html",
      () => {
        initFooterHandlers();
      },
    );

    // Initialize projects immediately if elements exist (e.g. index.html)
    initProjectsHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
