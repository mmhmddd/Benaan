(function() {
  'use strict';
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-status');
  const whatsappNumber = '+201153480793'; // تصحيح التنسيق (بدون + في النهاية)

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    event.stopPropagation();

    // إزالة أي تعليقات أخطاء سابقة
    clearFeedback();

    if (!validateForm()) {
      form.classList.add('was-validated');
      return;
    }

    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const service = formData.get('service');
    const message = formData.get('message').trim();

    // إعداد النص الذي سيُرسل إلى WhatsApp
    const whatsappMessage = `
      الاسم: ${name}
      البريد الإلكتروني: ${email}
      رقم الهاتف: ${phone}
      الخدمة المطلوبة: ${service === 'other' ? 'أخرى' : service}
      الرسالة: ${message}
    `.replace(/[\n\r]+/g, '%0A'); // تحويل الأسطر إلى تنسيق URL

    // إنشاء رابط WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // فتح نافذة WhatsApp
    window.open(whatsappUrl, '_blank');

    // إظهار رسالة نجاح
    feedback.style.display = 'block';
    feedback.className = 'mt-2 text-success';
    feedback.textContent = 'تم إعداد الرسالة، يرجى التحقق من WhatsApp!';
    form.reset();
    setTimeout(() => feedback.style.display = 'none', 5000);
    form.classList.remove('was-validated');
  });

  function validateForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const messageInput = document.getElementById('message');
    let isValid = true;

    // التحقق من الاسم
    if (!nameInput.value.trim()) {
      showError(nameInput, 'يرجى إدخال الاسم.');
    } else if (!/^[أ-يa-zA-Z\s]+$/.test(nameInput.value.trim())) {
      showError(nameInput, 'يرجى إدخال اسم صالح (حروف فقط).');
      isValid = false;
    }

    // التحقق من البريد الإلكتروني
    if (!emailInput.value.trim()) {
      showError(emailInput, 'يرجى إدخال البريد الإلكتروني.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showError(emailInput, 'يرجى إدخال بريد إلكتروني صالح.');
      isValid = false;
    }

    // التحقق من رقم الهاتف
    if (!phoneInput.value.trim()) {
      showError(phoneInput, 'يرجى إدخال رقم الهاتف.');
    } else if (!/^\+?[1-9]\d{9,14}$/.test(phoneInput.value.trim())) {
      showError(phoneInput, 'يرجى إدخال رقم هاتف صالح (مثال: +201234567890).');
      isValid = false;
    }

    // التحقق من الخدمة
    if (!serviceInput.value) {
      showError(serviceInput, 'يرجى اختيار الخدمة المطلوبة.');
      isValid = false;
    }

    // التحقق من الرسالة
    if (!messageInput.value.trim()) {
      showError(messageInput, 'يرجى إدخال الرسالة.');
    } else if (messageInput.value.trim().length < 10) {
      showError(messageInput, 'الرسالة يجب أن تحتوي على 10 أحرف على الأقل.');
      isValid = false;
    }

    return isValid;
  }

  function showError(input, message) {
    const feedback = input.nextElementSibling;
    feedback.textContent = message;
    feedback.style.display = 'block';
    input.classList.add('is-invalid');
  }

  function clearFeedback() {
    const feedbacks = form.querySelectorAll('.invalid-feedback');
    const inputs = form.querySelectorAll('input, select, textarea');
    feedbacks.forEach(fb => fb.style.display = 'none');
    inputs.forEach(input => input.classList.remove('is-invalid', 'is-valid'));
  }
})();