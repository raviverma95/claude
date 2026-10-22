"""Main entry point: python run.py"""

import csv
import importlib
import sys
import time
from datetime import date

from detect import analyse
from engines.base import EngineError
from settings import ENGINES, OUTPUT_DIR, ConfigError, load_api_keys, load_client, load_prompts

DELAY_BETWEEN_CALLS = 1.0  # seconds, to stay under rate limits

# engines that have a module in engines/ so far
BUILT_ENGINES = {"perplexity"}

COLUMNS = [
    "run_date", "client", "prompt_id", "prompt", "category", "engine", "run_number",
    "brand_mentioned", "brand_position", "domain_cited", "cited_urls",
    "competitors_mentioned", "answer_text", "error",
]


def output_path(run_date: str):
    """output/results_YYYY-MM-DD.csv, or _2, _3... if that day already has a file."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    path = OUTPUT_DIR / f"results_{run_date}.csv"
    n = 2
    while path.exists():
        path = OUTPUT_DIR / f"results_{run_date}_{n}.csv"
        n += 1
    return path


def make_row(cfg, run_date, prompt, engine, run_number, result, error) -> dict:
    row = {
        "run_date": run_date, "client": cfg.client_name, "prompt_id": prompt.prompt_id,
        "prompt": prompt.prompt, "category": prompt.category, "engine": engine,
        "run_number": run_number, "brand_mentioned": "", "brand_position": "",
        "domain_cited": "", "cited_urls": "", "competitors_mentioned": "",
        "answer_text": "", "error": error,
    }
    if result is not None:  # failed calls keep the detection columns blank
        found = analyse(result.answer_text, result.cited_urls, cfg)
        row.update(
            brand_mentioned="TRUE" if found["brand_mentioned"] else "FALSE",
            brand_position=found["brand_position"] or "",
            domain_cited="TRUE" if found["domain_cited"] else "FALSE",
            cited_urls=" | ".join(result.cited_urls),
            competitors_mentioned=" | ".join(found["competitors_mentioned"]),
            answer_text=result.answer_text,
        )
    return row


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
    run_date = date.today().isoformat()
    path = output_path(run_date)
    # utf-8-sig so Excel shows accents and symbols correctly
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        run_jobs(cfg, keys, jobs, modules, run_date, writer, f)
    print(f"\nSaved {len(jobs)} rows to {path.relative_to(path.parent.parent)}")
    return 0


def run_jobs(cfg, keys, jobs, modules, run_date, writer, f) -> None:
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
        writer.writerow(make_row(cfg, run_date, prompt, engine, run_number, result, error))
        f.flush()  # keep finished rows on disk even if the run is stopped


if __name__ == "__main__":
    sys.exit(main())
