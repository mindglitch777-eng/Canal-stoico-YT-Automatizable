# Tanda 2: los 3 videos están listos

Los tres pasan el control final y no subí nada. La voz va a **velocidad normal** (como pediste), así que cada video dura lo que dura la voz.

| Video | Duración | Loop (SSIM) | Volumen | Pico | Silencios |
|---|---|---|---|---|---|
| [la-voz](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/blob/salidas/shorts/run-18/la-voz.mp4) | 40,7 s | 0,97 | -14,4 LUFS | -2,7 dBTP | 1 (antes del giro) |
| [dos-hermanos](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/blob/salidas/shorts/run-19/dos-hermanos.mp4) | 34,1 s | 0,99 | -14,0 LUFS | -2,0 dBTP | 1 (antes del giro) |
| [elegido-por-vos](https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable/blob/salidas/shorts/run-20/elegido-por-vos.mp4) | 44,3 s | 0,98 | -13,6 LUFS | -2,4 dBTP | 1 (antes del giro) |

Mínimos: loop ≥ 0,90, -14 ±0,5 LUFS, pico ≤ -1 dBTP, 48 kHz y solo los silencios a propósito. Cada carpeta (`shorts/run-18`, `run-19`, `run-20`) tiene el MP4, la hoja de cuadros (`-hoja.jpg`) y el informe.

---

## 1. la-voz
**Estilo:** cine negro en blanco y negro, con lluvia. El rojo es la voz que te tienta: humo, labios y letras "you deserve it" que flotan. El oro es tu propia voz.
**El giro (escena 7):** las publicidades se apagan, se ve el charco desde arriba y el reflejo tiene la boca roja. La imagen gira en 3D y ahora el humo le sale de **su** boca. Una gota rompe el reflejo.
**Sonido:** jazz noir (contrabajo, escobillas, trompeta con sordina) sobre lluvia continua. Cada "you deserve it" se dobla con un susurro **hecho con la misma voz del narrador**: filtrada, con aire, reverb y una copia desafinada. En el giro queda solo la lluvia y el susurro de "sounds like you".

- **YouTube:** 3 words empty your wallet. You say them.
- **TikTok:** Someone whispers 3 words before you buy
- **Texto de portada:** YOU DESERVE IT
- **Descripción:** "You deserve it" twice a week at $84 = $8,736 a year. The voice isn't the ads anymore. It's yours. Seneca (Letters to Lucilius 16): if you live according to opinion, you will never be rich. Next time, answer: not today.
- **Hashtags:** #stoicism #seneca #impulsebuying #moneymindset #personalfinance

## 2. dos-hermanos
**Estilo:** diorama de juguete en 3D (muñecos de madera, colores de juguete, luz de mañana, efecto miniatura). Nada de negro y oro, salvo las raíces.
**Los giros:**
- **Escena 7:** la cámara cae y atraviesa el suelo. Debajo de Jake hay vacío y cadenas. Debajo de Sam, una red de raíces de oro gigantes que laten.
- **Escena 10:** los gemelos se dan vuelta, miran a cámara, se juntan y se funden en una sola silueta mirando el celular: vos.

**Sonido:** caja de música de juguete. En el mes 12 se le acaba la cuerda: baja de tono, suena el resorte y viene un silencio. Bajo tierra entra un "braam" grave y después cuerdas y coro cálidos. Golpe grave con reverb larga en "never". La caja de música en menor resuelve en mayor en el empalme.

- **YouTube:** Twins got $1M each. Guess who went broke.
- **TikTok:** Which brother are you? $1M test
- **Texto de portada:** ONLY ONE WAS RICH
- **Descripción:** Two brothers, $1 million each. One bought what you could see, the other what you couldn't. A parable, not a true story. Seneca (Letters to Lucilius 2): it is not the man who has too little, but the man who craves more, that is poor.
- **Hashtags:** #stoicism #seneca #wealth #moneymindset #parable

## 3. elegido-por-vos
**Estilo:** dos capas. Arriba, un cine brillante de publicidad (cortinado rojo, marquesina de focos, baldes de pochoclo). Un barrido eléctrico lo "desviste" y deja ver un plano técnico cian con hilos de marioneta atados a tus dedos.
**Los giros:**
- **Escena 7:** zoom out continuo. Todo lo que viste está en un celular, en una mano, adentro del plano.
- **Escena 8:** las marcas rojas señalan **tres cosas reales del propio video**:
  - **"Why?":** adentro del celular se ve el cuadro real del gancho con su subtítulo, que se vuelve un anzuelo.
  - **El número 3:** el cartel "3 TRICKS" que titila desde el segundo 2.
  - **Los subtítulos:** una flecha a la palabra que suena en ese momento.

**Sonido:** jingle de publicidad cortado por un "braam". Después, suspenso de documental (arpegio, clic de proyector, "braam" corto en cada truco). En el giro la música se rebobina hasta su propio arranque y vuelve distorsionada. Tres golpes secos con trazo de marcador. Al final, piano calmo, y el jingle empalma el loop.

- **YouTube:** 3 tricks picked your popcorn for you
- **TikTok:** You didn't choose the medium popcorn
- **Texto de portada:** THIS VIDEO TOO
- **Descripción:** The large is bait (decoy effect: in Dan Ariely's famous Economist test, a useless option moved 84% to the expensive plan, vs 32% without it). $4.99 reads as $4. "Was $200" makes $99 feel like a gift. Epictetus (Discourses 2.18): "Wait for me a little, appearance." Pause 3 seconds.
- **Hashtags:** #stoicism #epictetus #psychology #marketingtricks #moneytips

---

## Decisiones que tomé solo
1. **Velocidad de la voz.** Primero los guiones tenían un rango de 41 a 47 s que ralentizaba la voz. Me dijiste que no, así que lo saqué: van a velocidad normal y duran 34 a 44 s.
2. **Pausa de 0,4 s antes de cada giro.** En la-voz y en elegido-por-vos agregué `pause_after: 0.4` a la escena 6, porque la escena 7 pide ese silencio.
3. **Legibilidad primero** (por lo que pasó con diogenes-rey): textos grandes sobre placas oscuras o claras con borde, contraste alto y nada importante debajo de y = 1450.
4. **Sin marcas.** Pochoclo, autos, apps y vidrieras son genéricos. "SNACKS", "POPCORN" y "SALE" son palabras sueltas, no marcas.
5. **Datos verificables.**
   - $84 dos veces por semana da $8,736 al año.
   - El 84 % contra 32 % es el experimento de Ariely con la suscripción de The Economist.
   - Citas: Séneca, Cartas 2 y 16. Epicteto, Disertaciones 2.18.
6. **dos-hermanos es ficción** (parábola), como permiten las reglas nuevas.
7. **Volumen de elegido-por-vos.** Salió a -14,9 LUFS (el limitador lo bajó de más). Lo volví a normalizar sobre el MP4 terminado: la imagen es la misma y quedó en -13,6.

## Lo que no salió perfecto
- **Música y susurros:** no los pude escuchar desde la sesión. Revisé tiempos, volumen y silencios. Contame cómo suenan los susurros de la-voz, que es lo más delicado.
- **Efecto miniatura de dos-hermanos:** es una bruma clara arriba y abajo, no un desenfoque real (el desenfoque real es muy caro de renderizar sin placa de video).
- **Las figuras** (detective, mano, muñecos) son dibujos hechos por código. Si alguna se ve simple, decime cuál y la mejoro.
