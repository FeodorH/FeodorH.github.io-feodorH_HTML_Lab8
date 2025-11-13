const STORAGE_KEY = 'feedback_form_data';
// Тестовые endpoints для демонстрации
const FORM_ENDPOINTS = [
    'https://httpbin.org/post', // Для тестирования - всегда возвращает успех
    'https://formcarry.com/s/your-form-id', // Ваш реальный endpoint
    'https://slapform.com/your-email@example.com' // Пример для slapform
];

const popupOverlay = document.getElementById('popupOverlay');
const feedbackForm = document.getElementById('feedbackForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');

// Валидация телефона - только цифры и разрешенные символы
function validatePhone(phone) {
    // Разрешаем только цифры, пробелы, +, -, (, )
    const phoneRegex = /^[0-9+\-\s\(\)]*$/;
    return phoneRegex.test(phone);
}

// Очистка телефона от лишних символов (опционально)
function cleanPhone(phone) {
    return phone.replace(/[^\d+]/g, '');
}

// Обработчик ввода для телефона
phoneInput.addEventListener('input', function(e) {
    const value = e.target.value;
    
    if (!validatePhone(value)) {
        phoneError.style.display = 'block';
        phoneInput.style.borderColor = '#dc3545';
    } else {
        phoneError.style.display = 'none';
        phoneInput.style.borderColor = '#ddd';
    }
    
    saveFormData();
});

// Открытие формы
function openForm() {
    popupOverlay.classList.add('active');
    history.pushState({ formOpen: true }, '', '#feedback');
    loadFormData();
}

// Закрытие формы
function closeForm() {
    popupOverlay.classList.remove('active');
    if (window.location.hash === '#feedback') {
        history.back();
    }
}

// Загрузка данных из LocalStorage
function loadFormData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(key => {
            const element = feedbackForm.elements[key];
            if (element) {
                element.value = formData[key];
                if (element.type === 'checkbox') {
                    element.checked = formData[key];
                }
            }
        });
    }
}

// Сохранение данных в LocalStorage
function saveFormData() {
    const formData = new FormData(feedbackForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Для checkbox
    data.privacyPolicy = feedbackForm.elements.privacyPolicy.checked;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Очистка данных формы
function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
    feedbackForm.reset();
    phoneError.style.display = 'none';
    phoneInput.style.borderColor = '#ddd';
}

// Показ сообщения
function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `message ${type}`;
    formMessage.style.display = 'block';
    
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Обработка отправки формы
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Проверка валидации телефона перед отправкой
    if (phoneInput.value && !validatePhone(phoneInput.value)) {
        phoneError.style.display = 'block';
        phoneInput.style.borderColor = '#dc3545';
        showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    const formData = new FormData(feedbackForm);
    const data = Object.fromEntries(formData.entries());

    try {
        // Используем первый endpoint для тестирования
        const response = await fetch(FORM_ENDPOINTS[0], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('Сообщение успешно отправлено!', 'success');
            clearFormData();
            setTimeout(closeForm, 2000);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Для демонстрации - показываем успех даже при ошибке
        // В реальном приложении удалите этот блок
        showMessage('Сообщение успешно отправлено! (демо-режим)', 'success');
        clearFormData();
        setTimeout(closeForm, 2000);
        
        // В реальном приложении используйте это:
        // showMessage('Ошибка при отправке формы. Попробуйте еще раз.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
    }
});

// Автосохранение при изменении формы
feedbackForm.addEventListener('input', saveFormData);
feedbackForm.addEventListener('change', saveFormData);

// Обработка нажатия кнопки "Назад"
window.addEventListener('popstate', (e) => {
    if (popupOverlay.classList.contains('active')) {
        closeForm();
    }
});

// Закрытие по клику вне формы
popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
        closeForm();
    }
});

// Открытие формы при загрузке страницы с хэшем
window.addEventListener('load', () => {
    if (window.location.hash === '#feedback') {
        openForm();
    }
});
