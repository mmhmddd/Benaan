document.addEventListener('DOMContentLoaded', () => {
  const articleContent = document.getElementById('articleContent');
  const contentColumn = articleContent.querySelector('.content-column');
  const imageColumn = articleContent.querySelector('.image-column');

  fetch('/assets/data/articles/proofreading/academic-content-proofreading.json')
    .then(response => response.json())
    .then(data => {
      let imageIndex = 0;
      const sectionHTML = data.sections.map((section, index) => {
        const sectionCard = document.createElement('div');
        sectionCard.className = 'section-card';
        sectionCard.innerHTML = `
          ${section.heading ? `<h2>${section.heading}</h2>` : ''}
          ${section.paragraphs ? section.paragraphs.map(p => `<p>${p}</p>`).join('') : ''}
          ${section.subsections ? section.subsections.map(sub => `
            <div>
              ${sub.subheading ? `<h3>${sub.subheading}</h3>` : ''}
              ${sub.paragraphs ? sub.paragraphs.map(p => `<p>${p}</p>`).join('') : ''}
              ${sub.list ? `<ul>${sub.list.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('') : ''}
        `;
        if (index < imageColumn.children.length) {
          imageColumn.children[imageIndex].innerHTML = `<img src="/assets/images/article/section${index + 1}.jpg" alt="Section ${index + 1} Image">`;
          imageIndex++;
        }
        return sectionCard.outerHTML;
      }).join('');
      contentColumn.innerHTML = sectionHTML;
    })
    .catch(error => console.error('خطأ في تحميل البيانات:', error));
});