# Estándar de viralidad de Calm Fortune ("vara alta")

Regla permanente del dueño del canal (04/11/2026): **cada Short busca dopamina y engagement máximos.** Visual y psicológicamente atrapante, con frases que rompan lo normal. Aplica a todo guion y a toda escena. `tools/check_short.py` verifica lo que se puede medir antes de renderizar.

**Son principios, no un molde.** Cada video puede arrancar, verse y cerrar de forma completamente distinta. Nada visual es obligatorio en todos los videos (ni el 3D, ni la moneda, ni un tipo de entrada): se elige o se inventa lo que el guion necesite. Mientras más distinto y más loco sea lo que pide el guion, mejor.

**Herramientas compartidas = solo lo que seguro se repite:** voz y tiempos por palabra (`tools/tts.py`), formato 1080x1920 con zona segura, carga de fuentes, sincronía texto-voz, render en Actions. Todo lo demás (subtítulos, 3D, cámara, transiciones, escenas viejas) es una biblioteca opcional: se usa si suma, se rompe o se reemplaza si no. Si algo nuevo se repite en varios videos, recién ahí se convierte en herramienta.

## Guion

1. **Gancho en 1,5 s.** Una frase que contradiga lo esperado y una imagen que la muestre literalmente. Hablado: 12 palabras o menos. En pantalla: 6 palabras o menos.
2. **Pregunta abierta en los primeros 3 s** que recién se cierra al final (ej.: el gancho termina en "Why?").
3. **Una recompensa cada 3 a 5 s, sin repetir el tipo dos veces seguidas.** Tipos: `paradox` (paradoja), `number` (cifra que sorprende), `reveal` (revelación), `quote` (cita real), `data` (dato o ciencia), `consequence` (consecuencia visible), `twist` (giro), `contrast` (contraste), `payoff` (cierre de la pregunta), `challenge` (desafío al espectador), `humor` (remate seco).
4. **Un giro (`twist`) entre el 55 % y el 75 % del video** que dé vuelta la idea.
5. **El final empalma con el primer cuadro.** La última frase lleva a la primera, para que el video se repita sin que se note el corte.
6. **Cada frase podría ser un gancho.** Sin relleno ni contexto que no pague.
7. **Datos y citas reales, con fuente** en `sources`. Una cifra verificable pega más fuerte que una inventada, y un error en comentarios mata la credibilidad.

## Visual

0. **Video a medida, no plantilla** (decisión del dueño): cada Short tiene su propia composición en `remotion/src/shorts/<id>/`, programada para ese guion con las herramientas compartidas (cámara, texto cinético, subtítulos, 3D, efectos). El campo `visual` de cada escena es el pedido que esa composición tiene que cumplir al pie de la letra.
1. **Cada frase con su imagen literal.** Se muestra, no se explica: si dice "rough cloth", la toga se deshace. El campo `visual` de cada escena describe esa imagen.
2. **Cambio de cámara o de escenario cada 1,5 a 3 s**, no solo de texto (las plantillas v2 ya cortan plano cada ~1,5 s).
3. **Un momento de impacto cada 8 a 10 s:** transformación, explosión, la cámara atravesando algo.
4. **6 palabras o menos en pantalla**, nunca cortadas por los bordes. Las citas pueden llegar a 10.
5. **El primer cuadro tiene acción.** Nada de arrancar en negro o con fundido.
6. **Contrastes alternados:** plano lejos y cerca, quieto y explosivo, oscuro y oro.
7. **Identidad opcional:** se puede usar un símbolo del canal (la moneda CF), pero no es obligatorio.

## Audio

- Efecto en cada corte y en cada revelación, más música de fondo. Pendiente: se propone generar los efectos por código (propios, sin problema de licencia).

## Campos obligatorios por escena en `short.json`

| Campo | Qué es |
|---|---|
| `beat` | Rol en la estructura: `hook`, `reward`, `twist`, `payoff`, `loop` |
| `reward` | Tipo de recompensa (lista de arriba) |
| `visual` | La imagen literal que acompaña la frase (dirección de arte; si la plantilla todavía no la puede hacer, queda como pedido) |

## Control automático

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
