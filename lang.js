// Dynamic translation loader (external JSON files in /i18n)
const langToggle = document.getElementById('langToggle');
const htmlElement = document.documentElement;
let currentLang = 'fa';
const translationCache = {};
const DEFAULT_LANG = 'fa';

async function loadTranslations(lang) {
    if (translationCache[lang]) return translationCache[lang];
    try {
        const res = await fetch(`i18n/${lang}.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load translation file');
        const json = await res.json();
        translationCache[lang] = json;
        return json;
    } catch (e) {
        console.error(`[i18n] Error loading ${lang}:`, e);
        if (lang !== DEFAULT_LANG) {
            console.warn('[i18n] Falling back to default language');
            return loadTranslations(DEFAULT_LANG);
        }
        return {};
    }
}

function resolveKey(obj, keyPath) {
    return keyPath.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
}

async function updateLanguage(lang) {
    const translations = await loadTranslations(lang);
    currentLang = lang;
    htmlElement.setAttribute('lang', lang);
    const isEn = lang === 'en';
    htmlElement.setAttribute('dir', isEn ? 'ltr' : 'rtl');
    document.body.classList.toggle('en', isEn);
    if (langToggle) langToggle.textContent = isEn ? 'فارسی' : 'EN';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = resolveKey(translations, key);
        if (typeof value === 'string') {
            el.textContent = value;
        } else {
            // Attempt fallback if missing in current language
            if (lang !== DEFAULT_LANG) {
                const fallback = resolveKey(translationCache[DEFAULT_LANG] || {}, key);
                if (fallback) el.textContent = fallback;
            }
        }
    });
}

if (langToggle) {
    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'fa' ? 'en' : 'fa';
        updateLanguage(newLang);
    });
}

// Initial load (defer to next tick so DOM is ready for dynamically added nodes)
window.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLang);
});

// Hero carousel functionality
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Auto-advance slides every 5 seconds
setInterval(nextSlide, 5000);

// Handle indicator clicks
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        showSlide(index);
    });
});

// Bio modal functionality (enhanced with accessibility & safety checks)
(() => {
    const modal = document.getElementById('bioModal');
    const openBtn = document.getElementById('bioModalBtn');
    if (!modal || !openBtn) return;
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function openModal() {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const firstFocusable = modal.querySelector(focusableSelectors);
        firstFocusable && firstFocusable.focus();
    }

    function closeModal() {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
        openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);
    closeBtn && closeBtn.addEventListener('click', closeModal);
    backdrop && backdrop.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
        if (e.key === 'Tab' && modal.style.display === 'block') {
            // Basic focus trap
            const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => !el.hasAttribute('disabled'));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                last.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    });
})();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add animation to elements when they come into view
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('.section, .album-card, .research-card, .class-card, .event-card, .news-card').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});