document.addEventListener('DOMContentLoaded', function () {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('#navbarNav');

  // Toggle navbar collapse on toggler click
  navbarToggler.addEventListener('click', function () {
    navbarCollapse.classList.toggle('show');
  });

  // Close navbar collapse and dropdowns when clicking anywhere on the document
  document.addEventListener('click', function (event) {
    const isClickInsideNavbar = event.target.closest('.navbar');
    const isClickOnToggler = event.target.closest('.navbar-toggler');
    const isClickOnNavLink = event.target.closest('.nav-link') || event.target.closest('.dropdown-item');

    if (!isClickInsideNavbar || isClickOnNavLink) {
      // Close navbar collapse if clicking outside or on a nav link
      navbarCollapse.classList.remove('show');
    }

    // If clicking the toggler, prevent closing immediately (handled by toggle above)
    if (isClickOnToggler) {
      return;
    }
  });
});



document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.querySelector('.navbar');
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('#navbarNav');

  // Toggle navbar collapse on toggler click
  navbarToggler.addEventListener('click', function () {
    navbarCollapse.classList.toggle('show');
  });

  // Close navbar collapse and dropdowns when clicking anywhere on the document
  document.addEventListener('click', function (event) {
    const isClickInsideNavbar = event.target.closest('.navbar');
    const isClickOnToggler = event.target.closest('.navbar-toggler');
    const isClickOnNavLink = event.target.closest('.nav-link') || event.target.closest('.dropdown-item');

    if (!isClickInsideNavbar || isClickOnNavLink) {
      navbarCollapse.classList.remove('show');
    }

    if (isClickOnToggler) {
      return;
    }
  });

  // Add scrolled class when scrolling down
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});