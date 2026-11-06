# Paquete completo: reglas para Shorts que atrapan

**Un solo archivo con todo.** Parte 1: las reglas resumidas y ordenadas. Parte 2: los archivos originales completos (estándar, retención, sonido, fórmulas de gancho, guías de los skills y 3 guiones de ejemplo).

# PARTE 1: LAS REGLAS

Documento autosuficiente: junta en un solo lugar todas las reglas de engagement y retención de Calm Fortune, para usarlas en otro proyecto. Reúne:
- el estándar del dueño ("vara alta");
- las reglas de retención que trajo Grok;
- las guías de los skills de YouTube;
- lo aprendido produciendo 9 Shorts.

Donde algo es propio de Calm Fortune (estoicismo + dinero), está marcado **[Calm Fortune]**: se cambia por el nicho del otro proyecto.

**Cómo leer las fuentes:**
- **Reglas del dueño:** mandan sobre todo lo demás.
- **Grok:** reglas de retención que el dueño trajo y aprobó.
- **Guía de skill:** cifras de las guías de `claude-youtube`. Ojo: **no traen fuente verificada**, sirven como orientación y no como dato.
- **Aprendido:** errores y aciertos reales de producción.

---

## 0. Principios que mandan

1. **Vara alta (regla permanente).** Cada Short busca dopamina y engagement máximos: un gancho que rompe lo normal, recompensas constantes, una imagen literal para cada frase y un final en loop. El piso que no hay que repetir es un video "pobre, plano y notablemente hecho con IA".
2. **Cada video se hace a medida, no con plantillas.** Se reutilizan herramientas (voz, subtítulos, cámara, efectos), nunca escenas fijas. Nada visual es obligatorio: cada video puede arrancar, verse y cerrar distinto. Mientras más distinto y más loco sea lo que pide el guion, mejor.
3. **Manda la viralidad pura.** La ficción vale: parábolas, personajes inventados, "imaginá que…". **Lo único que no se inventa:** citas o datos atribuidos a personas reales o a estudios. Una cita real dice lo que esa persona escribió; un número de un estudio es el número real, con fuente.
4. **El gancho no necesita contexto.** Nadie tiene que saber quién era un personaje histórico para engancharse. Usar frases populares o problemas de todos ("you deserve it", "money can't buy happiness", "work hard and you'll get rich") y romperlos. **[Calm Fortune]** Lo estoico entra como la llave que rompe la trampa, no como clase de historia.
5. **Legibilidad antes que todo.** Un video con textos que no se leen está descartado, aunque sea lindo (fue la razón del rechazo de `diogenes-rey`).

---

## 1. Los primeros 3 segundos

- **Gancho en 1,5 s:** una frase que contradiga lo esperado y una imagen que la muestre literalmente.
  - Hablado: 12 palabras o menos.
  - En pantalla: 6 palabras o menos.
- **Pattern interrupt inmediato**, visual o verbal. Según una guía de skill, un corte de patrón en los primeros 5 s retiene un 23 % más.
- **Una pregunta abierta en los primeros 3 s** que recién se cierre al final. Ejemplo: el gancho termina en "Why?".
- **Prohibido:** "Hey guys", introducciones lentas y contexto innecesario.
- **El primer cuadro tiene acción.** Nada de arrancar en negro ni con fundido. Algo tiene que pasar antes de la primera palabra fuerte: un segundero que se traba, maletines que caen, una mano que agarra.
- Fórmulas de gancho que funcionaron (puntaje en `hookscore.py`):
  - **Paradoja con número:** "Someone whispers 3 words before you waste money. You never notice. Why?" (80)
  - **Adivinanza que vas a errar:** "You'd never guess which brother went broke. Both got $1 million. Why?" (76)
  - **"No lo elegiste vos":** "You never chose the medium popcorn. 3 tricks chose it. Why?" (67)
- El puntuador de ganchos (`hookscore.py`) se basa en palabras clave: sirve como filtro, no como juez final.

## 2. Estructura del guion: Hook → Retain → Reward

- **Hook (0-3 s):** detiene el scroll.
- **Retain:**
  - una **recompensa cada 3 a 5 s, sin repetir el tipo dos veces seguidas**;
  - open loops ("lo que nadie te dice…", "el error que comete el 90 %…").
- **Recompensas posibles:** `paradox` (paradoja), `number` (cifra que sorprende), `reveal` (revelación), `quote` (cita real), `data` (dato o ciencia), `consequence` (consecuencia visible), `twist` (giro), `contrast` (contraste), `payoff` (cierre de la pregunta), `challenge` (desafío al espectador), `humor` (remate seco).
- **Un giro entre el 55 % y el 75 % del video** que dé vuelta la idea.
- **Reward:** un payoff claro y un final que conecte con el inicio.
- **Cada frase podría ser un gancho.** Sin relleno ni contexto que no pague.
- **Engañar a propósito en la primera mitad** para que el espectador crea lo contrario, y dar vuelta todo en el giro.
- **Los golpes más fuertes:**
  - **El espectador es el protagonista:** "There were never two brothers. It's you, every payday."
  - **El video se delata a sí mismo** (cuarta pared): "And this video? It used three tricks on you too." Señalar trucos **reales** del propio video: la pregunta del gancho, el número en pantalla y los subtítulos que se encienden.
  - **El enemigo eras vos:** "The voice stopped needing them. Now it sounds like you."
- **Cierre con una acción mínima y concreta** que el espectador pueda hacer hoy: "Pause 3 seconds", "Listen tonight", "Yours can say: not today".
- **Estructura de los 3 mejores guiones (11 escenas, 34-44 s):**
  1. Gancho con pregunta.
  2. Situación de todos.
  3. Primera consecuencia.
  4. Escalada.
  5. Número que duele.
  6. Persecución o más trucos.
  7. **Giro**, con 0,4 s de silencio antes.
  8. Cita real.
  9. Contraste.
  10. Payoff.
  11. Frase que empalma con la primera.

## 3. El loop (final que empalma)

- **La última frase lleva a la primera.** Ejemplos:
  - "Because someone whispers…" → "Someone whispers 3 words…"
  - "So which brother are you?" → "You'd never guess which brother…"
- **El último cuadro es idéntico al primero.** Se logra dibujando el cuadro 0 como una función del tiempo, `Frame0(t)`; la última escena lo dibuja con `t` negativo hasta llegar a 0. Objetivo: un SSIM de 0,90 o más entre el primer y el último cuadro. Se lograron 0,97-0,99.
- **El sonido también empalma:** lo que se pasa del final suena al principio (lluvia, jingle, el silbido de algo que cae y aterriza en el cuadro 0).
- En el empalme no van destello ni subtítulos: se apagan en los últimos 6 cuadros.
- Según una guía de skill, un "% visto promedio" de más de 100 % significa que la gente lo repite, y el algoritmo lo premia mucho.

## 4. Ritmo visual

- **Cada frase con su imagen literal:** se muestra, no se explica. Si dice "rough cloth", la toga se deshace.
- **Cambio de cámara o de escenario cada 1,5 a 3 s**, no solo de texto. Grok pedía cada 2 a 7 s; una guía de skill dice cada 2 a 3 s en Shorts.
- **Un momento de impacto cada 8 a 10 s:** una transformación, una explosión o la cámara atravesando algo (el suelo, una pantalla, un vidrio).
- **Contrastes alternados:** lejos y cerca, quieto y explosivo, oscuro y brillante.
- **Los giros tienen que ser el momento más espectacular del video.** Es donde va el mayor esfuerzo de animación.
- **Un estilo visual nuevo por video**, dentro de la identidad del canal. Los que se hicieron:
  - cine negro en blanco y negro con un solo color (rojo);
  - diorama de juguete en 3D;
  - publicidad brillante que se "desviste" en plano técnico;
  - interfaz de celular con glitch;
  - concurso de TV que se vuelve rayos X.
- **Un color con significado:** por ejemplo, el rojo es la voz que tienta y el oro la propia; o el oro solo aparece para lo que vale de verdad (el tiempo, las raíces).
- **Sin marcas ni logos reales.** Autos, celulares, apps y productos son genéricos.

## 5. Texto en pantalla y legibilidad

- **6 palabras o menos en pantalla** (las citas, hasta 10) y nunca cortadas por los bordes.
- **Texto grande y de alto contraste.** Mucha gente mira sin sonido.
- **Siempre sobre una placa:** oscura con borde claro, o clara con borde oscuro. Nunca texto suelto sobre un fondo cargado.
- **Contraste:**
  - el oro sobre oro no se lee;
  - el oro sobre terracota necesita un contorno negro grueso;
  - el rojo con un trazo oscuro y brillo.
- **Medir el ancho de los textos grandes:** una palabra de 6 letras a 250 px se sale de 1080. Calcular unos 0,6 a 0,72 del tamaño por letra.
- **La placa del título entra con la primera palabra que dice la voz**, nunca antes y vacía.
- **Las palabras entran cuando la voz las dice** (sincronía texto-voz).
- **Las palabras clave**, 1 o 2 por escena, van en el color de acento y disparan un golpe: destello, zoom o temblor.
- **Citas sin tiempo muerto:** si la voz presenta la cita ("Seneca warned:"), eso aparece escrito mientras se dice, y después la cita palabra por palabra, con la obra y el capítulo.
- **Subtítulos tipo karaoke** en bloques de 3 palabras, con la palabra que suena resaltada.
- **No repetir en los subtítulos lo que ya está escrito en pantalla:** se oculta el bloque si el 60 % de sus palabras ya se ve.
- **Zona segura en 1080x1920:**
  - nada importante debajo de y = 1450 (la interfaz de YouTube y TikTok tapa abajo);
  - unos 120 px de margen a la derecha (botones);
  - dejar libre la franja de y = 1180 a 1330 para los subtítulos.

## 6. Sonido

- **Un efecto en cada corte y en cada revelación**, sincronizado con la palabra exacta.
- **La música sigue la estructura del guion** por secciones (gancho, recompensas, giro, cierre) y cambia en los golpes. Ejemplos:
  - un jingle que se corta con un "braam";
  - una caja de música que se queda sin cuerda;
  - un tema que se "rebobina" cuando el video se delata.
- **El silencio como arma:** cortar todo 0,3 a 0,5 s justo antes del giro es uno de los cortes de patrón más fuertes.
- **Fuera de ese silencio, no puede haber silencios:** cubrir los huecos de la música con un colchón (un drone suave). Máximo 2 silencios intencionales y ninguno en el último segundo.
- **Mezcla:**
  - la voz manda y la música baja unos 10 dB mientras se habla;
  - los efectos van un poco por encima de la música, sin tapar palabras clave.
- **Volumen final:** -14 LUFS (±0,5), pico real de -1 dBTP o menos después de codificar a AAC, 48 kHz.
- **Truco fuerte:** procesar la voz del narrador como susurro (filtrada, con aire, reverb y una copia desafinada) y ponerla encima de la voz principal en la frase clave.
- **Música y efectos generados por código**, sin problemas de licencia. Según una guía de skill, usar temas con licencia en Shorts reduce la parte de ingresos y Content ID puede bloquear Shorts largos.

## 7. Voz y duración

- **Voz a velocidad normal: el video dura lo que dura la voz** (decisión del dueño). No ralentizar la voz para estirar.
- **Duración de los que se hicieron:** 34 a 46 s. Según una guía de skill, el punto dulce de los Shorts es de 15 a 60 s, con picos en 13 s y en 60 s.
- **Una escena es una frase:** apuntar a escenas de 3 a 4,5 s. Más larga, se avisa.
- **Narración:** calma y segura. **[Calm Fortune]** Inglés de EE. UU., voz masculina, Edge TTS.
- Según una guía de skill, la narración con IA retiene un 70 % menos. Es un motivo más para compensar con imagen, sonido y ritmo de primera.

## 8. Formato del guion (`short.json`)

Cada guion trae dirección completa:
- **Arriba:**
  - `belief_broken`: la creencia que rompe;
  - `direction`: concepto, look, ritmo y cómo hace el loop;
  - `music`: estilo, tempo, secciones por escena y mezcla;
  - `fiction` y `sources`: de dónde sale cada cita o dato.
- **En cada escena:**
  - `say`: lo que dice la voz;
  - `onScreen`: lo que se lee; lo que va entre `*asteriscos*` es palabra clave;
  - `beat`: `hook`, `reward`, `twist`, `payoff` o `loop`;
  - `reward`: el tipo de recompensa;
  - `visual`: la imagen literal, que la animación cumple al pie de la letra;
  - `camera`, `transition` y `sfx` (qué suena y en qué palabra);
  - opcional, `pause_after`: un silencio intencional después de la escena.

**Control automático antes del render.** Frena si:
- la primera escena no es `hook`;
- el gancho hablado pasa de 12 palabras o el texto en pantalla pasa de 6;
- falta `beat`, `reward` o `visual`;
- se repite la misma recompensa en dos escenas seguidas.

Avisa si no hay giro, si cae fuera del 55-75 % o si no hay `loop` al final.

**Control del video terminado:** loop (SSIM 0,90 o más), volumen, pico, silencios y duración. Además, mirar una hoja de cuadros a 1 por segundo buscando texto cortado o ilegible.

## 9. Empaque y publicación

**Títulos:**
- **Cerca de 40 caracteres:** es lo que se ve en el celular, y lo que importa va adelante (guía de skill).
- **Con un número concreto** si se puede ("3 words…", "$1M…").
- El texto de portada dice algo **distinto** del título.

Ejemplos que pasaron el linter con 100/100:
- "3 words empty your wallet. You say them." (portada: YOU DESERVE IT)
- "Twins got $1M each. Guess who went broke." (portada: ONLY ONE WAS RICH)
- "3 tricks picked your popcorn for you" (portada: THIS VIDEO TOO)

**Descripción:**
- Los primeros 125 caracteres son los que se ven: ahí va el dato o la idea.
- Fuentes de citas y estudios.
- Marcar si es parábola o ficción.

**Hashtags:** de 3 a 5.

**Lo que la guía de skill dice que mide el algoritmo de Shorts:**
1. Completitud: con un 70 % o más, promoción agresiva.
2. Loops y repeticiones.
3. Comentarios y compartidos, que pesan más que los likes.
4. "Visto vs. deslizado": 75 % o más está bien; menos de 50 % significa que el gancho está roto.
5. El CTR casi no importa en Shorts.

**Otras pautas de la guía de skill:**
- Si "visto vs. deslizado" da menos de 60 %, probar otra apertura enseguida.
- Un Short puede despegar hasta el día 4.
- Pierde empuje después de unos 28 a 30 días.
- Sin marcas de agua de TikTok, porque el algoritmo las castiga.

**Después de publicar:** mirar la retención a las 48 h, buscar en qué segundo se va la gente y corregir eso en el siguiente video.

## 10. Lista de control rápida (antes de dar un Short por terminado)

- [ ] El gancho rompe algo conocido, tiene 12 palabras o menos y deja una pregunta abierta.
- [ ] Pasa algo en el cuadro 0 y antes de la primera palabra fuerte.
- [ ] Hay una recompensa distinta cada 3 a 5 s y un cambio de plano cada 1,5 a 3 s.
- [ ] Hay un impacto visual cada 8 a 10 s.
- [ ] El giro cae entre el 55 y el 75 %, con 0,4 s de silencio antes, y es la imagen más espectacular del video.
- [ ] Si hay cita o dato, es real y tiene fuente.
- [ ] El texto en pantalla tiene 6 palabras o menos, está sobre una placa, es legible en el celular y no se corta.
- [ ] No hay nada importante debajo de y = 1450 ni pegado al borde derecho.
- [ ] Los subtítulos no repiten lo que ya está escrito.
- [ ] Hay un efecto en cada corte y revelación, la música va por secciones y no hay silencios no intencionales.
- [ ] Volumen de -14 LUFS, pico de -1 dBTP o menos.
- [ ] El último cuadro es igual al primero y la última frase lleva a la primera.
- [ ] No hay marcas ni logos reales.
- [ ] Título de unos 40 caracteres con número, portada distinta del título y 3 a 5 hashtags.

---

## Qué hay en la Parte 2

- **Anexos 1 a 3:** las reglas propias completas: el estándar "vara alta" (reglas 1 a 9), la plantilla maestra con las reglas de retención de Grok y el sonido por código.
- **Anexo 4:** las 21 fórmulas de gancho, cada una con su forma, un ejemplo y cuándo falla.
- **Anexos 5 a 9:** los métodos del pack de Jake Schincariol (MIT): guion, Shorts, retención, títulos y virales.
- **Anexos 10 a 17:** las guías de claude-youtube (AgriciDaniel, MIT): Shorts, retención y guion, algoritmo, miniaturas, ganchos, guion y canal enfocado en Shorts.
- **Anexos 18 a 20:** tres guiones de ejemplo completos (la-voz, dos-hermanos, elegido-por-vos), uno por cada tipo de giro fuerte.

---
---

# PARTE 2: ARCHIVOS ORIGINALES COMPLETOS

Lo que sigue es el texto completo de cada archivo en el que se basa el resumen de arriba, para que el otro proyecto tenga todo. Si algo choca, mandan las reglas de la Parte 1.



---

# Anexo 1: Estándar de viralidad ("vara alta")

*Archivo original: `prompts/estandar-viral.md`.*

### Estándar de viralidad de Calm Fortune ("vara alta")

Regla permanente del dueño del canal (04/11/2026): **cada Short busca dopamina y engagement máximos.** Visual y psicológicamente atrapante, con frases que rompan lo normal. Aplica a todo guion y a toda escena. `tools/check_short.py` verifica lo que se puede medir antes de renderizar.

**Son principios, no un molde.** Cada video puede arrancar, verse y cerrar de forma completamente distinta. Nada visual es obligatorio en todos los videos (ni el 3D, ni la moneda, ni un tipo de entrada): se elige o se inventa lo que el guion necesite. Mientras más distinto y más loco sea lo que pide el guion, mejor.

**Herramientas compartidas = solo lo que seguro se repite:** voz y tiempos por palabra (`tools/tts.py`), formato 1080x1920 con zona segura, carga de fuentes, sincronía texto-voz, render en Actions. Todo lo demás (subtítulos, 3D, cámara, transiciones, escenas viejas) es una biblioteca opcional: se usa si suma, se rompe o se reemplaza si no. Si algo nuevo se repite en varios videos, recién ahí se convierte en herramienta.

#### Guion

1. **Gancho en 1,5 s.** Una frase que contradiga lo esperado y una imagen que la muestre literalmente. Hablado: 12 palabras o menos. En pantalla: 6 palabras o menos.
2. **Pregunta abierta en los primeros 3 s** que recién se cierra al final (ej.: el gancho termina en "Why?").
3. **Una recompensa cada 3 a 5 s, sin repetir el tipo dos veces seguidas.** Tipos: `paradox` (paradoja), `number` (cifra que sorprende), `reveal` (revelación), `quote` (cita real), `data` (dato o ciencia), `consequence` (consecuencia visible), `twist` (giro), `contrast` (contraste), `payoff` (cierre de la pregunta), `challenge` (desafío al espectador), `humor` (remate seco).
4. **Un giro (`twist`) entre el 55 % y el 75 % del video** que dé vuelta la idea.
5. **El final empalma con el primer cuadro.** La última frase lleva a la primera, para que el video se repita sin que se note el corte.
6. **Cada frase podría ser un gancho.** Sin relleno ni contexto que no pague.
7. **La ficción vale (decisión del dueño, 05/11/2026).** Parábolas, personajes inventados, "imaginá que…", historias con giro: todo sirve, y se marca con `"fiction": true` y en `sources`. Lo que no se inventa: citas o datos atribuidos a una persona real o a un estudio. Si aparece Séneca, dice lo que Séneca escribió; si aparece un número de un estudio, es el número real, con fuente.
8. **Viralidad pura primero: frases populares o problemas de todos** ("money can't buy happiness", "you deserve it", "work hard and you'll get rich") que se rompen, o "lo que nadie ve". Que el gancho no necesite contexto: nadie tiene que saber quién era un personaje histórico para engancharse (lección de `diogenes-rey`, que el dueño juzgó malo). Lo estoico entra como la llave que rompe la trampa, no como clase de historia.
9. **Giros que rompen expectativas:** engañar a propósito en la primera mitad (que el espectador crea lo contrario) y dar vuelta todo en el giro. Los golpes más fuertes: el espectador es el protagonista ("there were never two brothers") o el video se delata a sí mismo (romper la cuarta pared).

#### Visual

0. **Video a medida, no plantilla** (decisión del dueño): cada Short tiene su propia composición en `remotion/src/shorts/<id>/`, programada para ese guion con las herramientas compartidas (cámara, texto cinético, subtítulos, 3D, efectos). El campo `visual` de cada escena es el pedido que esa composición tiene que cumplir al pie de la letra.
1. **Cada frase con su imagen literal.** Se muestra, no se explica: si dice "rough cloth", la toga se deshace. El campo `visual` de cada escena describe esa imagen.
2. **Cambio de cámara o de escenario cada 1,5 a 3 s**, no solo de texto (las plantillas v2 ya cortan plano cada ~1,5 s).
3. **Un momento de impacto cada 8 a 10 s:** transformación, explosión, la cámara atravesando algo.
4. **6 palabras o menos en pantalla**, nunca cortadas por los bordes. Las citas pueden llegar a 10.
5. **El primer cuadro tiene acción.** Nada de arrancar en negro o con fundido.
6. **Contrastes alternados:** plano lejos y cerca, quieto y explosivo, oscuro y oro.
7. **Identidad opcional:** se puede usar un símbolo del canal (la moneda CF), pero no es obligatorio.

#### Audio

- Efecto en cada corte y en cada revelación, y música del nicho que sigue la estructura del guion. **Todo generado por código** (decisión del dueño): ver `prompts/sonido.md`.

#### Dirección completa (lo que cada guion le pide a la producción)

Además de `beat`, `reward` y `visual`, un guion completo trae:
- Arriba: `belief_broken` (la creencia que rompe), `direction` (concepto, look, ritmo, cómo hace el loop) y `music` (estilo, tempo, secciones por escena, mezcla).
- En cada escena: `onScreen` (lo que se lee), `camera`, `transition` (cómo pasa a la siguiente) y `sfx` (qué suena y en qué palabra).

Ejemplo completo: `shorts/marco-aurelio-chatarra/short.json`.

#### Campos obligatorios por escena en `short.json`

| Campo | Qué es |
|---|---|
| `beat` | Rol en la estructura: `hook`, `reward`, `twist`, `payoff`, `loop` |
| `reward` | Tipo de recompensa (lista de arriba) |
| `visual` | La imagen literal que acompaña la frase (dirección de arte; si la plantilla todavía no la puede hacer, queda como pedido) |

#### Control automático

```bash
python3 tools/check_short.py shorts/<id>
```

El tipo de escena (`type`) es libre: en un video a medida puede ser cualquier cosa (o `custom`). Si la escena no usa los campos de texto de las escenas viejas, se declara lo que se lee en pantalla en `onScreen`.

Frena (error) si:
- la primera escena no tiene `beat: hook`, el gancho hablado pasa de 12 palabras o el texto en pantalla pasa de 6 (10 en citas),
- falta `beat`, `reward` o `visual`,
- dos escenas seguidas tienen la misma `reward`.

Avisa (warning) si una escena dura más de 4,5 s estimados, si no hay `twist` o cae fuera del 55-75 %, o si el final no tiene `beat: loop`.

Lo que no se mide solo: texto cortado por los bordes y primer cuadro oscuro. Se revisan con `npm run test:templates -- --short shorts/<id> --at 0,0.5,0.95` antes del render final.


---

# Anexo 2: Plantilla maestra y reglas de retención de Grok

*Archivo original: `prompts/master-short.md`.*

### Plantilla maestra: cómo se arma un Short de Calm Fortune

> **Regla permanente del dueño: `prompts/estandar-viral.md` ("vara alta").** Manda sobre todo lo de abajo. Cada escena lleva además `beat`, `reward` y `visual`, y cada guion pasa `python3 tools/check_short.py shorts/<id>` antes del render. Ejemplo que cumple: `shorts/seneca-300-millones/short.json`.

Este archivo define el formato. El contenido y el criterio los decide el dueño del canal.

#### Identidad (de la investigación con Grok)

- **Ángulo:** Stoic Wealth: estoicismo real (Séneca, Marco Aurelio, Epicteto) aplicado a dinero, riqueza silenciosa y psicología del dinero.
- **Tono:** calmado, filosófico, anti-hustle.
- **Estilo visual:** dark-minimal, texto grande, animaciones explicativas, sin stock footage genérico.
- **Idioma:** inglés, audiencia de EE.UU.
- **Duración:** 30 a 50 segundos.

#### Reglas de retención (aportadas por el dueño vía Grok)

**Primeros 0 a 3 segundos (críticos)**
- Pattern interrupt inmediato (visual o verbal).
- Prohibido: "Hey guys", introducciones lentas o contexto innecesario.
- Debe crear curiosidad o tensión en menos de 3 segundos.

**Estructura: Hook → Retain → Reward**
- **Hook (0-3 s):** detiene el scroll.
- **Retain:** open loops, pequeños pagos de información cada 3-7 s, cambios visuales constantes.
- **Reward:** payoff claro y un final que conecte con el inicio (loop).

**Pacing**
- Cambio visual o de ritmo cada 2-7 segundos.
- Texto grande y legible (mucha gente mira sin sonido).
- Sin pausas muertas.
- Open loops ("lo que nadie te dice…", "el error que comete el 90%…").
- El final facilita volver a verlo.

#### Proceso

1. **Idea** del ángulo Stoic Wealth (o de la investigación de competencia, cuando esté).
2. **Ganchos:** 5 opciones con `/yt-script` y puntuarlas con
   `python3 .claude/skills/yt-script/hookscore.py --hook "..."`. El puntuador se basa en palabras clave: sirve como filtro, no como juez final.
3. **Escribir** `shorts/<id>/short.json` con el formato de abajo. Cada escena dura lo que dura su `say`, así que una escena ≈ un cambio visual: apuntar a 5-8 escenas de 3-7 s.
4. **Revisión del dueño.**
5. **Subir** el `short.json` a `main` → el workflow "Render de Short" genera voz, subtítulos y MP4.
6. **Empaque** (título, descripción) con `/yt-package` y `/yt-seo`.
7. **Después de publicar:** retención con `/yt-retention`.

#### Formato de `short.json`

```json
{
  "id": "carpeta-del-short",
  "title": "Título de trabajo",
  "voice": "en-US-AndrewNeural",
  "rate": "-6%",
  "pitch": "-2Hz",
  "captions": true,
  "sources": ["De dónde sale cada cita o dato"],
  "scenes": [ ... ]
}
```

Campos comunes de cada escena: `type` y `say` (lo que dice la voz). En los textos en pantalla, lo que va entre `*asteriscos*` sale en oro y `\n` corta la línea.

| `type` | Campos | Para qué | Límites prácticos |
|---|---|---|---|
| `hook` | `text`, `kicker` (opcional, arriba en oro) | Frase de apertura grande | 2-3 líneas de ~20 caracteres |
| `quote` | `quote`, `author`, `source` | Cita textual con autor y obra | hasta ~20 palabras |
| `twoColumns` | `left {title, items[]}`, `right {title, items[]}` | Contraste; lo de la derecha se tacha en rojo | 2-4 ítems por lado, ~16 caracteres cada uno |
| `chart` | `points[]`, `label`, `trend` (`up`/`down`), `annotation` | Línea que se dibuja sola | 5-12 puntos |
| `counter` | `from`, `to`, `prefix`, `suffix`, `decimals`, `label` | Número que cuenta | `label` de hasta ~10 palabras |
| `statement` | `text` | Frase central con palabras en oro | 2-4 líneas |
| `outro` | `text` | Cierre con círculo que se completa y la marca | 2 líneas; idealmente conecta con el gancho |

**Cómo el guion maneja la edición (plantillas v2):**
- Las palabras entre `*asteriscos*` no solo salen en oro: cuando la voz las dice disparan un golpe (destello, zoom, onda expansiva, brillo del 3D). Conviene 1 o 2 por escena, en las palabras que pesan.
- El texto en pantalla entra palabra por palabra al ritmo de la voz si coincide con lo que se dice; si no coincide, entra en cascada.
- `quote`: si la voz pone contexto antes de la cita, primero aparece el autor en grande y después la cita cuando la voz la dice.
- `counter`: el número frena cuando la voz dice la cifra (un número o una palabra como "twice", "half", "ten").
- `chart` con `trend: "down"`: la caída arranca después del punto más alto, con choque rojo.

**Subtítulos:** salen solos, palabra por palabra, a partir de la voz. Si el texto en pantalla de una escena es igual a su `say`, esa escena no repite subtítulos.

Ejemplo completo: `shorts/ejemplo-seneca/short.json`.


---

# Anexo 3: Sonido y música por código

*Archivo original: `prompts/sonido.md`.*

### Sonido y música generados por código

Pedido del dueño: **efectos y música hechos desde código**, pensados para el engagement, para cada video. Son nuestros (sin problemas de licencia) y salen exactamente sincronizados con la imagen.

#### Qué es herramienta y qué es de cada video

- **Herramienta compartida** (se repite en todos los videos): un sintetizador (`tools/sfx/`, a construir) con una paleta de sonidos base y un mezclador que pone cada sonido en su cuadro y baja la música mientras habla la voz.
- **De cada video:** qué suena, cuándo y cómo. Está en el `short.json` (`music` y `sfx` de cada escena). Cada video puede pedir sonidos nuevos: si un sonido nuevo se repite, se suma a la paleta.

#### Paleta base (recetas de síntesis)

Todo con Python (numpy) o `ffmpeg` (`aevalsrc`), determinístico (mismo resultado en cada render).

| Sonido | Receta |
|---|---|
| Golpe de sub-bajo (boom) | Seno que baja de 80 a 35 Hz en 0,4 s + clic de ruido de 5 ms al inicio, saturación suave |
| Whoosh | Ruido blanco con filtro pasabanda que barre 300 → 4000 Hz (o al revés), envolvente en campana |
| Riser | Ruido + seno que suben de tono 2-3 s, con reverb; versión invertida para anticipar un golpe |
| Estallido de vidrio/metal | Cientos de granos cortos de ruido con resonancias inarmónicas agudas, decaimiento rápido |
| Tic de reloj | Clic de 3 ms con pasabanda resonante a 3-4 kHz |
| Moneda / campana | Síntesis FM (relación 1:3,5), ataque instantáneo, cola larga |
| Sello / impacto seco | Golpe grave corto + ruido de papel |
| Parada de tiempo | La mezcla baja de tono en 0,5 s (tape stop) |
| Chasquido de dedos | Ráfaga de ruido de 10 ms con pasaaltos |
| Latido | Dos golpes de seno grave (60 Hz), el segundo más suave |
| Glitch | Ruido con reducción de bits y cortes rítmicos |
| Cinta que se arranca | Ruido con amplitud que tiembla, 0,3 s |
| Gong | Parciales inarmónicos con caída larga |
| Lira | Karplus-Strong (cuerda pulsada sintetizada): suena antigua, sirve de firma del nicho |
| Coro sintético | Ondas con formantes de vocales ("aa", "oo") y vibrato lento |

#### Música

- **Por defecto, del nicho** (oscuro, antiguo, calmo con tensión): drone grave, latido, lira Karplus-Strong, crescendos. Cada video puede cambiarlo si el guion pide otra cosa.
- **Se arma por secciones** que siguen la estructura del guion (gancho, recompensas, giro, cierre) y cambian en los golpes del video.
- **Silencio como arma:** cortar todo 0,3-0,5 s justo antes del giro es uno de los cortes de patrón más fuertes.
- **Loop:** el final de la música tiene que empalmar con el arranque, igual que la imagen.

#### Mezcla

- La voz manda: la música baja unos 10 dB mientras se habla (sidechain).
- Efectos un poco por encima de la música y nunca tapando una palabra clave.
- Volumen final cerca de -14 LUFS, el nivel al que YouTube normaliza (a confirmar).


---

# Anexo 4: Las 21 fórmulas de gancho (pack de Jake Schincariol, MIT)

*Archivo original: `.claude/skills/yt-script/hooks.json`. Pasado de JSON a texto.*

21 hook formulas for YouTube. A YouTube hook is the first 15 seconds and it does three jobs: confirm the click the title promised, raise a question the viewer cannot close, and prove the payoff exists. A hook that only does the third is a summary and it leaks. Every formula here carries the shape, a worked example, the failure mode, and the patterns hookscore.py classifies transcribed speech against.

**Reglas:**

- Confirm the title in the first sentence. A hook that ignores its own title is why people leave at 0:08.
- One idea. A hook carrying two promises keeps neither.
- Specific beats big. '400 to 200,000 in seven months' outperforms 'massive growth'.
- Show the artifact inside 20 seconds if you promised one.
- Never open with who you are. The subscribe pitch has not been earned yet.

### 1. The Statistic
- **Forma:** A number the viewer did not know, stated flat, then the consequence.
- **Ejemplo:** 97% of the people who start a channel quit before video 30. Here is what the other 3% do differently.
- **Falla cuando:** Dies if the number is vague or unverifiable. Say the source out loud.

### 2. Someone Else's Result
- **Forma:** A named person's outcome, then the mechanism.
- **Ejemplo:** This channel went from 400 subscribers to 200,000 in seven months on one format. I mapped it.
- **Falla cuando:** Do not invent the number. If you cannot name the channel, use a different formula.

### 3. The Mistake
- **Forma:** Name the error the viewer is probably making right now.
- **Ejemplo:** Your first 30 seconds are why nobody finishes your videos. It is not the topic.
- **Falla cuando:** Only works if the mistake is common and the viewer can check it in one second.

### 4. Contrarian Flip
- **Forma:** State the accepted advice, then reject it.
- **Ejemplo:** Everyone says post daily. I posted once a week for a year and tripled the channel.
- **Falla cuando:** Needs evidence in the next 15 seconds or it reads as contrarian for its own sake.

### 5. The Reveal
- **Forma:** Promise a specific thing will be shown, then show it.
- **Ejemplo:** I am going to show you the exact prompt, on screen, that wrote this video.
- **Falla cuando:** You have to actually show it, early. A reveal at 8:00 is a retention cliff at 1:00.

### 6. The Superlative
- **Forma:** The single best/worst/fastest of a category.
- **Ejemplo:** This is the fastest way to turn one long video into thirty Shorts.
- **Falla cuando:** Superlatives are cheap. Earn it by naming what it beat.

### 7. The Clock
- **Forma:** Bound the payoff in time.
- **Ejemplo:** In the next six minutes you will have a working title, thumbnail and script for your next video.
- **Falla cuando:** The clock has to be true. Overrun it and the next video's hook is not believed.

### 8. I Tried It
- **Forma:** First-person experiment with a stated cost.
- **Ejemplo:** I let an AI run my channel for 30 days. I did not touch the uploads.
- **Falla cuando:** Needs a real cost - time, money, risk - or there is no stake.

### 9. The Question
- **Forma:** Ask the exact question the viewer typed into search.
- **Ejemplo:** Why do your videos die at 30 seconds when the topic is fine?
- **Falla cuando:** Must be the viewer's question, not yours. Pull it from your own comments.

### 10. Before and After
- **Forma:** Two states, one cut between them.
- **Ejemplo:** This was my thumbnail. This is my thumbnail now. Same video, four times the click-through.
- **Falla cuando:** Only works with a visual. Do not use it on a talking-head-only video.

### 11. The Teardown
- **Forma:** Take a real thing apart in public.
- **Ejemplo:** I pulled the nine most-viewed AI videos of the month and broke down what the titles share.
- **Falla cuando:** Name what you pulled and how many. A teardown of one example is an anecdote.

### 12. The Stack
- **Forma:** Two named tools combined into one outcome.
- **Ejemplo:** Claude plus your YouTube Studio export gives you next week's upload schedule in one prompt.
- **Falla cuando:** Both tools must be nameable and the outcome must need both.

### 13. The Warning
- **Forma:** A cost the viewer is about to pay.
- **Ejemplo:** Do not upload another video until you check this one setting.
- **Falla cuando:** If the cost is small the hook is a lie. Reserve it.

### 14. The List
- **Forma:** A counted set, with the count in the first line.
- **Ejemplo:** Seven things I would do differently if I started a channel in 2026.
- **Falla cuando:** The count must be exact and every item must be different in kind.

### 15. The Receipt
- **Forma:** Show the artifact first, explain second.
- **Ejemplo:** This is the analytics page. This video did 40% of the channel's watch time. Here is why.
- **Falla cuando:** Requires a real screenshot. A described receipt is not a receipt.

### 16. The Insider
- **Forma:** Information from inside a system.
- **Ejemplo:** YouTube tells you which videos are underperforming. Almost nobody opens the report.
- **Falla cuando:** Do not claim insider access you do not have.

### 17. The Impossible Claim
- **Forma:** State something that sounds untrue, then prove it.
- **Ejemplo:** You can write, title, thumbnail and schedule a week of videos without opening a single editor.
- **Falla cuando:** The proof has to start within 20 seconds or it reads as clickbait.

### 18. The Comparison
- **Forma:** Two named options, one winner.
- **Ejemplo:** I wrote the same video three ways. One of them held 62% and the other two did not.
- **Falla cuando:** Say the losing option out loud. A comparison with no loser is an advert.

### 19. The Origin
- **Forma:** Where a result actually came from.
- **Ejemplo:** Every video on this channel starts in the same 12-line file. Here it is.
- **Falla cuando:** Works once per channel. It is a reveal about you, and you only have one.

### 20. The Deadline
- **Forma:** Something is changing on a date.
- **Ejemplo:** The old description format stops mattering this month. Here is what replaces it.
- **Falla cuando:** Only use with a real, checkable date. This is the fastest formula to lose trust with.

### 21. The Direct Address
- **Forma:** Name the exact viewer in the first six words.
- **Ejemplo:** If you have under a thousand subscribers, this is the only video you need this week.
- **Falla cuando:** Narrow beats broad. 'If you make videos' addresses nobody.




---

# Anexo 5: Skill yt-script (pack de Jake Schincariol, MIT)

*Archivo original: `.claude/skills/yt-script/SKILL.md`. Menciona herramientas en Python que vienen con el skill; acá va solo el método.*

### yt-script

One idea into a script somebody finishes.

Two tools live in this folder and both actually run. Use them. Do not eyeball the hook.

```bash
python3 hookscore.py hooks.txt              # rank your hook options
python3 hookscore.py --hook "one line"      # score a single one
```

#### Before you write

1. Read `~/.claude/youtube/voice.md` if it exists. That is the user's voice profile: how they talk
   on camera, the words they never use, who they are talking to, what they will not claim. If it
   does not exist, ask for **three of their own videos**, read or transcribe them, infer the voice,
   and write the file. A script in the wrong voice is worse than no script, because they have to
   read it out loud.
2. Never invent a number, a result or a source. If a figure would strengthen it and you do not have
   one, ask for it or write the line without it.

#### The shape

**The first 15 seconds is the whole job.** It does three things or the video leaks: confirm the
click the title promised, open a question the viewer cannot close, and prove the payoff exists.

1. **Hook.** Write FIVE against [the 21 formulas](hooks.json), run them through `hookscore.py`,
   keep the top two, and show the user both with their scores. Never hand over one hook.
2. **The turn** (0:15-0:45). Say what the video is going to do, in one sentence, and start doing it.
   No channel intro, no "before we get started", no subscribe pitch. Those are the single most
   common cause of the 0:30 cliff.
3. **The body.** One idea per beat. Mark each beat with what is ON SCREEN, not just what is said -
   a talking head with nothing to look at is a podcast.
4. **The payoff.** Deliver the thing the hook promised, explicitly, and say that you are delivering
   it: "that is the prompt, it is in the description".
5. **The close.** One ask. Not three.

#### What to hand back

- the two best hooks with their scored panels
- the script, beat by beat, with `[ON SCREEN: ...]` on every beat
- the runtime estimate at 150 words per minute
- one line naming which formula the winning hook used and why it fits this idea

#### The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**


---

# Anexo 6: Skill yt-shorts (pack de Jake Schincariol, MIT)

*Archivo original: `.claude/skills/yt-shorts/SKILL.md`. Menciona herramientas en Python que vienen con el skill; acá va solo el método.*

### yt-shorts

A Short cut out of a long video is not a clip of the best moment. It is a moment that **survives
without the video around it**, which is a much smaller set.

#### Picking

Read the transcript and find spans of 20-55 seconds where all three are true:

1. It opens on a complete thought. If the first sentence needs the previous minute, it is not a Short.
2. There is a turn in it - a claim, then something that complicates or proves it.
3. It ends on a line, not a trail-off.

Rank the candidates and show the user the top five with their timecodes and first line, so they can
reject one without reading the whole transcript.

#### Writing each one

- **A NEW first line.** The long video's line assumes context this viewer does not have. Write the
  replacement and run it through `../yt-script/hookscore.py`.
- **On-screen text for the first two seconds**, different words from the spoken line.
- **A loop point**: what the last line sets up so the first line answers it.
- Vertical framing note - what gets cropped out of a 16:9 frame and whether that matters.

#### The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**


---

# Anexo 7: Skill yt-retention (pack de Jake Schincariol, MIT)

*Archivo original: `.claude/skills/yt-retention/SKILL.md`. Menciona herramientas en Python que vienen con el skill; acá va solo el método.*

### yt-retention

The retention graph is the only honest feedback YouTube gives you. Almost nobody exports it.

```bash
python3 retention.py retention.csv --duration 600
python3 retention.py retention.csv --transcript transcript.srt
```

Getting the file: Studio -> a video -> Analytics -> Engagement -> the audience-retention chart ->
the download icon -> "Audience retention".

#### Three different problems

- **HOOK LEAK** - what is lost in the first 30 seconds. Under 25% is healthy. This is always the
  first thing to fix and it is always the first fifteen seconds of script, never the edit.
- **CLIFFS** - single steep drops. A cliff is a moment: a topic change with no signposting, a
  sponsor read, a long setup. With `--transcript` the tool prints what was being said there, which
  is what makes the report actionable instead of interesting.
- **SLIDE** - the steady bleed across the middle. A flat slide is pacing. The fix is cutting, not
  rewriting.

#### What to hand back

Name the single biggest leak and one change for it. Not a list of five. Then, only if asked, the
rest. And if the hook leak is healthy and the slide is flat, say the video is fine and the problem
is packaging - send them to `/yt-package`.

#### The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**


---

# Anexo 8: Skill yt-package (pack de Jake Schincariol, MIT)

*Archivo original: `.claude/skills/yt-package/SKILL.md`. Menciona herramientas en Python que vienen con el skill; acá va solo el método.*

### yt-package

The title and the thumbnail are ONE unit. Writing them separately is why most packaging fails: the
thumbnail repeats the title, and half the click surface says the same thing twice.

```bash
python3 title.py --title "..." --thumb "AI RAN IT"
python3 title.py titles.txt            # one per line, ranked
```

#### Before you write

1. Read `~/.claude/youtube/voice.md` if it exists. That is the user's voice profile: how they talk
   on camera, the words they never use, who they are talking to, what they will not claim. If it
   does not exist, ask for **three of their own videos**, read or transcribe them, infer the voice,
   and write the file. A script in the wrong voice is worse than no script, because they have to
   read it out loud.
2. Never invent a number, a result or a source. If a figure would strengthen it and you do not have
   one, ask for it or write the line without it.

#### Rules the tool enforces, and why

- **60 characters** is where desktop search truncates, **40** is a mobile home feed. Both are
  reported because they fail differently: a desktop cut loses the tail, a mobile cut can lose the
  subject.
- **The thumbnail must not repeat the title.** Different words, same promise.
- **Three words maximum on the thumbnail.** At feed size a fourth word is a grey smear.
- **A number, a name or a date** beats every adjective available to you.
- **Two all-caps words is the ceiling** before a title reads as spam.

#### Write ten, keep two

Generate ten titles, run them all through `title.py`, show the user the top three with their scores
and the specific issue on each. For the winner, write the thumbnail brief: the expression, the
framing, the three words, and what the background has to do to hold contrast at feed size.

#### The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**


---

# Anexo 9: Skill yt-viral (pack de Jake Schincariol, MIT)

*Archivo original: `.claude/skills/yt-viral/SKILL.md`. Menciona herramientas en Python que vienen con el skill; acá va solo el método.*

### yt-viral

Raw view counts rank channel size, not ideas. This ranks by **multiple over each channel's own
median**, which is the only version of the question that is about the video.

```bash
python3 swipe.py collected.json --min 2.0
```

#### Collecting the input

You need at least **four videos per channel** or a median means nothing, and the tool will skip the
channel and tell you it did. Collect them however the user prefers - `yt-dlp --flat-playlist -J`
against a channel URL is the fastest, the public page works, a manual list works.

```json
[{"channel":"...","title":"...","views":412000,"url":"...","duration":613}]
```

**Read, do not scrape.** Public listings only, never a logged-in session, never the user's own
account credentials.

#### Reading the output

The multiple is the signal. The formula line is a judgement about the TITLE, matched against
[the 21 formulas](../yt-script/hooks.json) - it is not a claim about why the video worked, and you
should say so when you present it.

What to hand back: the top five with their multiples, the formula each used, and the ONE structural
thing they share. Then the harder line - which of those the user could actually make this week, in
their voice, with what they have.

#### The gate

Nothing here publishes. This skill writes and you publish. Every output ends in a block the user
copies, and the last line of every run is the question: **ship it, or change it?**


---

# Anexo 10: Guía de Shorts (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/references/shorts-playbook.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### YouTube Shorts Playbook

#### Table of Contents

1. [Algorithm: Explore & Exploit](#algorithm-explore--exploit)
2. [Signal Hierarchy](#signal-hierarchy)
3. [Format & Specs](#format--specs)
4. [SEO & Discovery](#seo--discovery)
5. [Impact on Long-Form](#impact-on-long-form)
6. [Monetisation](#monetisation)
7. [View Counting (March 2025)](#view-counting-march-2025)
8. [Repurposing to/from Shorts](#repurposing-tofrom-shorts)
9. [Key Analytics](#key-analytics)
10. [Key Constraints & Gotchas](#key-constraints--gotchas)

---

#### Algorithm: Explore & Exploit

- **Explore phase**: seed audience test with small cohort
- **Exploit phase**: triggered if early engagement is strong (past first 5 seconds)
- Scales progressively once in exploit phase
- A Short can take off as late as **day 4** after upload
- CTR plays almost **no role** -- swipe-away rate is the primary surface signal

#### Signal Hierarchy

| Priority | Signal | Benchmark |
|----------|--------|-----------|
| 1 | Completion / retention | **70%+ = aggressive promotion** |
| 2 | Loop / replay rate | Heavily weighted by algorithm |
| 3 | Comments and shares | More weight than likes |
| 4 | Viewed vs Swiped Away | **75%+ good; below 50% = broken hook** |
| 5 | Satisfaction signals | Surveys, long-press interest |

#### Format & Specs

| Parameter | Value |
|-----------|-------|
| Max length | 3 min (Oct 2024) |
| Sweet spot | **15-60 seconds** |
| Bimodal peaks | **13s or 60s** (35B views study) |
| Aspect ratio | 9:16 |
| Resolution | 1080x1920 |
| Captions | Essential |
| Visual change cadence | Every **3 seconds** |
| Hook window | First **1-3 seconds** |

##### Length by Content Type

| Type | Ideal Length | Expected Completion |
|------|-------------|---------------------|
| Quick tips | 15-20s | 85-95% completion |
| Tutorials | 25-40s | -- |
| Loopable content | Any (favored by algorithm) | >100% avg viewed = loops |

- Content ID music blocks **1-3 min** Shorts worldwide

#### SEO & Discovery

- **~40 characters** visible before title truncation
- Optimal title: **4-6 words, 20-40 characters**
- Use **3-5 hashtags**
- First **125 characters** of description shown in previews
- Thumbnails irrelevant in feed (Shorts auto-play)
- Shorts appear in **YouTube Search AND Google mobile** results

#### Impact on Long-Form

| Metric | Value |
|--------|-------|
| Audience overlap with long-form | ~10% |
| "Related video" linking conversion | <1% |
| Growth boost (channels using both) | **40-60% faster** |

- MacDannyGun case study: **670K subs** through Shorts, resulting in **10x long-form views**
- `[2025]` Tubefilter/Digital i (Feb 2025): **no cannibalization** in US market
- Caveat: home feed reducing long-form real estate

#### Monetisation

##### Revenue Flow

1. Revenue pooling across all Shorts
2. Music licensing allocation deducted
3. Distributed by engaged view share
4. Creator keeps **45%**

##### Music Track Impact on Revenue

| Tracks Used | Creator Revenue Share |
|-------------|----------------------|
| No music | 100% of pool allocation |
| 1 track | 50% |
| 2 tracks | 33% |

##### RPM Ranges

| Niche | RPM per 1K Views |
|-------|-------------------|
| Finance | $0.05-$0.30 |
| Comedy / Lifestyle | $0.01-$0.05 |
| Typical range | $0.01-$0.07 (finance: up to $0.30) |

- **1M views ~ $10-$70** (finance: up to $300)
- `[2025]` vidIQ: **150% RPM increase** in 2025
- `[2025]` Shorts = **22% of YouTube total ad revenue** (up from 15% in 2024)

#### View Counting (March 2025)

- `[2025]` **Any playback = 1 view** (changed March 2025)
- Loops count as **additional views**
- **Engaged Views** = separate metric (retained attention)
- Total views inflated **~30%** compared to pre-March counts

#### Repurposing to/from Shorts

- Extract self-contained **"aha" moments** from long-form
- **"Hook-value bomb-CTA"** structure performs **74% better** than continuous clips
- One **20-30 min** video = **10-20 Shorts**
- AI clipping tools reduce production time **70-90%**
- **No TikTok watermarks** (suppressed by algorithm)
- Use Shorts to **test hooks**, then turn best performers into long-form

#### Key Analytics

| Metric | What It Tells You |
|--------|-------------------|
| Viewed vs Swiped Away | Replaces CTR for Shorts |
| Average % Viewed | >100% = loops (viral quality) |
| Shown in Feed | True algorithmic reach |

##### The 60% Rule

- If **Viewed vs Swiped Away** is under **60%**, test a new opening immediately

##### `[2025]` Freshness Prioritization (September 2025)

- Algorithm deprioritizes Shorts older than **~28-30 days**

---

#### Key Constraints & Gotchas

- CTR is irrelevant for Shorts -- focus on **swipe-away rate** instead
- Content ID music blocks kill 1-3 min Shorts globally
- No TikTok watermarks -- algorithm suppresses them
- March 2025 view counting change inflates totals ~30%; use **Engaged Views** for accuracy
- September 2025 freshness decay: Shorts lose algorithmic push after ~28-30 days
- Revenue is pooled, not per-video -- music tracks directly reduce your share
- 10% audience overlap means Shorts and long-form serve mostly **different audiences**
- Hook must land in 1-3 seconds; visual changes every 3 seconds minimum
- Title truncation at ~40 chars -- front-load keywords
- Completion rate is king: 70%+ triggers aggressive promotion


---

# Anexo 11: Guía de retención y guion (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/references/retention-scripting-guide.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### Retention & Scripting Guide

#### Table of Contents

- [Hook Framework](#hook-framework)
- [Hook Benchmarks](#hook-benchmarks)
- [Pattern Interrupts](#pattern-interrupts)
- [Energy Patterns](#energy-patterns)
- [Optimal Video Length by Format](#optimal-video-length-by-format)
- [Retention Graph Diagnosis](#retention-graph-diagnosis)
- [Algorithmic Promotion Thresholds](#algorithmic-promotion-thresholds)
- [CTA Placement & Conversion](#cta-placement--conversion)
- [Key Constraints & Gotchas](#key-constraints--gotchas)

---

#### Hook Framework

##### Viewer Loss Data

- **55%** of viewers lost in the first 60 seconds
- **20%** lost in the first 10 seconds
- Videos with a **value proposition in the first 15 seconds** = 18% higher retention at the 1-minute mark

##### Hook Structure (First 30 Seconds)

| Timestamp | Purpose | Action |
|-----------|---------|--------|
| 0:00-0:05 | Attention grab | Visual/verbal pattern break, bold claim, or unexpected moment |
| 0:05-0:15 | Clarify promise | State exactly what the viewer will get |
| 0:15-0:30 | Stakes/context | Why this matters, what they'll miss |

---

#### Hook Benchmarks

| Metric | Threshold | Assessment |
|--------|-----------|------------|
| Retention at 10-15s | Below 50% | Hook is failing |
| Retention at 30s | 70%+ | Solid |
| Retention at 30s | 80%+ | Exceptional |

- **Never open with** "Hey guys welcome back" -- causes instant, measurable drop-off

---

#### Pattern Interrupts

##### Impact Data

- Pattern interrupt in **first 5 seconds** = **23% higher retention**
- Strategic breaks at drop-off points = **15-22% re-engagement** (Wistia)
- Adobe tutorials using pattern interrupts = **43% higher completion**

##### Recommended Frequency

| Format | Interrupt Frequency |
|--------|-------------------|
| Pre-recorded | Every 30 seconds |
| Live | Every 2-3 minutes |
| Shorts | Every 2-3 seconds |

##### Interrupt Types

- Camera angle change
- Sound effects / music shift
- Text pop-ups / lower thirds
- Unexpected facts or stats
- Format shifts (talking head to B-roll, screen share to whiteboard)

---

#### Energy Patterns

Source: AIR Media-Tech, 5 documented patterns

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Gradual Slowdown** | High energy open, gradually decreasing | Short content, impact pieces |
| **Calm-Burst Oscillation** | 15-25s calm, then energy burst every 2-3 min | Educational, tutorials |
| **Anchor Pattern** | Return to core thesis every 2-3 min | Long-form essays, explainers |
| **Strategic Pauses** | Deliberate silence/slowdown before key points | Storytelling, dramatic content |
| **Progressive Energy** | High first 3 min, stabilize, mix variety after min 8 | Vlogs, entertainment |

---

#### Optimal Video Length by Format

| Format | Optimal Length | Notes |
|--------|---------------|-------|
| Tutorials | 7-15 min | Step-by-step pacing |
| Entertainment / Vlogs | 8-12 min | Energy management critical |
| Educational | 15-25 min | Anchor pattern recommended |
| Gaming (edited) | 10-20 min | Pattern interrupts essential |
| Product reviews | 8-15 min | Front-load verdict for retention |
| Podcasts | 30-90 min | Calm-Burst Oscillation works well |
| Shorts | 15-30s | Peak completion rate range |

##### Length vs Performance

- **5-10 min** = peak retention at **31.5%**
- **Shorts** account for **75% of views** on the platform
- Videos **20+ min** capture **57% of total watch time**
- **8-minute threshold** unlocks mid-roll ads = ~**50% revenue increase**

---

#### Retention Graph Diagnosis

| Pattern | Visual Shape | Diagnosis | Fix |
|---------|-------------|-----------|-----|
| **Sharp cliff** | 20%+ lost in first 15s | Hook failure | Rebuild 0:00-0:15 |
| **Steady decline** | Gradual downward slope | Normal/expected | Optimize pacing |
| **Mid-video valley** | Dip at 40-60% mark | Pacing issue | Add pattern interrupt or reorder content |
| **Spikes/bumps** | Upward blips | Rewatch moments | Create more of these intentionally |
| **Suspension bridge** | High retention through open loops | Excellent scripting | **68% higher completion** |
| **Sawtooth** | Zigzag from pattern interrupts | Active re-engagement | **43% higher completion** |

---

#### Algorithmic Promotion Thresholds

- Videos outperforming channel average retention by **15%+** receive **2.3x more algorithmic promotion**
- A **10 percentage point retention improvement** = **25%+ impression increase**
- **AI narration** = **70% lower retention** vs human-fronted content

---

#### CTA Placement & Conversion

##### Viewer Reach Data

- Only **16%** of viewers reach the final 10% of a video
- At **~1 min mark**: ~60% of viewers still watching
- At **~4 min mark**: ~35% of viewers still watching

##### Best Practices

| Strategy | Impact |
|----------|--------|
| Place CTA after first value delivery (1-3 min) | Catches majority of viewers |
| Embedded CTAs (visual + verbal) | **380% conversion increase** over verbal-only |
| With CTA: 1 sub per 33 views | **2.5x better** than without CTA (1 per 83 views) |
| "Join the family" vs "subscribe" | **150% growth boost** |

##### Dual CTA Strategy

- **First CTA** at ~1 min = reaches ~60% of viewers
- **Second CTA** at ~4 min = reaches ~35% of viewers
- Never save the only CTA for the end (only 16% see it)

---

#### MrBeast Principles (Validated at Scale)

Source: MrBeast interviews (100M+ views per video average)

##### The 100-Video Rule
Your first videos will be terrible. Commit to making 100 videos and improving one
specific thing each time -- script, editing, camera presence, pacing. Micro-improvements
compound exponentially. Do not expect results before video ~50.

##### Deliver on the Promise Immediately
The title and thumbnail set a promise. In the first 5-10 seconds, **instantly assure
the viewer you are delivering on that promise**. No vlog intros, no "hey guys",
no talking about your day. Deliver what they clicked for, then promise even more
to exceed expectations.

##### Ruthless Pacing & Final Payoff
- Remove every dull moment. Have critical friends roast your video to find dead spots.
- Use different camera angles and fast cuts to maintain visual stimulation.
- Ensure a **strong payoff at the end** (reveal, winner, result) so viewers have a
  compelling reason to stay until the last second -- this directly boosts AVD.
- The algorithm replaces "algorithm" with "audience" -- if people click and watch, YouTube promotes it.

##### Auto-Play Era (2025+)
Videos now auto-play on the YouTube homepage. The first 5 seconds serve as an
extension of your thumbnail -- you must visually convince people to stay while
the video is already playing. This makes the 0:00-0:05 hook more critical than ever.

##### Outlier Analysis Method
Don't rely on guesswork. Look for outlier videos from smaller channels that
suddenly get 10x-1000x their normal views. Analyse what made that specific video
work. Study A/B thumbnail tests from successful creators in your niche.

---

#### Key Constraints & Gotchas

- **55% of viewers leave in the first 60 seconds** -- the hook is the single highest-leverage optimization
- **"Hey guys welcome back"** is a measurable retention killer -- avoid channel-first openings entirely
- **AI narration drops retention by 70%** -- always prefer human-fronted content unless the channel is explicitly AI-themed
- **Only 16% reach the final 10%** of a video -- any CTA placed only at the end is seen by a fraction of viewers
- **8-minute mark unlocks mid-roll ads** but do not pad content to reach it -- retention loss from padding costs more than mid-roll revenue gains
- **Pattern interrupt frequency differs by format** -- every 30s for pre-recorded is aggressive but data-supported; live content needs longer intervals (2-3 min)
- **15%+ above channel average retention** is the threshold for algorithmic boost -- optimize your best-performing content types, not underperformers
- **Shorts optimal length is 15-30s** for completion rate, even though 3-minute Shorts are now allowed `[2025]`
- **The suspension bridge pattern (open loops)** delivers the highest completion rate improvement (68%) -- prioritize open-loop scripting over other techniques


---

# Anexo 12: Guía del algoritmo (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/references/algorithm-guide.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### YouTube Algorithm Reference Guide

#### Table of Contents

- [Three-System Architecture](#three-system-architecture)
- [Signal Hierarchy & Satisfaction Metrics](#signal-hierarchy--satisfaction-metrics)
- [CTR Benchmarks](#ctr-benchmarks)
- [Average View Duration (AVD)](#average-view-duration-avd)
- [Context-Adaptive Weighting](#context-adaptive-weighting)
- [Engagement Signals](#engagement-signals)
- [Upload Cadence & Growth](#upload-cadence--growth)
- [New Channel Promotion](#new-channel-promotion)
- [Algorithm Timeline 2024-2025](#algorithm-timeline-2024-2025)
- [Key Constraints & Gotchas](#key-constraints--gotchas)

---

#### Three-System Architecture

YouTube operates three distinct recommendation systems, each with its own signal hierarchy:

| System | Primary Surface | Core Signals |
|--------|----------------|--------------|
| **Browse** | Home feed, Subscriptions | Personalization, satisfaction, freshness |
| **Search** | Search results | Query relevance, metadata, engagement |
| **Shorts** | Shorts feed | Completion rate, loops, freshness |

- Each system ranks and serves content independently
- A video can perform well in one system and poorly in another
- `[2025]` Beaupre (January 2025): YouTube is a "per-viewer prediction engine", satisfaction-weighted

---

#### Signal Hierarchy & Satisfaction Metrics

##### 4-Layer Testing Cascade

Videos are tested through progressively wider audiences:

1. **Core audience** -- Subscribers and frequent viewers
2. **Expanded** -- Similar interest profiles
3. **Broader** -- Wider demographic/topic match
4. **High authority** -- Trending/viral distribution

- Advancement to next layer depends on performance relative to predictions at each stage

##### Satisfaction Signals (Ranked)

| Signal | Weight Notes |
|--------|-------------|
| **Shares** | Strongest per-action signal |
| **Repeat viewing** | Indicates high satisfaction |
| **Session continuation** | Viewer stays on platform |
| **Saves** | Bookmarking intent |
| **Surveys** | Direct satisfaction measurement |
| **Likes** | Standard positive signal |
| **Comments** | Weighted for time investment |

- **Quality Click Ratio**: Clicks that convert to satisfied viewing (not just any click)

---

#### CTR Benchmarks

##### CTR by Traffic Source `[2025]`

Source: Focus Digital (single-agency report), December 2025

| Traffic Source | Average CTR |
|---------------|-------------|
| Search | 12.5% |
| Suggested | 9.5% |
| Browse | 3.5% |
| External | 2.8% |

##### CTR Performance Tiers

| CTR Range | Assessment |
|-----------|------------|
| Below 3% | Fix needed |
| 4-6% | Average |
| 7-10% | Good |
| 10%+ | Exceptional |

---

#### Average View Duration (AVD)

Source: Retention Rabbit, 150M+ minutes analyzed

- **Average AVD**: 23.7%
- **Only 16.8%** of videos surpass 50% AVD
- **Below 40% AVD** = deprioritized by the algorithm

---

#### Context-Adaptive Weighting

Watch time is weighted differently depending on device and content type:

| Context | Watch Time Weight |
|---------|------------------|
| TV / CTV | Higher |
| Mobile | Lower (relative to TV) |
| Podcasts | Higher |
| Music | Lower (relative to podcasts) |

---

#### Engagement Signals

- **50+ comments replied** within 2 hours = **15-20% higher reach**
- Comment replies in the first 2 hours are critical for the testing cascade

---

#### Upload Cadence & Growth

Source: vidIQ, 5.08M channels analyzed

| Cadence | Growth Impact |
|---------|---------------|
| 12+/month | 8x faster view growth, 3x subscriber growth |
| Consistency > frequency | Regular schedule beats sporadic bursts |

- **Max 3 notifications per 24 hours** -- uploads beyond this won't trigger subscriber notifications

---

#### New Channel Promotion

- Channels **under 500 subscribers** receive active algorithmic promotion
- **Hype feature**: 3 votes per week per user, weighted more heavily for smaller channels
- Beta results: **5M hypes across 50K channels**

---

#### Algorithm Timeline 2024-2025

| Date | Change |
|------|--------|
| Mid-2024 | Thumbnail A/B testing rollout |
| Oct 2024 | `[2025]` Shorts extended to 3 minutes |
| Jan 2025 | `[2025]` LLMs integrated into recommendations, satisfaction-weighted |
| Mar 2025 | `[2025]` Shorts view counting change (any playback = view, loops = additional views). Engaged Views metric introduced |
| Aug 2025 | `[2025]` Undocumented ~30% viewership drops reported; desktop-to-mobile shift observed |
| Oct 2025 | `[2025]` Pichai confirms Shorts earn more per watch hour than in-stream ads in US |
| Late 2025 | `[2025]` Home feed long-form reduced up to 80% (per MrBeast retention director). Shorts consuming feed real estate |
| Sep 2025 | `[2025]` Shorts freshness prioritization; Shorts older than ~28-30 days deprioritized |

---

#### Core Mindset: Algorithm = Audience

Source: MrBeast methodology (validated at 100M+ views/video scale)

Whenever you hear "algorithm," replace it with "audience." The algorithm is simply
a measurement of human behavior. If people click and watch your content, YouTube
will promote it. There is no secret hack -- only understanding what your specific
audience wants and delivering it better than anyone else.

**Practical implication:** Stop optimizing for "the algorithm" and start studying
human psychology. Why do people click? Why do they leave? Why do they share?
Every decision (thumbnail, title, script, pacing) should answer these questions.

---

#### Key Constraints & Gotchas

- **Browse CTR is naturally low** (3.5%) -- do not compare it against Search CTR (12.5%); they are different systems
- **AVD below 40% triggers deprioritization** -- retention is non-negotiable
- **Notification cap of 3/24h** means uploading more than 3 times daily wastes notification slots
- **Consistency beats frequency** -- irregular 12/month is worse than regular 4/month
- **Shorts older than ~28-30 days lose freshness boost** `[2025]` -- plan for front-loaded Shorts performance
- **Long-form Home feed visibility dropped up to 80%** `[2025]` -- diversify traffic sources beyond Browse
- **August 2025 viewership drops** were undocumented -- monitor analytics for unexplained dips
- **Quality Click Ratio** matters more than raw CTR -- clickbait that doesn't convert hurts ranking
- **TV/CTV watch time is weighted higher** -- optimize for lean-back viewing if targeting living room audiences
- **Comment replies are time-sensitive** -- the 2-hour window is critical for the 15-20% reach boost


---

# Anexo 13: Guía de miniaturas y CTR (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/references/thumbnail-ctr-guide.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### Thumbnail & CTR Guide

#### Table of Contents

- [CTR Benchmarks by Niche](#ctr-benchmarks-by-niche)
- [CTR Lifecycle](#ctr-lifecycle)
- [Face Thumbnails](#face-thumbnails)
- [Visual Design Rules](#visual-design-rules)
- [Thumbnail Specifications](#thumbnail-specifications)
- [A/B Testing](#ab-testing)
- [Information Split Rule](#information-split-rule)
- [Mobile Optimization](#mobile-optimization)
- [Suppression Triggers & Strikes](#suppression-triggers--strikes)
- [High-CTR Title Formulas](#high-ctr-title-formulas)
- [Key Constraints & Gotchas](#key-constraints--gotchas)

---

#### CTR Benchmarks by Niche

Source: Focus Digital, December 2025 `[2025]`

| Niche | Average CTR |
|-------|-------------|
| Gaming | 8.5% |
| Health & Fitness | 8.0% |
| Tech & Reviews | 7.5% |
| Beauty & Fashion | 6.5% |
| Entertainment | 6.0% |
| Finance & Business | 5.5% |
| Education | 4.5% |

---

#### CTR Lifecycle

- **Highest CTR** occurs in the first 24 hours (warm/subscribed audience)
- **Sustained 4-8% CTR** across expanding audience reach = healthy performance
- CTR naturally drops as the video reaches colder audiences -- this is expected behavior

---

#### Face Thumbnails

- Faces in thumbnails = **+20-30% CTR** (vidIQ)
- Face thumbnails average **921,000 more views** per video (AmpiFire)
- **Strong emotion required** -- neutral expressions underperform
- Exaggerated but authentic expressions work best

---

#### Visual Design Rules

| Rule | Specification |
|------|--------------|
| Text overlay | 5 words max (ideally 3) |
| Color palette | 2-3 primary colors for brand consistency |
| Viewer decision time | Less than 1 second |
| Custom thumbnail usage | 90% of top-performing videos (YouTube Creator Academy) |
| Negative space | 30-40% of thumbnail area |
| Focal points | One clear focal point |

---

#### Thumbnail Specifications

| Property | Value |
|----------|-------|
| Minimum resolution | 1280x720 |
| Recommended resolution | 1920x1080 (optimized for TV) |
| Aspect ratio | 16:9 |
| File formats | JPG, PNG, GIF, BMP |
| Max file size | 2MB |

---

#### A/B Testing

Available through YouTube Studio (rolled out mid-2024)

| Feature | Detail |
|---------|--------|
| Max variants | Up to 3 thumbnails |
| Optimization metric | Watch time share (not just CTR) |
| Test duration | Up to 2 weeks |
| Result categories | Winner / Same / Inconclusive |
| Platform | Desktop-only setup |
| Restrictions | Not available for Shorts or kids content |

##### Impact Data

- CTR improvements of **37% to 110%** in documented case studies
- A **0.5% CTR difference** is significant when measured over millions of impressions
- `[2025]` **Title A/B testing** added late 2024

---

#### Information Split Rule

- **Thumbnail** = visual and emotional hook
- **Title** = keyword + promise
- **Never duplicate text** between thumbnail and title
- Each element should contribute unique information that together create a compelling click proposition

---

#### Mobile Optimization

- **70%+ of views** come from mobile devices
- Design thumbnails at **1280x720 minimum** (1920x1080 for TV viewing)
- Always **test at mobile feed size** -- details invisible at small scale are wasted
- **Front-load title hook** in first 45 characters (mobile truncation)

---

#### Suppression Triggers & Strikes

##### Thumbnail Violations That Trigger Suppression

- Nudity / sexual content
- Violence / graphic imagery
- Misleading content (clickbait penalty)
- Hate speech
- Child safety violations
- Vulgar text

##### Strike System

| Event | Consequence |
|-------|-------------|
| First violation | Warning (expires after 90 days) |
| Same policy violation within 90 days | Strike |
| 3 strikes | Channel termination |
| Pornographic thumbnails | **Immediate termination** (no warnings) |

- `[2025]` 2024-2025: Active crackdown on clickbait thumbnails for breaking news content

---

#### High-CTR Title Formulas

| Formula | Example |
|---------|---------|
| **Dense Value + Time Compression** | "30 Years of Investing in 30 Minutes" |
| **System / Framework** | "The Blueprint for Building a $1M Channel" |
| **Searchable + Clickable Hybrid** | "[Keyword]: [Benefit/Curiosity Hook]" |
| **Contradiction + Promise** | "Why Working Less Made Me More Productive" |
| **How I + Specific Result + Timeframe** | "How I Got 100K Subscribers in 6 Months" |
| **Bracketed Context** | "Complete Guide to YouTube SEO [2025 Update]" |

##### Title Strategy by Traffic Source

| Traffic Source | Title Style |
|---------------|-------------|
| Search traffic | Keyword-heavy, direct |
| Browse traffic | Curiosity-driven, emotional |

---

#### MrBeast Thumbnail Principles

Source: MrBeast methodology (validated at 100M+ views/video scale)

- **Titles under 50 characters** -- longer titles get cut off with "..." on mobile, killing curiosity
- **Spark intense curiosity** -- the thumbnail should be so interesting a viewer would "lie awake wondering what happened" if they didn't click
- **Auto-play adaptation** -- because videos auto-play on the homepage (2025+), the first 5 seconds of video are now an extension of the thumbnail. Design thumbnails that create a visual question the video's opening answers.
- **Outlier-driven A/B testing** -- study thumbnail A/B tests from successful creators in your niche to see exactly what visual layouts and concepts drive clicks. Data beats intuition.

---

#### Key Constraints & Gotchas

- **Viewers decide in under 1 second** -- if the thumbnail doesn't communicate instantly, it fails regardless of quality
- **Never duplicate information** between thumbnail text and title -- this wastes one of your two persuasion surfaces
- **A/B testing optimizes for watch time share, not CTR** -- a lower-CTR thumbnail can win if it attracts viewers who watch longer
- **Desktop-only A/B setup** -- you cannot A/B test thumbnails for Shorts or kids content
- **0.5% CTR difference matters** at scale -- do not dismiss small A/B test margins on high-impression videos
- **Exceeding 5 words on thumbnail text** reduces readability at mobile sizes where 70%+ of views occur
- **Pornographic thumbnails cause immediate channel termination** -- no warning, no strike, no appeal
- **Clickbait suppression is now AI-enforced** `[2025]` -- Gemini compares thumbnail/title claims against actual video content
- **Face thumbnails require strong emotion** -- a neutral face performs worse than no face at all
- **CTR drops as reach expands** -- a declining CTR over days is normal; sustained 4-8% across broader audiences is the real benchmark
- **Design for 1920x1080** even though 1280x720 is the minimum -- TV/CTV viewing is growing and low-res thumbnails look poor on large screens
- **30-40% negative space** is essential -- cluttered thumbnails lose the focal point at small sizes


---

# Anexo 14: Sub-skill de ganchos (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/sub-skills/hook.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### First-30-Second Hook Writer

This sub-skill generates five distinct hook variants for a video's opening 30 seconds, each using a different psychological mechanism, rated for drop-off risk and optimized traffic source, giving creators a tested menu of openings to choose from based on their channel size and content type.

#### Inputs Required

| Input | Required | Description |
|-------|----------|-------------|
| Topic | Yes | Video subject matter |
| Channel niche | Yes | Content category (tech, fitness, finance, etc.) |
| Hook style preference | No | If creator wants to bias toward a specific style |
| Channel size | No | Helps calibrate the decision guide (default: small) |
| Video format | No | Long-form, Short, tutorial, commentary, etc. (default: long-form) |

#### Reference Files

- `references/retention-scripting-guide.md`

#### Parallel Agents

Not required. This skill runs as a single sequential workflow.

#### Execution Steps

1. **Load reference**: Read `references/retention-scripting-guide.md` fully before generating hooks.
2. **Analyze the topic**: Identify the core tension, surprising angle, common misconception, emotional stakes, and audience pain point related to the topic.
3. **Generate 5 hook variants**: Write each variant following the exact structure below. Each hook must be a complete 30-second script (approximately 75 words at spoken pace).
4. **Rate each hook**: Assign drop-off risk, optimal traffic source, and identify the psychological mechanism.
5. **Build the decision guide**: Based on reference file principles, map hook types to channel sizes and content types.
6. **Apply preference weighting**: If a hook style preference was provided, note which variant aligns and explain tradeoffs of the preferred vs recommended style.

#### Output Template

```
## Topic Analysis

- **Core tension**: [The fundamental conflict or question in this topic]
- **Surprising angle**: [What most people get wrong or don't expect]
- **Audience pain point**: [The problem viewers are trying to solve]
- **Emotional stakes**: [What viewers stand to gain or lose]

---

## Hook Variant 1: Shock/Contradiction

**Mechanism**: Cognitive dissonance — presents a counterintuitive statement that conflicts with the viewer's existing belief, creating an information gap they must resolve.

> [Full 30-second spoken script, approximately 75 words]
>
> [Line 1: The counterintuitive claim — delivered with confidence, no hedging]
> [Line 2-3: Brief evidence or framing that makes the claim credible]
> [Line 4-5: Pivot to promise — "and in this video, I'll show you exactly why..."]

- **Word count**: [X] words (~30 seconds)
- **Drop-off risk**: [Low/Medium/High] — [one-sentence explanation]
- **Optimized for**: [Browse/Search/Suggested] — [why this traffic source]
- **Best when**: [Scenario where this hook type excels]
- **Avoid when**: [Scenario where this hook type backfires]

---

## Hook Variant 2: Problem-Agitation

**Mechanism**: Pain amplification — names a problem the viewer already recognizes, then intensifies the emotional weight before offering the video as relief.

> [Full 30-second spoken script, approximately 75 words]
>
> [Line 1: Name the pain directly — "You've tried X and it didn't work"]
> [Line 2-3: Twist the knife — show the consequences of the unsolved problem]
> [Line 4-5: Relief signal — "Here's what actually works..."]

- **Word count**: [X] words (~30 seconds)
- **Drop-off risk**: [Low/Medium/High] — [one-sentence explanation]
- **Optimized for**: [Browse/Search/Suggested] — [why this traffic source]
- **Best when**: [Scenario]
- **Avoid when**: [Scenario]

---

## Hook Variant 3: Story-Open

**Mechanism**: Narrative transportation — drops the viewer into the middle of an action or scene, activating the brain's story-processing mode which naturally resists disengagement.

> [Full 30-second spoken script, approximately 75 words]
>
> [Line 1: Mid-action scene — start in medias res, no setup]
> [Line 2-3: Sensory details or stakes that make the scene vivid]
> [Line 4-5: Bridge to topic — connect the story to the video's core content]

- **Word count**: [X] words (~30 seconds)
- **Drop-off risk**: [Low/Medium/High] — [one-sentence explanation]
- **Optimized for**: [Browse/Search/Suggested] — [why this traffic source]
- **Best when**: [Scenario]
- **Avoid when**: [Scenario]

---

## Hook Variant 4: Curiosity-Gap

**Mechanism**: Information gap theory — reveals enough to make the viewer aware of what they don't know, creating psychological tension that can only be resolved by watching.

> [Full 30-second spoken script, approximately 75 words]
>
> [Line 1: Tease the answer without giving it — "There's one thing that..."]
> [Line 2-3: Build the gap — add specificity that makes the unknown feel important]
> [Line 4-5: Promise the payoff — signal exactly when the answer comes]

- **Word count**: [X] words (~30 seconds)
- **Drop-off risk**: [Low/Medium/High] — [one-sentence explanation]
- **Optimized for**: [Browse/Search/Suggested] — [why this traffic source]
- **Best when**: [Scenario]
- **Avoid when**: [Scenario]

---

## Hook Variant 5: Social Proof

**Mechanism**: Authority bias + stakes — leads with credibility (results, credentials, or third-party validation) to earn trust instantly, then pivots to what's at stake.

> [Full 30-second spoken script, approximately 75 words]
>
> [Line 1: Credibility statement — specific result, number, or proof point]
> [Line 2-3: Stakes — what this means for the viewer]
> [Line 4-5: Promise — "I'm going to break down exactly how..."]

- **Word count**: [X] words (~30 seconds)
- **Drop-off risk**: [Low/Medium/High] — [one-sentence explanation]
- **Optimized for**: [Browse/Search/Suggested] — [why this traffic source]
- **Best when**: [Scenario]
- **Avoid when**: [Scenario]

---

## Decision Guide

### By Channel Size

| Channel Size | Recommended Hook | Reasoning |
|-------------|-----------------|-----------|
| Nano (<1K) | [Type] | [Why — e.g., "No established authority, so social proof is weak"] |
| Micro (1K-10K) | [Type] | [Why] |
| Small (10K-100K) | [Type] | [Why] |
| Mid (100K-500K) | [Type] | [Why] |
| Large (500K+) | [Type] | [Why] |

### By Content Type

| Content Type | Primary Hook | Secondary Hook | Avoid |
|-------------|-------------|----------------|-------|
| Tutorial/How-to | [Type] | [Type] | [Type + why] |
| Commentary/Opinion | [Type] | [Type] | [Type + why] |
| Review | [Type] | [Type] | [Type + why] |
| Entertainment | [Type] | [Type] | [Type + why] |
| Educational | [Type] | [Type] | [Type + why] |
| Vlog | [Type] | [Type] | [Type + why] |

### By Traffic Source Goal

| Traffic Source | Best Hook Types | Why |
|---------------|----------------|-----|
| Search | [Types] | [Explanation] |
| Browse/Home | [Types] | [Explanation] |
| Suggested | [Types] | [Explanation] |

## Recommendation

**For this video**: [Recommended variant number and name] — [2-sentence justification based on topic, niche, and channel context]

**Runner-up**: [Second choice] — [When to use this instead]
```

#### Quality Criteria

- Each hook must be a complete, speakable 30-second script — approximately 75 words (65-85 acceptable range)
- All five hook types must be represented: Shock/Contradiction, Problem-Agitation, Story-Open, Curiosity-Gap, Social Proof
- Each hook must name its specific psychological mechanism with a one-sentence explanation of how it works
- Drop-off risk ratings must be justified, not arbitrary
- Traffic source recommendations must align with the retention scripting guide's principles
- The decision guide must cover all channel sizes AND all listed content types
- No two hooks may use the same opening structure or first sentence pattern
- Hooks must be written in natural spoken language — no written-prose phrasing
- The curiosity-gap hook must NOT give away the answer within the 30 seconds
- The story-open hook must start in medias res — no "Let me tell you about a time when..."


---

# Anexo 15: Sub-skill de Shorts (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/sub-skills/shorts.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### Shorts Sub-Skill

This sub-skill generates a complete YouTube Shorts production package — from concept through script to SEO metadata — optimised for the Shorts algorithm's unique signals (Viewed vs Swiped Away, loop rate, replay rate). It handles both standalone Shorts concepts and repurposing clips from existing long-form content, tailoring output to the creator's goal: channel growth, Shorts monetisation, or funneling viewers to long-form videos.

#### Inputs Required

- **Channel niche** (string): the creator's content category
- **Content idea OR existing long-form video** (string): either a new concept, or a video URL/description to repurpose
- **Shorts goal** (one of): `growth` | `monetisation` | `long-form funnel`
- **Target audience** (optional): demographic or viewer persona

#### Reference Files to Load

- `references/shorts-playbook.md`
- `references/algorithm-guide.md`
- `references/monetization-guide.md`

#### Parallel Agents

Not required. Execute sequentially.

#### Step-by-Step Execution

1. Load all three reference files and internalise Shorts algorithm signals, format constraints, and monetisation rules.
2. Determine format: if the user provided an existing long-form video, identify the best repurpose-worthy moments (highest density of value or emotion in under 60 seconds). If a standalone idea, proceed to concept design.
3. Design the hook (first 1-3 seconds). This is the single highest-impact element. The hook must create an open loop, pattern interrupt, or immediate curiosity gap. Refer to the shorts playbook for proven hook formulas.
4. Write the full script/outline with visual change markers every 3 seconds minimum. Structure: Hook (1-3s) then Value bomb (remaining time) then Loop setup (final 1-2s that mirrors or callbacks to the opening frame for seamless replay).
5. Select optimal length. Use the 13-second or 60-second sweet spots from the playbook. Choose 13s for punchy hooks/reveals and 60s for tutorials or storytelling. Avoid 30-45s dead zone unless content demands it.
6. Write SEO metadata: title (4-6 words, 20-40 characters, front-load keyword), description (first 125 characters carry all weight), and 3-5 hashtags.
7. Predict performance using the Viewed vs Swiped Away framework. Flag any Short predicted below 60% viewed rate and suggest fixes.
8. Calculate monetisation context: Shorts ad revenue share RPM for the niche, and flag music licensing impact (using 1 track = 50% revenue share rule).
9. If the goal is `long-form funnel`, design a bridge element: verbal CTA, pinned comment, or visual teaser that drives viewers to a specific long-form video.

#### Output Template

```markdown
## YouTube Short: [Working Title]

### Concept Brief
- **Format**: [Standalone / Repurposed from: "Video Title"]
- **Length**: [Xs] — Rationale: [why this length]
- **Goal**: [Growth / Monetisation / Long-Form Funnel]
- **Hook Strategy**: [1-sentence description of the hook approach]

### Script / Outline

| Timestamp | Visual | Audio / Script | Notes |
|-----------|--------|----------------|-------|
| 0:00-0:01 | [HOOK visual — pattern interrupt] | "[Hook line]" | First frame must stop scroll |
| 0:01-0:03 | [Visual change] | "[Setup]" | Open loop established |
| 0:03-0:06 | [Visual change] | "[Value point 1]" | |
| ... | ... | ... | Visual change min every 3s |
| 0:XX-0:XX | [LOOP SETUP — mirrors opening] | "[Callback/loop line]" | Seamless replay trigger |

**Total visual changes**: [N] (minimum 1 per 3 seconds)

### SEO Metadata
- **Title**: [4-6 words, 20-40 chars, keyword front-loaded]
- **Description** (first 125 chars matter):
  > [Description text]
- **Hashtags**: #tag1 #tag2 #tag3 [#tag4] [#tag5]

### Performance Prediction
- **Predicted Viewed vs Swiped Away**: [X%] viewed
- **Status**: [PASS: above 60% / WARNING: below 60% — fix recommended]
- **Risk factors**: [list any weaknesses]
- **Suggested fixes** (if below 60%): [specific changes]

### Monetisation Context
- **Niche Shorts RPM**: $[X.XX] estimated
- **Music licensing**: [No music / Original sound / Licensed track — 50% revenue share applies]
- **Estimated revenue per 1M views**: $[X]

### Long-Form Funnel Bridge
> *(included only when goal = long-form funnel)*
- **Target long-form video**: "[Title]"
- **Bridge method**: [Verbal CTA / Pinned comment / Visual teaser / Cliffhanger]
- **CTA script**: "[Exact words to say/show]"
- **Pinned comment text**: "[Comment text with link context]"
```

#### Quality Criteria

- Hook must be completable in 1-3 seconds and create genuine curiosity or pattern interrupt
- Visual change markers appear at minimum every 3 seconds throughout the script
- Loop setup in final 1-2 seconds must logically connect back to the opening
- Title is 4-6 words, 20-40 characters, with primary keyword in first position
- Description front-loads critical information in first 125 characters
- Performance prediction is justified with specific reasoning, not arbitrary
- Monetisation RPM estimate is realistic for the stated niche (cross-reference monetization guide)
- If music is suggested, the 50% revenue share warning is always included
- Long-form funnel bridge is only included when goal is `long-form funnel`
- Total output is actionable: a creator could produce the Short using only this document


---

# Anexo 16: Sub-skill de guion (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/sub-skills/script.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### Retention-Engineered Script

This sub-skill generates a full video script engineered for maximum audience retention, using proven structural patterns — hook-promise-stakes openings, pattern interrupts, forward hooks, and strategic CTAs — all calibrated to the target video length and audience type.

#### Inputs Required

| Input | Required | Description |
|-------|----------|-------------|
| Topic | Yes | Video subject matter |
| Target length | Yes | Desired video duration in minutes |
| Channel type | Yes | Educational, entertainment, vlog, review, tutorial, commentary, etc. |
| Audience persona | Yes | Who is watching (age range, knowledge level, why they clicked) |
| Key points | Yes | Core information/arguments to cover (bullet list) |
| Tone | No | Casual, professional, energetic, conversational (default: conversational) |
| CTA goal | No | Subscribe, product, community, or custom (default: subscribe) |

#### Reference Files

- `references/retention-scripting-guide.md`
- `references/algorithm-guide.md`

#### Parallel Agents

Not required. This skill runs as a single sequential workflow.

#### Execution Steps

1. **Load references**: Read `references/retention-scripting-guide.md` and `references/algorithm-guide.md` fully before writing.
2. **Calculate structure**: Based on target length, compute section durations. Hook: 0:00-0:30. Intro: 0:30-2:00. Mid-CTA: ~25% mark. Retention re-hook: ~60% mark. Outro: final 60 seconds. Remaining time divided among content blocks.
3. **Map key points to chapters**: Assign the provided key points to content blocks. Order them by engagement potential — strongest points early and late, weaker points in the middle (surrounded by pattern interrupts).
4. **Write the hook block**: Produce the 3-part hook (Grab, Promise, Stakes) targeting >70% retention at the 30-second mark.
5. **Write the intro**: Bridge from hook to content. Establish context, stakes, and viewer outcome.
6. **Write content blocks**: Each block opens with a pattern interrupt, delivers value, ends with a micro-summary and forward hook to the next section.
7. **Insert pattern interrupts**: Place one every 60-90 seconds. Mark each with its type tag.
8. **Place CTAs**: Soft mid-CTA at ~25%, hard CTA in outro.
9. **Write outro**: Hard CTA, end screen cue, next video tease.
10. **Annotate retention risks**: Scan the full script for drop-off danger zones. Mark each with a warning symbol and mitigation note.
11. **Add pacing notes**: Insert editor directions throughout.

#### Output Template

```
## Script Metadata

- **Topic**: [topic]
- **Target length**: [X] minutes ([Y] words at ~150 words/minute)
- **Channel type**: [type]
- **Audience**: [persona summary]
- **Estimated word count**: [total words]

---

## HOOK (0:00 — 0:30) | Target: >70% retention at 0:30

### Grab (0:00 — 0:05)
[Opening line — the single most important sentence in the video]

[PACING: Deliver fast. No intro graphics. Start mid-thought or mid-action.]

### Promise (0:05 — 0:15)
[What the viewer will get from watching. Specific, tangible outcome.]

### Stakes (0:15 — 0:30)
[Why it matters. What they lose by clicking away. Emotional or practical consequence.]

⚠️ RETENTION RISK: [If applicable — e.g., "Generic promise language. Make the outcome hyper-specific."]

---

## INTRO (0:30 — 2:00) | Context + Credibility

[CAMERA CHANGE]

[Context paragraph: Why this topic, why now, why from this creator.]

[Viewer outcome restatement: "By the end of this video, you'll..."]

[PACING: Moderate. Establish trust but don't linger. Viewers who survived the hook want content.]

---

## CONTENT BLOCK 1: [Chapter Title] (2:00 — X:XX)

[GRAPHIC: Chapter title card]
[Pattern interrupt: opening line that resets attention]
[Core content — spoken-word style: short sentences, direct address ("you"), rhetorical questions.]
[B-ROLL CUE: Describe what should appear on screen]
[Micro-summary: One sentence recap] → [Forward hook: "But that's only half the picture..."]
⚠️ RETENTION RISK: [If applicable — e.g., "Dense info block. Break with visual at 4:30."]

---

## CONTENT BLOCK 2: [Chapter Title] (X:XX — X:XX)

[SOUND EFFECT: Transition sting]
[Pattern interrupt] → [Content delivery] → [UNEXPECTED STAT]
[Micro-summary] → [Forward hook]

---

## MID-CTA (~25% mark, approximately X:XX)

[CAMERA CHANGE] [Soft CTA — conversational, tied to content just delivered. 10-15 seconds max.]
> "If you're finding this useful, hit subscribe — I break down [niche topic] like this every [cadence]."

---

## CONTENT BLOCKS 3+: [Chapter Titles] (X:XX — X:XX)

[Continue pattern: interrupt → content → B-ROLL → micro-summary → forward hook]

## RETENTION RE-HOOK (~60% mark, approximately X:XX)

[CAMERA CHANGE] [Why the remaining content is the most valuable part.]
⚠️ RETENTION RISK: [60% mark is a common drop-off cliff. This re-hook must feel like a second hook.]

---

## OUTRO (final 60 seconds, X:XX — end)

### Hard CTA (15 seconds)
[Direct call-to-action tied to the video's value delivery.]

> "[Specific CTA: subscribe, comment a specific thing, check link in description]"

### End Screen Cue (15 seconds)
[GRAPHIC: End screen overlay]

> "If you liked this, you'll want to watch [related video topic] — I'll put it right here."

[Point to end screen card position]

### Next Video Tease (15 seconds)
[Brief, compelling preview of the suggested next video. Create a mini curiosity gap.]

[PACING: Keep energy up through the final second. No "thanks for watching" wind-down.]

---

## Pattern Interrupt Log

| Timestamp | Type | Description |
|-----------|------|-------------|
| X:XX | [CAMERA CHANGE] | [Brief note] |
| X:XX | [B-ROLL CUE] | [Brief note] |
| X:XX | [GRAPHIC] | [Brief note] |
| X:XX | [SOUND EFFECT] | [Brief note] |
| X:XX | [UNEXPECTED STAT] | [Brief note] |

**Total pattern interrupts**: [X] | **Average interval**: [X] seconds

## Retention Risk Map

| Timestamp | Risk Level | Issue | Mitigation |
|-----------|------------|-------|------------|
| X:XX | ⚠️ High | [Description] | [Solution] |
| X:XX | ⚠️ Medium | [Description] | [Solution] |

## Editor Notes

- [Pacing guidance for specific sections]
- [Music/sound design suggestions]
- [Cut rhythm recommendations]
- [Thumbnail moment candidates with timestamps]
```

#### Quality Criteria

- Word count must match target length at ~150 words per minute (within 10% tolerance)
- The hook must contain all three elements: Grab (0-5s), Promise (5-15s), Stakes (15-30s)
- Pattern interrupts must appear every 60-90 seconds — verify by checking the interrupt log timestamps
- Every content block must end with both a micro-summary AND a forward hook
- Mid-CTA must appear at approximately the 25% mark, not earlier
- Retention re-hook must appear at approximately the 60% mark
- All production cue tags must use the exact bracket format: [CAMERA CHANGE], [B-ROLL CUE], [GRAPHIC], [SOUND EFFECT], [UNEXPECTED STAT]
- At least 3 retention risk points must be identified and marked with mitigations
- The script must read as natural spoken language, not written prose — short sentences, contractions, direct address
- The outro must never contain filler phrases like "thanks for watching" or "don't forget to" — maintain energy to the final second


---

# Anexo 17: Plantilla de canal enfocado en Shorts (claude-youtube de AgriciDaniel, MIT)

*Archivo original: `.claude/skills/claude-youtube/templates/shorts-first-channel.md`. Ojo: sus cifras no traen fuente verificada; usarlas como orientación.*

### Shorts-First Channel Template

> Primarily vertical short-form content (< 60 seconds). Rapid-fire publishing, completion-rate optimised.
> Traffic mix: Shorts Feed (~75%) + Browse (~10%) + Suggested (~10%) + Search (~5%).

---

#### 1. Channel DNA

Shorts-first channels are **completion-rate machines operating inside a swipe-driven feed**. The algorithm is fundamentally different from long-form: the primary signal is **Viewed vs Swiped Away** (target: 75%+ Viewed), followed by **completion rate** (70%+ is good, 90%+ is exceptional), then likes, comments, and shares. Content length sweet spots are **13 seconds** (highest completion) and **50-60 seconds** (highest ad revenue per view). RPM reality is harsh: $0.01-$0.07 per 1K views, and using even 1 licensed music track forces a 50% revenue share with the rights holder. The September 2025 freshness shift means YouTube now heavily weights content recency — a 28-30 day window determines most Shorts distribution. This channel type prioritises **volume and velocity** over production polish. Growth can be explosive (100K subs in 3-6 months is achievable) but monetisation requires a deliberate bridge to long-form or external revenue.

#### 2. Optimal Content Mix

| Type | % | Description |
|------|---|-------------|
| **Hub** | 50-60% | Recurring formats/series with a signature style. "One fact a day", "rating [THINGS]", "[TOPIC] in 30 seconds". Pattern recognition drives repeat viewership. |
| **Hero** | 25-30% | Trend-riding content, challenges, duets, reaction hooks. Highest viral potential, shortest lifespan. |
| **Help** | 10-20% | Quick tips, "how to [X] in 15 seconds", micro-tutorials. Evergreen but lower impression volume in Shorts feed. |

Every Short should be part of a recognisable series or format — the Shorts algorithm rewards channels whose viewers consistently watch multiple Shorts in a row.

#### 3. Upload Cadence

| Setup | Cadence | Notes |
|-------|---------|-------|
| **Solo creator** | 1-3 Shorts/day (7-21/week) | 30-90 Shorts/month. Batch-film 5-10 Shorts in a single session. Volume is non-negotiable — the 28-30 day freshness window demands constant output. |
| **Small team (2-3)** | 2-4 Shorts/day (14-28/week) | Dedicated editor enables same-day turnaround on trends. One person monitors trending audio and formats. |

Length targets: 13 seconds for maximum completion rate, 50-60 seconds for maximum revenue per view. Mix both. Avoid 30-45 seconds — it is the dead zone with lower completion and lower RPM than either extreme. Post during peak hours for your audience (typically 12-3 PM and 7-10 PM local time).

#### 4. Title Pattern Library

1. "[TOPIC] In [NUMBER] Seconds"
2. "POV: You [RELATABLE SITUATION]"
3. "Wait For It... [TOPIC/PUNCHLINE]"
4. "Things Only [GROUP] Will Understand"
5. "Rating [THINGS] From 1-10 (Part [NUMBER])"
6. "Did You Know [SURPRISING FACT]?"
7. "[NUMBER] [THINGS] You're Doing Wrong"
8. "How To [QUICK TIP] #shorts"
9. "This [THING] Is Insane"
10. "Day [NUMBER] Of [CHALLENGE/SERIES]"

Shorts titles matter less than long-form (most viewers never see them in the feed), but they help with Search discovery and YouTube's topical classification. Keep them under 40 characters. Add 3-5 relevant hashtags in the description, not the title.

#### 5. Thumbnail Formula

- **Auto-generated frame selection** — YouTube picks the thumbnail for Shorts feed. You can set a custom thumbnail but it only shows on the channel page and Search.
- **Design the first frame as the hook** — the opening frame IS the thumbnail in the feed. Make it visually arresting.
- **Text-on-screen in first frame** — bold, centred, readable at small size. This is what makes viewers stop scrolling.
- **High contrast and bright colours** — compete against rapid swipe behaviour.
- **Face close-up with expression** — if the format includes the creator, the first frame should show emotion or action.
- For custom thumbnails (channel page): use consistent series branding with episode numbers for binge-ability.

#### 6. Hook Style

**Primary: Curiosity-gap** — The first 1-2 seconds must create an irresistible question. "This is the [THING] they don't want you to know about." Viewer must feel they will miss something by swiping away.

**Secondary: Shock/Contradiction** — Open with a visual or statement that violates expectations. A surprising image, an absurd claim, or an action mid-motion. No preamble — the hook IS the first frame.

Zero tolerance for slow starts. The "Viewed vs Swiped Away" metric is decided in the first 1-3 seconds. No intros, no logos, no "hey guys." Start mid-action or mid-sentence. The hook must answer: "Why should I NOT swipe right now?"

#### 7. Monetisation Priority Stack

| Rank | Stream | Why This Position |
|------|--------|-------------------|
| 1 | **External Funnels** | Shorts RPM is too low to be the primary revenue. Use Shorts as a massive top-of-funnel for email lists, products, courses, or apps. A 100K-sub Shorts channel can build a 10K email list in months. |
| 2 | **Brand Deals** | Shorts sponsorships pay per-video, not per-view. 50K-100K subs with high engagement = $500-2K per sponsored Short. Brands want the audience reach. |
| 3 | **Shorts Ad Share** | RPM: $0.01-$0.07/1K Engaged Views (finance: up to $0.30). At 1M views/month = $10-70. Using 1 licensed music track = 50% share to rights holder. Use original audio or royalty-free music to keep 100%. |
| 4 | **Shopping Affiliate** | Quick product showcases and "things I use" Shorts convert well. Link in description. Natural for lifestyle, tech, and beauty niches. |
| 5 | **Long-form AdSense (bridge strategy)** | Publish 1-2 long-form videos per week to capture subscribers gained from Shorts. Long-form RPM is 10-100x Shorts RPM. This is the real monetisation play. |
| 6 | **Memberships** | At scale (50K+ subs), offer exclusive Shorts, bloopers, or community access. $0.99-$4.99/month. YouTube takes 30%. |
| 7 | **Super Chat/Thanks** | Minimal relevance unless doing live content alongside Shorts. |

**Critical strategy: the long-form bridge.** Channels using both long-form + Shorts grow 40-60% faster. Use Shorts to attract subscribers, then serve them 8-min+ long-form content where real AdSense revenue lives.

#### 8. Growth Trajectory

| Milestone | Timeline | Key Metrics |
|-----------|----------|-------------|
| 0-500 subs | Weeks 1-4 | 30-60 Shorts published. Testing 3-5 formats. Completion rate tracking begins. 1-2 Shorts break 10K views. |
| 500-1K subs (YPP Expanded) | Weeks 4-8 | 3M Shorts views in 90 days (or 3K long-form watch hours). Enable memberships. Signature format identified. |
| 1K-10K subs | Months 2-4 | Viral Short hits 500K-1M+ views. Subscriber growth becomes self-reinforcing. Start long-form bridge (1 video/week). |
| 10K-100K subs | Months 4-8 | Multiple Shorts crossing 1M views. Brand deal inquiries. Long-form videos pulling 10K-50K views from Shorts-acquired audience. |
| 100K-500K subs | Months 8-18 | Full monetisation stack active. Long-form generating $3K-10K/month. Shorts brand deals adding $2K-5K/month. External funnels scaling. |

Shorts growth is nonlinear — one viral hit can add 10K-50K subs in a week. But it is also volatile: a week without posting can collapse reach due to the 28-30 day freshness window.

#### 9. Common Failure Modes

**1. No long-form bridge** — Building a massive Shorts audience but never giving them long-form content. Revenue stays at $0.01-$0.07 RPM forever. The channel is big but broke. **Fix**: Start publishing 1 long-form video per week by the time you hit 5K subs. Tease long-form in Shorts end-cards. The long-form bridge is where Shorts-first channels actually make money.

**2. Music licensing revenue drain** — Using trending licensed audio on every Short. Each track with a licensed song forces a 50% revenue share to the rights holder, cutting already-low RPM in half. **Fix**: Use original audio, voiceover, or royalty-free music for at least 50% of Shorts. Save licensed audio for trend-riding Hero content where virality justifies the revenue split.

**3. Ignoring the freshness window** — Taking a 2-week break and expecting to resume where you left off. The September 2025 algorithm update weights recency heavily — Shorts older than 28-30 days receive drastically reduced distribution. Inconsistent posting resets the channel's momentum. **Fix**: Build a 2-week content buffer. Batch-film 20-30 Shorts in one session. Schedule daily publishing even during breaks. If you stop posting, expect 2-3 weeks of rebuilding before distribution normalises.


---

# Anexo 18: Guion de ejemplo: la-voz (giro: el enemigo eras vos)

*Archivo original: `shorts/la-voz/short.json`.*

Guion completo con dirección de arte, cámara, transiciones, música y efectos por escena.

```json
{
  "id": "la-voz",
  "title": "Someone whispers 3 words before you waste money.",
  "belief_broken": "Que la frase 'you deserve it' es tuya y es un premio. La instalaron afuera, y el golpe final: ya no hace falta que te la digan, ahora suena con tu propia voz.",
  "fiction": true,
  "voice": "en-US-AndrewNeural",
  "rate": "+0%",
  "pitch": "-2Hz",
  "captions": true,
  "gap": 0.1,
  "sources": [
    "Historia inventada (thriller noir). El personaje, los $84 y las situaciones son ficción.",
    "Cuenta: $84 × 2 veces por semana × 52 semanas = $8,736 por año.",
    "Séneca, Cartas a Lucilio 16 (trad. R. M. Gummere, 1917, dominio público): 'If you live according to nature, you will never be poor; if you live according to opinion, you will never be rich.'"
  ],
  "direction": {
    "concept": "Un thriller de detectives. Una voz susurra 'you deserve it' antes de cada compra y se ve como humo rojo que sale de vidrieras y pantallas. El protagonista la persigue por la ciudad hasta su origen (publicidades, apps, ofertas de medianoche) y descubre lo peor: el humo ya no viene de afuera, le sale de su propia boca.",
    "look": "ESTILO NUEVO: cine negro en blanco y negro, lluvia, ciudad de noche, sombras duras de persianas, con UN SOLO color: el rojo de la voz (humo, ondas de sonido, letras). El oro aparece recién al final, cuando él responde con su propia voz.",
    "pacing": "Arranca lento y con tensión; la escena 4 es un montaje cada vez más rápido; la persecución (6) acelera; en el giro (7) todo se frena. Impactos en 1, 3, 7 y 9.",
    "loop": "Termina con el hombre frente a la vidriera bajo la lluvia y el humo rojo que aparece detrás de su oreja: el mismo cuadro que el 0. 'Because someone whispers…' empalma con 'Someone whispers 3 words…'."
  },
  "music": {
    "style": "Jazz noir: contrabajo caminando, batería con escobillas, trompeta con sordina (sintetizada), lluvia de ambiente. Los susurros funcionan como parte del ritmo. En el giro se cae todo y quedan solo la lluvia y el susurro, doblado con la voz del narrador. En el cierre, cuerdas graves cálidas.",
    "tempo": "84 BPM; el montaje de la escena 4 dobla el ritmo; corte total en la 7.",
    "sections": [
      {
        "at": "escena 1",
        "cue": "Lluvia + contrabajo que arranca + primer susurro en rojo"
      },
      {
        "at": "escenas 2-5",
        "cue": "Jazz noir; un golpe de platillo con escobilla en cada compra"
      },
      {
        "at": "escena 6",
        "cue": "Persecución: contrabajo y batería al doble"
      },
      {
        "at": "escena 7 (giro)",
        "cue": "Silencio 0,4 s → solo lluvia + el susurro con la voz del narrador"
      },
      {
        "at": "escenas 9-10",
        "cue": "Cuerdas graves cálidas cuando él dice 'not today'"
      },
      {
        "at": "escena 11",
        "cue": "Vuelven el contrabajo y la lluvia del cuadro 0 para empalmar"
      }
    ],
    "mix": "Voz al frente, música -10 dB bajo la voz, final a -14 LUFS, pico ≤ -1 dBTP. El 'you deserve it' de cada escena se procesa como susurro (filtrado, reverb, doblado) además de la voz principal."
  },
  "scenes": [
    {
      "type": "custom",
      "beat": "hook",
      "reward": "paradox",
      "say": "Someone whispers 3 words before you waste money. You never notice. Why?",
      "pause_after": 0.35,
      "onScreen": "*3 words.*\nEvery time.",
      "visual": "Cuadro 0: noche, lluvia, blanco y negro. Un hombre frente a una vidriera iluminada. Detrás de su oreja aparece una boca de humo ROJO que susurra; tres letras rojas borrosas se forman en el aire. En 'Why?' un relámpago congela todo.",
      "camera": "Primer plano de la oreja; en 'Why?', flash blanco y cuadro quieto.",
      "transition": "El humo rojo entra por la ventana de su casa.",
      "sfx": [
        {
          "at": "cuadro 0",
          "sound": "Lluvia + contrabajo + susurro ininteligible"
        },
        {
          "at": "'Why?'",
          "sound": "Trueno"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "reveal",
      "say": "Long day. You're tired. Then you hear it: you deserve it.",
      "onScreen": "*You deserve it.*",
      "visual": "El hombre llega a casa agotado y se tira en el sillón con el celular. El humo rojo sale de la pantalla, le rodea la cabeza y escribe en rojo 'YOU DESERVE IT' en el aire.",
      "camera": "Sombras de persiana sobre su cara; zoom lento al celular.",
      "transition": "Su dedo se acerca al botón COMPRAR.",
      "sfx": [
        {
          "at": "'you deserve it'",
          "sound": "Susurro doblado con reverb, procesado en rojo (filtrado)"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "consequence",
      "say": "Click. 84 dollars, gone.",
      "onScreen": "Click. *−$84.*",
      "visual": "El dedo aprieta COMPRAR. De su billetera sale un fantasma de billetes que se lo lleva el humo rojo por la ventana. Contador rojo: −$84.",
      "camera": "Macro del dedo; corte seco a la billetera.",
      "transition": "Montaje rápido de tres escenas.",
      "sfx": [
        {
          "at": "'Click'",
          "sound": "Clic de mouse exageradamente fuerte"
        },
        {
          "at": "'gone'",
          "sound": "Caja registradora + viento"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "humor",
      "say": "Friday? You deserve it. Payday? You deserve it. Breakup? You really deserve it.",
      "onScreen": "Friday. Payday.\n*Breakup.*",
      "visual": "Montaje noir cada vez más rápido: viernes en un bar, día de cobro frente a un cajero, ruptura llorando en la lluvia. En cada uno, el humo rojo susurra y caen bolsas de compras del cielo, cada vez más, hasta taparlo.",
      "camera": "Cortes que se aceleran con la música.",
      "transition": "Las bolsas se apilan y forman un número.",
      "sfx": [
        {
          "at": "cada 'you deserve it'",
          "sound": "Susurro rojo + platillo con escobilla"
        },
        {
          "at": "bolsas",
          "sound": "Bolsas de papel que caen"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "number",
      "say": "Twice a week, that's over 8,000 dollars a year.",
      "onScreen": "*$8,736*\na year.",
      "visual": "Las bolsas forman un número gigante, $8,736, que se ilumina en rojo sobre la ciudad como un cartel de neón en la lluvia.",
      "camera": "Contrapicado del cartel de neón con lluvia cayendo hacia la cámara.",
      "transition": "Un hilo de humo rojo se escapa del cartel y él lo sigue.",
      "sfx": [
        {
          "at": "número",
          "sound": "Neón que se enciende con zumbido + golpe grave"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "reveal",
      "say": "So he followed the voice. It led to ads, apps, and midnight sales.",
      "pause_after": 0.4,
      "onScreen": "Ads. Apps.\n*Midnight sales.*",
      "visual": "Persecución noir: él corre detrás del rastro de humo rojo por callejones mojados. El humo sale de una publicidad gigante, de un enjambre de íconos de apps y de una vidriera con 'MIDNIGHT SALE'. Todas las bocas susurran lo mismo.",
      "camera": "Cámara en mano siguiéndolo; cortes con cada fuente de humo.",
      "transition": "Él frena en seco frente a un charco.",
      "sfx": [
        {
          "at": "persecución",
          "sound": "Pasos sobre agua + contrabajo al doble"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "twist",
      "reward": "twist",
      "say": "But the voice stopped needing them. Now it sounds like you.",
      "onScreen": "It sounds\nlike *you.*",
      "visual": "Silencio. Todas las publicidades se apagan de golpe. Él mira el charco: su reflejo tiene la boca roja y es EL REFLEJO el que susurra 'you deserve it'. El humo rojo ahora le sale de su propia boca.",
      "camera": "Picado al charco; la imagen del reflejo se da vuelta y queda al derecho (él y su reflejo cambian de lugar).",
      "transition": "Una gota cae en el charco y rompe el reflejo.",
      "sfx": [
        {
          "at": "antes de la escena",
          "sound": "Silencio 0,4 s (pause_after de la escena anterior)"
        },
        {
          "at": "'sounds like you'",
          "sound": "El susurro con la voz del narrador doblada + gota que cae"
        }
      ]
    },
    {
      "type": "quote",
      "beat": "reward",
      "reward": "quote",
      "say": "Seneca warned: if you live according to opinion, you will never be rich.",
      "quote": "Live according to opinion, you will never be rich.",
      "author": "Seneca",
      "source": "Letters to Lucilius, 16",
      "visual": "La cita aparece escrita en la lluvia: cada gota que cae ilumina una letra. Es lo primero del video que no es rojo ni gris: es blanco cálido.",
      "camera": "Frontal, con la lluvia en cámara lenta.",
      "transition": "Las gotas se juntan en una luz dorada en el pecho del hombre.",
      "sfx": [
        {
          "at": "cada letra",
          "sound": "Gota que suena como nota de piano"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "contrast",
      "say": "Their voice says you deserve it. Yours can say: not today.",
      "onScreen": "*Not today.*",
      "visual": "Él se da vuelta y enfrenta a su reflejo rojo. De su boca sale una voz DORADA (letras doradas, primera vez que aparece el oro) que dice 'NOT TODAY', choca contra el humo rojo y lo hace estallar en mil pedazos.",
      "camera": "Pantalla partida rojo contra oro; el oro empuja la línea hasta ganar.",
      "transition": "Los pedazos rojos caen como lluvia y se apagan.",
      "sfx": [
        {
          "at": "'not today'",
          "sound": "Golpe grave + vidrio que estalla + cuerdas cálidas"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "payoff",
      "reward": "payoff",
      "say": "Two words. Worth 8,000 dollars a year.",
      "onScreen": "*2 words.*\n$8,000 a year.",
      "visual": "El cartel de neón de $8,736 cambia de rojo a dorado y los billetes vuelven volando a la billetera del hombre.",
      "camera": "Contrapicado del cartel dorado bajo la lluvia.",
      "transition": "La lluvia se intensifica y vuelve a la vidriera del principio.",
      "sfx": [
        {
          "at": "billetes que vuelven",
          "sound": "Viento al revés + caja registradora invertida"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "loop",
      "reward": "challenge",
      "say": "Listen tonight. You'll hear it. Because someone whispers...",
      "onScreen": "Listen *tonight.*",
      "visual": "El hombre vuelve a estar frente a la vidriera iluminada bajo la lluvia, y la boca de humo rojo vuelve a aparecer detrás de su oreja: el último cuadro es idéntico al cuadro 0.",
      "camera": "Termina en el primer plano de la oreja del cuadro 0.",
      "transition": "Corte en seco al inicio.",
      "sfx": [
        {
          "at": "final",
          "sound": "Susurro que empalma con el del cuadro 0 + lluvia continua"
        }
      ]
    }
  ]
}
```


---

# Anexo 19: Guion de ejemplo: dos-hermanos (giro: el espectador es el protagonista)

*Archivo original: `shorts/dos-hermanos/short.json`.*

Guion completo con dirección de arte, cámara, transiciones, música y efectos por escena.

```json
{
  "id": "dos-hermanos",
  "title": "You'd never guess which brother went broke.",
  "belief_broken": "Que el que se ve rico es el que ganó. Y el golpe final: nunca hubo dos hermanos; son las dos versiones del espectador eligiendo en cada cobro.",
  "fiction": true,
  "voice": "en-US-AndrewNeural",
  "rate": "+0%",
  "pitch": "-2Hz",
  "captions": true,
  "gap": 0.1,
  "sources": [
    "Historia inventada (parábola). Jake, Sam, los seguidores y los montos son ficción.",
    "Séneca, Cartas a Lucilio 2 (trad. R. M. Gummere, 1917, dominio público): 'It is not the man who has too little, but the man who craves more, that is poor.'"
  ],
  "direction": {
    "concept": "Una parábola en un mundo de juguete. El video engaña a propósito: durante la primera mitad hace creer que Jake, el que gasta, está ganando. En el mes 12 el banco levanta su mundo pieza por pieza, la cámara baja debajo del suelo y aparece lo que nadie veía: raíces de oro gigantes debajo de Sam. Golpe final: los dos hermanos se dan vuelta, miran a cámara y se funden en una sola silueta, la del espectador.",
    "look": "ESTILO NUEVO: diorama en miniatura con efecto tilt-shift (desenfoque arriba y abajo, colores de juguete saturados, luz de mañana), figuras tipo juguete de madera/plástico, todo encaja con 'clic'. Debajo del suelo, otro mundo: tierra oscura con raíces de oro que brillan. Nada del negro/oro de los videos anteriores, salvo las raíces.",
    "pacing": "Primera mitad alegre y rápida (las cosas de Jake caen una tras otra); en el mes 12 todo se frena. Impactos en 1, 6, 7 y 10.",
    "loop": "El último cuadro vuelve a las dos figuras con los maletines cayendo del cielo, igual que el cuadro 0. 'So which brother are you?' empalma con 'You'd never guess which brother went broke'."
  },
  "music": {
    "style": "Caja de música de juguete (Do mayor) que suena feliz e inocente; en el mes 12 se le acaba la cuerda (baja de tono y se frena con ruido de resorte) y entra un 'braam' orquestal grave debajo del suelo; en la revelación de las raíces, cuerdas y coro cálidos que crecen. Al final vuelve la caja de música en menor y resuelve en mayor para el loop.",
    "tempo": "110 BPM la caja de música; se frena en la escena 6; 70 BPM con cuerdas desde la 7.",
    "sections": [
      {
        "at": "escena 1",
        "cue": "Golpe de los maletines + caja de música que arranca"
      },
      {
        "at": "escenas 2-5",
        "cue": "Caja de música alegre; un 'clic' de juguete en cada cosa que cae"
      },
      {
        "at": "escena 6",
        "cue": "La caja de música se queda sin cuerda (tono que cae + resorte) → silencio"
      },
      {
        "at": "escena 7 (giro)",
        "cue": "'Braam' grave al bajar bajo tierra; cuerdas y coro al aparecer las raíces de oro"
      },
      {
        "at": "escena 10",
        "cue": "Silencio de un instante y golpe grave cuando dice 'never two brothers'"
      },
      {
        "at": "escena 11",
        "cue": "Caja de música en menor que resuelve en mayor justo en el cuadro 0"
      }
    ],
    "mix": "Voz al frente, música -10 dB bajo la voz, final a -14 LUFS, pico ≤ -1 dBTP."
  },
  "scenes": [
    {
      "type": "custom",
      "beat": "hook",
      "reward": "paradox",
      "say": "You'd never guess which brother went broke. Both got $1 million. Why?",
      "pause_after": 0.4,
      "onScreen": "Both got\n*$1,000,000.*",
      "visual": "Cuadro 0 en acción: calle de juguete en miniatura, dos figuras de gemelos idénticas. Dos maletines dorados GIGANTES caen del cielo, se clavan en el piso y se abren: los billetes explotan como confeti. En 'Why?' todo se congela y un signo de pregunta hecho de billetes gira entre los dos.",
      "camera": "Plano tilt-shift desde arriba; latigazo hacia abajo siguiendo los maletines; en 'Why?', órbita alrededor de los gemelos congelados.",
      "transition": "La cámara se va hacia el lado de Jake.",
      "sfx": [
        {
          "at": "maletines",
          "sound": "Silbido de caída + golpe grave + lluvia de billetes"
        },
        {
          "at": "'Why?'",
          "sound": "Congelado: 'whoomp' y la caja de música que se detiene un instante"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "reveal",
      "say": "Jake bought what you could see. A supercar. A mansion.",
      "onScreen": "Jake: *what you see.*",
      "visual": "Las cosas caen del cielo alrededor de Jake y encajan como juguetes con un 'clic': un superauto genérico (sin marca), una mansión que se arma piso por piso, una piscina. Jake sonríe con anteojos de sol.",
      "camera": "Cortes rápidos: cada objeto en su plano cerrado; termina en plano general de su lote lleno.",
      "transition": "Barrido lateral al lote de Sam.",
      "sfx": [
        {
          "at": "cada objeto",
          "sound": "Golpe de juguete + 'clic' + campanita"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "humor",
      "say": "Sam bought what you couldn't see. And the family laughed at him.",
      "onScreen": "Sam: *what you don't.*",
      "visual": "Lote de Sam casi vacío: un departamento chiquito, una pila de libros, una macetita. En una mesa de cena familiar de juguete, todas las figuras lo señalan y les salen globos de risa ('HA HA').",
      "camera": "Zoom lento a la macetita; corte a la mesa familiar.",
      "transition": "Los globos de risa suben y se vuelven íconos de seguidores sobre Jake.",
      "sfx": [
        {
          "at": "macetita",
          "sound": "'Puf' chiquito y triste"
        },
        {
          "at": "risas",
          "sound": "Risas de juguete (aceleradas, agudas)"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "number",
      "say": "Six months later, Jake had 2 million followers.",
      "onScreen": "Jake: *2M followers.*",
      "visual": "Sobre la mansión de Jake, una nube de flashes de celulares y corazones; un contador enorme llega a 2,000,000. El lote de Jake crece y tapa casi toda la pantalla; el de Sam queda arrinconado.",
      "camera": "Contrapicado a la mansión; el plano se inclina hacia el lado de Jake.",
      "transition": "Corte al lote gris de Sam.",
      "sfx": [
        {
          "at": "contador",
          "sound": "Notificaciones que aceleran hasta volverse un aplauso"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "consequence",
      "say": "Sam? Still the boring brother. Same old car.",
      "onScreen": "Sam: *boring.*",
      "visual": "El lado de Sam en gris y sin gracia, el mismo auto viejo de juguete. PISTA: por una grieta del piso se escapa, un segundo, un brillo dorado que nadie mira.",
      "camera": "Plano fijo y aburrido; en la grieta, un zoom rapidísimo que vuelve enseguida (el ojo lo ve, la mente no).",
      "transition": "Hoja de calendario que se arranca.",
      "sfx": [
        {
          "at": "auto viejo",
          "sound": "Bocina triste"
        },
        {
          "at": "brillo",
          "sound": "Destello casi inaudible"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "reveal",
      "say": "Then came month twelve. And the bills.",
      "pause_after": 0.4,
      "onScreen": "Month *12.*",
      "visual": "El calendario cae en 12. Una MANO GIGANTE (el banco, con puño de camisa y corbata) baja del cielo y levanta las piezas de Jake una por una: el auto, la piscina, los pisos de la mansión. Cada etiqueta se da vuelta: 'LOAN'. Jake queda parado en un lote vacío.",
      "camera": "Plano general fijo para que se vea la mano entera; temblor en cada pieza que se lleva.",
      "transition": "El piso del lote vacío se rompe y la cámara cae.",
      "sfx": [
        {
          "at": "'month twelve'",
          "sound": "Caja de música que se queda sin cuerda"
        },
        {
          "at": "cada pieza",
          "sound": "Juguete que se despega + sello de 'LOAN'"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "twist",
      "reward": "twist",
      "say": "Everything Jake owned was borrowed. Everything Sam owned was invisible.",
      "onScreen": "Borrowed vs\n*invisible.*",
      "visual": "La cámara atraviesa el suelo del diorama: debajo del lote de Jake, vacío negro con cadenas. Debajo del de Sam, una red de RAÍCES DE ORO GIGANTE que brilla y late, que estuvo creciendo todo el video. Es lo que nadie veía.",
      "camera": "Caída vertical a través de la tierra; se abre en un plano enorme de las raíces.",
      "transition": "Las raíces suben y hacen florecer el lote de Sam.",
      "sfx": [
        {
          "at": "atravesar el suelo",
          "sound": "'Braam' grave + tierra que se rompe"
        },
        {
          "at": "raíces",
          "sound": "Coro cálido + latido"
        }
      ]
    },
    {
      "type": "quote",
      "beat": "reward",
      "reward": "quote",
      "say": "Seneca knew: the man who craves more is poor.",
      "quote": "The man who craves more, that is poor.",
      "author": "Seneca",
      "source": "Letters to Lucilius, 2",
      "visual": "Las palabras de la cita crecen como raíces de oro desde abajo de la pantalla y se escriben solas.",
      "camera": "Frontal; la cámara sube con las raíces.",
      "transition": "Pantalla partida entre los dos hermanos.",
      "sfx": [
        {
          "at": "cita",
          "sound": "Raíces que crujen + campana suave"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "contrast",
      "say": "Jake looked rich. Sam was rich.",
      "onScreen": "Looked rich.\n*Was* rich.",
      "visual": "Pantalla partida: Jake sentado solo en su lote vacío; Sam pescando en un lago de juguete que florece sobre sus raíces, al atardecer.",
      "camera": "La línea del medio se corre hasta que gana Sam.",
      "transition": "Los dos hermanos se dan vuelta despacio hacia la cámara.",
      "sfx": [
        {
          "at": "'was rich'",
          "sound": "Golpe cálido + pájaros"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "payoff",
      "reward": "reveal",
      "say": "But here's the thing. There were never two brothers.",
      "onScreen": "There were *never*\ntwo brothers.",
      "visual": "Los dos gemelos miran DIRECTO a cámara. Se acercan entre sí y se funden en una sola silueta oscura con la forma de una persona mirando el celular: el espectador.",
      "camera": "Zoom lento hacia sus caras; en 'never', corte a quietud total.",
      "transition": "La silueta se divide otra vez en dos.",
      "sfx": [
        {
          "at": "antes de 'never'",
          "sound": "Silencio de un instante"
        },
        {
          "at": "'never'",
          "sound": "Golpe grave + reverb larga"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "loop",
      "reward": "challenge",
      "say": "It's you, every payday. So which brother are you?",
      "onScreen": "Which one\nare *you?*",
      "visual": "La silueta se separa en los dos gemelos de juguete de nuevo, en la calle del principio, y dos maletines dorados empiezan a caer del cielo: el último cuadro es idéntico al cuadro 0.",
      "camera": "Termina en el plano tilt-shift del cuadro 0.",
      "transition": "Corte en seco al inicio.",
      "sfx": [
        {
          "at": "final",
          "sound": "Silbido de los maletines que cae justo en el golpe del cuadro 0"
        }
      ]
    }
  ]
}
```


---

# Anexo 20: Guion de ejemplo: elegido-por-vos (giro: el video se delata)

*Archivo original: `shorts/elegido-por-vos/short.json`.*

Guion completo con dirección de arte, cámara, transiciones, música y efectos por escena.

```json
{
  "id": "elegido-por-vos",
  "title": "You never chose the medium popcorn. 3 tricks chose it.",
  "belief_broken": "Que vos elegís lo que comprás. Tres trucos eligen por vos, y el golpe final: este mismo video usó tres trucos para que lo sigas mirando.",
  "voice": "en-US-AndrewNeural",
  "rate": "+0%",
  "pitch": "-2Hz",
  "captions": true,
  "gap": 0.1,
  "sources": [
    "Opción señuelo: Dan Ariely, Predictably Irrational (2008), prueba con suscripciones de The Economist: con una opción inútil (solo papel al mismo precio que papel + web), el 84 % eligió la opción cara; sin el señuelo, el 32 %.",
    "Efecto del primer dígito ($4.99 se siente cerca de $4): Thomas y Morwitz (2005), Journal of Consumer Research.",
    "Anclaje ('antes $200'): Tversky y Kahneman (1974), Science.",
    "Precios del pochoclo: ejemplo ilustrativo, no de un cine real.",
    "Epicteto, Discursos 2.18 (trad. George Long, dominio público): 'Wait for me a little, appearance; let me see who you are... let me put you to the test.'",
    "Los tres 'trucos' del propio video son reales: la pregunta abierta del gancho, el número 3 y los subtítulos que se iluminan."
  ],
  "direction": {
    "concept": "El mundo es un decorado. Cada vez que se revela un truco, la realidad brillante se vuelve un plano técnico de líneas (un blueprint) y se ven los hilos, las poleas y la gente detrás. El golpe final rompe la cuarta pared: la cámara se aleja y muestra que este Short está en un celular dentro del blueprint, con sus propios trucos marcados en rojo.",
    "look": "ESTILO NUEVO: dos capas. Arriba, una publicidad brillante (cine, góndola, oferta) con colores saturados. Debajo, el plano técnico: líneas cian sobre azul marino, cotas, flechas, notas a mano en rojo. La transición entre las dos capas es el efecto visual principal: un barrido que 'desviste' la imagen.",
    "pacing": "Un truco cada ~4 s, cada uno con su revelación visual. Impactos en 1, 3, 7 y 8.",
    "loop": "El último cuadro vuelve a la mano agarrando el pochoclo mediano en el cine brillante, igual que el cuadro 0. 'Did I pick this?' empalma con 'You didn't pick the medium popcorn'."
  },
  "music": {
    "style": "Suspenso de documental: arpegio de sintetizador que pulsa, el clic de un proyector de cine como ritmo y un 'braam' en cada revelación. En el giro, la música se 'rebobina' (ruido de cinta hacia atrás) hasta los primeros segundos del propio tema, como si el video se descubriera. Cierra con un piano calmo.",
    "tempo": "100 BPM con el clic del proyector; rebobinado en la escena 7; piano libre desde la 9.",
    "sections": [
      {
        "at": "escena 1",
        "cue": "Jingle brillante de publicidad que se corta con un 'braam' cuando todo pasa a blueprint"
      },
      {
        "at": "escenas 2-6",
        "cue": "Arpegio que pulsa + clic de proyector; un 'braam' corto en cada truco"
      },
      {
        "at": "escena 7 (giro)",
        "cue": "Silencio 0,4 s → rebobinado de cinta → el tema vuelve a sonar desde el principio, distorsionado"
      },
      {
        "at": "escena 8",
        "cue": "Tres golpes secos, uno por cada truco del video que se marca"
      },
      {
        "at": "escenas 9-11",
        "cue": "Piano calmo; el final vuelve al jingle brillante del cuadro 0"
      }
    ],
    "mix": "Voz al frente, música -10 dB bajo la voz, final a -14 LUFS, pico ≤ -1 dBTP."
  },
  "scenes": [
    {
      "type": "custom",
      "beat": "hook",
      "reward": "paradox",
      "say": "You never chose the medium popcorn. 3 tricks chose it. Why?",
      "pause_after": 0.35,
      "onScreen": "You didn't\n*choose* this.",
      "visual": "Cuadro 0: un mostrador de cine brillante, una mano agarra el pochoclo MEDIANO. En '3 tricks chose it' un barrido convierte todo el cine en blueprint cian y aparecen hilos de marioneta desde el techo atados a los dedos de la mano. En 'Why?' se congela.",
      "camera": "Macro de la mano; en el barrido la cámara se aleja y se ven los hilos subiendo hasta el techo.",
      "transition": "El blueprint marca los tres precios con flechas.",
      "sfx": [
        {
          "at": "cuadro 0",
          "sound": "Jingle de publicidad + pochoclo que explota"
        },
        {
          "at": "'3 tricks chose it'",
          "sound": "'Braam' + barrido eléctrico"
        },
        {
          "at": "'Why?'",
          "sound": "Proyector que se traba"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "reveal",
      "say": "Look at the prices. Small, $3. Large, $7. Medium, $6.50.",
      "onScreen": "$3 · *$6.50* · $7",
      "visual": "Los tres baldes de pochoclo aparecen en fila con sus precios, que caen uno por uno como letreros de neón. El mediano se ilumina como 'la opción inteligente'.",
      "camera": "Travelling por los tres baldes; frena en el mediano.",
      "transition": "Rayos X sobre el balde grande.",
      "sfx": [
        {
          "at": "cada precio",
          "sound": "Neón que se enciende con zumbido"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "humor",
      "say": "Nobody wants the large. It's there so the medium looks cheap.",
      "onScreen": "The large is\n*bait.*",
      "visual": "Rayos X al balde grande: por dentro está vacío, es de cartón, y tiene un anzuelo de pesca enorme colgando. El anzuelo apunta al mediano.",
      "camera": "Zoom de golpe al anzuelo.",
      "transition": "El anzuelo tira y arrastra a una multitud de gente chiquita.",
      "sfx": [
        {
          "at": "rayos X",
          "sound": "Zumbido de escáner"
        },
        {
          "at": "anzuelo",
          "sound": "Carrete de pesca que gira (cómico)"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "data",
      "say": "In one famous test, a useless option made 84% pick the expensive one.",
      "onScreen": "*84%*\ntook the bait.",
      "visual": "Una multitud de figuritas camina por un embudo de blueprint; un cartel 'opción inútil' las desvía hacia la opción cara. Un contador llega a 84%. Sin el cartel, solo pasan unas pocas (32%).",
      "camera": "Cenital sobre el embudo, como un gráfico vivo.",
      "transition": "El contador gira y se vuelve una etiqueta de $4.99.",
      "sfx": [
        {
          "at": "multitud",
          "sound": "Pasos de muchos"
        },
        {
          "at": "'84%'",
          "sound": "Golpe seco + 'braam' corto"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "number",
      "say": "Trick two: $4.99. Your brain reads it as 4.",
      "onScreen": "$4.99 = *$4*",
      "visual": "Una etiqueta gigante '$4.99'. Un rayo láser (la mirada) la recorre de izquierda a derecha: ilumina el 4 y, cuando llega al '.99', este se encoge y se esconde detrás del 4.",
      "camera": "Sigue al láser de izquierda a derecha.",
      "transition": "Un ancla enorme cae desde arriba.",
      "sfx": [
        {
          "at": "láser",
          "sound": "Barrido agudo"
        },
        {
          "at": "'.99' que se esconde",
          "sound": "'Pop' chiquito"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "consequence",
      "say": "Trick three: was $200. Now $99 feels like a gift.",
      "pause_after": 0.4,
      "onScreen": "Was $200.\nNow a *gift.*",
      "visual": "Un ancla de hierro con '$200' cae y raja el piso. Desde la grieta flota hacia arriba la etiqueta de $99 envuelta como regalo; el moño es un anzuelo.",
      "camera": "Picado mientras cae el ancla; contrapicado del regalo que sube.",
      "transition": "Silencio y la cámara empieza a alejarse de todo.",
      "sfx": [
        {
          "at": "ancla",
          "sound": "Golpe metálico enorme + piso que se raja"
        },
        {
          "at": "regalo",
          "sound": "Campanitas de regalo"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "twist",
      "reward": "twist",
      "say": "And this video? It used three tricks on you too.",
      "onScreen": "This video\n*did it too.*",
      "visual": "ROMPE LA CUARTA PARED: la cámara se aleja y se ve que todo lo que viste es una pantalla de celular adentro del blueprint, en una mano. Sobre ese celular aparecen marcas rojas a mano: un círculo, una flecha, 'TRICK #1'.",
      "camera": "Zoom out continuo y rápido, de la escena al celular, del celular a la mano y de la mano al plano técnico.",
      "transition": "Las marcas rojas se apuntan a tres partes del propio video.",
      "sfx": [
        {
          "at": "antes de la escena",
          "sound": "Silencio 0,4 s (pause_after de la escena anterior)"
        },
        {
          "at": "'this video'",
          "sound": "Rebobinado de cinta + la música vuelve a su arranque"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "reward",
      "reward": "reveal",
      "say": "A question. The number three. Words that light up.",
      "onScreen": "*Question.* *3.*\nLit words.",
      "visual": "Las marcas rojas señalan, en el celular, tres cosas reales del propio video: el 'Why?' del gancho (convertido en un anzuelo que tira del espectador), el número 3 que titila y los subtítulos que se iluminan palabra por palabra (con una flecha a la palabra que suena ahora mismo).",
      "camera": "Corte por golpe a cada una de las tres marcas.",
      "transition": "El blueprint se apaga y queda una vela.",
      "sfx": [
        {
          "at": "cada truco marcado",
          "sound": "Golpe seco + trazo de marcador"
        }
      ]
    },
    {
      "type": "quote",
      "beat": "reward",
      "reward": "quote",
      "say": "Epictetus said: wait for me a little, appearance.",
      "quote": "Wait for me a little, appearance.",
      "author": "Epictetus",
      "source": "Discourses, 2.18",
      "visual": "Luz de vela y piedra. La cita aparece mientras una mano detiene el reloj de arena a la mitad: el tiempo se para y los hilos de marioneta del principio quedan flojos.",
      "camera": "Primer plano de la mano que frena el reloj de arena.",
      "transition": "Los hilos flojos se cortan.",
      "sfx": [
        {
          "at": "reloj de arena",
          "sound": "Arena que se frena + piano"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "payoff",
      "reward": "payoff",
      "say": "Three seconds of pause. Now the tricks stop working.",
      "onScreen": "Pause *3 seconds.*",
      "visual": "De vuelta en el cine: la mano se frena a centímetros del balde. Los hilos de marioneta se aflojan y caen al piso. El balde grande se desarma solo como cartón.",
      "camera": "Cámara lenta sobre la mano detenida.",
      "transition": "Vuelve el cine brillante del principio.",
      "sfx": [
        {
          "at": "hilos que caen",
          "sound": "Cuerdas que se sueltan + silencio corto"
        }
      ]
    },
    {
      "type": "custom",
      "beat": "loop",
      "reward": "challenge",
      "say": "Next time, ask yourself: did I choose this?",
      "onScreen": "Did *you*\nchoose this?",
      "visual": "El cine vuelve a ser brillante como en el cuadro 0: la mano agarra el pochoclo mediano. El último cuadro es idéntico al cuadro 0.",
      "camera": "Termina en el macro de la mano del cuadro 0.",
      "transition": "Corte en seco al inicio.",
      "sfx": [
        {
          "at": "final",
          "sound": "Primera nota del jingle del cuadro 0"
        }
      ]
    }
  ]
}
```
