import json

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


class RecordMetadata(BaseModel):
    record_id: str
    object_name: str


app = FastAPI()

with open('./data/ffn_atel_closest_output.json', 'r') as f:
    data = json.load(f)


@app.get('/api/atel/{record_id}')
def get_object_data(record_id: str) -> RecordMetadata:
    metadata = RecordMetadata(
        record_id=record_id,
        object_name=data[record_id]
    )
    return metadata


@app.get('/api/atel/{record_id}/object_name')
def get_object_name(record_id: str) -> str:
    return data[record_id]


@app.get('/api/health_check')
def health_check():
    return 'OK'


app.mount("/", StaticFiles(directory="static", html=True), name="static")
