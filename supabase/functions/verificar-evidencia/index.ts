const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método no permitido." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Inicia sesión para enviar evidencia." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (!publishableKey) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
      publishableKey = Object.values(keys).find((value) => typeof value === "string" && value.startsWith("sb_publishable_")) as string | undefined;
    } catch { /* Algunos proyectos exponen únicamente la llave legacy. */ }
  }
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json({ error: "Falta configurar la función segura de Supabase." }, 503);

  try {
    const body = await request.json();
    const type = body?.type === "challenge" ? "challenge" : body?.type === "publication" ? "publication" : null;
    const imagePath = String(body?.image_path || "");
    const submissionId = String(body?.submission_id || "");
    if (!type || imagePath.length > 300 || imagePath.includes("..") || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
      return json({ error: "No pudimos reconocer el envío. Vuelve a seleccionar la foto." }, 400);
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: authError } = await userClient.auth.getUser();
    const user = userData?.user;
    if (authError || !user) return json({ error: "La sesión venció. Inicia sesión de nuevo." }, 401);

    const ownsPath = imagePath.startsWith(`${user.id}/`);
    const isChallengePath = imagePath.startsWith(`${user.id}/retos/`);
    if (!ownsPath || (type === "challenge") !== isChallengePath || !/^[0-9a-zA-Z_./-]+$/.test(imagePath)) {
      return json({ error: "La foto no corresponde a tu cuenta o al tipo de envío." }, 403);
    }

    const actionText = String(body?.action_text || "").trim().slice(0, 500);
    const challengeIdInput = Number(body?.challenge_id);
    if (type === "challenge" && (!Number.isSafeInteger(challengeIdInput) || challengeIdInput <= 0)) return json({ error: "El reto seleccionado no es válido." }, 400);
    if (type === "publication" && actionText.length < 3) return json({ error: "Selecciona o describe la acción ecológica." }, 400);

    // Reintentar una petición tras una caída de red no debe duplicar puntos.
    const previousQuery = type === "challenge"
      ? await adminClient.from("retos_completados").select("reto_id,puntos,evidencia_url").eq("user_id", user.id).eq("verification_id", submissionId).maybeSingle()
      : await adminClient.from("posts").select("contenido,puntos,image_url").eq("user_id", user.id).eq("verification_id", submissionId).maybeSingle();
    if (previousQuery.error) return json({ error: "No se pudo comprobar si este envío ya fue registrado." }, 503);
    if (previousQuery.data) {
      const mismoDestino = type === "challenge"
        ? Number(previousQuery.data.reto_id) === challengeIdInput
        : String(previousQuery.data.contenido) === actionText;
      const previousImagePath = type === "challenge" ? previousQuery.data.evidencia_url : previousQuery.data.image_url;
      if (previousImagePath !== imagePath) await adminClient.storage.from("post-images").remove([imagePath]);
      if (!mismoDestino) return json({ error: "Este identificador ya se usó en otro envío. Vuelve a seleccionar la foto." }, 409);
      return json({ approved: true, points_awarded: Number(previousQuery.data.puntos) || 0, message: "Esta evidencia ya se había guardado y sus puntos ya fueron registrados." });
    }

    const { data: image, error: imageError } = await userClient.storage.from("post-images").download(imagePath);
    if (imageError || !image) return json({ error: "No pudimos leer la foto privada que subiste." }, 400);
    if (image.size > 5 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(image.type)) {
      await adminClient.storage.from("post-images").remove([imagePath]);
      return json({ error: "La imagen excede 5 MB o su formato no está permitido." }, 400);
    }
    const imageBytes = new Uint8Array(await image.arrayBuffer());
    const imageHash = await sha256Hex(imageBytes);
    const { data: repeatedEvidence, error: repeatedEvidenceError } = await adminClient
      .from("evidence_fingerprints").select("image_hash").eq("user_id", user.id).eq("image_hash", imageHash).maybeSingle();
    if (repeatedEvidenceError) {
      await adminClient.storage.from("post-images").remove([imagePath]);
      return json({ error: "No se pudo comprobar si ya usaste esta foto. No se otorgaron puntos; inténtalo más tarde." }, 503);
    }
    if (repeatedEvidence) {
      await adminClient.storage.from("post-images").remove([imagePath]);
      return json({ approved: false, verdict: "duplicate", message: "Esta misma foto ya se usó para obtener puntos. Envía una foto nueva de esta actividad." }, 409);
    }
    let challengeId: number | null = null;
    let challengePoints = 0;
    if (type === "challenge") {
      challengeId = challengeIdInput;
      const { data: challenge, error: challengeError } = await userClient
        .from("retos").select("id,titulo,descripcion,puntos").eq("id", challengeId).single();
      if (challengeError || !challenge) return json({ error: "No encontramos el reto seleccionado." }, 404);
      challengePoints = Math.max(0, Number(challenge.puntos) || 0);
    }

    // La restricción única impide que dos solicitudes simultáneas reutilicen la misma foto.
    const { error: fingerprintError } = await adminClient.from("evidence_fingerprints").insert({
      user_id: user.id, image_hash: imageHash, evidence_type: type,
    });
    if (fingerprintError) {
      await adminClient.storage.from("post-images").remove([imagePath]);
      if (fingerprintError.code === "23505") {
        return json({ approved: false, verdict: "duplicate", message: "Esta misma foto ya se usó para obtener puntos. Envía una foto nueva de esta actividad." }, 409);
      }
      console.error("No se pudo registrar la huella de evidencia:", fingerprintError.code || fingerprintError.message);
      return json({ error: "No pudimos proteger el registro contra fotos repetidas. No se otorgaron puntos." }, 500);
    }

    if (type === "challenge") {
      const { error } = await adminClient.from("retos_completados").insert({
        user_id: user.id, reto_id: challengeId, evidencia_url: imagePath, puntos: challengePoints, verification_id: submissionId,
      });
      if (error) {
        await adminClient.from("evidence_fingerprints").delete().eq("user_id", user.id).eq("image_hash", imageHash);
        await adminClient.storage.from("post-images").remove([imagePath]);
        if (error.code === "23505") return json({ error: "Ya completaste este reto en el periodo actual." }, 409);
        console.error("No se pudo registrar el reto:", error.code || error.message);
        return json({ error: "Recibimos la foto, pero no pudimos guardar el reto. Inténtalo otra vez." }, 500);
      }
      return json({ approved: true, points_awarded: challengePoints, message: `Evidencia enviada. Ganaste +${challengePoints} puntos.` });
    }

    const { error } = await adminClient.from("posts").insert({
      user_id: user.id, contenido: actionText, image_url: imagePath, puntos: 20, verification_id: submissionId,
    });
    if (error) {
      await adminClient.from("evidence_fingerprints").delete().eq("user_id", user.id).eq("image_hash", imageHash);
      await adminClient.storage.from("post-images").remove([imagePath]);
      console.error("No se pudo guardar la publicación:", error.code || error.message);
      return json({ error: "Recibimos la foto, pero no pudimos guardar la publicación. Inténtalo otra vez." }, 500);
    }
    return json({ approved: true, points_awarded: 20, message: "Publicación realizada. Ganaste +20 puntos." });
  } catch (error) {
    console.error("Error al verificar evidencia:", error instanceof Error ? error.message : "error desconocido");
    return json({ error: "No se pudo guardar la evidencia. Inténtalo de nuevo más tarde." }, 500);
  }
});
