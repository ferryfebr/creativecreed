/* =========================================
   DC Creative Creed – Services Page Script
   js/services.js
   ========================================= */

(function () {
    "use strict";

    // ── Scroll-in entrance animation for service cards ──────────────────
    function initServiceCardAnimations() {
        const cards = document.querySelectorAll(".service-card");
        if (!cards.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        const delay = Number(card.dataset.animDelay || 0);
                        setTimeout(() => {
                            card.classList.add("is-visible");
                        }, delay);
                        observer.unobserve(card);
                    }
                });
            },
            { threshold: 0.12 }
        );

        cards.forEach((card, index) => {
            // Stagger: left column 0ms, right column 80ms, each row adds 100ms
            card.dataset.animDelay = (index % 2) * 80 + Math.floor(index / 2) * 100;
            observer.observe(card);
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────
    function init() {
        initServiceCardAnimations();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
