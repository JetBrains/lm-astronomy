import logging
from enum import Enum

import astropy.units as u
from astropy.coordinates import Angle, SkyCoord
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.dataloader import RecordMetadata, FilterParameters, get_atel_dataset, get_gcn_dataset, _compare, \
    match_object_name

data_atel = get_atel_dataset()
data_gcn = get_gcn_dataset()
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
def get_atel_data(record_id: str) -> RecordMetadata:
    if record_id not in data_atel:
        raise HTTPException(status_code=404, detail=f"The ATel message with id {record_id} doesn't exist.")
    return data_atel[record_id]


@app.get('/api/gcn/{record_id}')
def get_gcn_data(record_id: str) -> RecordMetadata:
    if record_id not in data_gcn:
        raise HTTPException(status_code=404, detail=f"The GCN message with id {record_id} doesn't exist.")
    return data_gcn[record_id]


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
        results_atel = _search_by_coordinates(sky_coord, params.radius, results_atel)
        results_gcn = _search_by_coordinates(sky_coord, params.radius, results_gcn)
        logger.info(f"coordinates: filtered {items_before} items to {len(results_atel) + len(results_gcn)}")
    return {'atel': results_atel, 'gcn': results_gcn}


def _search_dataset(entity_name: str, entity: Enum, dataset: dict):
    results = []
    for key in dataset:
        val = entity if isinstance(entity, str) else entity.value
        if entity_name in dataset[key] and any(_compare(val, item) for item in dataset[key][entity_name]):
            results.append(key)
    return results


def _search_by_coordinates(sky_coord: SkyCoord, angle: int, dataset: dict):
    # TODO: precompute coordinates list on startup
    result_keys = _get_coordinates_within_radius(_get_coordinates_list(dataset), sky_coord, angle)
    result = {key: dataset[key] for key in result_keys}
    return result


def _get_coordinates_list(dataset: dict[str, RecordMetadata]):
    coordinates = {
        key: {"coordinates": dataset[key].coordinates, "coordinate_system": dataset[key].coordinate_system}
        for key in dataset if dataset[key].coordinates}
    coords_list = {}

    for key in coordinates:
        coordinate_frame = "icrs"
        if coordinates[key]['coordinate_system']:
            if coordinates[key]['coordinate_system'].lower() == "galactic":
                coordinate_frame = 'galactic'
            elif coordinates[key]['coordinate_system'].lower() == "ecliptic":
                coordinate_frame = 'geocentrictrueecliptic'
        elems = coordinates[key]['coordinates']
        for el in elems:
            try:
                if len(el.split(' ')) > 2:
                    sc = SkyCoord(el, frame=coordinate_frame, unit=(u.hour, u.deg))
                else:
                    sc = SkyCoord(el, frame=coordinate_frame, unit=(u.deg, u.deg))
                coords_list[key] = sc
            except:
                pass
    return coords_list


def _get_coordinates_within_radius(coords_list: dict, center: SkyCoord, radius: int):
    sky_radius = Angle(radius, 'deg')
    return [key for key in coords_list if center.separation(coords_list[key]) <= sky_radius]


@app.get('/api/health_check')
def health_check():
    return 'OK'


app.mount("/", StaticFiles(directory="static", html=True), name="static")
