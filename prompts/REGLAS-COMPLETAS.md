# Reglas completas para Shorts que atrapan

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

## Anexo: archivos originales (en el .zip)

- `prompts/estandar-viral.md`: el estándar "vara alta", con las reglas 1 a 9.
- `prompts/master-short.md`: las reglas de retención de Grok y el formato del guion.
- `prompts/sonido.md`: el sonido por código.
- `shorts/*/short.json`: los guiones de ejemplo con dirección completa (la-voz, dos-hermanos, elegido-por-vos, marco-aurelio-chatarra).
- `tools/check_short.py` y `tools/verify_short.py`: los controles automáticos.
- `.claude/skills/`: los skills de YouTube completos (licencia MIT):
  - del pack de Jake Schincariol: puntuador de ganchos, linter de títulos, ranking de virales y lector de retención;
  - de claude-youtube (AgriciDaniel): las guías de Shorts, retención, algoritmo, miniaturas, SEO y monetización.
