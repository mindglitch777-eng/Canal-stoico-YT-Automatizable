"""
Diseño de sonido de 'marco-aurelio-chatarra' (sigue `music` y los `sfx` de cada escena del short.json).
Lo corre tools/sfx/mix.py con los tiempos reales de la voz.
"""
import mix as M
import synth as S

D = 50  # Re (D3) en MIDI
DMINOR = [D, D + 3, D + 7, D + 10]  # D-F-A-C


def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    BPM = 72
    t_twist_cut = tl.word(8, "hypnotized", edge="end")  # 'hypnotized' termina
    t_drop = t_twist_cut + 0.4  # 0,4 s de silencio total y cae el doble tiempo

    # ---------- MÚSICA ----------
    # Escena 1: golpe de entrada en 'How?' + lira aguda que queda sonando
    t_how = tl.word(1, "how")
    mix.mus(M.sub_hit(), t_how, -2)
    mix.mus(S.reverb(S.lyre_note(D + 24, 2.5), 0.4, 2.0), t_how, -8)

    # Escenas 2-7: drone en Re y latido a 72 BPM
    a, b = t_how, t_twist_cut  # arranca en 'How?' para que no quede un hueco muerto
    mix.mus(M.drone([D - 24, D - 17, D - 12], b - a + 0.6, 420), a, -6)
    for k, bt in enumerate(M.beat_times(a, tl.start(7), BPM)):
        mix.mus(S.heartbeat(), bt, -7 if k % 2 else -5)

    # Escenas 4-6: arpegio de lira en corcheas; sube un tono en la 6
    M.arpeggio(mix, tl.start(4), tl.start(6), BPM, DMINOR, -12)
    M.arpeggio(mix, tl.start(6), tl.start(7), BPM, [n + 2 for n in DMINOR], -11)

    # Escena 7: riser de ~3 s que acelera como la cinta (termina en el giro)
    r_len = max(1.5, tl.start(8) - tl.start(7) + 0.4)
    mix.mus(S.riser(r_len, 5), tl.start(7), -7)
    mix.fx(S.motor_rise(r_len), tl.start(7), -12)

    # Escena 8: silencio total y caída en doble tiempo
    mix.silence(t_twist_cut, t_drop)
    quote_start = tl.start(10)
    dt_end = quote_start
    mix.mus(M.drone([D - 24, D - 12, D - 5], dt_end - t_drop + 0.5, 700, 2), t_drop, -5)
    for k, bt in enumerate(M.beat_times(t_drop, dt_end, BPM * 2)):
        mix.mus(M.kick(), bt, -6 if k % 2 else -3)
    mix.mus(M.sub_hit(), t_drop, 0)
    M.arpeggio(mix, t_drop, dt_end, BPM * 2, DMINOR, -13, octave=-1)

    # Escena 10 (cita): todo baja a drone + coro sintético
    q_len = tl.end(10) - quote_start
    mix.mus(M.drone([D - 24, D - 12], q_len + 0.5, 300, 3), quote_start, -6)
    mix.mus(S.choir([D, D + 7, D + 12], q_len + 0.3, "aa"), quote_start, -9)

    # Escena 11: riser que NO resuelve: corta justo en el final (lo resuelve el golpe del cuadro 0)
    r2 = T - tl.start(11)
    mix.mus(S.riser(r2, 9), T - r2, -6)
    mix.mus(M.drone([D - 24, D - 17], r2, 500, 4), tl.start(11), -8)

    # ---------- EFECTOS (sfx de cada escena) ----------
    # 1) cuadro 0: tic-tac + sub-bajo
    mix.fx(M.kick(), 0.0, -3)
    for k in range(int(tl.word(1, "scrap") / 0.5) + 1):
        mix.fx(S.tick(3800 if k % 2 else 3200), k * 0.5, -10)
    # 'scrap': estallido metálico con reverb invertida que lo anticipa
    t_scrap = tl.word(1, "scrap")
    pre = S.reverb(S.shatter("metal", 0.6, 3), 0.9, 1.0)[::-1].copy()
    mix.fx(pre, t_scrap - len(pre) / S.SR, -10)
    mix.fx(S.shatter("metal", 1.6, 7), t_scrap, -2)
    mix.fx(S.shatter("glass", 1.2, 8), t_scrap + 0.03, -6, 0.3)
    # 'How?': parada de tiempo
    mix.fx(S.time_freeze(), t_how - 0.05, -3)

    # 2) piedra que encaja + viento; contador con tics que aceleran; sello al frenar
    mix.fx(S.stone(), tl.start(2), -3)
    mix.fx(S.wind(1.6), tl.start(2), -10)
    t50 = tl.word(2, "50")
    mix.fx(S.ticks_accel(max(0.6, t50 - tl.start(2) - 0.2)), tl.start(2) + 0.2, -9)
    mix.fx(S.stamp(), tl.word(2, "million"), -2)

    # 3) cascada de monedas (riqueza); 'Instead' → silencio + vela; pluma que raspa
    mix.fx(S.coins_cascade(1.4), tl.start(3) + 0.05, -6)
    t_instead = tl.word(3, "instead")
    mix.silence(t_instead - 0.12, t_instead + 0.05)
    mix.fx(S.candle(), t_instead + 0.05, -6)
    mix.fx(S.pen_scratch(1.6), tl.word(3, "wrote"), -12)

    # 4) 'Dead fish': golpe húmedo + scratch; 'grape juice': gotas que bajan
    mix.fx(S.wet_thud(), tl.word(4, "dead"), -2)
    mix.fx(S.record_scratch(), tl.word(4, "dead") + 0.04, -8)
    mix.fx(S.drip_down(), tl.word(4, "grape"), -6)

    # 5) whoosh de tela; balido; gota con eco
    mix.fx(S.cloth(0.8), tl.start(5), -6)
    mix.fx(S.bleat(), tl.word(5, "sheep's"), -8, -0.3)
    mix.fx(S.drop_echo(), tl.word(5, "blood"), -5)

    # 6) notificación; clics del desarme; papel + sello de 'aprobado'
    mix.fx(S.notify(), tl.word(6, "phone"), -8)
    mix.fx(S.clicks(7, 0.06), tl.word(6, "glass"), -6)
    mix.fx(S.paper_unfold(1.1), tl.word(6, "payment"), -8)
    mix.fx(S.stamp(), tl.word(6, "plan"), -3)

    # 7) cada compra que se apaga: 'wah' que cae
    for w in ("upgrade", "fades", "normal"):
        mix.fx(S.wah_down(), tl.word(7, w), -9)

    # 8) espiral: trémolo; chasquido → silencio → vidrio que estalla
    sp_len = t_twist_cut - tl.start(8)
    trem = M.drone([D + 12, D + 19], sp_len, 1800, 5)
    tt = S.t_axis(sp_len)
    trem = trem * (0.55 + 0.45 * __import__("numpy").sin(2 * 3.14159 * 6 * tt)).astype("float32")
    mix.fx(trem, tl.start(8), -14)
    mix.fx(S.snap(), t_twist_cut - 0.03, 0)
    mix.fx(S.shatter("glass", 1.6, 21), t_drop, -1)

    # 9) cada etiqueta que se arranca: cinta + sub-bajo
    # el tirón cae cuando se revela lo de abajo: 'label', 'Metal', 'Steel'
    for w in ("label", "metal", "steel"):
        t = tl.word(9, w)
        mix.fx(S.tape_rip(0.32), t - 0.05, -3)
        mix.fx(M.sub_hit(), t, -4)

    # 10) cincel con chispas durante el grabado; gong al final de la cita
    t_out = tl.word(10, "outward")
    mix.fx(S.chisel(10), t_out, -13)
    mix.fx(S.gong(65, 4.0), tl.word(10, "reason", edge="end"), -4)

    # 11) piezas que encajan en reversa
    rev = S.clicks(9, 0.05, 301)[::-1].copy()
    mix.fx(rev, tl.word(11, "bare"), -6)
    mix.fx(S.whoosh(0.8, False, 303)[::-1].copy(), T - 0.8, -8)
