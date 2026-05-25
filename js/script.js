/* =========================================
   DC Creative Creed – Main Script & Loader
   js/script.js
   ========================================= */

(function () {
  "use strict";

  const THEME_KEY = "dc-creed-theme";
  const FONT_AWESOME_HREF =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css";

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

  function ensureFontAwesome() {
    const existing = document.querySelector(
      `link[rel="stylesheet"][href="${FONT_AWESOME_HREF}"]`,
    );

    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_AWESOME_HREF;
    document.head.appendChild(link);
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
          clearHighlights();
        }
      });

      // --- Search Custom Replica UI Logic ---
      let matches = [];
      let currentMatchIndex = -1;
      const searchCounter = document.getElementById("searchCounter");
      const searchNext = document.getElementById("searchNext");
      const searchPrev = document.getElementById("searchPrev");

      function clearHighlights() {
        // Find all <mark class="find-highlight"> and unwrap them
        const marks = document.querySelectorAll('mark.find-highlight');
        marks.forEach(mark => {
          const parent = mark.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
          }
        });
        matches = [];
        currentMatchIndex = -1;
        updateCounter();
      }

      function highlightText(query) {
        clearHighlights();
        if (!query) return;

        // Escape regex special characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        // TreeWalker to iterate only through text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: function(node) {
            const parent = node.parentNode;
            // Ignore script, style, and already marked elements
            if (['SCRIPT', 'STYLE', 'MARK', 'NOSCRIPT'].includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        });

        const textNodes = [];
        let nextNode;
        while ((nextNode = walker.nextNode())) {
          textNodes.push(nextNode);
        }

        textNodes.forEach(node => {
          const text = node.nodeValue;
          regex.lastIndex = 0;
          let match;
          let lastIndex = 0;
          const frag = document.createDocumentFragment();

          while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              frag.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            const mark = document.createElement('mark');
            mark.className = 'find-highlight';
            mark.textContent = match[0];
            frag.appendChild(mark);
            matches.push(mark);
            lastIndex = regex.lastIndex;
          }
          if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.substring(lastIndex)));
          }
          node.parentNode.replaceChild(frag, node);
        });

        if (matches.length > 0) {
          currentMatchIndex = 0;
          focusMatch(0);
        }
        updateCounter();
      }

      function focusMatch(index) {
        if (matches.length === 0) return;
        matches.forEach(m => m.classList.remove('active-match'));
        let m = matches[index];
        m.classList.add('active-match');
        
        // Calculate offset so we don't hide under the sticky navbar
        const navbarHeight = 80;
        const rect = m.getBoundingClientRect();
        const absoluteY = window.pageYOffset + rect.top;
        window.scrollTo({
          top: absoluteY - navbarHeight - 40,
          behavior: 'smooth'
        });
        updateCounter();
      }

      function updateCounter() {
        if (!searchCounter) return;
        if (matches.length === 0) {
          searchCounter.textContent = searchInput.value.trim() ? "0/0" : "";
        } else {
          searchCounter.textContent = `${currentMatchIndex + 1}/${matches.length}`;
        }
      }

      searchInput.addEventListener("input", (e) => {
        highlightText(e.target.value.trim());
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (matches.length > 0) {
            currentMatchIndex = e.shiftKey
              ? (currentMatchIndex - 1 + matches.length) % matches.length
              : (currentMatchIndex + 1) % matches.length;
            focusMatch(currentMatchIndex);
          }
        }
      });

      if (searchNext) {
        searchNext.addEventListener("click", () => {
          if (matches.length > 0) {
            currentMatchIndex = (currentMatchIndex + 1) % matches.length;
            focusMatch(currentMatchIndex);
          }
        });
      }

      if (searchPrev) {
        searchPrev.addEventListener("click", () => {
          if (matches.length > 0) {
            currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
            focusMatch(currentMatchIndex);
          }
        });
      }
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
    const footer = document.querySelector(".site-footer");
    const waButton = document.querySelector(".floating-wa");

    // Observer to manage WhatsApp button scroll boundary
    if (footer && waButton) {
      window.addEventListener("scroll", () => {
        const footerRect = footer.getBoundingClientRect();
        
        // If footer's top edge enters the viewport
        if (footerRect.top < window.innerHeight) {
          // Calculate the overlap distance
          const overlap = window.innerHeight - footerRect.top;
          // Apply initial 30px offset + overlap
          waButton.style.bottom = (30 + overlap) + "px";
        } else {
          // Reset to default if footer is not in view
          waButton.style.bottom = "30px";
        }
      }, { passive: true });
    }

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

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = scrollbarWidth + "px";
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
        document.body.style.paddingRight = "";
        modalVideo.querySelector('source').src = "";
        modalVideo.load();
      }, 400);
    }

    projectCards.forEach((card) => {
      card.addEventListener("click", () => openModal(card));
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    // Show More / Show Less Logic
    const btnShowMore = document.getElementById("btnShowMore");
    const extraCards = document.querySelectorAll(".project-card--extra");
    let isExpanded = false;

    if (btnShowMore && extraCards.length > 0) {
      btnShowMore.addEventListener("click", (e) => {
        e.preventDefault();
        isExpanded = !isExpanded;

        if (isExpanded) {
          extraCards.forEach(card => {
            card.classList.add("is-visible");
            // Wait for max-height animation to finish before showing overflow (title text)
            setTimeout(() => {
              if (card.classList.contains("is-visible")) {
                card.style.overflow = "visible";
              }
            }, 800);
          });
        } else {
          extraCards.forEach(card => {
            card.style.overflow = "hidden"; // Hide overflow immediately before collapsing
            card.classList.remove("is-visible");
          });
        }

        btnShowMore.textContent = isExpanded ? "Show Less" : "Show More";
      });
    }
  }

  // =========================================
  // SCROLL REVEAL (IntersectionObserver)
  // =========================================
  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".scroll-reveal");
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay || 0;
            setTimeout(() => {
              el.classList.add("is-visible");
            }, Number(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el, index) => {
      if (!el.hasAttribute("data-reveal-delay")) {
        el.dataset.revealDelay = index * 80;
      }
      observer.observe(el);
    });
  }

  // Orchestrate component loading and layout initialization
  function init() {
    const isRoot = !window.location.pathname.includes("/html/");
    const pathPrefix = isRoot ? "" : "../";

    ensureFontAwesome();

    // Init scroll reveal for elements already in DOM
    initScrollReveal();

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

          const contactLink = document.querySelector(
            '.navbar__menu .nav-btn[href="index.html#contact"]',
          );
          if (contactLink) contactLink.setAttribute("href", "../index.html#contact");

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

          const contactLink = document.querySelector(
            '.navbar__menu .nav-btn[href="index.html#contact"]',
          );
          if (contactLink) {
            contactLink.setAttribute("href", "#contact");
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
        // Also run scroll reveal again after footer is injected into DOM
        initScrollReveal();

        // Fix scroll position for cross-page anchor links (e.g. #contact)
        if (window.location.hash) {
          setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }, 200); // Wait for DOM layout to settle after fetching components
        }
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
