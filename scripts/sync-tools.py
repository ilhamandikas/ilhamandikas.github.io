#!/usr/bin/env python3
"""Sync tool metadata from the source of truth.

A tool is considered "done" as soon as it has a body partial in
layouts/partials/tools/body/. This script keeps data/tools.yaml and the
content front matter in step with that, so there is no manual bookkeeping.
"""
import pathlib
import re
import subprocess
import sys

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required: pip install pyyaml")

ROOT = pathlib.Path(__file__).resolve().parent.parent


def last_change(slug: str) -> str | None:
    """Date of the last commit that touched this tool's implementation.

    Deliberately derived from the JS and the body partial only. The content
    file is rewritten by this script, so counting it would make every sync look
    like a change to every tool and the dates would drift forever.
    """
    paths = [
        f"assets/js/tools/{slug}.js",
        f"layouts/partials/tools/body/{slug}.html",
    ]
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", *paths],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return out.stdout.strip() or None


def existing_lastmod(path: pathlib.Path) -> str | None:
    """Keep the date we stamped last time when git history is not available."""
    found = re.search(r"^lastmod:\s*(\S+)\s*$", path.read_text(), re.M)
    return found.group(1) if found else None


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
        # A last-modified date gives search engines a freshness signal, and the
        # sitemap only carries one if the page has it.
        changed = last_change(slug) or existing_lastmod(path)
        if changed:
            front += f"\nlastmod: {changed}"
        path.write_text(f"---\n{front}\n---\n")

    # 3) the long-form guide keys must match real tools, otherwise a typo would
    #    silently render nothing and nobody would notice
    guides_path = ROOT / "data/tool-guides.yaml"
    if guides_path.exists():
        guides = yaml.safe_load(guides_path.read_text()) or {}
        unknown = sorted(set(guides) - set(meta))
        if unknown:
            sys.exit(
                "data/tool-guides.yaml has entries for tools that do not exist: "
                + ", ".join(unknown)
            )

    total = len(meta)
    print(f"synced {total} tools — {len(bodies)} done, {total - len(bodies)} planned")


if __name__ == "__main__":
    main()
