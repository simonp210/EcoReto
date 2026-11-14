// ../js/supabase.js

// 1. Datos tomados directamente de tu panel de Supabase
const SUPABASE_URL = "https://lycxdyckvedinhizrkkc.supabase.co"; 
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_22HHbWBP2DAKf1cxJbEo1Q_-puOIw_E"; // Usa el botón de copiar (icono de dos papeles) en tu pantalla para pegar la clave completa aquí

let supabaseClient = null;
let supabaseClientPromise = null;
const CLAVE_SESION_ECORETO = "ecoreto-auth";

function migrarSesionAnterior() {
    try {
        const almacenamiento = window.localStorage;
        if (almacenamiento.getItem(CLAVE_SESION_ECORETO)) return;

        let idPestanaAnterior = null;
        try { idPestanaAnterior = window.sessionStorage.getItem("ecoreto_supabase_tab_id"); } catch { /* La sesión durable sigue disponible. */ }
        const idsAnteriores = [
            idPestanaAnterior,
            almacenamiento.getItem("ecoreto_ultima_pestana_autenticada")
        ].filter(Boolean);
        for (const id of idsAnteriores) {
            const sesionAnterior = almacenamiento.getItem(`ecoreto-auth-${id}`);
            if (sesionAnterior) {
                almacenamiento.setItem(CLAVE_SESION_ECORETO, sesionAnterior);
                return;
            }
        }
    } catch (error) {
        console.warn("No se pudo migrar la sesión guardada anteriormente:", error);
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

        migrarSesionAnterior();
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: {
                storage: window.localStorage,
                storageKey: CLAVE_SESION_ECORETO,
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

// getUser() necesita consultar el servidor. Si se cae Internet, usa la sesión
// guardada para mantener la cuenta y la interfaz en vez de convertirla en invitado.
async function obtenerUsuarioEcoReto(cliente) {
    const { data, error } = await cliente.auth.getSession();
    if (data?.session?.user) return { data: { user: data.session.user }, error: null };

    const mensajeError = String(error?.message || "");
    const falloDeRed = !navigator.onLine || /failed to fetch|network|timeout|timed out|load failed/i.test(mensajeError);
    if (falloDeRed) {
        try {
            const sesionGuardada = JSON.parse(window.localStorage.getItem(CLAVE_SESION_ECORETO) || "null");
            if (sesionGuardada?.user?.id && sesionGuardada?.access_token) {
                return { data: { user: sesionGuardada.user }, error: null };
            }
        } catch { /* Si el almacenamiento falla, se conserva el error normal de sesión. */ }
    }
    if (error) return { data: { user: null }, error };
    return cliente.auth.getUser();
}
