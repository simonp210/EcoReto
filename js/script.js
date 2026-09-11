/* =========================================================
   RUTAS Y NAVEGACIÓN
   ========================================================= */

function estaEnPages() {
    return /\/pages(?:\/|$)/i.test(location.pathname);
}

function rutaLogin() {
    return estaEnPages() ? "login.html" : "pages/login.html";
}

function rutaLoginAbsoluta() {
    // Genera la URL absoluta adecuada para el callback de Supabase
    const base = window.location.origin;
    const path = window.location.pathname;

    if (path.includes("/pages/")) {
        return `${base}${path.substring(0, path.indexOf("/pages/"))}/pages/login.html`;
    }
    
    return `${base}/pages/login.html`;
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

function validarImagen(archivo) {
    const MAXIMO_BYTES = 5 * 1024 * 1024;

    if (!archivo) return "Debes seleccionar una imagen.";
    if (!archivo.type?.startsWith("image/")) return "El archivo debe ser una imagen.";
    if (archivo.size > MAXIMO_BYTES) return "La imagen no puede superar los 5 MB.";

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
    if (puntos >= 800)  return "🌲 Bosque Protector";
    if (puntos >= 400)  return "🌳 Árbol Robusto";
    if (puntos >= 100)  return "🌿 Brote Ecológico";

    return "🌱 Semilla Verde";
}

function obtenerSiguienteRango(puntos) {
    puntos = Number(puntos) || 0;

    if (puntos < 100)  return { nombre: "🌿 Brote Ecológico", meta: 100, anterior: 0 };
    if (puntos < 400)  return { nombre: "🌳 Árbol Robusto", meta: 400, anterior: 100 };
    if (puntos < 800)  return { nombre: "🌲 Bosque Protector", meta: 800, anterior: 400 };
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

async function registrarUsuario() {
    const nombre = document.getElementById("nombre")?.value.trim();
    const correo = document.getElementById("correo")?.value.trim().toLowerCase();
    const password = document.getElementById("password")?.value;
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre || !correo || !password) {
        alert("Completa todos los campos 🌱");
        return;
    }

    if (!formatoCorreo.test(correo)) {
        alert("El correo no es válido 📧");
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
                alert("Este correo ya está registrado. Intenta iniciar sesión. 📧");
                window.location.href = rutaLogin();
            } else if (mensaje.includes("password")) {
                alert("La contraseña debe tener al menos 6 caracteres (entre numeros y letras). 🔒");
            } else {
                alert("Error al registrar: " + error.message);
            }
            return;
        }

        if (data?.user && data.user.identities && data.user.identities.length === 0) {
            alert("Este correo ya está registrado. Por favor inicia sesión. 📧");
            window.location.href = rutaLogin();
            return;
        }

        if (data?.session) {
            await asegurarPerfil(data.user);
            alert("✅ Registro realizado correctamente.");
            window.location.href = rutaApp();
            return;
        }

        alert("✅ Registro realizado.\n\nRevisa tu correo electrónico para confirmar tu cuenta e iniciar sesión. 📧🌱");
        window.location.href = rutaLogin();

    } catch (error) {
        console.error("Error inesperado en registro:", error);
        alert("No se pudo conectar con EcoReto. Revisa tu conexión.");
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

        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password
        });

        if (error) {
            console.error("Error de inicio de sesión:", error);
            const mensaje = String(error?.message || "").toLowerCase();

            if (mensaje.includes("email not confirmed") || mensaje.includes("email_not_confirmed")) {
                alert("Debes verificar tu correo electrónico antes de iniciar sesión 📧");
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
        window.location.href = rutaApp();

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Ocurrió un error inesperado.");
    }
}

async function cerrarSesionUsuario() {
    try {
        const supabase = await obtenerCliente();
        await supabase.auth.signOut();
        // En lugar de reload(), redirigimos directamente a la pantalla de login
        window.location.href = rutaLogin();
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        window.location.href = rutaLogin();
    }
}

/* =========================================================
   GESTIÓN DE PERFIL Y SESIÓN
   ========================================================= */

async function asegurarPerfil(user) {
    if (!user?.id) return false;

    try {
        const supabase = await obtenerCliente();
        const nombre = user.user_metadata?.username || user.user_metadata?.name || user.email?.split("@")[0] || "Usuario";

        const { error } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    username: nombre,
                    puntos: 0,
                    rango: obtenerRango(0)
                },
                { onConflict: "id", ignoreDuplicates: true }
            );

        if (error) {
            console.error("Error al asegurar perfil:", error);
            return false;
        }
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
        const { data: { user }, error: errorUsuario } = await supabase.auth.getUser();

        if (errorUsuario || !user) return;

        await asegurarPerfil(user);

        const { data: perfil } = await supabase
            .from("profiles")
            .select("username,puntos,rango")
            .eq("id", user.id)
            .maybeSingle();

        const nombre = perfil?.username || user.user_metadata?.username || "Usuario";
        const puntos = Number(perfil?.puntos) || 0;
        const rango = perfil?.rango || obtenerRango(puntos);

        

    } catch (error) {
        console.error("Error cargando usuario:", error);
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

async function mostrarSeccion(seccion) {
    actualizarMenuActivo(seccion);
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    if (seccion === "inicio") { window.location.reload(); return; }
    if (seccion === "publicar") { mostrarPublicar(); return; }
    if (seccion === "retos") { await mostrarRetos(); return; }
    if (seccion === "ranking") { await mostrarRanking(); return; }
    if (seccion === "rangos") { await mostrarRangos(); return; }
    if (seccion === "perfil") { await mostrarPerfil(); return; }

    if (seccion === "nosotros") {
        contenido.innerHTML = `
            <section class="paginaInterna" style="max-width: 900px; margin: 0 auto; text-align: center; padding: 25px;">
                <span class="etiqueta" style="font-size: 0.85rem; letter-spacing: 1.5px;">CONÓCENOS</span>
                <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Sobre EcoReto 🌎</h1>
                <p style="text-align: center; font-size: 1.10rem; margin-bottom: 25px; max-width: 750px; margin-left: auto; margin-right: auto; color: #555;">EcoReto busca convertir pequeñas acciones ambientales en hábitos con impacto positivo.</p>
                
                <div class="infoGrande" style="text-align: left; margin-top: 15px; padding: 30px; font-size: 1.05rem;">
                    <h2 style="font-size: 1.6rem; margin-bottom: 10px;">🌱 ¿Qué es EcoReto?</h2>
                    <p style="margin-bottom: 20px; line-height: 1.6;">EcoReto es una plataforma que busca motivar a las personas a cuidar el medio ambiente mediante pequeñas acciones que generan grandes cambios. Los usuarios pueden realizar acciones como reciclar, ahorrar agua, reutilizar materiales y proteger la naturaleza, subir evidencias y obtener puntos por sus acciones.</p>
                    
                    <h2 style="font-size: 1.6rem; margin-bottom: 10px;">🎯 Nuestra misión</h2>
                    <p style="line-height: 1.6;">Convertir el cuidado del medio ambiente en un hábito divertido, participativo y constante, incentivando a las personas a contribuir con acciones sencillas desde su vida cotidiana.</p>
                </div>
            </section>`;
        return;
    }

    if (seccion === "contacto") {
        contenido.innerHTML = `
            <section class="paginaInterna">
                <span class="etiqueta">ECORRETO</span>
                <h1>Contacto 📱</h1>
                <p>Próximamente encontrarás aquí nuestras redes sociales y soporte.</p>
            </section>`;
    }
}

/* =========================================================
   PUBLICACIONES
   ========================================================= */

let accionSeleccionada = "";

function seleccionarAccion(elemento, textoAccion) {
    document.querySelectorAll(".boton-accion-rapida").forEach(btn => btn.classList.remove("seleccionado"));
    elemento.classList.add("seleccionado");
    
    accionSeleccionada = textoAccion;
    const campoOtro = document.getElementById("campoOtroContenedor");
    
    if (textoAccion === "Otros") {
        campoOtro.style.display = "block";
    } else {
        campoOtro.style.display = "none";
    }
}

async function mostrarPublicar() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    contenido.innerHTML = `<p style="text-align:center;">Cargando muro...</p>`;

    try {
        const supabase = await obtenerCliente();

        const { data: posts, error } = await supabase
            .from("posts")
            .select("*, profiles(nombre)")
            .order("creado_el", { ascending: false });

        const listaPostsHTML = (posts || []).map(post => `
            <div class="tarjeta-publicacion">
                <p>🌱 <strong>${escaparHTML(post.profiles?.nombre || "Usuario")}:</strong> ${escaparHTML(post.contenido)}</p>
                ${post.imagen_url ? `<img src="${post.imagen_url}" class="imagen-post-muro" alt="Evidencia ecológica" />` : ''}
                <span class="badget-puntos-post">+20 pts ganados</span>
            </div>
        `).join("");

        // Dentro de mostrarPublicar(), en la parte del HTML:
contenido.innerHTML = `
    <section class="paginaInterna" style="max-width: 500px; margin: 0 auto; text-align: center;">
        <h1 style="color: #2e7d32; font-size: 2.2rem; margin-bottom: 5px;">EcoReto 🌱</h1>
        <p style="color: #555; margin-bottom: 25px;">Cuidemos el planeta, una acción a la vez.</p>

        <!-- TARJETA DEL FORMULARIO -->
        <div class="card-formulario-publicar">
            <h2 style="font-size: 1.4rem; margin-bottom: 15px; color: #333;">Nueva publicación</h2>
            
            <select id="selectAccionEco" class="input-desplegable-eco" onchange="evaluarOpcionPublicar(this.value)">
                <option value="" disabled selected>Selecciona tu acción ecológica...</option>
                <option value="Reciclar ♻️">Reciclar ♻️</option>
                <option value="Ahorrar agua 🚰">Ahorrar agua 🚰</option>
                <option value="Sembrar o cuidar plantas 🌱">Sembrar o cuidar plantas 🌱</option>
                <option value="Limpié un lugar 🧹">Limpié un lugar 🧹</option>
                <option value="Ayudé un animal 🐾">Ayudé un animal 🐾</option>
                <option value="Otros">Otros...</option>
            </select>

            <div id="contenedorCampoOtros" style="display: none; margin-top: 10px;">
                <input type="text" id="inputAccionOtros" class="input-desplegable-eco" placeholder="Escribe la acción personalizada..." />
            </div>

            <div class="contenedor-input-file">
                <label for="inputFotoEco" class="label-input-file">
                    📷 Subir o tomar foto
                </label>
                <input type="file" id="inputFotoEco" accept="image/*" capture="environment" onchange="mostrarNombreArchivo(this)" />
                <span id="nombreArchivoSeleccionado" class="texto-archivo-nombre">Sin archivo seleccionado</span>
            </div>

            <button class="btn-publicar-verde" onclick="enviarPublicacionConPuntos()">Publicar (+20 pts)</button>
        </div>

        <h2 style="font-size: 1.4rem; margin-top: 40px; margin-bottom: 15px;">Tus publicaciones</h2>
        <div class="lista-muro-publicaciones">
            ${listaPostsHTML || '<div class="tarjeta-publicacion"><p>Aún no hay publicaciones. ¡Sé el primero!</p></div>'}
        </div>
    </section>`;

    } catch (err) {
        console.error("Error al cargar publicaciones:", err);
    }
}

function mostrarNombreArchivo(input) {
    const span = document.getElementById("nombreArchivoSeleccionado");
    if (input.files && input.files[0]) {
        span.textContent = input.files[0].name;
    } else {
        span.textContent = "Sin archivo seleccionado";
    }
}

async function enviarPublicacionConPuntos() {
    const select = document.getElementById("selectAccionEco");
    let valorFinal = select.value;

    if (valorFinal === "Otros") {
        const inputOtro = document.getElementById("inputAccionOtros");
        valorFinal = inputOtro?.value.trim() || "";
    }

    if (!valorFinal) {
        alert("Por favor selecciona o escribe una acción.");
        return;
    }

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Debes iniciar sesión para publicar.");
            return;
        }

        // 1. Guardar publicación en la tabla posts
        const { error: errPost } = await supabase
            .from("posts")
            .insert([{ user_id: user.id, contenido: valorFinal }]);

        if (errPost) throw errPost;

        // 2. Sumar +10 puntos al perfil del usuario
        const { data: perfil } = await supabase
            .from("profiles")
            .select("puntos")
            .eq("id", user.id)
            .maybeSingle();

        const puntosActuales = Number(perfil?.puntos) || 0;
        const nuevosPuntos = puntosActuales + 20;
        const nuevoRango = obtenerRango(nuevosPuntos);

        await supabase
            .from("profiles")
            .update({ puntos: nuevosPuntos, rango: nuevoRango })
            .eq("id", user.id);

        alert("¡Publicación realizada! Ganaste +20 puntos. 🎉");
        await cargarUsuario();
        await mostrarPublicar();

    } catch (err) {
        console.error("Error al publicar:", err);
        alert("Error al guardar la publicación.");
    }
}

async function configurarFormularioPublicar() {
    const formPublicar = document.getElementById("formPublicar"); 
    if (!formPublicar) return;

    formPublicar.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Debes iniciar sesión para publicar.");
            return;
        }

        const descripcion = document.getElementById("descripcionPublicacion").value;
        const archivoInput = document.getElementById("archivoPublicacion");
        const archivo = archivoInput.files[0];

        if (!archivo) {
            alert("Por favor selecciona una foto o evidencia.");
            return;
        }

        try {
            // 1. Subir la imagen al Storage de Supabase
            const nombreArchivo = `${user.id}_${Date.now()}_${archivo.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("publicaciones") 
                .upload(nombreArchivo, archivo);

            if (uploadError) throw uploadError;

            // 2. Obtener la URL pública de la imagen
            const { data: { publicUrl } } = supabase.storage
                .from("publicaciones")
                .getPublicUrl(nombreArchivo);

            // 3. Guardar el registro en la tabla de publicaciones
            const { error: dbError } = await supabase
                .from("publicaciones")
                .insert([
                    { usuario_id: user.id, descripcion: descripcion, imagen_url: publicUrl, puntos_otorgados: 20 }
                ]);

            if (dbError) throw dbError;

            // 4. Actualizar los puntos totales del usuario
            await sumarPuntosUsuario(user.id, 20);

            alert("¡Publicación subida con éxito y puntos sumados!");
            formPublicar.reset();
            mostrarSeccion('inicio');

        } catch (err) {
            console.error("Error al publicar:", err);
            alert("Hubo un error al subir tu publicación.");
        }
    });
}

function evaluarOpcionPublicar(valor) {
    const contenedorOtros = document.getElementById("contenedorCampoOtros");
    if (valor === "Otros") {
        contenedorOtros.style.display = "block";
    } else {
        contenedorOtros.style.display = "none";
    }
}

async function enviarPublicacionDesplegable() {
    const select = document.getElementById("selectAccionEco");
    let valorFinal = select.value;

    if (valorFinal === "Otros") {
        const inputOtro = document.getElementById("inputAccionOtros");
        valorFinal = inputOtro?.value.trim() || "";
    }

    if (!valorFinal) {
        alert("Por favor selecciona o escribe una acción.");
        return;
    }

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Debes iniciar sesión para publicar.");
            return;
        }

        const { error } = await supabase
            .from("posts")
            .insert([{ user_id: user.id, contenido: valorFinal }]);

        if (error) throw error;

        alert("¡Publicación realizada! 🌱");
        await mostrarPublicar();

    } catch (err) {
        console.error("Error al publicar:", err);
        alert("Error al guardar la publicación.");
    }
}

async function enviarPublicacion() {
    let mensajeFinal = accionSeleccionada;

    if (accionSeleccionada === "Otros") {
        const inputOtro = document.getElementById("textoAccionPersonalizada");
        mensajeFinal = inputOtro?.value.trim() || "";
    }

    if (!mensajeFinal) {
        alert("Por favor selecciona una acción o escribe una opción.");
        return;
    }

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Debes iniciar sesión para publicar.");
            return;
        }

        const { error } = await supabase
            .from("posts")
            .insert([{ user_id: user.id, contenido: mensajeFinal }]);

        if (error) throw error;

        alert("¡Publicación enviada con éxito! 🎉");
        accionSeleccionada = "";
        await mostrarInicio();

    } catch (err) {
        console.error("Error al publicar:", err);
        alert("Ocurrió un error al guardar la publicación.");
    }
}

/* =========================================================
   RANKING Y RANGOS
   ========================================================= */

async function mostrarRanking() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    contenido.innerHTML = `<p style="text-align:center;">Cargando clasificación...</p>`;

    try {
        const supabase = await obtenerCliente();
        
        const { data: usuarios, error } = await supabase
            .from("profiles")
            .select("username, puntos, rango")
            .order("puntos", { ascending: false });

        if (error) throw error;

        // Obtener el usuario logueado de forma más directa si es posible
        const usuarioLogueado = document.querySelector('.usuario-activo, [id*="usuario"], nav .perfil span, header span')?.textContent?.trim().toLowerCase() || 
                                localStorage.getItem('usuarioActivo')?.trim().toLowerCase();

        const filasHTML = (usuarios || []).map((u, i) => {
            const puesto = i + 1;
            const nombrePerfilFila = (u.username || u.nombre || '').trim().toLowerCase();
            const esMiPerfil = (usuarioLogueado && nombrePerfilFila === usuarioLogueado);

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
                    <span class="col-usuario"><strong>${escaparHTML(u.username || "EcoAmigo")}</strong></span>
                    <span class="col-rango"><span class="badge-rango">${escaparHTML(u.rango || "Semilla Verde")}</span></span>
                    <span class="col-puntos">${u.puntos} pts</span>
                </div>
            `;
        }).join('');

        contenido.innerHTML = `
            <section class="paginaInterna">
                <span class="etiqueta">TABLA DE LÍDERES</span>
                <h1>Ranking Global 🏆</h1>
                
                <div class="tabla-estilo-fifa">
                    <div class="cabecera-tabla">
                        <span>RK</span>
                        <span>USUARIO</span>
                        <span>RANGO</span>
                        <span>PUNTOS</span>
                    </div>
                    <div class="cuerpo-tabla">
                        ${filasHTML || '<p style="text-align:center; padding: 20px;">No hay usuarios registrados.</p>'}
                    </div>
                </div>
            </section>
        `;

    } catch (err) {
        console.error("Error al cargar ranking:", err);
        contenido.innerHTML = `<p style="text-align:center; color: red;">Error al cargar la tabla de líderes.</p>`;
    }
}

async function cargarRanking() {
    const supabase = await obtenerCliente();
    const { data: usuarios, error } = await supabase
        .from("profiles")
        .select("username, puntos, rango")
        .order("puntos", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Detalle del error de Supabase:", error.message);
        return;
    }

if (nombreSeccion === 'ranking') {
    cargarRanking();
}

    mostrarUsuariosEnPantalla(usuarios);
}

function filtrarRanking() {
    const texto = document.getElementById("buscadorAmigos").value.toLowerCase();
    const filas = document.querySelectorAll(".fila-tabla-ranking");
    
    filas.forEach(fila => {
        const nombre = fila.querySelector(".col-usuario").textContent.toLowerCase();
        fila.style.display = nombre.includes(texto) ? "flex" : "none";
    });
}

function mostrarUsuariosEnPantalla(usuarios) {
    const contenedorRanking = document.getElementById("contenedorRanking");
    if (!contenedorRanking) return;

    let html = "";
    usuarios.forEach((user, index) => {
        html += `
            <div class="fila-ranking">
                <span># ${index + 1}</span>
                <strong>${escaparHTML(user.username)}</strong>
                <span>⭐ ${user.puntos} pts</span>
                <span>${escaparHTML(user.rango)}</span>
            </div>
        `;
    });

    contenedorRanking.innerHTML = html;
}

async function mostrarRangos() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    let puntos = 0;
    let rango = obtenerRango(0);

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();

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
    let progreso = 100;

    if (puntos < 1000) {
        const total = siguiente.meta - siguiente.anterior;
        progreso = total > 0 ? ((puntos - siguiente.anterior) / total) * 100 : 0;
        progreso = Math.max(0, Math.min(100, progreso));
    }

    contenido.innerHTML = `
        <section class="paginaInterna">
            <span class="etiqueta">PROGRESO</span>
            <h1>Tus rangos 🏆</h1>
            <p>Avanza con acciones.</p>

            <div class="rankingPrincipal tarjetaPrincipalActual" style="padding-top: 40px; padding-bottom: 40px; margin-top: 30px;">
                 <span class="badge-tu-rango">TU RANGO ACTUAL</span>
                 <h2>${escaparHTML(rango)}</h2>
                 <strong>⭐ ${puntos} puntos</strong>
                 <p>${puntos >= 1000 ? "Has alcanzado el rango máximo." : "Siguiente: " + escaparHTML(siguiente.nombre)}</p>
            <div class="barraProgreso">
                <div style="width:${progreso}%"></div>
            </div>
       </div>

            <div class="grid-rangos">    
                <article class="retoGrande rango-semilla"><h2>🌱 Semilla Verde</h2><p>0 - 99 pts</p></article>
                <article class="retoGrande rango-brote"><h2>🌿 Brote Ecológico</h2><p>100 - 399 pts</p></article>
                <article class="retoGrande rango-arbol"><h2>🌳 Árbol Robusto</h2><p>400 - 799 pts</p></article>
                <article class="retoGrande rango-bosque"><h2>🌲 Bosque Protector</h2><p>800 - 999 pts</p></article>
                <article class="retoGrande rango-ecosistema"><h2>🏞️ Ecosistema</h2><p>1000 - 1499 pts</p></article>
                <article class="retoGrande rango-protector"><h2>🛡️ Protector Ambiental</h2><p>1500 - 1999 pts</p></article>
                <article class="retoGrande rango-Heroe"><h2>🦸 Héroe Ecológico</h2><p>2000 - 2499 pts</p></article>
                <article class="retoGrande rango-Leyenda"><h2>🏆 Leyenda Planetaria</h2><p>2500 - 3499 pts</p></article>
                <article class="retoGrande rango-guardian"><h2>👑 Guardián del Planeta</h2><p>3500 - 4999 pts</p></article>
                <article class="retoGrande rango-ecoreto"><h2>🔰 EcoReto</h2><p>5000+ pts</p></article>                
            </div>
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
        const { data: { user } } = await supabase.auth.getUser();

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

            if (reto.tipo === 'diario') return esMismoDia(registro.completado_el);
            if (reto.tipo === 'semanal') return esMismaSemana(registro.completado_el);
            return false; // Los fugaces se pueden manejar por tiempo o sesión
        };

        const retosDiarios = (listaRetos || []).filter(r => r.tipo === 'diario');
        const retosSemanales = (listaRetos || []).filter(r => r.tipo === 'semanal');
        const retosFugaces = (listaRetos || []).filter(r => r.tipo === 'fugaz' || r.tipo === 'flash');

        const hoy = new Date();
        const diaDelAno = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const numeroSemana = Math.ceil(diaDelAno / 7);

        const retoDiarioHoy = retosDiarios.length > 0 ? [retosDiarios[diaDelAno % retosDiarios.length]] : [];
        const retoSemanalHoy = retosSemanales.length > 0 ? [retosSemanales[numeroSemana % retosSemanales.length]] : [];
        const retoFugazHoy = retosFugaces.length > 0 ? [retosFugaces[diaDelAno % retosFugaces.length]] : [{ id: 999, titulo: "Desconexión Flash", descripcion: "Apaga los dispositivos no esenciales durante 2 horas.", puntos: 50, icono: "🔥", tipo: "fugaz" }];

        contenido.innerHTML = `
            <section class="paginaInterna">
                <span class="etiqueta">DESAFÍOS</span>
                <h1>Reto Ecológico Activo 🎯</h1>
                <p>Completa las acciones para sumar puntos y subir de rango.</p>

                <h2 style="margin-top: 25px; color: #ef6c00;">🔥 Reto Fugaz (Flash - Tiempo Limitado)</h2>
                <div class="grid-retos">${generarHTMLTarjetas(retoFugazHoy, estaBloqueado, user)}</div>
                <div class="cronometro-aviso" style="font-size: 0.85rem; color: #d84315; margin-top: 5px; margin-bottom: 20px;">⏱️ Quedan pocas horas para completar este reto antes de que expire.</div>

                <h2 style="margin-top: 25px; color: #2e7d32;">⚡ Reto del Día</h2>
                <div class="grid-retos">${generarHTMLTarjetas(retoDiarioHoy, estaBloqueado, user)}</div>

                <h2 style="margin-top: 35px; color: #1565c0;">📅 Reto de la Semana</h2>
                <div class="grid-retos">${generarHTMLTarjetas(retoSemanalHoy, estaBloqueado, user)}</div>
            </section>`;

    } catch (err) {
        console.error("Error al cargar retos:", err);
        contenido.innerHTML = `<p style="text-align:center;">Error al cargar los retos.</p>`;
    }
}

function generarHTMLTarjetas(lista, fnBloqueado, usuarioActivo) {
    if (!lista || lista.length === 0) return `<p>No hay retos disponibles.</p>`;

    return lista.map(reto => {
        const bloqueado = usuarioActivo ? fnBloqueado(reto) : false;

        return `
            <article class="tarjeta-reto ${bloqueado ? 'reto-desactivado' : ''}">
                <div class="icono-reto">${reto.icono || '🌱'}</div>
                <div class="info-reto">
                    <h3>${escaparHTML(reto.titulo)}</h3>
                    <p>${escaparHTML(reto.descripcion)}</p>
                    <span class="puntos-badge">+${reto.puntos} Pts</span>
                </div>
                <button 
                    class="${bloqueado ? 'btn-bloqueado' : 'btn-secundario'}" 
                    ${bloqueado ? 'disabled' : ''} 
                    onclick="procesarReto(${reto.id}, ${reto.puntos})">
                    ${bloqueado ? 'Completado ✓' : 'Completar'}
                </button>
            </article>`;
    }).join('');
}

async function procesarReto(idReto, puntosReto) {
    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Debes iniciar sesión para realizar retos.");
            return;
        }

        // 1. Guardar en el historial
        const { error: errHistorial } = await supabase
            .from("retos_completados")
            .insert([{ user_id: user.id, reto_id: idReto }]);
        if (errHistorial) throw errHistorial;

        // 2. Obtener puntos actuales
        const { data: perfil, error: errConsultaPerfil } = await supabase
            .from("profiles")
            .select("puntos, nombre")
            .eq("id", user.id)
            .maybeSingle();

        if (errConsultaPerfil) throw errConsultaPerfil;

        const puntosActuales = Number(perfil?.puntos) || 0;
        const nuevosPuntos = puntosActuales + Number(puntosReto);
        const nuevoRango = obtenerRango(nuevosPuntos);

        // 3. Guardar/Actualizar puntos y rango usando upsert
        const nombreUsuario = perfil?.nombre || user.user_metadata?.nombre || user.email?.split('@')[0] || "Usuario";

        const { error: errPerfil } = await supabase
            .from("profiles")
            .upsert({ 
                id: user.id, 
                nombre: nombreUsuario,
                puntos: nuevosPuntos, 
                rango: nuevoRango 
            });

        if (errPerfil) throw errPerfil;

        alert(`¡Felicidades! Ganaste +${puntosReto} puntos. 🎉`);
        await cargarUsuario();
        await mostrarRetos();

    } catch (err) {
        console.error("Error al procesar reto:", err);
        alert("Ocurrió un error al registrar el reto.");
    }
}

/* =========================================================
   PERFIL DE USUARIO
   ========================================================= */

async function mostrarPerfil() {
    const contenido = document.getElementById("contenido");
    if (!contenido) return;

    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            contenido.innerHTML = `<p style="text-align:center; font-size: 1.2rem;">Debes <a href="${rutaLogin()}">iniciar sesión</a> para ver tu perfil.</p>`;
            return;
        }

        const { data: perfil } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        const puntos = perfil?.puntos || 0;
        const nombreRango = perfil?.rango || obtenerRango(puntos);

        contenido.innerHTML = `
            <section class="paginaInterna" style="max-width: 750px; margin: 0 auto; padding: 40px; text-align: center;">
                <div class="encabezado-perfil" style="margin-bottom: 35px;">
                    <div class="avatar-perfil" style="font-size: 4.5rem; margin-bottom: 15px;">👤</div>
                    <h2 style="font-size: 2.5rem; margin-bottom: 8px;">${escaparHTML(perfil?.username || user.email.split('@')[0])}</h2>
                    <p class="correo-perfil" style="font-size: 1.2rem; color: #666;">${escaparHTML(user.email)}</p>
                </div>

                <div class="resumen-perfil" style="display: flex; justify-content: center; gap: 25px; margin-bottom: 35px;">
                    <div class="caja-perfil" style="padding: 25px 35px; min-width: 180px;">
                        <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Puntos</h3>
                        <strong style="font-size: 1.8rem;">⭐ ${puntos}</strong>
                    </div>
                    <div class="caja-perfil" style="padding: 25px 35px; min-width: 180px;">
                        <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Rango</h3>
                        <strong style="font-size: 1.6rem;">${escaparHTML(nombreRango)}</strong>
                    </div>
                </div>

                <div class="acciones-perfil" style="margin-top: 35px;">
                    <button class="btn-peligro" style="font-size: 1.1rem; padding: 12px 30px;" onclick="cerrarSesionUsuario()">Cerrar Sesión</button>
                </div>
            </section>`;

    } catch (err) {
        console.error("Error al cargar perfil:", err);
    }
}

async function actualizarBarraRangosYPuntos() {
    try {
        const supabase = await obtenerCliente();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        
        const { data: perfil, error } = await supabase
            .from("perfiles")
            .select("puntos, rango_actual")
            .eq("id", user.id)
            .single();

        if (error || !perfil) return;

        const puntosActuales = perfil.puntos || 0;

        
        const rangos = [
            oty = { nombre: "Protector Ambiental", min: 1500, max: 1999 },
            { nombre: "Héroe Ecológico", min: 2000, max: 2499 },
            { nombre: "Leyenda Planetaria", min: 2500, max: 3499 },
            { nombre: "Guardián del Planeta", min: 3500, max: 4999 }
        ];

        // Encontrar el rango correspondiente
        let rangoActualObj = rangos[0];
        let siguienteRango = rangos[1];

        for (let i = 0; i < rangos.length; i++) {
            if (puntosActuales >= rangos[i].min && puntosActuales <= rangos[i].max) {
                rangoActualObj = rangos[i];
                siguienteRango = rangos[i + 1] || rangos[i];
                break;
            }
        }

        // Calcular el porcentaje de progreso para la barra
        const spanPuntos = document.getElementById("puntosUsuario");
        const barraProgreso = document.getElementById("barraProgresoRangos");
        const textoRango = document.getElementById("nombreRangoActual");

        if (spanPuntos) spanPuntos.innerText = `${puntosActuales} pts`;
        if (textoRango) textoRango.innerText = rangoActualObj.nombre;

        if (barraProgreso) {
            const rangoTotal = siguienteRango.min - rangoActualObj.min;
            const puntosEnRango = puntosActuales - rangoActualObj.min;
            let porcentaje = rangoTotal > 0 ? (puntosEnRango / rangoTotal) * 100 : 100;
            porcentaje = Math.min(Math.max(porcentaje, 0), 100); // Limitar entre 0 y 100
            
            barraProgreso.style.width = `${porcentaje}%`;
        }

    } catch (err) {
        console.error("Error al actualizar la barra de rangos:", err);
    }
}

