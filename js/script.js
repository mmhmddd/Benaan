document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for testimonial section
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const section = document.querySelector('.testimonial-section');
  if (section) observer.observe(section);

  // Slider functionality
  const slider = document.getElementById('testimonialsSlider');
  const cards = Array.from(slider.querySelectorAll('.testimonial-card'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;
  const totalCards = cards.length;

  function updateSlider() {
    cards.forEach((card, index) => {
      card.classList.remove('center', 'side');
      card.style.display = 'block';

      if (window.innerWidth > 768) {
        // Desktop behavior
        const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
        const nextIndex = (currentIndex + 1) % totalCards;

        if (index === currentIndex) {
          card.classList.add('center');
        } else if (index === prevIndex || index === nextIndex) {
          card.classList.add('side');
        } else {
          card.style.display = 'none';
        }
      } else {
        // Mobile behavior
        card.style.display = index === currentIndex ? 'block' : 'none';
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    // Ensure arrows remain fixed
    prevBtn.style.left = window.innerWidth > 768 ? '-60px' : '10px';
    nextBtn.style.right = window.innerWidth > 768 ? '-60px' : '10px';
  }

  // Navigation button events
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateSlider();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalCards;
    updateSlider();
  });

  // Dot navigation
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.dataset.index);
      updateSlider();
    });
  });

  // Touch support for mobile (disabled on small screens for simplicity)
  let touchStartX = 0;
  let touchEndX = 0;

  if (window.innerWidth > 768) {
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        currentIndex = (currentIndex + 1) % totalCards;
        updateSlider();
      } else if (touchEndX - touchStartX > 50) {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateSlider();
      }
    });
  }

  // Initialize slider
  updateSlider();

  // Update slider on window resize
  window.addEventListener('resize', () => {
    updateSlider();
  });
});



document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for fade-in effect
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const sections = document.querySelectorAll('.fade-in');
  sections.forEach(section => observer.observe(section));

  // Typewriter effect with erasing and cycling
  const heroTitle = document.querySelector('.hero-title');
  const texts = [
    "حلول متكاملة لجميع<br>خدمات الأعمال",
    "استكشف خدماتنا الآن<br> وتواصل معنا"
  ];
  let index = 0;
  let charIndex = 0;
  let isErasing = false;
  let isTyping = true;

  function typeWriter() {
    const currentText = texts[index].split('').join(''); // Handle <br> as plain text for now
    const cursor = '<span class="cursor">|</span>';

    if (isTyping) {
      if (charIndex <= currentText.length) {
        heroTitle.innerHTML = currentText.substring(0, charIndex) + cursor;
        charIndex++;
        setTimeout(typeWriter, 100); // Typing speed
      } else {
        setTimeout(() => {
          isTyping = false;
          isErasing = true;
          typeWriter();
        }, 2000); // Pause before erasing
      }
    } else if (isErasing) {
      if (charIndex >= 0) {
        heroTitle.innerHTML = currentText.substring(0, charIndex) + cursor;
        charIndex--;
        setTimeout(typeWriter, 50); // Erasing speed
      } else {
        isErasing = false;
        index = (index + 1) % texts.length; // Switch to next text
        charIndex = 0;
        isTyping = true;
        setTimeout(typeWriter, 500); // Pause before next typing
      }
    }
  }

  typeWriter();
});


  document.addEventListener('DOMContentLoaded', () => {
    // منع النقر الأيمن على الصور
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // منع القائمة السياقية
        alert('عذرًا، لا يمكن تحميل الصور مباشرة. تواصل معنا للحصول على المحتوى!'); // تنبيه اختياري
      });
    });

    // منع النقر الأيمن على الصفحة بأكملها (اختياري)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  });
