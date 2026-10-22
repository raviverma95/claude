"""Main entry point: python run.py"""

import sys

from settings import ENGINES, ConfigError, load_api_keys, load_client, load_prompts


def main() -> int:
    try:
        cfg = load_client()
        prompts = load_prompts()
    except ConfigError as e:
        print(f"Config error: {e}")
        return 1
    keys = load_api_keys()

    print(f"Client:      {cfg.client_name} ({cfg.domain})")
    print(f"Brand names: {', '.join(cfg.brand_names)}")
    print(f"Competitors: {', '.join(c.name for c in cfg.competitors) or '(none)'}")
    print(f"Prompts:     {len(prompts)}  |  runs per prompt: {cfg.runs_per_prompt}")
    print()

    ready = []
    for name in ENGINES:
        env_var, model_key = ENGINES[name]
        if not cfg.engines[name]:
            status = "off"
        elif name not in keys:
            status = f"ON, but {env_var} is missing in .env (will be skipped)"
        else:
            model = cfg.models.get(model_key, "") if model_key else "n/a"
            status = f"ON, key found, model: {model or '(not set)'}"
            ready.append(name)
        print(f"  {name:<13} {status}")

    planned = len(prompts) * len(ready) * cfg.runs_per_prompt
    print()
    print(f"Planned calls: {planned}  (cap: {cfg.max_calls_per_run})")
    if planned > cfg.max_calls_per_run:
        print(f"  The run will stop after {cfg.max_calls_per_run} calls.")
    for w in cfg.warnings:
        print(f"Warning: {w}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
