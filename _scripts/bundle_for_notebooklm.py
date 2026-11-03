import os
from pathlib import Path

VAULT_ROOT = Path(__file__).parent.resolve()
OUTPUT_DIR = VAULT_ROOT / "NotebookLM_Bundles"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SEED_DIR = VAULT_ROOT / "01_Seed"
FICTION_DIR = VAULT_ROOT / "Fiction_Vault"

PILLAR_MAP = {
    "MOC_01": OUTPUT_DIR / "Bundle_MOC_01_Cognitive_Hygiene.md",
    "MOC_02": OUTPUT_DIR / "Bundle_MOC_02_Autonomy_and_Script.md",
    "MOC_03": OUTPUT_DIR / "Bundle_MOC_03_Cultural_Critique.md",
}


def read_file_safely(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"[!] Warning reading {path.name}: {e}")
        return ""


def bundle_seeds():
    bundles = {k: [] for k in PILLAR_MAP}
    uncategorized = []

    if SEED_DIR.exists():
        for file in sorted(SEED_DIR.glob("*.md")):
            content = read_file_safely(file)
            assigned = False
            for k in PILLAR_MAP:
                if k in file.name or f'parent_pillar: "{k}' in content or f'[[{k}' in content:
                    bundles[k].append((file.name, content))
                    assigned = True
                    break
            if not assigned:
                uncategorized.append((file.name, content))

    # Append uncategorized seeds to MOC_01 by default
    bundles["MOC_01"].extend(uncategorized)

    for k, target_path in PILLAR_MAP.items():
        docs = bundles[k]
        output = [f"# Synthesis Source Bundle: {k}\n"]
        output.append(f"> Auto-generated bundle containing {len(docs)} seed notes.\n\n---\n")
        for fname, text in docs:
            output.append(f"\n\n# FILE: {fname}\n\n{text}\n\n---\n")
        target_path.write_text("".join(output), encoding="utf-8")
        print(f"[✔] Generated: {target_path.name} ({len(docs)} seed notes)")


def bundle_fiction():
    target_path = OUTPUT_DIR / "Bundle_Fiction_Swipe_and_Spines.md"
    output = ["# Synthesis Source Bundle: Fiction Vault & Modular Assets\n\n---\n"]
    count = 0

    if FICTION_DIR.exists():
        for file in sorted(FICTION_DIR.rglob("*.md")):
            # Skip cold storage raw logs unless they contain key genesis notes
            if "Cold_Storage" in str(file) and "Genesis_Log" not in file.name:
                continue
            content = read_file_safely(file)
            output.append(f"\n\n# FILE: {file.name} (Path: {file.relative_to(FICTION_DIR)})\n\n{text if 'text' in locals() else content}\n\n---\n")
            count += 1

    target_path.write_text("".join(output), encoding="utf-8")
    print(f"[✔] Generated: {target_path.name} ({count} fiction & modular assets)")


if __name__ == "__main__":
    bundle_seeds()
    bundle_fiction()
    print("\n[★] NotebookLM bundling complete! Files ready in quartz/content/NotebookLM_Bundles/")