/* =========================================
   DC Creative Creed – Showreel Script
   showreel.js
   ========================================= */

(function () {
  "use strict";

  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function requestVideoFullscreen(video) {
    if (!video) return false;

    /* iOS Safari: native video player fullscreen */
    if (typeof video.webkitEnterFullscreen === "function") {
      video.webkitEnterFullscreen();
      return true;
    }

    if (video.requestFullscreen) {
      video.requestFullscreen();
      return true;
    }

    if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
      return true;
    }

    if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
      return true;
    }

    return false;
  }

  function requestElementFullscreen(element) {
    if (!element) return false;

    if (element.requestFullscreen) {
      element.requestFullscreen();
      return true;
    }

    if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
      return true;
    }

    if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
      return true;
    }

    return false;
  }

  function exitAnyFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  function toggleFullscreen(video, fallbackEl) {
    if (getFullscreenElement()) {
      exitAnyFullscreen();
      return;
    }

    if (!requestVideoFullscreen(video)) {
      requestElementFullscreen(fallbackEl);
    }
  }

  /* -------------------------------------------------- *
   * 1. SHOWREEL CUSTOM VIDEO CONTROLS
   * -------------------------------------------------- */
  function initShowreelVideo(slidesList) {
    const slides = slidesList || document.querySelectorAll(".showreel-slide");
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

      const volSlider = controls.querySelector('[data-action="volume"]');

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
        if (volIcon && muteIcon) {
          if (video.muted || video.volume === 0) {
            volIcon.style.display = "none";
            muteIcon.style.display = "block";
          } else {
            volIcon.style.display = "block";
            muteIcon.style.display = "none";
          }
        }
        if (volSlider) {
          volSlider.value = video.muted ? 0 : video.volume;
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

      // Volume slider interaction
      if (volSlider) {
        volSlider.addEventListener("input", (e) => {
          e.stopPropagation();
          const newVol = parseFloat(e.target.value);
          video.volume = newVol;
          if (newVol > 0) {
            video.muted = false;
          } else {
            video.muted = true;
          }
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

      // Fullscreen (video-first for mobile / iOS; container fallback on desktop)
      if (fullscreenBtn) {
        const fullscreenFallback =
          slide.closest(".showreel-container") || slide;

        fullscreenBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFullscreen(video, fullscreenFallback);
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

    const originalSlides = Array.from(track.querySelectorAll(".showreel-slide"));
    const total = originalSlides.length;
    if (total < 2) return;

    // 1. Perform Cloning for Seamless Infinite Loop
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[total - 1].cloneNode(true);

    firstClone.classList.add("is-clone");
    lastClone.classList.add("is-clone");

    // Append and prepend clones to track
    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    // Now query all slides (including clones)
    const slides = track.querySelectorAll(".showreel-slide");
    const dots = document.querySelectorAll(".slider-dot");
    const counter = document.getElementById("slideCounter");
    
    // Initialize custom video controls on all slides (including clones)
    initShowreelVideo(slides);

    let currentIndex = 0; // 0 to total - 1
    let trackIndex = 1;   // 1 to total (0 is lastClone, total+1 is firstClone)
    let isTransitioning = false;

    // Set initial track transform (translate by 1 slide width to show first real slide)
    const videoContainer = document.getElementById("videoContainer");
    function getSlideWidth() {
      if (!videoContainer) return 0;
      return videoContainer.getBoundingClientRect().width;
    }

    function updateSlideWidths() {
      const slideWidth = getSlideWidth();
      slides.forEach((slide) => {
        slide.style.width = `${slideWidth}px`;
      });
    }

    updateSlideWidths();
    track.style.transition = "none";
    track.style.transform = `translateX(-${trackIndex * getSlideWidth()}px)`;
    track.offsetHeight; // force reflow

    function updateSlider(targetTrackIndex, animate = true) {
      if (animate) {
        track.style.transition = "transform 0.5s ease-in-out";
        isTransitioning = true;
      } else {
        track.style.transition = "none";
      }

      track.style.transform = `translateX(-${targetTrackIndex * getSlideWidth()}px)`;
      trackIndex = targetTrackIndex;

      // Map trackIndex back to currentIndex (0 to total - 1)
      if (trackIndex === 0) {
        currentIndex = total - 1;
      } else if (trackIndex === total + 1) {
        currentIndex = 0;
      } else {
        currentIndex = trackIndex - 1;
      }

      // Update active state and video playback
      slides.forEach((slide, i) => {
        const vid = slide.querySelector(".slider-video");
        const isActive = i === targetTrackIndex;

        slide.classList.toggle("is-active", isActive);

        if (vid) {
          if (isActive) {
            // Always play muted on transition to comply with browser autoplay and user requirements
            vid.muted = true;
            if (vid.paused) {
              vid.currentTime = 0;
              vid.play().catch(() => {});
            }
          } else {
            vid.pause();
          }
        }
      });

      // Update active dot indicator
      dots.forEach((dot, i) => {
        dot.classList.toggle("slider-dot--active", i === currentIndex);
      });

      // Update slide counter text
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${total}`;
      }
    }

    // Prev Button Click Handler
    prevBtn.addEventListener("click", () => {
      if (isTransitioning) return;
      updateSlider(trackIndex - 1);
    });

    // Next Button Click Handler
    nextBtn.addEventListener("click", () => {
      if (isTransitioning) return;
      updateSlider(trackIndex + 1);
    });

    // Dot Navigation Click Handler
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        if (isTransitioning) return;
        const targetIndex = parseInt(dot.dataset.index, 10);
        updateSlider(targetIndex + 1);
      });
    });

    // transitionend event: boundary check and instant snap to counterpart
    track.addEventListener("transitionend", () => {
      isTransitioning = false;

      if (trackIndex === 0) {
        // Snapping from lastClone to real last slide
        const cloneVid = slides[0].querySelector(".slider-video");
        const realVid = slides[total].querySelector(".slider-video");

        track.style.transition = "none";
        trackIndex = total;
        track.style.transform = `translateX(-${trackIndex * getSlideWidth()}px)`;
        track.offsetHeight; // force reflow

        // Sync active state class
        slides.forEach((slide, i) => {
          slide.classList.toggle("is-active", i === trackIndex);
        });

        // Sync playing states and playback position seamlessly
        if (cloneVid && realVid) {
          realVid.currentTime = cloneVid.currentTime;
          realVid.muted = true;
          realVid.play().catch(() => {});
          cloneVid.pause();
        }
      } else if (trackIndex === total + 1) {
        // Snapping from firstClone to real first slide
        const cloneVid = slides[total + 1].querySelector(".slider-video");
        const realVid = slides[1].querySelector(".slider-video");

        track.style.transition = "none";
        trackIndex = 1;
        track.style.transform = `translateX(-${trackIndex * getSlideWidth()}px)`;
        track.offsetHeight; // force reflow

        // Sync active state class
        slides.forEach((slide, i) => {
          slide.classList.toggle("is-active", i === trackIndex);
        });

        // Sync playing states and playback position seamlessly
        if (cloneVid && realVid) {
          realVid.currentTime = cloneVid.currentTime;
          realVid.muted = true;
          realVid.play().catch(() => {});
          cloneVid.pause();
        }
      }
    });

    // Handle Window Resize to keep alignment accurate
    window.addEventListener("resize", () => {
      updateSlideWidths();
      updateSlider(trackIndex, false);
    });

    // Initialize position and first video playback state
    updateSlider(trackIndex, false);
  }

  /* -------------------------------------------------- *
   * INIT — run when DOM ready
   * -------------------------------------------------- */
  function init() {
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
