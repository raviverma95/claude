"""Offline tests for the Perplexity engine. No API key or network needed.

Run with: python -m unittest discover tests
"""

import io
import json
import unittest
from contextlib import redirect_stdout
from unittest import mock

import requests

import run
from engines import base, perplexity
from engines.base import EngineError


def agent_response(prompt: str) -> dict:
    """A response in the Agent API's documented shape."""
    return {
        "id": "resp_123",
        "object": "response",
        "status": "completed",
        "model": "perplexity/sonar",
        "output": [
            {"type": "search_results", "results": [
                {"title": "Top removalists", "url": "https://www.productreview.com.au/removalists"},
                {"title": "Example Co", "url": "https://example.com/about"},
            ]},
            {"type": "message", "role": "assistant", "content": [
                {"type": "output_text",
                 "text": f"Answer to '{prompt}': Competitor A and Example Co are popular.",
                 "annotations": [
                     {"type": "url_citation", "url": "https://example.com/about"},
                     {"type": "url_citation", "url": "https://competitora.com/reviews"},
                 ]},
            ]},
        ],
    }


def fake_response(status: int, body) -> mock.Mock:
    resp = mock.Mock(status_code=status)
    resp.json.return_value = body
    resp.text = json.dumps(body)
    return resp


class ParseTests(unittest.TestCase):
    def test_reads_answer_and_sources_without_repeats(self):
        result = perplexity.parse(agent_response("q"))
        self.assertIn("Competitor A and Example Co", result.answer_text)
        self.assertEqual(result.cited_urls, [
            "https://www.productreview.com.au/removalists",
            "https://example.com/about",
            "https://competitora.com/reviews",
        ])

    def test_empty_answer_is_an_error(self):
        with self.assertRaises(EngineError):
            perplexity.parse({"status": "failed", "output": []})


class RequestTests(unittest.TestCase):
    def setUp(self):
        patcher = mock.patch.object(base.time, "sleep")
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_request_body(self):
        with mock.patch.object(base.requests, "request",
                               return_value=fake_response(200, agent_response("q"))) as req:
            perplexity.ask("best removalist", api_key="k", model="sonar", country="AU")
        method, url = req.call_args.args
        body = req.call_args.kwargs["json"]
        self.assertEqual((method, url), ("POST", "https://api.perplexity.ai/v1/responses"))
        self.assertEqual(req.call_args.kwargs["headers"]["Authorization"], "Bearer k")
        self.assertEqual(body["model"], "perplexity/sonar")
        self.assertEqual(body["tools"], [
            {"type": "web_search", "filters": {"user_location": {"country": "AU"}}}])

    def test_retries_429_then_succeeds(self):
        responses = [fake_response(429, {}), fake_response(200, agent_response("q"))]
        with mock.patch.object(base.requests, "request", side_effect=responses) as req:
            perplexity.ask("q", api_key="k", model="perplexity/sonar")
        self.assertEqual(req.call_count, 2)

    def test_gives_up_after_two_retries(self):
        with mock.patch.object(base.requests, "request",
                               side_effect=requests.ConnectionError("down")) as req:
            with self.assertRaises(EngineError):
                perplexity.ask("q", api_key="k", model="perplexity/sonar")
        self.assertEqual(req.call_count, 3)

    def test_400_is_not_retried(self):
        with mock.patch.object(base.requests, "request",
                               return_value=fake_response(400, {"error": "bad model"})) as req:
            with self.assertRaises(EngineError):
                perplexity.ask("q", api_key="k", model="perplexity/nope")
        self.assertEqual(req.call_count, 1)


class RunTests(unittest.TestCase):
    def test_three_prompts_and_one_failure_does_not_stop_the_run(self):
        def fake_request(method, url, **kwargs):
            prompt = kwargs["json"]["input"]
            if prompt == "Example Co vs Competitor A":
                return fake_response(401, {"error": "invalid key"})
            return fake_response(200, agent_response(prompt))

        out = io.StringIO()
        with mock.patch.object(run, "load_api_keys", return_value={"perplexity": "k"}), \
                mock.patch.object(run.time, "sleep"), \
                mock.patch.object(base.requests, "request", side_effect=fake_request), \
                redirect_stdout(out):
            code = run.main()
        text = out.getvalue()
        print(text)
        self.assertEqual(code, 0)
        self.assertIn("[1/3] perplexity | prompt 1 | ok, 3 sources", text)
        self.assertIn("[2/3] perplexity | prompt 2 | FAILED: HTTP 401", text)
        self.assertIn("[3/3] perplexity | prompt 3 | ok, 3 sources", text)


if __name__ == "__main__":
    unittest.main()
