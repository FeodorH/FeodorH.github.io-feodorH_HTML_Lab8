const STORAGE_KEY = 'feedback_form_data';
// Замените YOUR_FORM_ID на ваш реальный ID от Formcarry
const FORM_ENDPOINT = 'https://formcarry.com/s/RJBMZE4Ohuf';

const popupOverlay = document.getElementById('popupOverlay');
const feedbackForm = document.getElementById('feedbackForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');

// Валидация телефона - только цифры и разрешенные символы
function validatePhone(phone) {
    const phoneRegex = /^[0-9+\-\s\(\)]*$/;
    return phoneRegex.test(phone);
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
    
    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            body: formData // Отправляем как FormData, а не JSON
        });

        const result = await response.json();

        if (response.ok && result.code === 200) {
            showMessage('Сообщение успешно отправлено!', 'success');
            clearFormData();
            setTimeout(closeForm, 2000);
        } else {
            throw new Error(result.message || 'Ошибка отправки формы');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Ошибка при отправке формы. Попробуйте еще раз.', 'error');
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
