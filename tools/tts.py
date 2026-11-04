#!/usr/bin/env python3
"""
tts.py — Voz de un Short con Edge TTS y armado de la línea de tiempo para Remotion.

Lee shorts/<id>/short.json, genera una pista de voz por escena (con los tiempos de
cada palabra para los subtítulos) y escribe shorts/<id>/build/timeline.json, que es
lo que consume `npm run render -- --short shorts/<id>`.

Uso:
  python tools/tts.py shorts/<id>             # con voz (necesita internet: corre en GitHub Actions)
  python tools/tts.py shorts/<id> --silent    # sin voz, tiempos estimados (para probar sin red)
  python tools/tts.py shorts/<id> --voice en-US-AndrewNeural --rate -8%

Edge TTS (edge-tts) es una librería no oficial que usa el servicio de lectura en voz
alta de Microsoft Edge. Las sesiones en la nube de Claude Code no llegan a ese
servicio; GitHub Actions sí.
"""
import argparse
import asyncio
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_VOICE = "en-US-AndrewNeural"
DEFAULT_RATE = "-6%"
DEFAULT_PITCH = "-2Hz"
GAP = 0.25  # silencio después de cada escena (s)
WORDS_PER_SEC = 2.6  # para el modo --silent
TICKS = 10_000_000  # edge-tts mide en unidades de 100 ns


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9']", "", s.lower())


def align_words(say: str, boundaries: list[dict]) -> list[dict]:
    """Usa el texto original (con puntuación) para cada palabra que devolvió el servicio."""
    tokens = say.split()
    out, j = [], 0
    for b in boundaries:
        text = b["text"]
        k = j
        while k < len(tokens) and norm(tokens[k]) != norm(text) and k - j < 3:
            k += 1
        if k < len(tokens) and norm(tokens[k]) == norm(text):
            text, j = tokens[k], k + 1
        out.append({"text": text, "start": round(b["start"], 3), "end": round(b["end"], 3)})
    return out


def fake_words(say: str, duration: float) -> list[dict]:
    tokens = say.split()
    step = (duration - 0.3) / max(1, len(tokens))
    return [
        {"text": t, "start": round(0.1 + i * step, 3), "end": round(0.1 + (i + 1) * step - 0.03, 3)}
        for i, t in enumerate(tokens)
    ]


def audio_duration(path: Path) -> float | None:
    if not shutil.which("ffprobe"):
        return None
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


async def synth(text: str, voice: str, rate: str, pitch: str, out: Path) -> list[dict]:
    import edge_tts  # se importa acá para que --silent funcione sin la librería

    last_err = None
    for attempt in range(3):
        try:
            comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
            audio = bytearray()
            words = []
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    audio.extend(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    start = chunk["offset"] / TICKS
                    words.append({"text": chunk["text"], "start": start, "end": start + chunk["duration"] / TICKS})
            out.write_bytes(bytes(audio))
            return words
        except Exception as e:  # red inestable: reintentar
            last_err = e
            await asyncio.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Edge TTS falló 3 veces: {last_err}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("short_dir")
    ap.add_argument("--silent", action="store_true", help="sin voz, tiempos estimados")
    ap.add_argument("--voice")
    ap.add_argument("--rate")
    ap.add_argument("--pitch")
    args = ap.parse_args()

    short_dir = (REPO / args.short_dir).resolve()
    spec = json.loads((short_dir / "short.json").read_text(encoding="utf-8"))
    voice = args.voice or spec.get("voice", DEFAULT_VOICE)
    rate = args.rate or spec.get("rate", DEFAULT_RATE)
    pitch = args.pitch or spec.get("pitch", DEFAULT_PITCH)

    build = short_dir / "build"
    vdir = build / "voice"
    vdir.mkdir(parents=True, exist_ok=True)

    t = 0.0
    scenes = []
    for i, scene in enumerate(spec["scenes"], start=1):
        say = scene["say"].strip()
        if args.silent:
            dur = max(2.2, len(say.split()) / WORDS_PER_SEC + 0.4)
            words, audio_rel = fake_words(say, dur), None
        else:
            mp3 = vdir / f"s{i:02d}.mp3"
            bounds = asyncio.run(synth(say, voice, rate, pitch, mp3))
            words = align_words(say, bounds)
            spoken = audio_duration(mp3) or (words[-1]["end"] + 0.35 if words else 2.0)
            dur = spoken + GAP
            audio_rel = mp3.relative_to(REPO).as_posix()
        scenes.append({**scene, "say": say, "audio": audio_rel, "start": round(t, 3),
                       "duration": round(dur, 3), "words": words})
        print(f"  escena {i} ({scene['type']}): {dur:.2f}s, {len(words)} palabras")
        t += dur

    timeline = {"id": spec["id"], "fps": 30, "captions": spec.get("captions", True),
                "voice": None if args.silent else voice, "scenes": scenes, "total": round(t, 3)}
    (build / "timeline.json").write_text(json.dumps(timeline, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Línea de tiempo: {build / 'timeline.json'} ({t:.1f}s, voz: {timeline['voice'] or 'ninguna'})")


if __name__ == "__main__":
    sys.exit(main())
