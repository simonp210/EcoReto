let contenidoInicio = "";
const vistasCache = new Map();
let seccionActual = "inicio";
let solicitudNavegacion = 0;
let modoVistaDemo = false;
const selectoresTelefono = new Map();
const ciudadesPorPais = new Map();
let solicitudCiudades = 0;
function esDispositivoMovil() {
    return navigator.userAgentData?.mobile === true
        || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function crearUUIDEcoReto() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, caracter => {
        const aleatorio = Math.floor(Math.random() * 16);
        return (caracter === "x" ? aleatorio : (aleatorio & 0x3) | 0x8).toString(16);
    });
}

function instalarAlertasEcoReto() {
    if (window.__ecoretoAlertasInstaladas) return;
    window.__ecoretoAlertasInstaladas = true;
    const alertaNativa = window.alert.bind(window);
    window.alert = mensaje => {
        if (!document.body) { alertaNativa(mensaje); return; }
        let dialogo = document.getElementById("alertaEcoReto");
        if (!dialogo) {
            dialogo = document.createElement("dialog");
            dialogo.id = "alertaEcoReto";
            dialogo.className = "alerta-ecoreto";
            dialogo.setAttribute("aria-labelledby", "alertaEcoRetoTitulo");
            dialogo.innerHTML = '<div class="alerta-ecoreto-contenido"><span class="alerta-ecoreto-marca" aria-hidden="true">🌱</span><h2 id="alertaEcoRetoTitulo">EcoReto</h2><p id="alertaEcoRetoMensaje"></p><button type="button" id="alertaEcoRetoAceptar">Aceptar</button></div>';
            document.body.append(dialogo);
            dialogo.querySelector("#alertaEcoRetoAceptar").addEventListener("click", () => dialogo.close());
            dialogo.addEventListener("click", evento => { if (evento.target === dialogo) dialogo.close(); });
        }
        dialogo.querySelector("#alertaEcoRetoMensaje").textContent = String(mensaje ?? "");
        if (!dialogo.open) dialogo.showModal();
        dialogo.querySelector("#alertaEcoRetoAceptar").focus();
    };
}
const CURSORES_ECORETO = [
    { id: "clasico", nombre: "Clásico", icono: "↖", puntos: 0, color: "#2f6948" },
    { id: "hoja", nombre: "Hoja", icono: "🍃", puntos: 100, color: "#42a66a" },
    { id: "flor", nombre: "Flor", icono: "🌼", puntos: 400, color: "#d59d32" },
    { id: "arbol", nombre: "Árbol", icono: "🌳", puntos: 800, color: "#397b52" },
    { id: "ecosistema", nombre: "Ecosistema", icono: "🏞️", puntos: 1000, color: "#4b91a3" },
    { id: "tierra", nombre: "Tierra", icono: "🌎", puntos: 1500, color: "#39868a" },
    { id: "heroe", nombre: "Reciclaje", icono: "♻️", puntos: 2000, color: "#4b68a8" },
    { id: "estrella", nombre: "Agua", icono: "💧", puntos: 2500, color: "#d29b27" },
    { id: "planeta", nombre: "Energía limpia", icono: "☀️", puntos: 3500, color: "#765bb0" },
    { id: "dorado", nombre: "EcoReto", icono: "🔰", puntos: 5000, color: "#bd7b22" }
];
function aplicarCursorEcoReto(id) {
    const cursor = CURSORES_ECORETO.find(opcion => opcion.id === id) || CURSORES_ECORETO[0];
    if (cursor.id === "clasico") {
        delete document.documentElement.dataset.ecoretoCursor;
        document.documentElement.style.removeProperty("--cursor-ecoreto");
        return;
    }
    document.documentElement.dataset.ecoretoCursor = cursor.id;
    // Cada recompensa tiene un dibujo a color propio, a juego con el icono
    // que aparece en su tarjeta de desbloqueo.
    const formas = {
        hoja: `<path d="M29 4C15 4 6 10 5 20c-1 7 5 12 12 10 8-2 11-12 12-26Z" fill="#55bd77" stroke="#247448" stroke-width="1.4"/><path d="M7 29 25 10" fill="none" stroke="#eaffdf" stroke-width="2" stroke-linecap="round"/><path d="M13 22c4 0 7-2 10-6" fill="none" stroke="#247448" stroke-width="1.2"/>`,
        flor: `<g stroke="#fff" stroke-width="1"><ellipse cx="18" cy="8" rx="4.5" ry="6" fill="#f6a8d0"/><ellipse cx="26" cy="14" rx="4.5" ry="6" transform="rotate(65 26 14)" fill="#d5b7ef"/><ellipse cx="23" cy="24" rx="4.5" ry="6" transform="rotate(140 23 24)" fill="#ffc5dc"/><ellipse cx="12" cy="24" rx="4.5" ry="6" transform="rotate(220 12 24)" fill="#bce9a0"/><ellipse cx="10" cy="14" rx="4.5" ry="6" transform="rotate(295 10 14)" fill="#d8c0f2"/><circle cx="18" cy="17" r="4" fill="#ffcf45"/></g><path d="M18 21v10m0-5-5-3m5 5 5-3" fill="none" stroke="#388b50" stroke-width="2" stroke-linecap="round"/>`,
        arbol: `<path d="M18 3 8 14h5L5 24h10v9h6v-9h10l-8-10h5z" fill="#65bd58" stroke="#347b3f" stroke-width="1.4"/><path d="M18 25v7" stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="14" r="2" fill="#9cdb69"/><circle cx="23" cy="19" r="2" fill="#9cdb69"/>`,
        ecosistema: `<circle cx="26" cy="8" r="5" fill="#ffd85b" stroke="#e6a82d" stroke-width="1"/><path d="m3 29 9-14 6 9 5-7 10 12z" fill="#55ad77" stroke="#2d795d" stroke-width="1.3"/><path d="M5 31c5-3 9-3 13 0s8 3 13 0" fill="none" stroke="#58b8c2" stroke-width="2.2" stroke-linecap="round"/><path d="m12 24 2-3 2 3m5 1 2-3 2 3" fill="none" stroke="#e9ffe0" stroke-width="1.3"/>`,
        tierra: `<circle cx="18" cy="18" r="14" fill="#55b9e8" stroke="#3188bc" stroke-width="1.5"/><path d="M8 10 13 8l2 3-2 3 3 2-1 4-4 1-2 5-3-2-2-7zm12-3 4 1 1 4-3 2-1 4-4-2 1-4-2-2zm2 14 4-2 4 3-2 5-4 3-3-4z" fill="#65b95c" stroke="#438b4a" stroke-width=".8"/><path d="M8 17c2 3 3 7 3 11m8-21c4 4 6 8 7 13" fill="none" stroke="#e8faff" stroke-width="1" opacity=".8"/>`,
        // Un símbolo compacto y simétrico: tres flechas claras rodean el centro.
        heroe: `<g fill="#42a66a" stroke="#247448" stroke-width=".8" stroke-linejoin="round"><path d="m16.2 3.4 3.1 0 3.1 5.4-2.2 1.3-2.4-4.2h-3.2l1.6 2.7-2.2 1.3-3.8-6.6 7.6-.1z"/><path d="m29.8 17.2 1.6 2.7-3.1 5.4-2.2-1.3 2.4-4.2-1.6-2.8-1.6 2.7-2.2-1.3 3.8-6.6 3.9 6.5z"/><path d="m9 26.4-3.2 0-3.1-5.4 2.2-1.3 2.4 4.2h3.2l-1.6-2.7 2.2-1.3 3.8 6.6-7.6.1z"/></g><circle cx="18" cy="17.5" r="3.2" fill="#e8f6df" stroke="#7db98c" stroke-width="1.1"/>`,
        estrella: `<path d="M18 3C13 10 8 16 8 22a10 10 0 0 0 20 0c0-6-5-12-10-19Z" fill="#62c9ec" stroke="#258db8" stroke-width="1.6"/><path d="M12 23c2-2 4-2 6 0s4 2 6 0" fill="none" stroke="#e8fbff" stroke-width="2" stroke-linecap="round"/><path d="M17 16h2" stroke="#e8fbff" stroke-width="2" stroke-linecap="round"/>`,
        planeta: `<circle cx="25" cy="9" r="5" fill="#ffd84d" stroke="#e4a927" stroke-width="1.3"/><path d="m25 1 0 3m0 10v3m-8-8h3m10 0h3m-13-5 2 2m8 8 2 2m0-12-2 2" stroke="#e4a927" stroke-width="1.5" stroke-linecap="round"/><path d="M4 17h25l3 14H2z" fill="#4486ad" stroke="#28627e" stroke-width="1.4"/><path d="M8 18 7 30m7-12-1 12m7-12 1 12m5-12 3 12M4 23h26m-27 4h28" stroke="#d9f4ff" stroke-width="1.2"/>`,
        dorado: `<path d="M8 34V4" stroke="#5f4932" stroke-width="2.2" stroke-linecap="round"/><path d="M10 6c6-3 12 3 20 0v14c-8 3-14-3-20 0z" fill="#2e8b58" stroke="#216c46" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 8c5-2 10 2 16 0v10c-6 2-11-2-16 0z" fill="#e9f5d0" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/><path d="m20 9 5 2.8v3.4L20 18l-5-2.8v-3.4z" fill="#32885b" stroke="#216b48" stroke-width=".8" stroke-linejoin="round"/><path d="m20 11 2.8 1.6v1.8L20 16l-2.8-1.6v-1.8z" fill="#f7d63f"/><path d="M6 34h5" stroke="#5f4932" stroke-width="2" stroke-linecap="round"/>`
    };
    const forma = formas[cursor.id] || `<circle cx="18" cy="18" r="13"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 36 36">${forma}</svg>`;
    const punto = cursor.id === "heroe" ? "4 4" : "18 18";
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${punto}, pointer`;
    document.documentElement.style.setProperty("--cursor-ecoreto", url);
}

async function seleccionarCursorEcoReto(id) {
    const cursor = CURSORES_ECORETO.find(opcion => opcion.id === id);
    if (!cursor) return;
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorSesion } = await obtenerUsuarioEcoReto(supabase);
        if (errorSesion || !user) throw new Error("Inicia sesión para elegir un cursor.");
        const { data: perfil, error: errorPerfil } = await supabase.from("profiles").select("puntos").eq("id", user.id).maybeSingle();
        if (errorPerfil) throw errorPerfil;
        if ((Number(perfil?.puntos) || 0) < cursor.puntos) {
            alert(`Este cursor se desbloquea al alcanzar ${cursor.puntos} puntos.`);
            return;
        }
        const { error } = await supabase.from("profiles").update({ cursor_id: cursor.id }).eq("id", user.id);
        if (error) throw error;
        aplicarCursorEcoReto(cursor.id);
        renderizarCursoresEcoReto(Number(perfil?.puntos) || 0, cursor.id);
    } catch (error) {
        console.error("No se pudo actualizar el cursor:", error);
        if (/cursor_id|schema cache|PGRST204/i.test(String(error?.message || ""))) {
            alert("Este diseño todavía no está disponible. Inténtalo de nuevo más tarde.");
            return;
        }
        alert(mensajeErrorAmigable(error, "No se pudo guardar este cursor. Inténtalo de nuevo."));
    }
}

function renderizarCursoresEcoReto(puntos, cursorSeleccionado = "clasico") {
    const seccion = document.getElementById("seccionCursoresEcoReto");
    if (!seccion) return;
    seccion.innerHTML = `<h3>Cursores de recompensa</h3><p>Desbloqueas nuevos diseños al avanzar de rango; elige cualquiera que ya tengas disponible.</p><div class="rejilla-cursores">${CURSORES_ECORETO.map(cursor => {
        const desbloqueado = puntos >= cursor.puntos;
        const seleccionado = desbloqueado && cursor.id === cursorSeleccionado;
        return `<button type="button" class="opcion-cursor ${seleccionado ? "seleccionado" : ""}" ${desbloqueado ? `aria-pressed="${seleccionado}" onclick="seleccionarCursorEcoReto('${cursor.id}')"` : "disabled"}><span class="opcion-cursor-icono" aria-hidden="true">${cursor.icono}</span><strong>${cursor.nombre}</strong><small>${desbloqueado ? (seleccionado ? "En uso" : "Desbloqueado") : `Se desbloquea con ${cursor.puntos} pts`}</small></button>`;
    }).join("")}</div><p class="nota-cursor-movil">El cursor personalizado se muestra en computadores con mouse.</p>`;
}
const sugerenciasCiudades = {
    co: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Villavicencio"],
    mx: ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Mérida", "Querétaro", "León", "Tijuana"],
    ar: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata"],
    cl: ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "Temuco", "Viña del Mar"],
    pe: ["Lima", "Arequipa", "Trujillo", "Cusco", "Chiclayo", "Piura"],
    ec: ["Quito", "Guayaquil", "Cuenca", "Ambato", "Loja", "Manta"],
    es: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao"],
    us: ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco", "Seattle"],
    br: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Curitiba", "Recife"],
    ca: ["Toronto", "Montréal", "Vancouver", "Ottawa", "Calgary", "Edmonton"]
};

function inicializarSelectoresTelefono() {
    const paisSelect = document.getElementById("institucionPais");
    const nombreLocal = new Intl.DisplayNames(["es"], { type: "region" });
    const nombreInternacional = new Intl.DisplayNames(["en"], { type: "region" });
    if (window.intlTelInput?.getAllCountries) {
        for (const input of document.querySelectorAll("[data-telefono-internacional]")) {
            const instance = window.intlTelInput(input, {
                initialCountry: "co",
                countryNameLocale: "es",
                separateDialCode: true,
                countrySearch: true,
                countrySelectorMode: window.matchMedia("(max-width: 768px)").matches ? "FULLSCREEN" : "DROPDOWN",
                dropdownParent: document.body,
                loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@29.5.3/dist/js/utils.js"),
                uiTranslations: {
                    noCountrySelected: "Selecciona el país del teléfono",
                    countryListAriaLabel: "Lista de países",
                    searchPlaceholder: "Buscar país o prefijo",
                    clearSearchAriaLabel: "Borrar búsqueda",
                    closeCountrySelectorAriaLabel: "Cerrar",
                    searchEmptyState: "No se encontraron países",
                    searchSummaryAria: count => count === 1 ? "1 país" : `${count} países`
                }
            });
            selectoresTelefono.set(input.id, instance);
        }
        if (paisSelect) {
            const paises = window.intlTelInput.getAllCountries().map(pais => ({
                iso2: pais.iso2,
                nombre: nombreLocal.of(pais.iso2.toUpperCase()) || pais.name
            })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
            paisSelect.replaceChildren(new Option("Elige un país", ""));
            for (const pais of paises) {
                const option = new Option(pais.nombre, pais.nombre);
                option.dataset.iso2 = pais.iso2;
                option.dataset.nombreApi = nombreInternacional.of(pais.iso2.toUpperCase()) || pais.nombre;
                paisSelect.add(option);
            }
    paisSelect.addEventListener("change", () => {
        const ciudad = document.getElementById("institucionCiudad");
        if (ciudad) ciudad.value = "";
        actualizarSugerenciasCiudades();
    });
        }
    } else if (paisSelect) {
        paisSelect.replaceChildren(new Option("No se pudo cargar la lista de países. Recarga la página.", ""));
        paisSelect.disabled = true;
    }
    document.getElementById("institucionPais")?.dispatchEvent(new Event("change"));
}

function actualizarSugerenciasCiudades() {
    const pais = document.getElementById("institucionPais");
    const lista = document.getElementById("ciudadesSugeridas");
    if (!pais || !lista) return;
    const iso2 = pais.selectedOptions[0]?.dataset.iso2;
    const entrada = document.getElementById("institucionCiudad");
    const solicitud = ++solicitudCiudades;
    const pintar = ciudades => {
        const consulta = entrada?.value.trim().toLocaleLowerCase();
        const filtradas = consulta
            ? ciudades.filter(ciudad => ciudad.toLocaleLowerCase().includes(consulta))
            : ciudades;
        lista.replaceChildren(...filtradas.slice(0, 80).map(ciudad => {
            const opcion = document.createElement("option");
            opcion.value = ciudad;
            return opcion;
        }));
    };
    if (!iso2) { pintar([]); return; }
    const guardadas = ciudadesPorPais.get(iso2);
    const comunes = sugerenciasCiudades[iso2] || [];
    pintar(guardadas ? [...new Set([...guardadas, ...comunes])] : comunes);
    if (guardadas) return;

    const nombrePais = pais.selectedOptions[0]?.dataset.nombreApi;
    if (!nombrePais) return;
    const consultaCiudades = fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ country: nombrePais })
    }).then(respuesta => {
        if (!respuesta.ok) throw new Error("No se pudieron consultar las ciudades");
        return respuesta.json();
    }).then(resultado => Array.isArray(resultado?.data) ? resultado.data : []).catch(() => []);
    consultaCiudades.then(resultadoCiudades => {
        if (solicitud !== solicitudCiudades || pais.selectedOptions[0]?.dataset.iso2 !== iso2) return;
        const ciudades = [...new Set(resultadoCiudades.map(ciudad => String(ciudad).trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, "es"));
        if (ciudades.length) ciudadesPorPais.set(iso2, ciudades);
        pintar([...new Set([...ciudades, ...comunes])]);
    }).catch(() => {
        // Las sugerencias conocidas y la escritura libre siguen disponibles si el servicio falla.
    });
}

document.getElementById("institucionCiudad")?.addEventListener("input", () => {
    const entrada = document.getElementById("institucionCiudad");
    const lista = document.getElementById("ciudadesSugeridas");
    const iso2 = document.getElementById("institucionPais")?.selectedOptions[0]?.dataset.iso2;
    if (!entrada || !lista || !iso2) return;
    const ciudades = [...new Set([...(ciudadesPorPais.get(iso2) || []), ...(sugerenciasCiudades[iso2] || [])])];
    const consulta = entrada.value.trim().toLocaleLowerCase();
    const filtradas = consulta ? ciudades.filter(ciudad => ciudad.toLocaleLowerCase().includes(consulta)) : ciudades;
    lista.replaceChildren(...filtradas.slice(0, 80).map(ciudad => {
        const opcion = document.createElement("option");
        opcion.value = ciudad;
        return opcion;
    }));
});

function actualizarCargoInstitucion() {
    const cargo = document.getElementById("institucionCargo");
    const otro = document.getElementById("institucionCargoOtro");
    if (!cargo || !otro) return;
    const esOtro = cargo.value === "otro";
    otro.hidden = !esOtro;
    otro.required = esOtro;
    if (!esOtro) otro.value = "";
}

async function obtenerTelefonoE164(id) {
    const input = document.getElementById(id);
    const instance = selectoresTelefono.get(id);
    if (!input?.value.trim()) throw new Error("Escribe tu número de celular.");
    if (!instance) throw new Error("No se pudo cargar el selector internacional. Recarga la página o intenta más tarde.");
    await instance.promise;
    if (!instance.isValidNumber()) throw new Error("Revisa el número: no parece válido para el país seleccionado.");
    return instance.getNumber();
}
window.addEventListener("DOMContentLoaded", () => {
    instalarAlertasEcoReto();
    inicializarSelectoresTelefono();
    document.getElementById("sugerirNombrePerfil")?.addEventListener("click", sugerirNombrePerfil);
    try { ultimoCodigoRankingAmigos = sessionStorage.getItem("ecoreto_ultimo_codigo_ranking_amigos") || ""; } catch { /* El código se puede volver a solicitar si el almacenamiento está desactivado. */ }
    contenidoInicio = document.getElementById("contenido")?.innerHTML || "";
    vistasCache.set("inicio", contenidoInicio);
    if (document.getElementById("nombre")) {
        try {
            localStorage.removeItem("ecoreto_nombre_institucion_pendiente");
        } catch { /* El autocompletado institucional es opcional. */ }
    }
    procesarRetornoOAuth();
    // Las páginas públicas de autenticación comparten este archivo, pero no
    // deben consultar tablas protegidas ni mostrar errores de sesión.
    if (!document.getElementById("seccion-inicio")) return;
    iniciarAvisoConectividad();
    inicializarAplicacion();
    document.addEventListener("click", manejarClicImagenAmpliable, true);
    document.addEventListener("keydown", evento => {
        const imagen = evento.target.closest?.("img.reto-evidencia-imagen-ampliable");
        if (imagen && (evento.key === "Enter" || evento.key === " ")) { evento.preventDefault(); abrirVisorImagen(imagen.currentSrc || imagen.src, imagen.alt || "Evidencia del reto"); }
    });
});

async function inicializarAplicacion() {
    try {
        const supabase = await obtenerCliente();
        const { data: { user: usuarioSesion }, error } = await obtenerUsuarioEcoReto(supabase);
        if (error) throw error;
        if (!usuarioSesion) {
            if (new URLSearchParams(window.location.search).get("demo") === "1") {
                iniciarVistaDemo();
                const vista = new URLSearchParams(window.location.search).get("vista");
                if (["ranking", "retos", "rangos"].includes(vista)) await mostrarSeccion(vista);
                return;
            }
            window.location.replace(rutaLogin());
            return;
        }
        await cargarUsuario();
        await procesarCodigoInstitucionPendiente();
        await Promise.all([cargarRetosInicio(), cargarActividadReciente()]);
        const vistaSolicitada = new URLSearchParams(window.location.search).get("vista");
        if (["ranking", "retos", "rangos"].includes(vistaSolicitada)) {
            await mostrarSeccion(vistaSolicitada);
            return;
        }
        try {
            if (localStorage.getItem("ecoreto_ir_a_ranking") === "1") {
                localStorage.removeItem("ecoreto_ir_a_ranking");
                await mostrarSeccion("ranking");
            }
        } catch { /* Abrir el ranking automáticamente es una ayuda opcional. */ }
    } catch (error) {
        console.error("No se pudo iniciar EcoReto:", error);
        const retos = document.getElementById("retosInicio");
        if (retos) retos.innerHTML = `<article class="retoCard verde retoCardVacio"><div class="retoIcono">⚠️</div><span>ECORETO</span><h3>No pudimos conectar</h3><p>Revisa tu conexión e inténtalo de nuevo.</p><button type="button" onclick="inicializarAplicacion()">Reintentar</button></article>`;
    }
}

function iniciarAvisoConectividad() {
    let aviso = document.getElementById("aviso-conectividad");
    let cerradoPorUsuario = false;
    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "aviso-conectividad";
        aviso.className = "aviso-conectividad";
        aviso.setAttribute("role", "status");
        aviso.setAttribute("aria-live", "polite");
        aviso.innerHTML = '<span class="aviso-conectividad-texto"></span><button type="button" class="aviso-conectividad-cerrar" aria-label="Cerrar aviso de conexión">×</button>';
        document.body.appendChild(aviso);
    }
    const textoAviso = aviso.querySelector(".aviso-conectividad-texto") || aviso;
    aviso.querySelector(".aviso-conectividad-cerrar")?.addEventListener("click", () => {
        cerradoPorUsuario = true;
        aviso.hidden = true;
    });
    const revisar = () => {
        const tipo = navigator.connection?.effectiveType;
        const enlaceLento = navigator.connection && (["slow-2g", "2g"].includes(tipo) || (Number(navigator.connection.downlink) > 0 && Number(navigator.connection.downlink) < 0.5));
        if (!navigator.onLine) {
            textoAviso.textContent = "Sin conexión a Internet. Algunas acciones pueden no guardarse.";
            aviso.hidden = cerradoPorUsuario;
            aviso.classList.add("sin-conexion");
        } else if (enlaceLento) {
            textoAviso.textContent = "La conexión está lenta. Espera a que termine cada acción antes de volver a intentarlo.";
            aviso.hidden = cerradoPorUsuario;
            aviso.classList.remove("sin-conexion");
        } else {
            aviso.hidden = true;
        }
    };
    window.addEventListener("offline", revisar);
    window.addEventListener("online", () => {
        cerradoPorUsuario = false;
        revisar();
        textoAviso.textContent = "Conexión restablecida. Ya puedes volver a intentarlo.";
        aviso.hidden = false;
        aviso.classList.remove("sin-conexion");
        setTimeout(() => { if (navigator.onLine) aviso.hidden = true; }, 5000);
    });
    navigator.connection?.addEventListener?.("change", revisar);
    revisar();
}
function manejarClicImagenAmpliable(evento) {
    const imagen = evento.target.closest?.("img.avatar-menu, img.avatar-hero, img.avatar-publicacion, img.avatar-ranking, img.imagen-post-muro, .actividad-item-icono img, img.historial-completo-imagen, img#perfilAvatarImg, img.reto-evidencia-imagen-ampliable");
    if (!imagen || imagen.hidden || !imagen.src) return;
    evento.preventDefault();
    evento.stopPropagation();
    abrirVisorImagen(imagen.currentSrc || imagen.src, imagen.alt || "Imagen de EcoReto");
}

function abrirVisorImagen(url, descripcion = "") {
    const visor = document.getElementById("visorImagen");
    const imagen = document.getElementById("visorImagenContenido");
    const texto = document.getElementById("visorImagenDescripcion");
    if (!visor || !imagen) return;
    imagen.src = url;
    imagen.alt = descripcion;
    if (texto) texto.textContent = descripcion;
    if (!visor.open) visor.showModal();
}

function cerrarVisorImagen() {
    const visor = document.getElementById("visorImagen");
    if (visor?.open) visor.close();
}

function guardarVistaActual() {
    const contenido = document.getElementById("contenido");
    if (contenido && seccionActual) vistasCache.set(seccionActual, contenido.innerHTML);
}

function invalidarVistasDeProgreso() {
    ["inicio", "publicar", "actividad", "historial", "retos", "ranking", "rangos", "perfil"].forEach(vista => vistasCache.delete(vista));
}

function mensajeErrorAmigable(error, mensajePredeterminado) {
    const detalle = String(error?.message || "");
    const idioma = String(navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en";
    const es = idioma === "es";
    if (!navigator.onLine) return es ? "No hay conexión a Internet. Revisa tu red y vuelve a intentarlo." : "You are offline. Check your connection and try again.";
    if (/failed to fetch|network request failed|load failed|networkerror|timed out|timeout|offline/i.test(detalle)) return es ? "La conexión se interrumpió o tardó demasiado. Comprueba Internet y vuelve a intentarlo." : "The connection was interrupted or took too long. Check your internet and try again.";
    if (/\b(502|503|504)\b|service unavailable|gateway timeout/i.test(detalle)) return es ? "El servicio está tardando en responder. Espera un momento y vuelve a intentarlo." : "The service is taking too long to respond. Wait a moment and try again.";
    if (/password should contain at least one character of each|password must contain.*(lowercase|uppercase|number)|password.*(lowercase|uppercase|digit)/i.test(detalle)) {
        return es
            ? "Usa una contraseña de al menos 6 caracteres que combine letras y números."
            : "Use a password with at least 6 characters, including letters and numbers.";
    }
    if (/same password|different from.*old password|new password.*current password/i.test(detalle)) {
        return es ? "Elige una contraseña distinta a la que usabas antes." : "Choose a password different from your previous one.";
    }
    const minimoPassword = detalle.match(/password.{0,30}(?:at least|minimum of)\s*(\d+)\s*characters/i);
    if (minimoPassword) return es
        ? `La contraseña debe tener al menos ${minimoPassword[1]} caracteres.`
        : `Your password must be at least ${minimoPassword[1]} characters long.`;
    if (/email not confirmed|email_not_confirmed/i.test(detalle)) return es ? "Confirma tu correo desde el enlace que te enviamos antes de iniciar sesión." : "Please confirm your email using the link we sent before signing in.";
    if (/invalid login credentials|invalid email or password/i.test(detalle)) return es ? "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo." : "The email or password is incorrect. Check them and try again.";
    if (/email address not authorized/i.test(detalle)) return es ? "No pudimos enviar el correo de confirmación. Inténtalo más tarde o usa otro método de acceso." : "We couldn't send the confirmation email. Try again later or use another sign-in method.";
    if (/phone.*(?:sign.?ups?|logins?|provider).*disabled|phone.*disabled|disabled.*phone/i.test(detalle)) return es ? "El acceso con celular aún no está disponible. Por ahora, intenta entrar con correo." : "Phone sign-in isn't available yet. Please use email for now.";
    if (/rate limit|too many requests/i.test(detalle)) return es ? "Se solicitaron demasiados intentos seguidos. Espera un momento y vuelve a intentarlo." : "There were too many attempts. Wait a moment and try again.";
    if (/recovery.*(session|link|token)|session.*missing|enlace de recuperaci[oó]n|token de recuperaci[oó]n/i.test(detalle)) return es ? "Este enlace de recuperación venció o ya se utilizó. Solicita uno nuevo desde Iniciar sesión." : "This recovery link has expired or was already used. Request a new one from Sign in.";
    if (/expired|invalid.*token|token.*invalid|refresh token.*(not found|invalid)|session.*(expired|missing)|invalid.*jwt/i.test(detalle)) return es ? "Tu sesión de acceso venció o ya no es válida. Inicia sesión de nuevo y vuelve a intentarlo." : "Your sign-in session expired or is no longer valid. Sign in again and try once more.";
    if (/file size|maximum allowed size|payload too large|entity too large|413/i.test(detalle)) return es ? "La imagen supera el límite de 5 MB. Elige otra foto o reduce su tamaño antes de volver a subirla." : "The image exceeds the 5 MB limit. Choose another photo or reduce its size before uploading again.";
    if (/image_url.*schema cache|column.*image_url/i.test(detalle)) {
        return es ? "No pudimos guardar la imagen. Inténtalo de nuevo más tarde." : "We couldn't save the image. Please try again later.";
    }
    if (/bucket.*not found|not found.*bucket/i.test(detalle)) {
        return es ? "No pudimos abrir el almacenamiento de imágenes. Inténtalo de nuevo más tarde." : "We couldn't open image storage. Please try again later.";
    }
    if (/row-level security|permission denied|not authorized/i.test(detalle)) {
        return es ? "No pudimos completar esta acción. Comprueba que iniciaste sesión e inténtalo de nuevo." : "We couldn't complete that action. Check that you're signed in and try again.";
    }
    if (/duplicate key|already exists|23505/i.test(detalle)) return es ? "Esta acción ya está registrada." : "This action has already been recorded.";
    if (error?.name && /AuthApiError|PostgrestError|StorageApiError/i.test(error.name)) {
        return es ? (mensajePredeterminado || "No pudimos completar la solicitud. Revisa los datos e inténtalo otra vez.") : "We couldn't complete that request. Check the information and try again.";
    }
    if (error?.code || error?.status) {
        return es ? (mensajePredeterminado || "No pudimos completar la solicitud. Revisa los datos e inténtalo otra vez.") : "We couldn't complete that request. Check the information and try again.";
    }
    return detalle || mensajePredeterminado;
}

async function mensajeErrorFuncionEdge(error, mensajePredeterminado) {
    try {
        const respuesta = error?.context;
        if (respuesta && typeof respuesta.clone === "function") {
            const cuerpo = await respuesta.clone().json();
            if (typeof cuerpo?.error === "string" && cuerpo.error) {
                if (/solicitud de revisi[oó]n.*no es v[aá]lida.*consentimiento|falta.*consentimiento/i.test(cuerpo.error)) {
                    return "El servicio de puntos automáticos de Supabase está desactualizado. Publica la función verificar-evidencia actualizada y vuelve a intentarlo.";
                }
                return cuerpo.error;
            }
        }
    } catch { /* Si no hay cuerpo JSON, mostramos el error traducido habitual. */ }
    if (/failed to send (a )?request to the edge function|failed to fetch|networkerror/i.test(String(error?.message || error || ""))) {
        return "No pudimos conectar con el servicio que registra tus puntos. Inténtalo de nuevo más tarde.";
    }
    return mensajeErrorAmigable(error, mensajePredeterminado);
}

let avatarUsuarioActual = "";
let idUsuarioActual = "";
let timerRetoFugaz = null;
let streamCamaraReto = null;
let idElementoRetoEnCamara = null;
let archivoPublicacionSeleccionado = null;
let idEnvioPublicacion = null;
let temporizadorNombrePerfil = null;
let revisionNombrePerfil = 0;
let competenciaRankingActual = "";
let ultimaInvitacionCreada = "";
let ultimoCodigoRankingAmigos = "";
const PALABRAS_NO_PERMITIDAS = new Set([
    "puta", "puto", "putas", "putos", "mierda", "mierdas", "joder", "jodido", "jodida", "jodidos", "jodidas",
    "cono", "carajo", "cabron", "cabrona", "cabrones", "pendejo", "pendeja", "pendejos", "pendejas", "culero", "culera",
    "mamon", "mamona", "chinga", "chingar", "verga", "vergas", "hijueputa", "malparido", "malparida", "maricon", "maricona",
    "marica", "maricas", "maricones", "zorra", "zorras", "perra", "perras", "fuck", "fucking", "shit", "bullshit", "bitch", "bitches",
    "bastard", "bastarda", "asshole", "cunt", "dickhead", "motherfucker", "nigger", "faggot", "pussy", "dick", "dicks", "idiota", "idiot",
    "imbecil", "estupido", "estupida", "tarado", "tarada", "moron"
]);
function nombreRespetuoso(nombre) {
    if (typeof nombre !== "string" || nombre.length > 60 || /<[^>]*>/.test(nombre)) return false;
    const normalizado = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        .replace(/[013457@$]/g, caracter => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" })[caracter])
        .replace(/[^a-z0-9]+/g, " ");
    return !normalizado.split(/\s+/).some(palabra => PALABRAS_NO_PERMITIDAS.has(palabra));
}
const DURACION_RETO_FUGAZ = 4 * 60 * 60 * 1000;

function obtenerVentanaRetoFugaz(retos, ahora = Date.now()) {
    if (!retos?.length) return null;
    const ordenados = [...retos].sort((a, b) => String(a.id ?? a.titulo).localeCompare(String(b.id ?? b.titulo)));
    const duraciones = ordenados.map(reto => Math.min(24, Math.max(1, Number(reto.duracion_horas) || 4)) * 60 * 60 * 1000);
    const ciclo = duraciones.reduce((total, duracion) => total + duracion, 0);
    const posicion = ahora % ciclo;
    let inicioAcumulado = 0;
    for (let i = 0; i < ordenados.length; i++) {
        const finAcumulado = inicioAcumulado + duraciones[i];
        if (posicion < finAcumulado) {
            const inicio = ahora - (posicion - inicioAcumulado);
            return { reto: ordenados[i], inicio, fin: inicio + duraciones[i] };
        }
        inicioAcumulado = finAcumulado;
    }
    return null;
}

const AVATAR_POR_DEFECTO = "assets/logo-ecoreto.jpeg?v=20261113b";

function actualizarAvatarMenu(url) {
    const imagen = document.getElementById("avatarMenuImg");
    const inicial = document.getElementById("avatarMenuInicial");
    if (!imagen || !inicial) return;
    imagen.classList.toggle("avatar-menu-logo", !url);

    if (url) {
        imagen.onerror = () => {
            imagen.onerror = null;
            imagen.hidden = true;
            inicial.hidden = false;
        };
        imagen.src = url;
        imagen.hidden = false;
        inicial.hidden = true;
    } else {
        imagen.onerror = () => {
            imagen.onerror = null;
            imagen.hidden = true;
            inicial.hidden = false;
        };
        imagen.src = AVATAR_POR_DEFECTO;
        imagen.hidden = false;
        inicial.hidden = true;
    }

    const imagenHero = document.getElementById("avatarHeroImg");
    const broteHero = document.getElementById("avatarHeroInicial");
    if (imagenHero && broteHero) {
        if (url) {
            imagenHero.onerror = () => {
                imagenHero.onerror = null;
                imagenHero.hidden = true;
                broteHero.hidden = false;
            };
            imagenHero.src = url;
            imagenHero.hidden = false;
            broteHero.hidden = true;
        } else {
            imagenHero.removeAttribute("src");
            imagenHero.hidden = true;
            broteHero.hidden = false;
        }
    }
}

function actualizarImagenPerfil(url) {
    const imagen = document.getElementById("perfilAvatarImg");
    const emoji = document.getElementById("perfilAvatarEmoji");
    if (!imagen) return;
    if (!url) {
        imagen.hidden = true;
        imagen.removeAttribute("src");
        if (emoji) emoji.hidden = false;
        return;
    }
    imagen.onerror = () => {
        imagen.onerror = null;
        imagen.hidden = true;
        if (emoji) emoji.hidden = false;
    };
    imagen.src = url;
    imagen.hidden = false;
    if (emoji) emoji.hidden = true;
}

function normalizarTipoReto(valor) {
    const tipo = String(valor || "").trim().toLowerCase();
    return ({
        daily: "diario", day: "diario", diario: "diario",
        weekly: "semanal", week: "semanal", semanal: "semanal",
        flash: "fugaz", fugaz: "fugaz"
    })[tipo] || tipo;
}

async function resolverImagenPublicacion(supabase, referencia) {
    if (!referencia) return "";
    // URLs antiguas en el bucket público siguen funcionando; los archivos nuevos
    // usan rutas privadas y solo reciben un enlace temporal para el dueño.
    if (/^https?:\/\//i.test(referencia)) return referencia;
    const { data, error } = await supabase.storage
        .from("post-images")
        .createSignedUrl(referencia, 60 * 60);
    if (error) throw error;
    return data?.signedUrl || "";
}

function actualizarVistaInicio(selector, html) {
    const plantilla = document.createElement("template");
    plantilla.innerHTML = vistasCache.get("inicio") || contenidoInicio;
    const destino = plantilla.content.querySelector(selector);
    if (!destino) return;
    destino.innerHTML = html;
    contenidoInicio = plantilla.innerHTML;
    vistasCache.set("inicio", contenidoInicio);
    if (seccionActual === "inicio") {
        const actual = document.querySelector(selector);
        if (actual) actual.innerHTML = html;
    }
}

async function cargarRetosInicio() {
    try {
        const supabase = await obtenerCliente();
        const { data, error } = await supabase.from("retos").select("id,titulo,descripcion,puntos,icono,tipo,duracion_horas");
        if (error) throw error;

        const tipos = [
            { tipo: "semanal", clase: "azul", etiqueta: "RETO DE LA SEMANA", icono: "📅" },
            { tipo: "diario", clase: "verde", etiqueta: "RETO DE HOY", icono: "🌱" },
            { tipo: "fugaz", clase: "naranja", etiqueta: "RETO FUGAZ", icono: "⚡" }
        ];
        const ventanaFugaz = obtenerVentanaRetoFugaz((data || []).filter(reto => normalizarTipoReto(reto.tipo) === "fugaz"));
        const cards = tipos.map(config => {
            const disponibles = (data || []).filter(reto => normalizarTipoReto(reto.tipo) === config.tipo);
            const indice = config.tipo === "diario"
                ? Math.floor(Date.now() / 86400000) % Math.max(disponibles.length, 1)
                : config.tipo === "fugaz"
                    ? 0
                    : Math.floor(Date.now() / 604800000) % Math.max(disponibles.length, 1);
            const reto = config.tipo === "fugaz" ? ventanaFugaz?.reto : disponibles[indice];
            if (!reto) return `<article class="retoCard ${config.clase} retoCardVacio"><div class="retoIcono">${config.icono}</div><span>${config.etiqueta}</span><h3>Próximamente</h3><p>Estamos preparando este reto.</p></article>`;
            const etiqueta = config.tipo === "fugaz" ? `RETO FUGAZ · ${Number(reto.duracion_horas) || 4} h` : config.etiqueta;
            return `<article class="retoCard ${config.clase}"><div class="retoIcono">${escaparHTML(reto.icono || config.icono)}</div><span>${etiqueta}</span><h3>${escaparHTML(reto.titulo)}</h3><p>${escaparHTML(reto.descripcion)}</p><div class="retoAbajo"><b>+${Number(reto.puntos) || 0} ⭐</b><button type="button" aria-label="Abrir retos" onclick="mostrarSeccion('retos')">→</button></div></article>`;
        }).join("");
        actualizarVistaInicio("#retosInicio", cards);
    } catch (error) {
        console.error("No se pudieron actualizar los retos de inicio:", error);
        actualizarVistaInicio("#retosInicio", `<article class="retoCard verde retoCardVacio"><div class="retoIcono">⚠️</div><span>ECORETO</span><h3>No se pudieron cargar los retos</h3><p>Comprueba la conexión e inténtalo de nuevo.</p><button type="button" onclick="cargarRetosInicio()">Reintentar</button></article>`);
    }
}

async function cargarActividadReciente() {
    const contenedor = document.getElementById("actividadInicio");
    if (!idUsuarioActual) return;

    try {
        const supabase = await obtenerCliente();
        const [resultadoPosts, resultadoCompletados] = await Promise.all([
            supabase.from("posts").select("*").eq("user_id", idUsuarioActual),
            supabase.from("retos_completados").select("*").eq("user_id", idUsuarioActual)
        ]);
        if (resultadoPosts.error) throw resultadoPosts.error;
        if (resultadoCompletados.error) throw resultadoCompletados.error;

        const completados = resultadoCompletados.data || [];
        const idsReto = [...new Set(completados.map(item => item.reto_id).filter(Boolean))];
        let nombresRetos = new Map();
        if (idsReto.length) {
            const { data: retos, error } = await supabase.from("retos").select("id,titulo,puntos").in("id", idsReto);
            if (error) throw error;
            nombresRetos = new Map((retos || []).map(reto => [String(reto.id), reto]));
        }

        const ordenarPorFechaDesc = (a, b) => new Date(b.created_at || b.creado_el || b.completado_el || 0) - new Date(a.created_at || a.creado_el || a.completado_el || 0);
        const publicacionesRecientes = [...(resultadoPosts.data || [])].sort(ordenarPorFechaDesc).slice(0, 5);
        const retosRecientes = [...completados].sort(ordenarPorFechaDesc).slice(0, 5);
        const postsConImagen = await Promise.all(publicacionesRecientes.map(async post => ({
            ...post,
            urlImagen: await resolverImagenPublicacion(supabase, post.image_url || post.imagen_url)
        })));
        const acciones = [
            ...postsConImagen.map(post => ({ tipo: "publicacion", titulo: post.contenido || "Publicación ecológica", fecha: post.created_at || post.creado_el, icono: "📣", puntos: Number(post.puntos ?? 20), imagen: post.urlImagen })),
            ...await Promise.all(retosRecientes.map(async item => ({ tipo: "reto", titulo: nombresRetos.get(String(item.reto_id))?.titulo || "Reto completado", fecha: item.completado_el || item.completed_at || item.created_at, icono: "✅", puntos: Number(item.puntos ?? nombresRetos.get(String(item.reto_id))?.puntos) || 0, imagen: await resolverImagenPublicacion(supabase, item.evidencia_url) })))
        ].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
        const contadorAcciones = document.getElementById("accionesUsuario");
        if (contadorAcciones) contadorAcciones.textContent = String((resultadoPosts.data || []).length + completados.length);
        const plantillaInicio = document.createElement("template");
        plantillaInicio.innerHTML = vistasCache.get("inicio") || contenidoInicio;
        const contadorCache = plantillaInicio.content.querySelector("#accionesUsuario");
        if (contadorCache) contadorCache.textContent = String((resultadoPosts.data || []).length + completados.length);
        contenidoInicio = plantillaInicio.innerHTML;
        vistasCache.set("inicio", contenidoInicio);

        const html = acciones.length ? acciones.slice(0, 5).map(accion => `
            <article class="actividad-item">
                <span class="actividad-item-icono" aria-hidden="true">${accion.imagen ? `<img src="${escaparHTML(accion.imagen)}" alt="Foto de ${escaparHTML(accion.titulo)}" loading="lazy" onerror="this.parentElement.textContent='📣'">` : accion.icono}</span>
                <div><strong>${escaparHTML(accion.titulo)}</strong><small>${accion.fecha ? escaparHTML(new Intl.DateTimeFormat(navigator.language || "es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(accion.fecha))) : "Acción registrada"}</small><small class="actividad-item-puntos">+${Number(accion.puntos) || 0} pts</small></div>
                <span class="actividad-item-tipo">${accion.tipo === "reto" ? "Reto" : "Publicación"}</span>
            </article>`).join("") : `
            <div class="actividadVacia"><div>🌱</div><h3>Todavía no tienes acciones</h3><p>Completa un reto o publica una acción ecológica.</p><button class="botonPrincipal" onclick="mostrarSeccion('retos')">Comenzar</button></div>`;
        actualizarVistaInicio("#actividadInicio", html);
    } catch (error) {
        console.error("No se pudo cargar el historial:", error);
        if (contenedor) contenedor.innerHTML = `<div class="actividadVacia"><div>🌱</div><h3>Historial no disponible</h3><p>Inténtalo de nuevo más tarde.</p></div>`;
    }
}

/* =========================================================
   RUTAS Y NAVEGACIÓN
   ========================================================= */

function estaEnPages() {
    return /\/pages(?:\/|$)/i.test(location.pathname);
}

function rutaLogin() {
    return estaEnPages() ? "login.html" : "pages/login.html";
}

function rutaRegistro() {
    return estaEnPages() ? "registro.html" : "pages/registro.html";
}

function rutaInstitucion() {
    // Mantiene el enlace correcto si EcoReto se publica en un subdirectorio.
    const rutaActual = window.location.pathname;
    const indicePages = rutaActual.lastIndexOf("/pages/");
    const base = indicePages >= 0
        ? rutaActual.slice(0, indicePages)
        : rutaActual.replace(/\/[^/]*$/, "");
    return `${base}/pages/institucion.html` || "/pages/institucion.html";
}

function rutaDespuesDeAutenticacionAbsoluta() {
    const volver = new URLSearchParams(window.location.search).get("volver");
    if (volver !== "portal-institucion.html") return new URL(rutaApp(), window.location.href).href;
    const path = window.location.pathname;
    const indicePages = path.lastIndexOf("/pages/");
    const base = indicePages >= 0 ? path.slice(0, indicePages) : path.replace(/\/[^/]*$/, "");
    return `${window.location.origin}${base}/pages/portal-institucion.html`;
}

function rutaLoginAbsoluta() {
    // Genera la URL absoluta adecuada para el callback de Supabase
    const base = window.location.origin;
    const path = window.location.pathname;

    const basePagina = path.includes("/pages/")
        ? path.substring(0, path.indexOf("/pages/"))
        : path.replace(/\/[^/]*$/, "");
    const destino = new URL(`${base}${basePagina}/pages/login.html`);
    if (new URLSearchParams(window.location.search).get("volver") === "portal-institucion.html") {
        destino.searchParams.set("volver", "portal-institucion.html");
    }
    return destino.href;
}

function rutaApp() {
    return estaEnPages() ? "../app.html" : "app.html";
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

const MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

function formatearTamanoImagen(bytes) {
    const idioma = navigator.language || "es-CO";
    const megabytes = bytes / (1024 * 1024);
    return `${new Intl.NumberFormat(idioma, { maximumFractionDigits: 2 }).format(megabytes)} MB`;
}

function validarImagen(archivo) {
    if (!archivo) return "Selecciona una imagen para continuar.";
    if (!archivo.type?.startsWith("image/")) return "El archivo seleccionado no parece ser una imagen. Elige una foto JPG, PNG, WebP u otro formato de imagen compatible.";
    if (!Number.isFinite(archivo.size) || archivo.size <= 0) return "El archivo está vacío o no se pudo leer. Elige otra imagen.";
    if (archivo.size > MAXIMO_IMAGEN_BYTES) {
        return `La imagen pesa ${formatearTamanoImagen(archivo.size)} y supera el límite de 5 MB. Elige otra foto o reduce su tamaño antes de subirla.`;
    }
    return null;
}
function esMismoDia(fecha) {
    if (!fecha) return false;
    const hoy = new Date();
    const f = new Date(fecha);
    return hoy.toDateString() === f.toDateString();
}

function esMismaSemana(fecha) {
    if (!fecha) return false;
    const hoy = new Date();
    const f = new Date(fecha);
    const diferenciaDias = (hoy - f) / (1000 * 60 * 60 * 24);
    return diferenciaDias >= 0 && diferenciaDias < 7;
}

/* =========================================================
   RANGOS Y PROGRESO
   ========================================================= */

function obtenerRango(puntos) {
    puntos = Number(puntos) || 0;

    if (puntos >= 5000) return "🔰 EcoReto";
    if (puntos >= 3500) return "👑 Guardián del Planeta";
    if (puntos >= 2500) return "🏆 Leyenda Planetaria";
    if (puntos >= 2000) return "🦸 Héroe Ecológico";
    if (puntos >= 1500) return "🛡️ Protector Ambiental";
    if (puntos >= 1000) return "🏞️ Ecosistema";
    if (puntos >= 800) return "🌲 Bosque Protector";
    if (puntos >= 400) return "🌳 Árbol Robusto";
    if (puntos >= 100) return "🌿 Brote Ecológico";

    return "🌱 Semilla Verde";
}

function obtenerSiguienteRango(puntos) {
    puntos = Number(puntos) || 0;

    if (puntos < 100) return { nombre: "🌿 Brote Ecológico", meta: 100, anterior: 0 };
    if (puntos < 400) return { nombre: "🌳 Árbol Robusto", meta: 400, anterior: 100 };
    if (puntos < 800) return { nombre: "🌲 Bosque Protector", meta: 800, anterior: 400 };
    if (puntos < 1000) return { nombre: "🏞️ Ecosistema", meta: 1000, anterior: 800 };
    if (puntos < 1500) return { nombre: "🛡️ Protector Ambiental", meta: 1500, anterior: 1000 };
    if (puntos < 2000) return { nombre: "🦸 Héroe Ecológico", meta: 2000, anterior: 1500 };
    if (puntos < 2500) return { nombre: "🏆 Leyenda Planetaria", meta: 2500, anterior: 2000 };
    if (puntos < 3500) return { nombre: "👑 Guardián del Planeta", meta: 3500, anterior: 2500 };
    if (puntos < 5000) return { nombre: "🔰 EcoReto", meta: 5000, anterior: 3500 };

    return { nombre: "🔰 EcoReto", meta: 5000, anterior: 5000 };
}

/* =========================================================
   AUTENTICACIÓN (REGISTRO / INICIO DE SESIÓN)
   ========================================================= */

async function consultarDisponibilidadNombrePerfil(nombre) {
    const supabase = await obtenerCliente();
    const { data, error } = await supabase.rpc("ecoreto_nombre_perfil_disponible", { p_username: nombre.trim() });
    if (error) throw error;
    return data === true;
}

async function iniciarConGoogle(contexto = "login") {
    const estado = document.getElementById(contexto === "registro" ? "estadoRegistro" : "estadoGoogleLogin");
    const boton = document.getElementById(contexto === "registro" ? "btnGoogleRegistro" : "btnGoogleLogin");
    let perfilPendiente = null;
    if (contexto === "registro") {
        const username = document.getElementById("nombre")?.value.trim() || "";
        if (!username || !nombreRespetuoso(username)) {
            if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = "Escribe un nombre válido para tu perfil antes de continuar con Google."; }
            return;
        }
        if (estado) { estado.className = "registro-ranking-estado comprobando"; estado.textContent = "Verificando el nombre de tu perfil…"; }
        try {
            if (!await consultarDisponibilidadNombrePerfil(username)) {
                if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = "Ese nombre ya está en uso. Elige otro o usa una sugerencia."; }
                return;
            }
        } catch (error) {
            if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = `${mensajeErrorDisponibilidadNombre(error)} No se inició el acceso con Google.`; }
            return;
        }
        perfilPendiente = { username };
    }

    if (boton) { boton.disabled = true; boton.textContent = "Conectando con Google…"; }
    try {
        if (perfilPendiente) sessionStorage.setItem("ecoreto_google_perfil_pendiente", JSON.stringify(perfilPendiente));
        const supabase = await obtenerCliente();
        const destinoLogin = new URL(rutaLoginAbsoluta());
        if (new URLSearchParams(window.location.search).get("volver") === "portal-institucion.html") {
            destinoLogin.searchParams.set("volver", "portal-institucion.html");
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: destinoLogin.href }
        });
        if (error) throw error;
    } catch (error) {
        sessionStorage.removeItem("ecoreto_google_perfil_pendiente");
        console.error("No se pudo iniciar el acceso con Google:", error);
        if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = mensajeErrorGoogle(error); }
        if (boton) { boton.disabled = false; boton.textContent = "Continuar con Google"; }
    }
}

async function procesarRetornoOAuth() {
    // La pantalla institucional reutiliza estilos de registro, pero no es una
    // pantalla de autenticación. Evita que una sesión activa la redirija a app.
    if (!document.querySelector(".tarjeta-login, .tarjeta-registro:not(.tarjeta-institucion)")) return;
    const parametrosOAuth = new URLSearchParams(window.location.search);
    const fragmentoOAuth = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    // La recuperación también crea una sesión temporal. No debe confundirse
    // con el retorno de Google, que redirige al inicio al detectar una sesión.
    if (parametrosOAuth.get("type") === "recovery" || fragmentoOAuth.get("type") === "recovery") return;
    const errorOAuth = parametrosOAuth.get("error_description") || parametrosOAuth.get("error") || fragmentoOAuth.get("error_description") || fragmentoOAuth.get("error");
    if (errorOAuth) {
        const estado = document.getElementById("estadoRegistro") || document.getElementById("estadoGoogleLogin");
        if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = mensajeErrorGoogle(errorOAuth); }
        const limpiar = new URL(window.location.href);
        ["error", "error_description", "error_code"].forEach(clave => limpiar.searchParams.delete(clave));
        limpiar.hash = "";
        window.history.replaceState({}, document.title, limpiar.toString());
        return;
    }
    try {
        const supabase = await obtenerCliente();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) return;
        let usuario = session.user;
        let perfilPendiente = null;
        try {
            perfilPendiente = JSON.parse(sessionStorage.getItem("ecoreto_google_perfil_pendiente") || "null");
        } catch { perfilPendiente = null; }

        const { data: perfilExistente, error: errorPerfil } = await supabase.from("profiles").select("id").eq("id", usuario.id).maybeSingle();
        if (errorPerfil) throw errorPerfil;
        if (!perfilExistente && perfilPendiente) {
            const { error: errorMetadata } = await supabase.auth.updateUser({ data: perfilPendiente });
            if (errorMetadata) throw errorMetadata;
            const { data: usuarioActualizado } = await obtenerUsuarioEcoReto(supabase);
            usuario = usuarioActualizado?.user || usuario;
        }
        sessionStorage.removeItem("ecoreto_google_perfil_pendiente");
        if (!await asegurarPerfil(usuario)) throw new Error("No se pudo preparar el perfil después del acceso con Google.");
        window.location.replace(rutaDespuesDeAutenticacionAbsoluta());
    } catch (error) {
        console.error("No se pudo terminar el acceso con Google:", error);
        const estado = document.getElementById("estadoRegistro") || document.getElementById("estadoGoogleLogin");
        if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = mensajeErrorAmigable(error, "Google inició sesión, pero no pudimos preparar tu perfil. Recarga esta página para volver a intentarlo."); }
    }
}

function configurarTecladoContacto(idCampo, idAyuda) {
    const campo = document.getElementById(idCampo);
    const ayuda = document.getElementById(idAyuda);
    if (!campo) return;
    const pareceTelefono = !campo.value.includes("@") && /[+\d]/.test(campo.value);
    campo.inputMode = pareceTelefono ? "tel" : "email";
    if (ayuda && campo.value) {
        ayuda.textContent = pareceTelefono
            ? "Formato teléfono: +, código del país y número (por ejemplo, +573001234567)."
            : "Revisa que el correo tenga el formato nombre@dominio.com.";
    }
}

function ajustarTecladoRegistro() { configurarTecladoContacto("correo", "ayudaIdentificadorRegistro"); }
function ajustarTecladoLogin() { configurarTecladoContacto("correoLogin", "ayudaIdentificadorLogin"); }

function mensajeErrorDisponibilidadNombre(error) {
    const detalle = String(error?.message || "");
    if (!navigator.onLine || /failed to fetch|network|timeout|timed out|load failed/i.test(detalle)) {
        return "No pudimos conectar con EcoReto. Revisa Internet y vuelve a comprobar el nombre.";
    }
    if (/paused|project.*(inactive|paused)|service unavailable|\b(502|503|504)\b/i.test(detalle)) {
        return "El servicio de EcoReto no está disponible en este momento. Espera a que se reactive y vuelve a intentarlo.";
    }
    if (/ecoreto_nombre_perfil_disponible|schema cache|could not find the function|PGRST202/i.test(detalle)) {
        return "No pudimos comprobar si ese nombre está disponible. Inténtalo de nuevo más tarde.";
    }
    return "No pudimos comprobar el nombre ahora. Inténtalo otra vez en unos segundos.";
}

function mensajeErrorGoogle(error) {
    const detalle = String(error?.message || error?.error_description || error || "").toLowerCase();
    if (/provider.*(not enabled|disabled)|unsupported provider/.test(detalle)) {
        return "El acceso con Google aún no está disponible. Intenta registrarte con correo.";
    }
    if (/redirect_uri_mismatch|redirect.*(not allowed|not whitelisted|invalid)/.test(detalle)) {
        return "No pudimos completar el acceso con Google. Inténtalo de nuevo o usa correo.";
    }
    if (/invalid_client|unauthorized_client|client secret|client id/.test(detalle)) {
        return "No pudimos completar el acceso con Google. Inténtalo de nuevo o usa correo.";
    }
    if (/access_denied|cancelled|canceled/.test(detalle)) return "Se canceló el acceso con Google. Puedes intentarlo de nuevo.";
    return "No se pudo completar el acceso con Google. Inténtalo de nuevo o usa correo.";
}

function programarVerificacionNombrePerfil() {
    clearTimeout(temporizadorNombrePerfil);
    const revision = ++revisionNombrePerfil;
    const input = document.getElementById("nombre");
    const estado = document.getElementById("estadoNombrePerfil");
    const nombre = input?.value.trim() || "";
    if (!input || !estado || nombre.length < 2 || nombre.length > 60 || !nombreRespetuoso(nombre)) return;
    temporizadorNombrePerfil = setTimeout(async () => {
        estado.className = "registro-ranking-estado comprobando";
        estado.textContent = "Comprobando disponibilidad…";
        try {
            const disponible = await consultarDisponibilidadNombrePerfil(nombre);
            if (revision !== revisionNombrePerfil || input.value.trim() !== nombre) return;
            input.setAttribute("aria-invalid", String(!disponible));
            estado.className = `registro-ranking-estado ${disponible ? "disponible" : "ocupado"}`;
            estado.textContent = disponible ? "Nombre disponible ✓" : "Ese nombre ya está en uso. Prueba otro o usa una sugerencia.";
        } catch (error) {
            if (revision !== revisionNombrePerfil || input.value.trim() !== nombre) return;
            estado.className = "registro-ranking-estado error";
            estado.textContent = mensajeErrorDisponibilidadNombre(error);
        }
    }, 400);
}

function actualizarEstadoNombrePerfil() {
    const input = document.getElementById("nombre");
    const estado = document.getElementById("estadoNombrePerfil");
    const nombre = input?.value.trim() || "";
    if (!estado) return;
    clearTimeout(temporizadorNombrePerfil);
    revisionNombrePerfil++;
    if (!nombre) {
        input?.removeAttribute("aria-invalid");
        estado.className = "registro-ranking-estado";
        estado.textContent = "Escribe el nombre que quieres mostrar en tu perfil.";
    } else if (nombre.length > 60) {
        input?.setAttribute("aria-invalid", "true");
        estado.className = "registro-ranking-estado ocupado";
        estado.textContent = "El nombre debe tener 60 caracteres o menos.";
    } else if (nombre.length < 2) {
        input?.setAttribute("aria-invalid", "true");
        estado.className = "registro-ranking-estado ocupado";
        estado.textContent = "El nombre debe tener al menos 2 caracteres.";
    } else if (!nombreRespetuoso(nombre)) {
        input?.setAttribute("aria-invalid", "true");
        estado.className = "registro-ranking-estado ocupado";
        estado.textContent = "No se pudo usar ese nombre. Prueba con otro.";
    } else {
        input?.setAttribute("aria-invalid", "false");
        estado.className = "registro-ranking-estado";
        estado.textContent = "Comprobaremos que esté disponible.";
        programarVerificacionNombrePerfil();
    }
}

async function verificarNombrePerfilDisponible() {
    const nombre = document.getElementById("nombre")?.value.trim() || "";
    const estado = document.getElementById("estadoNombrePerfil");
    if (!nombre || !estado) return;
    estado.className = "registro-ranking-estado comprobando";
    estado.textContent = "Comprobando disponibilidad…";
    try {
        const disponible = await consultarDisponibilidadNombrePerfil(nombre);
        estado.className = `registro-ranking-estado ${disponible ? "disponible" : "ocupado"}`;
        estado.textContent = disponible ? "Nombre disponible ✓" : "Ese nombre ya está registrado. Prueba otro o usa una sugerencia.";
    } catch (error) {
        console.error("No se pudo comprobar el nombre del perfil:", error);
        estado.className = "registro-ranking-estado error";
        estado.textContent = mensajeErrorDisponibilidadNombre(error);
    }
}

async function sugerirNombrePerfil() {
    const input = document.getElementById("nombre");
    const estado = document.getElementById("estadoNombrePerfil");
    if (!input || !estado) return;
    clearTimeout(temporizadorNombrePerfil);
    revisionNombrePerfil++;
    const nombre = input.value.trim();
    const nombreSeguro = nombreRespetuoso(nombre || "") ? nombre : "EcoAmigo";
    const base = (nombreSeguro || "EcoAmigo").replace(/\s+/g, "-").slice(0, 22);
    estado.className = "registro-ranking-estado comprobando";
    estado.textContent = "Buscando un nombre disponible…";
    try {
        for (let intento = 0; intento < 20; intento++) {
            const candidato = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
            if (await consultarDisponibilidadNombrePerfil(candidato)) {
                input.value = candidato;
                estado.className = "registro-ranking-estado disponible";
                estado.textContent = `Nombre disponible: ${candidato}`;
                input.setAttribute("aria-invalid", "false");
                return;
            }
        }
        estado.className = "registro-ranking-estado ocupado";
        estado.textContent = "No encontré una sugerencia ahora. Prueba con otro nombre.";
    } catch (error) {
        console.error("No se pudo sugerir un nombre de perfil:", error);
        estado.className = "registro-ranking-estado error";
        estado.textContent = mensajeErrorDisponibilidadNombre(error);
    }
}
async function registrarUsuario() {
    const nombre = document.getElementById("nombre")?.value.trim();
    const correo = document.getElementById("correo")?.value.trim().toLowerCase();
    const password = document.getElementById("password")?.value;
    const estadoRegistro = document.getElementById("estadoRegistro");
    const botonRegistro = document.getElementById("btnRegistro");
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre || !correo || !password) {
        alert("Completa todos los campos 🌱");
        return;
    }

    if (!nombreRespetuoso(nombre) || nombre.length > 60) {
        alert("Revisa tu nombre de perfil (máximo 60 caracteres) e inténtalo de nuevo.");
        document.getElementById("nombre")?.focus();
        return;
    }
    if (!formatoCorreo.test(correo || "")) {
        if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado error"; estadoRegistro.textContent = "Escribe un correo electrónico válido."; }
        document.getElementById("correo")?.focus();
        return;
    }
    if (password.length < 6 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        alert(mensajeErrorAmigable({ message: "Password should contain at least one character of each" }));
        document.getElementById("password")?.focus();
        return;
    }

    if (botonRegistro) { botonRegistro.disabled = true; botonRegistro.textContent = "Comprobando…"; }
    if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado comprobando"; estadoRegistro.textContent = "Estamos revisando los datos. Todavía no se ha creado la cuenta."; }
    try {
        if (!await consultarDisponibilidadNombrePerfil(nombre)) {
            if (botonRegistro) { botonRegistro.disabled = false; botonRegistro.textContent = "Registrarse"; }
            if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado error"; estadoRegistro.textContent = "Ese nombre ya está ocupado. Elige otro o usa una sugerencia."; }
            await sugerirNombrePerfil();
            return;
        }
    } catch (error) {
        console.error("Error al validar el nombre del perfil:", error);
        if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado error"; estadoRegistro.textContent = `${mensajeErrorDisponibilidadNombre(error)} No se envió el registro.`; }
        const estadoPerfil = document.getElementById("estadoNombrePerfil");
        if (estadoPerfil) { estadoPerfil.className = "registro-ranking-estado error"; estadoPerfil.textContent = mensajeErrorDisponibilidadNombre(error); }
        if (botonRegistro) { botonRegistro.disabled = false; botonRegistro.textContent = "Registrarse"; }
        return;
    }

    try {
        const supabase = await obtenerCliente();

        const { data, error } = await supabase.auth.signUp({
            email: correo,
            password: password,
            options: {
                data: { username: nombre },
                emailRedirectTo: rutaLoginAbsoluta()
            }
        });

        if (error) {
            console.error("Error de registro:", error);
            const mensaje = String(error?.message || "").toLowerCase();

            if (mensaje.includes("already registered") || mensaje.includes("already exists")) {
                alert("Este correo ya está registrado. Inicia sesión con esa cuenta.");
                window.location.href = rutaLogin();
            } else if (mensaje.includes("password")) {
                alert("La contraseña debe tener al menos 6 caracteres (entre numeros y letras). 🔒");
            } else {
                if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado error"; estadoRegistro.textContent = mensajeErrorAmigable(error, "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo."); }
            }
            return;
        }

        if (data?.user && data.user.identities && data.user.identities.length === 0) {
            alert("Este correo ya está registrado. Inicia sesión con esa cuenta.");
            window.location.href = rutaLogin();
            return;
        }

        if (data?.session) {
            const perfilCreado = await asegurarPerfil(data.user);
            if (!perfilCreado) {
                alert("No se pudo guardar el perfil. Revisa si el nombre ya está en uso e inténtalo de nuevo.");
                return;
            }
            alert("✅ Registro realizado correctamente.");
            window.location.href = rutaApp();
            return;
        }

        if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado disponible"; estadoRegistro.textContent = "Registro iniciado. Revisa tu correo para confirmar la cuenta y luego inicia sesión."; }
        window.location.href = rutaLogin();

    } catch (error) {
        console.error("Error inesperado en registro:", error);
        if (estadoRegistro) { estadoRegistro.className = "registro-ranking-estado error"; estadoRegistro.textContent = mensajeErrorAmigable(error, "No se pudo conectar con EcoReto. Revisa tu conexión e inténtalo de nuevo."); }
    } finally {
        if (botonRegistro) { botonRegistro.disabled = false; botonRegistro.textContent = "Registrarse"; }
    }
}

async function iniciarSesion() {
    const correo = document.getElementById("correoLogin")?.value.trim().toLowerCase();
    const password = document.getElementById("passwordLogin")?.value;

    if (!correo || !password) {
        alert("Completa todos los campos 🌱");
        return;
    }

    try {
        const supabase = await obtenerCliente();

        const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });

        if (error) {
            console.error("Error de inicio de sesión:", error);
            const mensaje = String(error?.message || "").toLowerCase();

            if (mensaje.includes("email not confirmed") || mensaje.includes("email_not_confirmed")) {
                alert("Debes verificar tu correo electrónico antes de iniciar sesión 📧");
            } else if (/phone.*(?:disabled|sign.?ups? disabled|logins? disabled)/i.test(mensaje)) {
                alert(mensajeErrorAmigable(error));
            } else {
                alert("Correo o contraseña incorrectos.");
            }
            return;
        }

        if (!data?.user || !data?.session) {
            alert("No se pudo iniciar la sesión.");
            return;
        }

        await asegurarPerfil(data.user);
        window.location.href = rutaDespuesDeAutenticacionAbsoluta();

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert(mensajeErrorAmigable(error, "Ocurrió un error inesperado al iniciar sesión."));
    }
}

// Abre la ventana emergente bonita
function recuperarContrasena() {
    const modal = document.getElementById("modalRecuperar");
    if (modal) {
        modal.style.display = "flex";
        document.getElementById("correoRecuperar").focus(); // Selecciona el input automáticamente
    }
}

// Cierra la ventana emergente
function cerrarModalRecuperar() {
    const modal = document.getElementById("modalRecuperar");
    if (modal) {
        modal.style.display = "none";
        document.getElementById("correoRecuperar").value = ""; // Limpia el campo
    }
}

// Procesa el envío con Supabase
async function enviarCorreoRecuperacion() {
    const correoInput = document.getElementById("correoRecuperar");
    const correo = correoInput ? correoInput.value.trim() : "";

    if (!correo) {
        alert("Por favor ingresa un correo electrónico.");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        alert("Escribe un correo electrónico válido para recibir el enlace de recuperación.");
        correoInput?.focus();
        return;
    }

    try {
        const supabase = await obtenerCliente();

        const { error } = await supabase.auth.resetPasswordForEmail(correo.toLowerCase(), {
            redirectTo: rutaLoginAbsoluta(),
        });

        if (error) {
            alert(mensajeErrorAmigable(error, "No se pudo enviar el correo de recuperación. Inténtalo de nuevo."));
        } else {
            alert("¡Listo! Si el correo está registrado, hemos enviado las instrucciones para restablecer tu contraseña.");
            cerrarModalRecuperar();
        }
    } catch (err) {
        console.error("Error inesperado en recuperación:", err);
        alert("Ocurrió un error al intentar enviar el correo de recuperación.");
    }
}

async function cerrarSesion() {
    try {
        const supabase = await obtenerCliente();
        await supabase.auth.signOut();
        window.location.href = rutaLogin();
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        window.location.href = rutaLogin();
    }
}

function activarFormularioNuevaPassword() {
    const seccionNueva = document.getElementById("seccionNuevaPassword");
    if (!seccionNueva) return false;

    document.getElementById("correoLogin")?.style.setProperty("display", "none");
    document.getElementById("passwordLogin")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login label[for='correoLogin']")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login label[for='passwordLogin']")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login .nota-acceso-identidad")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login > button")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login .separador-acceso")?.style.setProperty("display", "none");
    document.getElementById("btnGoogleLogin")?.style.setProperty("display", "none");
    document.getElementById("estadoGoogleLogin")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login > p a[href='#']")?.closest("p")?.style.setProperty("display", "none");
    document.querySelector(".tarjeta-login > a[href='registro.html']")?.style.setProperty("display", "none");
    seccionNueva.hidden = false;
    seccionNueva.style.display = "block";
    document.getElementById("nuevaPasswordInput")?.focus();
    return true;
}

// Un enlace antiguo que llegue a app.html se redirige conservando el token.
window.addEventListener("DOMContentLoaded", async () => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const parametros = new URLSearchParams(window.location.search);
    const esRecuperacion = hash.get("type") === "recovery" || parametros.get("type") === "recovery";

    if (esRecuperacion && !document.getElementById("seccionNuevaPassword")) {
        const destino = new URL(rutaLogin(), window.location.href);
        destino.search = window.location.search;
        destino.hash = window.location.hash;
        window.location.replace(destino.toString());
        return;
    }
    if (esRecuperacion) activarFormularioNuevaPassword();

    try {
        const supabase = await obtenerCliente();
        supabase.auth.onAuthStateChange((evento) => {
            if (evento === "PASSWORD_RECOVERY") activarFormularioNuevaPassword();
        });
    } catch (error) {
        console.error("No se pudo inicializar la recuperación de contraseña:", error);
    }
});

async function guardarNuevaPassword() {
    const password = document.getElementById("nuevaPasswordInput")?.value || "";
    const confirmacion = document.getElementById("confirmarNuevaPasswordInput")?.value || "";
    const estado = document.getElementById("estadoNuevaPassword");
    const boton = document.querySelector("#seccionNuevaPassword button[onclick='guardarNuevaPassword()']");
    if (boton?.disabled) return;
    if (password.length < 6) {
        if (estado) estado.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        if (estado) estado.textContent = mensajeErrorAmigable({ message: "Password should contain at least one character of each" });
        return;
    }
    if (password !== confirmacion) {
        if (estado) estado.textContent = "Las contraseñas no coinciden. Revísalas e inténtalo de nuevo.";
        return;
    }

    if (boton) { boton.disabled = true; boton.textContent = "Guardando…"; }
    try {
        const supabase = await obtenerCliente();
        let { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            const tokens = new URLSearchParams(`${window.location.search.replace(/^\?/, "")}&${window.location.hash.replace(/^#/, "")}`);
            const access_token = tokens.get("access_token");
            const refresh_token = tokens.get("refresh_token");
            const token_hash = tokens.get("token_hash");
            const code = tokens.get("code");
            if (access_token && refresh_token) {
                const resultado = await supabase.auth.setSession({ access_token, refresh_token });
                if (resultado.error) throw resultado.error;
                session = resultado.data?.session;
            } else if (token_hash && tokens.get("type") === "recovery") {
                const resultado = await supabase.auth.verifyOtp({ token_hash, type: "recovery" });
                if (resultado.error) throw resultado.error;
                session = resultado.data?.session;
            } else if (code && tokens.get("type") === "recovery") {
                const resultado = await supabase.auth.exchangeCodeForSession(code);
                if (resultado.error) throw resultado.error;
                session = resultado.data?.session;
            }
        }
        if (!session) throw new Error("El enlace de recuperación venció o ya se utilizó. Solicita uno nuevo.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        if (estado) estado.textContent = "Tu contraseña se actualizó correctamente. Redirigiendo al inicio de sesión…";
        try { await supabase.auth.signOut(); } catch (errorCierre) { console.warn("La contraseña se guardó; no se pudo cerrar la sesión temporal:", errorCierre); }
        window.location.replace(rutaLogin());
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        const detalle = String(error?.message || "");
        if (estado) estado.textContent = /expired|invalid.*token|token.*invalid|otp_expired|invalid_grant|recovery/i.test(detalle)
            ? "Este enlace para cambiar la contraseña venció o ya se utilizó. Vuelve a Iniciar sesión y solicita un enlace nuevo."
            : mensajeErrorAmigable(error, "No se pudo guardar la contraseña. Comprueba que el enlace no haya vencido y vuelve a intentarlo.");
        if (boton) { boton.disabled = false; boton.textContent = "Guardar contraseña nueva"; }
    }
}

/* =========================================================
   GESTIÓN DE PERFIL Y SESIÓN
   ========================================================= */

async function asegurarPerfil(user) {
    if (!user?.id) return false;

    try {
        const supabase = await obtenerCliente();
        const nombreOriginal = user.user_metadata?.username || user.user_metadata?.name || user.email?.split("@")[0] || "EcoAmigo";
        const nombre = nombreRespetuoso(nombreOriginal) ? nombreOriginal : "EcoAmigo";

        const { error } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    username: nombre,
                    country: user.user_metadata?.country || null,
                    school: user.user_metadata?.school || null,
                },
                { onConflict: "id", ignoreDuplicates: true }
            );

        if (error) {
            console.error("Error al asegurar perfil:", error);
            return false;
        }
        const { error: errorCorreo } = await supabase.rpc("sync_profile_email");
        if (errorCorreo) console.warn("No se pudo sincronizar el correo del perfil:", errorCorreo);
        return true;

    } catch (error) {
        console.error("Error inesperado en asegurarPerfil:", error);
        return false;
    }
}

async function verificarSesion() {
    try {
        const supabase = await obtenerCliente();
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
            window.location.href = rutaLogin();
            return false;
        }
        return true;
    } catch (error) {
        window.location.href = rutaLogin();
        return false;
    }
}

async function cargarUsuario() {
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);

        if (errorUsuario || !user) return;

        await asegurarPerfil(user);
        await procesarCodigoInstitucionPendiente();

        let { data: perfil, error: errorPerfil } = await supabase
            .from("profiles")
            .select("username,puntos,rango,avatar_url,cursor_id")
            .eq("id", user.id)
            .maybeSingle();
        if (errorPerfil && /cursor_id|schema cache|PGRST204/i.test(String(errorPerfil.message))) {
            ({ data: perfil } = await supabase.from("profiles").select("username,puntos,rango,avatar_url").eq("id", user.id).maybeSingle());
        }

        const nombre = perfil?.username || user.user_metadata?.username || "Usuario";
        const puntos = Number(perfil?.puntos) || 0;
        const rango = obtenerRango(puntos);
        aplicarCursorEcoReto(perfil?.cursor_id);
        idUsuarioActual = user.id;
        // profiles es la fuente principal; un avatar_url nulo allí significa
        // que el usuario eligió volver al emoji, no que deba restaurarse uno viejo.
        avatarUsuarioActual = perfil ? (perfil.avatar_url || "") : (user.user_metadata?.avatar_url || "");
        try {
            if (avatarUsuarioActual) localStorage.setItem(`ecoreto-avatar-${user.id}`, avatarUsuarioActual);
            else localStorage.removeItem(`ecoreto-avatar-${user.id}`);
        } catch { /* El almacenamiento local puede estar deshabilitado. */ }

        // Actualiza el nombre en la barra de navegación superior
        const elementoNav = document.getElementById('nombreUsuario');
        if (elementoNav) elementoNav.textContent = nombre;
        actualizarAvatarMenu(avatarUsuarioActual);

        // Actualiza el nombre en el saludo del inicio
        const elementoSaludo = document.getElementById('saludoNombre');
        if (elementoSaludo) elementoSaludo.textContent = nombre;
        const elementoPuntos = document.getElementById("puntosUsuario");
        if (elementoPuntos) elementoPuntos.textContent = String(puntos);
        const elementoRango = document.getElementById("rangoUsuario");
        if (elementoRango) elementoRango.textContent = rango;

    } catch (error) {
        console.error("Error cargando usuario:", error);
    }
}

async function procesarCodigoInstitucionPendiente() {
    let codigo = "";
    try { codigo = localStorage.getItem("ecoreto_codigo_institucion_pendiente") || ""; } catch { return; }
    if (!codigo) return;
    try {
        const supabase = await obtenerCliente();
        const { data, error } = await supabase.rpc("ecoreto_unirse_ranking", { p_codigo: codigo });
        if (error) throw error;
        const competencia = data?.[0];
        if (!competencia?.competition_id) {
            localStorage.removeItem("ecoreto_codigo_institucion_pendiente");
            localStorage.setItem("ecoreto_mensaje_institucion", "No encontramos una institución aprobada con ese código. Puedes unirte desde Rankings con un código válido.");
            return;
        }
        localStorage.removeItem("ecoreto_codigo_institucion_pendiente");
        localStorage.setItem("ecoreto_competencia_seleccionada", competencia.competition_id);
        localStorage.setItem("ecoreto_mensaje_institucion", `Ya perteneces al ranking de ${competencia.competition_name}.`);
    } catch (error) {
        console.error("No se pudo activar el código institucional:", error);
        if (String(error?.code || "") === "54000" || /cinco rankings privados/i.test(String(error?.message || ""))) {
            localStorage.removeItem("ecoreto_codigo_institucion_pendiente");
        }
        localStorage.setItem("ecoreto_mensaje_institucion", mensajeErrorAmigable(error, "El código aún no se pudo activar. Se volverá a intentar cuando el servicio esté disponible."));
    }
}

function seleccionarTipoInstitucion(tipo) {
    const estudiante = tipo === "estudiante";
    const panelEstudiante = document.getElementById("panelEstudiante");
    const panelRepresentante = document.getElementById("panelRepresentante");
    const botonEstudiante = document.getElementById("opcionEstudiante");
    const botonRepresentante = document.getElementById("opcionRepresentante");
    if (panelEstudiante) panelEstudiante.hidden = !estudiante;
    if (panelRepresentante) panelRepresentante.hidden = estudiante;
    if (botonEstudiante) botonEstudiante.setAttribute("aria-pressed", String(estudiante));
    if (botonRepresentante) botonRepresentante.setAttribute("aria-pressed", String(!estudiante));
}

async function unirseRankingInstitucional() {
    const codigoInput = document.getElementById("codigoEstudianteInstitucion");
    const estado = document.getElementById("estadoEstudianteInstitucion");
    const codigo = codigoInput?.value.trim() || "";
    if (!codigo) { if (estado) estado.textContent = "Escribe el código que te dio tu institución."; return; }
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) {
            localStorage.setItem("ecoreto_codigo_institucion_pendiente", codigo);
            localStorage.setItem("ecoreto_ir_a_ranking", "1");
            if (estado) {
                estado.className = "registro-ranking-estado disponible";
                estado.innerHTML = 'Para entrar al ranking necesitas una cuenta personal. Guardamos el código. <a href="registro.html">Crear cuenta</a> · <a href="login.html">Ya tengo cuenta</a>.';
            }
            return;
        }
        if (estado) estado.textContent = "Validando el código…";
        if (!await asegurarPerfil(user)) throw new Error("No se pudo preparar tu cuenta. Inténtalo de nuevo.");
        const { data, error } = await supabase.rpc("ecoreto_unirse_ranking", { p_codigo: codigo });
        if (error) throw error;
        const competencia = data?.[0];
        if (!competencia?.competition_id) throw new Error("No encontramos una institución aprobada con ese código.");
        localStorage.setItem("ecoreto_competencia_seleccionada", competencia.competition_id);
        localStorage.setItem("ecoreto_ir_a_ranking", "1");
        if (estado) estado.innerHTML = `¡Listo! Ya estás en <strong>${escaparHTML(competencia.competition_name)}</strong>. <a href="../app.html?demo=1&amp;vista=ranking">Volver a EcoReto y ver tus rankings</a>`;
    } catch (error) {
        console.error("No se pudo unir al ranking institucional:", error);
        const detalle = String(error?.message || "");
        let mensaje = mensajeErrorAmigable(error, "No pudimos completar la entrada al ranking. Revisa el código e inténtalo de nuevo.");
        if (String(error?.code || "") === "54000" || /cinco rankings privados/i.test(detalle)) {
            mensaje = "Ya participas en cinco rankings privados activos. Entra a uno desde el selector y usa “Salir de este ranking” para aceptar este código.";
        } else if (/No encontramos (?:una institución aprobada|un ranking activo) con ese código/i.test(detalle)) {
            mensaje = "No encontramos un ranking activo con ese código. Comprueba que lo copiaste completo y que corresponde a esta institución.";
        } else if (/ecoreto_unirse_ranking|schema cache|PGRST202|42804|return type/i.test(detalle)) {
            mensaje = "No pudimos validar el código ahora. Inténtalo de nuevo más tarde; si sigue ocurriendo, avisa al equipo de EcoReto.";
        }
        if (estado) estado.textContent = mensaje;
    }
}

async function enviarSolicitudInstitucion() {
    const estado = document.getElementById("estadoSolicitudInstitucion");
    let telefonoContacto = null;
    const telefonoContactoInput = document.getElementById("institucionTelefono");
    if (telefonoContactoInput?.value.trim()) {
        try { telefonoContacto = await obtenerTelefonoE164("institucionTelefono"); }
        catch (error) {
            if (estado) { estado.className = "registro-ranking-estado error"; estado.textContent = mensajeErrorAmigable(error, error.message); }
            telefonoContactoInput.focus();
            return;
        }
    }
    const valores = {
        p_institution_name: document.getElementById("institucionNombre")?.value.trim(),
        p_city: document.getElementById("institucionCiudad")?.value.trim(),
        p_country: document.getElementById("institucionPais")?.value.trim(),
        p_website: null,
        p_institutional_email: document.getElementById("institucionCorreo")?.value.trim().toLowerCase(),
        p_contact_name: document.getElementById("institucionContacto")?.value.trim(),
        p_contact_role: document.getElementById("institucionCargo")?.value === "otro"
            ? document.getElementById("institucionCargoOtro")?.value.trim()
            : document.getElementById("institucionCargo")?.value.trim(),
        p_contact_phone: telefonoContacto,
        p_reason: document.getElementById("institucionMotivo")?.value.trim()
    };
    const dominio = valores.p_institutional_email?.split("@").pop();
    if (["gmail.com", "googlemail.com", "hotmail.com", "outlook.com", "live.com", "yahoo.com", "icloud.com", "proton.me", "protonmail.com"].includes(dominio)) {
        if (estado) estado.textContent = "Usa el correo con dominio de tu institución. Revisaremos manualmente cada solicitud.";
        return;
    }
    const boton = document.querySelector("#formularioInstitucion button[type=submit]");
    if (estado) { estado.className = "registro-ranking-estado comprobando"; estado.textContent = "Enviando tu solicitud de forma segura…"; }
    if (boton) boton.disabled = true;
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) throw new Error("Inicia sesión para solicitar el ranking.");
        if (String(user.email || "").trim().toLowerCase() !== String(valores.p_institutional_email || "").trim().toLowerCase()) {
            throw new Error("Usa la misma cuenta de EcoReto que tiene confirmado el correo institucional escrito arriba.");
        }
        if (!user.email_confirmed_at) throw new Error("Primero confirma el correo de tu cuenta EcoReto. Después vuelve aquí para enviar la solicitud.");
        const { data: applicationId, error } = await supabase.rpc("ecoreto_solicitar_institucion", valores);
        if (error) throw error;
        document.getElementById("formularioInstitucion")?.reset();
        actualizarCargoInstitucion();
        document.getElementById("institucionPais")?.dispatchEvent(new Event("change"));
        const errorCorreo = await notificarSolicitudInstitucion(supabase, applicationId, "received");
        if (estado) {
            estado.className = "registro-ranking-estado disponible";
            estado.textContent = errorCorreo
                ? "Recibimos la solicitud y quedó pendiente de revisión. No hace falta enviarla otra vez. Por ahora no pudimos mandar un correo de confirmación; el equipo de EcoReto sí puede revisar los datos."
                : "Listo, recibimos la solicitud. Te enviaremos la respuesta al correo de la institución cuando la revisemos.";
        }
    } catch (error) {
        const detalleSolicitud = `${error?.message || ""} ${error?.details || ""}`;
        if (String(error?.code || "") === "23505" || /solicitud reciente con este correo institucional/i.test(detalleSolicitud)) {
            console.info("La solicitud institucional ya estaba registrada; no se creó un duplicado.");
            if (estado) {
                estado.className = "registro-ranking-estado disponible";
                estado.textContent = "Ya recibimos una solicitud reciente para esta institución. No necesitas enviarla otra vez; el equipo de EcoReto la revisará y se pondrá en contacto con el correo institucional.";
            }
            return;
        }
        console.error("No se pudo enviar la solicitud institucional:", error);
        if (estado) {
            estado.className = "registro-ranking-estado error";
            const mensaje = mensajeErrorAmigable(error, "No pudimos recibir la solicitud en este momento. Inténtalo más tarde; si ya la enviaste, no hace falta repetirla.");
            estado.textContent = /enlace de recuperación venció|solicita uno nuevo desde iniciar sesión/i.test(mensaje)
                ? "Inicia sesión con la cuenta de EcoReto que usa el mismo correo institucional del formulario y vuelve a intentarlo."
                : mensaje;
        }
    } finally { if (boton) boton.disabled = false; }
}

async function notificarSolicitudInstitucion(supabase, applicationId, kind) {
    try {
        const { data, error } = await supabase.functions.invoke("notificar-institucion", { body: { application_id: applicationId, kind } });
        if (error) return error;
        if (data?.error) return new Error(String(data.error));
        if (data?.sent !== true) return new Error("El servicio no confirmó el envío del correo.");
        return null;
    } catch (error) {
        console.error("No se pudo solicitar el correo institucional:", error);
        return error;
    }
}

async function cargarSolicitudesInstitucion() {
    const contenedor = document.getElementById("solicitudesInstitucionAdmin");
    if (!contenedor) return;
    contenedor.innerHTML = "<p>Cargando solicitudes pendientes…</p>";
    try {
        const supabase = await obtenerCliente();
        const { data, error } = await supabase.rpc("ecoreto_solicitudes_institucion_pendientes");
        if (error) throw error;
        if (!data?.length) { contenedor.innerHTML = "<p>No hay solicitudes pendientes.</p>"; return; }
        contenedor.innerHTML = data.map(s => {
            let sitioSeguro = "";
            try { const url = new URL(s.website); if (["https:", "http:"].includes(url.protocol)) sitioSeguro = url.href; } catch { /* URL opcional inválida. */ }
            const telefono = s.contact_phone
                ? `<a href="tel:${escaparHTML(s.contact_phone)}">${escaparHTML(s.contact_phone)}</a>`
                : "No indicado";
            return `<article class="solicitud-institucion"><h3>${escaparHTML(s.institution_name)}</h3><p class="solicitud-ubicacion">${escaparHTML(s.city)}, ${escaparHTML(s.country)}${sitioSeguro ? ` · <a href="${escaparHTML(sitioSeguro)}" target="_blank" rel="noopener noreferrer">Sitio web</a>` : ""}</p><dl class="solicitud-contacto"><div><dt>Persona de contacto</dt><dd>${escaparHTML(s.contact_name)}</dd></div><div><dt>Cargo</dt><dd>${escaparHTML(s.contact_role)}</dd></div><div><dt>Correo institucional</dt><dd><a href="mailto:${escaparHTML(s.institutional_email)}">${escaparHTML(s.institutional_email)}</a></dd></div><div><dt>Teléfono</dt><dd>${telefono}</dd></div></dl><p class="solicitud-motivo"><strong>Motivo:</strong> ${escaparHTML(s.reason)}</p><div class="solicitud-acciones"><button type="button" onclick="resolverSolicitudInstitucion('${s.id}',true)">Aprobar y crear ranking</button><button type="button" class="rechazar" onclick="resolverSolicitudInstitucion('${s.id}',false)">Rechazar</button></div></article>`;
        }).join("");
    } catch (error) {
        console.error("No se pudieron cargar solicitudes institucionales:", error);
        contenedor.innerHTML = `<p role="alert">${escaparHTML(mensajeErrorAmigable(error, "No se pudieron cargar las solicitudes."))}</p>`;
    }
}

async function resolverSolicitudInstitucion(id, aceptar) {
    if (!confirm(aceptar ? "¿Aprobar esta institución y generar su ranking privado?" : "¿Rechazar esta solicitud?")) return;
    const nota = aceptar ? "" : (prompt("Motivo del rechazo (opcional):") || "");
    try {
        const supabase = await obtenerCliente();
        const { data, error } = await supabase.rpc("ecoreto_resolver_solicitud_institucion", { p_id: id, p_aceptar: aceptar, p_nota: nota });
        if (error) throw error;
        const resultado = data?.[0];
        const errorCorreo = await notificarSolicitudInstitucion(supabase, id, "decision");
        if (aceptar && resultado?.invite_code) {
            alert(errorCorreo
                ? `Institución aprobada. El correo no se pudo enviar; comparte manualmente este código con el contacto institucional: ${resultado.invite_code}`
                : `Institución aprobada. Enviamos el código de acceso al correo institucional. Código: ${resultado.invite_code}`);
        } else alert(errorCorreo ? "Solicitud rechazada, pero no se pudo enviar la notificación por correo." : "Solicitud rechazada y notificación enviada al correo institucional.");
        await cargarSolicitudesInstitucion();
    } catch (error) {
        console.error("No se pudo resolver la solicitud institucional:", error);
        alert(mensajeErrorAmigable(error, "No se pudo resolver la solicitud."));
    }
}

async function subirNuevaFoto() {
    const input = document.getElementById("inputSubirAvatar") || document.getElementById("inputAvatar");
    const archivo = input?.files?.[0];
    if (!archivo) return;

    const mensaje = validarImagen(archivo);
    if (mensaje) {
        alert(mensaje);
        input.value = "";
        return;
    }

    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorSesion } = await obtenerUsuarioEcoReto(supabase);
        if (errorSesion || !user) throw new Error("Inicia sesión para cambiar tu foto de perfil.");

        const extension = archivo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const ruta = `${user.id}/${Date.now()}.${extension}`;
        const { error: errorSubida } = await supabase.storage
            .from("avatars")
            .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
        if (errorSubida) throw errorSubida;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(ruta);
        const avatarUrl = urlData?.publicUrl;
        if (!avatarUrl) throw new Error("No se pudo obtener la URL de la imagen.");

        const { error: errorPerfil } = await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", user.id);
        if (errorPerfil) throw errorPerfil;

        avatarUsuarioActual = avatarUrl;
        try { localStorage.setItem(`ecoreto-avatar-${user.id}`, avatarUrl); } catch { /* Opcional. */ }
        actualizarAvatarMenu(avatarUrl);
        actualizarImagenPerfil(avatarUrl);
        invalidarVistasDeProgreso();
        guardarVistaActual();
        alert("Foto de perfil actualizada.");
    } catch (error) {
        console.error("Error al subir la foto de perfil:", error);
        alert(mensajeErrorAmigable(error, "No se pudo subir la foto. Inténtalo de nuevo."));
    } finally {
        if (input) input.value = "";
    }
}

async function quitarFotoPerfil() {
    const es = String(navigator.language || "es").toLowerCase().startsWith("es");
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorSesion } = await obtenerUsuarioEcoReto(supabase);
        if (errorSesion || !user) throw new Error("Inicia sesión para cambiar tu foto de perfil.");

        const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
        if (error) throw error;
        // profiles es la fuente principal del avatar; un valor nulo allí
        // representa que el usuario eligió volver al emoji.
        avatarUsuarioActual = "";
        try { localStorage.removeItem(`ecoreto-avatar-${user.id}`); } catch { /* Opcional. */ }
        actualizarAvatarMenu("");
        actualizarImagenPerfil("");
        invalidarVistasDeProgreso();
        guardarVistaActual();
        alert(es ? "Foto quitada. Ahora se muestra tu emoji de perfil." : "Profile photo removed. Your profile emoji is showing now.");
    } catch (error) {
        console.error("No se pudo quitar la foto de perfil:", error);
        alert(mensajeErrorAmigable(error, es ? "No se pudo quitar la foto. Inténtalo de nuevo." : "The photo could not be removed. Please try again."));
    }
}
/* =========================================================
   VISTAS Y NAVEGACIÓN
   ========================================================= */

function actualizarMenuActivo(seccion) {
    document.querySelectorAll("#menuPrincipal button[data-seccion]").forEach((boton) => {
        boton.classList.toggle("menuActivo", boton.dataset.seccion === seccion);
    });
}

function iniciarVistaDemo() {
    modoVistaDemo = true;
    document.body.classList.add("vista-invitado");
    const nombre = document.getElementById("nombreUsuario");
    if (nombre) nombre.textContent = "Invitado";
    actualizarAvatarMenu("");
    const botonPerfil = document.querySelector(".botonPerfil");
    if (botonPerfil) {
        botonPerfil.setAttribute("aria-label", "Acceso de invitado");
        botonPerfil.onclick = () => mostrarSeccion("perfil");
    }
    mostrarInicioDemo();
}

function mostrarInicioDemo() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;
    contenido.innerHTML =
        '<section class="paginaInterna" style="max-width:1120px;margin:0 auto;padding:32px 22px;">' +
        '<span class="etiqueta">VISTA DE EXPLORACIÓN</span><h1>¡Hola! Estás en EcoReto 🌱</h1>' +
        '<p>Explora la app y conoce cómo sumarte. Para guardar tus acciones, puntos y progreso, crea una cuenta.</p>' +
        '<div class="retosCards" style="margin:28px 0;">' +
        '<article class="retoCard verde"><div class="retoIcono">🎯</div><span>RETOS</span><h3>Encuentra una acción para hoy</h3><p>Conoce ideas para cuidar el agua, reutilizar y proteger las plantas.</p><div class="retoAbajo"><button type="button" onclick="mostrarSeccion(\'retos\')">Explorar →</button></div></article>' +
        '<article class="retoCard azul"><div class="retoIcono">🏆</div><span>RANGOS</span><h3>Avanza con cada acción</h3><p>Descubre los rangos ecológicos y el progreso que puedes alcanzar.</p><div class="retoAbajo"><button type="button" onclick="mostrarSeccion(\'rangos\')">Ver rangos →</button></div></article>' +
        '<article class="retoCard naranja"><div class="retoIcono">📈</div><span>COMUNIDAD</span><h3>Comparte y sube en el ranking</h3><p>Al participar, tus acciones suman puntos y muestran tu avance.</p><div class="retoAbajo"><button type="button" onclick="mostrarSeccion(\'ranking\')">Conocer ranking →</button></div></article>' +
        '</div><div class="actividadVacia" style="max-width:760px;margin:0 auto;text-align:center;">' +
        '<h2>¿Quieres empezar?</h2><p>Crea tu cuenta para publicar evidencias, participar en retos y guardar tu progreso.</p>' +
        '<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;"><a class="botonPrincipal" href="' + rutaRegistro() + '">Crear cuenta</a>' +
        '<a class="botonPrincipal" href="' + rutaLogin() + '" style="background:#fff;color:#286847;border:1px solid #cfe2d1;">Ya tengo cuenta</a></div></div></section>';
    actualizarMenuActivo("inicio");
    seccionActual = "inicio";
}

function mostrarRetosDemo() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;
    contenido.innerHTML =
        '<section class="paginaInterna" style="max-width:1120px;margin:0 auto;padding:32px 22px;">' +
        '<span class="etiqueta">DESCUBRE LOS RETOS</span><h1>Acciones sencillas, cambios que suman 🌿</h1>' +
        '<p>Estos son ejemplos de las actividades que encontrarás. Crea una cuenta para ver los retos disponibles y registrar tus avances.</p>' +
        '<div class="retosCards" style="margin-top:26px;">' +
        '<article class="retoCard azul"><div class="retoIcono">🚿</div><span>AHORRO DE AGUA</span><h3>Haz una pausa al agua</h3><p>Reduce el tiempo de ducha y ahorra agua en tu próxima rutina.</p></article>' +
        '<article class="retoCard verde"><div class="retoIcono">♻️</div><span>RECICLAJE</span><h3>Separa tus residuos</h3><p>Separa correctamente los residuos que generes hoy.</p></article>' +
        '<article class="retoCard naranja"><div class="retoIcono">🪴</div><span>CUIDADO DE LA NATURALEZA</span><h3>Cuida una planta</h3><p>Riega, limpia o revisa una planta de tu hogar o comunidad.</p></article>' +
        '</div><p style="margin-top:22px;">Las actividades de esta pantalla son ejemplos; la lista disponible puede cambiar.</p>' +
        '<button type="button" class="botonPrincipal" onclick="mostrarSeccion(\'publicar\')">Quiero participar →</button></section>';
}

function mostrarAccesoDemo(seccion) {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;
    const titulos = {
        publicar: ["Para publicar tu acción", "Inicia sesión o crea una cuenta. Así podemos guardar la foto, registrar tu acción y sumar los puntos a tu perfil."],
        actividad: ["Tu actividad te espera", "Inicia sesión para ver tus puntos, retos completados y el progreso de tus acciones."],
        ranking: ["Tu ranking te espera", "Inicia sesión para consultar las clasificaciones y ver tu progreso personal."],
        perfil: ["Tu perfil empieza aquí", "Crea una cuenta para guardar tus puntos, rango y acciones."],
        historial: ["Tu historial personal", "Inicia sesión para consultar las acciones que hayas registrado."]
    };
    const [titulo, descripcion] = titulos[seccion] || titulos.perfil;
    contenido.innerHTML =
        '<section class="paginaInterna" style="max-width:760px;margin:70px auto;padding:36px 24px;text-align:center;">' +
        '<div class="retoIcono" aria-hidden="true">🌱</div><h1>' + titulo + '</h1><p>' + descripcion + '</p>' +
        '<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:24px;">' +
        '<a class="botonPrincipal" href="' + rutaLogin() + '">Iniciar sesión</a>' +
        '<a class="botonPrincipal" href="' + rutaRegistro() + '" style="background:#fff;color:#286847;border:1px solid #cfe2d1;">Crear cuenta</a></div>' +
        (seccion === "ranking" ? '<a class="enlace-institucion enlace-institucion-ranking" href="' + rutaInstitucion() + '">Entrar con código o solicitar un ranking →</a>' : '') +
        '<button type="button" class="btn-secundario" style="margin-top:18px;" onclick="mostrarSeccion(\'inicio\')">Seguir explorando</button></section>';
}

async function mostrarSeccion(seccion) {
    const solicitudActual = ++solicitudNavegacion;
    if (seccion === "nosotros" || seccion === "contacto") {
        mostrarPaginaInformativa(seccion);
        return;
    }
    if (modoVistaDemo) {
        actualizarMenuActivo(seccion);
        if (seccion === "inicio") mostrarInicioDemo();
        else if (seccion === "retos") { mostrarRetosDemo(); seccionActual = seccion; }
        else if (seccion === "rangos") { await mostrarRangos(); seccionActual = seccion; }
        else mostrarAccesoDemo(seccion);
        return;
    }
    actualizarMenuActivo(seccion === "actividad" ? "inicio" : seccion);
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    // El perfil carga datos de forma asíncrona. Si se pulsa Inicio mientras
    // esa carga está en curso, no debemos confundir la vista activa con el
    // contenido que todavía quedó pintado en pantalla.
    const inicioNoEstaPintado = seccion === "inicio" && !contenido.querySelector("#seccion-inicio");
    if (seccion === seccionActual && !inicioNoEstaPintado) return;
    guardarVistaActual();
    // Actualizar la sección antes de cualquier await evita que un segundo
    // clic sobre Inicio se descarte por creer que ya estamos allí.
    seccionActual = seccion;
    if (vistasCache.has(seccion) && seccion !== "historial") {
        contenido.innerHTML = vistasCache.get(seccion);
    if (seccion === "inicio") {
            await cargarUsuario();
            if (solicitudActual !== solicitudNavegacion) return;
            await Promise.all([cargarRetosInicio(), cargarActividadReciente()]);
        }
        return;
    }

    if (seccion === "inicio") {
        contenido.innerHTML = vistasCache.get("inicio") || contenidoInicio;
        actualizarMenuActivo("inicio");
        seccionActual = "inicio";
        await cargarUsuario();
        return;
    }
    if (seccion === "publicar") { await mostrarPublicar(); seccionActual = seccion; guardarVistaActual(); return; }
    if (seccion === "actividad") { await mostrarEstadisticasPersonales(); seccionActual = seccion; guardarVistaActual(); return; }
    if (seccion === "historial") { await mostrarHistorialCompleto(); seccionActual = seccion; guardarVistaActual(); return; }
    if (seccion === "retos") { await mostrarRetos(); seccionActual = seccion; guardarVistaActual(); return; }
    if (seccion === "ranking") { await mostrarRanking(); seccionActual = seccion; guardarVistaActual(); return; }
    if (seccion === "rangos") { await mostrarRangos(); seccionActual = seccion; guardarVistaActual(); return; }
    if (seccion === "perfil") {
        if (!idUsuarioActual) await cargarUsuario();
        if (solicitudActual !== solicitudNavegacion) return;
        contenido.innerHTML = `
        <div class="perfil-recompensas-layout">
        <div class="pokemon-card-profile">
            <div class="poke-header-bar">
                <span id="perfilRangoBadge" class="poke-tag">Cargando...</span>
                <div class="poke-hp-container">
                    <span class="poke-ps-label">PS</span>
                    <span id="perfilPuntosHeader" class="poke-hp-value">0</span>
                </div>
            </div>

            <div class="poke-artwork-frame">
                <img id="perfilAvatarImg" src="${escaparHTML(avatarUsuarioActual)}" alt="Foto de perfil" class="poke-avatar-img" ${avatarUsuarioActual ? "" : "hidden"}>
                <span id="perfilAvatarEmoji" class="poke-avatar-emoji" ${avatarUsuarioActual ? "hidden" : ""}>👤</span>

            </div>
            <small class="evidencia-limite profile-photo-limit">Tamaño máximo por foto: 5 MB.</small>
            <div class="profile-photo-actions">
                <label for="inputSubirAvatar" class="profile-photo-action">📷 Cambiar foto</label>
                <button type="button" class="profile-photo-action profile-photo-remove" onclick="quitarFotoPerfil()">Quitar foto</button>
            </div>
            <input type="file" id="inputSubirAvatar" accept="image/*" hidden onchange="subirNuevaFoto()">


            <div class="poke-info-strip">
                <h2 id="perfilNombre" class="poke-username">Cargando...</h2>
                <p id="perfilEmail" class="poke-useremail">...</p>
            </div>

            <div class="perfil-pais-form">
                <label for="paisPerfilActual">Tu país</label>
                <select id="paisPerfilActual" autocomplete="country-name" onchange="guardarPaisPerfil()" aria-describedby="estadoPaisPerfil"></select>
                <small>Se usa para incluirte en la clasificación nacional que corresponda.</small>
                <p id="estadoPaisPerfil" role="status" aria-live="polite"></p>
            </div>

            <div class="poke-stats-grid">
                <div class="poke-stat-box">
                    <span class="stat-title">Rango Actual</span>
                    <strong id="perfilRangoTexto" class="stat-value">-</strong>
                </div>
                <div class="poke-stat-box">
                    <span class="stat-title">Puesto Ranking</span>
                    <strong id="perfilPuestoRanking" class="stat-value">🏆 #--</strong>
                </div>
            </div>

            <button id="btnSesionPerfil" onclick="cerrarSesion()" class="poke-btn-logout">
                Cerrar Sesión
            </button>
        </div>
        <section id="seccionCursoresEcoReto" class="seccion-cursores-ecoreto" aria-live="polite"></section>
        </div>
      `;
        await mostrarPerfil();
        if (solicitudActual !== solicitudNavegacion) return;

        const { data: { user } } = await obtenerUsuarioEcoReto(await obtenerCliente());
        if (solicitudActual !== solicitudNavegacion) return;
        const btnSesion = document.getElementById("btnSesionPerfil");
        if (btnSesion && !user) {
            btnSesion.textContent = "Iniciar sesión";
            btnSesion.className = "poke-btn-login";
            btnSesion.onclick = () => { window.location.href = rutaLogin(); };
        }

        seccionActual = seccion;
        guardarVistaActual();
        return;
    }

}

function mostrarPaginaInformativa(seccion) {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;
    const nosotros = seccion === "nosotros";
    contenido.innerHTML = nosotros
        ? `<section class="paginaInterna pagina-informativa">
            <span class="etiqueta">CONÓCENOS</span><h1>Pequeñas acciones, grandes cambios 🌎</h1>
            <p>EcoReto te ayuda a convertir el cuidado del ambiente en hábitos sencillos que puedes compartir con tu comunidad.</p>
            <div class="informativa-tarjetas">
                <article><span aria-hidden="true">🌱</span><h2>¿Qué es EcoReto?</h2><p>Un espacio para descubrir acciones ecológicas, compartir tus avances y reconocer el esfuerzo que haces cada día.</p></article>
                <article><span aria-hidden="true">🎯</span><h2>Nuestra misión</h2><p>Motivar a personas y comunidades a cuidar la naturaleza con acciones prácticas, constantes y al alcance de todos.</p></article>
            </div>
            <button type="button" class="botonPrincipal" onclick="mostrarSeccion('inicio')">Volver al inicio</button>
          </section>`
        : `<section class="paginaInterna pagina-informativa pagina-contacto">
            <span class="etiqueta">ESTAMOS PARA AYUDAR</span><h1>¿Necesitas ayuda? 🌿</h1>
            <p>Cuéntanos qué ocurrió desde el botón de ayuda. Describe los pasos que seguiste y el mensaje que apareció; el equipo podrá revisar tu reporte.</p>
            <div class="contacto-enlaces" aria-label="Contactos de EcoReto">
                <a href="https://www.instagram.com/soy_ecoreto/" target="_blank" rel="noopener noreferrer" aria-label="Abrir Instagram de EcoReto">Instagram <strong>@soy_ecoreto</strong></a>
                <a href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=ecoreto.contac%40gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Escribir a EcoReto en Gmail">Escribir por Gmail <strong>ecoreto.contac@gmail.com</strong></a>
            </div>
            <div class="contacto-acciones"><button type="button" class="botonPrincipal" onclick="abrirAyuda()">Abrir ayuda</button><button type="button" class="btn-secundario" onclick="mostrarSeccion('inicio')">Volver al inicio</button></div>
          </section>`;
    seccionActual = seccion;
    guardarVistaActual();
}

/* =========================================================
   PUBLICACIONES
   ========================================================= */

async function mostrarEstadisticasPersonales() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;
    contenido.innerHTML = '<section class="paginaInterna"><p style="text-align:center;">Cargando tus estadísticas…</p></section>';
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorSesion } = await obtenerUsuarioEcoReto(supabase);
        if (errorSesion) throw errorSesion;
        if (!user) {
            contenido.innerHTML = '<section class="paginaInterna estadisticas-personales"><h1>Inicia sesión para ver tu actividad</h1><p>Tus puntos, retos completados y publicaciones estarán reunidos aquí.</p><button class="botonPrincipal" onclick="window.location.href=rutaLogin()">Iniciar sesión</button></section>';
            return;
        }

        const [resultadoPerfil, resultadoPublicaciones, resultadoRetos] = await Promise.all([
            supabase.from("profiles").select("puntos,rango").eq("id", user.id).maybeSingle(),
            // Cada instalación puede tener nombres de fecha distintos según
            // cuándo se creó la tabla. Leer las filas evita fallar por pedir
            // una columna opcional que no exista en ese proyecto.
            supabase.from("posts").select("*").eq("user_id", user.id),
            supabase.from("retos_completados").select("*").eq("user_id", user.id)
        ]);
        if (resultadoPerfil.error) throw resultadoPerfil.error;
        if (resultadoPublicaciones.error) throw resultadoPublicaciones.error;
        if (resultadoRetos.error) throw resultadoRetos.error;

        const publicaciones = resultadoPublicaciones.data || [];
        const retosCompletados = resultadoRetos.data || [];
        const totalAcciones = publicaciones.length + retosCompletados.length;
        const puntos = Number(resultadoPerfil.data?.puntos) || 0;
        const siguiente = obtenerSiguienteRango(puntos);
        const rangoMaximo = puntos >= 5000;
        const avanceRango = rangoMaximo ? 100 : siguiente.meta > siguiente.anterior
            ? Math.min(100, Math.max(0, ((puntos - siguiente.anterior) / (siguiente.meta - siguiente.anterior)) * 100))
            : 100;

        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const accionesMes = [...publicaciones, ...retosCompletados].filter(item => {
            const fecha = new Date(item.created_at || item.creado_el || item.completado_el || item.completed_at || 0);
            return !Number.isNaN(fecha.getTime()) && fecha >= inicioMes;
        }).length;

        contenido.innerHTML = `
            <section class="paginaInterna estadisticas-personales">
                <span class="etiqueta">TU CAMINO EN ECORETO</span>
                <div class="tituloFila"><div><h1>Tu actividad 🌿</h1><p>Un resumen de lo que has logrado con tus acciones.</p></div></div>
                <div class="estadisticas estadisticas-detalle">
                    <article class="stat puntos"><div class="iconoStat">⭐</div><div><small>PUNTOS</small><strong>${puntos}</strong></div></article>
                    <article class="stat rango"><div class="iconoStat">🏆</div><div><small>RANGO</small><strong>${escaparHTML(resultadoPerfil.data?.rango || obtenerRango(puntos))}</strong></div></article>
                    <article class="stat acciones"><div class="iconoStat">✅</div><div><small>RETOS COMPLETADOS</small><strong>${retosCompletados.length}</strong></div></article>
                    <article class="stat publicaciones"><div class="iconoStat">📣</div><div><small>PUBLICACIONES</small><strong>${publicaciones.length}</strong></div></article>
                </div>
                <section class="estadisticas-resumen-mes"><div><span>ESTE MES</span><h2>${accionesMes} ${accionesMes === 1 ? "acción" : "acciones"}</h2></div><p>En total llevas ${totalAcciones} ${totalAcciones === 1 ? "acción registrada" : "acciones registradas"}.</p></section>
                <section class="progreso-rango-personal" aria-label="Progreso hacia el siguiente rango"><div><strong>${rangoMaximo ? "¡Llegaste al rango máximo!" : `Progreso hacia ${escaparHTML(siguiente.nombre)}`}</strong><span>${Math.round(avanceRango)}%</span></div><progress max="100" value="${Math.round(avanceRango)}">${Math.round(avanceRango)}%</progress><small>${rangoMaximo ? "Sigue sumando acciones ecológicas." : `${Math.max(0, siguiente.meta - puntos)} puntos para llegar al siguiente rango`}</small></section>
                <div class="acciones-estadisticas"><button type="button" class="botonPrincipal" onclick="mostrarSeccion('historial')">Ver mis retos y publicaciones →</button></div>
            </section>`;
    } catch (error) {
        console.error("No se pudieron cargar las estadísticas personales:", error);
        contenido.innerHTML = '<section class="paginaInterna estadisticas-personales"><h1>No pudimos cargar tus estadísticas</h1><p>Inténtalo de nuevo en un momento.</p><button type="button" class="botonPrincipal" onclick="mostrarSeccion(\'actividad\')">Reintentar</button></section>';
    }
}

async function mostrarHistorialCompleto() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;
    contenido.innerHTML = '<section class="paginaInterna"><p style="text-align:center;">Cargando tu historial…</p></section>';

    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) {
            contenido.innerHTML = `<section class="paginaInterna"><h2>Inicia sesión para ver tu historial</h2><button class="botonPrincipal" onclick="window.location.href=rutaLogin()">Iniciar sesión</button></section>`;
            return;
        }

        const [resultadoPosts, resultadoRetos] = await Promise.all([
            supabase.from("posts").select("*").eq("user_id", user.id),
            supabase.from("retos_completados").select("*").eq("user_id", user.id)
        ]);
        if (resultadoPosts.error) throw resultadoPosts.error;
        if (resultadoRetos.error) throw resultadoRetos.error;

        const posts = resultadoPosts.data || [];
        const completados = resultadoRetos.data || [];
        const idsReto = [...new Set(completados.map(item => item.reto_id).filter(Boolean))];
        let nombresRetos = new Map();
        if (idsReto.length) {
            const { data, error } = await supabase.from("retos").select("id,titulo,puntos").in("id", idsReto);
            if (error) throw error;
            nombresRetos = new Map((data || []).map(reto => [String(reto.id), reto]));
        }

        const postsConImagen = await Promise.all(posts.map(async post => ({
            ...post,
            urlImagen: await resolverImagenPublicacion(supabase, post.image_url || post.imagen_url)
        })));
        const fechaLocal = valor => {
            if (!valor) return "Fecha no disponible";
            const fecha = new Date(valor);
            return Number.isNaN(fecha.getTime()) ? "Fecha no disponible" : new Intl.DateTimeFormat(navigator.language || "es", { dateStyle: "medium", timeStyle: "short" }).format(fecha);
        };
        const items = [
            ...postsConImagen.map(post => ({
                tipo: "publicacion", titulo: post.contenido || "Acción ecológica",
                fecha: post.created_at || post.creado_el, imagen: post.urlImagen, puntos: Number(post.puntos ?? 20)
            })),
            ...await Promise.all(completados.map(async item => ({
                tipo: "reto", titulo: nombresRetos.get(String(item.reto_id))?.titulo || "Reto completado",
                fecha: item.completado_el || item.completed_at || item.created_at, puntos: Number(item.puntos ?? nombresRetos.get(String(item.reto_id))?.puntos) || 0, imagen: await resolverImagenPublicacion(supabase, item.evidencia_url)
            })))
        ].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

        const cards = items.map(item => `
            <article class="historial-completo-item">
                ${item.imagen ? `<img class="historial-completo-imagen" src="${escaparHTML(item.imagen)}" alt="Evidencia de ${escaparHTML(item.titulo)}" loading="lazy">` : `<span class="historial-completo-icono" aria-hidden="true">${item.tipo === "reto" ? "✅" : "📣"}</span>`}
                <div class="historial-completo-detalle">
                    <strong>${escaparHTML(item.titulo)}</strong>
                    <small>${escaparHTML(fechaLocal(item.fecha))}</small>
                    ${item.puntos != null ? `<small class="actividad-item-puntos">+${Number(item.puntos) || 0} pts</small>` : ""}
                </div>
                <span class="actividad-item-tipo">${item.tipo === "reto" ? "Reto" : "Publicación"}</span>
            </article>`).join("");

        contenido.innerHTML = `
            <section class="paginaInterna historial-completo">
                <div class="tituloFila">
                    <div><span>HISTORIAL DE LA CUENTA</span><h1>Tu historial completo</h1></div>
                    <button type="button" class="botonPrincipal" onclick="mostrarSeccion('inicio')">← Volver a Inicio</button>
                </div>
                <p class="nota-historial">Aquí aparecen todas tus publicaciones y retos completados, del más reciente al más antiguo. Se conservan en tu cuenta.</p>
                <div class="historial-completo-lista">
                    ${cards || '<div class="actividadVacia"><div>🌱</div><h3>Aún no hay acciones guardadas</h3><p>Cuando publiques o completes un reto, aparecerá aquí.</p></div>'}
                </div>
            </section>`;
        contenido.querySelectorAll(".historial-completo-imagen").forEach(img => {
            img.onerror = () => { img.hidden = true; img.insertAdjacentHTML("afterend", '<span class="historial-completo-icono" aria-hidden="true">📣</span>'); };
        });
    } catch (error) {
        console.error("No se pudo cargar el historial completo:", error);
        contenido.innerHTML = `<section class="paginaInterna"><h2>No se pudo cargar tu historial</h2><p>Revisa tu conexión e inténtalo de nuevo.</p><button class="botonPrincipal" onclick="mostrarHistorialCompleto()">Reintentar</button></section>`;
    }
}

async function mostrarPublicar() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    contenido.innerHTML = `<p style="text-align:center;">Cargando muro...</p>`;

    try {
        const supabase = await obtenerCliente();

        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) {
            contenido.innerHTML = `<section class="paginaInterna"><h2>Inicia sesión para ver tus publicaciones</h2><button class="botonPrincipal" onclick="window.location.href=rutaLogin()">Iniciar sesión</button></section>`;
            return;
        }

        const { data: posts, error } = await supabase.from("posts").select("*").eq("user_id", user.id);
        if (error) throw error;

        const { data: perfilActual, error: errorPerfil } = await supabase
            .from("profiles")
            .select("id,username,avatar_url")
            .eq("id", user.id)
            .maybeSingle();
        if (errorPerfil) throw errorPerfil;

        const publicacionesOrdenadas = [...(posts || [])].sort((a, b) => {
            const fechaA = new Date(a.creado_el || a.created_at || 0).getTime();
            const fechaB = new Date(b.creado_el || b.created_at || 0).getTime();
            return fechaB - fechaA;
        });

        const publicacionesRecientes = publicacionesOrdenadas.slice(0, 12);
        const publicacionesConImagen = await Promise.all(publicacionesRecientes.map(async post => ({
            ...post,
            urlImagen: await resolverImagenPublicacion(supabase, post.image_url || post.imagen_url)
        })));

        const listaPostsHTML = publicacionesConImagen.map(post => {
            return `
            <div class="tarjeta-publicacion">
                <div class="publicacion-autor">
                    <img src="${escaparHTML(perfilActual?.avatar_url || AVATAR_POR_DEFECTO)}" alt="" class="avatar-publicacion">
                    <strong>${escaparHTML(perfilActual?.username || "Usuario")}</strong>
                </div>
                <p>${escaparHTML(post.contenido || "Acción ecológica")}</p>
                ${post.urlImagen ? `<img src="${escaparHTML(post.urlImagen)}" class="imagen-post-muro" alt="Evidencia ecológica" loading="lazy" />` : ''}
                <span class="badget-puntos-post">+20 pts</span>
            </div>
        `;
        }).join("");
        const notaPublicaciones = publicacionesOrdenadas.length > 12
            ? '<p class="nota-historial">Mostrando las 12 publicaciones más recientes. Las anteriores siguen guardadas en tu cuenta.</p>'
            : "";

        // Dentro de mostrarPublicar(), en la parte del HTML:
        contenido.innerHTML = `
    <section class="paginaInterna pagina-publicar">
        <span class="etiqueta">COMPARTE TU ACCIÓN</span>
        <h1>Publicar 🌱</h1>
        <p class="publicar-introduccion">Registra una acción ecológica y suma puntos a tu progreso.</p>

        <!-- TARJETA DEL FORMULARIO -->
        <div class="card-formulario-publicar">
            <h2 class="publicar-titulo-formulario">Nueva publicación</h2>

            <select id="selectAccionEco" class="input-desplegable-eco" required onchange="evaluarOpcionPublicar(this.value)">
                <option value="" disabled selected>Selecciona tu acción ecológica...</option>
                <option value="Reciclar ♻️">Reciclar ♻️</option>
                <option value="Ahorrar agua 🚰">Ahorrar agua 🚰</option>
                <option value="Sembrar o cuidar plantas 🌱">Sembrar o cuidar plantas 🌱</option>
                <option value="Limpié un lugar 🧹">Limpié un lugar 🧹</option>
                <option value="Ayudé un animal 🐾">Ayudé un animal 🐾</option>
                <option value="Otros">Otros...</option>
            </select>

            <div id="contenedorCampoOtros" style="display: none; margin-top: 10px;">
                <input type="text" id="inputAccionOtros" class="input-desplegable-eco" maxlength="500" placeholder="Escribe la acción personalizada..." oninput="idEnvioPublicacion=null" />
            </div>

            <div class="contenedor-input-file">
                <div class="publicacion-foto-selector" id="selectorFotoPublicacion">
                <button type="button" class="label-input-file publicacion-foto-abrir" onclick="abrirCamaraPublicacion()">📷 ${esDispositivoMovil() ? "Tomar foto" : "Subir o tomar foto"}</button>
                </div>
                <input type="file" id="inputFotoEco" accept="image/*" hidden required onchange="mostrarNombreArchivo(this)" />
                <span id="nombreArchivoSeleccionado" class="texto-archivo-nombre" role="status" aria-live="polite">Sin archivo seleccionado</span>
                <div id="previewFotoPublicacion" class="publicacion-foto-preview" hidden>
                    <img id="vistaPreviaPublicacion" class="vista-previa-publicacion reto-evidencia-imagen-ampliable" alt="Vista previa de la evidencia" title="Ampliar imagen" role="button" tabindex="0" hidden>
                    <button type="button" class="reto-evidencia-quitar" aria-label="Quitar imagen" title="Quitar imagen" onclick="quitarFotoPublicacion()"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg></button>
                    <button type="button" id="cambiarFotoPublicacion" class="publicacion-foto-cambiar" onclick="abrirCamaraPublicacion()" hidden>Cambiar foto</button>
                </div>
            </div>
            <small class="evidencia-limite publicacion-foto-limite">Tamaño máximo por foto: 5 MB.</small>
            <p id="estadoPublicacionEvidencia" class="reto-evidencia-estado" role="status" aria-live="polite" hidden></p>
            <button class="btn-publicar-verde" onclick="enviarPublicacionConPuntos()">Publicar (+20 pts)</button>
        </div>

        <h2 class="publicar-titulo-lista">Tus publicaciones</h2>
        <div class="lista-muro-publicaciones">
            ${listaPostsHTML || '<div class="tarjeta-publicacion"><p>Aún no hay publicaciones. ¡Sé el primero!</p></div>'}
        </div>
        ${notaPublicaciones}
        <button type="button" class="botonPrincipal boton-ver-historial" onclick="mostrarSeccion('historial')">Ver historial completo →</button>
    </section>`;

        contenido.querySelectorAll(".avatar-publicacion").forEach(imagen => {
            imagen.onerror = () => { imagen.onerror = null; imagen.src = AVATAR_POR_DEFECTO; };
        });

    } catch (err) {
        console.error("Error al cargar publicaciones:", err);
        contenido.innerHTML = `<section class="paginaInterna"><h2>No se pudieron cargar las publicaciones</h2><p>Revisa tu conexión e inténtalo de nuevo.</p><button class="botonPrincipal" onclick="mostrarPublicar()">Reintentar</button></section>`;
    }
}

function mostrarNombreArchivo(input, archivoCapturado = null) {
    const span = document.getElementById("nombreArchivoSeleccionado");
    const vistaPrevia = document.getElementById("vistaPreviaPublicacion");
    const preview = document.getElementById("previewFotoPublicacion");
    const selector = document.getElementById("selectorFotoPublicacion");
    const botonCambiarFoto = document.getElementById("cambiarFotoPublicacion");
    const archivo = archivoCapturado || input?.files?.[0] || null;
    if (input) input.removeAttribute("capture");
    if (input && archivo && esDispositivoMovil()) {
        input.value = "";
        if (span) span.textContent = "En el celular debes tomar la foto con la cámara de EcoReto.";
        return;
    }
    if (vistaPrevia?.dataset.objectUrl) URL.revokeObjectURL(vistaPrevia.dataset.objectUrl);
    archivoPublicacionSeleccionado = archivo;
    if (archivo) {
        span.textContent = `${archivo.name} · ${formatearTamanoImagen(archivo.size)} de 5 MB`;
        const error = validarImagen(archivo);
        if (error) {
            archivoPublicacionSeleccionado = null;
            idEnvioPublicacion = null;
            span.textContent = error;
            if (vistaPrevia) vistaPrevia.hidden = true;
            if (preview) preview.hidden = true;
            if (selector) selector.hidden = false;
            return;
        }
        idEnvioPublicacion = crearUUIDEcoReto();
        if (vistaPrevia) {
            const objectUrl = URL.createObjectURL(archivo);
            vistaPrevia.src = objectUrl;
            vistaPrevia.dataset.objectUrl = objectUrl;
            vistaPrevia.alt = `Vista previa: ${archivo.name}`;
            vistaPrevia.hidden = false;
        }
        if (preview) preview.hidden = false;
        if (selector) selector.hidden = true;
        if (botonCambiarFoto) botonCambiarFoto.hidden = false;
    } else {
        idEnvioPublicacion = null;
        span.textContent = "Sin archivo seleccionado";
        if (vistaPrevia) {
            vistaPrevia.removeAttribute("src");
            delete vistaPrevia.dataset.objectUrl;
            vistaPrevia.hidden = true;
        }
        if (preview) preview.hidden = true;
        if (selector) selector.hidden = false;
        if (botonCambiarFoto) botonCambiarFoto.hidden = true;
    }
}

function abrirCamaraPublicacion() {
    abrirCamaraReto("__publicacion__");
}

function cambiarFotoPublicacion() {
    abrirCamaraPublicacion();
}

function quitarFotoPublicacion() {
    const input = document.getElementById("inputFotoEco");
    const vistaPrevia = document.getElementById("vistaPreviaPublicacion");
    const preview = document.getElementById("previewFotoPublicacion");
    const selector = document.getElementById("selectorFotoPublicacion");
    if (vistaPrevia?.dataset.objectUrl) URL.revokeObjectURL(vistaPrevia.dataset.objectUrl);
    if (vistaPrevia) { vistaPrevia.removeAttribute("src"); delete vistaPrevia.dataset.objectUrl; vistaPrevia.hidden = true; }
    if (input) { input.value = ""; input.removeAttribute("capture"); }
    archivoPublicacionSeleccionado = null;
    idEnvioPublicacion = null;
    if (preview) preview.hidden = true;
    if (selector) selector.hidden = false;
    const nombre = document.getElementById("nombreArchivoSeleccionado");
    if (nombre) nombre.textContent = "Sin archivo seleccionado";
}
async function enviarPublicacionConPuntos() {
    const select = document.getElementById("selectAccionEco");
    if (!select) return;
    let valorFinal = select.value;

    if (valorFinal === "Otros") {
        const inputOtro = document.getElementById("inputAccionOtros");
        valorFinal = inputOtro?.value.trim() || "";
    }

    const archivo = archivoPublicacionSeleccionado || document.getElementById("inputFotoEco")?.files?.[0];
    const estadoEvidencia = document.getElementById("estadoPublicacionEvidencia");
    if (!valorFinal && !archivo) {
        alert("Para publicar, selecciona una acción y adjunta una foto.");
        return;
    }
    if (!valorFinal) {
        alert("Selecciona o escribe la acción que quieres publicar.");
        return;
    }
    if (!archivo) {
        alert("Adjunta una foto como evidencia antes de publicar.");
        return;
    }
    idEnvioPublicacion ||= crearUUIDEcoReto();
    const botonPublicar = document.querySelector(".btn-publicar-verde");
    if (botonPublicar) { botonPublicar.disabled = true; botonPublicar.textContent = "Publicando…"; }
    let supabase;
    let rutaImagen = null;
    let verificacionInvocada = false;
    let errorVerificacionHttp = false;
    try {
        supabase = await obtenerCliente();
        const { data: { user } } = await obtenerUsuarioEcoReto(supabase);

        if (!user) {
            alert("Debes iniciar sesión para publicar.");
            return;
        }

        // Asegura que el perfil exista antes de registrar puntos. PostgREST puede
        // responder sin error a un UPDATE que no encontró ninguna fila.
        if (!await asegurarPerfil(user)) {
            throw new Error("No pudimos preparar tu cuenta para publicar. Inténtalo de nuevo en un momento.");
        }

        let imagenUrl = null;
        const errorImagen = validarImagen(archivo);
        if (errorImagen) throw new Error(errorImagen);
        const extension = archivo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        rutaImagen = `${user.id}/${crearUUIDEcoReto()}.${extension}`;
        const { error: errorSubida } = await supabase.storage
            .from("post-images")
            .upload(rutaImagen, archivo, { contentType: archivo.type });
        if (errorSubida) throw errorSubida;
        imagenUrl = rutaImagen;
        if (!imagenUrl) throw new Error("No se pudo guardar la imagen. Vuelve a seleccionarla e inténtalo otra vez.");

        if (estadoEvidencia) { estadoEvidencia.hidden = false; estadoEvidencia.className = "reto-evidencia-estado cargando"; estadoEvidencia.textContent = "Registrando tu publicación y sus puntos…"; }
        verificacionInvocada = true;
        const { data: revision, error: errorRevision } = await supabase.functions.invoke("verificar-evidencia", {
            body: { type: "publication", image_path: imagenUrl, action_text: valorFinal, submission_id: idEnvioPublicacion }
        });
        if (errorRevision) {
            errorVerificacionHttp = Boolean(errorRevision.context?.status);
            throw new Error(await mensajeErrorFuncionEdge(errorRevision, "No se pudo registrar la publicación."));
        }
        if (!revision?.approved) {
            await supabase.storage.from("post-images").remove([rutaImagen]);
            rutaImagen = null;
            throw new Error(revision?.error || revision?.message || "La imagen no pudo validarse.");
        }
        rutaImagen = null; // La función ya registró la publicación y entregó los puntos.
        if (estadoEvidencia) { estadoEvidencia.hidden = false; estadoEvidencia.className = "reto-evidencia-estado exito"; estadoEvidencia.textContent = revision.message || "Publicación realizada."; }
        alert(revision.message || "Publicación realizada y puntos registrados.");
        invalidarVistasDeProgreso();
        await cargarUsuario();
        await cargarActividadReciente();
        await mostrarPublicar();
        guardarVistaActual();

    } catch (err) {
        if (rutaImagen && supabase && (!verificacionInvocada || errorVerificacionHttp)) await supabase.storage.from("post-images").remove([rutaImagen]).catch(() => {});
        console.error("Error al publicar:", err);
        const mensaje = mensajeErrorAmigable(err, "No se pudo revisar o guardar la publicación. Inténtalo de nuevo.");
        if (estadoEvidencia) { estadoEvidencia.hidden = false; estadoEvidencia.className = "reto-evidencia-estado error"; estadoEvidencia.textContent = mensaje; }
    } finally {
        if (botonPublicar) { botonPublicar.disabled = false; botonPublicar.textContent = "Publicar (+20 pts)"; }
    }
}

function evaluarOpcionPublicar(valor) {
    idEnvioPublicacion = null;
    const contenedorOtros = document.getElementById("contenedorCampoOtros");
    if (valor === "Otros") {
        contenedorOtros.style.display = "block";
    } else {
        contenedorOtros.style.display = "none";
    }
}

/* =========================================================
   RANKING Y RANGOS
   ========================================================= */

async function mostrarRanking() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    contenido.innerHTML = `<p style="text-align:center;">Cargando clasificación...</p>`;
    let supabaseRanking = null;
    let esAdminRanking = false;

    try {
        const supabase = await obtenerCliente();
        supabaseRanking = supabase;

        const { data: { user: usuarioActual } } = await obtenerUsuarioEcoReto(supabase);
        if (!usuarioActual) {
            if (!navigator.onLine) {
                contenido.innerHTML = '<section class="paginaInterna"><h1>Sin conexión</h1><p>Tu sesión no se ha cerrado. El ranking volverá a cargar cuando regrese Internet.</p></section>';
                return;
            }
            iniciarVistaDemo();
            mostrarAccesoDemo("ranking");
            return;
        }
        try {
            await supabase.rpc("ecoreto_archivar_rankings_inactivos");
            await supabase.rpc("ecoreto_registrar_actividad_rankings");
        } catch (errorActividad) {
            console.info("La rutina de actividad de rankings aún no está disponible:", errorActividad?.message || errorActividad);
        }
        let { data: competencias, error: errorCompetencias } = await supabase.from("ranking_competitions").select("id,name,scope,country,school,city,website,competition_type,invite_code").eq("is_active", true).order("name");
        if (errorCompetencias && /city|website|competition_type|invite_code|schema cache|PGRST204/i.test(String(errorCompetencias.message))) {
            const resultadoAntiguo = await supabase.from("ranking_competitions").select("id,name,scope,country,school").eq("is_active", true).order("name");
            competencias = resultadoAntiguo.data;
            errorCompetencias = resultadoAntiguo.error;
        }
        if (errorCompetencias) throw errorCompetencias;
        const { data: membresias, error: errorMembresias } = await supabase
            .from("ranking_competition_members")
            .select("competition_id")
            .eq("user_id", usuarioActual.id);
        if (errorMembresias) throw errorMembresias;
        const idsRankingsPropios = new Set((membresias || []).map(membresia => membresia.competition_id));
        // Los rankings privados aparecen solo si la cuenta tiene membresía.
        // El permiso de creador permite ver metadatos, pero no equivale a participar.
        const listaCompetencias = (competencias || []).filter(item => item.scope !== "custom" || idsRankingsPropios.has(item.id));
        try {
            const competenciaGuardada = localStorage.getItem("ecoreto_competencia_seleccionada") || localStorage.getItem("ecoreto_institucion_seleccionada");
            if (competenciaGuardada && listaCompetencias.some(item => item.id === competenciaGuardada)) competenciaRankingActual = competenciaGuardada;
            else if (competenciaGuardada) {
                competenciaRankingActual = "";
                if (localStorage.getItem("ecoreto_competencia_seleccionada") === competenciaGuardada) localStorage.removeItem("ecoreto_competencia_seleccionada");
                if (localStorage.getItem("ecoreto_institucion_seleccionada") === competenciaGuardada) localStorage.removeItem("ecoreto_institucion_seleccionada");
            }
        } catch { /* La selección institucional es opcional. */ }
        const { data: esAdmin } = await supabase.rpc("ecoreto_es_administrador");
        esAdminRanking = esAdmin === true;
        const competenciaSeleccionada = listaCompetencias.find(item => item.id === competenciaRankingActual) || null;
        if (!competenciaSeleccionada && competenciaRankingActual) competenciaRankingActual = "";
        const { data: usuarios, error } = await supabase.rpc("ecoreto_ranking_perfiles", {
            p_scope: "world",
            p_country: null,
            p_school: null,
            p_competition_id: competenciaSeleccionada?.id || null
        });

        if (error) throw error;

        const filasHTML = (usuarios || []).map((u, i) => {
            const puesto = i + 1;
            const esMiPerfil = u.id === usuarioActual?.id;

            let clasePosicion = "fila-tabla-ranking";
            if (esMiPerfil) {
                clasePosicion += " fila-mio";
            } else if (puesto <= 3) {
                clasePosicion += " fila-podio";
            } else if (puesto <= 10) {
                clasePosicion += " fila-top10";
            } else {
                clasePosicion += " fila-normal";
            }

            return `
                <div class="${clasePosicion}">
                    <span class="col-rk">#${puesto}</span>
                    <span class="col-usuario">
                        <img src="${escaparHTML(u.avatar_url || AVATAR_POR_DEFECTO)}" alt="Foto de perfil de ${escaparHTML(u.username || "EcoAmigo")}" class="avatar-ranking">
                        <strong>${escaparHTML(u.username || "EcoAmigo")}${esMiPerfil ? ' <span class="etiqueta-mi-perfil">Tú</span>' : ''}</strong>
                    </span>
                    <span class="col-rango"><span class="badge-rango">${escaparHTML(u.rango || "Semilla Verde")}</span></span>
                    <span class="col-puntos">${u.puntos} pts</span>
                </div>
            `;
        }).join('');

        const nombreRanking = competenciaSeleccionada?.name || "Ranking mundial";
        const opcionesCompetencias = listaCompetencias.map(item => {
            const contexto = [item.city, item.country].filter(Boolean).join(" · ");
            const tipo = item.scope !== "custom" ? (item.scope === "country" ? "País" : "Global") : (item.competition_type === "friends" ? "Amigos" : "Institución");
            return `<option value="${escaparHTML(item.id)}" ${item.id === competenciaRankingActual ? "selected" : ""}>${tipo} · ${escaparHTML(item.name)}${contexto ? ` · ${escaparHTML(contexto)}` : ""}</option>`;
        }).join("");
        let websiteCompetencia = "";
        if (competenciaSeleccionada?.website) {
            try {
                const url = new URL(competenciaSeleccionada.website);
                if (["https:", "http:"].includes(url.protocol)) websiteCompetencia = `<a href="${escaparHTML(url.href)}" target="_blank" rel="noopener noreferrer">Sitio oficial ↗</a>`;
            } catch { /* Un enlace inválido no se publica en la ficha. */ }
        }
        const fichaInstitucion = competenciaSeleccionada
            ? `<p class="ranking-institucion-detalle">${[competenciaSeleccionada.city, competenciaSeleccionada.country].filter(Boolean).map(escaparHTML).join(" · ")}${websiteCompetencia ? `${competenciaSeleccionada.city || competenciaSeleccionada.country ? " · " : ""}${websiteCompetencia}` : ""}</p>`
            : "";
        let mensajeInstitucion = "";
        try {
            mensajeInstitucion = localStorage.getItem("ecoreto_mensaje_institucion") || "";
            if (mensajeInstitucion) localStorage.removeItem("ecoreto_mensaje_institucion");
        } catch { /* El aviso es opcional; los rankings siguen funcionando sin almacenamiento local. */ }

        contenido.innerHTML = `
            <section class="paginaInterna">
                <span class="etiqueta">COMPETENCIAS Y TABLA DE LÍDERES</span>
                <h1>${escaparHTML(nombreRanking)} 🏆</h1>
                ${fichaInstitucion}
                <label class="ranking-selector-label" for="selectorCompetenciaRanking">Ver clasificación</label>
                <div class="filtros-ranking" role="group" aria-label="Filtrar ranking">
                    <select id="selectorCompetenciaRanking" aria-label="Elegir clasificación" onchange="cambiarCompetenciaRanking(this.value)">
                        <option value="global" ${!competenciaSeleccionada ? "selected" : ""}>Ranking global</option>
                        ${opcionesCompetencias}
                    </select>
                </div>
                ${competenciaSeleccionada?.scope === "custom" && competenciaSeleccionada.invite_code ? `<div class="ranking-codigo-seleccionado"><div><span>Código para compartir</span><strong id="codigoRankingActivo">${escaparHTML(competenciaSeleccionada.invite_code)}</strong></div><button type="button" onclick="copiarCodigoRankingSeleccionado()">Copiar código</button><span id="estadoCodigoRanking" role="status" aria-live="polite"></span></div>` : ""}
                <p class="rankingAviso">Tu vista global incluye a toda la comunidad. Los grupos de amigos aparecen en el selector y empiezan desde cero: las acciones suman a tu total general y a los grupos donde ya participabas cuando las realizaste.</p>
                ${mensajeInstitucion ? `<p class="ranking-institucion-aviso" role="status">${escaparHTML(mensajeInstitucion)}</p>` : ""}
                <p class="ranking-total-participantes" aria-live="polite"><strong>${(usuarios || []).length}</strong> ${(usuarios || []).length === 1 ? "persona participa" : "personas participan"} en esta clasificación</p>
                <div class="tabla-estilo-fifa">
                    <div class="cabecera-tabla"><span>RK</span><span>USUARIO</span><span>RANGO</span><span>PUNTOS</span></div>
                    <div class="cuerpo-tabla">${filasHTML || '<p style="text-align:center; padding: 20px;">No hay usuarios registrados.</p>'}</div>
                </div>
                ${competenciaSeleccionada?.scope === "custom" ? `<div class="ranking-salir-accion"><button type="button" class="boton-salir-ranking" onclick="salirRankingActual('${escaparHTML(competenciaSeleccionada.id)}')">Salir de este ranking</button><span id="estadoSalirRanking" role="status" aria-live="polite"></span></div>` : ""}
                <details class="ranking-acciones-detalle ranking-opciones-comunidad"><summary>Rankings privados: amigos e instituciones</summary>
                    <p class="ranking-privados-ayuda">Puedes participar o crear hasta <strong>5 rankings privados activos</strong> en total. Cada grupo de amigos empieza desde cero y suma puntos por las acciones que sus integrantes realizan mientras pertenecen a él. Sal de uno para liberar un cupo. Los grupos sin actividad durante 6 meses se archivan automáticamente.</p>
                    <div class="ranking-privados-grid">
                        <section class="ranking-unirse-form">
                            <h2>Ranking con amigos</h2><p>Crea un grupo o únete al grupo privado de tus amistades.</p>
                            <form onsubmit="event.preventDefault(); crearRankingAmigos();"><label for="nombreRankingAmigos">Crear grupo</label><div><input id="nombreRankingAmigos" type="text" minlength="3" maxlength="70" required placeholder="Ejemplo: Amigos del planeta"><button type="submit">Crear grupo</button></div></form>
                            <p id="estadoRankingAmigos" role="status" aria-live="polite"></p>
                            ${ultimoCodigoRankingAmigos ? `<p class="ranking-codigo-creado" role="status">Código de tu grupo: <strong id="codigoRankingAmigos">${escaparHTML(ultimoCodigoRankingAmigos)}</strong> <button type="button" onclick="copiarCodigoRankingAmigos()">Copiar código</button></p>` : ""}
                            <form class="ranking-unirse-amigos" onsubmit="event.preventDefault(); unirseRankingAmigos();"><label for="codigoRankingAmigosEntrada">Unirme a un grupo</label><div><input id="codigoRankingAmigosEntrada" required maxlength="40" placeholder="Código del grupo"><button type="submit">Unirme</button></div></form><p id="estadoUnirseRankingAmigos" role="status" aria-live="polite"></p>
                        </section>
                        <section class="ranking-opciones-institucion"><div><h2>Ranking institucional</h2><p>Entra con el código de tu institución o solicita crear un ranking para tu comunidad.</p></div><a class="enlace-institucion enlace-institucion-ranking" href="${rutaInstitucion()}">Solicitar un ranking institucional →</a></section>
                    </div>
                </details>
                ${ultimaInvitacionCreada ? `<p class="ranking-codigo-creado" role="status">Código de la competición que acabas de crear: <strong id="codigoCompetenciaCreada">${escaparHTML(ultimaInvitacionCreada)}</strong>. <button type="button" onclick="copiarCodigoCompetencia()">Copiar código</button></p>` : ""}
                ${esAdmin ? `<details class="ranking-admin-panel"><summary>Administración de rankings</summary><p>Este panel solo está disponible para el equipo de EcoReto. Aquí puedes crear clasificaciones generales y revisar las solicitudes institucionales; las cuentas normales no lo ven. Un ranking nacional o mundial se muestra a todas las personas con cuenta. Los rankings de instituciones siguen siendo privados y se crean al aprobar una solicitud.</p><form class="ranking-admin-form ranking-admin-create-form" onsubmit="event.preventDefault(); crearCompetenciaRanking();">
                    <h2>Crear una clasificación</h2>
                    <label for="nombreNuevaCompetencia">Nombre del ranking</label>
                    <input id="nombreNuevaCompetencia" type="text" maxlength="100" required placeholder="Ejemplo: Copa Verde 2026">
                    <label for="ambitoNuevaCompetencia">Alcance</label>
                    <select id="ambitoNuevaCompetencia" onchange="actualizarCamposCompetencia()">
                        <option value="world">Mundial</option><option value="country">Nacional</option><option value="custom">Grupo privado por invitación</option>
                    </select>
                    <p id="ayudaAlcanceCompetencia" class="ayuda-alcance-competencia" role="status" aria-live="polite">Mundial: todas las personas con cuenta podrán encontrar esta clasificación. Incluirá a la comunidad completa.</p>
                    <label for="paisNuevaCompetencia">País</label><input id="paisNuevaCompetencia" type="text" maxlength="80" placeholder="Ejemplo: Colombia">
                    <button type="submit">Crear y generar código</button>
                    <p id="resultadoNuevaCompetencia" role="status" aria-live="polite"></p>
                </form><section class="ranking-admin-form solicitudes-instituciones-admin"><h2>Solicitudes institucionales</h2><p>Revisa la entidad, el dominio del correo y los datos de contacto antes de aprobar.</p><div id="solicitudesInstitucionAdmin" aria-live="polite"></div></section></details>` : ""}
            </section>
        `;

        if (esAdmin) {
            actualizarCamposCompetencia();
            await cargarSolicitudesInstitucion();
        }

        contenido.querySelectorAll(".avatar-ranking").forEach(imagen => {
            imagen.onerror = () => { imagen.onerror = null; imagen.src = AVATAR_POR_DEFECTO; };
        });

    } catch (err) {
        console.error("Error al cargar ranking:", err);
        const detalle = String(err?.message || "");
        const mensaje = /ecoreto_ranking_perfiles|ranking_competitions|ecoreto_es_administrador|schema cache|could not find the function/i.test(detalle)
            ? "No pudimos cargar las clasificaciones ahora. Inténtalo de nuevo más tarde."
            : mensajeErrorAmigable(err, "No se pudo cargar el ranking. Inténtalo de nuevo más tarde.");
        contenido.innerHTML = `<section class="paginaInterna"><h1>No pudimos abrir el ranking</h1><p role="alert">${escaparHTML(mensaje)}</p><div class="ranking-error-acciones"><button class="botonPrincipal" type="button" onclick="mostrarRanking()">Reintentar</button><button class="btn-secundario" type="button" onclick="mostrarSeccion('inicio')">Volver al inicio</button></div></section>`;
    }
}

function cambiarCompetenciaRanking(valor) {
    if (valor === "global") {
        competenciaRankingActual = "";
        try {
            localStorage.removeItem("ecoreto_competencia_seleccionada");
            localStorage.removeItem("ecoreto_institucion_seleccionada");
        } catch { /* La selección global funciona sin almacenamiento local. */ }
    } else {
        competenciaRankingActual = valor;
        try {
            localStorage.setItem("ecoreto_competencia_seleccionada", valor);
            localStorage.removeItem("ecoreto_institucion_seleccionada");
        } catch { /* La selección sigue vigente durante esta vista. */ }
    }
    mostrarRanking();
}

function actualizarCamposCompetencia() {
    const alcance = document.getElementById("ambitoNuevaCompetencia")?.value;
    const pais = document.getElementById("paisNuevaCompetencia");
    const colegio = document.getElementById("colegioNuevaCompetencia");
    const boton = document.querySelector(".ranking-admin-create-form button[type='submit']");
    if (pais) { pais.required = ["country", "school"].includes(alcance); pais.disabled = !pais.required; }
    if (colegio) { colegio.required = alcance === "school"; colegio.disabled = !colegio.required; }
    if (boton) boton.textContent = alcance === "custom" ? "Crear grupo privado y generar código" : "Crear clasificación pública";
    const ayuda = document.getElementById("ayudaAlcanceCompetencia");
    if (ayuda) {
        ayuda.textContent = alcance === "world"
            ? "Mundial: todas las personas con cuenta podrán encontrar esta clasificación. Incluirá a la comunidad completa."
            : alcance === "country"
                ? "Nacional: todas las personas podrán encontrarla; la tabla incluirá perfiles que tengan seleccionado este país."
                : "Grupo privado: solo aparecerá para quien lo cree o se una con el código de invitación.";
    }
}

async function copiarCodigoCompetencia() {
    if (!ultimaInvitacionCreada) return;
    try {
        await navigator.clipboard.writeText(ultimaInvitacionCreada);
        const estado = document.getElementById("resultadoNuevaCompetencia");
        if (estado) estado.textContent = "Código copiado.";
    } catch {
        const codigo = document.getElementById("codigoCompetenciaCreada");
        if (codigo) { const rango = document.createRange(); rango.selectNodeContents(codigo); getSelection()?.removeAllRanges(); getSelection()?.addRange(rango); }
    }
}

async function copiarCodigoRankingAmigos() {
    try {
        await navigator.clipboard.writeText(ultimoCodigoRankingAmigos);
        const estado = document.getElementById("estadoRankingAmigos");
        if (estado) estado.textContent = "Código copiado. Compártelo con las personas que quieras invitar.";
    } catch {
        const codigo = document.getElementById("codigoRankingAmigos");
        if (codigo) { const rango = document.createRange(); rango.selectNodeContents(codigo); getSelection()?.removeAllRanges(); getSelection()?.addRange(rango); }
        const estado = document.getElementById("estadoRankingAmigos");
        if (estado) estado.textContent = "Seleccionamos el código; cópialo para compartirlo.";
    }
}

async function crearRankingAmigos() {
    const nombre = document.getElementById("nombreRankingAmigos")?.value.trim() || "";
    const estado = document.getElementById("estadoRankingAmigos");
    if (nombre.length < 3 || nombre.length > 70 || !nombreRespetuoso(nombre)) {
        if (estado) estado.textContent = "Escribe un nombre respetuoso de entre 3 y 70 caracteres.";
        return;
    }
    if (estado) estado.textContent = "Creando tu grupo…";
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) { if (estado) estado.textContent = "Inicia sesión para crear un grupo e invitar a tus amistades."; return; }
        const { data, error } = await supabase.rpc("ecoreto_crear_ranking_amigos", { p_nombre: nombre });
        if (error) throw error;
        const creado = Array.isArray(data) ? data[0] : data;
        if (!creado?.competition_id || !creado?.invite_code) throw new Error("No se recibió el código del grupo.");
        ultimoCodigoRankingAmigos = creado.invite_code;
        try { sessionStorage.setItem("ecoreto_ultimo_codigo_ranking_amigos", ultimoCodigoRankingAmigos); } catch { /* El código también aparece en pantalla para copiarlo ahora. */ }
        competenciaRankingActual = creado.competition_id;
        try { localStorage.setItem("ecoreto_competencia_seleccionada", creado.competition_id); } catch { /* La vista puede cambiar al grupo durante esta sesión. */ }
        await mostrarRanking();
    } catch (error) {
        console.error("No se pudo crear el ranking con amigos:", error);
        const detalle = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
        if (/Ya tienes cinco rankings privados activos/i.test(detalle)) {
            if (estado) estado.textContent = "Ya tienes cinco grupos privados activos. Puedes invitar amistades a uno de esos grupos.";
        } else if (/ecoreto_crear_ranking_amigos|schema cache|PGRST202/i.test(detalle)) {
            if (estado) estado.textContent = "La base de datos todavía no tiene activa la creación de grupos. El administrador debe ejecutar la actualización de EcoReto en Supabase y luego podrás intentarlo otra vez.";
        } else if (/42P01|42703|relation .* does not exist|column .* does not exist/i.test(`${error?.code || ""} ${detalle}`)) {
            if (estado) estado.textContent = "El servicio de grupos necesita una actualización. Tus datos no se modificaron; inténtalo más tarde.";
        } else if (/42501|permission denied|not authorized/i.test(`${error?.code || ""} ${detalle}`)) {
            if (estado) estado.textContent = "No pudimos autorizar la creación del grupo. Cierra sesión, vuelve a entrar e inténtalo otra vez.";
        } else if (String(error?.code || "") === "23505") {
            if (estado) estado.textContent = "No pudimos generar un código para el grupo ahora. Vuelve a intentarlo.";
        } else if (estado) {
            estado.textContent = mensajeErrorAmigable(error, "No pudimos crear el grupo ahora. Inténtalo de nuevo.");
        }
    }
}

async function unirseRankingAmigos() {
    const codigo = document.getElementById("codigoRankingAmigosEntrada")?.value.trim() || "";
    const estado = document.getElementById("estadoUnirseRankingAmigos");
    if (!codigo) { if (estado) estado.textContent = "Escribe el código del grupo."; return; }
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) { if (estado) estado.innerHTML = 'Inicia sesión para unirte a un grupo. <a href="' + rutaLogin() + '">Iniciar sesión</a>'; return; }
        if (estado) estado.textContent = "Validando el código…";
        const { data, error } = await supabase.rpc("ecoreto_unirse_ranking_amigos", { p_codigo: codigo });
        if (error) throw error;
        const grupo = data?.[0];
        if (!grupo?.competition_id) throw new Error("No encontramos un grupo de amigos activo con ese código.");
        competenciaRankingActual = grupo.competition_id;
        try { localStorage.setItem("ecoreto_competencia_seleccionada", grupo.competition_id); } catch { /* La selección puede conservarse solo en esta sesión. */ }
        if (estado) estado.textContent = `Ya estás en ${grupo.competition_name}.`;
        await mostrarRanking();
    } catch (error) {
        console.error("No se pudo unir al ranking de amigos:", error);
        const detalle = String(error?.message || "");
        const texto = /cinco rankings privados/i.test(detalle)
            ? "Ya participas en cinco rankings privados activos. Selecciona uno arriba y usa “Salir de este ranking” para aceptar esta invitación."
            : /ecoreto_unirse_ranking_amigos|schema cache|PGRST202/i.test(detalle)
            ? "Esta función aún no está disponible. Aplica la versión actual de supabase/setup.sql y vuelve a intentarlo."
            : mensajeErrorAmigable(error, "No pudimos completar la entrada al grupo. Revisa el código e inténtalo de nuevo.");
        if (estado) estado.textContent = texto;
    }
}

async function salirRankingActual(competitionId) {
    if (!competitionId) return;
    if (!await confirmarAccionEcoReto("¿Quieres salir de este ranking? Dejarás de aparecer en la clasificación. Para volver a entrar, necesitarás el código de invitación.")) return;
    const boton = document.querySelector(".boton-salir-ranking");
    const aviso = document.getElementById("estadoSalirRanking");
    if (boton) { boton.disabled = true; boton.setAttribute("aria-busy", "true"); }
    if (aviso) aviso.textContent = "Saliendo del ranking…";
    try {
        const supabase = await obtenerCliente();
        const { error } = await supabase.rpc("ecoreto_salir_ranking", { p_competition_id: competitionId });
        if (error) throw error;
        competenciaRankingActual = "";
        try {
            if (localStorage.getItem("ecoreto_competencia_seleccionada") === competitionId) localStorage.removeItem("ecoreto_competencia_seleccionada");
            if (localStorage.getItem("ecoreto_institucion_seleccionada") === competitionId) localStorage.removeItem("ecoreto_institucion_seleccionada");
        } catch { /* La selección local es opcional. */ }
        await mostrarRanking();
    } catch (error) {
        console.error("No se pudo salir del ranking:", error);
        const detalle = String(error?.message || "");
        const codigo = String(error?.code || "sin código");
        let mensaje = "No pudimos salir de este ranking ahora. No se hizo ningún cambio; inténtalo de nuevo más tarde.";
        if (/No participas en ese ranking/i.test(detalle)) {
            competenciaRankingActual = "";
            try {
                if (localStorage.getItem("ecoreto_competencia_seleccionada") === competitionId) localStorage.removeItem("ecoreto_competencia_seleccionada");
                if (localStorage.getItem("ecoreto_institucion_seleccionada") === competitionId) localStorage.removeItem("ecoreto_institucion_seleccionada");
                localStorage.setItem("ecoreto_mensaje_institucion", "Esta cuenta ya no participa en ese ranking. La vista se actualizó.");
            } catch { /* La limpieza de selección local es opcional. */ }
            await mostrarRanking();
            return;
        }
        else if (String(error?.code || "") === "42501") mensaje = "No pudimos completar la salida con esta cuenta. Cierra sesión, vuelve a entrar e inténtalo de nuevo.";
        let esAdmin = false;
        try {
            const supabase = await obtenerCliente();
            const resultadoAdmin = await supabase.rpc("ecoreto_es_administrador");
            esAdmin = resultadoAdmin.data === true;
        } catch { /* La información técnica se oculta si no se puede confirmar la cuenta administradora. */ }
        if (aviso) {
            aviso.textContent = mensaje;
            if (esAdmin) {
                const diagnostico = document.createElement("details");
                diagnostico.className = "ranking-error-tecnico";
                const titulo = document.createElement("summary");
                titulo.textContent = "Detalles técnicos (solo administrador)";
                const detalleTecnico = document.createElement("code");
                detalleTecnico.textContent = `${codigo}: ${detalle || "Error sin mensaje"}`;
                diagnostico.append(titulo, detalleTecnico);
                if (/ecoreto_salir_ranking|schema cache|PGRST202|42883|42703/i.test(detalle) || ["PGRST202", "42883", "42703"].includes(codigo)) {
                    const instruccion = document.createElement("p");
                    instruccion.textContent = "La función de salida no está publicada o el caché de API está desactualizado. Ejecuta supabase/20261016-ranking-exit.sql en el SQL Editor y recarga con Ctrl+F5.";
                    diagnostico.append(instruccion);
                }
                aviso.append(document.createElement("br"), diagnostico);
            }
        }
        if (boton) { boton.disabled = false; boton.removeAttribute("aria-busy"); }
    }
}

function confirmarAccionEcoReto(mensaje) {
    return new Promise(resolve => {
        let dialogo = document.getElementById("confirmacionEcoReto");
        if (!dialogo) {
            dialogo = document.createElement("dialog");
            dialogo.id = "confirmacionEcoReto";
            dialogo.className = "alerta-ecoreto";
            dialogo.setAttribute("aria-labelledby", "confirmacionEcoRetoTitulo");
            dialogo.innerHTML = '<div class="alerta-ecoreto-contenido"><span class="alerta-ecoreto-marca" aria-hidden="true">🌱</span><h2 id="confirmacionEcoRetoTitulo">Confirmar acción</h2><p id="confirmacionEcoRetoMensaje"></p><div class="alerta-ecoreto-acciones"><button type="button" data-respuesta="no" class="secundario">Cancelar</button><button type="button" data-respuesta="si">Sí, salir</button></div></div>';
            document.body.append(dialogo);
        }
        dialogo.querySelector("#confirmacionEcoRetoMensaje").textContent = mensaje;
        const resolver = valor => { dialogo.close(); resolve(valor); };
        dialogo.querySelector('[data-respuesta="no"]').onclick = () => resolver(false);
        dialogo.querySelector('[data-respuesta="si"]').onclick = () => resolver(true);
        dialogo.oncancel = evento => { evento.preventDefault(); resolver(false); };
        dialogo.showModal();
        dialogo.querySelector('[data-respuesta="no"]').focus();
    });
}

async function copiarCodigoRankingSeleccionado() {
    const seleccionado = document.querySelector("#codigoRankingActivo")?.textContent?.trim() || "";
    if (!seleccionado) return;
    const estado = document.getElementById("estadoCodigoRanking");
    try {
        await navigator.clipboard.writeText(seleccionado);
        if (estado) estado.textContent = "Código copiado. Ya puedes compartirlo.";
    } catch {
        const rango = document.createRange();
        rango.selectNodeContents(document.getElementById("codigoRankingActivo"));
        getSelection()?.removeAllRanges();
        getSelection()?.addRange(rango);
        if (estado) estado.textContent = "Seleccionamos el código; cópialo para compartirlo.";
    }
}

async function crearCompetenciaRanking() {
    const name = document.getElementById("nombreNuevaCompetencia")?.value.trim();
    const scope = document.getElementById("ambitoNuevaCompetencia")?.value;
    const country = document.getElementById("paisNuevaCompetencia")?.value.trim() || null;
    const school = document.getElementById("colegioNuevaCompetencia")?.value.trim() || null;
    const estado = document.getElementById("resultadoNuevaCompetencia");
    if (!name || name.length < 3) { if (estado) estado.textContent = "El nombre debe tener al menos 3 caracteres."; return; }
    if (["country", "school"].includes(scope) && !country) { if (estado) estado.textContent = "Escribe el país para este ranking."; return; }
    if (scope === "school" && !school) { if (estado) estado.textContent = "Escribe el colegio o institución."; return; }
    if (estado) estado.textContent = "Creando competición…";
    try {
        const supabase = await obtenerCliente();
        const { data, error } = await supabase.rpc("ecoreto_crear_competencia", {
            p_nombre: name, p_ambito: scope, p_pais: country, p_colegio: school
        });
        if (error) throw error;
        const created = Array.isArray(data) ? data[0] : data;
        if (!created?.competition_id) throw new Error("No se recibió confirmación del servidor.");
        competenciaRankingActual = created.competition_id;
        ultimaInvitacionCreada = created.invite_code || "";
        await mostrarRanking();
    } catch (error) {
        console.error("No se pudo crear la competición:", error);
        if (estado) estado.textContent = mensajeErrorAmigable(error, "No pudimos crear la clasificación ahora. Inténtalo de nuevo más tarde.");
    }
}

function abrirAyuda() {
    document.getElementById("dialogoAyuda")?.showModal();
}

function cerrarAyuda() {
    document.getElementById("dialogoAyuda")?.close();
}

function responderAyuda(tema) {
    const respuestas = {
        registro: "Para entrar, usa el mismo correo y contraseña con los que creaste tu cuenta. Si olvidaste la contraseña, toca «Olvidé mi contraseña», revisa ese correo y abre el enlace más reciente. Si el enlace ya venció, solicita uno nuevo. Nunca compartas tu contraseña.",
        puntos: "En Retos, abre una actividad, elige o toma una foto y pulsa «Enviar evidencia». En Publicar, describe la acción, adjunta una foto y pulsa «Publicar». Por ahora, los puntos se registran automáticamente al enviar la evidencia: cada publicación suma 20 puntos y cada reto suma los puntos indicados en su tarjeta.",
        ranking: "En Ranking puedes consultar la clasificación general o elegir un grupo privado al que ya te uniste. Para crear uno con amistades, escribe un nombre y pulsa «Crear grupo»; comparte el código para que se unan. Los puntos del grupo empiezan en cero y cuentan desde que eres integrante.",
        error: "Cuéntanos en qué pantalla estabas, qué botón pulsaste y qué mensaje apareció. Puedes adjuntar una captura. El reporte se guarda para que el equipo lo revise; si el correo de soporte está configurado, también se envía un aviso. No incluyas contraseñas ni información privada."
    };
    const elemento = document.getElementById("respuestaAyuda");
    if (elemento) elemento.textContent = respuestas[tema] || "Cuéntanos más para orientarte.";
    document.querySelectorAll(".ayuda-opciones button").forEach(boton => {
        const coincide = boton.getAttribute("onclick") === `responderAyuda('${tema}')`;
        boton.setAttribute("aria-pressed", String(coincide));
    });
}

async function enviarReporteAyuda() {
    const descripcion = document.getElementById("descripcionReporteAyuda")?.value.trim();
    const archivo = document.getElementById("capturaReporteAyuda")?.files?.[0] || null;
    const estado = document.getElementById("estadoReporteAyuda");
    const boton = document.querySelector(".ayuda-diagnostico button[onclick='enviarReporteAyuda()']");
    if (!descripcion || descripcion.length < 10) { if (estado) estado.textContent = "Describe el problema con al menos 10 caracteres."; return; }
    if (descripcion.length > 1500) { if (estado) estado.textContent = "El mensaje supera el máximo de 1.500 caracteres."; return; }
    if (archivo && (!/^image\/(png|jpeg|webp)$/.test(archivo.type) || archivo.size > 5 * 1024 * 1024)) {
        if (estado) estado.textContent = "Adjunta una imagen PNG, JPG o WebP de máximo 5 MB.";
        return;
    }
    if (estado) estado.textContent = "Enviando tu reporte al equipo de EcoReto…";
    if (boton) boton.disabled = true;
    let rutaCaptura = null;
    let supabase;
    let reportePersistido = false;
    try {
        supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) throw new Error("Inicia sesión para enviar un reporte privado al equipo de EcoReto.");
        if (archivo) {
            const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            rutaCaptura = `${user.id}/${id}.${archivo.type === "image/jpeg" ? "jpg" : archivo.type.split("/")[1]}`;
            const { error } = await supabase.storage.from("support-attachments").upload(rutaCaptura, archivo, { contentType: archivo.type, upsert: false });
            if (error) throw error;
        }
        const { data: reporte, error: errorReporte } = await supabase.from("support_reports").insert({
            user_id: user.id, description: descripcion, screenshot_path: rutaCaptura
        }).select("id").single();
        if (errorReporte) throw errorReporte;
        reportePersistido = true;
        const { data: resultadoSoporte, error: errorSoporte } = await supabase.functions.invoke("diagnosticar-error", { body: { report_id: reporte.id } });
        if (errorSoporte) {
            if (estado) estado.textContent = "Tu reporte quedó guardado para que el equipo de EcoReto lo revise. No pudimos enviar el aviso por correo en este momento.";
            return;
        }
        const partesResultado = [];
        if (resultadoSoporte?.alert_sent && resultadoSoporte?.reply_to_user) partesResultado.push("El equipo recibió el reporte. Puede responder al correo de tu cuenta.");
        else if (resultadoSoporte?.alert_sent) partesResultado.push("El equipo recibió el reporte.");
        else if (resultadoSoporte?.email_configured) partesResultado.push("Tu reporte quedó guardado, pero el aviso por correo no pudo enviarse. El equipo podrá revisarlo en EcoReto.");
        else partesResultado.push("Tu reporte quedó guardado para que el equipo de EcoReto lo revise. El aviso por correo todavía no está configurado.");
        if (estado) estado.textContent = partesResultado.join("\n\n");
        const campo = document.getElementById("descripcionReporteAyuda");
        const inputCaptura = document.getElementById("capturaReporteAyuda");
        if (campo) campo.value = "";
        if (inputCaptura) inputCaptura.value = "";
    } catch (error) {
        if (rutaCaptura && supabase && !reportePersistido) await supabase.storage.from("support-attachments").remove([rutaCaptura]).catch(() => {});
        console.error("No se pudo completar el reporte de soporte:", error);
        if (estado) estado.textContent = reportePersistido
            ? "Tu reporte quedó guardado para que el equipo de EcoReto lo revise."
            : mensajeErrorAmigable(error, "No pudimos enviar el reporte. Inténtalo de nuevo más tarde.");
    } finally {
        if (boton) boton.disabled = false;
    }
}

async function mostrarRangos() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    let puntos = 0;
    let rango = obtenerRango(0);

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await obtenerUsuarioEcoReto(supabase);

        if (user) {
            const { data: perfil } = await supabase
                .from("profiles")
                .select("puntos,rango")
                .eq("id", user.id)
                .maybeSingle();

            puntos = Number(perfil?.puntos) || 0;
            rango = perfil?.rango || obtenerRango(puntos);
        }
    } catch (error) {
        console.error("Error cargando rangos:", error);
    }

    const siguiente = obtenerSiguienteRango(puntos);
    const total = siguiente.meta - siguiente.anterior;
    const progreso = total > 0
        ? Math.max(0, Math.min(100, ((puntos - siguiente.anterior) / total) * 100))
        : 100;

    const listaRangos = [
        ["rango-semilla", "🌱 Semilla Verde", "0 - 99 pts", 0],
        ["rango-brote", "🌿 Brote Ecológico", "100 - 399 pts", 100],
        ["rango-arbol", "🌳 Árbol Robusto", "400 - 799 pts", 400],
        ["rango-bosque", "🌲 Bosque Protector", "800 - 999 pts", 800],
        ["rango-ecosistema", "🏞️ Ecosistema", "1000 - 1499 pts", 1000],
        ["rango-protector", "🛡️ Protector Ambiental", "1500 - 1999 pts", 1500],
        ["rango-Heroe", "🦸 Héroe Ecológico", "2000 - 2499 pts", 2000],
        ["rango-Leyenda", "🏆 Leyenda Planetaria", "2500 - 3499 pts", 2500],
        ["rango-guardian", "👑 Guardián del Planeta", "3500 - 4999 pts", 3500],
        ["rango-ecoreto", "🔰 EcoReto", "5000+ pts", 5000]
    ];
    const indiceRango = listaRangos.reduce((ultimo, item, indice) => puntos >= item[3] ? indice : ultimo, 0);
    const tarjetasRango = listaRangos.map((item, indice) => `
        <article class="retoGrande ${item[0]} ${indice === indiceRango ? "rango-actual" : ""} ${indice < indiceRango ? "rango-superado" : ""}">
            <h2>${item[1]}</h2><p>${item[2]}</p>
            ${indice === indiceRango ? '<span class="rango-etiqueta-actual">RANGO ACTUAL</span>' : ""}
        </article>
    `).join("");

    contenido.innerHTML = `
        <section class="paginaInterna">
            <span class="etiqueta">PROGRESO</span>
            <h1>Tu rango 🏆</h1>
            <p>Avanza con acciones.</p>

            <div class="rankingPrincipal tarjetaPrincipalActual tarjeta-rango-dinamica" style="--tono-rango:${indiceRango * 34}; padding-top: 40px; padding-bottom: 40px; margin-top: 30px;">
                 <span class="badge-tu-rango">TU RANGO ACTUAL</span>
                 <h2>${escaparHTML(rango)}</h2>
                 <strong>⭐ ${puntos} puntos</strong>
                 <p>${puntos >= 5000 ? "¡Has alcanzado el rango máximo!" : `Siguiente: ${escaparHTML(siguiente.nombre)} · ${Math.max(0, siguiente.meta - puntos)} pts`}</p>
            <div class="barraProgreso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progreso)}">
                <div class="barraProgresoValor" style="width:${progreso}%"></div>
            </div>
       </div>

            <div class="grid-rangos">${tarjetasRango}</div>
        </section>`;
}

/* =========================================================
   SISTEMA DE RETOS
   ========================================================= */

async function mostrarRetos() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    contenido.innerHTML = `<p style="text-align:center;">Cargando retos...</p>`;

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await obtenerUsuarioEcoReto(supabase);

        // 1. Obtener lista de retos
        const { data: listaRetos, error: errRetos } = await supabase
            .from("retos")
            .select("*");

        if (errRetos) throw errRetos;

        // 2. Obtener historial del usuario
        let historialCompletados = [];
        if (user) {
            const { data: completados } = await supabase
                .from("retos_completados")
                .select("reto_id, completado_el")
                .eq("user_id", user.id);

            if (completados) historialCompletados = completados;
        }

        const estaBloqueado = (reto) => {
            const registro = historialCompletados.find(h => h.reto_id === reto.id);
            if (!registro) return false;

            const completadoEl = registro.completado_el || registro.completed_at || registro.created_at;
            if (normalizarTipoReto(reto.tipo) === "diario") return esMismoDia(completadoEl);
            if (normalizarTipoReto(reto.tipo) === "semanal") return esMismaSemana(completadoEl);
            if (normalizarTipoReto(reto.tipo) === "fugaz") {
                return ventanaRetoFugaz?.reto?.id === reto.id && new Date(completadoEl).getTime() >= ventanaRetoFugaz.inicio;
            }
            return true;
        };

        const retosDeInstitucion = (listaRetos || []).filter(r => Boolean(r.competition_id));
        const retosPublicos = (listaRetos || []).filter(r => !r.competition_id);
        const retosDiarios = retosPublicos.filter(r => normalizarTipoReto(r.tipo) === "diario");
        const retosSemanales = retosPublicos.filter(r => normalizarTipoReto(r.tipo) === "semanal");
        const retosFugaces = retosPublicos.filter(r => normalizarTipoReto(r.tipo) === "fugaz");
        const ventanaRetoFugaz = obtenerVentanaRetoFugaz(retosFugaces);

        const diaActual = Math.floor(Date.now() / 86400000);
        const semanaActual = Math.floor(diaActual / 7);
        const retoDiarioHoy = retosDiarios.length ? [retosDiarios[diaActual % retosDiarios.length]] : [];
        const retoSemanalHoy = retosSemanales.length ? [retosSemanales[semanaActual % retosSemanales.length]] : [];
        const retoFugazHoy = ventanaRetoFugaz ? [ventanaRetoFugaz.reto] : [];

        contenido.innerHTML = `
            <section class="paginaInterna">
                <span class="etiqueta">DESAFÍOS</span>
                <h1>Reto Ecológico Activo 🎯</h1>
                <p>Completa las acciones para sumar puntos y subir de rango.</p>

                <h2 style="margin-top: 25px; color: #ef6c00;">🔥 Reto Fugaz (Tiempo limitado)</h2>
                <div class="grid-retos">${generarHTMLTarjetas(retoFugazHoy, estaBloqueado, user)}</div>
                ${ventanaRetoFugaz ? '<div class="cronometro-aviso">⏱️ Este reto termina en <strong id="temporizadorFugaz">--:--:--</strong></div>' : '<p class="mensaje-reto-vacio">No hay retos fugaces activos. Vuelve pronto.</p>'}

                <h2 style="margin-top: 25px; color: #2e7d32;">⚡ Reto del Día</h2>
                <div class="grid-retos">${generarHTMLTarjetas(retoDiarioHoy, estaBloqueado, user)}</div>

                <h2 style="margin-top: 35px; color: #1565c0;">📅 Reto de la Semana</h2>
                <div class="grid-retos">${generarHTMLTarjetas(retoSemanalHoy, estaBloqueado, user)}</div>

                ${retosDeInstitucion.length ? `<h2 class="retos-institucionales-titulo">🏫 Retos de tus instituciones</h2><p class="retos-institucionales-ayuda">Estos retos solo aparecen porque perteneces a esos rankings.</p><div class="grid-retos">${generarHTMLTarjetas(retosDeInstitucion, estaBloqueado, user)}</div>` : ""}

            </section>`;
        if (ventanaRetoFugaz) iniciarTemporizadorRetoFugaz(ventanaRetoFugaz.fin);

    } catch (err) {
        console.error("Error al cargar retos:", err);
        contenido.innerHTML = `<section class="paginaInterna"><h2>No se pudieron cargar los retos</h2><p>${escaparHTML(mensajeErrorAmigable(err, "No pudimos cargar los retos. Revisa la conexión e inténtalo de nuevo."))}</p><button class="botonPrincipal" onclick="mostrarRetos()">Reintentar</button></section>`;
    }
}

function iniciarTemporizadorRetoFugaz(finReto = Date.now() + DURACION_RETO_FUGAZ) {
    if (timerRetoFugaz) clearInterval(timerRetoFugaz);
    const actualizar = () => {
        const reloj = document.getElementById("temporizadorFugaz");
        if (!reloj) {
            clearInterval(timerRetoFugaz);
            timerRetoFugaz = null;
            return;
        }
        const restante = Math.max(0, finReto - Date.now());
        const segundos = Math.floor(restante / 1000);
        reloj.textContent = [Math.floor(segundos / 3600), Math.floor((segundos % 3600) / 60), segundos % 60]
            .map(valor => String(valor).padStart(2, "0")).join(":");
        if (restante <= 1000) mostrarRetos();
    };
    actualizar();
    timerRetoFugaz = setInterval(actualizar, 1000);
}

function generarHTMLTarjetas(lista, fnBloqueado, usuarioActivo) {
    if (!lista || lista.length === 0) return `<p>No hay retos disponibles.</p>`;
    return lista.map(reto => {
        const bloqueado = usuarioActivo ? fnBloqueado(reto) : false;
        const idSeguro = escaparHTML(JSON.stringify(String(reto.id)));
        const idElemento = `evidencia-reto-${String(reto.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;
        const puntos = Math.max(0, Number(reto.puntos) || 0);
        return `
            <article class="tarjeta-reto ${bloqueado ? 'reto-desactivado' : ''}">
                <div class="icono-reto">${escaparHTML(reto.icono || '🌱')}</div>
                <div class="info-reto">
                    <h3>${escaparHTML(reto.titulo)}</h3>
                    <p>${escaparHTML(reto.descripcion)}</p>
                    ${normalizarTipoReto(reto.tipo) === "fugaz" ? `<span class="duracion-reto">⏳ Disponible durante ${Math.min(24, Math.max(1, Number(reto.duracion_horas) || 4))} h</span>` : ""}
                    <span class="puntos-badge">+${puntos} Pts</span>
                    <div class="reto-evidencia-estado" id="${idElemento}-estado" role="status" aria-live="polite" hidden></div>
                </div>
                <div class="reto-evidencia" id="${idElemento}-picker">
                    <small class="evidencia-limite">Fotos de hasta 5 MB.</small>
                    <input class="reto-evidencia-input" id="${idElemento}-galeria" type="file" accept="image/*" hidden onchange="previsualizarEvidenciaReto(this)">
                    <input class="reto-evidencia-input" id="${idElemento}-camara-fallback" type="file" accept="image/*" capture="environment" hidden onchange="previsualizarEvidenciaReto(this)">
                    <div class="reto-evidencia-selector" id="${idElemento}-selector">
                        <button type="button" class="btn-secundario reto-camara-abrir" ${bloqueado ? 'disabled' : ''} onclick="abrirCamaraReto('${idElemento}')">Tomar foto</button>
                        ${esDispositivoMovil() ? "" : `<button type="button" class="reto-galeria-abrir" ${bloqueado ? 'disabled' : ''} aria-label="Elegir una foto de la galería" title="Elegir una foto de la galería" onclick="document.getElementById('${idElemento}-galeria').click()"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.6" fill="currentColor"/><path d="m5 17 4.3-4.2 3.1 2.8 2.5-2.3 4.1 4.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>`}
                    </div>
                    <div class="reto-evidencia-preview" id="${idElemento}-preview" hidden>
                        <img class="reto-evidencia-imagen-ampliable" alt="Vista previa de la evidencia seleccionada" title="Ampliar imagen" role="button" tabindex="0">
                        <button type="button" class="reto-evidencia-quitar" aria-label="Quitar imagen" title="Quitar imagen" onclick="quitarEvidenciaReto('${idElemento}')"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg></button>
                        <small class="evidencia-tamano" id="${idElemento}-tamano"></small>
                        <div class="reto-evidencia-acciones">
                            <button type="button" class="btn-secundario reto-enviar-btn" onclick="procesarReto(${idSeguro}, ${puntos}, '${idElemento}')">Enviar evidencia y completar</button>
                            <button type="button" class="reto-evidencia-cambiar" onclick="abrirSelectorEvidencia('${idElemento}')">Cambiar foto</button>
                        </div>
                    </div>
                </div>
            </article>`;
    }).join('');
}

function abrirSelectorEvidencia(idElemento) {
    // Mantiene el flujo habitual: volver a la cámara o elegir desde su acceso a la galería.
    abrirCamaraReto(idElemento);
}

function quitarEvidenciaReto(idElemento) {
    const picker = document.getElementById(`${idElemento}-picker`);
    if (!picker) return;
    const imagen = picker.querySelector(".reto-evidencia-preview img");
    if (imagen?.dataset.objectUrl) URL.revokeObjectURL(imagen.dataset.objectUrl);
    if (imagen) {
        imagen.removeAttribute("src");
        delete imagen.dataset.objectUrl;
        imagen.alt = "Vista previa de la evidencia seleccionada";
    }
    picker._archivoSeleccionado = null;
    picker._fuenteEvidencia = null;
    picker.querySelectorAll('input[type="file"]').forEach(input => { input.value = ""; });
    picker.querySelector(".reto-evidencia-preview").hidden = true;
    picker.querySelector(".reto-evidencia-selector").hidden = false;
    const estado = picker.closest(".tarjeta-reto")?.querySelector(".reto-evidencia-estado");
    if (estado) { estado.hidden = true; estado.textContent = ""; }
}

function previsualizarEvidenciaReto(input, archivoCapturado = null, idElemento = null, fuenteCapturada = null) {
    const archivo = archivoCapturado || input?.files?.[0];
    const picker = input?.closest(".reto-evidencia") || (idElemento ? document.getElementById(`${idElemento}-picker`) : null);
    const tarjeta = picker?.closest(".tarjeta-reto");
    if (!archivo || !picker || !tarjeta) return;
    const estado = tarjeta.querySelector(".reto-evidencia-estado");
    if (input && esDispositivoMovil()) {
        input.value = "";
        if (estado) { estado.hidden = false; estado.textContent = "En el celular debes tomar la foto con la cámara de EcoReto."; estado.className = "reto-evidencia-estado error"; }
        return;
    }
    const errorImagen = validarImagen(archivo);
    if (errorImagen) {
        if (estado) { estado.hidden = false; estado.textContent = errorImagen; estado.className = "reto-evidencia-estado error"; }
        if (input) input.value = "";
        return;
    }
    const imagen = picker.querySelector(".reto-evidencia-preview img");
    if (imagen.dataset.objectUrl) URL.revokeObjectURL(imagen.dataset.objectUrl);
    const url = URL.createObjectURL(archivo);
    imagen.src = url;
    imagen.dataset.objectUrl = url;
    imagen.alt = `Vista previa: ${archivo.name}`;
        picker._archivoSeleccionado = archivo;
        picker._submissionId = crearUUIDEcoReto();
    picker._fuenteEvidencia = fuenteCapturada || (input?.id?.endsWith("-camara-fallback") ? "camara" : input ? "galeria" : "camara");
    picker.querySelector(".evidencia-tamano").textContent = `Tamaño de la foto: ${formatearTamanoImagen(archivo.size)} · Máximo: 5 MB`;
    picker.querySelector(".reto-evidencia-selector").hidden = true;
    picker.querySelector(".reto-evidencia-preview").hidden = false;
    if (estado) estado.hidden = true;
}

function detenerCamaraReto() {
    if (streamCamaraReto) streamCamaraReto.getTracks().forEach(track => track.stop());
    streamCamaraReto = null;
    const video = document.getElementById("videoCamaraReto");
    if (video) video.srcObject = null;
}

function cerrarCamaraReto() {
    detenerCamaraReto();
    const dialogo = document.getElementById("dialogoCamaraReto");
    if (dialogo?.open) dialogo.close();
}

function obtenerDialogoCamaraReto() {
    let dialogo = document.getElementById("dialogoCamaraReto");
    if (dialogo) return dialogo;
    dialogo = document.createElement("dialog");
    dialogo.id = "dialogoCamaraReto";
    dialogo.className = "dialogo-camara-reto";
    dialogo.setAttribute("aria-labelledby", "tituloCamaraReto");
    dialogo.innerHTML = `
        <section class="camara-reto-panel">
            <header><div><span class="camara-reto-etiqueta">EVIDENCIA DEL RETO</span><h2 id="tituloCamaraReto">Tomar foto</h2></div>
                <button type="button" class="camara-reto-cerrar" aria-label="Cerrar cámara" onclick="cerrarCamaraReto()"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg></button>
            </header>
            <p id="estadoCamaraReto" role="status" aria-live="polite">Preparando cámara…</p>
            <div class="camara-reto-vista"><video id="videoCamaraReto" autoplay playsinline muted hidden></video></div>
            <button type="button" id="fallbackCamaraReto" class="camara-reto-fallback" onclick="abrirCamaraNativaReto()" hidden>Abrir cámara del dispositivo</button>
            <div class="camara-reto-controles">
                ${esDispositivoMovil() ? "" : `<button type="button" class="camara-reto-galeria" aria-label="Elegir una foto de la galería" title="Elegir de la galería" onclick="elegirGaleriaDesdeCamara()"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.6" fill="currentColor"/><path d="m5 17 4.3-4.2 3.1-2.8 2.5-2.3 4.1 4.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>`}
                <button type="button" class="camara-reto-disparador" aria-label="Capturar foto" onclick="capturarFotoReto()" disabled><span></span></button>

            </div>
        </section>`;
    dialogo.addEventListener("close", detenerCamaraReto);
    dialogo.addEventListener("click", evento => { if (evento.target === dialogo) cerrarCamaraReto(); });
    document.body.appendChild(dialogo);
    return dialogo;
}

async function abrirCamaraReto(idElemento) {
    idElementoRetoEnCamara = idElemento;
    const dialogo = obtenerDialogoCamaraReto();
    const estado = dialogo.querySelector("#estadoCamaraReto");
    const disparador = dialogo.querySelector(".camara-reto-disparador");
    const video = dialogo.querySelector("#videoCamaraReto");
    dialogo.querySelector(".camara-reto-etiqueta").textContent = idElemento === "__publicacion__" ? "FOTO DE PUBLICACIÓN" : "EVIDENCIA DEL RETO";
    detenerCamaraReto();
    disparador.disabled = true;
    video.hidden = true;
    estado.textContent = "Solicitando permiso para usar la cámara…";
    dialogo.querySelector("#fallbackCamaraReto").hidden = true;
    if (!dialogo.open) dialogo.showModal();
    if (!window.isSecureContext) {
        estado.textContent = esDispositivoMovil()
            ? "Para tomar la foto desde EcoReto, abre esta página con HTTPS y permite el acceso a la cámara."
            : "La cámara integrada necesita HTTPS o localhost. Puedes elegir una foto desde tu computador.";
        dialogo.querySelector("#fallbackCamaraReto").hidden = esDispositivoMovil();
        return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        estado.textContent = esDispositivoMovil()
            ? "Este navegador no permite abrir la cámara. Activa los permisos de cámara o prueba con otro navegador del celular."
            : "Este navegador no permite abrir la cámara integrada. Puedes elegir una foto desde tu computador.";
        dialogo.querySelector("#fallbackCamaraReto").hidden = esDispositivoMovil();
        return;
    }
    try {
        streamCamaraReto = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!dialogo.open) { detenerCamaraReto(); return; }
        video.srcObject = streamCamaraReto;
        video.hidden = false;
        await video.play();
        estado.textContent = "Encuadra la acción y pulsa el botón para tomar la foto.";
        disparador.disabled = false;
    } catch (error) {
        console.warn("No se pudo abrir la cámara:", error);
        const mensajes = {
            NotAllowedError: esDispositivoMovil() ? "No se concedió permiso para la cámara. Actívalo en los ajustes del navegador y vuelve a intentar." : "No se concedió permiso para la cámara. Puedes elegir una foto desde tu computador.",
            NotFoundError: esDispositivoMovil() ? "No se encontró una cámara disponible en este celular." : "No se encontró una cámara. Puedes elegir una foto desde tu computador.",
            NotReadableError: esDispositivoMovil() ? "La cámara está ocupada por otra aplicación. Ciérrala y vuelve a intentar." : "La cámara está ocupada. Puedes elegir una foto desde tu computador."
        };
        estado.textContent = mensajes[error.name] || (esDispositivoMovil()
            ? "No se pudo abrir la cámara. Revisa los permisos del navegador y vuelve a intentar."
            : "No se pudo abrir la cámara. Revisa los permisos o elige una foto desde tu computador.");
        dialogo.querySelector("#fallbackCamaraReto").hidden = esDispositivoMovil();
    }
}

function abrirCamaraNativaReto() {
    if (esDispositivoMovil()) return;
    const idElemento = idElementoRetoEnCamara;
    cerrarCamaraReto();
    if (idElemento === "__publicacion__") {
        const input = document.getElementById("inputFotoEco");
        input?.setAttribute("capture", "environment");
        input?.click();
        return;
    }
    if (idElemento) document.getElementById(`${idElemento}-camara-fallback`)?.click();
}
function elegirGaleriaDesdeCamara() {
    if (esDispositivoMovil()) return;
    const idElemento = idElementoRetoEnCamara;
    cerrarCamaraReto();
    if (idElemento === "__publicacion__") {
        document.getElementById("inputFotoEco")?.click();
        return;
    }
    if (idElemento) document.getElementById(`${idElemento}-galeria`)?.click();
}
function capturarFotoReto() {
    const video = document.getElementById("videoCamaraReto");
    const estado = document.getElementById("estadoCamaraReto");
    const idElemento = idElementoRetoEnCamara;
    if (!video || !idElemento || !video.videoWidth || !video.videoHeight) {
        if (estado) estado.textContent = "La cámara todavía no está lista. Espera un momento e inténtalo de nuevo.";
        return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const contexto = canvas.getContext("2d");
    contexto?.translate(canvas.width, 0);
    contexto?.scale(-1, 1);
    contexto?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        if (!blob) {
            if (estado) estado.textContent = "No se pudo preparar la foto. Inténtalo otra vez o elige una imagen de la galería.";
            return;
        }
        const foto = new File([blob], `evidencia-${Date.now()}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
        if (idElemento === "__publicacion__") mostrarNombreArchivo(null, foto);
        else previsualizarEvidenciaReto(null, foto, idElemento, "camara");
        cerrarCamaraReto();
    }, "image/jpeg", 0.9);
}
async function procesarReto(idReto, puntosReto, idElemento) {
    const picker = document.getElementById(`${idElemento}-picker`);
    const estado = picker?.closest(".tarjeta-reto")?.querySelector(".reto-evidencia-estado");
    const botonEnviar = picker?.querySelector(".reto-enviar-btn");
    const archivo = picker?._archivoSeleccionado;
    let rutaSubida = null;
    let verificacionInvocada = false;
    let errorVerificacionHttp = false;
    const mostrarEstado = (mensaje, tipo = "") => {
        if (!estado) return;
        estado.hidden = !mensaje;
        estado.textContent = mensaje;
        estado.className = `reto-evidencia-estado ${tipo}`.trim();
    };
    if (!archivo) { mostrarEstado("Elige o toma una foto para continuar.", "error"); return; }
    const errorImagen = validarImagen(archivo);
    if (errorImagen) { mostrarEstado(errorImagen, "error"); return; }
    let avisoLento = null;
    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await obtenerUsuarioEcoReto(supabase);
        if (!user) throw new Error("Inicia sesión para completar un reto y guardar su evidencia.");
        if (!await asegurarPerfil(user)) throw new Error("No pudimos preparar tu cuenta para completar el reto. Inténtalo de nuevo en un momento.");
        if (botonEnviar) { botonEnviar.disabled = true; botonEnviar.textContent = "Enviando evidencia…"; }
        mostrarEstado("Subiendo tu foto de evidencia…", "cargando");

        const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const nombreArchivo = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        rutaSubida = `${user.id}/retos/${nombreArchivo}.${extension}`;
        avisoLento = setTimeout(() => mostrarEstado("La conexión está tardando. Mantén esta página abierta; la foto puede seguir subiendo.", "cargando"), 8000);
        const { error: errorSubida } = await supabase.storage.from("post-images").upload(rutaSubida, archivo, { contentType: archivo.type, upsert: false });
        clearTimeout(avisoLento);
        if (errorSubida) throw errorSubida;

        mostrarEstado("Registrando el reto y sus puntos…", "cargando");
        verificacionInvocada = true;
        const { data: revision, error: errorRevision } = await supabase.functions.invoke("verificar-evidencia", {
            body: { type: "challenge", challenge_id: Number(idReto), image_path: rutaSubida, submission_id: picker._submissionId }
        });
        if (errorRevision) {
            errorVerificacionHttp = Boolean(errorRevision.context?.status);
            throw new Error(await mensajeErrorFuncionEdge(errorRevision, "No se pudo registrar el reto."));
        }
        if (!revision?.approved) {
            await supabase.storage.from("post-images").remove([rutaSubida]);
            rutaSubida = null;
            throw new Error(revision?.error || revision?.message || "La imagen no pudo validarse.");
        }
        rutaSubida = null;

        mostrarEstado(revision.message || "¡Reto completado y puntos registrados!", "exito");
        const imagenPrevia = picker.querySelector(".reto-evidencia-preview img");
        if (imagenPrevia?.dataset.objectUrl) URL.revokeObjectURL(imagenPrevia.dataset.objectUrl);
        alert(revision.message || `¡Reto completado! Ganaste +${Number(puntosReto)} puntos. 🎉`);
        picker.querySelectorAll("button").forEach(control => { control.disabled = true; });
        const tarjeta = picker.closest(".tarjeta-reto");
        if (tarjeta) tarjeta.classList.add("reto-desactivado");
        invalidarVistasDeProgreso();
        await cargarUsuario();
        await cargarActividadReciente();
        await mostrarRetos();
        guardarVistaActual();
    } catch (err) {
        console.error("Error al procesar reto:", err);
        if (avisoLento) clearTimeout(avisoLento);
        if (rutaSubida && (!verificacionInvocada || errorVerificacionHttp)) {
            try { await (await obtenerCliente()).storage.from("post-images").remove([rutaSubida]); }
            catch (errorLimpieza) { console.warn("No se pudo limpiar la evidencia sin registrar:", errorLimpieza); }
        }
        mostrarEstado(mensajeErrorAmigable(err, "No pudimos completar el reto ahora. Revisa tu conexión e inténtalo de nuevo."), "error");
        if (botonEnviar) { botonEnviar.disabled = false; botonEnviar.textContent = "Intentar de nuevo"; }
    }
}
/* =========================================================
   PERFIL DE USUARIO
   ========================================================= */

async function mostrarPerfil() {
    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await obtenerUsuarioEcoReto(supabase);
        if (!user) return;

        // 1. Obtener los datos del perfil actual
        let { data: perfil, error: errorPerfil } = await supabase
            .from("profiles")
            .select("username,puntos,rango,avatar_url,cursor_id,country")
            .eq("id", user.id)
            .maybeSingle();
        if (errorPerfil && /cursor_id|country|schema cache|PGRST204/i.test(String(errorPerfil.message))) {
            ({ data: perfil } = await supabase.from("profiles").select("username,puntos,rango,avatar_url").eq("id", user.id).maybeSingle());
        }

        const nombre = perfil?.username || user.user_metadata?.username || "Usuario";
        const puntos = Number(perfil?.puntos) || 0;
        const rango = obtenerRango(puntos);
        aplicarCursorEcoReto(perfil?.cursor_id);
        renderizarCursoresEcoReto(puntos, perfil?.cursor_id || "clasico");
        const avatarUrl = perfil ? (perfil.avatar_url || "") : (user.user_metadata?.avatar_url || "");

        // 2. Calcular el puesto en el ranking (cuántos usuarios tienen más puntos + 1)
        let puestoTexto = "#1";
        try {
            const { count, error: countError } = await supabase
                .from("profiles")
                .select("id", { count: 'exact', head: true })
                .gt("puntos", puntos);

            if (!countError && count !== null) {
                puestoTexto = `#${count + 1}`;
            }
        } catch (e) {
            console.error("No se pudo calcular el ranking:", e);
        }

        // 3. Pintar los datos en la tarjeta
        if (document.getElementById('perfilNombre')) {
            document.getElementById('perfilNombre').textContent = nombre;
            document.getElementById('perfilEmail').textContent = user.email || '';
            const pais = document.getElementById("paisPerfilActual");
            if (pais) inicializarSelectorPaisPerfil(perfil?.country || "");
            document.getElementById('perfilPuntosHeader').textContent = puntos;
            document.getElementById('perfilRangoTexto').textContent = rango;
            document.getElementById('perfilRangoBadge').textContent = rango;
            document.getElementById('perfilPuestoRanking').textContent = `🏆 ${puestoTexto}`;
            const imgElement = document.getElementById('perfilAvatarImg');
            if (imgElement) imgElement.onerror = () => actualizarImagenPerfil("");
            if (imgElement && avatarUrl) actualizarImagenPerfil(avatarUrl);
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
}

async function guardarPaisPerfil() {
    const selector = document.getElementById("paisPerfilActual");
    const pais = selector?.value.trim() || "";
    const estado = document.getElementById("estadoPaisPerfil");
    const valorGuardado = selector?.dataset.paisGuardado || "";
    if (pais === valorGuardado) return;
    try {
        if (selector) selector.disabled = true;
        if (estado) estado.textContent = pais ? "Guardando tu país…" : "Actualizando tu perfil…";
        const supabase = await obtenerCliente();
        const { error } = await supabase.rpc("ecoreto_actualizar_ubicacion", { p_pais: pais, p_colegio: null });
        if (error) throw error;
        if (selector) selector.dataset.paisGuardado = pais;
        if (estado) estado.textContent = pais ? "País guardado. Ya puedes aparecer en la clasificación nacional correspondiente." : "País eliminado de tu perfil.";
    } catch (error) {
        console.error("No se pudo guardar el país del perfil:", error);
        if (selector) selector.value = valorGuardado;
        if (estado) estado.textContent = mensajeErrorAmigable(error, "No pudimos guardar el país. Inténtalo otra vez.");
    } finally {
        if (selector) selector.disabled = false;
    }
}

function inicializarSelectorPaisPerfil(paisGuardado = "") {
    const selector = document.getElementById("paisPerfilActual");
    if (!selector) return;
    const nombres = new Intl.DisplayNames(["es"], { type: "region" });
    const paises = [];
    for (let primera = 65; primera <= 90; primera++) {
        for (let segunda = 65; segunda <= 90; segunda++) {
            const codigo = String.fromCharCode(primera, segunda);
            const nombre = nombres.of(codigo);
            if (nombre && nombre !== codigo && !/^(región|territorio|zona)\b/i.test(nombre)) paises.push(nombre);
        }
    }
    const ordenados = [...new Set(paises)].sort((a, b) => a.localeCompare(b, "es"));
    selector.replaceChildren(new Option("Elige un país", ""), ...ordenados.map(nombre => new Option(nombre, nombre)));
    if (paisGuardado && !ordenados.includes(paisGuardado)) selector.add(new Option(paisGuardado, paisGuardado));
    selector.value = paisGuardado;
    selector.dataset.paisGuardado = paisGuardado;
}

/* =========================================================
   PERFIL Y PANEL DE INSTITUCIONES
   ========================================================= */

function mostrarEstadoPortalInstitucional(texto, tipo = "") {
    const estado = document.getElementById("portalEstadoInstitucional");
    if (!estado) return;
    estado.className = `registro-ranking-estado ${tipo}`.trim();
    estado.textContent = texto;
    estado.hidden = !texto;
}

async function cargarPanelInstitucional() {
    const acceso = document.getElementById("portalAccesoInstitucional");
    const panel = document.getElementById("portalPanelInstitucional");
    const solicitud = document.getElementById("portalSolicitudRanking");
    let correoSesionActual = "";
    let estadoSolicitud = null;
    if (!acceso || !panel || !solicitud) return;
    acceso.hidden = true;
    panel.hidden = true;
    solicitud.hidden = true;
    mostrarEstadoPortalInstitucional("Revisando tu cuenta EcoReto…", "comprobando");
    try {
        const supabase = await obtenerCliente();
        const { data: { user }, error: errorUsuario } = await obtenerUsuarioEcoReto(supabase);
        if (errorUsuario) throw errorUsuario;
        if (!user) {
            acceso.hidden = false;
            mostrarEstadoPortalInstitucional("", "");
            return;
        }
        correoSesionActual = String(user.email || "").trim();
        const correoCuenta = document.getElementById("institucionCorreo");
        if (correoCuenta) correoCuenta.value = correoSesionActual;
        const { data: solicitudes, error: errorSolicitud } = await supabase.rpc("ecoreto_estado_solicitud_institucion");
        if (errorSolicitud) throw errorSolicitud;
        estadoSolicitud = solicitudes?.[0] || null;
        if (estadoSolicitud?.application_status === "pending") {
            acceso.hidden = true;
            solicitud.hidden = true;
            mostrarEstadoPortalInstitucional(`Recibimos la solicitud de ${estadoSolicitud.institution_name}. Está pendiente de revisión; podrás ver aquí la respuesta cuando el equipo la revise.`, "disponible");
            return;
        }
        if (estadoSolicitud?.application_status === "rejected") {
            acceso.hidden = true;
            solicitud.hidden = false;
            const nota = String(estadoSolicitud.review_note || "").trim();
            mostrarEstadoPortalInstitucional(`La solicitud de ${estadoSolicitud.institution_name} no fue aprobada.${nota ? ` Motivo: ${nota}` : " Puedes enviar una nueva solicitud con la información actualizada."}`, "error");
            if (window.location.hash === "#solicitar-ranking") solicitud.scrollIntoView({ behavior: "smooth" });
            return;
        }
        const { error: errorVinculo } = await supabase.rpc("ecoreto_vincular_portal_institucional");
        if (errorVinculo) throw errorVinculo;
        const { data, error } = await supabase.rpc("ecoreto_panel_institucional");
        if (error) throw error;
        const filas = data || [];
        if (!filas.length || !filas.some(fila => fila.institution_name)) {
            acceso.hidden = true;
            solicitud.hidden = false;
            if (estadoSolicitud?.application_status === "approved") {
                mostrarEstadoPortalInstitucional(`Aprobamos la solicitud de ${estadoSolicitud.institution_name}. Código para estudiantes: ${estadoSolicitud.invite_code || "consulta el correo de la institución"}. Estamos preparando el panel; vuelve a intentarlo en un momento.`, "disponible");
                solicitud.hidden = true;
            } else {
                mostrarEstadoPortalInstitucional("Tu cuenta está lista. Completa el formulario para solicitar un ranking institucional.", "disponible");
            }
            if (window.location.hash === "#solicitar-ranking") solicitud.scrollIntoView({ behavior: "smooth" });
            return;
        }
        solicitud.hidden = true;

        const grupos = new Map();
        for (const fila of filas) {
            const clave = fila.competition_id || `${fila.institution_name}|${fila.invite_code}`;
            if (!grupos.has(clave)) grupos.set(clave, { info: fila, estudiantes: [] });
            if (fila.student_id) grupos.get(clave).estudiantes.push(fila);
        }
        const retosPorRanking = new Map();
        await Promise.all([...grupos.entries()].map(async ([clave, grupo]) => {
            if (!grupo.info.competition_id) return;
            const { data: retos, error: errorRetos } = await supabase.rpc("ecoreto_retos_institucionales", { p_competition_id: grupo.info.competition_id });
            if (errorRetos) throw errorRetos;
            retosPorRanking.set(clave, retos || []);
        }));
        panel.innerHTML = `<div class="portal-panel-cabecera"><div><span class="etiqueta">RANKING INSTITUCIONAL</span><h2>Avance de tu comunidad</h2></div><a class="btn-secundario" href="../app.html?demo=1&amp;vista=ranking">Volver a EcoReto</a></div>${[...grupos.values()].map(({ info, estudiantes }) => {
            const clave = info.competition_id || `${info.institution_name}|${info.invite_code}`;
            const puntosTotales = estudiantes.reduce((total, estudiante) => total + (Number(estudiante.points) || 0), 0);
            const accionesTotales = estudiantes.reduce((total, estudiante) => total + (Number(estudiante.total_actions) || 0), 0);
            const retos = retosPorRanking.get(clave) || [];
            const filasEstudiantes = estudiantes.length
                ? estudiantes.map(estudiante => `<tr><td>${escaparHTML(estudiante.username || "Estudiante")}</td><td>${Number(estudiante.points) || 0}</td><td>${escaparHTML(estudiante.student_rank || "Semilla Verde")}</td><td>${Number(estudiante.total_actions) || 0}</td></tr>`).join("")
                : `<tr><td colspan="4" class="portal-sin-estudiantes">Aún no hay estudiantes en este ranking. Comparte el código para que puedan unirse.</td></tr>`;
            const id = escaparHTML(String(info.competition_id || "").replace(/[^a-zA-Z0-9_-]/g, ""));
            const listaRetos = retos.length ? retos.map(reto => `<li><strong>${escaparHTML(reto.titulo)}</strong><span>${Number(reto.puntos)} puntos · ${Number(reto.completados)} completados</span><p>${escaparHTML(reto.descripcion)}</p></li>`).join("") : "<li class=\"portal-sin-estudiantes\">Aún no has creado retos para esta comunidad.</li>";
            return `<section class="portal-institucion-ranking"><div class="portal-ranking-titulo"><div><h3>${escaparHTML(info.institution_name)}</h3><p>${escaparHTML(info.competition_name || "Ranking institucional")}</p></div><div class="portal-codigo"><small>CÓDIGO PARA ESTUDIANTES</small><strong>${escaparHTML(info.invite_code || "—")}</strong><button type="button" onclick="copiarCodigoPortalInstitucional('${escaparHTML(info.invite_code || "")}')">Copiar código</button></div></div><div class="portal-resumen"><article><small>ESTUDIANTES</small><strong>${estudiantes.length}</strong></article><article><small>PUNTOS SUMADOS</small><strong>${puntosTotales}</strong></article><article><small>ACCIONES REGISTRADAS</small><strong>${accionesTotales}</strong></article></div><div class="portal-tabla-contenedor"><table class="portal-tabla"><thead><tr><th>Estudiante</th><th>Puntos</th><th>Rango</th><th>Acciones</th></tr></thead><tbody>${filasEstudiantes}</tbody></table></div><section class="portal-retos-institucion"><h4>Retos para esta comunidad</h4><p>Solo los estudiantes que se unieron a este ranking podrán ver estos retos.</p><form onsubmit="event.preventDefault(); crearRetoInstitucional('${id}')"><label for="tituloRetoInstitucion-${id}">Nombre del reto</label><input id="tituloRetoInstitucion-${id}" maxlength="100" required placeholder="Ejemplo: Jornada de reciclaje"><label for="descripcionRetoInstitucion-${id}">¿Qué deben hacer?</label><textarea id="descripcionRetoInstitucion-${id}" maxlength="600" minlength="10" required placeholder="Describe una acción ecológica que puedan completar y fotografiar"></textarea><div class="portal-reto-campos"><div><label for="puntosRetoInstitucion-${id}">Puntos</label><input id="puntosRetoInstitucion-${id}" type="number" min="5" max="100" value="20" required></div><div><label for="tipoRetoInstitucion-${id}">Frecuencia</label><select id="tipoRetoInstitucion-${id}"><option value="diario">Diario</option><option value="semanal" selected>Semanal</option><option value="fugaz">Por tiempo limitado</option></select></div><div><label for="duracionRetoInstitucion-${id}">Duración fugaz (horas)</label><input id="duracionRetoInstitucion-${id}" type="number" min="1" max="24" value="4"></div></div><button type="submit">Publicar reto en mi ranking</button><p id="estadoRetoInstitucion-${id}" role="status" aria-live="polite"></p></form><ul class="portal-retos-lista">${listaRetos}</ul></section></section>`;
        }).join("")}<p class="portal-privacidad">Este panel muestra los nombres del ranking, puntos, rangos y cantidad de acciones de las personas inscritas. No muestra sus correos ni sus fotos.</p>`;
        acceso.hidden = true;
        panel.hidden = false;
    } catch (error) {
        console.error("No se pudo cargar el panel institucional:", {
            status: error?.status || error?.context?.status || null,
            code: error?.code || "",
            message: error?.message || String(error),
            details: error?.details || "",
            hint: error?.hint || ""
        });
        const detalle = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
        if (/confirma el correo institucional/i.test(detalle)) {
            mostrarEstadoPortalInstitucional("Confirma el correo de tu cuenta EcoReto. Cuando el equipo apruebe la solicitud, usa esa misma cuenta para administrar el ranking.", "error");
        } else if (estadoSolicitud?.application_status === "approved") {
            solicitud.hidden = true;
            mostrarEstadoPortalInstitucional(`La solicitud de ${estadoSolicitud.institution_name} fue aprobada. Código para estudiantes: ${estadoSolicitud.invite_code || "revisa el correo de la institución"}. No pudimos abrir el panel ahora; vuelve a intentarlo más tarde.`, "disponible");
        } else if (/no hay un ranking institucional aprobado|no hay.*instituci[oó]n.*aprobada/i.test(detalle)) {
            acceso.hidden = true;
            solicitud.hidden = false;
            const cuenta = correoSesionActual ? ` para ${correoSesionActual}` : " para esta cuenta";
            mostrarEstadoPortalInstitucional(`No encontramos un ranking aprobado${cuenta}. La solicitud debe estar aprobada y usar este mismo correo confirmado. Si ya la enviaste, espera la revisión.`, "disponible");
        } else if (/PGRST202|schema cache|function .* does not exist|42P01|42703/i.test(detalle)) {
            mostrarEstadoPortalInstitucional("No pudimos abrir el ranking en este momento. Inténtalo de nuevo más tarde; si el problema continúa, contacta al equipo de EcoReto.", "error");
        } else if (/42501|permission denied|row-level security|not authorized/i.test(detalle)) {
            const cuenta = correoSesionActual ? ` (${correoSesionActual})` : "";
            mostrarEstadoPortalInstitucional(`La cuenta activa${cuenta} no está vinculada a un ranking institucional aprobado. La solicitud y el correo confirmado deben pertenecer a esta misma cuenta.`, "error");
        } else if (/23505|duplicate key|unique constraint/i.test(detalle)) {
            mostrarEstadoPortalInstitucional("No pudimos abrir el ranking con esta cuenta en este momento. Inténtalo de nuevo más tarde; si el problema continúa, contacta al equipo de EcoReto.", "error");
        } else if (/failed to fetch|network|timeout|load failed/i.test(detalle)) {
            mostrarEstadoPortalInstitucional("No pudimos conectar con el servicio del ranking. Comprueba que tengas Internet e inténtalo de nuevo.", "error");
        } else {
            mostrarEstadoPortalInstitucional("No pudimos cargar el ranking de tu institución en este momento. Inténtalo de nuevo más tarde. Si el problema continúa, contacta al equipo de EcoReto.", "error");
        }
    }
}

async function copiarCodigoPortalInstitucional(codigo) {
    try {
        await navigator.clipboard.writeText(codigo);
        mostrarEstadoPortalInstitucional("Código copiado. Compártelo con los estudiantes de tu institución.", "disponible");
    } catch {
        mostrarEstadoPortalInstitucional(`Copia este código para compartirlo con los estudiantes: ${codigo}`, "disponible");
    }
}

async function crearRetoInstitucional(competitionId) {
    const sufijo = String(competitionId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const estado = document.getElementById(`estadoRetoInstitucion-${sufijo}`);
    const datos = {
        p_competition_id: competitionId,
        p_titulo: document.getElementById(`tituloRetoInstitucion-${sufijo}`)?.value.trim(),
        p_descripcion: document.getElementById(`descripcionRetoInstitucion-${sufijo}`)?.value.trim(),
        p_puntos: Number(document.getElementById(`puntosRetoInstitucion-${sufijo}`)?.value),
        p_tipo: document.getElementById(`tipoRetoInstitucion-${sufijo}`)?.value,
        p_duracion_horas: Number(document.getElementById(`duracionRetoInstitucion-${sufijo}`)?.value)
    };
    if (!datos.p_titulo || datos.p_descripcion.length < 10 || datos.p_puntos < 5 || datos.p_puntos > 100) {
        if (estado) estado.textContent = "Revisa el nombre, la descripción y los puntos del reto.";
        return;
    }
    if (estado) estado.textContent = "Publicando el reto…";
    const formulario = estado?.closest("form");
    const boton = formulario?.querySelector("button[type='submit']");
    if (boton) boton.disabled = true;
    try {
        const supabase = await obtenerCliente();
        const { error } = await supabase.rpc("ecoreto_crear_reto_institucional", datos);
        if (error) throw error;
        await cargarPanelInstitucional();
        const nuevoEstado = document.getElementById(`estadoRetoInstitucion-${sufijo}`);
        if (nuevoEstado) nuevoEstado.textContent = "Reto publicado. Ya aparece para quienes participan en tu ranking.";
    } catch (error) {
        console.error("No se pudo crear el reto institucional:", error);
        if (estado) estado.textContent = mensajeErrorAmigable(error, "No pudimos publicar el reto. Revisa la conexión e inténtalo de nuevo.");
        if (boton) boton.disabled = false;
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    if (!document.getElementById("portalAccesoInstitucional")) return;
    document.getElementById("portalAccesoInstitucional").hidden = true;
    document.getElementById("portalSolicitudRanking").hidden = true;
    document.getElementById("portalPanelInstitucional").hidden = true;
    mostrarEstadoPortalInstitucional("Comprobando tu sesión…", "comprobando");
    try {
        const { data: { session } } = await (await obtenerCliente()).auth.getSession();
        if (session?.user) await cargarPanelInstitucional();
        else {
            document.getElementById("portalAccesoInstitucional").hidden = false;
            mostrarEstadoPortalInstitucional("", "");
        }
    } catch (error) {
        console.error("No se pudo revisar la sesión institucional:", error);
        document.getElementById("portalAccesoInstitucional").hidden = false;
        mostrarEstadoPortalInstitucional("No pudimos comprobar tu sesión. Revisa la conexión e inténtalo de nuevo.", "error");
    }
});
