const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respuesta(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function escaparHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respuesta({ error: "Método no permitido." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("INSTITUTION_EMAIL_FROM") || Deno.env.get("SUPPORT_EMAIL_FROM");
  const reviewerEmail = Deno.env.get("INSTITUTION_REVIEW_EMAIL") || Deno.env.get("SUPPORT_EMAIL");
  if (!supabaseUrl || !serviceRoleKey || !resendKey || !emailFrom || !reviewerEmail) {
    return respuesta({ error: "Falta configurar el servicio de correo institucional." }, 503);
  }

  try {
    const body = await request.json();
    const applicationId = String(body?.application_id || "");
    const kind = String(body?.kind || "");
    if (!/^[0-9a-f-]{36}$/i.test(applicationId) || !["received", "decision"].includes(kind)) {
      return respuesta({ error: "La solicitud no es válida." }, 400);
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    if (kind === "decision") {
      const authorization = request.headers.get("Authorization");
      if (!authorization?.startsWith("Bearer ")) return respuesta({ error: "Debes iniciar sesión como administrador." }, 401);
      const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
      if (!publishableKey) return respuesta({ error: "Falta la clave pública de Supabase." }, 503);
      const caller = createClient(supabaseUrl, publishableKey, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: userError } = await caller.auth.getUser();
      if (userError || !userData.user) return respuesta({ error: "La sesión venció. Inicia sesión de nuevo." }, 401);
      const { data: isAdmin, error: adminError } = await caller.rpc("ecoreto_es_administrador");
      if (adminError || !isAdmin) return respuesta({ error: "Solo el equipo autorizado puede enviar la decisión." }, 403);
    }

    const { data: application, error: applicationError } = await admin
      .from("institution_applications")
      .select("id,institution_name,city,country,institutional_email,status,competition_id,receipt_email_sent_at,decision_email_sent_at")
      .eq("id", applicationId)
      .single();
    if (applicationError || !application) return respuesta({ error: "No encontramos la solicitud institucional." }, 404);

    let subject = "EcoReto recibió tu solicitud institucional";
    let message = `Recibimos la solicitud de ${application.institution_name}, ${application.city}, ${application.country}. El equipo de EcoReto revisará los datos y el dominio institucional. Si se aprueba, enviaremos el código privado a este correo.`;
    const timestampField = kind === "received" ? "receipt_email_sent_at" : "decision_email_sent_at";
    if (kind === "received" && application.status !== "pending") return respuesta({ error: "La solicitud ya no está pendiente." }, 409);

    if (kind === "decision") {
      if (application.status === "pending") return respuesta({ error: "La solicitud todavía no ha sido revisada." }, 409);
      if (application.status === "approved") {
        if (!application.competition_id) return respuesta({ error: "No encontramos el ranking aprobado." }, 409);
        const { data: competition, error: competitionError } = await admin.from("ranking_competitions")
          .select("invite_code").eq("id", application.competition_id).single();
        if (competitionError || !competition?.invite_code) return respuesta({ error: "No encontramos el código del ranking aprobado." }, 409);
        subject = `EcoReto aprobó el ranking de ${application.institution_name}`;
        message = `La solicitud de ${application.institution_name}, ${application.city}, ${application.country}, fue aprobada. Comparte este código únicamente con estudiantes y personal autorizados: ${competition.invite_code}. En EcoReto, elijan Ranking institucional y escriban el código para unirse al ranking privado.`;
      } else {
        subject = `Actualización sobre la solicitud de ${application.institution_name}`;
        message = `El equipo de EcoReto revisó la solicitud de ${application.institution_name}, ${application.city}, ${application.country}. En esta ocasión no fue aprobada. Puedes responder a este correo para consultar los siguientes pasos.`;
      }
    }

    if (application[timestampField]) return respuesta({ sent: true, already_sent: true });
    const { data: claim, error: claimError } = await admin.from("institution_applications")
      .update({ [timestampField]: new Date().toISOString() })
      .eq("id", applicationId).is(timestampField, null).select("id").maybeSingle();
    if (claimError) return respuesta({ error: "No pudimos reservar el envío del mensaje." }, 503);
    if (!claim) return respuesta({ sent: true, already_sent: true });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: emailFrom,
        to: [application.institutional_email],
        reply_to: reviewerEmail,
        ...(application.institutional_email.toLowerCase() !== reviewerEmail.toLowerCase() ? { cc: [reviewerEmail] } : {}),
        subject,
        text: `${message}\n\nEcoReto · Rankings institucionales`,
        html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#244b37;line-height:1.6"><h1 style="color:#237448">EcoReto</h1><p>${escaparHtml(message)}</p><p style="color:#66776d">EcoReto · Rankings institucionales</p></main>`,
      }),
    });
    if (!emailResponse.ok) {
      await admin.from("institution_applications").update({ [timestampField]: null }).eq("id", applicationId);
      console.error("El proveedor no pudo enviar el correo institucional", emailResponse.status);
      return respuesta({ error: "El proveedor de correo no pudo enviar el mensaje." }, 502);
    }
    return respuesta({ sent: true });
  } catch (error) {
    console.error("No se pudo enviar el correo institucional:", error instanceof Error ? error.message : "error desconocido");
    return respuesta({ error: "No se pudo completar el envío del correo." }, 500);
  }
});
