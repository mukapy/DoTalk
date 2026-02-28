mig:
	uv run python manage.py makemigrations
	uv run python manage.py migrate

fixtures:
	uv run python manage.py loaddata apps/rooms/fixtures/categories.json
	uv run python manage.py loaddata apps/rooms/fixtures/topics.json

run:
	uv run python manage.py runserver

celery:
	uv run celery -A root worker -l info
