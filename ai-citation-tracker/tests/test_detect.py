"""Tests for the mention, position and citation logic."""

import unittest

from detect import analyse, domain_of, url_matches_domain
from settings import load_client


class DetectTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cfg = load_client()  # the Example Co sample config

    def test_position_follows_order_of_first_mention(self):
        text = "Comp A is great. Competitor B is cheap. ExampleCo is also good. Competitor A again."
        found = analyse(text, [], self.cfg)
        self.assertTrue(found["brand_mentioned"])
        self.assertEqual(found["brand_position"], 3)
        self.assertEqual(found["competitors_mentioned"], ["Competitor A", "Competitor B"])

    def test_brand_first(self):
        found = analyse("example co beats competitor a", [], self.cfg)
        self.assertEqual(found["brand_position"], 1)

    def test_not_mentioned_leaves_position_blank(self):
        found = analyse("Try Competitor B.", [], self.cfg)
        self.assertFalse(found["brand_mentioned"])
        self.assertIsNone(found["brand_position"])

    def test_whole_words_only(self):
        found = analyse("Here are some examples. Comp Avenue is a street.", [], self.cfg)
        self.assertFalse(found["brand_mentioned"])
        self.assertEqual(found["competitors_mentioned"], [])

    def test_domain_cited(self):
        self.assertTrue(analyse("x", ["https://blog.example.com/post"], self.cfg)["domain_cited"])
        self.assertTrue(analyse("x", ["https://WWW.EXAMPLE.COM"], self.cfg)["domain_cited"])
        self.assertFalse(analyse("x", ["https://notexample.com/a"], self.cfg)["domain_cited"])
        self.assertFalse(analyse("x", ["https://other.com/?ref=example.com"], self.cfg)["domain_cited"])
        self.assertFalse(analyse("x", [], self.cfg)["domain_cited"])

    def test_domain_helpers(self):
        self.assertEqual(domain_of("https://www.Example.com/a?b=1"), "example.com")
        self.assertEqual(domain_of("example.com/path"), "example.com")
        self.assertTrue(url_matches_domain("http://shop.example.com", "www.example.com"))


if __name__ == "__main__":
    unittest.main()
