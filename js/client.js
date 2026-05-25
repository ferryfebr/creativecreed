document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".client-logo-wrapper");
  const columnsPerRow = 6; // Karena grid menggunakan repeat(6, 1fr)

  logos.forEach((logo, index) => {
    // Menghitung baris ke berapa logo ini berada (mulai dari 0)
    const rowIndex = Math.floor(index / columnsPerRow);

    // Memberikan delay berdasarkan baris: baris 0 delay 0s, baris 1 delay 0.2s, baris 2 delay 0.4s, dst.
    logo.style.transitionDelay = `${rowIndex * 0.7}s`;
  });

  const board = document.querySelector(".clients-board");
  if (board) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Menambahkan class 'animate' untuk memicu efek Fade In
            board.classList.add("animate");
            observer.unobserve(board); // Hanya dijalankan sekali
          }
        });
      },
      { threshold: 0.1 }, // Berjalan ketika 10% elemen .clients-board terlihat di layar
    );

    observer.observe(board);
  }
});
