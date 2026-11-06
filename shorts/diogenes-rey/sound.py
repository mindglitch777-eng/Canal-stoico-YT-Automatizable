"""
Diseño de sonido de 'diogenes-rey' (sigue `music` y los `sfx` del short.json).
Antiguo griego con tensión: aulós y lira en modo frigio, tambores de guerra, coro de hombres;
silencio en el giro y un drone cálido como un amanecer. El último compás empalma con el cuerno del cuadro 0.
"""
import mix as M
import synth as S

E = 52  # Mi: modo frigio (Mi Fa Sol La Si Do Re)
PHRYG = [E, E + 1, E + 3, E + 5, E + 7, E + 8, E + 10, E + 12]
MOTIF = [0, 1, 0, 3, 4, 3, 1, 0, 5, 4, 3, 1]


def drums(mix: M.Mix, t0: float, t1: float, bpm: float, gain: float = -6) -> None:
    for k, bt in enumerate(M.beat_times(t0, t1, bpm)):
        mix.mus(S.war_drum(k), bt, gain if k % 4 == 0 else gain - 4)
        if k % 2 == 1:
            mix.mus(S.war_drum(k + 50), bt + 30 / bpm, gain - 8)


def aulos_line(mix: M.Mix, t0: float, t1: float, bpm: float, gain: float = -12, octave: int = 0) -> None:
    step = 60 / bpm
    t = t0
    k = 0
    while t < t1 - 0.1:
        n = PHRYG[MOTIF[k % len(MOTIF)]] + 12 * octave
        d = step * (2 if k % 4 == 3 else 1)
        mix.mus(S.aulos(n, min(d * 0.95, t1 - t), k), t, gain, pan=0.2)
        t += d
        k += 1


def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    fps = 30
    move = tl.word(1, "move")
    why_end = tl.word(1, "why", edge="end")
    sun = tl.word(4, "sun")
    twist = tl.start(8)

    # ---------- MÚSICA ----------
    # 1) cuerno de guerra grave + tambores de marcha (llega un ejército); en 'move' se corta en seco
    mix.mus(S.war_horn(2.4, 40), 0.0, -3)
    drums(mix, 0.0, move, 80, -6)
    mix.mus(M.drone([E - 24, E - 17], move + 0.3, 380, 1), 0.0, -12)
    # silencio después de "Why?"
    mix.silence(why_end + 0.02, tl.start(2))
    # 2-3: tambores + aulós + lira
    drums(mix, tl.start(2), tl.start(4), 80, -8)
    aulos_line(mix, tl.start(2), tl.start(4), 80, -13)
    M.arpeggio(mix, tl.start(2), tl.start(4), 80, [E, E + 3, E + 7, E + 8], -15)
    # 4: tensión hasta 'sun' (aulós agudo + drone); el golpe de luz corta la música → solo lira
    mix.mus(M.drone([E - 12, E - 11], sun - tl.start(4) + 0.2, 600, 2), tl.start(4), -10)
    aulos_line(mix, tl.start(4), sun, 80, -14, octave=1)
    M.arpeggio(mix, sun + 0.3, tl.start(7), 66, [E, E + 3, E + 7, E + 10], -13)
    # 6: coro de hombres bajo la segunda cita
    mix.mus(S.choir([E - 12, E - 5, E], tl.end(6) - tl.start(6), "oo"), tl.start(6), -13)
    # 7: tambores a 100 BPM con riser hasta el giro
    drums(mix, tl.start(7), tl.word(7, "power", edge="end") + 0.05, 100, -6)
    mix.mus(S.riser(max(1.0, tl.end(7) - tl.start(7)), 71), tl.start(7), -10)
    p7_end = tl.word(7, "power", edge="end")
    mix.silence(p7_end + 0.02, twist)
    # 8: golpe y drone cálido (amanecer)
    mix.mus(M.sub_hit(), twist, -2)
    mix.mus(M.drone([E - 12 + 5, E - 5 + 5, E + 5], T - twist + 1.2, 520, 3), twist, -9, wrap=True)
    # 9-11: lira + coro que crece; el último compás termina en el cuerno del cuadro 0
    M.arpeggio(mix, tl.start(9), T - 0.2, 84, [E + 5, E + 9, E + 12, E + 16], -12)
    mix.mus(S.choir([E - 7, E, E + 4], T - tl.start(9), "aa"), tl.start(9), -12)
    r11 = T - tl.start(11)
    mix.mus(S.riser(r11, 111), T - r11, -8)

    # ---------- EFECTOS ----------
    mix.fx(S.hooves(2.4), 0.0, -8)
    mix.fx(S.stamp(), move, -2)
    mix.fx(S.time_freeze(), move + 0.05, -6)

    for i in range(2, 12):
        mix.fx(S.whoosh(0.4, i % 2 == 0, 700 + i), tl.start(i) - 0.2, -13)

    # 2) cincel + tambor en 'twenty'; marcha de miles de pasos con el mapa
    tw = tl.word(2, "twenty")
    mix.fx(S.chisel(3, 211), tw, -6)
    mix.fx(S.war_drum(9), tw, -3)
    mix.fx(S.hooves(1.6, 212), tl.word(2, "greece") - 0.4, -12)

    # 3) cerámica hueca; tres tics y un silencio cómico (corto) al terminar la lista
    mix.fx(S.clay_knock(220, 301), tl.word(3, "jar"), -3)
    nothing = tl.word(3, "nothing")
    for k in range(3):
        mix.fx(S.tick(2600), nothing + k * 0.18, -8)

    # 4) golpe de luz en 'sun'
    mix.fx(S.light_burst(), sun - 0.7, -2)

    # 5) risas graves con eco; corte en 'didn't'
    mix.fx(S.laugh(501, 1.6), tl.start(5) + 0.1, -5)
    mix.fx(S.laugh(502, 1.4), tl.start(5) + 0.3, -8, pan=0.4)
    didnt = tl.word(5, "didn't")
    mix.silence(didnt - 0.06, didnt + 0.02)
    mix.fx(M.sub_hit(), didnt, -6)

    # 6) dos golpes de cerámica que encajan; grietas al final
    mix.fx(S.clay_knock(260, 601), tl.start(6) + 0.6 * (tl.end(6) - tl.start(6)), -6)
    mix.fx(S.clay_knock(200, 602), tl.start(6) + 0.6 * (tl.end(6) - tl.start(6)) + 0.12, -6)
    mix.fx(S.ceramic_crack(0.9), tl.end(6) - 0.5, -4)

    # 7) silla que se arrastra + puerta que se cierra
    walk = tl.word(7, "walk")
    mix.fx(S.chair_scrape(0.7), walk - 0.1, -6)
    mix.fx(S.door_close(), walk + 0.7, -6)

    # 8) un corte de metal por eslabón (mismos cuadros que la imagen) + sub-bajo
    less = tl.word(8, "less") - tl.start(8)
    for k in range(6):
        t_cut = tl.start(8) + (round(less * fps) - 6 + k * 3) / fps
        mix.fx(S.metal_cut(800 + k), t_cut, -6)
    mix.fx(M.sub_hit(), tl.start(8) + (round(less * fps) + 9) / fps, -4)

    # 9) metal pesado que cruje (ejército); campana cálida en 'sunlight'
    mix.fx(S.string_tension(1.2) * 0.6, tl.start(9) + 0.3, -12)
    mix.fx(S.bell(784, 2.5, 2.0, 0.8), tl.word(9, "sunlight"), -6)

    # 10) cada regalo rebota contra el escudo de luz y se hace polvo; coro que sube en 'rule'
    for k in range(9):
        mix.fx(S.metal_cut(900 + k) * 0.5, tl.start(10) + (4 + k * 9 + 8) / fps, -14)
    mix.fx(S.choir([E, E + 7, E + 12], 1.6, "aa"), tl.word(10, "rule"), -9)
