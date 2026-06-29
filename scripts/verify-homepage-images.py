#!/usr/bin/env python3
"""Verify homepage and product images referenced on the site exist under public/."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
PRODUCTS_TS = ROOT / "src" / "data" / "products.ts"

REQUIRED_BRAND = [
    "/images/brand/logo.png",
    "/images/brand/hero-bg.png",
    "/images/brand/tristan.png",
]


def product_image_paths() -> list[str]:
    text = PRODUCTS_TS.read_text(encoding="utf-8")
    return sorted(set(re.findall(r"['\"](/images/products/[^'\"]+)['\"]", text)))


def public_path(url_path: str) -> Path:
    return PUBLIC / url_path.lstrip("/")


def main() -> int:
    missing: list[str] = []
    checked: list[str] = []

    for path in REQUIRED_BRAND + product_image_paths():
        checked.append(path)
        if not public_path(path).is_file():
            missing.append(path)

    print(f"Checked {len(checked)} homepage/product image paths.")
    if missing:
        print("MISSING:")
        for m in missing:
            print(f"  {m}")
        return 1

    print("All required images present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
