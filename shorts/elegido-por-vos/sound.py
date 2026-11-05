"""
Diseño de sonido de 'elegido-por-vos' (sigue `music` y los `sfx` del short.json).
Jingle brillante de publicidad → 'braam' al pasar a plano técnico → suspenso de documental (arpegio que pulsa +
clic de proyector a 100 BPM, 'braam' corto en cada truco) → en el giro la música se rebobina hasta su propio
arranque y vuelve a sonar distorsionada → tres golpes secos → piano calmo → el jingle del cuadro 0 empalma el loop.
"""
import numpy as np

import mix as M
import synth as S

SR = S.SR
BPM = 100
BEAT = 60 / BPM
ARP = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [52, 56, 59, 64]]  # Am F G E


def projector_click(seed: int) -> np.ndarray:
    dur = 0.06
    t = S.t_axis(dur)
    x = S.bp(S.noise(dur, seed), 1200, 6000)[: len(t)] * np.exp(-t * 160)
    return (x + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 90) * 0.3).astype(np.float32)


def pluck(note: float, dur: float) -> np.ndarray:
    t = S.t_axis(dur)
    f = S.midi(note)
    ph = 2 * np.pi * f * t
    x = sum(np.sin(k * ph) / k for k in range(1, 7))
    x = S.lp(x, 2400)[: len(t)]
    return (x * np.exp(-t * 7) * 0.5).astype(np.float32)


def doc_theme(dur: float) -> np.ndarray:
    """Suspenso de documental: arpegio en semicorcheas, bajo y clic de proyector."""
    out = np.zeros(int((dur + 1.5) * SR), dtype=np.float32)

    def put(x: np.ndarray, t: float, g: float) -> None:
        s = int(t * SR)
        e = min(len(out), s + len(x))
        if e > s:
            out[s:e] += x[: e - s] * g

    t = 0.0
    k = 0
    step = BEAT / 4
    while t < dur:
        ch = ARP[(k // 16) % 4]
        put(pluck(ch[k % 4] + (12 if (k // 4) % 2 else 0), step * 2.5), t, 0.45)
        if k % 4 == 0:
            put(projector_click(k), t, 0.8)
            put(pluck(ch[0] - 24, BEAT * 0.9) * 1.4, t, 0.7)
        if k % 2 == 1:
            put(projector_click(k + 1000), t, 0.25)
        t += step
        k += 1
    return out[: int(dur * SR)]


def braam(dur: float = 1.8, root: float = 33) -> np.ndarray:
    t = S.t_axis(dur)
    x = np.zeros_like(t)
    for n in (root, root + 7, root + 12, root + 15):
        ph = 2 * np.pi * S.midi(n) * t
        x += sum(np.sin(k * ph + 0.4 * k) / k for k in range(1, 14))
    x = S.sweep_bp(x, 140, 1600, 1.6)[: len(t)]
    a = np.clip(t / 0.06, 0, 1) * np.exp(-t * 1.3)
    return S.norm(S.soft_clip(x * a, 2.0), 0.9)


def piano(note: float, dur: float = 2.6) -> np.ndarray:
    t = S.t_axis(dur)
    f = S.midi(note)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + 0.15 * np.sin(6 * np.pi * f * t) * np.exp(-t * 5)
    hammer = S.lp(S.noise(dur, int(note)), 2000)[: len(t)] * np.exp(-t * 120) * 0.2
    return ((x * np.exp(-t * 1.8) * (1 - np.exp(-t * 300)) + hammer) * 0.45).astype(np.float32)


def marker() -> np.ndarray:
    """Trazo de marcador sobre el plano."""
    dur = 0.35
    t = S.t_axis(dur)
    x = S.bp(S.noise(dur, 333), 1500, 7000)[: len(t)]
    return (x * np.sin(np.pi * t / dur) ** 0.6 * 0.5).astype(np.float32)


def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    three = tl.word(1, "3")
    why = tl.word(1, "why", edge="end")
    s2, s7, s9 = tl.start(2), tl.start(7), tl.start(9)
    gift_end = tl.word(6, "gift", edge="end")

    # ---------- MÚSICA ----------
    # 1) el jingle brillante suena en el cuadro 0 (empieza al final y empalma); se corta en '3 tricks'
    jg = S.jingle()
    cut = int(max(0.1, three + 0.05) * SR)
    jg = jg.copy()
    jg[cut:] = 0
    mix.mus(jg, 0, -5)
    # colchón brillante debajo del jingle hasta el barrido (que no quede hueco)
    mix.mus(M.drone([60, 64, 67, 72], three + 0.1, 1500, 2), 0, -13)
    for k, bt in enumerate(M.beat_times(0, three, 100)):
        mix.mus(S.hat(seed=k), bt, -14)
    mix.mus(M.drone([45, 52, 57], why - three + 0.2, 500, 3), three, -12)
    # 2-6: suspenso de documental
    theme = doc_theme(gift_end - s2 + 0.3)
    mix.mus(theme, s2 - 0.05, -6)
    mix.mus(M.drone([45, 52], gift_end - s2 + 0.2, 380, 5), s2, -15)
    # 6 → 7: silencio 0,4 s (pause_after) → rebobinado: los primeros 2 s del tema, al revés y a doble velocidad
    mix.silence(gift_end + 0.05, s7)
    head = theme[: int(2.4 * SR)]
    rew = np.interp(np.arange(0, len(head), 2.0), np.arange(len(head)), head[::-1]).astype(np.float32)
    rew = rew * np.linspace(0.3, 1, len(rew)).astype(np.float32)
    mix.mus(rew, s7, -6)
    mix.fx(S.tape_rip(0.35, 9), s7 + len(rew) / SR - 0.1, -10)
    # y el tema vuelve desde el principio, distorsionado (filtrado, saturado, un poco desafinado)
    again = doc_theme(s9 - s7 - len(rew) / SR + 0.2)
    again = S.soft_clip(S.bp(np.interp(np.arange(0, len(again), 0.97), np.arange(len(again)), again).astype(np.float32), 300, 3000) * 2.2, 2.5) * 0.6
    mix.mus(again.astype(np.float32), s7 + len(rew) / SR, -6)
    mix.mus(M.drone([45, 52], s9 - s7, 300, 7), s7, -14)
    # 9-11: piano calmo
    for k, (n, at) in enumerate([(69, 0.0), (64, 0.9), (60, 1.8), (62, 2.7), (64, 3.6), (57, 4.5), (60, 5.4), (64, 6.3), (69, 7.2), (67, 8.1)]):
        if s9 + at < T - 0.6:
            mix.mus(piano(n), s9 + at, -9)
            if k % 2 == 0:
                mix.mus(piano(n - 24, 3.0) * 0.6, s9 + at, -12)
    mix.mus(M.drone([45, 52, 57, 64], T - s9 + 0.3, 700, 11), s9, -15)

    # ---------- EFECTOS ----------
    # 1) pochoclo que explota (cuadro 0), 'braam' + barrido eléctrico en '3 tricks', proyector que se traba en 'Why?'
    for k in range(10):
        mix.fx(S.snap() * 0.5, 0.05 + k * 0.11 + (k % 3) * 0.03, -16, pan=np.sin(k) * 0.5)
    mix.fx(braam(2.0), three, -2)
    mix.fx(S.glitch(0.5, 11), three, -8)
    mix.fx(S.whoosh(0.5, True, 12), three - 0.1, -8)
    for k in range(5):
        mix.fx(projector_click(50 + k), why - 0.05 + k * 0.05, -4)
    mix.fx(S.tape_stop(S.noise(0.4, 13) * 0.2, 0.4), why, -12)

    # 2) neón que se enciende con zumbido en cada precio
    for w in ("small", "large", "medium"):
        at = tl.word(2, w, edge="end")
        tt = S.t_axis(0.6)
        hum = (np.sin(2 * np.pi * 120 * tt) * 0.5 + np.sin(2 * np.pi * 240 * tt) * 0.3) * np.exp(-tt * 3)
        mix.fx(hum.astype(np.float32), at, -14)
        mix.fx(S.glitch(0.12, len(w)), at, -12)
    mix.fx(S.bling(2), tl.word(2, "medium", edge="end") + 0.25, -10)

    # 3) escáner + carrete de pesca (cómico) en el anzuelo + braam corto
    mix.fx(S.scanner(1.2), tl.start(3), -10)
    reel = np.concatenate([projector_click(200 + k) * 0.6 for k in range(14)] + [np.zeros(100, dtype=np.float32)])
    mix.fx(reel, tl.start(3) + 1.3, -8)
    mix.fx(braam(1.2, 31), tl.word(3, "cheap"), -6)

    # 4) pasos de muchos + golpe seco y braam corto en '84%'
    for k, bt in enumerate(M.beat_times(tl.start(4), tl.end(4) - 0.3, 260)):
        mix.fx(S.wet_thud() * 0.3, bt, -20, pan=np.sin(k * 2.1) * 0.6)
    pct = tl.word(4, "84%")
    mix.fx(M.sub_hit(), pct, -3)
    mix.fx(S.stamp(), pct, -6)
    mix.fx(braam(1.0, 34), pct, -8)

    # 5) barrido agudo del láser + 'pop' chiquito del .99
    mix.fx(S.chirp(1200, 4200, 0.7) * 0.25, tl.start(5) + 0.2, -10)
    mix.fx(S.snap(), tl.word(5, "reads"), -8)
    mix.fx(braam(0.9, 36), tl.word(5, "4"), -10)

    # 6) golpe metálico enorme + piso que se raja; campanitas de regalo
    was = tl.word(6, "was")
    mix.fx(S.metal_cut(61), was + 10 / 30, -3)
    mix.fx(S.boom(70, 28, 1.2), was + 10 / 30, -2)
    mix.fx(S.shatter("stone", 0.9, 62), was + 10 / 30 + 0.05, -8)
    for k in range(4):
        mix.fx(S.ding(2400 + k * 300, 0.4), tl.word(6, "now") + k * 0.12, -12)

    # 8) tres golpes secos + trazo de marcador, uno por cada truco del video
    for w in ("question", "three", "lit"):
        at = tl.word(8, w)
        mix.fx(M.kick(), at, -2)
        mix.fx(S.stamp(), at, -6)
        mix.fx(marker(), at + 0.05, -8)

    # 9) arena que se frena
    mix.fx(S.sand(1.2, 91), s9, -12)
    mix.fx(S.time_freeze(), s9 + (tl.end(9) - s9) * 0.35, -9)
    # 10) cuerdas que se sueltan
    mix.fx(S.string_tension(0.6)[::-1].copy(), tl.word(10, "now"), -8)
    mix.fx(S.cloth(0.6, 101), tl.word(10, "tricks"), -10)

    for i in (2, 3, 4, 5, 6, 8, 10, 11):
        mix.fx(S.whoosh(0.35, i % 2 == 0, 400 + i), tl.start(i) - 0.18, -15)
