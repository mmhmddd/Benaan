document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const articleContainer = document.getElementById('articleContainer');
  const clearFilter = document.getElementById('clearFilter');
  const loader = document.getElementById('loader');
  const filterBtn = document.getElementById('filterBtn');
  const sidebar = document.getElementById('sidebar');
  const featuredArticles = document.getElementById('featuredArticles');
  const backToTop = document.getElementById('backToTop');
  let allArticles = [];

  const offcanvas = new bootstrap.Offcanvas(sidebar, { scroll: true });

  const savedCategory = localStorage.getItem('selectedCategory') || '';
  const savedSearch = localStorage.getItem('searchTerm') || '';
  if (savedCategory) categoryFilter.value = savedCategory;
  if (savedSearch) searchInput.value = savedSearch;

  function fetchArticles() {
    loader.style.display = 'block';
    fetch('/assets/data/articles/articles.json')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          renderArticles([]);
          renderFeaturedArticles([]);
          return;
        }
        allArticles = data;
        populateCategories();
 renderFeaturedArticles(allArticles.slice(0, 3));
        renderArticles(allArticles);
        filterArticles(allArticles);
        toggleFeaturedSection();
      })
      .catch(error => {
        console.error('خطأ في تحميل البيانات:', error);
        articleContainer.innerHTML = '<p class="text-center">فشل تحميل المقالات. تحقق من الاتصال بالإنترنت أو الملف.</p>';
        loader.style.display = 'none';
      })
      .finally(() => loader.style.display = 'none');
  }

  function populateCategories() {
    if (!categoryFilter) return;
    const categories = [...new Set(allArticles.map(article => article.category))];
    categoryFilter.innerHTML = '<option value="">الكل</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.toLowerCase();
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function highlightMatches(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  function renderFeaturedArticles(data) {
    if (!featuredArticles) return;
    const grid = featuredArticles.querySelector('.featured-grid');
    grid.innerHTML = '';
    if (!data || data.length === 0) {
      grid.innerHTML = '<p class="text-center">لا يوجد مقالات مميزة.</p>';
      return;
    }
    const searchTerm = '';
    data.slice(0, 3).forEach((article, index) => {
      const card = document.createElement('div');
      card.className = 'featured-card';
      card.innerHTML = `
        <div class="featured-image">
          <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" class="img-fluid" loading="lazy" draggable="false">
        </div>
        <div class="featured-details">
          <h5 class="featured-title">${highlightMatches(article.title, searchTerm)}</h5>
          <p class="featured-text">${highlightMatches(article.content || 'لا يوجد محتوى متاح', searchTerm)}</p>
          <div class="featured-buttons">
            <a href="${article.slug || '#'}" class="feature-btn btn-solutions">اقرأ المقال</a>
            <a href="#" class="feature-btn btn-quote" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">شارك المقال</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderArticles(data) {
    if (!articleContainer || !loader) return;
    articleContainer.innerHTML = '';
    loader.style.display = 'none';
    if (!data || data.length === 0) {
      articleContainer.innerHTML = '<p class="text-center">لا يوجد مقالات متطابقة.</p>';
      return;
    }
    const section = document.createElement('section');
    section.className = 'services-grid';
    const searchTerm = searchInput.value.toLowerCase().trim();
    data.forEach((article, index) => {
      const isEven = index % 2 === 0;
      const featureItem = document.createElement('div');
      featureItem.className = 'feature-item';
      featureItem.innerHTML = `
        <div class="feature-content">
          ${isEven ? `
            <div class="feature-image">
              <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" class="img-fluid" loading="lazy" draggable="false">
            </div>
            <div class="feature-details">
              <h5 class="feature-title">${highlightMatches(article.title, searchTerm)}</h5>
              <p class="feature-text">${highlightMatches(article.content || 'لا يوجد محتوى متاح', searchTerm)}</p>
              <div class="feature-buttons">
                <a href="${article.slug || '#'}" class="feature-btn btn-solutions">اقرأ المقال</a>
                <a href="#" class="feature-btn btn-quote" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">شارك المقال</a>
              </div>
            </div>
          ` : `
            <div class="feature-details">
              <h5 class="feature-title">${highlightMatches(article.title, searchTerm)}</h5>
              <p class="feature-text">${highlightMatches(article.content || 'لا يوجد محتوى متاح', searchTerm)}</p>
              <div class="feature-buttons">
                <a href="${article.slug || '#'}" class="feature-btn btn-solutions">اقرأ المقال</a>
                <a href="#" class="feature-btn btn-quote" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">شارك المقال</a>
              </div>
            </div>
            <div class="feature-image">
              <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" class="img-fluid" loading="lazy" draggable="false">
            </div>
          `}
        </div>
      `;
      section.appendChild(featureItem);
      if (index < data.length - 1) {
        const hr = document.createElement('hr');
        hr.className = 'divider';
        section.appendChild(hr);
      }
    });
    articleContainer.appendChild(section);
  }

  function filterArticles(data) {
    if (!loader) return;
    loader.style.display = 'block';
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value.toLowerCase();
    const filtered = data.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                            article.category.toLowerCase().includes(searchTerm) ||
                            (article.content && article.content.toLowerCase().includes(searchTerm));
      const matchesCategory = !selectedCategory || article.category.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    localStorage.setItem('selectedCategory', selectedCategory);
    localStorage.setItem('searchTerm', searchTerm);
    requestAnimationFrame(() => {
      renderArticles(filtered.length > 0 ? filtered : []);
      toggleFeaturedSection();
      loader.style.display = 'none';
    });
  }

  function toggleFeaturedSection() {
    if (featuredArticles) featuredArticles.style.display = searchInput.value.trim() ? 'none' : 'block';
  }

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) backToTop.style.display = 'block';
    else backToTop.style.display = 'none';
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.shareArticle = (title, url) => {
    if (navigator.share) {
      navigator.share({ title: title, url: url })
        .catch(error => console.error('خطأ في المشاركة:', error));
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح. انسخ الرابط: ' + url);
    }
  };

  searchInput.addEventListener('input', () => {
    filterArticles(allArticles);
    toggleFeaturedSection();
  });
  categoryFilter.addEventListener('change', () => filterArticles(allArticles));
  clearFilter.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    localStorage.removeItem('selectedCategory');
    localStorage.removeItem('searchTerm');
    filterArticles(allArticles);
    toggleFeaturedSection();
  });

  filterBtn.addEventListener('click', () => offcanvas.show());

  sidebar.addEventListener('hidden.bs.offcanvas', () => {
    document.body.style.overflow = '';
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (backdrop) backdrop.remove();
  });

  fetchArticles();
});