import os
from root.settings.base import *

MODE = os.getenv('MODE', 'dev')

if MODE == 'dev':
    from root.settings.development import *
elif MODE == 'prod':
    from root.settings.production import *
