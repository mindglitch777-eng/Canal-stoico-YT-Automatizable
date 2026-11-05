"""
Diseño de sonido de 'dos-hermanos' (sigue `music` y los `sfx` del short.json).
Caja de música de juguete en Do mayor (110 BPM) → se queda sin cuerda en el mes 12 → 'braam' grave bajo tierra
→ cuerdas y coro cálidos (70 BPM) → caja de música en menor que resuelve en mayor justo en el cuadro 0.
"""
import numpy as np

import mix as M
import synth as S

SR = S.SR
BPM = 110
BEAT = 60 / BPM
# melodía alegre (Do mayor), en corcheas; None = silencio
MELODY = [72, 76, 79, 76, 77, 81, 79, None, 74, 77, 81, 77, 76, 79, 84, None,
          72, 76, 79, 84, 83, 79, 77, 74, 72, 74, 76, 77, 79, None, 72, None]
BASS = [48, 53, 55, 48]


def tine(note: float, dur: float = 1.2, bright: float = 1.0) -> np.ndarray:
    """Púa de caja de música: seno + parciales inarmónicos, ataque seco y caída larga."""
    t = S.t_axis(dur)
    f = S.midi(note)
    x = np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 9) + 0.15 * np.sin(2 * np.pi * f * 2.0 * t)
    click = S.hp(S.noise(dur, int(note * 7)), 3000)[: len(t)] * np.exp(-t * 300) * 0.3
    return ((x * np.exp(-t * 3.2) + click) * 0.5).astype(np.float32)


def music_box(dur: float, minor: bool = False, wind_down: float | None = None, seed: int = 0) -> np.ndarray:
    """La caja de música de largo `dur`. `wind_down`: segundo en que se le acaba la cuerda (tono que cae y se frena)."""
    out = np.zeros(int((dur + 2) * SR), dtype=np.float32)
    t = 0.0
    k = 0
    step = BEAT / 2
    while t < dur:
        speed = 1.0
        bend = 0.0
        if wind_down is not None and t > wind_down:
            u = (t - wind_down) / 1.0
            if u > 1:
                break
            speed = 1 + u * 2.5  # cada nota tarda más
            bend = -u * 5  # y baja de tono
        n = MELODY[k % len(MELODY)]
        if n is not None:
            if minor and n % 12 in (4, 9, 11):
                n -= 1
            x = tine(n + bend, 1.4)
            s = int(t * SR)
            out[s: s + len(x)] += x[: len(out) - s]
        if k % 4 == 0:
            b = BASS[(k // 8) % 4] - (1 if minor and (k // 8) % 4 == 0 else 0)
            x = tine(b + bend, 1.6, 0.4) * 0.7
            s = int(t * SR)
            out[s: s + len(x)] += x[: len(out) - s]
        t += step * speed
        k += 1
    return out[: int(dur * SR)]


def spring_noise() -> np.ndarray:
    """Resorte que se suelta: ruido metálico con chirrido descendente."""
    dur = 0.7
    t = S.t_axis(dur)
    x = S.sweep_bp(S.noise(dur, 41), 4000, 600, 6.0)[: len(t)] * np.exp(-t * 4)
    boing = np.sin(2 * np.pi * (300 - 180 * t) * t) * np.exp(-t * 6) * 0.4
    return (x * 0.8 + boing).astype(np.float32)


def braam(dur: float = 2.6) -> np.ndarray:
    """'Braam' orquestal grave: metales en racimo, filtro que se abre."""
    t = S.t_axis(dur)
    x = np.zeros_like(t)
    for n in (26, 33, 38, 41):
        f = S.midi(n)
        ph = 2 * np.pi * f * t
        x += sum(np.sin(k * ph + 0.3 * k) / k for k in range(1, 14))
    x = S.sweep_bp(x, 120, 1400, 1.6)[: len(t)]
    a = np.clip(t / 0.12, 0, 1) * np.exp(-t * 0.9)
    return S.norm(S.soft_clip(x * a, 2.0), 0.9)


def warm_strings(notes: list[float], dur: float) -> np.ndarray:
    t = S.t_axis(dur)
    x = np.zeros_like(t)
    for k, n in enumerate(notes):
        for d in (-0.07, 0.0, 0.07):
            f = S.midi(n + d)
            ph = np.cumsum(2 * np.pi * f * (1 + 0.003 * np.sin(2 * np.pi * (5 + k * 0.2) * t)) / SR)
            x += sum(np.sin(j * ph) / j for j in range(1, 6))
    x = S.lp(x, 2200)
    a = np.clip(t / 0.8, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    return S.norm(x * a, 0.6).astype(np.float32)


def toy_click(seed: int = 0) -> np.ndarray:
    dur = 0.12
    t = S.t_axis(dur)
    x = S.bp(S.noise(dur, seed), 1500, 5000)[: len(t)] * np.exp(-t * 90)
    knock = np.sin(2 * np.pi * 900 * t) * np.exp(-t * 60) * 0.5
    return (x + knock).astype(np.float32)


def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    why = tl.word(1, "why", edge="end")
    s2, s6, s7 = tl.start(2), tl.start(6), tl.start(7)
    twelve = tl.word(6, "twelve")
    bills_end = tl.word(6, "bills", edge="end")
    s10, s11 = tl.start(10), tl.start(11)
    never = tl.word(10, "never")

    # ---------- MÚSICA ----------
    # 1: arranca con el golpe de los maletines y se detiene un instante en 'Why?'
    mix.mus(music_box(why - 0.55), 0.55, -6)
    # 2-6: caja de música alegre; en 'twelve' se queda sin cuerda
    mb = music_box(bills_end - s2 + 0.2, wind_down=twelve - s2, seed=2)
    mix.mus(mb, s2, -6)
    mix.mus(M.drone([48, 55, 64], twelve - s2 + 0.3, 900, 1), s2, -17)
    mix.fx(spring_noise(), twelve + 1.0, -8)
    # 6 → 7: silencio (pause_after) y 'braam' al atravesar el suelo
    mix.silence(bills_end + 0.05, s7)
    mix.fx(braam(3.0), s7 + 0.15, -2)
    mix.mus(M.drone([26, 33, 38], tl.end(7) - s7, 260, 7), s7, -9)
    # 7-9: cuerdas y coro cálidos que crecen (70 BPM, Re mayor)
    inv = tl.word(7, "invisible")
    mix.mus(warm_strings([50, 57, 62, 66], tl.end(9) - inv + 0.6), inv, -7)
    mix.mus(S.choir([62, 66, 69], tl.end(9) - inv + 0.6, "aa"), inv, -11)
    M.arpeggio(mix, tl.start(8), tl.end(9), 70, [62, 66, 69, 74], -14)
    # 10: casi nada; silencio de un instante antes de 'never' y golpe grave con reverb larga
    mix.mus(M.drone([50, 57], never - s10 + 0.6, 400, 9), s10, -12)
    mix.fx(S.reverb(S.pad(M.sub_hit(), 3.0), 0.6, 3.0, 3), never, -1)
    mix.fx(S.gong(55, 4.0), never, -9)
    # 11: caja de música en menor que resuelve en mayor justo en el cuadro 0 (wrap)
    mix.mus(music_box(T - s11 + 0.2, minor=True, seed=11), s11, -7)
    mix.mus(warm_strings([45, 52, 57, 60], T - never + 0.2), never + 0.4, -14)
    mix.mus(tine(72, 1.6) + tine(76, 1.6) * 0.8 + tine(79, 1.6) * 0.7, T - 0.02, -4, wrap=True)

    # ---------- EFECTOS ----------
    # 1) silbido de caída + golpe grave + lluvia de billetes; congelado en 'Why?'
    ch = S.chirp(2400, 600, 0.55, exp=True)
    fall = ch * np.linspace(0.2, 1, len(ch))
    mix.fx(fall.astype(np.float32) * 0.5, T - 0.05, -10, wrap=True)  # empieza al final del video y cae en el cuadro 0
    mix.fx(S.boom(90, 32, 0.9), 0.5, -1)
    mix.fx(M.sub_hit(), 0.5, -4)
    mix.fx(S.paper_unfold(1.2, 5), 0.62, -8)
    mix.fx(S.page_flip(14, 7), 0.7, -10)
    mix.fx(S.time_freeze(), why - 0.05, -5)

    # 2) cada cosa que cae: golpe de juguete + clic + campanita
    for w in ("supercar", "mansion"):
        tw = tl.word(2, w)
        mix.fx(S.boom(170, 70, 0.3, click=False), tw, -5)
        mix.fx(toy_click(len(w)), tw + 0.03, -3)
        mix.fx(S.ding(2100 if w == "supercar" else 1760), tw + 0.06, -9)
    for k in range(1, 4):
        mix.fx(toy_click(20 + k), tl.word(2, "mansion") + k * 0.15, -6)

    # 3) 'puf' chiquito y triste en la macetita; risas de juguete aceleradas
    mix.fx(S.wet_thud(), tl.start(3) + 0.4, -10)
    mix.fx(S.wah_down(), tl.word(3, "couldn't") + 0.1, -12)
    lg = S.laugh(31, 1.4)
    fast = np.interp(np.arange(0, len(lg), 1.35), np.arange(len(lg)), lg).astype(np.float32)
    mix.fx(fast, tl.word(3, "laughed"), -6, pan=-0.3)
    mix.fx(fast, tl.word(3, "laughed") + 0.12, -9, pan=0.4)

    # 4) notificaciones que aceleran hasta volverse un aplauso
    t0, t1 = tl.word(4, "had"), tl.word(4, "followers", edge="end")
    t = t0
    k = 0
    while t < t1:
        mix.fx(S.notify(), t, -16 + min(6, k * 0.3), pan=np.sin(k * 1.7) * 0.6)
        t += max(0.035, 0.3 * 0.86 ** k)
        k += 1
    clap = S.bp(S.noise(1.2, 77), 800, 6000)
    clap = clap * (0.5 + 0.5 * (np.random.default_rng(3).random(len(clap)) > 0.7)) * np.exp(-S.t_axis(1.2)[: len(clap)] * 2)
    mix.fx(clap.astype(np.float32), t1 - 0.2, -10)

    # 5) bocina triste en el auto viejo; destello casi inaudible en la grieta
    mix.fx(S.sad_horn(), tl.word(5, "car"), -6)
    mix.fx(S.bling(5), tl.start(5) + (tl.end(5) - tl.start(5)) * 0.5, -20)

    # 6) calendario que se arranca; cada pieza: juguete que se despega + sello 'LOAN'
    mix.fx(S.paper_unfold(0.5, 61), twelve - 0.1, -6)
    a0 = twelve + 10 / 30
    L = (tl.end(6) - 4 / 30 - a0) / 5
    for k in range(5):
        s = a0 + k * L
        mix.fx(toy_click(60 + k), s + L * 0.38, -6)
        mix.fx(S.stamp(), s + L * 0.45, -5)
        mix.fx(S.whoosh(0.3, True, 70 + k), s + L * 0.5, -14)

    # 7) tierra que se rompe al atravesar el suelo; coro + latido en las raíces
    mix.fx(S.shatter("stone", 0.9, 81), s7 + 0.2, -6)
    mix.fx(S.stone(82), s7 + 0.3, -8)
    mix.fx(S.heartbeat(), inv + 0.1, -7)
    mix.fx(S.heartbeat(), inv + 0.9, -9)

    # 8) raíces que crujen + campana suave
    mix.fx(S.cloth(1.2, 91), tl.start(8) + 0.2, -14)
    mix.fx(S.bell(880, 3.0, 2.0, 0.6), tl.word(8, "poor"), -9)

    # 9) golpe cálido + pájaros en 'was rich'
    was = tl.word(9, "was")
    mix.fx(S.boom(110, 55, 0.6, click=False), was, -5)
    mix.fx(S.birds(2.0), was, -12)

    # transiciones
    for i in (2, 3, 4, 5, 9, 11):
        mix.fx(S.whoosh(0.35, i % 2 == 0, 300 + i), tl.start(i) - 0.18, -14)
