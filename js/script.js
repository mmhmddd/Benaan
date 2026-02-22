document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.querySelector('.navbar');

  // Wait for navbar to be injected via fetch (since navbar is loaded asynchronously)
  function initNavbar() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('#navbarNav');

    if (!navbarToggler || !navbarCollapse) {
      // Navbar not loaded yet, retry after 100ms
      setTimeout(initNavbar, 100);
      return;
    }

    // Toggle navbar collapse on toggler click
    navbarToggler.addEventListener('click', function (e) {
      e.stopPropagation(); // Prevent document click from firing immediately and closing menu
      navbarCollapse.classList.toggle('show');
      const isExpanded = navbarCollapse.classList.contains('show');
      navbarToggler.setAttribute('aria-expanded', isExpanded);
    });

    // Close navbar when clicking outside the navbar
    document.addEventListener('click', function (event) {
      const isClickInsideNavbar = event.target.closest('.navbar');
      if (!isClickInsideNavbar) {
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
      }
    });

    // Close navbar when clicking a nav link (not dropdown toggle) or dropdown item
    navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item').forEach(function (link) {
      link.addEventListener('click', function () {
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
      });
    });

    // Add scrolled class when scrolling down
    window.addEventListener('scroll', function () {
      if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else if (navbar) {
        navbar.classList.remove('scrolled');
      }
    });
  }

  initNavbar();
});


// =============================================
// Intersection Observer for fade-in effect
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const sections = document.querySelectorAll('.fade-in');
  sections.forEach(section => fadeObserver.observe(section));
});


// =============================================
// Testimonials Slider
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for testimonial section
  const testimonialObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          testimonialObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const testimonialSection = document.querySelector('.testimonial-section');
  if (testimonialSection) testimonialObserver.observe(testimonialSection);

  const slider = document.getElementById('testimonialsSlider');
  if (!slider) return;

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
        // Desktop: show center + two side cards
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
        // Mobile: show only current card
        card.style.display = index === currentIndex ? 'block' : 'none';
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    if (prevBtn && nextBtn) {
      prevBtn.style.left = window.innerWidth > 768 ? '-60px' : '10px';
      nextBtn.style.right = window.innerWidth > 768 ? '-60px' : '10px';
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      updateSlider();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalCards;
      updateSlider();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.dataset.index);
      updateSlider();
    });
  });

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;

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

  // Initialize slider
  updateSlider();

  // Update slider on window resize
  window.addEventListener('resize', () => {
    updateSlider();
  });
});


// =============================================
// Typewriter Effect
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  const texts = [
    "بنان | خدمات احترافية لدعم الأعمال واتخاذ القرار",
  ];

  let index = 0;
  let charIndex = 0;
  let isErasing = false;
  let isTyping = true;

  function typeWriter() {
    const currentText = texts[index];
    const cursor = '<span class="cursor">|</span>';

    if (isTyping) {
      if (charIndex <= currentText.length) {
        heroTitle.innerHTML = currentText.substring(0, charIndex) + cursor;
        charIndex++;
        setTimeout(typeWriter, 100);
      } else {
        setTimeout(() => {
          isTyping = false;
          isErasing = true;
          typeWriter();
        }, 2000);
      }
    } else if (isErasing) {
      if (charIndex >= 0) {
        heroTitle.innerHTML = currentText.substring(0, charIndex) + cursor;
        charIndex--;
        setTimeout(typeWriter, 50);
      } else {
        isErasing = false;
        index = (index + 1) % texts.length;
        charIndex = 0;
        isTyping = true;
        setTimeout(typeWriter, 500);
      }
    }
  }

  typeWriter();
});


// =============================================
// Prevent Right-Click on Images
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  });

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
});