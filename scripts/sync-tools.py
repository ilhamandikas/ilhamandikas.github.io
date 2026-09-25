#!/usr/bin/env python3
"""Sync tool metadata from the source of truth.

A tool is considered "done" as soon as it has a body partial in
layouts/partials/tools/body/. This script keeps data/tools.yaml and the
content front matter in step with that, so there is no manual bookkeeping.
"""
import pathlib
import re
import sys

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required: pip install pyyaml")

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> None:
    bodies = {p.stem for p in (ROOT / "layouts/partials/tools/body").glob("*.html")}
    data = yaml.safe_load((ROOT / "data/tools.yaml").read_text())
    meta = {t["slug"]: (t["name"], t["desc"]) for c in data for t in c["tools"]}

    # 1) status column in data/tools.yaml
    lines = (ROOT / "data/tools.yaml").read_text().splitlines(keepends=True)
    current = None
    for i, line in enumerate(lines):
        found = re.match(r"\s*- slug:\s*(\S+)", line)
        if found:
            current = found.group(1)
        if current and re.match(r"\s*status:\s*\w+\s*$", line):
            want = "done" if current in bodies else "planned"
            lines[i] = re.sub(r"(status:\s*)\w+", rf"\g<1>{want}", line)
    (ROOT / "data/tools.yaml").write_text("".join(lines))

    # 2) content front matter
    for slug, (name, desc) in meta.items():
        path = ROOT / f"content/tools/{slug}.md"
        if not path.exists():
            continue
        name = name.replace('"', '\\"')
        desc = desc.replace('"', '\\"')
        front = f'title: "{name}"\ndescription: "{desc}"'
        if slug in bodies and (ROOT / f"assets/js/tools/{slug}.js").exists():
            front += f'\njs: "js/tools/{slug}.js"'
        path.write_text(f"---\n{front}\n---\n")

    total = len(meta)
    print(f"synced {total} tools — {len(bodies)} done, {total - len(bodies)} planned")


if __name__ == "__main__":
    main()
