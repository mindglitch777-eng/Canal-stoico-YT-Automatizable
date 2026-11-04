#!/usr/bin/env bash
# publish_outputs.sh — Sube los resultados de un workflow a la rama `salidas` del repo.
#
# Uso (dentro de GitHub Actions, con permissions: contents: write):
#   bash tools/publish_outputs.sh <carpeta_local> <carpeta_en_salidas> "<mensaje>"
#
# Por qué: los artifacts de Actions son ZIP y pesan para abrir desde el celular, y las
# sesiones en la nube de Claude Code no pueden bajarlos. La rama `salidas` se ve en
# github.com (los MP3, MP4 e imágenes se abren directo) y Claude la trae con git fetch.
# La rama no tiene historia común con main: solo guarda resultados.
set -euo pipefail

SRC="$1"
DEST="$2"
MSG="${3:-Resultados de $GITHUB_WORKFLOW}"
BRANCH="salidas"

[ -d "$SRC" ] || { echo "No existe $SRC"; exit 1; }

WORK="$(mktemp -d)"
git config --global user.name "github-actions[bot]"
git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"

for intento in 1 2 3 4; do
  rm -rf "$WORK/repo"
  if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    git clone --quiet --depth 1 --branch "$BRANCH" "$(git remote get-url origin)" "$WORK/repo"
  else
    git init --quiet "$WORK/repo"
    git -C "$WORK/repo" checkout --quiet --orphan "$BRANCH"
    git -C "$WORK/repo" remote add origin "$(git remote get-url origin)"
    printf '# Salidas\n\nResultados de los workflows (voces, videos, imágenes). No se mezcla con main.\n' > "$WORK/repo/README.md"
  fi
  # La URL de origin de actions/checkout no lleva el token; se lo pasamos con el header que ya configuró.
  HEADER="$(git config --get http.https://github.com/.extraheader || true)"
  [ -n "$HEADER" ] && git -C "$WORK/repo" config http.https://github.com/.extraheader "$HEADER"

  rm -rf "$WORK/repo/$DEST"
  mkdir -p "$WORK/repo/$DEST"
  cp -R "$SRC"/. "$WORK/repo/$DEST"/
  git -C "$WORK/repo" add -A
  if git -C "$WORK/repo" diff --cached --quiet; then echo "Sin cambios"; exit 0; fi
  git -C "$WORK/repo" commit --quiet -m "$MSG"
  if git -C "$WORK/repo" push --quiet origin "$BRANCH"; then
    echo "Publicado en la rama $BRANCH: $DEST"
    echo "https://github.com/$GITHUB_REPOSITORY/tree/$BRANCH/$DEST"
    exit 0
  fi
  echo "Falló el push (intento $intento), reintento..."
  sleep $((intento * 3))
done
exit 1
