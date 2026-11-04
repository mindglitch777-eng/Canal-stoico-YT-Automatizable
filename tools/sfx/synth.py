"""
synth.py — Paleta de sonidos de Calm Fortune, generados por código (prompts/sonido.md).

Todo es determinístico: cada sonido usa su propia semilla, así el mismo video suena igual
en cada render. Cada función devuelve un array mono float32 a SR muestras por segundo.
Son nuestros: no hay licencias de terceros.
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000


# ---------- utilidades ----------

def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def noise(dur: float, seed: int) -> np.ndarray:
    return np.random.default_rng(seed).standard_normal(int(dur * SR)).astype(np.float32)


def env(n: int, attack: float, decay: float, curve: float = 4.0) -> np.ndarray:
    """Ataque lineal + caída exponencial (en segundos)."""
    a = max(1, int(attack * SR))
    e = np.ones(n, dtype=np.float32)
    e[: min(a, n)] = np.linspace(0, 1, min(a, n))
    if n > a:
        tt = np.arange(n - a) / SR
        e[a:] = np.exp(-curve * tt / max(decay, 1e-3))
    return e


def bell_env(n: int) -> np.ndarray:
    return np.hanning(n).astype(np.float32)


def bp(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    sos = butter(order, [max(20, lo), min(SR / 2 - 100, hi)], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x).astype(np.float32)


def lp(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, min(f, SR / 2 - 100), btype="low", fs=SR, output="sos"), x).astype(np.float32)


def hp(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, max(20, f), btype="high", fs=SR, output="sos"), x).astype(np.float32)


def sweep_bp(x: np.ndarray, f0: float, f1: float, q: float = 2.0, blocks: int = 64) -> np.ndarray:
    """Pasabanda que barre de f0 a f1 (por bloques, suficiente para whooshes)."""
    out = np.zeros_like(x)
    edges = np.linspace(0, len(x), blocks + 1).astype(int)
    for i in range(blocks):
        a, b = edges[i], edges[i + 1]
        f = f0 * (f1 / f0) ** (i / max(1, blocks - 1))
        seg = x[max(0, a - 2048): b]
        y = bp(seg, f / q, f * q)
        out[a:b] = y[-(b - a):]
    return out


def chirp(f0: float, f1: float, dur: float, exp: bool = True) -> np.ndarray:
    tt = t_axis(dur)
    if exp:
        k = (f1 / f0) ** (tt / dur)
        phase = 2 * np.pi * f0 * dur * (k - 1) / np.log(f1 / f0) if f1 != f0 else 2 * np.pi * f0 * tt
    else:
        phase = 2 * np.pi * (f0 * tt + (f1 - f0) * tt**2 / (2 * dur))
    return np.sin(phase).astype(np.float32)


def soft_clip(x: np.ndarray, drive: float = 1.5) -> np.ndarray:
    return (np.tanh(x * drive) / np.tanh(drive)).astype(np.float32)


def norm(x: np.ndarray, peak: float = 0.9) -> np.ndarray:
    m = float(np.max(np.abs(x))) if len(x) else 0
    return (x * (peak / m)).astype(np.float32) if m > 0 else x


def reverb_ir(dur: float = 2.2, seed: int = 1, bright: float = 6000) -> np.ndarray:
    n = noise(dur, seed) * env(int(dur * SR), 0.005, dur, 5.0)
    return lp(n, bright) * 0.12


_IR = {}


def reverb(x: np.ndarray, wet: float = 0.3, dur: float = 2.2, seed: int = 1) -> np.ndarray:
    key = (dur, seed)
    if key not in _IR:
        _IR[key] = reverb_ir(dur, seed)
    y = fftconvolve(x, _IR[key])[: len(x) + int(dur * SR)]
    out = np.zeros(len(y), dtype=np.float32)
    out[: len(x)] += x * (1 - wet)
    out += y.astype(np.float32) * wet
    return out


def pad(x: np.ndarray, tail: float) -> np.ndarray:
    return np.concatenate([x, np.zeros(int(tail * SR), dtype=np.float32)])


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------- paleta base (prompts/sonido.md) ----------

def boom(f0: float = 80, f1: float = 34, dur: float = 0.7, click: bool = True) -> np.ndarray:
    body = chirp(f0, f1, dur) * env(int(dur * SR), 0.002, dur * 0.6, 3.5)
    if click:
        c = noise(0.006, 11) * np.linspace(1, 0, int(0.006 * SR))
        body[: len(c)] += hp(c, 2000) * 0.6
    return norm(soft_clip(body, 2.2), 0.95)


def whoosh(dur: float = 0.6, up: bool = True, seed: int = 3) -> np.ndarray:
    n = noise(dur, seed)
    f0, f1 = (300, 4000) if up else (4000, 300)
    y = sweep_bp(n, f0, f1, 1.6) * bell_env(len(n)) ** 1.3
    return norm(y, 0.8)


def riser(dur: float = 2.5, seed: int = 5, reverse: bool = False) -> np.ndarray:
    tt = t_axis(dur)
    n = sweep_bp(noise(dur, seed), 400, 9000, 1.4)
    tone = chirp(110, 880, dur) * 0.35 + chirp(165, 1320, dur) * 0.2
    e = (tt / dur) ** 2.2
    y = (n * 0.7 + tone) * e
    y = reverb(y.astype(np.float32), 0.25, 1.5, seed)[: len(tt)]
    y = norm(y, 0.85)
    return y[::-1].copy() if reverse else y


def shatter(kind: str = "glass", dur: float = 1.4, seed: int = 7) -> np.ndarray:
    rng = np.random.default_rng(seed)
    out = np.zeros(int(dur * SR), dtype=np.float32)
    grains = 260 if kind == "glass" else 140
    for _ in range(grains):
        start = int(rng.exponential(0.12) * SR)
        if start >= len(out) - 2000:
            continue
        gd = rng.uniform(0.01, 0.09 if kind == "glass" else 0.25)
        g_t = t_axis(gd)
        f = rng.uniform(2500, 9000) if kind == "glass" else rng.uniform(600, 3800)
        partials = sum(np.sin(2 * np.pi * f * r * g_t + rng.uniform(0, 6)) for r in (1, 2.76, 5.4))
        g = partials * np.exp(-g_t * rng.uniform(30, 90)) * rng.uniform(0.2, 1)
        end = min(len(out), start + len(g))
        out[start:end] += g[: end - start].astype(np.float32)
    hit = boom(120, 50, 0.35) * 0.6
    out[: len(hit)] += hit
    out = reverb(out, 0.3, 1.8, seed)[: len(out)]
    return norm(out, 0.9)


def tick(freq: float = 3500, seed: int = 13) -> np.ndarray:
    c = noise(0.004, seed) * np.linspace(1, 0, int(0.004 * SR))
    c = pad(c, 0.06)
    return norm(bp(c, freq * 0.7, freq * 1.3, 2) + bp(c, freq * 2.1, freq * 2.6) * 0.4, 0.7)


def ticks_accel(dur: float = 2.0, n: int = 18) -> np.ndarray:
    out = np.zeros(int((dur + 0.1) * SR), dtype=np.float32)
    times = dur * (1 - (1 - np.linspace(0, 1, n)) ** 0.5)
    tk = tick()
    for i, tm in enumerate(times):
        s = int(tm * SR)
        out[s: s + len(tk)] += tk[: len(out) - s] * (0.5 + 0.5 * i / n)
    return out


def bell(freq: float = 1200, dur: float = 2.0, ratio: float = 3.5, index: float = 2.5) -> np.ndarray:
    """Moneda / campana: síntesis FM, ataque instantáneo, cola larga."""
    tt = t_axis(dur)
    e = env(len(tt), 0.001, dur, 5)
    mod = np.sin(2 * np.pi * freq * ratio * tt) * index * e
    return norm((np.sin(2 * np.pi * freq * tt + mod) * e).astype(np.float32), 0.6)


def coin(seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(100 + seed)
    return bell(rng.uniform(2600, 3600), 0.6, 2.7, 1.8)


def coins_cascade(dur: float = 1.6, n: int = 40, seed: int = 21) -> np.ndarray:
    rng = np.random.default_rng(seed)
    out = np.zeros(int((dur + 0.7) * SR), dtype=np.float32)
    for i in range(n):
        s = int(rng.uniform(0, dur) ** 1.2 * SR / dur ** 0.2)
        c = coin(i) * rng.uniform(0.2, 0.7)
        e = min(len(out), s + len(c))
        out[s:e] += c[: e - s]
    return norm(out, 0.8)


def stamp() -> np.ndarray:
    thud = boom(140, 60, 0.25, click=True) * 0.9
    paper = hp(noise(0.12, 31), 1500) * env(int(0.12 * SR), 0.001, 0.08, 4) * 0.4
    out = np.zeros(len(thud), dtype=np.float32)
    out += thud
    out[: len(paper)] += paper
    return norm(out, 0.9)


def snap() -> np.ndarray:
    n = hp(noise(0.012, 41), 2500) * env(int(0.012 * SR), 0.0005, 0.008, 4)
    return norm(reverb(pad(n, 0.05), 0.15, 0.6, 2), 0.95)


def heartbeat() -> np.ndarray:
    def thump(gain):
        y = chirp(70, 45, 0.16) * env(int(0.16 * SR), 0.003, 0.12, 4)
        return y * gain
    out = np.zeros(int(0.6 * SR), dtype=np.float32)
    a = thump(1.0)
    b = thump(0.6)
    out[: len(a)] += a
    s = int(0.22 * SR)
    out[s: s + len(b)] += b
    return norm(lp(out, 300), 0.9)


def glitch(dur: float = 0.35, seed: int = 51) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = noise(dur, seed)
    n = np.round(n * 4) / 4  # menos bits
    gate = np.repeat(rng.random(int(dur * 40)) > 0.45, int(SR / 40))[: len(n)]
    n[: len(gate)] *= gate
    return norm(bp(n, 300, 6000) * 0.8, 0.7)


def tape_rip(dur: float = 0.35, seed: int = 61) -> np.ndarray:
    tt = t_axis(dur)
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (60 + 400 * tt / dur) * tt))
    y = bp(noise(dur, seed), 800, 7000) * am * env(len(tt), 0.005, dur, 2)
    return norm(y.astype(np.float32), 0.85)


def gong(freq: float = 70, dur: float = 5.0) -> np.ndarray:
    tt = t_axis(dur)
    ratios = [1, 1.47, 2.09, 2.56, 3.39, 4.17, 5.23]
    y = sum(np.sin(2 * np.pi * freq * r * tt * (1 + 0.002 * np.sin(2 * np.pi * 0.7 * tt))) * np.exp(-tt * (0.7 + r * 0.4)) / (1 + r * 0.4) for r in ratios)
    y = y * env(len(tt), 0.01, dur, 3)
    return norm(reverb(y.astype(np.float32), 0.35, 3.0, 4)[: len(tt)], 0.85)


def lyre(freq: float, dur: float = 2.2, bright: float = 0.5, seed: int = 0) -> np.ndarray:
    """Cuerda pulsada Karplus-Strong."""
    n = int(dur * SR)
    period = max(2, int(SR / freq))
    buf = np.random.default_rng(1000 + int(freq) + seed).uniform(-1, 1, period).astype(np.float32)
    out = np.zeros(n, dtype=np.float32)
    decay = 0.996
    for i in range(n):
        j = i % period
        out[i] = buf[j]
        buf[j] = decay * (bright * buf[j] + (1 - bright) * buf[(j + 1) % period])
    # el bucle de arriba es lento para notas largas: se acota la duración en quien llama
    return lp(out, 6000) * env(n, 0.001, dur, 3)


_LYRE_CACHE: dict = {}


def lyre_note(note: float, dur: float = 1.8) -> np.ndarray:
    key = (note, dur)
    if key not in _LYRE_CACHE:
        _LYRE_CACHE[key] = norm(lyre(midi(note), dur, 0.5), 0.7)
    return _LYRE_CACHE[key]


VOWELS = {"aa": (800, 1150, 2900), "oo": (400, 800, 2600), "ee": (300, 2300, 3000)}


def choir(notes: list[float], dur: float, vowel: str = "aa", seed: int = 71) -> np.ndarray:
    tt = t_axis(dur)
    out = np.zeros(len(tt), dtype=np.float32)
    for k, nt in enumerate(notes):
        f = midi(nt)
        vib = 1 + 0.006 * np.sin(2 * np.pi * (5 + k * 0.3) * tt)
        saw = 2 * ((f * vib * tt + k * 0.1) % 1) - 1
        for fr in VOWELS[vowel]:
            out += bp(saw.astype(np.float32), fr * 0.85, fr * 1.15) * 0.3
    out *= env(len(tt), dur * 0.3, dur, 1.0) * np.minimum(1, (len(tt) - np.arange(len(tt))) / (0.4 * SR))
    return norm(reverb(out, 0.45, 2.5, seed)[: len(tt)], 0.6)


def wind(dur: float = 1.2, seed: int = 81) -> np.ndarray:
    n = noise(dur, seed)
    y = sweep_bp(n, 250, 900, 1.8) * bell_env(len(n))
    return norm(y, 0.6)


def stone(seed: int = 91) -> np.ndarray:
    thud = boom(95, 40, 0.4) * 0.8
    grit = bp(noise(0.25, seed), 900, 4000) * env(int(0.25 * SR), 0.002, 0.15, 4) * 0.5
    out = np.zeros(len(thud), dtype=np.float32)
    out += thud
    out[: len(grit)] += grit
    return norm(reverb(out, 0.25, 1.2, 3)[: len(out)], 0.9)


def pen_scratch(dur: float = 1.5, seed: int = 101) -> np.ndarray:
    tt = t_axis(dur)
    strokes = (np.sin(2 * np.pi * 7 * tt) > 0.2).astype(np.float32)
    y = bp(noise(dur, seed), 2500, 7500) * strokes * 0.5
    return norm(y.astype(np.float32), 0.45)


def candle() -> np.ndarray:
    whoo = whoosh(0.35, True, 111) * 0.5
    crackle = hp(noise(0.5, 112), 3000) * (np.random.default_rng(113).random(int(0.5 * SR)) > 0.995) * 2
    out = np.zeros(int(0.6 * SR), dtype=np.float32)
    out[: len(whoo)] += whoo
    out[: len(crackle)] += crackle.astype(np.float32)
    return norm(out, 0.6)


def wet_thud() -> np.ndarray:
    y = chirp(220, 70, 0.22) * env(int(0.22 * SR), 0.002, 0.12, 5)
    squish = bp(noise(0.18, 121), 300, 1500) * env(int(0.18 * SR), 0.01, 0.1, 4) * 0.5
    y[: len(squish)] += squish
    return norm(lp(y, 2500), 0.9)


def record_scratch() -> np.ndarray:
    dur = 0.35
    tt = t_axis(dur)
    speed = np.sin(2 * np.pi * 2.6 * tt)
    phase = np.cumsum(400 + 900 * speed) / SR
    y = np.sin(2 * np.pi * phase) * 0.4 + bp(noise(dur, 131), 1500, 6000) * np.abs(speed) * 0.6
    return norm((y * bell_env(len(tt))).astype(np.float32), 0.8)


def drip_down() -> np.ndarray:
    out = np.zeros(int(1.4 * SR), dtype=np.float32)
    for i, (f, g) in enumerate([(1400, 1.0), (1100, 0.8), (800, 0.65), (520, 0.5)]):
        d = chirp(f * 1.6, f, 0.08) * env(int(0.08 * SR), 0.001, 0.05, 4) * g
        s = int(i * 0.24 * SR)
        out[s: s + len(d)] += d
    return norm(reverb(out, 0.3, 1.0, 5)[: len(out)], 0.7)


def drop_echo() -> np.ndarray:
    d = chirp(1800, 700, 0.07) * env(int(0.07 * SR), 0.001, 0.05, 4)
    out = np.zeros(int(1.6 * SR), dtype=np.float32)
    for k in range(5):
        s = int(k * 0.28 * SR)
        out[s: s + len(d)] += d * (0.7 ** k)
    return norm(reverb(out, 0.35, 1.5, 6)[: len(out)], 0.7)


def bleat() -> np.ndarray:
    """Balido cómico: tono con vibrato rápido y formante 'eh'."""
    dur = 0.75
    tt = t_axis(dur)
    f = 420 * (1 + 0.08 * np.sin(2 * np.pi * 22 * tt)) * (1 - 0.15 * tt / dur)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    y = bp(saw.astype(np.float32), 450, 750) + bp(saw.astype(np.float32), 1600, 2300) * 0.6
    return norm(y * env(len(tt), 0.03, dur, 1.4), 0.75)


def cloth(dur: float = 0.7, seed: int = 141) -> np.ndarray:
    return norm(sweep_bp(noise(dur, seed), 600, 2500, 1.4) * bell_env(int(dur * SR)) ** 0.8 * 0.8, 0.6)


def notify() -> np.ndarray:
    out = np.zeros(int(0.9 * SR), dtype=np.float32)
    for i, n in enumerate([84, 91]):
        b = bell(midi(n), 0.6, 2.0, 0.6) * 0.7
        s = int(i * 0.09 * SR)
        out[s: s + len(b)] += b
    return norm(out, 0.6)


def clicks(n: int = 6, gap: float = 0.07, seed: int = 151) -> np.ndarray:
    out = np.zeros(int((n * gap + 0.2) * SR), dtype=np.float32)
    rng = np.random.default_rng(seed)
    for i in range(n):
        c = tick(rng.uniform(1800, 4200), seed + i)
        s = int(i * gap * SR)
        out[s: s + len(c)] += c
    return norm(out, 0.7)


def paper_unfold(dur: float = 1.0, seed: int = 161) -> np.ndarray:
    n = bp(noise(dur, seed), 1500, 8000)
    crinkle = (np.random.default_rng(seed).random(len(n)) > 0.96).astype(np.float32)
    y = n * (0.2 + crinkle) * bell_env(len(n))
    return norm(lp(y, 9000), 0.5)


def motor_rise(dur: float = 2.6) -> np.ndarray:
    tt = t_axis(dur)
    f = 55 * (1 + 2.5 * (tt / dur) ** 1.5)
    ph = np.cumsum(f) / SR
    y = (2 * (ph % 1) - 1) * 0.4 + np.sin(2 * np.pi * ph * 2) * 0.3
    y = lp(y.astype(np.float32), 1800) * np.minimum(1, tt / 0.3)
    return norm(y, 0.55)


def wah_down() -> np.ndarray:
    dur = 0.6
    tt = t_axis(dur)
    f = 330 * (1 - 0.45 * tt / dur)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    y = sweep_bp(saw.astype(np.float32), 1800, 400, 1.6, 24) * env(len(tt), 0.02, dur, 1.8)
    return norm(y, 0.6)


def chisel(n: int = 6, seed: int = 171) -> np.ndarray:
    out = np.zeros(int((n * 0.13 + 0.4) * SR), dtype=np.float32)
    rng = np.random.default_rng(seed)
    for i in range(n):
        h = bp(noise(0.05, seed + i), 2500, 9000) * env(int(0.05 * SR), 0.0005, 0.03, 5)
        ring = bell(rng.uniform(3500, 5200), 0.25, 1.9, 0.8) * 0.3
        s = int(i * 0.13 * SR)
        out[s: s + len(h)] += h
        out[s: s + len(ring)] += ring[: len(out) - s]
    return norm(out, 0.6)


def time_freeze() -> np.ndarray:
    """'Whoomp' grave + cinta que frena (para congelar la imagen)."""
    dur = 0.9
    tt = t_axis(dur)
    f = 180 * np.exp(-tt * 4) + 30
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.005, dur, 2.5)
    y += sweep_bp(noise(dur, 181), 3000, 200, 1.5) * env(len(tt), 0.01, dur * 0.5, 3) * 0.5
    return norm(soft_clip(y.astype(np.float32), 1.8), 0.9)


def tape_stop(x: np.ndarray, dur: float = 0.5) -> np.ndarray:
    """Baja el tono hasta cero en `dur` s (sobre un fragmento de mezcla)."""
    n = min(len(x), int(dur * SR))
    speed = np.linspace(1, 0, n) ** 1.5
    pos = np.cumsum(speed)
    idx = np.clip(pos.astype(int), 0, len(x) - 1)
    return (x[idx] * np.linspace(1, 0.2, n)).astype(np.float32)
