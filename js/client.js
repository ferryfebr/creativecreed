/* =========================================================
   CLIENT PAGE — client.js
   =========================================================
   Fungsi utama:
   1. GLOBAL STEP TIMER  — satu timer bersama menggerakkan
      semua baris serentak, tanpa stagger.
   2. HOVER PER BARIS    — hover pada satu baris menghentikan
      HANYA baris itu; baris lain tetap berjalan.
   3. CENTER UPSCALE     — setelah tiap step selesai, 2 logo
      terdekat dari pusat board ditandai "is-center" secara
      EKSPLISIT (bukan deteksi rAF berkelanjutan), sehingga
      selalu tepat 2 logo yang membesar.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ══════════════════════════════════════════════════════════
     DETEKSI PERANGKAT
     ══════════════════════════════════════════════════════════ */

  /*
   * isMobile: true jika lebar layar ≤ 600px (HP pada umumnya).
   * Semua konstanta di bawah otomatis menyesuaikan berdasarkan ini.
   * Desktop (> 600px) tidak berubah sama sekali.
   */
  const isMobile = window.innerWidth <= 600;

  /* ════════════════════════════════════════════════════════
     UKURAN LOGO — dibaca dari DOM setelah CSS dirender
     Cara ini membuat JS otomatis mengikuti nilai CSS di semua
     breakpoint (termasuk layar besar ≥14 inch) tanpa perlu
     update kode JS setiap kali CSS diubah.
     ════════════════════════════════════════════════════════ */

  /* Baca ukuran aktual dari elemen pertama di DOM */
  const _sampleItem  = document.querySelector(".marquee-item");
  const _sampleTrack = document.querySelector(".marquee-track");

  const LOGO_WIDTH = _sampleItem
    ? Math.round(_sampleItem.getBoundingClientRect().width)
    : (isMobile ? 65 : 100);

  const LOGO_GAP = _sampleTrack
    ? (parseFloat(window.getComputedStyle(_sampleTrack).gap) || (isMobile ? 8 : 12))
    : (isMobile ? 8 : 12);

  const STEP_LOGOS  = isMobile ? 1 : 2;
  const CENTER_COUNT = isMobile ? 1 : 2;

  /*
   * SLIDE_DURATION : durasi animasi geser (milidetik).
   *   Default: 520ms
   */
  const SLIDE_DURATION = 520;

  /*
   * PAUSE_DURATION : jeda diam antar langkah (milidetik).
   *   Default: 1800ms
   */
  const PAUSE_DURATION = 1800;

  /* ── DERIVED (tidak perlu diubah manual) ── */
  const STEP_PX = STEP_LOGOS * (LOGO_WIDTH + LOGO_GAP);

  /* ══════════════════════════════════════════════════════════
     INISIALISASI STATE TIAP BARIS
     ══════════════════════════════════════════════════════════ */

  const board = document.querySelector(".clients-board");
  const rows = document.querySelectorAll(".marquee-row");
  const rowStates = [];

  rows.forEach((row) => {
    const track = row.querySelector(".marquee-track");
    if (!track) return;

    const originals = track.querySelectorAll(".marquee-item:not([aria-hidden='true'])");
    const logoCount = originals.length;
    const halfWidth = logoCount * (LOGO_WIDTH + LOGO_GAP);

    const state = {
      track,
      currentOffset: halfWidth,
      halfWidth,
      isHovered: false,
    };
    rowStates.push(state);

    /* Posisi awal — tampilkan set duplikat (untuk arah scroll ke kanan) */
    track.style.transition = "none";
    track.style.transform = `translateX(-${halfWidth}px)`;

    /* ── HOVER PER BARIS ── */
    row.addEventListener("mouseenter", () => {
      state.isHovered = true;
      row.classList.add("is-hovered");
    });
    row.addEventListener("mouseleave", () => {
      state.isHovered = false;
      row.classList.remove("is-hovered");
    });
  });

  /* ══════════════════════════════════════════════════════════
     UPSCALE HELPER — eksplisit, bukan rAF berkelanjutan
     ══════════════════════════════════════════════════════════ */

  /**
   * Hapus semua class "is-center" dari seluruh baris.
   * Dipanggil SEBELUM slide dimulai.
   */
  function clearCenterLogos() {
    rows.forEach((row) => {
      row.querySelectorAll(".marquee-item.is-center").forEach((item) => {
        item.classList.remove("is-center");
      });
    });
  }

  /**
   * Setelah slide selesai: untuk setiap baris, cari CENTER_COUNT logo
   * yang pusat horizontalnya paling dekat dengan pusat board,
   * lalu tambahkan class "is-center" ke logo-logo tersebut.
   *
   * Pendekatan ini DETERMINISTIK — tidak bergantung pada zona piksel
   * yang harus "pas", sehingga selalu tepat 2 logo yang membesar.
   */
  function markCenterLogos() {
    if (!board) return;

    const boardRect = board.getBoundingClientRect();
    const boardCenterX = boardRect.left + boardRect.width / 2;

    rows.forEach((row) => {
      /* Ambil semua item yang masih dalam area board (visible) */
      const items = Array.from(row.querySelectorAll(".marquee-item")).filter((item) => {
        const r = item.getBoundingClientRect();
        /* Item dianggap visible jika area-nya bersinggungan dengan board */
        return r.right > boardRect.left && r.left < boardRect.right;
      });

      /* Urutkan berdasarkan jarak pusat item dari pusat board (terdekat duluan) */
      items.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const distA = Math.abs((ra.left + ra.width / 2) - boardCenterX);
        const distB = Math.abs((rb.left + rb.width / 2) - boardCenterX);
        return distA - distB;
      });

      /* Tandai CENTER_COUNT logo terdekat */
      items.slice(0, CENTER_COUNT).forEach((item) => {
        item.classList.add("is-center");
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     TIMER GLOBAL — semua baris bergerak BERSAMAAN
     ══════════════════════════════════════════════════════════ */

  function doGlobalStep() {

    /* Hapus upscale sebelum mulai bergerak */
    clearCenterLogos();

    /* FASE 1 — Geser semua baris yang tidak di-hover */
    rowStates.forEach((state) => {
      if (state.isHovered) return;

      state.currentOffset -= STEP_PX;

      state.track.style.transition = `transform ${SLIDE_DURATION}ms ease-in-out`;
      state.track.style.transform = `translateX(-${state.currentOffset}px)`;
    });

    /* FASE 2 — Setelah slide selesai */
    setTimeout(() => {

      /* Reset seamless untuk baris yang sudah di titik 0 */
      rowStates.forEach((state) => {
        if (state.currentOffset <= 0) {
          state.currentOffset = state.halfWidth;
          state.track.style.transition = "none";
          state.track.style.transform = `translateX(-${state.currentOffset}px)`;
          void state.track.offsetHeight; /* force reflow */
        }
      });

      /* Logo sudah berhenti — tandai 2 logo tengah di tiap baris */
      markCenterLogos();

      /* Jadwalkan step berikutnya */
      setTimeout(doGlobalStep, PAUSE_DURATION);

    }, SLIDE_DURATION);
  }

  /* Tandai center logos di posisi awal, lalu mulai timer */
  setTimeout(() => {
    markCenterLogos();
    setTimeout(doGlobalStep, PAUSE_DURATION);
  }, 100); /* Tunggu sebentar agar layout selesai dihitung */

});
