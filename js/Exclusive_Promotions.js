document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.coming-soon-section');
  const content = document.querySelector('.coming-soon-content');

  if (section && content) {
    section.addEventListener('mousemove', (e) => {
      // Calculate rotation based on cursor position
      const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
      
      content.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // Reset when mouse leaves the section
    section.addEventListener('mouseleave', () => {
      content.style.transform = `rotateY(0deg) rotateX(0deg)`;
      content.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });
    
    // Remove transition when mouse is moving inside to prevent delay
    section.addEventListener('mouseenter', () => {
      // Add slight delay before removing transition to ensure smooth entry
      setTimeout(() => {
        content.style.transition = 'none';
      }, 50);
    });
  }
});
