# Estándar de viralidad de Calm Fortune ("vara alta")

Regla permanente del dueño del canal (04/11/2026): **cada Short busca dopamina y engagement máximos.** Visual y psicológicamente atrapante, con frases que rompan lo normal. Aplica a todo guion y a toda escena. `tools/check_short.py` verifica lo que se puede medir antes de renderizar.

## Guion

1. **Gancho en 1,5 s.** Una frase que contradiga lo esperado y una imagen que la muestre literalmente. Hablado: 12 palabras o menos. En pantalla: 6 palabras o menos.
2. **Pregunta abierta en los primeros 3 s** que recién se cierra al final (ej.: el gancho termina en "Why?").
3. **Una recompensa cada 3 a 5 s, sin repetir el tipo dos veces seguidas.** Tipos: `paradox` (paradoja), `number` (cifra que sorprende), `reveal` (revelación), `quote` (cita real), `data` (dato o ciencia), `consequence` (consecuencia visible), `twist` (giro), `contrast` (contraste), `payoff` (cierre de la pregunta), `challenge` (desafío al espectador), `humor` (remate seco).
4. **Un giro (`twist`) entre el 55 % y el 75 % del video** que dé vuelta la idea.
5. **El final empalma con el primer cuadro.** La última frase lleva a la primera, para que el video se repita sin que se note el corte.
6. **Cada frase podría ser un gancho.** Sin relleno ni contexto que no pague.
7. **Datos y citas reales, con fuente** en `sources`. Una cifra verificable pega más fuerte que una inventada, y un error en comentarios mata la credibilidad.

## Visual

1. **Cada frase con su imagen literal.** Se muestra, no se explica: si dice "rough cloth", la toga se deshace. El campo `visual` de cada escena describe esa imagen.
2. **Cambio de cámara o de escenario cada 1,5 a 3 s**, no solo de texto (las plantillas v2 ya cortan plano cada ~1,5 s).
3. **Un momento de impacto cada 8 a 10 s:** transformación, explosión, la cámara atravesando algo.
4. **6 palabras o menos en pantalla**, nunca cortadas por los bordes. Las citas pueden llegar a 10.
5. **El primer cuadro tiene acción.** Nada de arrancar en negro o con fundido.
6. **Contrastes alternados:** plano lejos y cerca, quieto y explosivo, oscuro y oro.
7. **Un símbolo que se repite** en todo el canal (la moneda CF) para que se reconozca.

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

Frena (error) si:
- la primera escena no es `hook`, el gancho hablado pasa de 12 palabras o el texto en pantalla pasa de 6 (10 en citas),
- falta `beat`, `reward` o `visual`,
- dos escenas seguidas tienen la misma `reward`,
- no hay `twist`, o cae fuera del 55-75 % del video,
- la última escena no es `outro` con `beat: loop`.

Avisa (warning) si una escena dura más de 4,5 s estimados.

Lo que no se mide solo: texto cortado por los bordes y primer cuadro oscuro. Se revisan con `npm run test:templates -- --short shorts/<id> --at 0,0.5,0.95` antes del render final.
