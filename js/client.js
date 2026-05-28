document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".client-logo-wrapper");
  logos.forEach((logo, index) => {
    // Menghitung baris ke berapa logo ini berada (mulai dari 0)
    // Baris 1-3 masing-masing 6 logo (index 0-17)
    // Baris 4 berisi 7 logo sisanya (index 18-24)
    let rowIndex;
    if (index < 18) {
      rowIndex = Math.floor(index / 6);
    } else {
      rowIndex = 3;
    }

    // Memberikan delay berdasarkan baris
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
