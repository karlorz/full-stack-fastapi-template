import json
from pathlib import Path
from enum import Enum
import typer

config_path = Path(typer.get_app_dir("fastapi-cli")) / "cli.json"


class Env(str, Enum):
    local = "local"
    development = "development"
    staging = "staging"
    production = "production"


def main(env: Env):
    print(f"using env: {env}")
    url = "http://localhost:8000/api/v1"

    if env.value == "development":
        url = "https://api.fastapicloud.site/api/v1"
    elif env.value == "staging":
        url = "https://api.fastapicloud.work/api/v1"
    elif env.value == "production":
        url = "https://api.fastapicloud.com/api/v1"
    new_data = {"base_api_url": url}
    new_data_json_str = json.dumps(new_data)
    config_path.write_text(new_data_json_str)


if __name__ == "__main__":
    typer.run(main)
