# Activar EcoReto: cursores, correo y Google

Hay pasos que puedes hacer pegando el SQL y otros que requieren cuentas y credenciales de proveedores externos. No pegues contraseñas, secretos SMTP, credenciales SMS ni el secreto de Google en el JavaScript ni en el chat.

## Antes de publicar: dominio, página y correo

Un **dominio** es la dirección de la página, por ejemplo `ecoreto.co`. Comprar el dominio reserva esa dirección; **no crea por sí solo una bandeja de correo**. Para tener `soporte@ecoreto.co` también necesitas un servicio de correo, y para publicar la página necesitas un servicio de alojamiento.

1. Elige un nombre corto y comprueba si está disponible con la terminación que prefieras, por ejemplo `.com` o `.co`. Compra el dominio en un registrador. [Cloudflare Registrar explica el proceso de registro](https://developers.cloudflare.com/registrar/get-started/register-domain/); puedes usar otro proveedor si lo prefieres.
2. Publica los archivos de EcoReto en un servicio de alojamiento para páginas estáticas. Si usas Cloudflare Pages, conecta el dominio desde **Workers & Pages → tu proyecto → Custom domains**; el panel te indicará los pasos de DNS. [Guía de dominio personalizado de Pages](https://developers.cloudflare.com/pages/configuration/custom-domains/).
3. Contrata o configura una bandeja de correo para el dominio, por ejemplo `soporte@TU-DOMINIO`. El proveedor te dará registros DNS para demostrar que el dominio es tuyo y recibir correo. El reenvío gratuito de correo, como Cloudflare Email Routing, puede redirigir mensajes a otra bandeja, pero no sustituye una bandeja con la que puedas enviar correo autenticado.
4. Para los correos automáticos de confirmación de Supabase, configura un proveedor SMTP. Para reportes y solicitudes institucionales, verifica el dominio remitente en Resend y configura sus registros DNS. No escribas registros inventados: copia los valores exactos que te dé cada proveedor.
5. Cuando tengas el dominio y la página publicada, reemplaza `TU-DOMINIO` en los pasos de Google y Supabase más abajo por el dominio real. Mientras la app siga local, puedes probar Google con `http://127.0.0.1:4173`; el dominio real se necesita para el sitio publicado y el correo propio.

Cloudflare explica el [reenvío de correo entrante](https://developers.cloudflare.com/email-service/get-started/route-emails/) y Supabase explica cómo configurar [dominios remitentes para correo](https://supabase.com/docs/guides/auth/auth-smtp). El nombre de dominio, el alojamiento de la página y el servicio de correo son configuraciones separadas.

## 1. Publica la versión actual de EcoReto

Sube/publica los archivos más recientes del proyecto en el alojamiento de la página. Si solo trabajas en tu computador, inicia el servidor local desde `Iniciar EcoReto.bat`. Las pruebas de esta guía usan `http://127.0.0.1:4173`.

## 2. Actualiza la base de datos (incluye los cursores)

**Atención:** en la copia actual del proyecto, `supabase/setup.sql` está vacío. No lo pegues ni lo ejecutes en Supabase: no crearía las tablas ni las funciones. Primero hay que recuperar la versión completa de la configuración de base de datos y revisar que incluya las funciones institucionales. El mensaje «No pudimos cargar el perfil institucional» puede aparecer si esas funciones faltan o si la base de datos no tiene los permisos necesarios.

1. Entra al [panel de Supabase](https://supabase.com/dashboard/project/lycxdyckvedinhizrkkc).
2. Si el proyecto está pausado, pulsa **Resume project** y espera a que esté disponible. No uses **Restart database** en ese estado; la captura anterior mostró que Supabase no encontraba una base de datos para reiniciar.
3. Abre **SQL Editor → New query**.
4. Abre `supabase/setup.sql` solo cuando se haya restaurado su contenido completo. Copia el archivo, pégalo en la consulta y pulsa **Run**.
5. Comprueba que la consulta termina correctamente. El archivo completo debe preparar perfiles, rankings, solicitudes institucionales, sus permisos y la columna de cursor. Puedes volver a ejecutarlo cuando EcoReto indique que hay cambios de base de datos.
6. Publica la versión actual de los archivos de EcoReto, recarga la página con `Ctrl + F5`, inicia sesión y abre **Perfil**. En computadora los cursores aparecen en una barra vertical estrecha a la izquierda de la tarjeta; en celular aparecen debajo.

Cuando se recupere la migración completa, comprueba que incluya la corrección del error de ranking `42804: Returned type bigint does not match expected type integer`. La copia actual está vacía, así que aún no se puede aplicar esa corrección desde este archivo.

Se desbloquean diseños con estos puntos: 100, 400, 800, 1500, 2500, 3500 y 5000. En **Cursores de recompensa** elige cualquiera de los que diga **Desbloqueado**. El cambio se conserva en tu cuenta. En celular no hay puntero de mouse, por eso se usa el cursor normal.

## 3. Configura las URL de retorno en Supabase

1. En Supabase, abre **Authentication → URL Configuration**.
2. En **Site URL**, pon el origen real de la página publicada, por ejemplo `https://tudominio.com` (sin `/pages/login.html`). Si todavía no tienes dominio, conserva el sitio de pruebas que uses.
3. En **Redirect URLs**, agrega la URL completa de inicio de sesión publicada, por ejemplo `https://tudominio.com/pages/login.html`.
4. Para desarrollo local, agrega `http://127.0.0.1:4173/pages/login.html`.

Reemplaza `https://tudominio.com` por el dominio real de EcoReto. No agregues una URL de ejemplo literalmente.

## 4. Activa registro y confirmación por correo

1. En Supabase, abre **Authentication → Sign In / Providers → Email** y habilita Email.
2. Decide si exigirás que cada persona confirme el correo antes de entrar. Para publicar el registro, se recomienda dejar la confirmación activa.
3. Para enviar mensajes a cualquier correo, contrata/configura un servicio SMTP (por ejemplo Resend, Amazon SES, Postmark, SendGrid o Brevo). Verifica el dominio/remitente con ese proveedor.
4. En **Authentication → SMTP Settings**, activa SMTP personalizado y pega los valores SMTP que te entrega el proveedor: host, puerto, usuario, contraseña y dirección remitente. Guarda.
5. En **Authentication → Email Templates**, revisa el mensaje de confirmación y el de recuperación de contraseña; conserva sus enlaces de acción de Supabase.
6. Prueba registrando una cuenta con un correo tuyo que no pertenezca al equipo de Supabase. Confirma el enlace recibido y luego prueba iniciar sesión y recuperar la contraseña.

El SMTP de prueba de Supabase no suele enviar a usuarios externos; para eso se necesita SMTP propio. Consulta la [guía oficial de SMTP de Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

Si usas Resend para SMTP y ya verificaste un dominio propio, las casillas son: **Sender email address** = `no-reply@TU-DOMINIO-VERIFICADO`; **Sender name** = `EcoReto`; **Host** = `smtp.resend.com`; **Port number** = `465`; **Minimum interval per user** = `60` segundos; **Username** = `resend`; **Password** = tu API key real de Resend (`re_...`). No copies las palabras de ejemplo como credenciales: el correo debe usar un dominio verificado en Resend. Si aún no tienes el dominio y la API key, apaga temporalmente **Enable custom SMTP** y guarda; el envío de prueba de Supabase solo sirve para correos autorizados del equipo.

En **Rate Limits**, para las primeras pruebas deja los valores predeterminados: email `2` por hora si aún no tienes SMTP propio; SMS `30` por hora; refresco de sesión `150` por 5 minutos; verificaciones OTP/enlace `30` por 5 minutos; usuarios anónimos `30` por hora; registros e inicios de sesión `30` por 5 minutos; Web3 `30` por 5 minutos. No aumentes límites para corregir un error de configuración. Al activar SMTP propio, Supabase permite subir el tope de correos; puedes empezar con `30` por hora. CAPTCHA requiere añadir un widget y enviar su token desde la página; no lo actives hasta que el formulario EcoReto tenga esa integración. [Guía oficial de CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha).

En **Email Templates**, EcoReto usa correo y contraseña: conserva habilitada la confirmación de registro y deja **Magic link or OTP** como está; no tienes que activar el inicio con enlace mágico. Si personalizas **Confirm signup**, conserva `{{ .ConfirmationURL }}` en el enlace. Puedes dejar las plantillas predeterminadas hasta que SMTP envíe correctamente.

## 5. Acceso por celular (desactivado por ahora)

El registro y el inicio de sesión de EcoReto usan correo electrónico. No hace falta configurar Phone ni un proveedor SMS. El teléfono institucional, si se incluye en una solicitud, solo sirve como dato de contacto y no recibe códigos.

## 6. Activa “Continuar con Google”

1. En [Google Cloud Console](https://console.cloud.google.com/), crea o selecciona un proyecto.
2. Configura **Google Auth Platform / Branding** con el nombre EcoReto y el correo de soporte.
3. En **Clients**, crea un cliente OAuth de tipo **Web application**.
4. En **Authorized JavaScript origins**, agrega el origen de producción, por ejemplo `https://tudominio.com`, y el origen local `http://127.0.0.1:4173` para pruebas.
5. En **Authorized redirect URIs**, agrega esta dirección exacta de Supabase:

   `https://lycxdyckvedinhizrkkc.supabase.co/auth/v1/callback`

6. Guarda y copia el **Client ID** y el **Client Secret**.
7. En Supabase, abre **Authentication → Sign In / Providers → Google**, activa Google, pega ahí ambos valores y guarda.
8. Confirma que las Redirect URLs del paso 3 incluyan el `.../pages/login.html` que realmente usa EcoReto.
9. Prueba primero en una ventana privada con una cuenta Google de prueba. Debe regresar a EcoReto y abrir el perfil.

Los secretos de Google se guardan solo en Supabase, nunca en los archivos de la página. Revisa la [guía oficial de Google OAuth en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google).

Si aparece un error:

- **Provider not enabled**: Google no está activado en Supabase.
- **redirect_uri_mismatch**: en Google Cloud debe estar la callback de Supabase exactamente como arriba; en Supabase deben estar las URL de EcoReto.
- **invalid_client**: el Client ID/Secret no coincide o se pegó incompleto.
- **No se pudo preparar el perfil**: vuelve a ejecutar `setup.sql` y revisa que la tabla `profiles` permita crear el perfil propio.

## 7. Activa los correos de solicitudes institucionales

Estos mensajes (acuse y decisión de una institución) son independientes de los correos de confirmación de cuenta del paso 4.

1. Configura un remitente verificado y una API key en Resend.
2. En el proyecto, copia `supabase/functions/.env.example` a `supabase/functions/.env` y completa `RESEND_API_KEY`, `INSTITUTION_EMAIL_FROM` y `INSTITUTION_REVIEW_EMAIL` con el correo principal que recibirá copia de cada solicitud. No publiques ni subas ese `.env`.
3. Instala/autentica Supabase CLI si aún no está configurado; vincula el proyecto `lycxdyckvedinhizrkkc`.
4. En la terminal, desde la carpeta EcoReto, ejecuta:

   ```powershell
   npx supabase secrets set --env-file supabase/functions/.env --project-ref lycxdyckvedinhizrkkc
   npx supabase functions deploy notificar-institucion --project-ref lycxdyckvedinhizrkkc
   ```

5. Envía una solicitud de institución de prueba y confirma que llegue el acuse. Después apruébala desde la cuenta administradora y verifica el mensaje con el código.

## Qué sí se activa con código y qué requiere configuración externa

| Función | ¿Basta pegar SQL/código? | Qué falta |
|---|---|---|
| Recompensas de cursor | Se requiere `setup.sql` y publicar el frontend | Nada externo |
| Registro por correo | No | Habilitar Email y configurar SMTP/remitente para correo externo |
| Registro por celular | No se ofrece | No configurar Phone ni SMS |
| Acceso con Google | No | Crear OAuth Web Client y guardar ID/Secret en Supabase |
| Correos institucionales | No | Resend, secretos y despliegue de `notificar-institucion` |

## Solicitudes institucionales, administrador y soporte

Para dar de alta la cuenta administradora, el flujo de ranking institucional, las notificaciones y los reportes de soporte, sigue [`COMPETENCIAS-Y-SOPORTE.md`](COMPETENCIAS-Y-SOPORTE.md). Esa guía también explica qué rankings funcionan hoy: global y privado por código.

La función `verificar-evidencia` guarda la foto, bloquea duplicados exactos y registra los puntos; no usa análisis con IA. Después de actualizar la app, despliega esa función para que los envíos funcionen:

```powershell
npx supabase functions deploy verificar-evidencia --project-ref lycxdyckvedinhizrkkc
```

Si aparece el mensaje «la solicitud de revisión no es válida o falta el consentimiento», el proyecto todavía tiene una versión anterior de esa función. Despliega el código actual antes de volver a publicar.

## Errores mostrados en las capturas del 11 de octubre

- `Unsupported provider: provider is not enabled`: activar **Google** en Authentication → Sign In / Providers y guardar su Client ID y Client Secret.
- El acceso con celular no está disponible; usa el correo asociado a la cuenta.
- Los errores HTTP 400 al leer perfiles y competencias: aplicar el `setup.sql` actualizado para añadir las columnas y permisos que la página espera. Si el SQL indica que faltan tablas base, detente: la base debe inicializarse/restaurarse antes.
- El ranking fallaba con código `42804` porque esa base devuelve los puntos como `bigint` y la función declaraba `integer`. El `setup.sql` actualizado incluye la conversión compatible; ejecútalo y vuelve a cargar la página.
- El cursor pide ejecutar `setup.sql`: la base aún no conoce o no autoriza `cursor_id`; el script crea ese campo y sus permisos.
- El reporte de ayuda se guarda de forma privada; para recibir alertas por correo configura `SUPPORT_EMAIL` y publica `diagnosticar-error`.
- Si SQL Editor muestra `42710` porque la política `EcoReto: retos disponibles para la cuenta` ya existe, vuelve a copiar el `setup.sql` actualizado y ejecútalo completo. La versión nueva elimina esa política antes de recrearla, y así puede instalar las funciones y permisos que vienen después, incluidos los retos institucionales.
- La solicitud institucional depende de que Supabase y sus funciones SQL estén activos; para enviar acuses y decisiones también debes desplegar `notificar-institucion` y configurar Resend.
