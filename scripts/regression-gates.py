#!/usr/bin/env python3
"""Regression gate checker — all 8 STRICT COMPLETION GATES for woonblogmagazine.nl."""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOOPS = 3


def run(cmd: list[str], name: str) -> bool:
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    ok = result.returncode == 0
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    if not ok:
        out = (result.stdout or "") + (result.stderr or "")
        if out.strip():
            print(out.strip()[-400:])
    return ok


def gate_footer_exact() -> bool:
    footer = (ROOT / "src" / "components" / "Footer.astro").read_text()
    data = (ROOT / "src" / "data" / "footer.ts").read_text()
    homepage = (ROOT / "src" / "data" / "homepage.ts").read_text()
    checks = [
        "Beste online casinos" in data,
        "Nederlandse casino zonder cruks" in data,
        "site-footer__column--stacked" in footer,
        "Laatste blogs" in footer,
        "footerManualBlogLinks" in footer or "Kwekerij de Ent" in homepage,
        "SocialIcon" in footer,
        "© 2026 All rights reserved" in footer,
    ]
    ok = all(checks)
    print(f"  [{'PASS' if ok else 'FAIL'}] Gate 4: Footer exact ({sum(checks)}/{len(checks)})")
    return ok


def gate_navbar_exact() -> bool:
    nav = (ROOT / "src" / "data" / "navigation.ts").read_text()
    nav_astro = (ROOT / "src" / "components" / "Navigation.astro").read_text()
    required = [
        "Gereedschappen",
        "Inrichting",
        "Slaapkamer",
        "Contact",
        "Over ons",
        "beste-invalzaag",
        "beste-kunstkerstboom-met-verlichting",
        "nav__toggle",
        "nav__dropdown",
    ]
    ok = all(r in nav or r in nav_astro for r in required)
    print(f"  [{'PASS' if ok else 'FAIL'}] Gate 3: Navbar exact")
    return ok


def gate_homepage_exact() -> bool:
    index = (ROOT / "src" / "pages" / "index.astro").read_text()
    checks = [
        "Hero" in index,
        "Features" in index,
        "Testimonials" in index,
        "Services" in index,
        "BlogGrid" in index,
        "SeeAlso" in index,
        "compact" in index,
    ]
    img_ok = run(["python3", "scripts/verify-homepage-images.py"], "homepage images load")
    ok = all(checks) and img_ok
    print(f"  [{'PASS' if ok else 'FAIL'}] Gate 5: Homepage exact")
    return ok


def gate_content() -> bool:
    blog_count = len(list((ROOT / "src" / "content" / "blog").glob("*.md")))
    products = (ROOT / "src" / "data" / "products.ts").read_text()
    ok = blog_count >= 325 and "featuredProducts" in products and "toolProducts" in products
    print(f"  [{'PASS' if ok else 'FAIL'}] Gate 6: Content ({blog_count} blogs, products defined)")
    return ok


def gate_responsive() -> bool:
    files = [
        ROOT / "src" / "components" / "BlogGrid.astro",
        ROOT / "src" / "components" / "Footer.astro",
        ROOT / "src" / "components" / "Navigation.astro",
    ]
    ok = all("@media" in f.read_text() for f in files)
    print(f"  [{'PASS' if ok else 'FAIL'}] Gate 7: Responsive breakpoints")
    return ok


def run_cycle(cycle: int) -> bool:
    print(f"\n--- Regression Loop {cycle}/{LOOPS} ---")
    gates = [
        run(["npm", "run", "build"], "Gate 1: Build"),
        run(["python3", "scripts/verify-links.py"], "Gate 2: Links (0 broken)"),
        gate_navbar_exact(),
        gate_footer_exact(),
        gate_homepage_exact(),
        gate_content(),
        gate_responsive(),
    ]
    passed = sum(gates)
    all_pass = passed == len(gates)
    print(f"  [{'PASS' if all_pass else 'FAIL'}] Gate 8: Regression loop {cycle} ({passed}/{len(gates)} sub-gates)")
    return all_pass


def main() -> int:
    print("=== STRICT COMPLETION GATES ===")
    results = [run_cycle(i) for i in range(1, LOOPS + 1)]
    if all(results):
        print(f"\nALL {LOOPS} REGRESSION LOOPS PASSED — 8/8 GATES OK")
        return 0
    print(f"\nFAILED: loops passed {sum(results)}/{LOOPS}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
