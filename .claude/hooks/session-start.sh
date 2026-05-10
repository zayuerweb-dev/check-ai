#!/bin/bash
set -euo pipefail

SKILLS_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}/.claude/skills"
mkdir -p "$SKILLS_DIR"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

clone_shallow() {
  local url="$1" dest="$2"
  if [ -d "$dest/.git" ]; then
    git -C "$dest" fetch --depth=1 origin HEAD >/dev/null 2>&1 || true
    git -C "$dest" reset --hard FETCH_HEAD >/dev/null 2>&1 || true
  else
    rm -rf "$dest"
    git clone --depth=1 "$url" "$dest" >/dev/null 2>&1
  fi
}

# Subset extraction: clone to tmp, copy specific skill subdir
extract_skill() {
  local repo_url="$1" subpath="$2" name="$3"
  local tmpclone="$TMP/$(basename "$repo_url" .git)-$name"
  if [ ! -d "$tmpclone" ]; then
    git clone --depth=1 --filter=blob:none --sparse "$repo_url" "$tmpclone" >/dev/null 2>&1
    git -C "$tmpclone" sparse-checkout set "$subpath" >/dev/null 2>&1
  fi
  rm -rf "$SKILLS_DIR/$name"
  mkdir -p "$SKILLS_DIR/$name"
  if [ -d "$tmpclone/$subpath" ]; then
    cp -r "$tmpclone/$subpath/." "$SKILLS_DIR/$name/"
  fi
}

echo "[session-start] Installing skills into $SKILLS_DIR"

extract_skill https://github.com/anthropics/skills.git skills/skill-creator skill-creator || true
extract_skill https://github.com/anthropics/skills.git skills/frontend-design frontend-design || true
extract_skill https://github.com/vercel-labs/skills.git skills/find-skills find-skills || true

clone_shallow https://github.com/obra/superpowers.git "$SKILLS_DIR/superpowers" || true
clone_shallow https://github.com/garrytan/gstack.git "$SKILLS_DIR/gstack" || true
clone_shallow https://github.com/mattpocock/skills.git "$SKILLS_DIR/mattpocock-skills" || true
clone_shallow https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git "$SKILLS_DIR/ui-ux-pro-max-skill" || true

echo "[session-start] Skills installed:"
ls -1 "$SKILLS_DIR" || true

echo "[session-start] Done."
