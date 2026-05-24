/* =========================================
   About Us Page Script - Odometer / Counter
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter-up");
  const speed = 100; // Semakin kecil angkanya, semakin cepat nambah angkanya

  const animateCounter = (counter) => {
    const target = +counter.getAttribute("data-target");
    // Start dari 0
    let count = 0;

    // Hitung penambahan (inkrement) setiap frame-nya
    const inc = target / speed;

    const updateCount = () => {
      count += inc;
      // Jika count belum mencapai target, terus lakukan update
      if (count < target) {
        counter.innerText = Math.ceil(count);
        requestAnimationFrame(updateCount);
      } else {
        // Jika sudah selesai, pastikan angka finalnya presisi
        counter.innerText = target;
      }
    };

    updateCount();
  };

  // Intersection Observer untuk mendeteksi kapan Card muncul di layar
  const observerOptions = {
    root: null,
    threshold: 0.5, // 50% dari elemen card harus terlihat baru animasi dimulai
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Ketika card terlihat, jalankan fungsi animateCounter
        animateCounter(entry.target);
        // Hentikan pantauan agar animasi tidak berulang saat discroll ulang
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Daftarkan semua elemen .counter-up ke dalam Observer
  counters.forEach((counter) => {
    observer.observe(counter);
  });
});
