const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" };

function respuesta(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function escaparHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respuesta({ error: "Método no permitido." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return respuesta({ error: "Inicia sesión para enviar un reporte." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  let publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (!publishableKey) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
      publishableKey = Object.values(keys).find((value) => typeof value === "string" && value.startsWith("sb_publishable_")) as string | undefined;
    } catch { /* Some older Supabase projects expose the legacy single-key variable. */ }
  }
  if (!supabaseUrl || !publishableKey) return respuesta({ error: "Falta la configuración de Supabase para la función." }, 503);

  try {
    const body = await request.json();
    const reportId = String(body?.report_id || "");
    if (!/^[0-9a-f-]{36}$/i.test(reportId)) return respuesta({ error: "El reporte no es válido." }, 400);

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return respuesta({ error: "La sesión venció. Inicia sesión de nuevo." }, 401);

    const { data: report, error: reportError } = await supabase
      .from("support_reports")
      .select("description,screenshot_path")
      .eq("id", reportId)
      .eq("user_id", userData.user.id)
      .single();
    if (reportError || !report) return respuesta({ error: "No encontramos tu reporte." }, 404);
    let alertSent = false;
    const emailApiKey = Deno.env.get("RESEND_API_KEY");
    const supportEmail = Deno.env.get("SUPPORT_EMAIL");
    const emailFrom = Deno.env.get("SUPPORT_EMAIL_FROM");
    const userContact = userData.user.email || userData.user.phone || "La cuenta no tiene correo ni teléfono disponible.";
    if (emailApiKey && supportEmail && emailFrom) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${emailApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: emailFrom,
          to: [supportEmail],
          ...(userData.user.email ? { reply_to: userData.user.email } : {}),
          subject: `EcoReto: reporte de error ${reportId.slice(0, 8)}`,
          text: `Se recibió un reporte de error.\nUsuario: ${userData.user.id}\nContacto para responder: ${userContact}\nReporte: ${reportId}\n\nDescripción:\n${report.description}\n\nLa captura, si existe, permanece privada en Supabase.`,
          html: `<h2>Reporte nuevo de EcoReto</h2><p><b>Usuario:</b> ${escaparHtml(userData.user.id)}</p><p><b>Contacto para responder:</b> ${escaparHtml(userContact)}${userData.user.email ? " (puedes responder directamente a este correo)" : ""}</p><p><b>Reporte:</b> ${escaparHtml(reportId)}</p><h3>Descripción</h3><p>${escaparHtml(String(report.description)).replace(/\n/g, "<br>")}</p><p>La captura, si existe, permanece privada en Supabase.</p>`,
        }),
      });
      alertSent = emailResponse.ok;
      if (!emailResponse.ok) console.error("No se pudo enviar la alerta de soporte", emailResponse.status);
    }

    return respuesta({
      alert_sent: alertSent,
      email_configured: Boolean(emailApiKey && supportEmail && emailFrom),
      reply_to_user: Boolean(userData.user.email),
    });
  } catch (error) {
    console.error("Error procesando el reporte de soporte:", error instanceof Error ? error.message : "error desconocido");
    return respuesta({ error: "El reporte se guardó, pero no pudimos enviar el aviso al equipo." }, 500);
  }
});
