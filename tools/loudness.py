#!/usr/bin/env python3
"""
loudness.py — Normaliza el audio de un MP4 al nivel de YouTube, en dos pasadas (más preciso que una).

Uso:  python tools/loudness.py entrada.mp4 salida.mp4 [--lufs -14] [--tp -1.5]

- Integrado: -14 LUFS (lo que YouTube usa para normalizar).
- Pico real: el objetivo se pone 0,5 dB por debajo del máximo pedido (-1 dBTP), porque el AAC puede subir el pico.
- 48 kHz estéreo (loudnorm remuestrea internamente a 192 kHz: sin -ar el archivo saldría a 96-192 kHz).
- El video se copia sin recodificar.
"""
import argparse
import json
import re
import subprocess
import sys


def measure(path: str, lufs: float, tp: float) -> dict:
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", f"loudnorm=I={lufs}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    if not m:
        sys.exit(f"No pude medir el volumen:\n{r.stderr[-2000:]}")
    return json.loads(m.group(0))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-2.0)
    a = ap.parse_args()
    m = measure(a.src, a.lufs, a.tp)
    print(f"Antes: {m['input_i']} LUFS, pico {m['input_tp']} dBTP")
    # El AAC puede subir el pico real por encima del limitador: si pasa de -1 dBTP,
    # se vuelve a codificar con el limitador 1 dB más abajo (hasta 4 intentos).
    limit_db = -2.2
    for intento in range(4):
        lim = 10 ** (limit_db / 20)
        af = (
            f"loudnorm=I={a.lufs}:TP={a.tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
            f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
            f"alimiter=limit={lim:.4f}:attack=3:release=60:level=disabled,aresample=48000"
        )
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", a.src, "-c:v", "copy", "-af", af, "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", a.dst],
            check=True,
        )
        after = measure(a.dst, a.lufs, a.tp)
        print(f"Después: {after['input_i']} LUFS, pico {after['input_tp']} dBTP (limitador {limit_db} dB)")
        if float(after["input_tp"]) <= -1.2:
            break
        limit_db -= 1.0


if __name__ == "__main__":
    main()
