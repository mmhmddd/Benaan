// دالة لتعبئة المقالات ذات الصلة بشكل ديناميكي (مثال)
function loadRelatedArticles() {
  const relatedArticlesList = document.getElementById('relatedArticlesList');
  const relatedArticles = [
    { title: 'أساسيات التدقيق اللغوي', url: '/articles/basics-proofreading.html' },
    { title: 'أدوات التدقيق الذكي', url: '/articles/ai-proofreading-tools.html' },
    { title: 'التدقيق للنصوص القانونية', url: '/articles/legal-proofreading.html' }
  ];

  relatedArticles.forEach(article => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = article.url;
    a.textContent = article.title;
    li.appendChild(a);
    relatedArticlesList.appendChild(li);
  });
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadRelatedArticles);