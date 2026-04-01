window.router = {
    current: 'map',

    async init() {
        // Cargar la vista inicial
        await this.navigate('map');
    },

    async navigate(viewId) {
        const contentArea = document.getElementById('app-content');
        this.current = viewId;

        // Mostrar cargando
        contentArea.innerHTML = `
            <div class="flex items-center justify-center h-64 animate-pulse">
                <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>`;

        try {
            // Obtener el contenido del registro. Si es función, ejecutarla.
            let content = '';
            const viewData = viewRegistry[viewId];
            
            if (typeof viewData === 'function') {
                content = viewData();
            } else {
                content = viewData || `<h2>Oops! Vista no encontrada</h2>`;
            }
            
            // Inyectar el contenido con una pequeña transición
            contentArea.style.opacity = '0';
            contentArea.innerHTML = content;
            this.updateNavUI();
            
            // Animación de entrada
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                contentArea.style.transition = 'opacity 0.3s ease-in-out';
                contentArea.style.opacity = '1';
                
                // Ejecutar scripts específicos de la vista si los hay
                this.initViewScripts(viewId);
            }, 50);

        } catch (error) {
            console.error('Error al navegar:', error);
            contentArea.innerHTML = `
                <div class="p-8 text-center bg-red-50 rounded-2xl border-2 border-red-100">
                    <span class="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                    <h3 class="font-headline font-bold text-red-900 mb-2">¡Ups! Hubo un problema</h3>
                    <p class="text-red-700 text-sm">No pudimos cargar esta sección. Por favor, intenta de nuevo.</p>
                </div>`;
        }
    },

    async loadView(viewId) {
        // Por ahora, usamos el registro global de views.js para evitar problemas de CORS localmente.
        return typeof viewRegistry !== 'undefined' ? viewRegistry[viewId] : `<h2>Error: Registro de vistas no cargado</h2>`;
    },

    updateNavUI() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.getAttribute('data-view') === this.current;
            const icon = item.querySelector('.material-symbols-outlined');
            
            if (isActive) {
                item.classList.remove('text-zinc-400');
                item.classList.add('text-primary');
                // Quitar fondo a todos y poner al activo
                document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('bg-primary/5', 'rounded-xl'));
                item.classList.add('bg-primary/5', 'rounded-xl');
                if (icon) icon.classList.add('filled');
            } else {
                item.classList.remove('text-primary', 'bg-primary/5', 'rounded-xl');
                item.classList.add('text-zinc-400');
                if (icon) icon.classList.remove('filled');
            }
        });
    },

    initViewScripts(viewId) {
        // Lógica específica para cada vista (ej: mapas, sliders, etc.)
        this.enableDragToScroll();
        if (viewId === 'map') {
            console.log('Mapa iniciado');
        }
    },

    enableDragToScroll() {
        const sliders = document.querySelectorAll('.overflow-x-auto');
        let isDown = false;
        let startX;
        let scrollLeft;

        sliders.forEach(slider => {
            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                slider.style.cursor = 'grabbing';
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
            });
            slider.addEventListener('mouseleave', () => {
                isDown = false;
                slider.style.cursor = '';
            });
            slider.addEventListener('mouseup', () => {
                isDown = false;
                slider.style.cursor = '';
            });
            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - slider.offsetLeft;
                const walk = (x - startX) * 2;
                slider.scrollLeft = scrollLeft - walk;
            });
        });
    },

    openModal(imgSrc) {
        const modal = document.getElementById('modal-overlay');
        const modalImg = document.getElementById('modal-img');
        if (modal && modalImg) {
            modalImg.src = imgSrc;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }
};

// Iniciar app al cargar
window.addEventListener('DOMContentLoaded', () => router.init());
