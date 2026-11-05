"""
Diseño de sonido de 'millonario-invisible' (sigue `music` y los `sfx` del short.json).
Lounge de lujo con trap suave → tape stop en la revelación → bajo oscuro → lira cálida; el jingle empalma el loop.
"""
import numpy as np

import mix as M
import synth as S

BPM = 96
BEAT = 60 / BPM
SR = S.SR
CHORDS = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]  # Cmaj7 Am7 Fmaj7 G7


def lounge(dur: float) -> np.ndarray:
    """Lounge de lujo con trap suave (mono), de largo `dur`."""
    out = np.zeros(int((dur + 1.5) * SR), dtype=np.float32)

    def put(x: np.ndarray, t: float, g: float) -> None:
        s = int(t * SR)
        e = min(len(out), s + len(x))
        if e > s:
            out[s:e] += x[: e - s] * g

    t = 0.0
    k = 0
    while t < dur:
        bar = k // 4
        if k % 4 == 0:
            put(S.epiano(CHORDS[bar % 4], BEAT * 4), t, 0.35)
            put(S.bass808(CHORDS[bar % 4][0] - 24, BEAT * 1.5), t, 0.5)
        if k % 4 == 2:
            put(S.snare(k), t, 0.3)
        for h in range(4):
            put(S.hat(open_=(h == 2 and k % 2 == 1), seed=k * 4 + h), t + h * BEAT / 4, 0.25)
        if k % 8 == 7:
            put(S.bling(k), t + BEAT / 2, 0.18)
        t += BEAT
        k += 1
    return out[: int(dur * SR)]


def dark_bass(dur: float) -> np.ndarray:
    out = np.zeros(int((dur + 1) * SR), dtype=np.float32)
    t = 0.0
    k = 0
    while t < dur:
        n = [38, 38, 41, 36][(k // 4) % 4]
        if k % 2 == 0:
            s = int(t * SR)
            b = S.bass808(n, BEAT * 1.8) * 0.6
            out[s: s + len(b)] += b[: len(out) - s]
        if k % 4 == 0:
            s = int(t * SR)
            kk = M.kick() * 0.5
            out[s: s + len(kk)] += kk[: len(out) - s]
        t += BEAT
        k += 1
    return out[: int(dur * SR)]


def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    saved = tl.word(3, "saved")
    mil = tl.word(4, "million")
    ford_end = tl.word(6, "ford", edge="end")
    twist = tl.start(7)

    # ---------- MÚSICA ----------
    # 1-3: lounge; en 'nothing saved' toda la música hace tape stop
    lz = lounge(saved + 0.5)
    stop_at = int(saved * SR)
    lz[stop_at: stop_at + int(0.5 * SR)] = S.tape_stop(lz[stop_at: stop_at + int(0.5 * SR)], 0.5)[: len(lz) - stop_at]
    lz[stop_at + int(0.5 * SR):] = 0
    mix.mus(lz, 0, -6)
    # colchón de lujo continuo debajo del lounge (que nunca quede vacío entre acordes)
    mix.mus(M.drone([48, 55, 64, 71], saved + 0.3, 1400, 1), 0, -13)
    # 4-7: bajo oscuro
    mix.mus(dark_bass(ford_end - mil + 0.2), mil, -6)
    mix.mus(dark_bass(tl.end(7) - twist), twist, -6)
    mix.mus(M.drone([38, 45], tl.end(7) - mil + 0.5, 300, 2), mil, -12)
    # 6 → 7: silencio 0,4 s y golpe de sub-bajo
    mix.silence(ford_end + 0.02, twist)
    mix.fx(M.sub_hit(), twist, -2)
    # 8-11: lira cálida + coro
    M.arpeggio(mix, tl.start(8), T - 0.3, 72, [50, 54, 57, 62], -12)
    mix.mus(S.choir([50, 57, 62], T - tl.start(8) + 0.5, "aa"), tl.start(8), -13)
    mix.mus(M.drone([38, 45, 50], T - tl.start(8) + 1.0, 420, 4), tl.start(8), -10, wrap=True)
    # el jingle del concurso arranca al final y sigue en el cuadro 0 (empalma el loop)
    mix.mus(S.jingle(), T - 0.36, -4, wrap=True)

    # ---------- EFECTOS ----------
    # 1) golpe de cuadro 0 + cuenta regresiva de tres golpes + flash de congelado
    mix.fx(M.kick(), 0.0, -4)
    for k, tc in enumerate([0.0, 1.2, 2.4]):
        mix.fx(S.boom(120 - k * 10, 55, 0.4), tc + 0.02, -6)
    mix.fx(S.time_freeze(), tl.word(1, "which", edge="end"), -6)

    for i in range(2, 12):
        mix.fx(S.whoosh(0.4, i % 2 == 0, 300 + i), tl.start(i) - 0.2, -12)

    # 2) 'bling' en cada objeto de lujo; bocina triste + tos de motor en el sedán
    for w in ("sports", "gold", "designer"):
        mix.fx(S.bling(len(w)), tl.word(2, w), -6)
    used = tl.word(2, "used")
    mix.fx(S.sad_horn(), used, -6)
    mix.fx(S.engine_cough(), used + 0.2, -8)

    # 3) zumbido de escáner; chicharra de respuesta incorrecta en 'saved'
    mix.fx(S.scanner(max(0.8, saved - tl.start(3))), tl.start(3), -8)
    mix.fx(S.buzzer(), saved, -3)

    # 4) escáner + cha-ching enorme
    mix.fx(S.scanner(1.0), tl.start(4), -10)
    mix.fx(S.cha_ching(), mil, -1)
    mix.fx(S.coins_cascade(1.4, 30, 401), mil + 0.2, -10)

    # 5) hojas que pasan; tres golpes de sello
    mix.fx(S.page_flip(10), tl.start(5), -8)
    for w in ("3", "4", "600"):
        mix.fx(S.stamp(), tl.word(5, w), -4)

    # 6) motor y derrape; bocina corta + golpe en 'Ford'
    mix.fx(S.engine_drift(1.8), tl.start(6), -5)
    mix.fx(S.car_horn(), tl.word(6, "ford"), -6)
    mix.fx(M.sub_hit(), tl.word(6, "ford"), -4)

    # 7) hilos que se tensan + sub-bajo en 'poor'
    poor = tl.word(7, "poor")
    mix.fx(S.string_tension(0.7), poor - 0.4, -6)
    mix.fx(M.sub_hit(), poor, -3)

    # 8) campana suave y cálida en el brillo del barro
    mix.fx(S.bell(1046, 2.5, 2.0, 0.8), tl.start(8) + 0.3, -10)

    # 9) vidrio que se raja en 'the look'; respiración + pájaros en 'freedom'
    mix.fx(S.shatter("glass", 0.8, 901), tl.word(9, "look"), -8)
    fr = tl.word(9, "freedom")
    mix.fx(S.breath(1.2), fr, -12)
    mix.fx(S.birds(2.0), fr, -12)

    # 10) zumbido suave del escáner + brillo
    mix.fx(S.scanner(max(1.0, tl.end(10) - tl.start(10))) * 0.6, tl.start(10), -14)
    mix.fx(S.bling(9), tl.word(10, "see"), -10)
