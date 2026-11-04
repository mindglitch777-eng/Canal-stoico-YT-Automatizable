# Calm Fortune (Fortuna serena)

Canal faceless de YouTube. Este archivo es el contexto del proyecto para cada sesión nueva: leelo entero antes de trabajar.

## El canal

- **Nombre:** Calm Fortune (en español: Fortuna serena)
- **Nicho:** estoicismo + dinero ("Stoic Wealth"): psicología del dinero, riqueza silenciosa, decisiones bajo presión, mirada anti-hustle, con principios reales de Séneca, Marco Aurelio y Epicteto
- **Idioma:** inglés · **Audiencia:** Estados Unidos
- **Formato:** Shorts animados (voz en off, sin cara) + video largo de 8 a 15 minutos para monetizar
- **Ritmo objetivo:** 5 a 6 Shorts por día
- **Estilo visual:** dark-minimal, negro cálido con oro, tipografía serif, animaciones explicativas

## El dueño

- Trabaja solo, desde el celular (sin computadora), con Claude Code en sesiones en la nube sobre este repo.
- Las decisiones del canal (contenido, tono, criterio) las toma él. Las reglas del canal son las que él define.
- Grok hace la investigación externa (competencia, tendencias, datos que Claude no ve) y el dueño trae sus respuestas. Claude construye: código, guiones, animación, automatización.
- Prefiere avanzar ordenado, por fases, y decidir antes de ejecutar.

## Estado actual (04/11/2026)

**Fase actual: 3 — producción.** La investigación de competencia (fase 2) se hace después, por decisión del dueño.

Hecho y subido:
- Skills de YouTube en `.claude/skills/` (ver abajo).
- Plantillas de animación en `remotion/` (7 tipos de escena), scripts de prueba y render.
- Voz: `tools/tts.py` (Edge TTS por escena con tiempos por palabra) y `tools/voice_samples.py`.
- Workflows de GitHub Actions: prueba de plantillas, render de Short, muestras de voces.
- Plantilla maestra del guion: `prompts/master-short.md` (formato + reglas de retención aportadas por el dueño vía Grok).
- Short de ejemplo: `shorts/ejemplo-seneca/short.json`.

Probado:
- En una sesión en la nube, las 7 plantillas renderizaron cuadros sin errores (`npm run test:templates` con Chromium local) y se revisaron visualmente.

**No probado todavía:**
- El video completo de muestra. El primer intento en la sesión en la nube falló porque la carga de una fuente pasó los 28 s con varias pestañas en paralelo. Ya se agregó `timeoutInMilliseconds: 120000` y la variable `REMOTION_CONCURRENCY`, pero no se volvió a probar.
- `tools/tts.py` con voz real (la sesión en la nube no llega a Edge TTS). Solo se escribió; corre en Actions.
- Ningún workflow de Actions se corrió todavía.

## Cuando el dueño diga "ok" para probar la producción

1. Revisar este archivo y `prompts/master-short.md`.
2. **Prueba de plantillas:** el workflow "Prueba de plantillas" corre solo al cambiar `remotion/`, o a mano. Si la sesión puede correr comandos acá, también:
   ```bash
   cd remotion && npm ci && npm run typecheck
   REMOTION_BROWSER_EXECUTABLE=<chromium local> REMOTION_CONCURRENCY=2 npm run test:templates
   REMOTION_BROWSER_EXECUTABLE=<chromium local> REMOTION_CONCURRENCY=2 npm run render -- --demo
   ```
   En la sesión en la nube había un Chromium en `/opt/pw-browsers/chromium-*/chrome-linux64/chrome` (buscar con `find /opt -name chrome -type f`). En Actions no hace falta: Remotion baja su navegador.
3. **Prueba sin voz del Short de ejemplo:** `python3 tools/tts.py shorts/ejemplo-seneca --silent`, después `cd remotion && npm run render -- --short shorts/ejemplo-seneca`.
4. **Prueba con voz:** el workflow "Render de Short" (se dispara al cambiar un `short.json` o a mano con la carpeta).
5. **Elegir la voz:** workflow "Muestras de voces" → el dueño escucha los MP3 del artifact y elige.
6. Mirar los cuadros de `remotion/out/stills/` (o del artifact), reportar al dueño qué funciona y qué no, y decidir juntos los cambios.

## Producción: cómo funciona

```
shorts/<id>/short.json  ──tools/tts.py──▶  shorts/<id>/build/voice/sNN.mp3 + build/timeline.json
                                            │
                                            ▼
                         remotion (npm run render -- --short shorts/<id>)  ──▶  build/<id>.mp4
```

- `short.json`: guion por escenas (formato en `prompts/master-short.md`).
- `tts.py`: genera la voz de cada escena con Edge TTS, toma los tiempos de cada palabra (para subtítulos), mide la duración y arma `timeline.json`. Con `--silent` estima tiempos sin voz.
- Remotion: 1080x1920, 30 fps, H.264. Cada escena dura lo que dura su voz + 0,25 s.
- `build/` está en `.gitignore`: los MP4 salen como artifact de Actions, no se suben al repo.

### Comandos (desde `remotion/`)

| Comando | Qué hace |
|---|---|
| `npm ci` | Instala dependencias (y copia las fuentes a `public/fonts`) |
| `npm run typecheck` | Revisa tipos |
| `npm run test:templates` | Un cuadro por escena de la demo + hoja de contactos en `out/stills/` |
| `npm run test:templates -- --short shorts/<id>` | Lo mismo para un Short ya armado (necesita su `timeline.json`) |
| `npm run render -- --demo` | Video de muestra sin voz en `out/demo.mp4` |
| `npm run render -- --short shorts/<id>` | MP4 final del Short |
| `npm run studio` | Remotion Studio (vista previa interactiva; necesita navegador) |

Variables: `REMOTION_BROWSER_EXECUTABLE` (navegador local), `REMOTION_CONCURRENCY` (pestañas en paralelo).

### Código de las plantillas (`remotion/src/`)

- `types.ts`: contrato de datos (`Timeline`, `Scene`, `Word`).
- `theme.ts`: colores, tipografías, zona segura de Shorts (la interfaz tapa abajo y a la derecha).
- `Short.tsx`: compone escenas, audio y subtítulos. `Root.tsx`: composición "Short".
- `scenes/`: `Hook`, `Quote`, `TwoColumns`, `Chart`, `Counter`, `Statement` (incluye `Outro`).
- `Captions.tsx`: subtítulos palabra por palabra en oro. `Background.tsx`: fondo con luz, columnas y grano.
- `demo.ts`: línea de tiempo de muestra con los 7 tipos (sin voz).
- `fonts.ts`: Cormorant Garamond e Inter desde `public/fonts` (licencia OFL, archivos incluidos).

## Monetización: fechas clave

- Hasta el 31/01/2027: 1.000 suscriptores + 4.000 horas de video largo en 12 meses, o 10 millones de vistas de Shorts en 90 días.
- Desde el 01/02/2027, para canales nuevos: 1.000 suscriptores + 8.000 horas, o 20 millones de vistas de Shorts en 90 días.
- Los Shorts pagan poco por vista; el video largo paga mucho más. Las dos vías no se suman entre sí.

## Infraestructura

- **Repo público** → minutos de GitHub Actions ilimitados.
- **Las sesiones en la nube de Claude Code no llegan a `www.googleapis.com` ni a `speech.platform.bing.com`** (la red las bloquea). Lo que necesite esos servicios corre en **GitHub Actions**. npm y PyPI sí funcionan.
- **Secreto de Actions:** `YOUTUBE_API_KEY` (YouTube Data API v3), ya cargado. Nunca escribir claves en archivos del repo.
- Los workflows solo se disparan con push a `main` o a mano (nunca desde forks), para que nadie de afuera llegue al secreto.
- **Cuota de la API:** 10.000 unidades por día (verificar en la consola). `search.list` cuesta 100; datos de un canal + sus videos vía la playlist de subidas, unas 16.
- **Subida por API:** según la documentación actual de `videos.insert`, los videos subidos desde proyectos sin verificar ya no quedan en privado. 100 subidas por día; requiere autorizar la cuenta de Google con OAuth una vez. Todavía no está armado: por ahora se sube desde el celular.

## Skills instalados (`.claude/skills/`)

Revisados antes de instalar: sin llamadas de red ocultas ni código peligroso.

- **youtube-agent-skill** (Jake Schincariol, MIT): `yt-script`, `yt-package`, `yt-viral`, `yt-retention`, `yt-plan`, `yt-seo`, `yt-shorts`, `yt-audit`, `yt-chapters`, `yt-comment`, `yt-edit`. Tiene herramientas en Python que se ejecutan (puntuador de ganchos, linter de títulos, ranking de virales por múltiplo sobre la mediana del canal). Está pensado para creadores con cámara: `yt-edit` no aplica a animación, y el archivo de "voz" (`yt-script/voice.template.md`) hay que adaptarlo a un narrador.
- **claude-youtube** (AgriciDaniel, MIT, beta): orquestador `/youtube` con sub-skills (strategy, ideate, competitor, calendar, hook, script, shorts, seo, metadata, thumbnail, analyze, audit, monetize, repurpose), guías de referencia y scripts de la API en `execution/` (leen `YOUTUBE_API_KEY` del entorno). Las cifras de sus guías no tienen fuente: verificarlas antes de usarlas (ej.: su plantilla dice que los Shorts duran menos de 60 s; YouTube los amplió a 3 minutos).
- División propuesta: guion y empaque con el pack de Jake; estrategia, ideas, competencia y monetización con claude-youtube.

## Lo que dijo Grok sobre producción (y qué se verificó)

- **Sirve:** reglas de retención (en `prompts/master-short.md`), Remotion como motor, estilo dark-minimal.
- **claude-faceless-shorts-creator** (hassancs91, MIT): existe y se revisó. Proceso completo con Remotion + ElevenLabs. Se usó como referencia, pero las plantillas de este repo son propias. Su biblioteca de música y efectos fue generada con ElevenLabs: no está claro el derecho de uso comercial, **no se usa**.
- **No existen o no se encontraron:** `sergebulaev/youtube-skills`, `artemnovitckii/claude-animation-skills`, "Lemo Opuscar".
- **Descartado por costo:** ElevenLabs y Higgsfield (pagos). CapCut queda como opción manual para retoques.
- **Licencias verificadas:** Remotion es gratis para personas individuales, también para uso comercial (empresas de más de 3 empleados pagan). HyperFrames (HeyGen) es Apache-2.0, alternativa no probada.

## Pendiente

1. Probar la producción de punta a punta (ver "Cuando el dueño diga ok").
2. Elegir la voz con las muestras.
3. **Música y efectos** con licencia comercial clara (todavía no hay; los Shorts salen solo con voz).
4. Imágenes o recursos visuales de dominio público, si el dueño quiere sumar estatuas o arte clásico.
5. Subida automática por API (OAuth).
6. Cómo exportar la retención de YouTube Studio desde el celular.
7. Distribución a TikTok y Reels (opcional).

## Fases

1. Cimientos: repo, contexto, skills ✅
2. Investigación de competencia con la API (vía Actions): mediana de los últimos Shorts de cada canal, frecuencia, duración, videos que superan 2x la mediana de su canal, comentarios ← **después de la producción**
3. Producción: plantillas, voz, video de prueba de punta a punta ← **acá estamos**
4. Guiones en lote
5. Publicar y medir a las 48 horas
6. Video largo, monetización y trámite fiscal en Argentina (Factura E, monotributo)
