"""Perplexity, through the Agent API (POST /v1/responses).

Perplexity retired Sonar Chat Completions (/chat/completions) on 27 Sept 2026.
Sonar is now served by the Agent API as `perplexity/sonar`, and the API only
searches the web when the request includes the `web_search` tool.

The response follows the Responses format: `output` is a list of items. The
answer is in the `message` items (`content[].text`), and the sources sit in
`search_results` items (`results[].url`). Answer text can also carry
`url_citation` annotations, which are added too.
"""

from .base import EngineError, EngineResult, request_json, unique

API_URL = "https://api.perplexity.ai/v1/responses"


def ask(prompt: str, *, api_key: str, model: str, country: str = "") -> EngineResult:
    if not model:
        raise EngineError("no model set under models.perplexity in client.yaml")
    if "/" not in model:  # "sonar" -> "perplexity/sonar"
        model = f"perplexity/{model}"

    web_search = {"type": "web_search"}
    if country:
        web_search["filters"] = {"user_location": {"country": country}}

    data = request_json(
        "POST",
        API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": model, "input": prompt, "tools": [web_search]},
    )
    return parse(data)


def parse(data: dict) -> EngineResult:
    if data.get("error"):
        raise EngineError(f"API error: {data['error']}")

    texts, urls = [], []
    for item in data.get("output") or []:
        kind = item.get("type")
        if kind == "message":
            for part in item.get("content") or []:
                if part.get("text"):
                    texts.append(part["text"])
                for ann in part.get("annotations") or []:
                    urls.append(ann.get("url"))
        elif kind == "search_results":
            urls.extend(r.get("url") for r in item.get("results") or [])

    answer = "\n".join(texts).strip() or (data.get("output_text") or "").strip()
    if not answer:
        raise EngineError(f"no answer text in response (status: {data.get('status')})")
    return EngineResult(answer_text=answer, cited_urls=unique(urls))
