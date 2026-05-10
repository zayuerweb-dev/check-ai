#!/bin/bash
set -euo pipefail

SKILLS_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}/.claude/skills"
mkdir -p "$SKILLS_DIR"

# Only download skills that are missing. Skills are committed to the repo,
# so this hook is a safety net for fresh clones / new skill entries.

need_any=0
for d in skill-creator frontend-design find-skills superpowers gstack mattpocock-skills ui-ux-pro-max-skill; do
  if [ ! -d "$SKILLS_DIR/$d" ] || [ -z "$(ls -A "$SKILLS_DIR/$d" 2>/dev/null || true)" ]; then
    need_any=1
    break
  fi
done

if [ "$need_any" -eq 0 ]; then
  echo "[session-start] Skills already present, skipping download."
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

extract_skill() {
  local repo_url="$1" subpath="$2" name="$3"
  [ -d "$SKILLS_DIR/$name" ] && [ -n "$(ls -A "$SKILLS_DIR/$name" 2>/dev/null || true)" ] && return 0
  local tmpclone="$TMP/$(basename "$repo_url" .git)-$name"
  git clone --depth=1 --filter=blob:none --sparse "$repo_url" "$tmpclone" >/dev/null 2>&1
  git -C "$tmpclone" sparse-checkout set "$subpath" >/dev/null 2>&1
  mkdir -p "$SKILLS_DIR/$name"
  [ -d "$tmpclone/$subpath" ] && cp -r "$tmpclone/$subpath/." "$SKILLS_DIR/$name/"
}

clone_full() {
  local url="$1" dest="$2"
  [ -d "$dest" ] && [ -n "$(ls -A "$dest" 2>/dev/null || true)" ] && return 0
  git clone --depth=1 "$url" "$dest" >/dev/null 2>&1
}

echo "[session-start] Fetching missing skills..."
extract_skill https://github.com/anthropics/skills.git skills/skill-creator skill-creator || true
extract_skill https://github.com/anthropics/skills.git skills/frontend-design frontend-design || true
extract_skill https://github.com/vercel-labs/skills.git skills/find-skills find-skills || true
clone_full https://github.com/obra/superpowers.git "$SKILLS_DIR/superpowers" || true
clone_full https://github.com/garrytan/gstack.git "$SKILLS_DIR/gstack" || true
clone_full https://github.com/mattpocock/skills.git "$SKILLS_DIR/mattpocock-skills" || true
clone_full https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SKILLS_DIR/ui-ux-pro-max-skill" || true
echo "[session-start] Done."
