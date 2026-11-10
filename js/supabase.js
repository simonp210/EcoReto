// ../js/supabase.js

// 1. Datos tomados directamente de tu panel de Supabase
const SUPABASE_URL = "https://lycxdyckvedinhizrkkc.supabase.co"; 
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_22HHbWBP2DAKf1cxJbEo1Q_-puOIw_E"; // Usa el botón de copiar (icono de dos papeles) en tu pantalla para pegar la clave completa aquí

let supabaseClient = null;
let supabaseClientPromise = null;
let canalIdentidadEcoReto = null;
let idPestanaEcoReto = null;

async function obtenerAlmacenSesionPestana() {
    // Supabase guarda la sesión en localStorage por defecto y sincroniza los
    // cambios entre pestañas. EcoReto usa un almacén aislado por pestaña para
    // que iniciar sesión con otra cuenta no reemplace la sesión al recargar.
    let idPestana;
    try {
        const almacenamientoDuradero = window.localStorage;
        idPestana = window.sessionStorage.getItem("ecoreto_supabase_tab_id");
        // Si se cerró la última pestaña, recupera su sesión al abrir EcoReto
        // de nuevo. Si esa pestaña aún está abierta, el canal de identidad
        // detecta el uso simultáneo y asigna una sesión nueva a esta pestaña.
        if (!idPestana) idPestana = almacenamientoDuradero.getItem("ecoreto_ultima_pestana_autenticada");
        if (!idPestana) {
            idPestana = globalThis.crypto?.randomUUID?.()
                || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        }
        window.sessionStorage.setItem("ecoreto_supabase_tab_id", idPestana);
        idPestanaEcoReto = idPestana;
        if ("BroadcastChannel" in window) {
            canalIdentidadEcoReto = new BroadcastChannel("ecoreto-auth-tab-identity");
            canalIdentidadEcoReto.onmessage = evento => {
                const mensaje = evento.data;
                if (mensaje?.type === "probe" && mensaje.tabId === idPestanaEcoReto) {
                    canalIdentidadEcoReto.postMessage({ type: "collision", nonce: mensaje.nonce });
                }
            };
            const nonce = globalThis.crypto?.randomUUID?.()
                || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
            let colision = false;
            const escucharColision = evento => {
                if (evento.data?.type === "collision" && evento.data.nonce === nonce) colision = true;
            };
            canalIdentidadEcoReto.addEventListener("message", escucharColision);
            canalIdentidadEcoReto.postMessage({ type: "probe", tabId: idPestana, nonce });
            await new Promise(resolve => setTimeout(resolve, 100));
            canalIdentidadEcoReto.removeEventListener("message", escucharColision);
            if (colision) {
                // Al duplicar una pestaña, algunos navegadores copian su
                // sessionStorage. Separa la nueva instancia para que tampoco
                // comparta el canal de autenticación con la pestaña original.
                idPestana = globalThis.crypto?.randomUUID?.()
                    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
                window.sessionStorage.setItem("ecoreto_supabase_tab_id", idPestana);
                idPestanaEcoReto = idPestana;
            }
        }
        const storage = {
            getItem: key => almacenamientoDuradero.getItem(key),
            setItem: (key, value) => {
                almacenamientoDuradero.setItem(key, value);
                almacenamientoDuradero.setItem("ecoreto_ultima_pestana_autenticada", idPestana);
            },
            removeItem: key => almacenamientoDuradero.removeItem(key)
        };
        return { storage, storageKey: `ecoreto-auth-${idPestana}` };
    } catch (error) {
        console.warn("No se pudo acceder al almacenamiento aislado de esta pestaña:", error);
        // Si el navegador bloquea sessionStorage, no volver al almacenamiento
        // compartido; así se conserva el aislamiento entre cuentas.
        const memoria = new Map();
        const idMemoria = globalThis.crypto?.randomUUID?.()
            || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        return {
            storageKey: `ecoreto-auth-${idMemoria}`,
            storage: {
                getItem: key => memoria.get(key) ?? null,
                setItem: (key, value) => memoria.set(key, value),
                removeItem: key => memoria.delete(key)
            }
        };
    }
}

function cargarSupabase() {
    if (supabaseClient) {
        return Promise.resolve(supabaseClient);
    }
    if (supabaseClientPromise) return supabaseClientPromise;

    supabaseClientPromise = (async () => {
        if (!window.supabase?.createClient) {
            throw new Error("El SDK de Supabase no está disponible en la página. Revisa que el CDN esté cargado en el HTML.");
        }

        if (typeof SUPABASE_URL !== "string" || !SUPABASE_URL.trim()) {
            throw new Error("SUPABASE_URL no está configurada correctamente en supabase.js.");
        }

        if (typeof SUPABASE_PUBLISHABLE_KEY !== "string" || !SUPABASE_PUBLISHABLE_KEY.trim()) {
            throw new Error("SUPABASE_PUBLISHABLE_KEY no está configurada correctamente en supabase.js.");
        }

        const { storage, storageKey } = await obtenerAlmacenSesionPestana();
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: {
                storage,
                storageKey,
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

        window.supabaseClient = supabaseClient;
        return supabaseClient;
    })().catch(error => {
        supabaseClientPromise = null;
        throw error;
    });

    return supabaseClientPromise;
}

async function obtenerCliente() {
    return cargarSupabase();
}
