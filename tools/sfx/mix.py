"""
mix.py — Mezclador de sonido de Calm Fortune y herramientas de música.

Cada video tiene su propio diseño de sonido en shorts/<id>/sound.py, con una función
`design(tl: Timeline, mix: Mix)` que ubica efectos y música usando los tiempos reales de
la voz (build/timeline.json). Este módulo pone cada sonido en su lugar, baja la música
mientras habla la voz (sidechain) y escribe build/sound.wav (música + efectos, sin la voz).
La voz se suma en Remotion y el volumen final (-14 LUFS) lo ajusta ffmpeg en el workflow.

Uso:  python tools/sfx/mix.py shorts/<id>
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, str(Path(__file__).resolve().parent))
import synth as S  # noqa: E402

SR = S.SR
REPO = Path(__file__).resolve().parents[2]


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9']", "", s.lower())


class Timeline:
    """Acceso cómodo a los tiempos de la voz. Escenas numeradas desde 1, como en el guion."""

    def __init__(self, path: Path):
        self.data = json.loads(path.read_text(encoding="utf-8"))
        self.scenes = self.data["scenes"]
        self.total = float(self.data["total"])

    def start(self, i: int) -> float:
        return float(self.scenes[i - 1]["start"])

    def end(self, i: int) -> float:
        s = self.scenes[i - 1]
        return float(s["start"]) + float(s["duration"])

    def word(self, i: int, text: str, occ: int = 1, edge: str = "start") -> float:
        """Segundo absoluto en que la voz dice `text` (la `occ`-ésima vez) en la escena i."""
        s = self.scenes[i - 1]
        n = 0
        for w in s["words"]:
            if _norm(w["text"]) == _norm(text):
                n += 1
                if n == occ:
                    return float(s["start"]) + float(w[edge])
        # si no aparece (voz distinta del guion), cae en la mitad de la escena
        return float(s["start"]) + float(s["duration"]) * 0.5

    def voice_spans(self) -> list[tuple[float, float]]:
        out = []
        for s in self.scenes:
            for w in s["words"]:
                out.append((float(s["start"]) + w["start"], float(s["start"]) + w["end"]))
        return out


class Mix:
    def __init__(self, total: float):
        self.n = int((total + 0.05) * SR)
        self.sfx = np.zeros((self.n, 2), dtype=np.float32)
        self.music = np.zeros((self.n, 2), dtype=np.float32)
        self.mutes: list[tuple[float, float]] = []

    def _place(self, bus: np.ndarray, x: np.ndarray, t: float, gain_db: float, pan: float, wrap: bool):
        g = 10 ** (gain_db / 20)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        s = int(round(t * SR))
        if s < 0:
            x = x[-s:]
            s = 0
        e = min(self.n, s + len(x))
        if e > s:
            bus[s:e, 0] += x[: e - s] * g * l * 1.414
            bus[s:e, 1] += x[: e - s] * g * r * 1.414
        # lo que sobra al final se suma al principio: así el video en loop suena continuo
        if wrap and s + len(x) > self.n:
            rest = x[self.n - s:]
            k = min(len(rest), self.n)
            bus[:k, 0] += rest[:k] * g * l * 1.414
            bus[:k, 1] += rest[:k] * g * r * 1.414

    def fx(self, x: np.ndarray, t: float, gain_db: float = 0, pan: float = 0, wrap: bool = False):
        self._place(self.sfx, x, t, gain_db, pan, wrap)

    def mus(self, x: np.ndarray, t: float, gain_db: float = 0, pan: float = 0, wrap: bool = False):
        self._place(self.music, x, t, gain_db, pan, wrap)

    def silence(self, t0: float, t1: float):
        """Silencio total (música y efectos) entre t0 y t1: corte de patrón."""
        self.mutes.append((t0, t1))

    def render(self, voice_spans: list[tuple[float, float]], duck_db: float = -10) -> np.ndarray:
        # Sidechain: la música baja mientras se habla, con ataque rápido y salida suave.
        gate = np.zeros(self.n, dtype=np.float32)
        for a, b in voice_spans:
            gate[int(a * SR): int(b * SR)] = 1
        att, rel = 0.03, 0.3
        envl = np.zeros(self.n, dtype=np.float32)
        lvl = 0.0
        ka, kr = 1 - np.exp(-1 / (att * SR)), 1 - np.exp(-1 / (rel * SR))
        # recorrido por bloques de 1 ms (rápido y suficiente)
        step = SR // 1000
        for i in range(0, self.n, step):
            target = gate[i: i + step].max()
            k = ka if target > lvl else kr
            lvl += (target - lvl) * (1 - (1 - k) ** step)
            envl[i: i + step] = lvl
        duck = 10 ** (duck_db * envl / 20)
        out = self.music * duck[:, None] + self.sfx
        for a, b in self.mutes:
            ia, ib = int(a * SR), int(b * SR)
            fade = int(0.01 * SR)
            out[ia:ib] = 0
            out[max(0, ia - fade): ia] *= np.linspace(1, 0, min(fade, ia))[:, None]
        # limitador suave
        peak = float(np.max(np.abs(out))) or 1
        out = out / max(1.0, peak / 0.95)
        return np.tanh(out * 1.1).astype(np.float32) / np.tanh(1.1)


# ---------- herramientas de música (se repiten en todos los videos) ----------

def drone(notes: list[float], dur: float, cutoff: float = 500, seed: int = 0) -> np.ndarray:
    """Colchón grave: sierras desafinadas apenas, filtradas, con un filtro que respira."""
    tt = S.t_axis(dur)
    y = np.zeros(len(tt), dtype=np.float32)
    for k, nt in enumerate(notes):
        for det in (-0.07, 0.0, 0.06):
            f = S.midi(nt + det)
            y += (2 * ((f * tt + 0.13 * k) % 1) - 1).astype(np.float32) * 0.2
    y = S.lp(y, cutoff, 2)
    y *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.08 * tt + seed)).astype(np.float32)
    fade = min(len(y) // 4, int(0.6 * SR))
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    return S.norm(y, 0.5)


def kick() -> np.ndarray:
    return S.boom(95, 42, 0.32, click=True)


def sub_hit() -> np.ndarray:
    return S.boom(60, 30, 0.9, click=False)


def beat_times(t0: float, t1: float, bpm: float) -> list[float]:
    step = 60 / bpm
    out, t = [], t0
    while t < t1 - 1e-3:
        out.append(t)
        t += step
    return out


def arpeggio(mix: Mix, t0: float, t1: float, bpm: float, notes: list[float], gain_db: float = -10, octave: int = 0):
    """Arpegio de lira en corcheas entre t0 y t1."""
    step = 60 / bpm / 2
    i = 0
    t = t0
    while t < t1 - 0.05:
        n = notes[i % len(notes)] + 12 * octave
        mix.mus(S.lyre_note(n, 1.6), t, gain_db, pan=(-0.3 if i % 2 else 0.3))
        t += step
        i += 1


def main() -> None:
    short_dir = (REPO / sys.argv[1]).resolve()
    design_file = short_dir / "sound.py"
    if not design_file.exists():
        print(f"{short_dir.name}: sin sound.py, no hay música ni efectos.")
        return
    tl = Timeline(short_dir / "build" / "timeline.json")
    spec = importlib.util.spec_from_file_location("sound_design", design_file)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    mix = Mix(tl.total)
    mod.design(tl, mix)
    out = mix.render(tl.voice_spans())
    path = short_dir / "build" / "sound.wav"
    wavfile.write(path, SR, (out * 32767).astype(np.int16))
    print(f"Sonido: {path} ({tl.total:.1f} s)")


if __name__ == "__main__":
    main()
