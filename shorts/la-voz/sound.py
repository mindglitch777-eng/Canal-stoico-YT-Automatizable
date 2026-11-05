"""
Diseño de sonido de 'la-voz' (sigue `music` y los `sfx` del short.json).
Jazz noir a 84 BPM (contrabajo que camina, escobillas, trompeta con sordina) sobre lluvia continua.
Cada "you deserve it" de la voz se dobla con un susurro: la misma voz filtrada, con aire, reverb y una
segunda copia apenas desafinada. En el giro se cae todo: lluvia y el susurro de su propia voz.
"""
import shutil
import subprocess
from pathlib import Path

import numpy as np

import mix as M
import synth as S

SR = S.SR
BPM = 84
BEAT = 60 / BPM
REPO = Path(__file__).resolve().parents[2]
# Dm7 - G7 - Cm7 - A7 (ii-V menor, oscuro)
ROOTS = [38, 43, 36, 45]
WALK = [[38, 41, 45, 44], [43, 47, 50, 49], [36, 39, 43, 44], [45, 49, 52, 37]]


# ---------------- instrumentos ----------------
def rain(dur: float, seed: int = 5) -> np.ndarray:
    """Lluvia: ruido rosa filtrado + gotas sueltas. Se usa con wrap para que empalme."""
    n = S.noise(dur, seed)
    body = S.bp(n, 600, 7000) * 0.5 + S.lp(n, 400) * 0.3
    rng = np.random.default_rng(seed)
    drops = np.zeros_like(body)
    for _ in range(int(dur * 40)):
        p = rng.integers(0, len(drops) - 2000)
        L = 600
        drops[p:p + L] += np.sin(np.arange(L) * 2 * np.pi * rng.uniform(2000, 5000) / SR) * np.exp(-np.arange(L) / 80) * rng.uniform(0.1, 0.4)
    return (body + drops).astype(np.float32)


def upright(note: float, dur: float) -> np.ndarray:
    t = S.t_axis(dur)
    f = S.midi(note)
    x = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.18 * np.sin(6 * np.pi * f * t)
    pluck = np.exp(-t * 5.0) * (1 - np.exp(-t * 400))
    thump = S.lp(S.noise(dur, int(note)), 300)[: len(t)] * np.exp(-t * 40) * 0.8
    return (S.soft_clip(x * pluck * 1.2, 1.3) + thump).astype(np.float32) * 0.8


def brush(seed: int, swish: bool = False) -> np.ndarray:
    dur = 0.35 if swish else 0.12
    t = S.t_axis(dur)
    n = S.bp(S.noise(dur, seed), 2500, 9000)[: len(S.t_axis(dur))]
    e = np.sin(np.pi * t / dur) if swish else np.exp(-t * 35)
    return (n * e * (0.5 if swish else 0.8)).astype(np.float32)


def ride_brush(seed: int) -> np.ndarray:
    """Platillo con escobilla (golpe de cada compra)."""
    dur = 1.6
    t = S.t_axis(dur)
    n = S.hp(S.noise(dur, seed), 4000)[: len(t)]
    shimmer = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4270, 5530)) * 0.05
    return ((n * 0.6 + shimmer) * np.exp(-t * 2.5)).astype(np.float32)


def trumpet(note: float, dur: float) -> np.ndarray:
    """Trompeta con sordina harmon: diente de sierra suave, vibrato tardío, filtro nasal."""
    t = S.t_axis(dur)
    f = S.midi(note) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1))
    ph = np.cumsum(2 * np.pi * f / SR)
    x = sum(np.sin(k * ph) / k for k in range(1, 9))
    x = S.bp(x, 900, 3200)
    a = np.clip(t / 0.08, 0, 1) * np.clip((dur - t) / 0.25, 0, 1)
    return (x * a * 0.6).astype(np.float32)


def strings(notes: list[float], dur: float) -> np.ndarray:
    t = S.t_axis(dur)
    x = np.zeros_like(t)
    for k, n in enumerate(notes):
        for d in (-0.08, 0.0, 0.08):
            f = S.midi(n + d)
            ph = np.cumsum(2 * np.pi * f * (1 + 0.003 * np.sin(2 * np.pi * (4.7 + k * 0.3) * t)) / SR)
            x += sum(np.sin(j * ph) / j for j in range(1, 6))
    x = S.lp(x, 1800)
    a = np.clip(t / 0.6, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return S.norm(x * a, 0.6).astype(np.float32)


def noir_band(t0: float, t1: float, double: bool = False, seed: int = 0) -> np.ndarray:
    """Contrabajo caminando + escobillas desde t0 hasta t1 (mono). `double`: el doble de ritmo."""
    dur = t1 - t0
    out = np.zeros(int((dur + 2) * SR), dtype=np.float32)

    def put(x: np.ndarray, t: float, g: float) -> None:
        s = int(t * SR)
        e = min(len(out), s + len(x))
        if e > s and s >= 0:
            out[s:e] += x[: e - s] * g

    step = BEAT / (2 if double else 1)
    k = 0
    t = 0.0
    while t < dur:
        bar = (k // 4) % 4
        put(upright(WALK[bar][k % 4], step * 0.95), t, 0.9)
        put(brush(seed + k * 3, swish=(k % 2 == 0)), t, 0.35)
        if k % 2 == 1:
            put(brush(seed + k * 3 + 1), t, 0.45)  # el 2 y el 4
        put(brush(seed + k * 3 + 2), t + step * 0.66, 0.18)  # swing
        t += step
        k += 1
    return out[: int(dur * SR)]


# ---------------- el susurro hecho con la voz real ----------------
def load_voice(scene: dict) -> np.ndarray | None:
    rel = scene.get("audio")
    if not rel or not shutil.which("ffmpeg"):
        return None
    p = REPO / rel
    if not p.exists():
        return None
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


def phrase_span(scene: dict, words: list[str], occ: int = 1) -> tuple[float, float] | None:
    """Inicio y fin (relativos a la escena) de la `occ`-ésima aparición seguida de `words`."""
    ws = [M._norm(w["text"]) for w in scene["words"]]
    target = [M._norm(w) for w in words]
    n = 0
    for i in range(len(ws) - len(target) + 1):
        if ws[i:i + len(target)] == target:
            n += 1
            if n == occ:
                return scene["words"][i]["start"], scene["words"][i + len(target) - 1]["end"]
    return None


def whisperize(x: np.ndarray, seed: int) -> np.ndarray:
    """Convierte voz en susurro: se queda con el aire (agudos), el envolvente modula ruido, reverb y una copia desafinada."""
    env = S.lp(np.abs(x), 30)
    env = env / (env.max() + 1e-9)
    nz = S.bp(S.noise(len(x) / SR + 0.01, seed), 1800, 7500)[: len(x)]
    breath = nz * env
    airy = S.hp(x, 1500) * 0.9
    w = airy + breath * 0.8
    # copia desafinada (+3 %) y corrida 18 ms: suena como dos bocas
    idx = np.arange(0, len(w), 1.03)
    up = np.interp(idx, np.arange(len(w)), w).astype(np.float32)
    dbl = np.zeros(len(w) + int(0.018 * SR), dtype=np.float32)
    dbl[: len(w)] += w
    dbl[int(0.018 * SR): int(0.018 * SR) + len(up)] += up[: len(dbl) - int(0.018 * SR)] * 0.8
    wet = S.reverb(S.pad(dbl, 1.6), 0.55, 2.4, seed)
    return S.norm(wet, 0.8)


def whisper(tl: M.Timeline, i: int, words: list[str], occ: int = 1, seed: int = 0) -> tuple[np.ndarray, float] | None:
    sc = tl.scenes[i - 1]
    v = load_voice(sc)
    sp = phrase_span(sc, words, occ)
    if v is None or sp is None:
        return None
    a, b = int(max(0, sp[0] - 0.02) * SR), int((sp[1] + 0.06) * SR)
    seg = v[a:b]
    if len(seg) < 200:
        return None
    return whisperize(seg, seed), tl.start(i) + sp[0] - 0.02


# ---------------- diseño ----------------
def design(tl: M.Timeline, mix: M.Mix) -> None:
    T = tl.total
    why = tl.word(1, "why", edge="end")
    s2 = tl.start(2)
    s6, s7 = tl.start(6), tl.start(7)
    sales_end = tl.word(6, "sales", edge="end")
    s9 = tl.start(9)
    not_ = tl.word(9, "not")

    # ---------- MÚSICA ----------
    # lluvia continua, todo el video (con wrap: empalma el loop)
    mix.mus(rain(T + 0.5), 0, -15, wrap=True)
    # 1: arranca el contrabajo solo; corte en 'Why?' (silencio de la pausa)
    mix.mus(noir_band(0, why, seed=1), 0, -5)
    # colchón grave para que no queden huecos entre notas del contrabajo
    mix.mus(M.drone([38, 45, 48], s7 - 0.3 + 0.3, 380, 3), 0, -15)
    # 2-5: jazz noir completo
    mix.mus(noir_band(s2, s6, seed=11), s2, -5)
    for k, bt in enumerate(M.beat_times(s2 + BEAT * 2, s6 - 0.5, BPM / 4)):
        mix.mus(trumpet([62, 65, 60, 57][k % 4] + 12, BEAT * 2.6), bt, -14)
    # 6: persecución al doble
    mix.mus(noir_band(s6, sales_end + 0.05, double=True, seed=21), s6, -4)
    # 6 → 7: silencio 0,4 s; en el giro solo lluvia y susurro
    mix.silence(sales_end + 0.05, s7)
    # 8: la cita: notas de piano como gotas (las agrega la sección de efectos); colchón tenue
    mix.mus(M.drone([38, 45], tl.end(8) - tl.start(8) + 0.4, 300, 5), tl.start(8), -16)
    # 9-10: cuerdas graves cálidas desde 'not today'
    mix.mus(strings([38, 45, 50, 53], tl.end(10) - not_ + 0.8), not_, -9)
    # 11: vuelven el contrabajo y la lluvia del cuadro 0; el contrabajo sigue en el cuadro 0
    mix.mus(noir_band(tl.start(11), T + 0.6, seed=1), tl.start(11), -6, wrap=True)
    mix.mus(strings([38, 45, 50], tl.start(11) - tl.start(10) + 0.4), tl.start(10), -13)

    # ---------- EFECTOS ----------
    # 1) susurro ininteligible del cuadro 0 (el "you deserve it" de la escena 2, al revés) + trueno en 'Why?'
    w = whisper(tl, 2, ["you", "deserve", "it"], 1, seed=3)
    if w:
        mix.fx(w[0][::-1].copy(), 0.15, -10)
    mix.fx(S.boom(70, 28, 1.6), why - 0.02, -3)
    rumble = S.lp(S.noise(2.4, 12), 180)
    mix.fx((rumble * np.exp(-S.t_axis(2.4)[: len(rumble)] * 1.6)).astype(np.float32), why, -4)

    # 2) el susurro rojo doblado
    w = whisper(tl, 2, ["you", "deserve", "it"], 1, seed=5)
    if w:
        mix.fx(w[0], w[1], -4, pan=-0.3)
        mix.fx(w[0], w[1] + 0.25, -14, pan=0.4)  # eco del susurro del otro lado

    # 3) clic exagerado; caja registradora + viento en 'gone'
    mix.fx(S.snap(), tl.word(3, "click"), 0)
    mix.fx(M.sub_hit(), tl.word(3, "click"), -6)
    gone = tl.word(3, "gone")
    mix.fx(S.cha_ching(), gone - 0.1, -4)
    mix.fx(S.wind(1.4, 31), gone, -8)

    # 4) cada 'you deserve it' (3): susurro + platillo con escobilla; bolsas de papel que caen
    for occ in (1, 2, 3):
        w = whisper(tl, 4, ["deserve", "it"], occ, seed=40 + occ)
        if w:
            mix.fx(w[0], w[1], -5, pan=[-0.4, 0.4, 0][occ - 1])
    for wd in ("friday", "payday", "breakup"):
        mix.fx(ride_brush(len(wd)), tl.word(4, wd), -7)
    t = tl.word(4, "friday") + 0.3
    k = 0
    while t < tl.end(4):
        mix.fx(S.cloth(0.25, 400 + k), t, -14 + min(6, k * 0.4), pan=np.sin(k) * 0.5)
        mix.fx(S.paper_unfold(0.3, 500 + k), t, -18 + min(6, k * 0.4), pan=-np.sin(k) * 0.5)
        t += max(0.09, 0.4 - k * 0.025)
        k += 1

    # 5) neón que se enciende (zumbido) + golpe grave en el número
    n5 = tl.word(5, "8,000")
    hum_t = S.t_axis(2.4)
    hum = (np.sin(2 * np.pi * 120 * hum_t) * 0.5 + np.sin(2 * np.pi * 240 * hum_t) * 0.3) * np.clip(hum_t / 0.05, 0, 1) * np.exp(-hum_t * 0.4)
    flick = (np.random.default_rng(55).random(len(hum_t)) > 0.002).astype(np.float32)
    mix.fx((hum * flick).astype(np.float32), tl.start(5) + 0.12, -14)
    mix.fx(S.glitch(0.2, 56), tl.start(5) + 0.12, -12)
    mix.fx(S.boom(60, 30, 0.9), n5, -4)

    # 6) pasos sobre agua (al doble) + susurro de cada fuente
    for k, bt in enumerate(M.beat_times(s6, sales_end - 0.1, BPM * 2)):
        mix.fx(S.wet_thud(), bt, -16, pan=(-0.2 if k % 2 else 0.2))
        sp = S.bp(S.noise(0.12, 600 + k), 1500, 6000)
        mix.fx((sp * np.exp(-np.arange(len(sp)) / SR * 40)).astype(np.float32), bt, -14)
    for wd in ("ads", "apps", "midnight"):
        mix.fx(S.whoosh(0.35, True, 610 + len(wd)), tl.word(6, wd) - 0.15, -10)

    # 7) EL GIRO: el susurro de SU voz ('sounds like you'), muy al frente, doblado; gota que cae
    w = whisper(tl, 7, ["sounds", "like", "you"], 1, seed=71)
    if w:
        mix.fx(w[0], w[1], -2)
        mix.fx(w[0], w[1] + 0.12, -9, pan=-0.6)
        mix.fx(w[0], w[1] + 0.24, -12, pan=0.6)
    mix.fx(S.drop_echo(), tl.start(7) + (tl.end(7) - tl.start(7)) * 0.82, -6)
    mix.fx(S.heartbeat(), s7 + 0.05, -10)

    # 8) cada palabra de la cita: una gota que suena como nota de piano
    sc8 = tl.scenes[7]
    notes = [74, 77, 81, 79, 77, 74, 72, 74, 69, 74]
    started = False
    k = 0
    for wd in sc8["words"]:
        if M._norm(wd["text"]).startswith("live"):
            started = True
        if started:
            mix.fx(S.bell(S.midi(notes[k % len(notes)]), 1.6, 1.0, 0.6) * 0.8, tl.start(8) + wd["start"], -13, pan=np.sin(k) * 0.4)
            k += 1
    mix.fx(S.choir([50, 57, 62], 1.2, "aa"), tl.end(8) - 0.5, -14)

    # 9) 'not today': golpe grave + vidrio que estalla; antes, su susurro rojo por última vez
    w = whisper(tl, 9, ["you", "deserve", "it"], 1, seed=91)
    if w:
        mix.fx(w[0], w[1], -6, pan=-0.5)
    mix.fx(M.sub_hit(), not_, -1)
    mix.fx(S.boom(90, 30, 1.0), not_, -4)
    mix.fx(S.shatter("glass", 1.2, 92), not_ + 0.25, -5)

    # 10) viento al revés + caja registradora invertida (los billetes vuelven)
    mix.fx(S.wind(1.4, 101)[::-1].copy(), tl.start(10) + 0.1, -9)
    mix.fx(S.cha_ching()[::-1].copy(), tl.start(10) + 0.4, -8)
    mix.fx(S.bell(1046, 2.0, 2.0, 0.8), tl.word(10, "worth"), -12)

    # 11) 'someone whispers...': susurro que empalma con el del cuadro 0
    w = whisper(tl, 11, ["someone", "whispers"], 1, seed=111)
    if w:
        mix.fx(w[0], w[1], -6, wrap=True)
    for i in range(2, 12):
        if i not in (7,):
            mix.fx(S.whoosh(0.35, i % 2 == 0, 700 + i), tl.start(i) - 0.18, -15)
