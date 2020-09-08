# settings.py

from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parents[1] / 'config'/'dev.env'
load_dotenv(dotenv_path=env_path)

import os
SECRET_KEY = os.getenv("PYTHON_LIBRARIES")