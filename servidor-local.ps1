$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 4173)
$mime = @{
    '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'
    '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'; '.ico' = 'image/x-icon'
}

try {
    $listener.Start()
    Write-Host 'EcoReto disponible en http://127.0.0.1:4173/'
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $null
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $line = $reader.ReadLine()
            while (($headerLine = $reader.ReadLine()) -and $headerLine.Length -gt 0) { }
            $parts = $line -split ' ', 3
            $method = $parts[0]
            $requestPath = if ($parts.Length -gt 1) { $parts[1].Split('?')[0] } else { '/' }
            $relative = [System.Uri]::UnescapeDataString($requestPath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.htm' }
            $file = [System.IO.Path]::GetFullPath((Join-Path $root $relative))

            if ($method -notin @('GET', 'HEAD')) {
                $status = '405 Method Not Allowed'; $body = [System.Text.Encoding]::UTF8.GetBytes('Método no permitido')
            } elseif (-not $file.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
                $status = '403 Forbidden'; $body = [System.Text.Encoding]::UTF8.GetBytes('Acceso denegado')
            } elseif (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
                $status = '404 Not Found'; $body = [System.Text.Encoding]::UTF8.GetBytes('No encontrado')
            } else {
                $status = '200 OK'; $body = [System.IO.File]::ReadAllBytes($file)
            }

            $contentType = $mime[[System.IO.Path]::GetExtension($file).ToLowerInvariant()]
            if (-not $contentType) { $contentType = 'application/octet-stream' }
            $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nX-Content-Type-Options: nosniff`r`nX-Frame-Options: DENY`r`nReferrer-Policy: strict-origin-when-cross-origin`r`nPermissions-Policy: camera=(self), microphone=(), geolocation=()`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
            $stream.Flush()
        } catch {
            Write-Host "Solicitud local fallida: $($_.Exception.Message)"
        } finally {
            if ($stream) { $stream.Dispose() }
            $client.Dispose()
        }
    }
} finally {
    $listener.Stop()
}
