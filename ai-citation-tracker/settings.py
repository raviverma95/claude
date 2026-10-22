"""Load and check the client config, the prompt list and the API keys."""

import csv
import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
CONFIG_DIR = ROOT / "config"
OUTPUT_DIR = ROOT / "output"

# engine name in client.yaml -> (env var holding its key, key in `models`, or None)
ENGINES = {
    "chatgpt": ("OPENAI_API_KEY", "openai"),
    "perplexity": ("PERPLEXITY_API_KEY", "perplexity"),
    "gemini": ("GEMINI_API_KEY", "gemini"),
    "ai_overviews": ("SERPAPI_API_KEY", None),
}


class ConfigError(Exception):
    """Raised when the config or prompt file is missing or malformed."""


@dataclass
class Competitor:
    name: str
    aliases: list[str]
    domain: str

    @property
    def names(self) -> list[str]:
        return [self.name, *self.aliases]


@dataclass
class Prompt:
    prompt_id: str
    prompt: str
    category: str


@dataclass
class ClientConfig:
    client_name: str
    brand_names: list[str]
    domain: str
    competitors: list[Competitor]
    country: str
    runs_per_prompt: int
    engines: dict[str, bool]
    models: dict[str, str]
    max_calls_per_run: int
    warnings: list[str] = field(default_factory=list)

    @property
    def enabled_engines(self) -> list[str]:
        return [name for name in ENGINES if self.engines.get(name)]


def _str_list(value, label: str) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        raise ConfigError(f"'{label}' must be a list")
    return [str(v).strip() for v in value if str(v).strip()]


def load_client(path: Path = CONFIG_DIR / "client.yaml") -> ClientConfig:
    if not path.exists():
        raise ConfigError(f"Client config not found: {path}")
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as e:
        raise ConfigError(f"Could not read {path.name}: {e}") from e

    for key in ("client_name", "brand_names", "domain"):
        if not raw.get(key):
            raise ConfigError(f"'{key}' is missing in {path.name}")

    competitors = []
    for i, c in enumerate(raw.get("competitors") or [], start=1):
        if not isinstance(c, dict) or not c.get("name"):
            raise ConfigError(f"Competitor #{i} in {path.name} needs a 'name'")
        competitors.append(Competitor(
            name=str(c["name"]).strip(),
            aliases=_str_list(c.get("aliases"), f"competitors[{i}].aliases"),
            domain=str(c.get("domain") or "").strip().lower(),
        ))

    engines_raw = raw.get("engines") or {}
    unknown = set(engines_raw) - set(ENGINES)
    if unknown:
        raise ConfigError(f"Unknown engine(s) in {path.name}: {', '.join(sorted(unknown))}. "
                          f"Valid names: {', '.join(ENGINES)}")

    try:
        runs = int(raw.get("runs_per_prompt", 1))
        cap = int(raw.get("max_calls_per_run", 300))
    except (TypeError, ValueError) as e:
        raise ConfigError("'runs_per_prompt' and 'max_calls_per_run' must be whole numbers") from e
    if runs < 1 or cap < 1:
        raise ConfigError("'runs_per_prompt' and 'max_calls_per_run' must be 1 or more")

    cfg = ClientConfig(
        client_name=str(raw["client_name"]).strip(),
        brand_names=_str_list(raw["brand_names"], "brand_names"),
        domain=str(raw["domain"]).strip().lower(),
        competitors=competitors,
        country=str(raw.get("country") or "").strip().upper(),
        runs_per_prompt=runs,
        engines={name: bool(engines_raw.get(name, False)) for name in ENGINES},
        models={k: str(v or "").strip() for k, v in (raw.get("models") or {}).items()},
        max_calls_per_run=cap,
    )

    for name in cfg.enabled_engines:
        model_key = ENGINES[name][1]
        if model_key and not cfg.models.get(model_key):
            cfg.warnings.append(f"{name}: no model set under models.{model_key} in {path.name}")
    if not cfg.enabled_engines:
        cfg.warnings.append("No engines are switched on in client.yaml")
    return cfg


def load_prompts(path: Path = CONFIG_DIR / "prompts.csv") -> list[Prompt]:
    if not path.exists():
        raise ConfigError(f"Prompt file not found: {path}")
    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        missing = {"prompt_id", "prompt", "category"} - set(reader.fieldnames or [])
        if missing:
            raise ConfigError(f"{path.name} is missing column(s): {', '.join(sorted(missing))}")
        prompts = [
            Prompt(row["prompt_id"].strip(), row["prompt"].strip(), (row["category"] or "").strip())
            for row in reader
            if (row.get("prompt") or "").strip()
        ]
    if not prompts:
        raise ConfigError(f"{path.name} has no prompts")
    ids = [p.prompt_id for p in prompts]
    if len(ids) != len(set(ids)):
        raise ConfigError(f"{path.name} has duplicate prompt_id values")
    return prompts


def load_api_keys(env_path: Path = ROOT / ".env") -> dict[str, str]:
    """Return {engine name: API key} for every engine whose key is set (blank keys are skipped)."""
    load_dotenv(env_path)
    keys = {}
    for name, (env_var, _) in ENGINES.items():
        value = os.getenv(env_var, "").strip()
        if value:
            keys[name] = value
    return keys
