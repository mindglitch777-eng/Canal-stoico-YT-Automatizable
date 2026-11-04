#!/usr/bin/env python3
"""
voice_samples.py — Genera la misma frase con todas las voces masculinas en inglés
de Edge TTS (EE.UU. y Reino Unido) para elegir la voz del canal de oído.

Uso:  python tools/voice_samples.py [carpeta_salida]
Corre en GitHub Actions (workflow "Muestras de voces"); el resultado sale como artifact.
"""
import asyncio
import sys
from pathlib import Path

import edge_tts

TEXT = (
    "One of Rome's richest men practiced being poor. On purpose. "
    "Not because he had to, but because he refused to be afraid of losing it."
)
SETTINGS = [("normal", "+0%", "+0Hz"), ("calmo", "-8%", "-3Hz")]


async def main(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    voices = await edge_tts.list_voices()
    chosen = [v for v in voices if v["Gender"] == "Male" and v["Locale"] in ("en-US", "en-GB")]
    lines = []
    for v in sorted(chosen, key=lambda v: v["ShortName"]):
        name = v["ShortName"]
        tags = ", ".join(v.get("VoiceTag", {}).get("VoicePersonalities", []))
        for label, rate, pitch in SETTINGS:
            path = out_dir / f"{name}__{label}.mp3"
            try:
                await edge_tts.Communicate(TEXT, name, rate=rate, pitch=pitch).save(str(path))
                print(f"OK {path.name}")
            except Exception as e:
                print(f"FALLÓ {name} ({label}): {e}")
        lines.append(f"{name}\t{tags}")
    (out_dir / "voces.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\n{len(chosen)} voces -> {out_dir}")


if __name__ == "__main__":
    asyncio.run(main(Path(sys.argv[1] if len(sys.argv) > 1 else "voice-samples")))
