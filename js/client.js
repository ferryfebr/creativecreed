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
   * isMobile: true jika lebar layar <= 768px (Mobile & Tablet).
   * Semua konstanta di bawah otomatis menyesuaikan berdasarkan ini.
   * Desktop (> 768px) tidak berubah sama sekali.
   */
  const isMobile = window.innerWidth <= 768;

  /* ══════════════════════════════════════════════════════════
     KONFIGURASI DESKTOP (> 600px) — FINAL, JANGAN DIUBAH
     ══════════════════════════════════════════════════════════ */

  /*
   * LOGO_WIDTH  : harus cocok dengan `width` di CSS .marquee-item.
   * LOGO_GAP    : harus cocok dengan `gap` di CSS .marquee-track.
   * STEP_LOGOS  : berapa logo digeser per langkah.
   * CENTER_COUNT: berapa logo yang di-upscale di tengah.
   */
  const STEP_LOGOS = isMobile ? 1 : 2;     /* HP: geser 1 logo; Desktop: geser 2 logo */
  const CENTER_COUNT = isMobile ? 1 : 2;     /* HP: 1 logo membesar; Desktop: 2 logo   */

  /*
   * SLIDE_DURATION : durasi animasi geser (milidetik).
   */
  const SLIDE_DURATION = 520;

  /*
   * PAUSE_DURATION : jeda diam antar langkah (milidetik).
   */
  const PAUSE_DURATION = 1800;

  /* ── FUNGSI DINAMIS ── 
   * Agar CSS yang menggunakan vw (viewport width) tetap sinkron dengan JS.
   */
  function getTrackMetrics(track) {
    const item = track.querySelector(".marquee-item");
    const style = window.getComputedStyle(track);
    
    // Fallback default jika elemen belum sepenuhnya ter-render
    const defaultW = isMobile ? 65 : 100;
    const defaultG = isMobile ? 8 : 12;
    
    const w = item ? parseFloat(item.getBoundingClientRect().width) || defaultW : defaultW;
    let g = parseFloat(style.gap);
    if (isNaN(g)) g = defaultG;

    return { w, g };
  }

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
    
    // Gunakan fungsi dinamis agar sinkron dengan vw
    const metrics = getTrackMetrics(track);
    const halfWidth = logoCount * (metrics.w + metrics.g);

    /* Clone satu set lagi agar total ada 3 set (mencegah kekosongan di tepi layar) */
    originals.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    /* Hitung offset agar persis di tengah */
    const boardWidth = board.getBoundingClientRect().width;
    const boardCenter = boardWidth / 2;

    /* Offset awal: geser track agar celah (gap) berada persis di boardCenter.
     * Kita mulai dari set ke-2 agar punya ruang di kiri dan kanan.
     */
    const gapCenterOffset = halfWidth * 2 - (metrics.g / 2);
    let startOffset = gapCenterOffset - boardCenter;
    
    /* 
     * PERBAIKAN: Di mobile (1 logo), kita harus menggeser startOffset sejauh 
     * setengah logo + setengah gap agar LOGO-nya yang berada di tengah absolut, 
     * BUKAN celah (gap) antar logonya. Ini mengatasi logo condong ke kiri.
     */
    if (isMobile) {
      startOffset -= (metrics.w + metrics.g) / 2;
    }

    const state = {
      track,
      currentOffset: startOffset,
      halfWidth,
      resetLimit: halfWidth - (metrics.g / 2) - boardCenter,
      isHovered: false,
      logoCount
    };
    rowStates.push(state);

    /* Posisi awal */
    track.style.transition = "none";
    track.style.transform = `translateX(-${state.currentOffset}px)`;

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

      const metrics = getTrackMetrics(state.track);
      const stepPx = STEP_LOGOS * (metrics.w + metrics.g);

      state.currentOffset -= stepPx;

      state.track.style.transition = `transform ${SLIDE_DURATION}ms ease-in-out`;
      state.track.style.transform = `translateX(-${state.currentOffset}px)`;
    });

    /* FASE 2 — Setelah slide selesai */
    setTimeout(() => {

      const boardWidth = board.getBoundingClientRect().width;
      const boardCenter = boardWidth / 2;

      /* Reset seamless untuk baris yang sudah melewati batas reset */
      rowStates.forEach((state) => {
        // Kalkulasi ulang limit (menghindari error jika window di-resize dan vw berubah)
        const metrics = getTrackMetrics(state.track);
        const dynamicHalfWidth = state.logoCount * (metrics.w + metrics.g);
        const dynamicResetLimit = dynamicHalfWidth - (metrics.g / 2) - boardCenter;

        if (state.currentOffset <= dynamicResetLimit) {
          state.currentOffset += dynamicHalfWidth;
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
