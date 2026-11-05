# Buen día: los 3 videos están listos

Los tres pasan el control final y no subí nada. Los MP4 están en la carpeta [`final/`](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/tree/salidas/final), cada uno con su hoja de cuadros y su informe.

| Video | Duración | Loop (SSIM) | Volumen | Pico | Silencios |
|---|---|---|---|---|---|
| [seneca-tiempo](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/blob/salidas/final/seneca-tiempo.mp4) | 42,2 s | 0,96 | -14,3 LUFS | -2,0 dBTP | 1 (el del giro) |
| [millonario-invisible](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/blob/salidas/final/millonario-invisible.mp4) | 42,2 s | 0,98 | -14,4 LUFS | -1,2 dBTP | 1 (el del giro) |
| [diogenes-rey](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/blob/salidas/final/diogenes-rey.mp4) | 42,1 s | 0,98 | -14,3 LUFS | -3,4 dBTP | 2 (después de "Why?" y antes del giro) |

Mínimos que había que cumplir: loop ≥ 0,90, -14 ±0,5 LUFS, pico ≤ -1 dBTP, 48 kHz, solo silencios intencionales y 40 a 48 s. Revisé las hojas de cuadros una por una.

---

## 1. seneca-tiempo
**Estilo nuevo:** oscuridad total con luz fría de pantalla, glitch e interfaz de celular. Las notificaciones caen como balas y el reloj de arena es de píxeles. **El oro aparece solo para el tiempo de vida.** Arranca con pantalla partida: a la izquierda le arrancan un billete de $100 a un extraño, a la derecha el celular le chupa arena de oro del pecho. El final vuelve exactamente a ese cuadro.
**Música:** el ritmo está hecho de tics de reloj que aceleran de 90 a 128 BPM. En el giro se paran todos los relojes (0,4 s de silencio) y entra un latido con un coro cálido.

- **YouTube:** You guard $100. You give away 6 years.
- **TikTok:** 3 hours a day = 6 years of your life
- **Texto de portada:** 45 DAYS GONE
- **Descripción:** Americans spend over 3 hours a day on their phones (Reviews.org, 2026). That's 45 days a year, about 6 years over 50 years. Seneca, 2,000 years ago: we guard our money and give away our time. Be stingy with the one thing you can't buy back.
- **Hashtags:** #stoicism #seneca #screentime #timemanagement #moneymindset

## 2. millonario-invisible
**Estilo nuevo:** programa de concurso de TV, con haces de luz, marquesina de focos, cuenta regresiva de LED y confeti. Se vuelve rayos X: a la izquierda, esqueleto con cadenas de deuda y −$84,000; a la derecha, una bóveda de oro con $3,000,000. Después del giro los focos se apagan y el lujo se pone gris. Lo simple queda en oro cálido: amanecer y pesca. "WEALTH" solo se ve cuando pasa el escáner.
**Música:** lounge de lujo con trap suave y campanitas. En "nothing saved" toda la música se frena como una cinta y entra un bajo oscuro. Cierra con lira y coro, y el jingle del concurso empalma el loop.

- **YouTube:** One of these men has $3M. It's not who you think.
- **TikTok:** You'll guess wrong: which one has $3 million?
- **Texto de portada:** WHO'S RICH?
- **Descripción:** A famous study of America's millionaires (Stanley & Danko) found 3 in 4 never paid over $600 for a suit, and their most common car brand was Ford. Seneca: "He is a great man who uses earthenware dishes as if they were silver." The two contestants are illustrative.
- **Hashtags:** #millionaire #personalfinance #stoicism #seneca #wealth

## 3. diogenes-rey
**Estilo nuevo:** una vasija griega de figuras negras que cobra vida: terracota, guardas griegas y líneas incisas. El sol es la única luz. La sombra gigante del rey a caballo con su ejército tapa a Diógenes, que con un gesto la congela. Cuando aparece la idea moderna, la vasija se quiebra y por las grietas se ve el mundo de hoy (negociación, cadenas de cuotas) dibujado en el mismo estilo.
**Música:** cuerno de guerra y cascos, tambores de marcha, aulós y lira en modo frigio. Golpe de luz en "sun", risas de los guardias, un corte de metal por cada eslabón. Después del giro, un drone cálido como un amanecer, y el riser final resuelve en el cuerno del cuadro 0.

- **YouTube:** Why Alexander wanted to be Diogenes
- **TikTok:** He told Alexander the Great to move. Why?
- **Texto de portada:** TOLD A KING
- **Descripción:** Alexander the Great offered Diogenes anything. Diogenes asked him to stand out of his sunlight. Alexander's answer: "If I were not Alexander, I would be Diogenes." (Plutarch, Life of Alexander 14.) You can't buy a man who wants nothing.
- **Hashtags:** #stoicism #diogenes #alexanderthegreat #philosophy #minimalism

---

## Decisiones que tomé solo
1. **Velocidad de la voz.** Con la velocidad del guion, la voz real dura mucho menos que lo estimado: `seneca-tiempo` dio 34 s, por debajo del mínimo de 40. Para no cambiar el texto, `tts.py` ahora vuelve a generar la voz más lenta, de a -4 %, hasta entrar en 41 a 47 s. **seneca-tiempo quedó a -20 %**, el máximo que permito. Los otros dos también se ralentizaron; el valor exacto no quedó en la parte del log que pude leer. Desde ahora la velocidad queda guardada en `timeline.json`. **Escuchá si suena lenta.** Si te gusta más rápida, hay dos caminos: bajar el mínimo a ~35 s o sumar una escena al guion.
2. **Volumen.** En `millonario-invisible` el códec de audio subió el pico real por encima de -1 dBTP. Lo corregí volviendo a normalizar el audio del MP4 terminado (la imagen es la misma), y el workflow ya lo hace solo (el último render de `diogenes-rey` salió bien de una).
3. **Dos citas sin tiempo muerto.** En millonario y en Diógenes, la voz presenta la cita antes de decirla ("Seneca: a great man uses…", "The king offered him anything"). Esas palabras aparecen escritas mientras se dicen.
4. **Marcas.** "Ford" está en la voz y en el texto, como pide el guion. La camioneta es genérica, sin logo. Ningún auto, reloj ni celular tiene marca.
5. **Las personas son dibujos** hechos por código: concursantes en caricatura, siluetas y figuras de vasija. No hay imágenes de terceros.
6. **El libro del estudio** dice "A study of America's millionaires", sin la tapa ni el título real.

## Lo que no salió perfecto
- En **seneca-tiempo**, la mano que arranca el billete se ve simple al lado del resto.
- La **música no la escuché**: desde la sesión no puedo. Revisé los tiempos y el espectrograma, y verifiqué que no haya silencios de más. Contame qué suena raro.
- Pasa algo parecido con la voz lenta de seneca-tiempo (ver decisión 1).

Para mejorar cualquiera, decime qué escena y qué querés cambiar.
