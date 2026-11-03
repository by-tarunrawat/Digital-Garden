import json
import os
import re
from pathlib import Path

# Paths
CONTENT_DIR = Path(".")
MANIFEST_PATH = CONTENT_DIR / "triage_manifest.json"
MODULAR_DIR = CONTENT_DIR / "Fiction_Vault" / "Modular_Assets"

MODULAR_FILES = {
    "voice": MODULAR_DIR / "Voice_and_Dialogue_Scraps.md",
    "character": MODULAR_DIR / "Character_Dossiers.md",
    "craft": MODULAR_DIR / "Craft_and_Resistance_Scraps.md"
}

def read_file_safe(file_path: Path) -> str:
    """Read a file using UTF-8, CP1252, or replacement fallback."""
    try:
        return file_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return file_path.read_text(encoding="cp1252")
        except UnicodeDecodeError:
            return file_path.read_text(encoding="utf-8", errors="replace")

def append_to_modular(snippet_data: dict):
    """Safely append harvested quotes into targeted sub-sections of modular asset files."""
    section = snippet_data.get("section", "voice")
    sub_section = snippet_data.get("sub_section", "")
    snippet = snippet_data.get("snippet", "").strip()

    if not snippet:
        return

    target_file = MODULAR_FILES.get(section, MODULAR_FILES["voice"])
    if not target_file.exists():
        return

    content = read_file_safe(target_file)

    header_pattern = rf"(###\s+{re.escape(sub_section)}\s*\n)"
    match = re.search(header_pattern, content)

    if match:
        insert_pos = match.end()
        new_content = content[:insert_pos] + "\n" + snippet + "\n" + content[insert_pos:]
    else:
        new_content = content.rstrip() + f"\n\n### {sub_section}\n\n{snippet}\n"

    target_file.write_text(new_content, encoding="utf-8")

def process_triage():
    if not MANIFEST_PATH.exists():
        print("[-] triage_manifest.json not found!")
        return

    manifest_text = read_file_safe(MANIFEST_PATH)
    try:
        manifest = json.loads(manifest_text)
    except Exception as e:
        print(f"[-] Error parsing manifest JSON: {e}")
        return

    items = manifest.get("items", [])
    if not items:
        print("[-] No items found in manifest.")
        return

    for item in items:
        src_rel = item.get("source_path")
        target_dir_rel = item.get("target_folder")
        new_filename = item.get("new_filename")

        src_path = CONTENT_DIR / src_rel
        if not src_path.exists():
            print(f"[!] Source file not found, skipping: {src_rel}")
            continue

        target_dir = CONTENT_DIR / target_dir_rel
        target_dir.mkdir(parents=True, exist_ok=True)
        dest_path = target_dir / new_filename

        raw_content = read_file_safe(src_path)

        # Harvest snippets
        snippets = item.get("harvest_snippets", [])
        if isinstance(snippets, list):
            for snip in snippets:
                if isinstance(snip, dict):
                    append_to_modular(snip)
            if snippets:
                print(f"[+] Harvested {len(snippets)} snippet(s) into modular assets")

        # Handle Checklist items
        checklist_items = item.get("checklist", [])
        checklist_str = ""
        if checklist_items:
            checklist_str = "\n".join(checklist_items)

        # Handle Related Notes
        related_notes = item.get("related_notes", [])
        related_str = ""
        if related_notes:
            related_str = "\n".join([f"- {note}" for note in related_notes])

        parent_pillar = item.get("parent_pillar", "")

        # Format YAML Frontmatter
        frontmatter = f"""---
title: "{item.get('title', new_filename)}"
date: {item.get('date', '2019-01-01')}
draft: false
type: {item.get('type', 'seed')}
medium: "{item.get('medium', 'essay')}"
era: "{item.get('era', '2018_Crucible')}"
status: triaged
verdict: "{item.get('verdict', 'Garden Seed')}"
stage: {item.get('stage', 'seed')}
core_theme: "{item.get('core_theme', '')}"
core_spark: "{item.get('core_spark', '')}"
location: "{target_dir_rel}"
parent_pillar: "{parent_pillar}"
---

> [!abstract] Editorial Diagnosis & Triage
> **Verdict:** {item.get('verdict', 'Garden Seed')} ({item.get('medium', 'essay')} | {item.get('era', '2018_Crucible')})
> **Core Spark:** {item.get('core_spark', '')}
> **Actionable Next Steps:**
{chr(10).join(['> - ' + c.replace('[ ] ', '').replace('[x] ', '') for c in checklist_items]) if checklist_items else '> - None'}

---

{raw_content.strip()}

---

## Connected Nodes
{related_str if related_str else '- None'}
"""

        dest_path.write_text(frontmatter, encoding="utf-8")
        src_path.unlink()
        print(f"[✔] Triaged: {src_rel} -> {target_dir_rel}/{new_filename}")

    print("\n[✔] Triage batch processing complete!")

if __name__ == "__main__":
    process_triage()
