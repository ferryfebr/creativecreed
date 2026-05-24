/* =========================================
   DC Creative Creed – Showreel Script
   showreel.js
   ========================================= */

(function () {
  "use strict";

  /* -------------------------------------------------- *
   * 1. SHOWREEL CUSTOM VIDEO CONTROLS
   * -------------------------------------------------- */
  function initShowreelVideo() {
    const slides = document.querySelectorAll(".showreel-slide");
    if (!slides.length) return;

    slides.forEach((slide) => {
      const video = slide.querySelector(".slider-video");
      const controls = slide.querySelector(".vc");
      if (!video || !controls) return;

      const playPauseBtn = controls.querySelector('[data-action="playpause"]');
      const playIcon = playPauseBtn
        ? playPauseBtn.querySelector(".vc__icon--play")
        : null;
      const pauseIcon = playPauseBtn
        ? playPauseBtn.querySelector(".vc__icon--pause")
        : null;

      const muteBtn = controls.querySelector('[data-action="mute"]');
      const volIcon = muteBtn ? muteBtn.querySelector(".vc__icon--vol") : null;
      const muteIcon = muteBtn
        ? muteBtn.querySelector(".vc__icon--muted")
        : null;

      const fullscreenBtn = controls.querySelector(
        '[data-action="fullscreen"]',
      );
      const progressWrapper = controls.querySelector('[data-action="seek"]');
      const progressBar = controls.querySelector(".vc__progress-fill");
      const progressThumb = controls.querySelector(".vc__progress-thumb");

      // Sync Play/Pause UI state with video state
      function updatePlayPauseUI() {
        if (!playIcon || !pauseIcon) return;
        if (video.paused) {
          playIcon.style.display = "block";
          pauseIcon.style.display = "none";
        } else {
          playIcon.style.display = "none";
          pauseIcon.style.display = "block";
        }
      }

      // Sync Mute/Unmute UI state with video state
      function updateMuteUI() {
        if (!volIcon || !muteIcon) return;
        if (video.muted) {
          volIcon.style.display = "none";
          muteIcon.style.display = "block";
        } else {
          volIcon.style.display = "block";
          muteIcon.style.display = "none";
        }
      }

      // Set initial state
      updatePlayPauseUI();
      updateMuteUI();

      // Listen to video events to keep UI in sync
      video.addEventListener("play", updatePlayPauseUI);
      video.addEventListener("pause", updatePlayPauseUI);
      video.addEventListener("volumechange", updateMuteUI);

      // Play/Pause Action on button click
      if (playPauseBtn) {
        playPauseBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (video.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }

      // Play/Pause Action when clicking the video itself
      video.addEventListener("click", (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });

      // Mute/Unmute Action
      if (muteBtn) {
        muteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          video.muted = !video.muted;
        });
      }

      // Progress Bar updates
      video.addEventListener("timeupdate", () => {
        if (video.duration) {
          const percentage = (video.currentTime / video.duration) * 100;
          if (progressBar) progressBar.style.width = percentage + "%";
          if (progressThumb) progressThumb.style.left = percentage + "%";
        }
      });

      // Seek functionality
      if (progressWrapper) {
        let isDragging = false;

        const handleSeek = (e) => {
          const rect = progressWrapper.getBoundingClientRect();
          let pos = (e.clientX - rect.left) / rect.width;
          pos = Math.max(0, Math.min(1, pos));
          if (video.duration) {
            video.currentTime = pos * video.duration;
          }
        };

        progressWrapper.addEventListener("click", (e) => {
          e.stopPropagation();
          handleSeek(e);
        });

        progressWrapper.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          isDragging = true;
          handleSeek(e);
        });

        window.addEventListener("mousemove", (e) => {
          if (isDragging) {
            handleSeek(e);
          }
        });

        window.addEventListener("mouseup", () => {
          isDragging = false;
        });
      }

      // Fullscreen Action
      if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!document.fullscreenElement) {
            if (slide.requestFullscreen) {
              slide.requestFullscreen();
            } else if (slide.webkitRequestFullscreen) {
              slide.webkitRequestFullscreen();
            } else if (slide.msRequestFullscreen) {
              slide.msRequestFullscreen();
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }
        });
      }
    });
  }

  /* -------------------------------------------------- *
   * 2. SHOWREEL SLIDER LOGIC
   * -------------------------------------------------- */
  function initShowreelSlider() {
    const track = document.getElementById("showreelTrack");
    const prevBtn = document.getElementById("sliderPrev");
    const nextBtn = document.getElementById("sliderNext");

    if (!track || !prevBtn || !nextBtn) return;

    const slides = document.querySelectorAll(".showreel-slide");
    const dots = document.querySelectorAll(".slider-dot");
    const counter = document.getElementById("slideCounter");
    const total = slides.length;
    let currentIndex = 0;

    function updateSlider() {
      // Geser track ke slide yang aktif
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Pause semua video, play video aktif, dan toggle class is-active
      slides.forEach((slide, i) => {
        const vid = slide.querySelector(".slider-video");
        const isActive = i === currentIndex;

        slide.classList.toggle("is-active", isActive);

        if (vid) {
          if (isActive) {
            vid.currentTime = 0;
            vid.play().catch(() => {}); // catch jika browser blokir autoplay
          } else {
            vid.pause();
          }
        }
      });

      // Update dot aktif
      dots.forEach((dot, i) => {
        dot.classList.toggle("slider-dot--active", i === currentIndex);
      });

      // Update counter
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${total}`;
      }
    }

    // Tombol panah kiri
    prevBtn.addEventListener("click", () => {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : total - 1;
      updateSlider();
    });

    // Tombol panah kanan
    nextBtn.addEventListener("click", () => {
      currentIndex = currentIndex < total - 1 ? currentIndex + 1 : 0;
      updateSlider();
    });

    // Klik dot → loncat ke slide tertentu
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        currentIndex = parseInt(dot.dataset.index, 10);
        updateSlider();
      });
    });

    // Inisialisasi awal — pastikan video pertama play
    updateSlider();
  }

  /* -------------------------------------------------- *
   * INIT — jalankan setelah DOM siap
   * -------------------------------------------------- */
  function init() {
    initShowreelVideo();
    initShowreelSlider();

    // Menangani Spacebar untuk Play/Pause video yang sedang aktif
    document.addEventListener("keydown", (e) => {
      if (
        e.code === "Space" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault(); // Mencegah halaman scroll ke bawah

        // Cari slide yang sedang aktif saat ini (atau slide pertama jika belum ada)
        const activeSlide =
          document.querySelector(".showreel-slide.is-active") ||
          document.querySelector(".showreel-slide");
        if (activeSlide) {
          const video = activeSlide.querySelector(".slider-video");
          if (video) {
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
