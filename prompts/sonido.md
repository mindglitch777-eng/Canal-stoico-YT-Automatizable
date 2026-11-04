# Sonido y música generados por código

Pedido del dueño: **efectos y música hechos desde código**, pensados para el engagement, para cada video. Son nuestros (sin problemas de licencia) y salen exactamente sincronizados con la imagen.

## Qué es herramienta y qué es de cada video

- **Herramienta compartida** (se repite en todos los videos): un sintetizador (`tools/sfx/`, a construir) con una paleta de sonidos base y un mezclador que pone cada sonido en su cuadro y baja la música mientras habla la voz.
- **De cada video:** qué suena, cuándo y cómo. Está en el `short.json` (`music` y `sfx` de cada escena). Cada video puede pedir sonidos nuevos: si un sonido nuevo se repite, se suma a la paleta.

## Paleta base (recetas de síntesis)

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

## Música

- **Por defecto, del nicho** (oscuro, antiguo, calmo con tensión): drone grave, latido, lira Karplus-Strong, crescendos. Cada video puede cambiarlo si el guion pide otra cosa.
- **Se arma por secciones** que siguen la estructura del guion (gancho, recompensas, giro, cierre) y cambian en los golpes del video.
- **Silencio como arma:** cortar todo 0,3-0,5 s justo antes del giro es uno de los cortes de patrón más fuertes.
- **Loop:** el final de la música tiene que empalmar con el arranque, igual que la imagen.

## Mezcla

- La voz manda: la música baja unos 10 dB mientras se habla (sidechain).
- Efectos un poco por encima de la música y nunca tapando una palabra clave.
- Volumen final cerca de -14 LUFS, el nivel al que YouTube normaliza (a confirmar).
