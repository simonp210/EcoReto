# Competencias y soporte privado

**Bloqueo actual:** `supabase/setup.sql` está vacío. No lo ejecutes ni copies en SQL Editor. Los pasos de esta guía que mencionan ejecutarlo solo aplican después de recuperar y revisar el SQL completo. Hasta entonces no se puede confirmar que funcionen perfiles, instituciones, rankings, reportes ni permisos; si aparece «No pudimos cargar el perfil institucional», recargar la página no crea las tablas o funciones que faltan. La migración `20261016-ranking-exit.sql` es solo una pieza adicional y no reemplaza la configuración principal.

## Preparar el registro individual por correo

El mensaje «No se pudo verificar el ranking» significa que el formulario no logró consultar la función que confirma si el nombre está libre. Si aparece, la app se detiene antes de enviar la creación de cuenta; no vuelvas a intentarlo muchas veces hasta restablecer el servicio.

1. En el panel de Supabase, abre el proyecto EcoReto y pulsa **Resume project** si está pausado. El botón **Restart database** no sirve cuando el proyecto está pausado o el panel no encuentra una base de datos.
2. Cuando el proyecto ya esté activo, abre **SQL Editor** y ejecuta el archivo completo `supabase/setup.sql`. El script valida que el nombre del perfil sea único y lo usa en todas las clasificaciones.
3. En **Authentication → URL Configuration**, define como **Site URL** el dominio real de EcoReto y agrega ese mismo dominio con `/pages/login.html` a **Redirect URLs**. Para desarrollo local, agrega también `http://127.0.0.1:4173/pages/login.html` si ese es el servidor que usas.
4. En **Authentication → Sign In / Providers**, habilita Email y decide si exigirás confirmación. Para enviar mensajes a cualquier usuario, configura un proveedor SMTP propio y verifica el remitente; el servicio SMTP de prueba de Supabase es limitado y no está destinado a correo público.
5. Prueba con una cuenta de correo: nombre disponible y repetido, confirmación, inicio de sesión y recuperación de contraseña. El registro y el inicio de sesión con celular no se ofrecen por ahora.

El frontend no puede reactivar Supabase ni completar la configuración de correo/SMS por sí solo. Si el proyecto sigue pausado, el registro se mantiene detenido de forma explícita en lugar de crear una cuenta sin validar que el nombre del perfil esté disponible.

La lista de ciudades institucionales incluye sugerencias comunes y permite escribir una ciudad que no aparezca. El nombre de la entidad se escribe para poder registrar instituciones nuevas; no hay un directorio mundial verificado que permita ofrecer un selector completo y fiable.

La selección institucional también consulta un catálogo mundial de ciudades por país y complementa la lista con las capitales disponibles; muestra hasta 80 coincidencias a la vez para mantener ágil el formulario. La ciudad es texto libre si el catálogo no incluye una localidad. Las sugerencias externas pueden tener datos incompletos o no estar disponibles temporalmente.

### Acceso con Google y cuentas por correo

El formulario permite continuar con Google. Para activarlo, crea un cliente OAuth de tipo Web en Google Cloud Console, agrega como URI de redirección autorizada `https://lycxdyckvedinhizrkkc.supabase.co/auth/v1/callback`, y luego habilita Google en **Supabase → Authentication → Sign In / Providers** con el Client ID y el Client Secret. En **Authentication → URL Configuration → Redirect URLs**, permite el dominio de producción seguido de `/pages/login.html` y, durante desarrollo, `http://127.0.0.1:4173/pages/login.html`. Mantén los secretos solo en el panel de Supabase, nunca en el frontend.

El ID de usuario de Supabase (`auth.users.id`) es la identidad estable que posee los puntos y el perfil. Entrar con Google y un correo verificado que coincida puede resolver a la misma cuenta según el enlace automático de identidades de Supabase.

Si Google muestra un error, comprueba que el proveedor esté habilitado, que el Client ID y Client Secret coincidan, y que estén permitidas tanto la URL `/auth/v1/callback` en Google Cloud como `/pages/login.html` en las URL de retorno de Supabase.

### Recompensas de cursor por rango

Vuelve a ejecutar `supabase/setup.sql` después de actualizar la aplicación. La migración agrega `profiles.cursor_id`, el permiso para actualizarlo y una protección del lado de la base de datos para impedir que se elija un diseño sin alcanzar sus puntos mínimos. Hay un cursor inicial y uno nuevo para cada uno de los nueve ascensos: 100, 400, 800, 1000, 1500, 2000, 2500, 3500 y 5000 puntos. En total hay diez cursores, uno por rango, contando el cursor inicial de **Semilla Verde**. Se pueden cambiar desde **Perfil → Cursores de recompensa**. El cursor personalizado se ve en equipos con mouse; en pantallas táctiles se conserva el cursor normal.

### Envío de fotos y puntos

Las publicaciones y las evidencias de retos pasan por `functions/verificar-evidencia`. La función comprueba la sesión, el formato y tamaño de la foto, que pertenezca a la cuenta y que el mismo archivo no se vuelva a usar para ganar puntos. No analiza si la imagen demuestra la acción; el equipo puede revisar las evidencias después. Las inserciones directas desde el navegador quedan revocadas por SQL.

Después de actualizar el frontend y ejecutar `supabase/setup.sql`, despliega la función autenticada:

```powershell
npx supabase functions deploy verificar-evidencia --project-ref lycxdyckvedinhizrkkc
```

Después, publica los archivos actualizados de EcoReto. Si ves **Failed to send a request to the Edge Function**, confirma que el despliegue terminó y que la app usa el mismo proyecto Supabase.

## Activación de la base de datos y acceso de administración

1. En Supabase, pulsa **Resume project**. Mientras el proyecto esté pausado, la app no puede consultar ni actualizar datos.
2. En el **SQL Editor**, ejecuta `setup.sql` completo. El script prepara el registro individual, el filtro de nombres, las solicitudes institucionales, los rankings privados y sus permisos.
3. Para que tu cuenta pueda revisar solicitudes y crear competencias, localiza tu usuario en **Authentication → Users**, copia su **User UID** y ejecuta en SQL Editor:

   ```sql
   insert into public.ecoreto_administradores (user_id)
   values ('UUID-DE-TU-USUARIO')
   on conflict (user_id) do nothing;
   ```

   No agregues a participantes como administradores. Solo las cuentas que registres en esta tabla verán las herramientas administrativas.
4. Cierra y vuelve a abrir sesión en EcoReto; entra a **Ranking** y baja hasta **Solicitudes institucionales**. Allí aparecen las solicitudes pendientes y puedes elegir **Aprobar y crear ranking** o **Rechazar**.
5. Al aprobar se crea un ranking privado y se genera el código. Si Resend está configurado y `notificar-institucion` está desplegada, la institución recibe el código por correo y el administrador queda copiado; si el correo falla, EcoReto muestra el código para compartirlo manualmente.

El ranking global y el ranking institucional son clasificaciones distintas: unirse al institucional no reemplaza el global. El portal institucional tiene acceso separado por correo y contraseña. Cuando se aprueba una solicitud y el correo institucional queda vinculado, su representante puede consultar el avance de sus estudiantes y publicar retos propios. La función SQL solo permite crearlos a la cuenta responsable del ranking, y la política de lectura deja ver esos retos únicamente a quienes pertenecen a ese ranking. La cuenta administradora de EcoReto no debe compartir su acceso con docentes.

## Solicitudes institucionales

El registro personal queda para cuentas individuales. Desde **Ranking institucional**, los estudiantes eligen **Soy estudiante** y entran con el código de su institución; si todavía no tienen cuenta, se guarda el código para entrar al terminar el registro y verificar el correo. Docentes o representantes primero crean o abren su **cuenta institucional**. Después de iniciar sesión, solicitan el ranking desde ese perfil con institución, ciudad, país, correo institucional, persona de contacto, cargo, teléfono y motivo. Se rechazan dominios de correo personal conocidos. Esto no demuestra por sí solo quién controla ese buzón: el administrador debe revisar los datos y el contacto antes de aprobar.

Al enviar una solicitud, EcoReto guarda los datos y, si el correo de confirmación está configurado, manda un acuse al correo institucional. La solicitud queda pendiente hasta que el equipo de EcoReto la revise; recibir un acuse no significa que la institución ya esté verificada o aprobada. Las solicitudes pendientes aparecen en **Ranking → Solicitudes institucionales** para las cuentas administradoras. Aprobar crea un ranking privado y genera el código de acceso; si el correo de decisión no está disponible, el administrador puede copiar el código que aparece en pantalla y compartirlo manualmente con el contacto. Después de unirse una vez con el código, cada estudiante verá el ranking global y el institucional en el selector; no necesita volver a escribirlo.

El país se elige de la lista; la ciudad ofrece sugerencias y se puede escribir si no aparece. Al cambiar el país se borra la ciudad para evitar combinaciones equivocadas. El cargo docente se elige de una lista con opción **Otro**. El nombre de una entidad nueva se escribe porque no hay un directorio internacional fiable de todas las instituciones.

Las cuentas personales también pueden crear hasta cinco rankings privados para amistades desde **Ranking → Crea un ranking con amigos**. El creador queda unido automáticamente y recibe un código para compartir. Para activar esta opción en el proyecto, vuelve a ejecutar `supabase/setup.sql` completo.

Las competencias **Mundial** y **Nacional** que crea una cuenta administradora aparecen en el selector de Ranking para todas las cuentas. Mundial muestra a toda la comunidad; Nacional muestra solo a los perfiles que indicaron ese país. La tabla de estas competencias es pública para personas con cuenta. Los grupos de amistades y las instituciones se mantienen privados y requieren unirse con código. Cada grupo de amistades lleva su propio puntaje: al aprobarse una acción, esta suma al total general y a cada grupo de amistades del que la persona ya era integrante. Los puntos comienzan a acumularse desde que se despliegue el cambio; no se pueden reconstruir para acciones anteriores porque la app no guardaba a qué grupos pertenecía cada persona cuando las realizó. Los rankings institucionales conservan su comportamiento actual.

Para enviar el acuse a la institución y una copia a la bandeja principal del equipo, configura Resend y despliega `notificar-institucion`. El correo de aprobación incluye el código privado. Las respuestas de la institución se dirigen al correo del administrador. En Resend verifica un dominio remitente y crea una API key. En **Supabase → Edge Functions → Secrets**, guarda `RESEND_API_KEY`, `INSTITUTION_EMAIL_FROM` (dirección del dominio verificado) e `INSTITUTION_REVIEW_EMAIL` (tu correo administrador). También puedes reutilizar `SUPPORT_EMAIL_FROM` y `SUPPORT_EMAIL` como remitente y destinatario del equipo. Después despliega:

```powershell
npx supabase secrets set --env-file supabase/functions/.env --project-ref lycxdyckvedinhizrkkc
npx supabase functions deploy notificar-institucion --project-ref lycxdyckvedinhizrkkc
```

No subas el archivo `.env` ni pegues las claves en el código o en SQL Editor. Si no se configura el proveedor, la solicitud queda guardada y el equipo todavía puede revisarla; la interfaz avisa que el mensaje no salió y muestra el código para compartirlo manualmente.

## Reportes de soporte y alertas por correo

La función `functions/diagnosticar-error` permite que una persona con sesión guarde un reporte y, si el correo está configurado, avisa al equipo. El análisis automático está desactivado. La captura permanece en el bucket privado `support-attachments`; el equipo puede responder al correo de la cuenta. La app todavía no tiene una bandeja de tickets ni respuestas dentro del perfil.

Configura los secretos en Supabase —no en el JavaScript del navegador—:

- `SUPPORT_EMAIL`
- `SUPPORT_EMAIL_FROM` (remitente verificado en Resend)
- `RESEND_API_KEY`

Después de copiar `functions/.env.example` como `functions/.env` y completar esos secretos, cárgalos y despliega la función con Supabase CLI:

```powershell
npx supabase secrets set --env-file supabase/functions/.env --project-ref lycxdyckvedinhizrkkc
npx supabase functions deploy diagnosticar-error --project-ref lycxdyckvedinhizrkkc
```

Nunca compartas ni subas el archivo `.env`.

Si el correo no está configurado, el reporte sigue guardándose de forma privada en la tabla `support_reports` para revisión desde Supabase.

### Confirmación de cuenta, recuperación y mensajes automáticos de Supabase Auth

Los correos de confirmación de cuentas personales e institucionales y los enlaces de recuperación los envía **Supabase Auth**, no las funciones Edge. Para que lleguen a cualquier persona, habilita SMTP propio en **Supabase → Authentication → Email → SMTP Settings**. Sin SMTP personalizado, el servicio predeterminado limita los destinatarios a miembros del equipo del proyecto y tiene límites de envío; no es un servicio de producción.

Con Resend, verifica primero tu dominio y configura el remitente. En SMTP Settings activa SMTP e ingresa el host `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña la API key de Resend y el correo remitente del dominio verificado; usa **EcoReto** como nombre del remitente. Los mismos SMTP de Auth gestionan confirmación, recuperación y cambios de correo.

Esto es independiente de las funciones Edge: estas necesitan `SUPPORT_EMAIL`, `SUPPORT_EMAIL_FROM`, `INSTITUTION_REVIEW_EMAIL`, `INSTITUTION_EMAIL_FROM` y `RESEND_API_KEY` en **Edge Functions → Secrets**. Luego despliega ambas funciones con Supabase CLI:

```powershell
npx supabase functions deploy diagnosticar-error --project-ref lycxdyckvedinhizrkkc
npx supabase functions deploy notificar-institucion --project-ref lycxdyckvedinhizrkkc
```

Los reportes de soporte llegan al correo configurado en `SUPPORT_EMAIL`; las solicitudes y decisiones institucionales llegan al correo configurado en `INSTITUTION_REVIEW_EMAIL` y al correo institucional. Si los dos secretos del destinatario apuntan a una misma dirección, se recibirá todo en esa bandeja.

### Si `setup.sql` se interrumpe porque una política ya existe

El archivo actualizado elimina también la política `EcoReto: retos disponibles para la cuenta` antes de volver a crearla. En SQL Editor vuelve a pegar y ejecutar el archivo completo actualizado; no ejecutes solo el mensaje de error. Las políticas usan `drop policy if exists`, así que puedes repetir el script. Comprueba que la consulta final termine sin error; esa sección crea los permisos y funciones para los retos institucionales.
