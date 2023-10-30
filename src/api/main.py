import logging

import astropy.units as u
from astropy.coordinates import SkyCoord
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.atel import ATelRecord, load_record
from api.dataloader import RecordMetadata, FilterParameters, get_atel_dataset, get_gcn_dataset, match_object_name, \
    _get_coordinates_list, \
    _search_by_coordinates
from api.gcn import load_gcn_record, GCNRecord

data_atel = get_atel_dataset()
data_gcn = get_gcn_dataset()
coords_atel, tree_atel = _get_coordinates_list(data_atel)
coords_gcn, tree_gcn = _get_coordinates_list(data_gcn)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@app.get('/api/atel/{record_id}')
@app.get('/api/atel/{record_id}/metadata')
def get_atel_data(record_id: str) -> RecordMetadata:
    if record_id not in data_atel:
        raise HTTPException(status_code=404, detail=f"The ATel message with id {record_id} doesn't exist.")
    return data_atel[record_id]


@app.get('/api/atel/{record_id}/message')
async def get_atel_message(record_id: str) -> ATelRecord:
    if record_id not in data_atel:
        raise HTTPException(status_code=404, detail=f"The ATel message with id {record_id} doesn't exist.")
    atel_record = await load_record(record_id)
    if atel_record is None:
        raise HTTPException(status_code=404, detail=f"The ATel message with id {record_id} doesn't exist.")
    return atel_record


@app.get('/api/gcn/{record_id}')
@app.get('/api/gcn/{record_id}/metadata')
def get_gcn_data(record_id: str) -> RecordMetadata:
    if record_id not in data_gcn:
        raise HTTPException(status_code=404, detail=f"The GCN message with id {record_id} doesn't exist.")
    return data_gcn[record_id]


@app.get('/api/gcn/{record_id}/message')
async def get_gcn_message(record_id: str) -> GCNRecord:
    if record_id not in data_gcn:
        raise HTTPException(status_code=404, detail=f"The GCN message with id {record_id} doesn't exist.")
    gcn_record = await load_gcn_record(record_id)
    if gcn_record is None:
        raise HTTPException(status_code=404, detail=f"The GCN message with id {record_id} doesn't exist.")
    return gcn_record


@app.get('/api/search/')
def get_filtered_records(params: FilterParameters = Depends()):
    results_atel = data_atel
    results_gcn = data_gcn
    if params.object_name:
        items_before = len(results_atel) + len(results_gcn)
        results_atel = match_object_name(params.object_name, results_atel)
        results_gcn = match_object_name(params.object_name, results_gcn)
        logger.info(f"object_name: filtered {items_before} items to {len(results_atel) + len(results_gcn)}")
    if params.event_type:
        items_before = len(results_atel) + len(results_gcn)
        results_atel = {key: value for key, value in results_atel.items()
                        if params.event_type.lower() in results_atel[key].event_type}
        results_gcn = {key: value for key, value in results_gcn.items()
                       if params.event_type.lower() in results_gcn[key].event_type}
        logger.info(f"event_type: filtered {items_before} items to {len(results_atel) + len(results_gcn)}")
    if params.object_type:
        items_before = len(results_atel) + len(results_gcn)
        results_atel = {key: value for key, value in results_atel.items()
                        if params.object_type.lower() in results_atel[key].object_type}
        results_gcn = {key: value for key, value in results_gcn.items()
                       if params.object_type.lower() in results_gcn[key].object_type}
        logger.info(f"object_type: filtered {items_before} items to {len(results_atel) + len(results_gcn)}")
    if params.messenger_type:
        items_before = len(results_atel) + len(results_gcn)
        results_atel = {key: value for key, value in results_atel.items()
                        if params.messenger_type.lower() in results_atel[key].messenger_type}
        results_gcn = {key: value for key, value in results_gcn.items()
                       if params.messenger_type.lower() in results_gcn[key].messenger_type}
        logger.info(f"messenger_type: filtered {items_before} items to {len(results_atel) + len(results_gcn)}")
    if params.coordinates:
        if not params.radius:
            raise HTTPException(status_code=400, detail="Radius is required when searching by coordinates.")
        try:
            sky_coord = SkyCoord(params.coordinates, frame='icrs', unit=(u.hour, u.deg))
        except:
            raise HTTPException(status_code=400,
                                detail=f"Invalid coordinates: {params.coordinates}. Please, use ICRS format.")
        items_before = len(results_atel) + len(results_gcn)
        results_atel = _search_by_coordinates(tree_atel, coords_atel, sky_coord, params.radius, results_atel)
        results_gcn = _search_by_coordinates(tree_gcn, coords_gcn, sky_coord, params.radius, results_gcn)
        logger.info(f"coordinates: filtered {items_before} items to {len(results_atel) + len(results_gcn)}")
    return {'atel': results_atel, 'gcn': results_gcn}


@app.get('/api/health_check')
def health_check():
    return 'OK'


app.mount("/", StaticFiles(directory="static", html=True), name="static")
