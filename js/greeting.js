
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
        
        console.log("Intentando mostrar saludo tipo:", type);
        const overlay = document.getElementById('greeting-overlay');
        const video = document.getElementById('greeting-video');
        const titleEl = document.getElementById('greeting-title');
        const subtitleEl = document.getElementById('greeting-subtitle');
        const checkbox = document.getElementById('dont-show-checkbox');
        
        if (!overlay || !video) {
            console.error("No se encontró el overlay o el video");
            return;
        }

        // Configurar contenido
        if (type === 'general') {
            video.querySelector('source').src = 'assets/saludo_general.mp4';
            video.querySelectorAll('source')[1].src = 'https://assets.mixkit.co/videos/preview/mixkit-subway-train-moving-in-the-tunnel-4171-large.mp4';
            titleEl.innerText = '¡Bienvenido a Subte Nachi!';
            subtitleEl.innerText = 'Explora la red de subtes como nunca antes.';
            checkbox.dataset.key = this.keys.general;
        } else if (type === 'lineE') {
            if (localStorage.getItem(this.keys.lineE)) {
                console.log("El saludo de la Línea E ya fue ocultado por el usuario anteriormente.");
                return;
            }
            
            video.querySelector('source').src = 'assets/linea_e.mp4';
            video.querySelectorAll('source')[1].src = 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-subway-train-moving-in-a-tunnel-4174-large.mp4';
            titleEl.innerText = '¡Estás en la Línea E!';
            subtitleEl.innerText = 'Retiro - Plaza de los Virreyes. ¡Un recorrido histórico!';
            checkbox.dataset.key = this.keys.lineE;
        }

        // Forzar recarga del vídeo
        video.load();
        
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        overlay.style.opacity = '1';
        document.getElementById('play-hint').classList.remove('hidden');
        
        // Marcar como mostrado en esta sesión
        this.sessionShown[type] = true;
        
        this.toggleSound(document.getElementById('sound-checkbox').checked);
    },

    playWithSound() {
        const video = document.getElementById('greeting-video');
        const hint = document.getElementById('play-hint');
        
        if (video) {
            video.play().then(() => {
                if (hint) hint.classList.add('hidden');
            }).catch(error => {
                console.warn("Autoplay con sonido bloqueado, intentando en silencio...");
                video.muted = true;
                video.play();
                if (hint) hint.classList.add('hidden');
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
        
        if (checkbox && checkbox.checked) {
            localStorage.setItem(checkbox.dataset.key, 'true');
            console.log("Preferencia guardada para:", checkbox.dataset.key);
        }

        if (overlay) {
            overlay.classList.add('opacity-0');
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex', 'opacity-0');
                if (video) video.pause();
                checkbox.checked = false;
            }, 500);
        }
    }
};

window.greeting = greeting;
