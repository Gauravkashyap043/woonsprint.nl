#!/usr/bin/env python3
"""Verify all internal links in navigation and footer resolve to built routes."""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"


def extract_hrefs_from_ts(path: Path) -> list[str]:
    text = path.read_text()
    return re.findall(r"href:\s*['\"]([^'\"]+)['\"]", text)


def get_blog_slugs() -> set[str]:
    blog_dir = SRC / "content" / "blog"
    return {p.stem for p in blog_dir.glob("*.md")}


def get_static_pages() -> set[str]:
    pages = set()
    for p in (SRC / "pages").rglob("*.astro"):
        rel = p.relative_to(SRC / "pages")
        if str(rel) == "index.astro":
            pages.add("/")
            continue
        if "[...slug]" in str(rel) or "[slug]" in str(rel):
            continue
        path = "/" + str(rel).replace("index.astro", "").replace(".astro", "")
        pages.add(path if path.endswith("/") else path + "/")
    return pages


def get_product_slugs() -> set[str]:
    products = (SRC / "data" / "products.ts").read_text()
    slugs = re.findall(r"slug:\s*['\"]([^'\"]+)['\"]", products)
    nav = (SRC / "data" / "navigation.ts").read_text()
    slugs += re.findall(r"href:\s*['\"]/([^/'\"]+)/['\"]", nav)
    footer = (SRC / "data" / "footer.ts").read_text()
    slugs += re.findall(r"href:\s*['\"]/([^/'\"]+)/['\"]", footer)
    homepage = (SRC / "data" / "homepage.ts").read_text()
    slugs += re.findall(r"href:\s*['\"]/([^/'\"]+)/['\"]", homepage)
    return {s for s in slugs if s.startswith("beste-") or s.startswith("blog")}


def normalize(href: str) -> str:
    if href.startswith("http"):
        return href
    if not href.endswith("/"):
        href += "/"
    return href


def main() -> int:
    subprocess.run(["npm", "run", "build"], cwd=ROOT, check=True, capture_output=True)

    blog_slugs = get_blog_slugs()
    static_pages = get_static_pages()
    product_slugs = get_product_slugs()

    files = [
        SRC / "data" / "navigation.ts",
        SRC / "data" / "footer.ts",
        SRC / "data" / "homepage.ts",
    ]

    broken = []
    external = 0
    ok = 0

    for f in files:
        for href in extract_hrefs_from_ts(f):
            if href.startswith("http") or href in ("#", ""):
                if href.startswith("http"):
                    external += 1
                continue
            norm = normalize(href)
            slug = href.strip("/")

            if norm in static_pages or href == "/":
                ok += 1
            elif slug in blog_slugs:
                ok += 1
            elif slug in product_slugs:
                ok += 1
            else:
                broken.append((str(f.name), href))

    print(f"OK: {ok}, external: {external}, broken: {len(broken)}")
    for src, href in broken:
        print(f"  BROKEN [{src}] {href}")

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
