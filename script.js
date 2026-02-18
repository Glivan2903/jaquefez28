// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initFallingElements();
    initCountdown();
    initCarousel();
    initRSVP();
    initScrollAnimations();
});

/* =========================================
   1. FALLING ELEMENTS (Confetti/Sparkles)
   ========================================= */
function initFallingElements() {
    const container = document.getElementById('falling-elements');
    const colors = ['#E6E6FA', '#C8A2C8', '#50C878', '#8A9A5B']; // Lavender, Lilac, Emerald, Moss
    const elementCount = 20;

    for (let i = 0; i < elementCount; i++) {
        const el = document.createElement('div');
        el.classList.add('falling-element');

        // Random properties
        const bg = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100; // 0 to 100vw
        const duration = Math.random() * 5 + 5; // 5 to 10s
        const delay = Math.random() * 5; // 0 to 5s

        el.style.backgroundColor = bg;
        el.style.left = `${left}vw`;
        el.style.animationDuration = `${duration}s`;
        el.style.animationDelay = `${delay}s`;

        container.appendChild(el);
    }
}

/* =========================================
   2. COUNTDOWN
   ========================================= */
function initCountdown() {
    // Definir data da festa: 20 de Fevereiro de 2026 às 19:00
    const targetDate = new Date(2026, 1, 20, 19, 0, 0).getTime(); // Month is 0-indexed (1 = Feb)
    const countdownEl = document.getElementById('countdown');

    function updateTimer() {
        const currentTime = new Date().getTime();
        const diff = targetDate - currentTime;

        if (diff < 0) {
            countdownEl.innerText = "É hoje! 🎉";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        countdownEl.innerText = `${days}d ${hours}h ${minutes}m`;
    }

    setInterval(updateTimer, 1000);
    updateTimer();
}

/* =========================================
   3. CAROUSEL
   ========================================= */
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button--right');
    const prevButton = document.querySelector('.carousel-button--left');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = Array.from(dotsNav.children);

    const slideWidth = slides[0].getBoundingClientRect().width;

    // Arrange slides next to one another
    const setSlidePosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    };
    slides.forEach(setSlidePosition);

    const moveToSlide = (track, currentSlide, targetSlide) => {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    };

    const hideShowArrows = (slides, prevButton, nextButton, targetIndex) => {
        if (targetIndex === 0) {
            prevButton.classList.add('is-hidden');
            nextButton.classList.remove('is-hidden');
        } else if (targetIndex === slides.length - 1) {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.add('is-hidden');
        } else {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.remove('is-hidden');
        }
    };

    // Infinite Auto-play Logic
    let autoPlayInterval;
    const autoPlayDelay = 3000; // 3 seconds

    const startAutoPlay = () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling || slides[0]; // Loop back to first
            const currentDot = dotsNav.querySelector('.current-slide');
            const nextDot = currentDot.nextElementSibling || dots[0]; // Loop back to first
            const nextIndex = slides.findIndex(slide => slide === nextSlide);

            moveToSlide(track, currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
            // Arrows are always visible in infinite loop, or we can hide them. 
            // The previous logic hid them at ends. Let's keep them always visible for infinite feel or just update logic.
            // Simplified: enable all arrows since it loops.
            prevButton.classList.remove('is-hidden');
            nextButton.classList.remove('is-hidden');

        }, autoPlayDelay);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    // Modified Button clicks to support looping manually too
    nextButton.addEventListener('click', e => {
        stopAutoPlay(); // Pause on interaction
        const currentSlide = track.querySelector('.current-slide');
        const nextSlide = currentSlide.nextElementSibling || slides[0];
        const currentDot = dotsNav.querySelector('.current-slide');
        const nextDot = currentDot.nextElementSibling || dots[0];

        moveToSlide(track, currentSlide, nextSlide);
        updateDots(currentDot, nextDot);
        startAutoPlay(); // Resume
    });

    prevButton.addEventListener('click', e => {
        stopAutoPlay(); // Pause on interaction
        const currentSlide = track.querySelector('.current-slide');
        const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1];
        const currentDot = dotsNav.querySelector('.current-slide');
        const prevDot = currentDot.previousElementSibling || dots[dots.length - 1];

        moveToSlide(track, currentSlide, prevSlide);
        updateDots(currentDot, prevDot);
        startAutoPlay(); // Resume
    });

    // Dot clicks
    dotsNav.addEventListener('click', e => {
        stopAutoPlay();
        const targetDot = e.target.closest('button');
        if (!targetDot) return;

        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        const targetSlide = slides[targetIndex];

        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
        startAutoPlay();
    });

    // Swipe Support (Touch)
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    });

    function handleSwipe() {
        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');

        // Swipe Left (Next)
        if (touchStartX - touchEndX > 50) {
            const nextSlide = currentSlide.nextElementSibling || slides[0];
            const nextDot = currentDot.nextElementSibling || dots[0];
            moveToSlide(track, currentSlide, nextSlide);
            updateDots(currentDot, nextDot);
        }

        // Swipe Right (Prev)
        if (touchEndX - touchStartX > 50) {
            const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1];
            const prevDot = currentDot.previousElementSibling || dots[dots.length - 1];
            moveToSlide(track, currentSlide, prevSlide);
            updateDots(currentDot, prevDot);
        }
    }

    // Resize fix
    window.addEventListener('resize', () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });
        const currentSlide = track.querySelector('.current-slide');
        track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
    });

    // Start AutoPlay
    startAutoPlay();

    // Ensure arrows are visible initially if we are looping
    prevButton.classList.remove('is-hidden');
    nextButton.classList.remove('is-hidden');
}

/* =========================================
   4. RSVP & WHATSAPP
   ========================================= */
function initRSVP() {
    const nameInput = document.getElementById('guest-name');
    const btnConfirm = document.getElementById('btn-confirm');
    const btnDecline = document.getElementById('btn-decline');

    const webhookUrl = 'https://n8n.jetsalesbrasil.com/webhook/4ecf88fc-873b-4615-9f6b-f0e9c29c8327';

    // Helper to send to Webhook
    const sendToWebhook = (isConfirm) => {
        const name = nameInput.value.trim();

        if (!name) {
            alert('Por favor, digite seu nome antes de confirmar!');
            nameInput.focus();
            return;
        }

        let confirmationText = isConfirm ? 'SIM' : 'NÃO';
        let message = '';

        if (isConfirm) {
            message = `Olá! Meu nome é ${name} e confirmo minha presença na festa da Jaque! 🎉`;
        } else {
            message = `Olá! Meu nome é ${name}, infelizmente não poderei comparecer à festa da Jaque. 😢`;
        }

        // Disable buttons to prevent double submission
        btnConfirm.disabled = true;
        btnDecline.disabled = true;
        const originalConfirmText = btnConfirm.innerText;
        const originalDeclineText = btnDecline.innerText;

        if (isConfirm) {
            btnConfirm.innerText = 'Enviando...';
        } else {
            btnDecline.innerText = 'Enviando...';
        }

        const payload = {
            "Nome": name,
            "confirmação": confirmationText,
            "Mensagem": message
        };

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (response.ok) {
                    // Redirect to confirmation page
                    window.location.href = 'confirmacao.html';
                } else {
                    alert('Ocorreu um erro ao enviar sua resposta. Por favor, tente novamente.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocorreu um erro ao conectar com o servidor. Por favor, tente novamente.');
            })
            .finally(() => {
                // Re-enable buttons
                btnConfirm.disabled = false;
                btnDecline.disabled = false;
                btnConfirm.innerText = originalConfirmText;
                btnDecline.innerText = originalDeclineText;
            });
    };

    btnConfirm.addEventListener('click', () => sendToWebhook(true));
    btnDecline.addEventListener('click', () => sendToWebhook(false));
}

/* =========================================
   5. SCROLL REVEAL ANIMATIONS
   ========================================= */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));
}
