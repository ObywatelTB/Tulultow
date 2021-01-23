from pathlib import Path
from dotenv import load_dotenv
import os

#env_path = Path(__file__).parents[2] / 'config'/'dev.env'
#load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.environ.get("PYTHON_LIBRARIES")
MONGO_DATABASE_NAME = os.environ.get("MONGODB_NAME")
MONGODB_URI = os.environ.get("MONGODB_URI")
ALLOWED_HOSTS = ['0.0.0.0/0'] #NOT SURE IF CHANGES ANYTHING to avoid the problem with heroku-mongo connection


# MONGODB_DATABASES = {
#     "default": {
#         "name": os.environ.get("MONGODB_NAME"),
#         "host": 'mongo',
#         "port": 27017
#     },
# }