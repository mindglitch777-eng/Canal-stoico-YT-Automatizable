#!/usr/bin/env python3
"""
pd_images.py — Busca y baja imágenes de dominio público (estatuas, bustos, pintura clásica)
para usar en los Shorts, con los créditos de cada una.

Fuentes (todas con filtro estricto de licencia; si una obra no dice dominio público o CC0, se descarta):
  - met:      The Metropolitan Museum of Art, Open Access (CC0). Campo isPublicDomain.
  - aic:      Art Institute of Chicago (CC0 para obras de dominio público). Campo is_public_domain.
  - commons:  Wikimedia Commons, solo archivos con licencia "Public domain" o "CC0".
              Ojo: en Commons el dominio público suele ser "en EE. UU."; el canal apunta a EE. UU.

Uso:
  python tools/pd_images.py "marcus aurelius bust" --limit 12 --sources met,aic,commons --out imagenes

Salida en <out>/<slug>/:
  NN-fuente-id.jpg     imagen (lado mayor de hasta 2400 px)
  creditos.json        título, autor, fecha, licencia, fuente y enlace de cada imagen
  creditos.md          lo mismo, legible
  hoja.jpg             hoja de contactos numerada para elegir desde el celular

Corre en GitHub Actions (workflow "Imágenes de dominio público"): las sesiones en la nube
de Claude Code no llegan a estos sitios.
"""
import argparse
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

UA = "CalmFortuneImageFetcher/1.0 (+https://github.com/mindglitch777-eng/Canal-stoico-YT-Automatizable)"
MAX_SIDE = 2400
MIN_SIDE = 700  # descarta imágenes chicas: el Short es 1080x1920


def get(url: str, headers: dict | None = None, timeout: int = 40) -> bytes:
    h = {"User-Agent": UA}
    h.update(headers or {})
    last = None
    for intento in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1.5 * (intento + 1))
    raise RuntimeError(f"{url}: {last}")


def get_json(url: str, headers: dict | None = None) -> dict:
    return json.loads(get(url, headers).decode("utf-8"))


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "busqueda"


def strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


# ---------- fuentes: cada una devuelve candidatos {source,id,title,artist,date,license,page,image_url} ----------

def from_met(query: str, limit: int) -> list[dict]:
    base = "https://collectionapi.metmuseum.org/public/collection/v1"
    q = urllib.parse.urlencode({"q": query, "hasImages": "true"})
    ids = (get_json(f"{base}/search?{q}").get("objectIDs") or [])[: limit * 4]
    out = []
    for oid in ids:
        if len(out) >= limit:
            break
        try:
            o = get_json(f"{base}/objects/{oid}")
        except Exception as e:  # noqa: BLE001
            print(f"  met {oid}: {e}")
            continue
        if not o.get("isPublicDomain") or not o.get("primaryImage"):
            continue
        out.append({
            "source": "met", "id": str(oid),
            "title": o.get("title", ""), "artist": o.get("artistDisplayName", ""),
            "date": o.get("objectDate", ""), "license": "CC0 (Met Open Access)",
            "page": o.get("objectURL", ""), "image_url": o["primaryImage"],
        })
        time.sleep(0.1)
    return out


def from_aic(query: str, limit: int) -> list[dict]:
    params = urllib.parse.urlencode({
        "q": query,
        "query[term][is_public_domain]": "true",
        "fields": "id,title,image_id,artist_display,date_display,is_public_domain",
        "limit": str(min(100, limit * 3)),
    })
    data = get_json(f"https://api.artic.edu/api/v1/artworks/search?{params}", {"AIC-User-Agent": UA})
    iiif = (data.get("config") or {}).get("iiif_url", "https://www.artic.edu/iiif/2")
    out = []
    for a in data.get("data", []):
        if len(out) >= limit:
            break
        if not a.get("is_public_domain") or not a.get("image_id"):
            continue
        out.append({
            "source": "aic", "id": str(a["id"]),
            "title": a.get("title", ""), "artist": a.get("artist_display", ""),
            "date": a.get("date_display", ""), "license": "CC0 (Art Institute of Chicago, dominio público)",
            "page": f"https://www.artic.edu/artworks/{a['id']}",
            "image_url": f"{iiif}/{a['image_id']}/full/1686,/0/default.jpg",
            "fallback_url": f"{iiif}/{a['image_id']}/full/843,/0/default.jpg",
        })
    return out


def commons_license_ok(meta: dict) -> str | None:
    lic = (meta.get("License", {}) or {}).get("value", "").lower()
    short = strip_html((meta.get("LicenseShortName", {}) or {}).get("value", ""))
    s = short.lower()
    if lic in ("pd", "cc0") or s.startswith("public domain") or s.startswith("cc0") or s.startswith("pd"):
        return short or lic
    return None


def from_commons(query: str, limit: int) -> list[dict]:
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "generator": "search", "gsrsearch": f"{query} filetype:bitmap", "gsrnamespace": "6",
        "gsrlimit": str(min(50, limit * 4)),
        "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": str(MAX_SIDE),
    })
    data = get_json(f"https://commons.wikimedia.org/w/api.php?{params}")
    pages = sorted((data.get("query") or {}).get("pages", []), key=lambda p: p.get("index", 0))
    out = []
    for p in pages:
        if len(out) >= limit:
            break
        info = (p.get("imageinfo") or [{}])[0]
        if info.get("mime") not in ("image/jpeg", "image/png", "image/tiff"):
            continue
        meta = info.get("extmetadata", {})
        lic = commons_license_ok(meta)
        if not lic:
            continue
        out.append({
            "source": "commons", "id": str(p.get("pageid")),
            "title": strip_html(meta.get("ObjectName", {}).get("value", "")) or p.get("title", "").removeprefix("File:"),
            "artist": strip_html(meta.get("Artist", {}).get("value", "")),
            "date": strip_html(meta.get("DateTimeOriginal", {}).get("value", "")),
            "license": f"{lic} (Wikimedia Commons)",
            "page": info.get("descriptionurl", ""),
            "image_url": info.get("thumburl") or info.get("url"),
        })
    return out


SOURCES = {"met": from_met, "aic": from_aic, "commons": from_commons}


# ---------- descarga, normalización y hoja de contactos ----------

def save_image(c: dict, path: Path) -> tuple[int, int] | None:
    for url in [c["image_url"], c.get("fallback_url")]:
        if not url:
            continue
        try:
            img = Image.open(io.BytesIO(get(url, {"AIC-User-Agent": UA} if c["source"] == "aic" else None)))
            img.load()
            break
        except Exception as e:  # noqa: BLE001
            print(f"  no se pudo bajar {url}: {e}")
            img = None
    if img is None:
        return None
    img = img.convert("RGB")
    if max(img.size) < MIN_SIDE:
        print(f"  descartada por chica ({img.size[0]}x{img.size[1]}): {c['title'][:50]}")
        return None
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    img.save(path, "JPEG", quality=90)
    return img.size


def contact_sheet(items: list[dict], folder: Path) -> None:
    if not items:
        return
    cols, cell = 3, 360
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 40)), (14, 12, 10))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
    except OSError:
        font = ImageFont.load_default()
    for i, it in enumerate(items):
        im = Image.open(folder / it["file"])
        im.thumbnail((cell - 10, cell - 10))
        x, y = (i % cols) * cell, (i // cols) * (cell + 40)
        sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
        draw.text((x + 10, y + cell + 4), f"{it['n']:02d} · {it['source']}", fill=(212, 175, 95), font=font)
    sheet.save(folder / "hoja.jpg", "JPEG", quality=85)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--limit", type=int, default=12, help="máximo por fuente")
    ap.add_argument("--sources", default="met,aic,commons")
    ap.add_argument("--out", default="imagenes")
    a = ap.parse_args()

    folder = Path(a.out) / slugify(a.query)
    folder.mkdir(parents=True, exist_ok=True)
    items, n = [], 0
    for name in [s.strip() for s in a.sources.split(",") if s.strip()]:
        if name not in SOURCES:
            print(f"Fuente desconocida: {name}")
            continue
        print(f"== {name}")
        try:
            cands = SOURCES[name](a.query, a.limit)
        except Exception as e:  # noqa: BLE001
            print(f"  la fuente falló: {e}")
            continue
        print(f"  {len(cands)} candidatas de dominio público")
        for c in cands:
            n += 1
            fname = f"{n:02d}-{c['source']}-{c['id']}.jpg"
            size = save_image(c, folder / fname)
            if not size:
                n -= 1
                continue
            item = {k: v for k, v in c.items() if k != "fallback_url"}
            item.update({"n": n, "file": fname, "width": size[0], "height": size[1]})
            items.append(item)
            print(f"  {fname}  {size[0]}x{size[1]}  {c['title'][:60]}")

    (folder / "creditos.json").write_text(json.dumps({"query": a.query, "images": items}, ensure_ascii=False, indent=2), encoding="utf-8")
    md = [f"# Imágenes: {a.query}", "", "Todas de dominio público o CC0. Verificar la página de cada obra antes de publicar.", ""]
    for it in items:
        md.append(f"**{it['n']:02d}** · {it['title'] or '(sin título)'} — {it['artist'] or 'autor desconocido'}"
                  f"{', ' + it['date'] if it['date'] else ''}  \n{it['license']} · {it['width']}x{it['height']} · [{it['source']}]({it['page']}) · `{it['file']}`\n")
    (folder / "creditos.md").write_text("\n".join(md), encoding="utf-8")
    contact_sheet(items, folder)
    print(f"\n{len(items)} imágenes en {folder}")
    if not items:
        sys.exit(1)


if __name__ == "__main__":
    main()
