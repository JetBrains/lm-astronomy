FROM python:3.11

# Install dependencies
COPY docker/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && rm requirements.txt
COPY src /app
WORKDIR /app

CMD ["python", "-m", "gunicorn", "-w", "6", "-t", "90", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "api.main:app"]