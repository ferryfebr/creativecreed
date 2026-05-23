/* =========================================
   DC Creative Creed – Navbar Script
   script.js
   ========================================= */

(function () {
  "use strict";

  // --- Element References ---
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

  // =========================================
  // THEME TOGGLE
  // =========================================
  const THEME_KEY = "dc-creed-theme";

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }

  // Load saved theme preference
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  });

  // =========================================
  // SEARCH TOGGLE
  // =========================================
  searchToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = searchPopup.classList.toggle("is-open");
    if (isOpen) {
      // Focus input after transition
      setTimeout(() => searchInput.focus(), 50);
    }
  });

  // Close search when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchPopup.contains(e.target) && e.target !== searchToggle) {
      searchPopup.classList.remove("is-open");
    }
  });

  // Close search on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchPopup.classList.remove("is-open");
      searchInput.blur();
    }
  });

  // =========================================
  // ACTIVE NAV LINK
  // =========================================
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Remove active from all
      navLinks.forEach((l) => l.classList.remove("nav-btn--active"));
      // Set clicked as active
      this.classList.add("nav-btn--active");
    });
  });

  // =========================================
  // HAMBURGER / MOBILE MENU
  // =========================================
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("is-open");
    navMenu.classList.toggle("is-open");
    // Prevent body scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains("is-open")
      ? "hidden"
      : "";
  });

  // Close mobile menu when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  function closeMobileMenu() {
    hamburger.classList.remove("is-open");
    navMenu.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // Close mobile menu on resize back to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMobileMenu();
    }
  });

  // =========================================
  // NAVBAR SCROLL SHADOW
  // =========================================
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

  // =========================================
  // PROJECT MODAL
  // =========================================
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('projectModal');
  const modalExpandBg = document.getElementById('modalExpandBg');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');
  
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');

  function openModal(card) {
    // Get card data
    const meta = card.querySelector('.project-card__meta');
    const title = meta.querySelector('.meta-title').innerHTML;
    const desc = meta.querySelector('.meta-desc').innerHTML;
    const imgSrc = meta.querySelector('.meta-img').textContent;
    
    // Set content
    modalTitle.innerHTML = title;
    modalDesc.innerHTML = desc;
    modalImg.src = imgSrc;
    
    // Get card rect for the starting position of animation
    const rect = card.getBoundingClientRect();
    
    // Set initial position of the expanding background
    modalExpandBg.style.top = rect.top + 'px';
    modalExpandBg.style.left = rect.left + 'px';
    modalExpandBg.style.width = rect.width + 'px';
    modalExpandBg.style.height = rect.height + 'px';
    
    // Add classes to start animation
    modal.classList.add('is-animating');
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Request animation frame to ensure the initial state is applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Expand to fullscreen
        modalExpandBg.style.top = '0px';
        modalExpandBg.style.left = '0px';
        modalExpandBg.style.width = '100vw';
        modalExpandBg.style.height = '100vh';
        
        modal.classList.add('is-active');
      });
    });
  }

  function closeModal() {
    modal.classList.remove('is-active');
    
    // After fade out of content completes, revert the expanding background
    setTimeout(() => {
      // Find the currently clicked card if we want to shrink back exactly,
      // or we can just fade it out
      modal.classList.remove('is-animating');
      document.body.style.overflow = '';
      
      // Reset video/image if needed
      modalImg.src = '';
    }, 400); // Wait for opacity transition
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modalOverlay) modalOverlay.addEventListener('click', closeModal);

})();
/**
 * footer.js
 * Handles reveal animation dan interaksi kecil pada footer.
 */

(function () {
  "use strict";

  /* -------------------------------------------------- *
   * 1. INTERSECTION OBSERVER — Reveal kolom saat footer
   *    masuk viewport (staggered per kolom).
   * -------------------------------------------------- */
  function initReveal() {
    const cols = document.querySelectorAll(".footer-col");
    if (!cols.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || 0;

            setTimeout(function () {
              el.classList.add("is-visible");
            }, Number(delay));

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 },
    );

    cols.forEach(function (col, index) {
      col.dataset.delay = index * 120; // stagger 120 ms per kolom
      observer.observe(col);
    });
  }

  /* -------------------------------------------------- *
   * 2. EMAIL COPY — klik alamat email salin ke clipboard
   * -------------------------------------------------- */
  function initEmailCopy() {
    const emailLink = document.querySelector(".footer-email");
    if (!emailLink) return;

    emailLink.setAttribute("title", "Klik untuk menyalin email");
    emailLink.style.cursor = "pointer";

    emailLink.addEventListener("click", function (e) {
      e.preventDefault();
      const email = emailLink.textContent.trim();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          showToast("Email disalin: " + email);
        });
      } else {
        // Fallback untuk browser lama
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

  /* -------------------------------------------------- *
   * 3. TOAST NOTIFICATION
   * -------------------------------------------------- */
  function showToast(message) {
    // Hapus toast lama jika ada
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

    // Trigger animasi masuk
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });
    });

    // Auto-hilang setelah 2.5 detik
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(10px)";
      setTimeout(function () {
        if (toast.parentNode) toast.remove();
      }, 350);
    }, 2500);
  }

  /* -------------------------------------------------- *
   * 4. CURRENT YEAR di copyright (opsional)
   *    Jika ada elemen dengan class .footer-year,
   *    isinya akan di-update otomatis.
   * -------------------------------------------------- */
  function initYear() {
    const yearEl = document.querySelector(".footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* -------------------------------------------------- *
   * INIT — jalankan semua setelah DOM siap
   * -------------------------------------------------- */
  function init() {
    initReveal();
    initEmailCopy();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
