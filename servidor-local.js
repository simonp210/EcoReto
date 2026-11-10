"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname);
const host = "127.0.0.1";
const puerto = Number(process.env.PORT) || 4173;
const tipos = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
};

http.createServer((solicitud, respuesta) => {
    let rutaSolicitada;
    try {
        rutaSolicitada = decodeURIComponent(new URL(solicitud.url, `http://${host}`).pathname);
    } catch {
        respuesta.writeHead(400).end("Solicitud no válida");
        return;
    }

    const rutaRelativa = rutaSolicitada === "/" ? "index.htm" : rutaSolicitada.replace(/^\/+/, "");
    const archivo = path.resolve(raiz, rutaRelativa);
    if (archivo !== raiz && !archivo.startsWith(`${raiz}${path.sep}`)) {
        respuesta.writeHead(403).end("Acceso denegado");
        return;
    }

    fs.stat(archivo, (error, info) => {
        if (error || !info.isFile()) {
            respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado");
            return;
        }
        respuesta.writeHead(200, {
            "Content-Type": tipos[path.extname(archivo).toLowerCase()] || "application/octet-stream",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
            "Cache-Control": "no-cache"
        });
        fs.createReadStream(archivo).pipe(respuesta);
    });
}).listen(puerto, host, () => {
    console.log(`EcoReto disponible en http://${host}:${puerto}/`);
});
