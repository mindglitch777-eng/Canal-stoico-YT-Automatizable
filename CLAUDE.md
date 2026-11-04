# Calm Fortune (Fortuna serena)

Canal faceless de YouTube. Este archivo es el contexto del proyecto para cada sesión nueva.

## El canal

- **Nombre:** Calm Fortune (en español: Fortuna serena)
- **Nicho:** estoicismo + dinero (psicología del dinero, riqueza silenciosa, decisiones bajo presión, mirada anti-hustle), con principios reales de Séneca, Marco Aurelio y Epicteto
- **Idioma:** inglés
- **Audiencia:** Estados Unidos
- **Formato:** Shorts animados (narración en off, sin cara) + video largo de 8 a 15 minutos para monetizar
- **Ritmo objetivo:** 5 a 6 Shorts por día

## El dueño

- Trabaja solo, desde el celular (sin computadora), con Claude Code en sesiones en la nube sobre este repo.
- Las decisiones del canal las toma él.
- Grok hace la investigación externa (competencia, tendencias, datos que Claude no ve). Claude construye: código, guiones, animación, automatización.

## Monetización: fechas clave

- Hasta el 31/01/2027: 1.000 suscriptores + 4.000 horas de video largo en 12 meses, o 10 millones de vistas de Shorts en 90 días.
- Desde el 01/02/2027, para canales nuevos: 1.000 suscriptores + 8.000 horas, o 20 millones de vistas de Shorts en 90 días.
- Los Shorts pagan poco por vista; el video largo paga mucho más. Las dos vías no se suman entre sí.

## Infraestructura

- **Repo público** → minutos de GitHub Actions ilimitados.
- **Las sesiones en la nube de Claude Code no llegan a `www.googleapis.com` ni a `speech.platform.bing.com`** (la red las bloquea). Todo lo que necesite esos servicios corre en **GitHub Actions**.
- **Secreto de Actions:** `YOUTUBE_API_KEY` (YouTube Data API v3) — ya cargado. Nunca escribir claves en archivos del repo.
- **Voz:** Edge TTS (`edge-tts`, librería no oficial) desde GitHub Actions. Voz por elegir.
- **Cuota de la API:** 10.000 unidades por día (verificar en la consola). `search.list` cuesta 100; datos de un canal + sus videos vía la playlist de subidas, unas 16.

## Skills instalados (`.claude/skills/`)

Revisados antes de instalar: sin llamadas de red ocultas ni código peligroso.

- **youtube-agent-skill** (Jake Schincariol, MIT) — `yt-script`, `yt-package`, `yt-viral`, `yt-retention`, `yt-plan`, `yt-seo`, `yt-shorts`, `yt-audit`, `yt-chapters`, `yt-comment`, `yt-edit`. Tiene herramientas en Python que se ejecutan (puntuador de ganchos, linter de títulos, ranking de virales por múltiplo sobre la mediana del canal). Pensado para creadores con cámara: `yt-edit` no aplica a animación.
- **claude-youtube** (AgriciDaniel, MIT, beta) — orquestador `/youtube` con sub-skills (strategy, ideate, competitor, calendar, hook, script, shorts, seo, metadata, thumbnail, analyze, audit, monetize, repurpose), guías de referencia y scripts de la API en `execution/` (lee `YOUTUBE_API_KEY` del entorno). Las cifras de sus guías no tienen fuente: verificar antes de usarlas.
- División propuesta: guion y empaque con el pack de Jake; estrategia, ideas, competencia y monetización con claude-youtube.

## Lo que los skills no cubren (pendiente, consultado a Grok)

1. Motor de animación por código para video vertical (Remotion, HyperFrames, Motion Canvas…) y su licencia
2. Render del video (propuesta: GitHub Actions)
3. Voz: elección en Edge TTS y prueba desde Actions
4. Subtítulos animados palabra por palabra
5. Imágenes y recursos visuales con licencia o de dominio público
6. Música y efectos libres de derechos
7. Subida a YouTube (los proyectos de API sin verificar podrían dejar los videos en privado: confirmar)
8. Exportar la retención de YouTube Studio desde el celular
9. Distribución a TikTok y Reels (opcional)

## Fases

1. Cimientos: este repo, contexto, skills ← **acá estamos**
2. Investigación de competencia con la API (vía Actions): mediana de los últimos Shorts de cada canal, frecuencia, duración, videos que superan 2x la mediana de su canal, comentarios
3. Identidad y producción: estilo visual, voz, video de prueba de punta a punta
4. Guiones en lote
5. Publicar y medir a las 48 horas
6. Video largo, monetización y trámite fiscal en Argentina (Factura E, monotributo)
