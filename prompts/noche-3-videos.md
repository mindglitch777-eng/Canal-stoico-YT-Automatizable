# Trabajo de la noche: 3 videos listos para subir

Pedido del dueño (05/11/2026, antes de irse a dormir): **tres Shorts terminados para la mañana**, cada uno con un estilo visual totalmente nuevo, animación más loca y creativa que `marco-aurelio-chatarra` (que es el piso, no el techo), y sonido y música por código. Se van a subir a YouTube y TikTok para probar.

**El dueño está durmiendo: no hay a quién preguntarle.** Decidí vos, anotá cada decisión en el informe final y seguí. La única razón para frenar un video es que viole algo legal (derechos de imágenes, música o fuentes) o que el render sea imposible; en ese caso, terminá los otros dos.

## Los tres guiones (ya escritos y aprobados por `check_short.py`)

| Carpeta | Creencia que rompe | Estilo visual (nuevo en cada uno) | Música |
|---|---|---|---|
| `shorts/diogenes-rey` | Al poder y a la plata no se les dice que no | Vasija griega de figuras negras que cobra vida: terracota, negro, sol contra la sombra del rey; se quiebra y aparece el mundo de hoy | Lira y aulós en modo frigio, tambores de guerra, silencio y amanecer |
| `shorts/seneca-tiempo` | La plata es lo más valioso que tenés | Oscuridad con luz fría de pantalla, glitch, notificaciones como armas; el oro solo para el tiempo de vida | Ritmo hecho con tics de reloj que aceleran; en el giro se paran todos los relojes |
| `shorts/millonario-invisible` | Los ricos se ven ricos | Programa de concurso de TV + publicidad de lujo que se vuelve rayos X; después del giro el lujo se pone gris | Lounge de lujo con trap suave que hace tape stop y se vuelve bajo oscuro; cierra con lira |

Cada `short.json` trae todo lo que hay que cumplir: `belief_broken`, `direction` (concepto, look, ritmo, loop), `music` (estilo, tempo, secciones, mezcla) y, por escena, `onScreen`, `visual`, `camera`, `transition` y `sfx`.

## Reglas (todas)

- `prompts/estandar-viral.md` (vara alta) y `prompts/sonido.md`.
- Lo aprendido en `marco-aurelio-chatarra` (CLAUDE.md, "Aprendido en…" y "Herramientas generales…"): placa oscura detrás del texto sobre fondos cargados, nada de `filter: blur` + `box-shadow` juntos, cero tiempo muerto en las citas, algo pasando en los primeros 0,5 s, la franja de 1180-1330 libre para subtítulos, subtítulos que no repiten lo que ya está en pantalla.
- **Nada visual copiado de los videos anteriores.** Las herramientas compartidas sí (voz, `KineticText`, subtítulos, mezclador, loop, volumen, control final); las escenas, los objetos y el look se inventan para cada guion. Si una idea del `visual` se puede hacer todavía más impactante, hacela más impactante. Lo que nunca se cambia: la voz del guion y los datos.
- **Zona segura para YouTube Y TikTok:** TikTok tapa más abajo y a la derecha. Nada importante debajo de y = 1450 ni pegado al borde derecho (dejá ~120 px).
- Datos y citas tal cual están en el guion (tienen fuente en `sources`). Los personajes y cifras del concurso de `millonario-invisible` son ilustrativos.
- Imágenes: solo dibujadas por código o de dominio público/CC0 (`tools/pd_images.py`). Nada de logos ni marcas reales reconocibles (el "Ford" de `millonario-invisible` se dice en la voz; en la imagen, una camioneta genérica sin logo).

## Cómo trabajar (para que entren los tres en la noche)

1. `git fetch origin viral && git merge origin/viral` (trae estos guiones y este archivo).
2. `python3 tools/check_short.py shorts/<id>` para los tres.
3. Por cada video: composición en `remotion/src/shorts/<id>/` (registrada en `remotion/src/shorts/index.ts` con `loop: true`) y `shorts/<id>/sound.py`.
4. **No renderices completo para probar.** Revisá por tramos (`--frames A-B` o `npm run test:templates -- --short shorts/<id> --at ...`) y mirá vos los cuadros: texto cortado, encimado, oro sobre oro, cuadros vacíos.
5. Lanzá los tres renders en Actions apenas cada uno esté listo (corren en paralelo, ~30 min cada uno). Mientras renderiza uno, trabajá en el siguiente.
6. Control final de cada uno (`tools/verify_short.py`), con estos mínimos:
   - loop: SSIM entre el primer y el último cuadro ≥ 0,90
   - volumen: -14 LUFS ±0,5, pico ≤ -1 dBTP, 48 kHz
   - silencios: solo los 2 intencionales (`pause_after`), ninguno en el último segundo
   - duración: 40 a 48 s
   - hoja de cuadros revisada por vos, cuadro por cuadro
   Si algo no pasa, corregilo y volvé a renderizar. Mejor 3 videos bien hechos que 3 a medias: si el tiempo no alcanza, priorizá en este orden: `seneca-tiempo`, `millonario-invisible`, `diogenes-rey`.
7. Commit y push de cada video terminado a medida que esté (no al final de todo).

## Lo que tiene que estar a la mañana

- Los 3 MP4 en `salidas/shorts/run-N/` con su hoja de cuadros y su informe.
- **`salidas/MAÑANA.md`**: un resumen corto para el dueño, que lo lee desde el celular:
  - por video: link al MP4, duración, resultado del control final y qué tiene de distinto
  - título sugerido para YouTube y para TikTok (con `/yt-package`), descripción corta y 3-5 hashtags
  - decisiones que tomaste solo y cualquier cosa que no salió
- CLAUDE.md actualizado: estado de los tres videos, herramientas nuevas que se hayan vuelto generales y lo aprendido.

**No subas nada a YouTube ni a TikTok:** eso lo hace el dueño a la mañana.
