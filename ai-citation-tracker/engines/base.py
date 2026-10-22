"""Shared pieces for every engine: the result type and a POST/GET helper with retries."""

import time
from dataclasses import dataclass, field

import requests

MAX_RETRIES = 2          # retries after the first attempt
BACKOFF_SECONDS = 2      # waits 2s, then 4s
TIMEOUT_SECONDS = 90
RETRY_STATUS = {429, 500, 502, 503, 504}


class EngineError(Exception):
    """A call failed in a way worth recording in the CSV's error column."""


@dataclass
class EngineResult:
    answer_text: str
    cited_urls: list[str] = field(default_factory=list)


def unique(urls) -> list[str]:
    """Drop blanks and repeats, keeping the order the API gave."""
    seen, out = set(), []
    for url in urls:
        if isinstance(url, str) and url.strip() and url not in seen:
            seen.add(url)
            out.append(url.strip())
    return out


def request_json(method: str, url: str, **kwargs) -> dict:
    """Send a request and return the JSON body, retrying network errors, 429s and 5xx."""
    kwargs.setdefault("timeout", TIMEOUT_SECONDS)
    last_error = ""
    for attempt in range(MAX_RETRIES + 1):
        if attempt:
            time.sleep(BACKOFF_SECONDS * 2 ** (attempt - 1))
        try:
            resp = requests.request(method, url, **kwargs)
        except requests.RequestException as e:
            last_error = f"network error: {e}"
            continue
        if resp.status_code in RETRY_STATUS:
            last_error = f"HTTP {resp.status_code}: {resp.text[:300]}"
            continue
        if resp.status_code >= 400:
            raise EngineError(f"HTTP {resp.status_code}: {resp.text[:300]}")
        try:
            return resp.json()
        except ValueError as e:
            raise EngineError(f"response was not JSON: {resp.text[:300]}") from e
    raise EngineError(f"failed after {MAX_RETRIES + 1} attempts, last error: {last_error}")
