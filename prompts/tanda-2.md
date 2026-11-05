# Tanda 2: tres videos de viralidad pura

Pedido del dueño (05/11/2026): **más virales y más potentes que la tanda 1**, que rompan expectativas y tengan un desarrollo visual impresionante. `diogenes-rey` quedó descartado (el dueño lo juzgó malo: el gancho pedía conocer a personajes históricos y los textos no se leían). Estos tres lo reemplazan y siguen la tanda.

## Los guiones (pasan `check_short.py`, con dirección completa)

| Carpeta | Frase que rompe | El golpe | Estilo visual (nuevo) | Música |
|---|---|---|---|---|
| `shorts/la-voz` | "You deserve it" | La voz que te hace gastar ya no viene de afuera: **sale de tu propia boca** | Cine negro en blanco y negro con lluvia y UN solo color: el rojo de la voz; el oro aparece recién cuando él responde | Jazz noir: contrabajo, escobillas, trompeta con sordina, susurros como ritmo |
| `shorts/dos-hermanos` | "El que se ve rico, ganó" (parábola) | Engaña la primera mitad (Jake parece ganar), el banco se lleva su mundo, abajo del suelo aparecen raíces de oro de Sam, y **nunca hubo dos hermanos: es el espectador** | Diorama de juguete en miniatura con tilt-shift; debajo del suelo, tierra oscura con raíces de oro | Caja de música que se queda sin cuerda; braam bajo tierra; cuerdas y coro |
| `shorts/elegido-por-vos` | "Yo elijo lo que compro" | Tres trucos reales (señuelo, $4.99, ancla) y **el video se delata: usó tres trucos con vos** (rompe la cuarta pared) | Publicidad brillante que se "desviste" en un blueprint cian con hilos de marioneta | Suspenso documental con clic de proyector; en el giro la música se rebobina sola |

Prioridad si no da el tiempo: `la-voz`, `dos-hermanos`, `elegido-por-vos`.

## Qué tiene que superar

- **El piso es `marco-aurelio-chatarra` y la tanda 1** (`seneca-tiempo`, `millonario-invisible`). Esta tanda tiene que ser visualmente más impresionante: más profundidad, más movimiento de cámara, transformaciones más locas. Si una idea del `visual` se puede hacer todavía más impactante, hacela.
- **Los giros son el corazón de estos tres:** el reflejo que susurra (`la-voz`, escena 7), la cámara que atraviesa el suelo hasta las raíces y los hermanos que se funden en el espectador (`dos-hermanos`, escenas 7 y 10) y el zoom out que muestra el propio Short en un celular con sus trucos marcados (`elegido-por-vos`, escenas 7 y 8). Son los momentos que tienen que verse increíbles: dales el mayor trabajo.
- En `elegido-por-vos`, los tres trucos que se marcan en la escena 8 tienen que ser reales en el video: el "Why?" del gancho, el número 3 en pantalla y los subtítulos que se iluminan.
- En `la-voz`, el "you deserve it" de cada escena se procesa como susurro (filtrado, reverb, doblado) además de la voz principal.

## Reglas

Todas las de `prompts/estandar-viral.md` (incluidas las nuevas 7 a 9: la ficción vale, viralidad pura y giros que rompen expectativas), `prompts/sonido.md` y lo aprendido en CLAUDE.md (marco-aurelio-chatarra y la noche de 3 videos): placas que entran con la palabra, medir el ancho de los textos, contraste con contorno, colchón en la música, `Frame0(t)` para el loop, `duration_range`, zona segura de YouTube y TikTok (nada importante debajo de y = 1450 ni pegado al borde derecho).

Sin logos ni marcas reales en la imagen (el superauto de Jake y la publicidad del cine son genéricos).

## Cómo trabajar y qué entregar

Igual que `prompts/noche-3-videos.md`: composición propia por video, prueba por tramos mirando los cuadros, renders en paralelo en Actions, control final (`verify_short.py`: loop SSIM ≥ 0,90, -14 LUFS ±0,5, pico ≤ -1 dBTP, solo los silencios intencionales, 41-47 s), commit y push de cada video a medida que esté. Si el dueño no está, decidí vos y anotá las decisiones.

Al terminar: los MP4, hojas e informes en `salidas/shorts/run-N/`, un resumen en `salidas/TANDA-2.md` (link a cada video, control final, título para YouTube y TikTok, descripción corta, 3-5 hashtags, decisiones tomadas) y CLAUDE.md actualizado. **No subas nada a YouTube ni a TikTok.**
