"""Mention, position and citation logic. Plain string matching, no LLM."""

import re
from urllib.parse import urlparse


def _pattern(names: list[str]) -> re.Pattern | None:
    """Case-insensitive match for any of the names as a whole word or phrase.

    Whole-word so "Example" does not match inside "Examples" or "counterexample".
    Longer names go first so "Example Co" wins over "Example" at the same spot.
    """
    names = sorted({n.strip() for n in names if n.strip()}, key=len, reverse=True)
    if not names:
        return None
    alternatives = "|".join(re.escape(n) for n in names)
    return re.compile(rf"(?<!\w)(?:{alternatives})(?!\w)", re.IGNORECASE)


def first_mention(text: str, names: list[str]) -> int | None:
    """Character offset of the first mention of any name, or None if none."""
    pattern = _pattern(names)
    match = pattern.search(text) if pattern else None
    return match.start() if match else None


def domain_of(url: str) -> str:
    """Hostname without "www.", e.g. "https://www.Example.com/a" -> "example.com"."""
    host = urlparse(url if "//" in url else f"//{url}").hostname or ""
    return host.lower().removeprefix("www.")


def url_matches_domain(url: str, domain: str) -> bool:
    """True if the URL is on the domain or one of its subdomains (blog.example.com)."""
    domain = domain.lower().removeprefix("www.")
    host = domain_of(url)
    return bool(domain) and (host == domain or host.endswith("." + domain))


def analyse(answer_text: str, cited_urls: list[str], cfg) -> dict:
    """Return the detection columns for one answer."""
    text = answer_text or ""
    brand_at = first_mention(text, cfg.brand_names)
    competitor_at = {c.name: first_mention(text, c.names) for c in cfg.competitors}

    # rank everyone mentioned by where they first appear (1 = named first)
    found = [(pos, name) for name, pos in competitor_at.items() if pos is not None]
    if brand_at is not None:
        found.append((brand_at, None))  # None marks the client brand
    order = [name for _, name in sorted(found, key=lambda f: f[0])]

    return {
        "brand_mentioned": brand_at is not None,
        "brand_position": order.index(None) + 1 if brand_at is not None else None,
        "domain_cited": any(url_matches_domain(u, cfg.domain) for u in cited_urls),
        "competitors_mentioned": [name for name in order if name is not None],
    }
