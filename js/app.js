window.router = {
    current: null,

    async init() {
        await this.navigate('map');
    },

    async navigate(viewId) {
        // Evitar re-navegar a la misma vista (salvo que se fuerce)
        if (this.current === viewId) return;
        this.current = viewId;

        const contentArea = document.getElementById('app-content');

        // Fade out rápido antes de cambiar contenido
        contentArea.style.transition = 'opacity 0.15s ease-out';
        contentArea.style.opacity = '0';

        try {
            const viewData = viewRegistry[viewId];
            const content = typeof viewData === 'function'
                ? viewData()
                : viewData ?? `<h2>Oops! Vista no encontrada</h2>`;

            // Esperamos el fade-out, luego inyectamos y hacemos fade-in
            setTimeout(() => {
                contentArea.innerHTML = content;
                window.scrollTo({ top: 0, behavior: 'instant' });
                this.updateNavUI();
                this.initViewScripts(viewId);

                contentArea.style.transition = 'opacity 0.25s ease-in';
                contentArea.style.opacity = '1';
            }, 150);

        } catch (error) {
            console.error('Error al navegar:', error);
            contentArea.innerHTML = `
                <div class="p-8 text-center bg-red-50 rounded-2xl border-2 border-red-100">
                    <span class="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                    <h3 class="font-headline font-bold text-red-900 mb-2">¡Ups! Hubo un problema</h3>
                    <p class="text-red-700 text-sm">No pudimos cargar esta sección. Por favor, intenta de nuevo.</p>
                </div>`;
            contentArea.style.opacity = '1';
        }
    },

    updateNavUI() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.getAttribute('data-view') === this.current;
            const icon = item.querySelector('.material-symbols-outlined');

            if (isActive) {
                item.classList.replace('text-zinc-400', 'text-primary');
                item.classList.add('bg-primary/5', 'rounded-xl');
                if (icon) icon.classList.add('filled');
            } else {
                item.classList.replace('text-primary', 'text-zinc-400');
                item.classList.remove('bg-primary/5', 'rounded-xl');
                if (icon) icon.classList.remove('filled');
            }
        });
    },

    initViewScripts(viewId) {
        this.enableDragToScroll();
    },

    enableDragToScroll() {
        document.querySelectorAll('.overflow-x-auto').forEach(slider => {
            // Evitar registrar listeners duplicados si ya tiene el atributo
            if (slider.dataset.dragEnabled) return;
            slider.dataset.dragEnabled = '1';

            let isDown = false;
            let startX, scrollLeft;

            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                slider.style.cursor = 'grabbing';
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
            });
            slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = ''; });
            slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = ''; });
            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - slider.offsetLeft;
                slider.scrollLeft = scrollLeft - (x - startX) * 2;
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

window.addEventListener('DOMContentLoaded', () => router.init());
