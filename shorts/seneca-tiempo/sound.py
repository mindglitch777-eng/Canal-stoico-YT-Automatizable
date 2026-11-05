"""
Diseño de sonido de 'seneca-tiempo' (sigue `music` y los `sfx` de cada escena del short.json).
La música está hecha con tics de reloj: aceleran de 90 a 128 BPM; en el giro se paran todos.
"""
import numpy as np

import mix as M
import synth as S

A = 45  # La grave (frío); el coro cálido va en Re mayor


def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    fps = 30
    free_end = tl.word(7, "free", edge="end")
    stop = free_end  # se paran todos los relojes
    resume = stop + 0.4

    # ---------- MÚSICA: tics que aceleran (escenas 1-7) ----------
    t_accel_end = tl.start(6)
    t = 0.0
    k = 0
    while t < stop - 0.01:
        if t < t_accel_end:
            bpm = 90 + (128 - 90) * (t / t_accel_end)
        else:
            bpm = 128
        if tl.start(6) <= t < tl.start(7):
            # la cita: baja todo, solo drone y voz (tic muy suave)
            if k % 4 == 0:
                mix.mus(S.tick(2600), t, -22)
        else:
            mix.mus(S.tick(3800 if k % 2 else 3000), t, -9 if k % 2 == 0 else -13)
            if k % 4 == 0:
                mix.mus(M.kick(), t, -10)
            if k % 8 == 4:
                mix.mus(S.glitch(0.12, 1000 + k), t, -16)
        t += 60 / bpm / 2
        k += 1
    # riser constante en 2-5
    mix.mus(S.riser(max(1.0, tl.start(6) - tl.start(2)), 3), tl.start(2), -14)
    # sintetizador frío de fondo (1-5 y 7)
    mix.mus(M.drone([A - 12, A - 5, A + 3], tl.start(6) + 0.6, 900, 1), 0, -16)
    mix.mus(M.drone([A - 12, A + 3], stop - tl.start(7) + 0.3, 900, 2), tl.start(7), -15)
    # escena 6: drone cálido bajo la cita
    mix.mus(M.drone([50 - 12, 50 - 5], tl.end(6) - tl.start(6) + 0.4, 420, 3), tl.start(6), -9)

    # giro: silencio total 0,4 s → latido grave; escenas 8-10: latido + coro cálido + tic suave
    mix.silence(stop, resume)
    beat = 60 / 64
    bt = resume
    while bt < T - 0.05:
        mix.mus(S.heartbeat(), bt, -6)
        bt += beat
    mix.mus(S.choir([50, 54, 57], tl.end(9) - tl.start(8), "oo"), tl.start(8), -12)
    mix.mus(S.choir([50, 57, 62], T - tl.start(9) + 1.0, "aa"), tl.start(9), -11, wrap=True)
    # el tic vuelve en la escena 10 y el último cae justo en el cuadro 0
    for j in range(1, 14):
        tk = T - j * 0.5
        if tk < tl.start(10):
            break
        mix.mus(S.tick(3000), tk, -14)

    # ---------- EFECTOS ----------
    # 1) cuadro 0: tic seco + latigazo del billete; billetera que se cierra; succión digital en '3 hours'
    mix.fx(S.tick(3800), 0.0, -6)
    mix.fx(S.whoosh(0.3, True, 11), 0.0, -9)
    mix.fx(M.sub_hit(), tl.word(1, "100"), -4)
    mix.fx(S.wallet_snap(), 0.42, -4)
    t3 = tl.word(1, "3")
    mix.fx(S.suction(1.0), t3 - 0.1, -5)
    mix.fx(S.glitch(0.35, 21), t3, -8)

    # transiciones
    for i in range(2, 11):
        mix.fx(S.whoosh(0.4, i % 2 == 0, 40 + i), tl.start(i) - 0.2, -12)

    # 2) glitch en el número
    mix.fx(S.glitch(0.25, 22), tl.word(2, "3"), -9)

    # 3) un 'ding' por cada notificación, cada vez más rápido (mismos tiempos que la imagen)
    dur3 = round((tl.end(3) - tl.start(3)) * fps)
    for kk in range(34):
        at = round(2 + (kk / 34) ** 0.8 * (dur3 * 0.8))
        mix.fx(S.ding(1500 + (kk % 5) * 180), tl.start(3) + at / fps, -12 + min(4, kk * 0.15))
    mix.fx(S.glitch(0.3, 23), tl.word(3, "186"), -6)
    mix.fx(M.sub_hit(), tl.word(3, "186"), -5)

    # 4) un sello seco por cada día que se pone negro; fuego + sub-bajo en 'Gone'
    gone = tl.word(4, "gone")
    for j in range(45):
        mix.fx(S.tick(1400), tl.start(4) + 2 / fps + j * (gone - tl.start(4) - 4 / fps) / 45, -15)
    mix.fx(S.fire_ignite(1.8), gone, -3)
    mix.fx(M.sub_hit(), gone, -3)

    # 5) glitch en el '6'; swoosh de scroll exagerado + tic que se corta
    mix.fx(S.glitch(0.3, 25), tl.word(5, "6"), -8)
    sc = tl.word(5, "scrolled")
    mix.fx(S.whoosh(0.7, False, 55), sc - 0.1, -3)
    mix.fx(S.tick(3800), sc + 0.5, -10)

    # 6) pluma que raspa + monedas apretadas
    mix.fx(S.pen_scratch(2.4), tl.word(6, "no"), -14)
    for j in range(3):
        mix.fx(S.coin(j), tl.start(6) + 0.6 + j * 1.1, -16)

    # 7) en 'free': se detienen todos los tics (corte) — el silencio lo hace mix.silence
    mix.fx(S.time_freeze(), stop - 0.12, -6)

    # 8) monedas que rebotan contra el vidrio; arena que cae en 'three hours'
    for j in range(8):
        mix.fx(S.glass_coin(j), tl.start(8) + 0.4 + j * 0.3, -11)
    mix.fx(S.sand(1.8, 81), tl.word(8, "three"), -8)

    # 9) clic del celular que se apaga + arena al revés + (el coro ya está)
    off = tl.start(9) + 0.18 * (tl.end(9) - tl.start(9))
    mix.fx(S.clicks(1, 0.05, 91), off, -4)
    mix.fx(S.sand(2.2, 92, reverse=True), off + 0.15, -8)

    # 10) el tic final ya está en la música; un whoosh suave en el morph al cuadro 0
    mix.fx(S.whoosh(0.5, True, 101), T - 0.6, -12)
