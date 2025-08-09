document.addEventListener('DOMContentLoaded', () => {
  const languages = document.querySelectorAll('.language');
  const flagMap = {
    'sa': '/assets/images/services/language-flag/arabicflag.jpg',
    'gb': '/assets/images/services/language-flag/english-flag.jpg',
    'fr': '/assets/images/services/language-flag/franceflag.jpg',
    'de': '/assets/images/services/language-flag/germanyflag.jpg',
    'es': '/assets/images/services/language-flag/spanishflaf.jpg',
    'it': '/assets/images/services/language-flag/italian.jpg',
    'ru': '/assets/images/services/language-flag/russia.jpg',
    'cn': '/assets/images/services/language-flag/chiness.jpg',
    'jp': '/assets/images/services/language-flag/japan.jpg',
    'kr': '/assets/images/services/language-flag/koria.jpg',
    'tr': '/assets/images/services/language-flag/turkey.jpg',
    'ir': '/assets/images/services/language-flag/farsya.jpg'
  };

  languages.forEach(language => {
    const flagCode = language.getAttribute('data-flag');
    const overlay = document.createElement('div');
    overlay.classList.add('language-overlay');
    const flagImg = document.createElement('img');
    flagImg.src = flagMap[flagCode] || '/assets/flags/default.png';
    overlay.appendChild(flagImg);
    language.appendChild(overlay);
  });
});