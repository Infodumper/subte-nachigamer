
const greeting = {
    keys: {
        general: 'hideSubteNachiGreeting',
        lineE: 'hideSubteNachiLineEGreeting'
    },
    
    // Rastreo de qué saludos se han mostrado en la sesión actual
    sessionShown: {
        general: false,
        lineE: false
    },

    init() {
        if (!localStorage.getItem(this.keys.general)) {
            this.show('general');
        }
    },

    show(type) {
        if (this.sessionShown[type]) {
            console.log("El saludo", type, "ya se mostró en esta sesión.");
            return;
        }
        
        console.log("Mostrando saludo manual:", type);
        const overlay = document.getElementById('greeting-overlay');
        const video = document.getElementById('greeting-video');
        const titleEl = document.getElementById('greeting-title');
        const subtitleEl = document.getElementById('greeting-subtitle');
        const checkbox = document.getElementById('dont-show-checkbox');
        const startButton = document.getElementById('start-button');
        const hint = document.getElementById('play-hint');
        
        if (!overlay || !video) return;

        // Configurar contenido
        if (type === 'general') {
            video.querySelector('source').src = 'assets/saludo_general.mp4';
            video.querySelectorAll('source')[1].src = 'https://assets.mixkit.co/videos/preview/mixkit-subway-train-moving-in-the-tunnel-4171-large.mp4';
            titleEl.innerText = '¡Bienvenido a Subte Nachi!';
            subtitleEl.innerText = 'Explora la red de subtes como nunca antes.';
            checkbox.dataset.key = this.keys.general;
        } else if (type === 'lineE') {
            if (localStorage.getItem(this.keys.lineE)) return;
            
            video.querySelector('source').src = 'assets/linea_e.mp4';
            video.querySelectorAll('source')[1].src = 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-subway-train-moving-in-a-tunnel-4174-large.mp4';
            titleEl.innerText = '¡Estás en la Línea E!';
            subtitleEl.innerText = 'Retiro - Plaza de los Virreyes. ¡Un recorrido histórico!';
            checkbox.dataset.key = this.keys.lineE;
        }

        // Reset de UI para reproducción manual
        video.load();
        video.muted = !document.getElementById('sound-checkbox').checked;
        
        if (startButton) startButton.classList.add('hidden');
        if (hint) hint.classList.remove('hidden');
        
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        overlay.style.opacity = '1';
        
        this.sessionShown[type] = true;
    },

    playWithSound() {
        const video = document.getElementById('greeting-video');
        const hint = document.getElementById('play-hint');
        const startButton = document.getElementById('start-button');
        
        if (video) {
            video.play().then(() => {
                if (hint) hint.classList.add('hidden');
                if (startButton) {
                    startButton.classList.remove('hidden');
                    startButton.classList.add('flex');
                }
            }).catch(error => {
                console.warn("Reproducción manual bloqueada, intentando ajustes...");
                video.muted = true;
                video.play().then(() => {
                    if (hint) hint.classList.add('hidden');
                    if (startButton) {
                        startButton.classList.remove('hidden');
                        startButton.classList.add('flex');
                    }
                });
            });
        }
    },

    toggleSound(isSoundOn) {
        const video = document.getElementById('greeting-video');
        if (video) {
            video.muted = !isSoundOn;
        }
    },

    close() {
        const overlay = document.getElementById('greeting-overlay');
        const video = document.getElementById('greeting-video');
        const checkbox = document.getElementById('dont-show-checkbox');
        const startButton = document.getElementById('start-button');
        
        if (checkbox && checkbox.checked) {
            localStorage.setItem(checkbox.dataset.key, 'true');
        }

        if (overlay) {
            overlay.classList.add('opacity-0');
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex', 'opacity-0');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
                if (startButton) startButton.classList.add('hidden');
                checkbox.checked = false;
            }, 500);
        }
    }
};

window.greeting = greeting;
