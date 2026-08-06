      /* Exclusive Promotion — video, posters + shared modal */
      (function initPromotionModal() {
        const previewVideo = document.getElementById("promotionPreviewVideo");
        const playBtn = document.getElementById("promotionPlayBtn");
        const modal = document.getElementById("promoModal");
        const backdrop = document.getElementById("promoModalBackdrop");
        const closeBtn = document.getElementById("promoModalClose");
        const modalVideo = document.getElementById("promoModalVideo");
        const modalPoster = document.getElementById("promoModalPoster");
        const modalBody = document.getElementById("promoModalBody");
        const modalCopy = document.getElementById("promoModalCopy");
        const postersCarousel = document.getElementById("promotionPostersCarousel");

        if (!modal || !modalVideo || !modalPoster) return;

        if (previewVideo) {
          previewVideo.pause();
          previewVideo.currentTime = 0;
        }

        function showVideoMode() {
          modal.classList.remove("is-poster-mode");
          modalPoster.hidden = true;
          modalVideo.hidden = false;
          modalVideo.controls = true;
          if (modalBody) modalBody.hidden = true;
        }

        function showPosterMode(src, alt, index) {
          modal.classList.add("is-poster-mode");
          modalVideo.pause();
          modalVideo.currentTime = 0;
          modalVideo.hidden = true;
          modalVideo.controls = false;
          modalPoster.src = src;
          modalPoster.alt = alt || "Promotion poster";
          modalPoster.hidden = false;
          if (modalBody) modalBody.hidden = false;
          if (modalCopy) {
            const template = document.getElementById("posterText-" + index);
            modalCopy.innerHTML = "";
            if (template) {
              modalCopy.append(template.content.cloneNode(true));
            }
          }
        }

        function resetPosterText() {
          if (modalCopy) modalCopy.innerHTML = "";
        }

        function openVideoModal() {
          showVideoMode();
          modal.hidden = false;
          modal.setAttribute("aria-hidden", "false");
          modal.classList.add("is-open");
          document.body.classList.add("promo-modal-open");
          modalVideo.currentTime = 0;
          modalVideo.muted = false;
          const playPromise = modalVideo.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        }

        function openPosterModal(trigger) {
          const src =
            trigger.dataset.posterSrc ||
            trigger.querySelector(".promotion-poster")?.src;
          const alt = trigger.querySelector(".promotion-poster")?.alt || "";
          const index = parseInt(trigger.dataset.posterIndex, 10) || 0;
          if (!src) return;

          showPosterMode(src, alt, index);
          modal.hidden = false;
          modal.setAttribute("aria-hidden", "false");
          modal.classList.add("is-open");
          document.body.classList.add("promo-modal-open");
        }

        function closeModal() {
          modal.classList.remove("is-open", "is-poster-mode");
          modal.setAttribute("aria-hidden", "true");
          document.body.classList.remove("promo-modal-open");
          modalVideo.pause();
          modalVideo.currentTime = 0;
          modalVideo.hidden = false;
          modalPoster.hidden = true;
          modalPoster.removeAttribute("src");
          if (modalBody) modalBody.hidden = true;
          resetPosterText();
          window.setTimeout(() => {
            if (!modal.classList.contains("is-open")) {
              modal.hidden = true;
            }
          }, 350);
        }

        if (playBtn) {
          playBtn.addEventListener("click", openVideoModal);
        }

        if (postersCarousel) {
          postersCarousel.addEventListener("click", (e) => {
            const trigger = e.target.closest(".promotion-poster-trigger");
            if (trigger && postersCarousel.contains(trigger)) {
              openPosterModal(trigger);
            }
          });
        }

        closeBtn.addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
          }
        });
      })();

      /* Promotion posters — auto carousel sederhana (1→2→3→1) */
      (function initPromotionPosterCarousel() {
        const carousel = document.getElementById("promotionPostersCarousel");
        const track = document.getElementById("promotionPostersTrack");
        if (!carousel || !track) return;

        const viewport = carousel.querySelector(".promotion-posters-viewport");

        function getItems() {
          return Array.from(track.querySelectorAll(".promotion-poster-trigger")).sort(
            (a, b) =>
              parseInt(a.dataset.posterIndex, 10) -
              parseInt(b.dataset.posterIndex, 10),
          );
        }

        let items = getItems();
        const total = items.length;
        if (total < 2) return;

        items.forEach((el) => track.appendChild(el));
        items = getItems();

        const TRANSITION =
          "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";
        const AUTOPLAY_MS = 4000;

        let activeIndex = 0;
        let autoplayTimer = null;

        function getGap() {
          return (
            parseFloat(
              getComputedStyle(track).columnGap ||
                getComputedStyle(track).gap,
            ) || 0
          );
        }

        function updateCarousel(animate) {
          items.forEach((item, i) => {
            item.classList.remove("is-center", "is-side");
            if (i === activeIndex) {
              item.classList.add("is-center");
            } else {
              item.classList.add("is-side");
            }
          });

          const viewportWidth = viewport.offsetWidth;
          const itemWidth = items[0].offsetWidth;
          const gap = getGap();
          const offset =
            viewportWidth / 2 -
            (activeIndex * (itemWidth + gap) + itemWidth / 2);

          track.style.transition = animate ? TRANSITION : "none";
          track.style.transform = `translateX(${offset}px)`;

          if (!animate) {
            track.offsetHeight;
            track.style.transition = "";
          }
        }

        function stepNext() {
          activeIndex = (activeIndex + 1) % total;
          updateCarousel(true);
        }

        function startAutoplay() {
          stopAutoplay();
          autoplayTimer = window.setInterval(stepNext, AUTOPLAY_MS);
        }

        function stopAutoplay() {
          if (autoplayTimer) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
          }
        }

        carousel.addEventListener("mouseenter", stopAutoplay);
        carousel.addEventListener("mouseleave", startAutoplay);
        window.addEventListener("resize", () => updateCarousel(false));

        updateCarousel(false);
        startAutoplay();
      })();