FROM node:14 AS FRONT

WORKDIR /app

RUN npm install -g serve
COPY src/front .
RUN npm install
RUN npm run build


FROM python:3.11

# Install dependencies
COPY docker/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && rm requirements.txt
COPY src/api /app/api
COPY --from=FRONT /app/build /app/static
WORKDIR /app

CMD ["python", "-m", "gunicorn", "-w", "2", "-t", "90", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "api.main:server"]