#!/usr/bin/env python3
"""
check_short.py — Control del estándar de viralidad (prompts/estandar-viral.md) sobre un short.json.

Uso:  python3 tools/check_short.py shorts/<id>
Controla principios, no formas: el tipo de escena es libre (videos a medida).
Sale con código 1 si hay errores. Las duraciones se estiman (2,6 palabras/s + 0,25 s)
salvo que exista build/timeline.json con la voz real.
"""
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
REWARDS = {"paradox", "number", "reveal", "quote", "data", "consequence", "twist",
           "contrast", "payoff", "challenge", "humor"}
BEATS = {"hook", "reward", "twist", "payoff", "loop"}
MAX_HOOK_SAID = 12
MAX_ON_SCREEN = 6
MAX_QUOTE = 10
MAX_SCENE_S = 4.5


def words(s: str) -> list[str]:
    return [w for w in re.split(r"\s+", s.replace("*", "").replace("\\n", " ")) if re.search(r"\w", w)]


def on_screen(scene: dict) -> tuple[str, int]:
    t = scene.get("type", "custom")
    if "onScreen" in scene:  # videos a medida: texto en pantalla declarado a mano
        return " ".join(scene["onScreen"]) if isinstance(scene["onScreen"], list) else scene["onScreen"], MAX_ON_SCREEN
    if t in ("hook", "statement", "outro"):
        return scene.get("text", ""), MAX_ON_SCREEN
    if t == "quote":
        return scene.get("quote", ""), MAX_QUOTE
    if t == "counter":
        return scene.get("label", ""), MAX_ON_SCREEN
    if t == "chart":
        return scene.get("label", ""), MAX_ON_SCREEN
    return "", MAX_ON_SCREEN


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    d = (REPO / sys.argv[1]).resolve()
    spec = json.loads((d / "short.json").read_text(encoding="utf-8"))
    scenes = spec["scenes"]
    errors, warns = [], []

    tl = d / "build" / "timeline.json"
    real = json.loads(tl.read_text(encoding="utf-8"))["scenes"] if tl.exists() else None
    durs = [s["duration"] for s in real] if real and len(real) == len(scenes) else \
        [len(words(s["say"])) / 2.6 + 0.25 for s in scenes]
    total = sum(durs)
    starts = [sum(durs[:i]) for i in range(len(durs))]

    if scenes[0].get("beat") != "hook":
        errors.append("La primera escena tiene que tener beat 'hook' (la forma es libre).")
    if len(words(scenes[0]["say"])) > MAX_HOOK_SAID:
        errors.append(f"Gancho hablado de {len(words(scenes[0]['say']))} palabras (máx. {MAX_HOOK_SAID}).")

    prev = None
    for i, s in enumerate(scenes, start=1):
        tag = f"Escena {i} ({s.get('type', 'custom')})"
        for f in ("beat", "reward", "visual"):
            if not s.get(f):
                errors.append(f"{tag}: falta '{f}'.")
        if s.get("reward") and s["reward"] not in REWARDS:
            errors.append(f"{tag}: reward '{s['reward']}' no está en la lista.")
        if s.get("beat") and s["beat"] not in BEATS:
            errors.append(f"{tag}: beat '{s['beat']}' no está en la lista.")
        if prev and s.get("reward") == prev:
            errors.append(f"{tag}: repite la recompensa '{prev}' de la escena anterior.")
        prev = s.get("reward")
        txt, limit = on_screen(s)
        n = len(words(txt))
        if n > limit:
            errors.append(f"{tag}: {n} palabras en pantalla (máx. {limit}): \"{txt}\"")
        if s.get("type") == "twoColumns":
            for side in ("left", "right"):
                items = s[side]["items"]
                if len(items) > 4 or any(len(words(it)) > 3 for it in items):
                    errors.append(f"{tag}: columna '{side}' con demasiado texto (máx. 4 ítems de 3 palabras).")
        if durs[i - 1] > MAX_SCENE_S:
            warns.append(f"{tag}: dura {durs[i - 1]:.1f} s (más de {MAX_SCENE_S} s).")

    twists = [i for i, s in enumerate(scenes) if s.get("beat") == "twist"]
    if not twists:
        warns.append("No hay escena con beat 'twist'.")
    for i in twists:
        pos = starts[i] / total
        if not 0.55 <= pos <= 0.75:
            warns.append(f"El giro (escena {i + 1}) cae al {pos:.0%} del video (tiene que estar entre 55 % y 75 %).")

    if scenes[-1].get("beat") != "loop":
        warns.append("La última escena no tiene beat 'loop' (el final no empalma con el inicio).")
    if not spec.get("sources"):
        warns.append("Sin 'sources': cada cita o dato tendría que tener fuente.")

    src = "voz real" if real else "estimada"
    print(f"{spec['id']}: {len(scenes)} escenas, {total:.1f} s ({src}), recompensa cada {total / len(scenes):.1f} s en promedio")
    for w in warns:
        print(f"  AVISO  {w}")
    for e in errors:
        print(f"  ERROR  {e}")
    print("OK: cumple el estándar." if not errors else f"{len(errors)} error(es).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
