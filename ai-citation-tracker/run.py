"""Main entry point: python run.py"""

import importlib
import sys
import time

from engines.base import EngineError
from settings import ENGINES, ConfigError, load_api_keys, load_client, load_prompts

DELAY_BETWEEN_CALLS = 1.0  # seconds, to stay under rate limits

# engines that have a module in engines/ so far
BUILT_ENGINES = {"perplexity"}


def plan_engines(cfg, keys) -> list[str]:
    """Print each engine's status and return the ones that will run."""
    ready = []
    for name, (env_var, model_key) in ENGINES.items():
        if not cfg.engines[name]:
            status = "off"
        elif name not in BUILT_ENGINES:
            status = "ON, but not built yet (skipped)"
        elif name not in keys:
            status = f"ON, but {env_var} is missing in .env (skipped)"
        else:
            model = cfg.models.get(model_key, "") if model_key else "n/a"
            status = f"ON, key found, model: {model or '(not set)'}"
            ready.append(name)
        print(f"  {name:<13} {status}")
    return ready


def main() -> int:
    try:
        cfg = load_client()
        prompts = load_prompts()
    except ConfigError as e:
        print(f"Config error: {e}")
        return 1
    keys = load_api_keys()

    print(f"Client:      {cfg.client_name} ({cfg.domain})")
    print(f"Prompts:     {len(prompts)}  |  runs per prompt: {cfg.runs_per_prompt}")
    print()
    engines = plan_engines(cfg, keys)
    for w in cfg.warnings:
        print(f"Warning: {w}")

    jobs = [(p, e, r) for p in prompts for e in engines for r in range(1, cfg.runs_per_prompt + 1)]
    if len(jobs) > cfg.max_calls_per_run:
        print(f"\n{len(jobs)} calls planned, but max_calls_per_run is {cfg.max_calls_per_run}. "
              f"Stopping after {cfg.max_calls_per_run}.")
        jobs = jobs[:cfg.max_calls_per_run]
    if not jobs:
        print("\nNothing to run. Switch on an engine and add its key to .env.")
        return 1
    print()

    modules = {name: importlib.import_module(f"engines.{name}") for name in engines}
    results = []
    for i, (prompt, engine, run_number) in enumerate(jobs, start=1):
        if i > 1:
            time.sleep(DELAY_BETWEEN_CALLS)
        model_key = ENGINES[engine][1]
        result, error = None, ""
        try:
            result = modules[engine].ask(
                prompt.prompt,
                api_key=keys[engine],
                model=cfg.models.get(model_key, "") if model_key else "",
                country=cfg.country,
            )
            status = f"ok, {len(result.cited_urls)} sources"
        except EngineError as e:
            error = str(e)
        except Exception as e:  # an engine bug must not stop the run
            error = f"unexpected {type(e).__name__}: {e}"
        if error:
            status = f"FAILED: {error[:120]}"
        print(f"[{i}/{len(jobs)}] {engine} | prompt {prompt.prompt_id} | {status}")
        results.append((prompt, engine, run_number, result, error))

    # Step 2 preview; detection and CSV output come in step 3.
    print()
    for prompt, engine, run_number, result, error in results:
        print(f"--- {engine} | prompt {prompt.prompt_id}: {prompt.prompt}")
        if error:
            print(f"    error: {error}")
            continue
        print(f"    answer: {result.answer_text[:200].replace(chr(10), ' ')}...")
        for url in result.cited_urls:
            print(f"    source: {url}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
