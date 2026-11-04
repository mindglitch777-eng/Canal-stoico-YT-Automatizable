# Plantilla maestra: cómo se arma un Short de Calm Fortune

Este archivo define el formato. El contenido y el criterio los decide el dueño del canal.

## Identidad (de la investigación con Grok)

- **Ángulo:** Stoic Wealth: estoicismo real (Séneca, Marco Aurelio, Epicteto) aplicado a dinero, riqueza silenciosa y psicología del dinero.
- **Tono:** calmado, filosófico, anti-hustle.
- **Estilo visual:** dark-minimal, texto grande, animaciones explicativas, sin stock footage genérico.
- **Idioma:** inglés, audiencia de EE.UU.
- **Duración:** 30 a 50 segundos.

## Reglas de retención (aportadas por el dueño vía Grok)

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

## Proceso

1. **Idea** del ángulo Stoic Wealth (o de la investigación de competencia, cuando esté).
2. **Ganchos:** 5 opciones con `/yt-script` y puntuarlas con
   `python3 .claude/skills/yt-script/hookscore.py --hook "..."`. El puntuador se basa en palabras clave: sirve como filtro, no como juez final.
3. **Escribir** `shorts/<id>/short.json` con el formato de abajo. Cada escena dura lo que dura su `say`, así que una escena ≈ un cambio visual: apuntar a 5-8 escenas de 3-7 s.
4. **Revisión del dueño.**
5. **Subir** el `short.json` a `main` → el workflow "Render de Short" genera voz, subtítulos y MP4.
6. **Empaque** (título, descripción) con `/yt-package` y `/yt-seo`.
7. **Después de publicar:** retención con `/yt-retention`.

## Formato de `short.json`

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

**Subtítulos:** salen solos, palabra por palabra, a partir de la voz. Si el texto en pantalla de una escena es igual a su `say`, esa escena no repite subtítulos.

Ejemplo completo: `shorts/ejemplo-seneca/short.json`.
