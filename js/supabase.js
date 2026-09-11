// ../js/supabase.js

// 1. Datos tomados directamente de tu panel de Supabase
const SUPABASE_URL = "https://lycxdyckvedinhizrkkc.supabase.co"; 
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_22HHbWBP2DAKf1cxJbEo1Q_-puOIw_E"; // Usa el botón de copiar (icono de dos papeles) en tu pantalla para pegar la clave completa aquí

let supabaseClient = null;

function cargarSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    if (!window.supabase?.createClient) {
        throw new Error("El SDK de Supabase no está disponible en la página. Revisa que el CDN esté cargado en el HTML.");
    }

    if (
        typeof SUPABASE_URL !== "string" ||
        !SUPABASE_URL.trim()
    ) {
        throw new Error("SUPABASE_URL no está configurada correctamente en supabase.js.");
    }

    if (
        typeof SUPABASE_PUBLISHABLE_KEY !== "string" ||
        !SUPABASE_PUBLISHABLE_KEY.trim()
    ) {
        throw new Error("SUPABASE_PUBLISHABLE_KEY no está configurada correctamente en supabase.js.");
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    window.supabaseClient = supabaseClient;

    return supabaseClient;
}

async function obtenerCliente() {
    return cargarSupabase();
}