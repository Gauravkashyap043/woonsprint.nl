#!/usr/bin/env python3
"""Verify homepage images referenced in src/data/homepage.ts exist under public/."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
HOMEPAGE_TS = ROOT / "src" / "data" / "homepage.ts"
BRAND_PATHS = [
    "/wp-content/uploads/2022/11/Frame-182.svg",
    "/wp-content/uploads/2022/11/Frame-19.svg",
    "/wp-content/uploads/2022/11/Frame1.svg",
    "/wp-content/uploads/2022/11/Frame2.svg",
    "/wp-content/uploads/2022/11/Frame3.svg",
    "/wp-content/uploads/2022/11/cropped-Group-11-32x32.png",
    "/images/brand/hero-bg.png",
]


def homepage_image_paths() -> list[str]:
    text = HOMEPAGE_TS.read_text(encoding="utf-8")
    return sorted(set(re.findall(r"['\"](/(?:wp-content|images)/[^'\"]+)['\"]", text)))


def public_path(url_path: str) -> Path:
    return PUBLIC / url_path.lstrip("/")


def main() -> int:
    paths = sorted(set(BRAND_PATHS + homepage_image_paths()))
    missing: list[str] = []

    for path in paths:
        if not public_path(path).is_file():
            missing.append(path)

    print(f"Checked {len(paths)} homepage image paths.")
    if missing:
        print("MISSING:")
        for item in missing:
            print(f"  {item}")
        return 1

    print("All required images present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
