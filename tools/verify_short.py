#!/usr/bin/env python3
"""
verify_short.py — Control final de un Short ya renderizado, con números.

Uso:  python tools/verify_short.py video.mp4 [--loop] [--allow-silences 2] [--min 44 --max 46] [--sheet hoja.jpg] [--json informe.json]

Mide:
- Loop (con --loop): SSIM entre el primer y el último cuadro (objetivo >= 0,90).
- Volumen: integrado (-14 LUFS +-0,5) y pico real (<= -1 dBTP).
- Silencios de más de 0,1 s (a -45 dB): cuántos hay y si alguno cae en el último segundo.
- Frecuencia de muestreo (48 kHz) y duración (si se pasan --min/--max).
- Hoja de cuadros a 1 fps (con --sheet).
Sale con código 1 si algo no cumple.
"""
import argparse
import json
import re
import subprocess
import sys


def run(args: list[str]) -> str:
    return subprocess.run(args, capture_output=True, text=True).stderr


def probe(path: str) -> dict:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,sample_rate", "-of", "json", path], capture_output=True, text=True).stdout
    d = json.loads(out)
    sr = next((int(s["sample_rate"]) for s in d["streams"] if s.get("codec_type") == "audio"), 0)
    return {"duration": float(d["format"]["duration"]), "sample_rate": sr}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--loop", action="store_true")
    ap.add_argument("--allow-silences", type=int, default=2)
    ap.add_argument("--min", type=float)
    ap.add_argument("--max", type=float)
    ap.add_argument("--sheet")
    ap.add_argument("--json")
    a = ap.parse_args()
    v = a.video
    info = probe(v)
    dur = info["duration"]
    rep: dict = {"duration_s": round(dur, 2), "sample_rate": info["sample_rate"]}
    fails = []

    # volumen
    e = run(["ffmpeg", "-hide_banner", "-nostats", "-i", v, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"])
    i_m = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)
    tp_m = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
    lufs = float(i_m[-1]) if i_m else None
    tp = float(tp_m[-1]) if tp_m else None
    rep["lufs"] = lufs
    rep["true_peak_dbtp"] = tp
    if lufs is None or abs(lufs + 14) > 0.5:
        fails.append(f"volumen {lufs} LUFS (objetivo -14 +-0,5)")
    if tp is None or tp > -1.0:
        fails.append(f"pico real {tp} dBTP (máximo -1)")
    if info["sample_rate"] != 48000:
        fails.append(f"audio a {info['sample_rate']} Hz (objetivo 48000)")

    # silencios
    s = run(["ffmpeg", "-hide_banner", "-nostats", "-i", v, "-af", "silencedetect=n=-45dB:d=0.1", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", s)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", s)]
    sil = [(round(a0, 2), round(ends[k] if k < len(ends) else dur, 2)) for k, a0 in enumerate(starts)]
    rep["silences"] = sil
    if len(sil) > a.allow_silences:
        fails.append(f"{len(sil)} silencios (se permiten {a.allow_silences}): {sil}")
    if any(b > dur - 1.0 for _, b in sil):
        fails.append("hay un silencio en el último segundo")

    # duración
    if a.min is not None and dur < a.min:
        fails.append(f"dura {dur:.2f} s (mínimo {a.min})")
    if a.max is not None and dur > a.max:
        fails.append(f"dura {dur:.2f} s (máximo {a.max})")

    # loop: primer cuadro contra último
    if a.loop:
        import os
        import tempfile
        tmp = tempfile.mkdtemp()
        first, last = os.path.join(tmp, "first.png"), os.path.join(tmp, "last.png")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", v, "-frames:v", "1", first], check=True)
        # último cuadro de video (el audio puede durar unos ms más, así que se cuenta por cuadros)
        nb = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", v], capture_output=True, text=True).stdout.strip()
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", v, "-vf", f"select=eq(n\\,{int(nb.split(",")[0]) - 1})", "-frames:v", "1", "-fps_mode", "passthrough", last], check=True)
        out = run(["ffmpeg", "-hide_banner", "-nostats", "-i", first, "-i", last, "-lavfi", "ssim", "-f", "null", "-"])
        m = re.search(r"All:([\d.]+)", out)
        ssim = float(m.group(1)) if m else None
        rep["loop_ssim"] = ssim
        if ssim is None or ssim < 0.90:
            fails.append(f"loop: SSIM primer/último cuadro {ssim} (mínimo 0,90)")

    if a.sheet:
        cols = 10
        rows = int(dur) // cols + 1
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", v, "-vf", f"fps=1,scale=180:-1,tile={cols}x{rows}", "-frames:v", "1", a.sheet], check=True)
        rep["sheet"] = a.sheet

    rep["ok"] = not fails
    rep["fails"] = fails
    print(json.dumps(rep, indent=2, ensure_ascii=False))
    if a.json:
        with open(a.json, "w", encoding="utf-8") as fh:
            json.dump(rep, fh, indent=2, ensure_ascii=False)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
