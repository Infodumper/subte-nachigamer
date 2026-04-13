const viewRegistry = {
    // Estas funciones serán llamadas por app.js para obtener el HTML final
    map: () => {
        let statusHtml = '';
        subteData.lines.forEach(line => {
            const hasClosure = subteData.stations[line.id].some(s => s.closed);
            statusHtml += `
                <div class="flex items-center gap-3 shrink-0">
                    <span class="w-4 h-4 rounded-full ${line.colorClass} ring-4 ring-offset-2 ring-transparent"></span>
                    <div class="flex flex-col">
                        <span class="font-headline font-black text-[10px] uppercase tracking-widest text-zinc-600">${line.name}</span>
                        <span class="text-[9px] font-bold ${hasClosure ? 'text-orange-600' : 'text-emerald-500'}">
                            ${hasClosure ? 'Estaciones Cerradas' : 'Servicio Normal'}
                        </span>
                    </div>
                </div>`;
        });

        return `
        <section class="space-y-6">
            <header class="mb-6">
                <h2 class="text-3xl font-black font-headline tracking-tighter italic">¡Hola, Nachi! 👋</h2>
                <p class="text-zinc-500 font-medium font-body">¿Vemos cómo están los subtes?</p>
            </header>

            <!-- Status Ticker -->
            <div class="w-full bg-zinc-50 rounded-2xl overflow-hidden py-4 border border-zinc-100 shadow-sm">
                <div class="flex items-center gap-8 px-6 overflow-x-auto hide-scrollbar whitespace-nowrap">
                    ${statusHtml}
                </div>
            </div>

            <div class="relative overflow-hidden rounded-[2.5rem] bg-zinc-200 aspect-video shadow-xl border-4 border-white group cursor-zoom-in" onclick="router.openModal('https://emova.com.ar/wp-content/uploads/2025/06/mapa-esquematico-emova-web-2025.jpg')">
                <img src="https://emova.com.ar/wp-content/uploads/2025/06/mapa-esquematico-emova-web-2025.jpg" class="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-[2s]" alt="Mapa Oficial Subte">
                <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 italic text-zinc-500 text-sm font-medium">
                     <p>Nachi, acordate que el <b>Subte</b> es el transporte más rápido debajo de la ciudad. 🚇✨</p>
                </div>
                <button onclick="router.navigate('lines')" class="w-full py-5 bg-primary text-white font-headline font-black rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <span class="material-symbols-outlined">subway</span>
                    VER TODAS LAS LÍNEAS
                </button>
            </div>
        </section>`;
    },

    lines: () => {
        if (!window.reverseLine) {
            window.reversedLinesState = {};
            window.expandedLinesState = {};
            
            window.reverseLine = function(lineId) {
                window.reversedLinesState[lineId] = !window.reversedLinesState[lineId];
                document.getElementById('app-content').innerHTML = viewRegistry.lines();
            };
            
            window.toggleLineExpand = function(lineId) {
                const wasExpanded = window.expandedLinesState[lineId];
                window.expandedLinesState = {}; // Achicar todas
                if (!wasExpanded) {
                    window.expandedLinesState[lineId] = true; // Agrandar solo la solicitada
                    
                    // Si es la Línea E, mostrar el saludo especial
                    if (lineId === 'E') {
                        if (typeof greeting !== 'undefined') {
                            setTimeout(() => greeting.show('lineE'), 100);
                        }
                    }
                }
                document.getElementById('app-content').innerHTML = viewRegistry.lines();
            };
        }
        let linesHtml = '';
        subteData.lines.forEach(line => {
            const stationsRaw = subteData.stations[line.id];
            const closedTotal = stationsRaw.filter(s => s.closed).length;
            
            const isRev = window.reversedLinesState[line.id];
            const isExpanded = window.expandedLinesState[line.id];
            
            const displayFrom = isRev ? line.to : line.from;
            const displayTo = isRev ? line.from : line.to;
            const stations = isRev ? [...stationsRaw].reverse() : stationsRaw;
            
            linesHtml += `
            <div class="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden mb-6 group transition-all duration-300 hover:shadow-md ${isExpanded ? 'md:col-span-2 shadow-xl ring-4 ring-primary/10' : ''}">
                <div class="${line.colorClass} p-6 text-white relative pr-24 cursor-pointer hover:brightness-110 transition-all select-none" onclick="window.toggleLineExpand('${line.id}')">
                    <h3 class="font-headline font-black text-3xl mb-2">${line.name}</h3>
                    <p class="text-white/90 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-1"><span class="w-1.5 h-1.5 rounded-full bg-white/60"></span> ${displayFrom}</p>
                    <p class="text-white/90 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-white/60"></span> ${displayTo}</p>
                    
                    <div class="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div class="text-6xl opacity-20 font-black">${line.id}</div>
                        <button onclick="event.stopPropagation(); window.reverseLine('${line.id}')" class="w-10 h-10 bg-black/10 hover:bg-black/20 text-white rounded-xl flex items-center justify-center transition-all active:scale-90" title="Cambiar sentido">
                            <span class="material-symbols-outlined text-2xl">swap_vert</span>
                        </button>
                    </div>
                </div>
                <div class="p-6 bg-zinc-50/50">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">${stations.length} Estaciones${isExpanded ? ' — Modo Detallado' : ''}</span>
                        ${closedTotal > 0 ? `<span class="text-[9px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">${closedTotal} Cerradas</span>` : ''}
                    </div>
                    <div class="space-y-3 ${isExpanded ? 'max-h-[32rem]' : 'max-h-48'} transition-all duration-500 overflow-y-auto pr-3 custom-scrollbar">
                        ${stations.map((s, i) => `
                            <div class="flex flex-col py-1 ${s.closed ? 'opacity-40' : ''}">
                                <div class="flex items-center gap-3">
                                    <div class="w-2.5 h-2.5 shrink-0 rounded-full ${s.closed ? 'bg-zinc-400' : line.colorClass} shadow-sm border border-white"></div>
                                    <span class="text-sm ${s.closed ? 'line-through text-zinc-400' : 'font-bold text-zinc-700'}">${s.name}</span>
                                    ${s.combinations ? s.combinations.map(c => `<span class="text-[8px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-black shrink-0">${c}</span>`).join('') : ''}
                                </div>
                                ${isExpanded && s.info ? `
                                    <div class="ml-6 mt-1.5 text-xs text-zinc-600 font-medium italic border-l-2 border-primary/20 pl-3 py-1 bg-white rounded-r-lg shadow-sm">
                                        ${s.info}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        });

        return `
        <section class="space-y-8 pb-12">
            <header class="mb-4">
                <h2 class="text-4xl font-black font-headline tracking-tighter italic">Toda la Red</h2>
                <p class="text-zinc-500 font-medium">Estaciones y combinaciones ordenadas.</p>
            </header>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${linesHtml}
            </div>
        </section>`;
    },

    trains: () => {
        if (!window.toggleTrainExpand) {
            window.expandedTrainsState = {};
            window.toggleTrainExpand = function(trainId) {
                const wasExpanded = window.expandedTrainsState[trainId];
                window.expandedTrainsState = {}; // Cerrar todos
                if (!wasExpanded) {
                    window.expandedTrainsState[trainId] = true;
                }
                document.getElementById('app-content').innerHTML = viewRegistry.trains();
            };
        }
        let trainsHtml = '';
        subteData.trainModels.forEach(train => {
            const isExpanded = window.expandedTrainsState[train.id];
            
            trainsHtml += `
            <article class="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-zinc-100 mb-8 group cursor-pointer transition-all duration-300 hover:shadow-xl ${isExpanded ? 'ring-4 ring-primary/20' : ''}" onclick="window.toggleTrainExpand('${train.id}')">
                <div class="${isExpanded ? 'h-64' : 'h-56'} overflow-hidden relative transition-all duration-500">
                    <img src="${train.image}" alt="${train.name}" class="w-full h-full object-cover transition-transform duration-[5s] ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-5 left-6 flex gap-2">
                        ${train.lines.map(l => `<div class="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black text-xs shadow-lg backdrop-blur-md border border-white/30">${l}</div>`).join('')}
                    </div>
                </div>
                <div class="p-8 bg-zinc-50/50">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-3xl font-black font-headline tracking-tighter text-zinc-800">${train.name}</h3>
                        <span class="text-[9px] font-black uppercase text-zinc-500 border border-zinc-200 px-3 py-1 rounded-full bg-white">${train.origin}</span>
                    </div>
                    <p class="text-zinc-600 font-bold italic mb-6 text-sm leading-relaxed">${train.description}</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                            <span class="text-[9px] font-black uppercase text-zinc-400 block mb-1">Aire Acondicionado</span>
                            <span class="text-sm font-black ${train.air ? 'text-emerald-500' : 'text-zinc-400'}">${train.air ? '¡SÍ TIENE! ❄️' : 'NO TIENE'}</span>
                        </div>
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                            <span class="text-[9px] font-black uppercase text-zinc-400 block mb-1">Años</span>
                            <span class="text-sm font-black text-zinc-700">${train.year}</span>
                        </div>
                    </div>
                    
                    ${isExpanded ? `
                        <div class="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div class="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <span class="text-[9px] font-black uppercase text-primary/60 block mb-1">Velocidad Máxima</span>
                                <span class="text-sm font-black text-primary">${train.speed || '-'}</span>
                            </div>
                            <div class="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <span class="text-[9px] font-black uppercase text-primary/60 block mb-1">Capacidad Total</span>
                                <span class="text-sm font-black text-primary">${train.capacity || '-'}</span>
                            </div>
                        </div>
                        
                        ${train.blueprint ? `
                        <div class="mt-4 w-full h-48 bg-blue-900 rounded-2xl overflow-hidden border-4 border-white shadow-md animate-in fade-in zoom-in duration-700 relative group/bp cursor-zoom-in" onclick="event.stopPropagation(); router.openModal('${train.blueprint}')">
                            <span class="absolute top-2 left-3 text-[9px] text-white/50 uppercase tracking-widest font-black z-10">PLANO TÉCNICO</span>
                            <img src="${train.blueprint}" class="w-full h-full object-cover mix-blend-screen opacity-90 group-hover/bp:scale-110 transition-transform duration-700" alt="Plano de ${train.name}">
                            <div class="absolute inset-0 bg-blue-900/20 group-hover/bp:bg-transparent transition-colors"></div>
                        </div>
                        ` : ''}

                        ${train.funFact ? `
                        <div class="mt-4 bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
                            <span class="text-xs font-black uppercase text-yellow-600 tracking-widest flex items-center gap-2 mb-2"><span class="text-lg">💡</span> DATO CURIOSO</span>
                            <p class="text-sm font-bold text-yellow-900 leading-relaxed italic">"${train.funFact}"</p>
                        </div>
                        ` : ''}
                        
                        <div class="mt-6 flex justify-center border-t border-zinc-100 pt-4">
                            <span class="material-symbols-outlined text-zinc-300">expand_less</span>
                        </div>
                    ` : `
                        <div class="mt-4 flex justify-center">
                            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-primary transition-colors bg-white px-4 py-2 rounded-full border border-zinc-100 shadow-sm">
                                TOCÁ PARA SABER MÁS <span class="material-symbols-outlined text-sm">expand_more</span>
                            </span>
                        </div>
                    `}
                </div>
            </article>`;
        });

        return `
        <section class="space-y-8 pb-12">
            <header class="mb-8">
                <h2 class="text-4xl font-black font-headline tracking-tighter italic">Nuestros Trenes</h2>
                <p class="text-zinc-500 font-medium">Los modelos que circulan por las vías.</p>
            </header>
            ${trainsHtml}
        </section>`;
    },

    nachi: () => {
        // Obtenemos la línea D específicamente para Nachi
        const lineD = subteData.lines.find(l => l.id === 'D');
        const stations = subteData.stations['D'];
        
        return `
        <section class="space-y-8 pb-12">
            <div class="bg-primary p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden">
                <div class="absolute -right-6 -top-6 text-[10rem] opacity-10 transform rotate-12 transition-transform">🚆</div>
                <div class="relative z-10">
                    <h2 class="text-6xl font-black font-headline tracking-tighter mb-4 italic leading-none">¡Hola Nachi!</h2>
                    <p class="text-white/80 font-bold text-2xl leading-snug max-w-xs">Hoy vamos a pasear por la ciudad.</p>
                </div>
            </div>

            <div class="bg-white rounded-[3.5rem] p-10 shadow-xl border-8 border-primary/5">
                <div class="flex items-center gap-6 mb-10">
                    <div class="w-20 h-20 rounded-full ${lineD.colorClass} flex items-center justify-center text-white font-black text-5xl shadow-lg ring-8 ring-offset-2 ring-white">D</div>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">PANTALLA ESPECIAL</span>
                        <h3 class="text-4xl font-black font-headline text-zinc-800 tracking-tighter">Tu Subte Favorito</h3>
                    </div>
                </div>

                <div class="bg-zinc-50 p-8 rounded-[2.5rem] border-4 border-zinc-100 shadow-inner mb-8">
                    <p class="text-xl font-bold text-zinc-700 italic leading-relaxed text-center">
                        "¡Nachi! Mirá qué lindo el subte verde. Va desde <b>Catedral</b> hasta <b>Congreso de Tucumán</b>."
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="p-8 bg-[#f0f9ff] rounded-[2.5rem] border border-blue-100 text-center flex flex-col items-center gap-4">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border border-blue-50">
                             <span class="material-symbols-outlined text-primary text-4xl filled">train</span>
                        </div>
                        <span class="font-black text-primary text-2xl tracking-tighter">Trenes<br>Modernos</span>
                    </div>
                        <span class="font-black text-primary text-2xl tracking-tighter">Accesos<br>Fáciles</span>
                    </div>
                </div>

                <div class="mt-8">
                    <button onclick="router.navigate('trains')" class="w-full py-6 bg-zinc-800 text-white font-headline font-black rounded-[2.5rem] shadow-xl hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-4">
                        <span class="material-symbols-outlined text-3xl">train</span>
                        <div class="flex flex-col items-start leading-none text-left">
                            <span class="text-[10px] opacity-60 uppercase tracking-widest mb-1">Nachi, ¿querés ver...?</span>
                            <span class="text-xl leading-none">MUNDO TRENES</span>
                        </div>
                    </button>
                </div>
            </div>
            
            <div class="text-center opacity-20 py-12">
                 <p class="font-black text-primary text-xs tracking-[0.5em] uppercase">Hecho con amor para Nachi v1.5</p>
            </div>
        </section>`;
    }
};
