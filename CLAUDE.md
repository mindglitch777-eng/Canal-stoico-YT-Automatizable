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
- **Regla permanente (04/11/2026): vara alta.** Cada Short busca dopamina y engagement máximos: gancho que rompe lo normal, recompensas constantes, imagen literal para cada frase, final en loop. Está en `prompts/estandar-viral.md` y se verifica con `python3 tools/check_short.py shorts/<id>` **antes de cada render**. El dueño juzgó el primer Short de Séneca "pobre, plano y notablemente hecho con IA": ese es el piso que no hay que repetir.
- **Decisión del dueño (04/11/2026): cada video se hace a medida, no con plantillas.** Cada Short tiene su propia composición en código (`remotion/src/shorts/<id>/`), escrita para ese guion: si el `visual` de una escena dice "la toga se deshace en harapos", se programa exactamente eso. Lo que se reutiliza son **herramientas** (cámara y cortes, `KineticText`, subtítulos, mundo 3D, destellos, voz, efectos), no escenas fijas. Los 7 tipos de escena actuales quedan como piezas que se pueden reciclar o como prototipo rápido, nunca como molde.
  - **Nada visual es fijo**: los videos no tienen que arrancar ni verse igual (ni 3D, ni moneda, ni la misma entrada). El dueño quiere dinamismo y animaciones cada vez más locas según el guion. Herramienta compartida = solo lo que seguro se repite (voz y tiempos, formato y zona segura, fuentes, sincronía texto-voz, render). Si algo nuevo aparece en varios videos, recién ahí se vuelve herramienta.

## Estado actual (04/11/2026, actualizado)

**Fase actual: 3 — producción.** La investigación de competencia (fase 2) se hace después, por decisión del dueño.

Hecho y subido:
- Skills de YouTube en `.claude/skills/` (ver abajo).
- Plantillas de animación en `remotion/` (7 tipos de escena), scripts de prueba y render. **Versión 2** con mundo 3D, cámara con cortes y golpes sincronizados (ver "Código de las plantillas").
- Voz: `tools/tts.py` (Edge TTS por escena con tiempos por palabra) y `tools/voice_samples.py`.
- Workflows de GitHub Actions: prueba de plantillas, render de Short, muestras de voces.
- Plantilla maestra del guion: `prompts/master-short.md` (formato + reglas de retención aportadas por el dueño vía Grok).
- Short de ejemplo: `shorts/ejemplo-seneca/short.json` (primera prueba; **no cumple** el estándar viral, queda como referencia de lo que no).
- **Primer Short con el estándar viral:** `shorts/seneca-300-millones/short.json` (10 escenas, ~41 s, una recompensa distinta cada ~4 s, giro al 60 %, final en loop con el gancho; gancho puntuado 72/STRONG en `hookscore.py`). Pasa `check_short.py`. **Falta renderizarlo** y revisar cuadros (`--at 0,0.5,0.95`) por texto cortado.
  - Cada escena trae `visual`: la imagen literal que pide el guion. Varias todavía no existen en las plantillas (toga que se deshace en harapos, balanza, busto de Séneca, montaña de monedas que se derrumba, palabra que se rompe como vidrio). Son el próximo trabajo de plantillas: hoy el render usa lo que cada tipo de escena ya hace.
- Imágenes de dominio público: `tools/pd_images.py` + workflow "Imágenes de dominio público" (Met, Art Institute of Chicago, Wikimedia Commons; solo dominio público o CC0, con créditos y hoja de contactos). **No probado todavía** (la sesión en la nube no llega a esos sitios).

Probado (04/11/2026):
- Las 7 plantillas renderizan sin errores (local y en Actions).
- **Producción de punta a punta con voz real: funciona.** El workflow "Render de Short" generó `ejemplo-seneca.mp4` (33,8 s, 1080x1920, voz Andrew) desde el `short.json`.
- Los 3 workflows (plantillas, render, voces) corrieron bien en Actions.
- Muestras de voces generadas (11 voces masculinas en EE. UU. y Reino Unido, "normal" y "calmo") y enviadas al dueño. **Falta que elija.**
- Plantillas v2 con voz real: el Short de Séneca renderizó bien en Actions (33,8 s, unos 30 min de render por el 3D por software).
- El corte de los renders largos ("delayRender ... not cleared") venía de esperar las fuentes a nivel de módulo; se arregló con `useFontsReady()` dentro de `Short`. Ahora el render completo también anda en la sesión en la nube (lento: ~1,5 s por cuadro con una pestaña; usar `--frames A-B` para probar un tramo).

Rama `salidas`: los workflows de voces, render e imágenes suben ahí sus resultados (`voces/`, `shorts/run-N/`, `imagenes/<búsqueda>/`), así el dueño los abre desde el celular en github.com y Claude los trae con `git fetch origin salidas` (los artifacts de Actions no se pueden bajar desde la sesión en la nube). La rama no comparte historia con main.

Para disparar un workflow desde la sesión: herramienta de GitHub `actions_run_trigger` con `ref` = la rama de trabajo (corre la versión de esa rama, pero el archivo del workflow tiene que existir también en main).

Observaciones del primer Short (versión 1): el contenido ocupaba solo el tercio de arriba y los subtítulos se pegaban. Las dos cosas se resolvieron en la versión 2.

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

### Código de las plantillas (`remotion/src/`) — versión 2 (04/11/2026)

Pedido del dueño: edición de nivel profesional, "dopamina constante", 3D y efectos inesperados. Capas, de atrás hacia adelante:

- `Background.tsx`: negro cálido con luz que respira.
- `World3D.tsx` (three.js vía `@remotion/three`): la cámara vuela por una columnata de la Stoa entre polvo de oro. Cambia de ánimo por escena: la moneda pasa volando en el gancho, llueven monedas en `counter`, la luz se vuelve roja en un `chart` que cae y hay una moneda protagonista en `outro`. Todo depende del cuadro, sin reloj.
- `fx.tsx` → `Camera`: deriva 3D, un corte de plano cada ~1,5 s (zoom/ángulo distinto), golpe de zoom, temblor y aberración cromática en cada golpe. También tiene `transitionStyle`, que rota 5 transiciones entre escenas: zoom, latigazo, giro 3D, glitch y caída.
- `scenes/`: escenas centradas en la zona segura (`stage.tsx`).
- `fx.tsx` → `Flashes` (destello en cada escena y barrido anamórfico en cada palabra dorada), `Lens` (filtraciones de luz, grano, viñeta), `Progress` (barra de progreso arriba).
- `Captions.tsx`: subtítulos tipo karaoke (bloques de 3 palabras con rebote, placa dorada en la palabra que suena, palabras clave en oro).
- `director.tsx`: calcula golpes (inicio de escena, palabras `*doradas*` cuando la voz las dice, números), planos y sincronía texto-voz. Todas las capas leen de acá.
- `kinetic.tsx`: `KineticText` (palabras que entran cuando la voz las dice: slam, rise, flip, mask), `goldStyle` (oro con extrusión 3D y brillo que pasa), `Decode` (texto que se descifra), `Shockwave`.
- `types.ts`, `theme.ts`, `demo.ts`, `fonts.ts`: igual que antes. El formato de `short.json` no cambió.

Render: WebGL por software (`REMOTION_GL`, por defecto `swangle`, sirve sin GPU). `npm run test:templates -- --at 0.15,0.5,0.9` saca 3 cuadros por escena. El workflow "Prueba de plantillas" publica `demo.mp4` y la hoja de contactos en `salidas/plantillas/run-N/`.

### Videos a medida y sonido (04/11/2026)

- **Composición propia por Short:** `remotion/src/shorts/<id>/index.tsx`, registrada en `remotion/src/shorts/index.ts` (con `noCaptions` para escenas sin subtítulos). Si un Short no está registrado, `Short.tsx` usa las escenas genéricas. Las escenas de `short.json` pueden ser `type: "custom"` y llevar `onScreen`.
- **marco-aurelio-chatarra:** 11 mundos (reloj de oro 3D con reflejos de estudio que explota en piezas y se rearma para el loop, el áureo con el perfil de Marco Aurelio sobre el mapa del Imperio, el pergamino con vela, el banquete y el vino, la túnica y la oveja, el celular en capas con contrato, la cinta hedónica, la espiral de precios que estalla en vidrio, las etiquetas arrancadas y la cita grabada en mármol negro con vetas de oro). Decisión de producción: el "busto" se hizo como el perfil laureado de sus monedas, porque no había una imagen real del busto. Cuando funcione el workflow de imágenes de dominio público, se puede cambiar.
- **Sonido:** `python tools/sfx/mix.py shorts/<id>` lee `build/timeline.json` y `shorts/<id>/sound.py` (función `design(tl, mix)`; `tl.word(escena, "palabra")` da el segundo exacto) y escribe `build/sound.wav` (música + efectos, la música baja 10 dB con la voz). `render.mjs` lo suma a la voz y el workflow normaliza a -14 LUFS. Necesita numpy y scipy (en `tools/requirements.txt`).
- **Workflow "Render de Short":** corre `check_short.py` (frena si el guion no cumple el estándar), voz, sonido, render, volumen (`tools/loudness.py`) y control final (`tools/verify_short.py`). Publica en `salidas/shorts/run-N/` el MP4, `<id>-hoja.jpg` (cuadros a 1 fps) y `<id>-informe.json`. Timeout de 90 min.

### Herramientas generales que salieron de marco-aurelio-chatarra (05/11/2026)

- **Tiempos de voz (`tools/tts.py`):** recorta el silencio que Edge TTS deja al principio y al final de cada frase. `"gap"` en el `short.json` fija el aire entre escenas (por defecto 0,25 s; en este video 0,1 s) y `"pause_after"` en una escena pide una pausa propia (los silencios intencionales).
- **Subtítulos sin duplicar (`Captions.tsx`):** un bloque se oculta si el 60 % o más de sus palabras con contenido ya está en pantalla (se ignoran mayúsculas, signos y palabras vacías; "+" cuenta como "and"). Las escenas genéricas declaran su texto solas; un video a medida lista lo que dibuja en `screen` (ver `remotion/src/shorts/<id>/index.tsx`).
- **Loop (`loop: true` en el registro de `remotion/src/shorts/index.ts`):** el video termina justo en el último cuadro (sin la cola de 0,5 s), el cuadro 0 no tiene destello, `Lens still` deja fijas las luces y el grano, y los subtítulos se apagan en los últimos 6 cuadros. En el sonido, `mix.mus(..., wrap=True)` hace que lo que pasa del final suene al principio.
- **Volumen (`tools/loudness.py`):** -14 LUFS en dos pasadas, limitador para que el pico real quede por debajo de -1 dBTP después del AAC, 48 kHz.
- **Control final (`tools/verify_short.py`):** SSIM entre el primer y el último cuadro (`--loop`, mínimo 0,90), volumen, pico, silencios de más de 0,1 s (se permiten 2 y ninguno en el último segundo), duración (`--min/--max`) y hoja de cuadros (`--sheet`).

### Aprendido en marco-aurelio-chatarra

- **CSS que falla en el render:** un elemento con `filter: blur()` y `box-shadow` grande a la vez (la llama de una vela) salió en algunos cuadros como un rectángulo blanco con WebGL por software. Para brillos y llamas, usar SVG con degradés radiales.
- **Texto legible sobre fondos cargados:** placa oscura detrás (degradé radial casi negro) y texto marfil u oro con sombra. El oro sobre oro (engranajes) no se lee.
- **Cero tiempo muerto en las citas:** si la voz presenta la cita ("Marcus wrote it down:"), mostrar algo grabándose mientras tanto (la obra y el capítulo).
- **Los primeros 0,5 s:** algo tiene que pasar antes de la primera palabra fuerte (en este video, el segundero se traba y se raja el cristal).
- Los subtítulos y los textos de la composición se pisaban abajo de y = 1100: dejar libre la franja de 1180 a 1330 para los subtítulos.

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

1. ~~Probar la producción de punta a punta~~ ✅ (ver "Probado").
2. Elegir la voz con las muestras (ya enviadas).
2a. ✅ Soporte para videos a medida (registro en `remotion/src/shorts/index.ts`). Falta hacer a medida `seneca-300-millones`: composición por Short en `remotion/src/shorts/<id>/` (registrada en `Root.tsx`), que el render elija si existe y si no use las escenas genéricas; primera: `seneca-300-millones`, cumpliendo cada `visual` de su `short.json`.
2b. **Escenas de imagen literal** que pide `prompts/estandar-viral.md` (ver los campos `visual` de `shorts/seneca-300-millones`): transformaciones de objetos (toga → harapos, oro → pan), balanza, busto de mármol, montaña de monedas, texto que estalla. Las imágenes de dominio público (`tools/pd_images.py`) pueden servir para el busto.
2c. ✅ **Sonido y música por código:** `tools/sfx/synth.py` (paleta) y `tools/sfx/mix.py` (mezclador); cada video escribe su `shorts/<id>/sound.py`.
2d. ✅ **Hecho (v2, 05/11/2026: loop exacto, cita legible, subtítulos sin repetir, -14 LUFS, 44-46 s):** composición a medida en `remotion/src/shorts/marco-aurelio-chatarra/` y sonido en `shorts/marco-aurelio-chatarra/sound.py` (ver "Videos a medida y sonido"). Guion: `shorts/marco-aurelio-chatarra/short.json`. Rompe la creencia de que lo caro vale lo que cuesta (Marco Aurelio, *Meditaciones* 6.13). 11 escenas, ~46 s, gancho 72/STRONG. Pasa `check_short.py`. Trae dirección completa: concepto, look, `music` por secciones y, por escena, `visual`, `camera`, `transition` y `sfx`. Es el guion para el primer video **a medida** con sonido: hacerlo cumpliendo cada campo.
3. **Música y efectos** con licencia comercial clara (el dueño lo deja para después; los Shorts salen solo con voz).
4. Imágenes de dominio público: probar el workflow y sumar una escena con imagen a las plantillas.
5. Subida automática por API (OAuth): después de crear el canal (todavía no existe).
6. Cómo exportar la retención de YouTube Studio desde el celular.
7. Distribución a TikTok y Reels (opcional).

## Fases

1. Cimientos: repo, contexto, skills ✅
2. Investigación de competencia con la API (vía Actions): mediana de los últimos Shorts de cada canal, frecuencia, duración, videos que superan 2x la mediana de su canal, comentarios ← **después de la producción**
3. Producción: plantillas, voz, video de prueba de punta a punta ← **acá estamos**
4. Guiones en lote
5. Publicar y medir a las 48 horas
6. Video largo, monetización y trámite fiscal en Argentina (Factura E, monotributo)
