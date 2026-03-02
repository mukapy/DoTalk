FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app

## Install system dependencies for psycopg2
#RUN apk add --no-cache postgresql-dev gcc musl-dev
#
## Copy dependency files first for caching
#COPY pyproject.toml uv.lock ./
#
## Install dependencies
#RUN uv sync --frozen --no-dev

# Copy the rest of the application
COPY . /app

# Collect static files
RUN uv run python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

#CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
