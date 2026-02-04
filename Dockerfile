FROM python:3.13-alpine

WORKDIR /app

COPY . /app

RUN uv sync

EXPOSE 8000

CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]