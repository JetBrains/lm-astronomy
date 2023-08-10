import json
from enum import Enum
from typing import Optional, List
import re

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, root_validator
import astropy.units as u
from astropy.coordinates import Angle, SkyCoord

with open('./data/atel_entities.json', 'r') as f:
    data_atel = json.load(f)

with open('./data/gcn_entities.json', 'r') as f:
    data_gcn = json.load(f)


class MessengerType(str, Enum):
    COSMIC_RAYS = "Cosmic Rays"
    GRAVITATIONAL_WAVES = "Gravitational Waves"
    NEUTRINOS = "Neutrinos"
    ELECTROMAGNETIC_RADIATION = "Electromagnetic Radiation"


class EventType(str, Enum):
    HIGH_ENERGY_EVENT = 'High Energy Event'
    GAMMA_RAY_BURST = 'Gamma-Ray Burst'
    TIDAL_DISRUPTION_EVENT = 'Tidal Disruption Event'
    LOW_ENERGY_EVENT = 'Low Energy Event'
    SOLAR_EVENT = 'Solar Event'
    MICROLENSING_EVENT = 'Microlensing Event'
    PULSATION = 'Pulsation'
    FAST_RADIO_BURST = 'Fast Radio Burst'
    ACTIVITY_EPISODE = 'Activity Episode'
    FLARE = 'Flare'
    TRANSIENT = 'Transient'
    OUTBURST = 'Outburst'
    ACCRETION = 'Accretion'
    AFTERGLOW = 'Afterglow'
    BRIGHTENING = 'Brightening'
    VARIABILITY = 'Variability'
    DIMMING_AND_DECLINE = 'Dimming and Decline'
    DIPPING_AND_ECLIPSING = 'Dipping and Eclipsing'
    EMISSION = 'Emission'
    ABSORPTION = 'Absorption'
    CORE_COLLAPSE = 'Core Collapse'
    STATE_TRANSITION = 'State Transition'
    GLITCH = 'Glitch'
    ERUPTION = 'Eruption'


class ObjectType(str, Enum):
    ACCRETING_OBJECT = 'Accreting Object'
    ACTIVE_GALACTIC_NUCLEI = 'Active Galactic Nuclei'
    BLACK_HOLE = 'Black Hole'
    NEUTRON_STAR = 'Neutron Star'
    NOVA = 'Nova'
    SUPERNOVA = 'Supernova'
    STAR_AND_STELLAR_SYSTEM = 'Star & Stellar System'
    VARIABLE_STAR = 'Variable Star'
    EXOPLANET = 'Exoplanet'
    STELLAR_EVOLUTION_STAGE = 'Stellar Evolution Stage'
    MINOR_BODY = 'Minor Body'
    BINARY_SYSTEM = 'Binary System'
    PULSAR = 'Pulsar'
    INTERSTELLAR_MEDIUM = 'Interstellar Medium'
    GALAXY = 'Galaxy'
    QUASAR = 'Quasar'
    GLOBULAR_CLUSTER = 'Globular Cluster'
    NEAR_EARTH_OBJECT = 'Near-earth object'
    MAGNETAR = 'Magnetar'
    REPEATER = 'Repeater'
    CIRCUMSTELLAR_DISK = 'Circumstellar Disk'
    ELECTROMAGNETIC_SOURCE = 'Electromagnetic Source'


class RecordMetadata(BaseModel):
    record_id: str
    object_name: List[str]
    event_type: List[str]
    object_type: List[str]
    messenger_type: List[str]

    @root_validator(pre=True)
    def check_record_id(cls, values: dict):
        ri = values.get('record_id')
        if ri is None:
            raise ValueError(f"Enter the message id.")
        ri_ci = ri.lower()
        if not (ri_ci in data_atel or ri_ci in data_gcn):
            raise ValueError(f"The message with id {ri} doesn't exist.")
        values['record_id'] = ri_ci
        return values


class FilterParameters(BaseModel):
    object_name_or_coordinates: Optional[str]
    radius: int = 3
    event_type: Optional[EventType]
    object_type: Optional[ObjectType]
    messenger_type: Optional[MessengerType]


app = FastAPI()


@app.get('/api/atel/{record_id}')
def get_atel_data(record_id: str) -> RecordMetadata:
    metadata = RecordMetadata(
        record_id=record_id,
        object_name=data_atel[record_id]['object_name'],
        event_type=data_atel[record_id]['event_type'],
        object_type=data_atel[record_id]['object_type'],
        messenger_type=data_atel[record_id]['messenger_type']
    )
    return metadata


@app.get('/api/gcn/{record_id}')
def get_gcn_data(record_id: str) -> RecordMetadata:
    metadata = RecordMetadata(
        record_id=record_id,
        object_name=data_gcn[record_id]['object_name'],
        event_type=data_gcn[record_id]['event_type'],
        object_type=data_gcn[record_id]['object_type'],
        messenger_type=data_gcn[record_id]['messenger_type']
    )
    return metadata


@app.get('/api/atel/{record_id}/object_name')
def get_atel_object_name(record_id: str) -> List[str]:
    return get_atel_data(record_id).object_name


@app.get('/api/atel/{record_id}/event_type')
def get_atel_event_type(record_id: str) -> List[str]:
    return get_atel_data(record_id).event_type


@app.get('/api/atel/{record_id}/object_type')
def get_atel_object_type(record_id: str) -> List[str]:
    return get_atel_data(record_id).object_type


@app.get('/api/atel/{record_id}/messenger_type')
def get_atel_messenger_type(record_id: str) -> List[str]:
    return get_atel_data(record_id).messenger_type


@app.get('/api/gcn/{record_id}/object_name')
def get_gcn_object_name(record_id: str) -> List[str]:
    return get_gcn_data(record_id).object_name


@app.get('/api/gcn/{record_id}/event_type')
def get_gcn_event_type(record_id: str) -> List[str]:
    return get_gcn_data(record_id).event_type


@app.get('/api/gcn/{record_id}/object_type')
def get_gcn_object_type(record_id: str) -> List[str]:
    return get_gcn_data(record_id).object_type


@app.get('/api/gcn/{record_id}/messenger_type')
def get_gcn_messenger_type(record_id: str) -> List[str]:
    return get_gcn_data(record_id).messenger_type


@app.get('/api/filter/')
def get_filtered_records(params: FilterParameters = Depends()):
    result_atel, result_gcn = [], []
    for param_name, param_val in vars(params).items():
        if param_val:
            if param_name not in ["object_name_or_coordinates", "radius"]:
                result_atel.append(_search_dataset(param_name, param_val, data_atel))
                result_gcn.append(_search_dataset(param_name, param_val, data_gcn))
            elif param_name == "object_name_or_coordinates":
                result_atel.append(_search_by_object_name_or_coordinates(param_val, params.radius, data_atel))
                result_gcn.append(_search_by_object_name_or_coordinates(param_val, params.radius, data_gcn))
    return {"ATel": set.intersection(*map(set, result_atel)), "GCN": set.intersection(*map(set, result_gcn))}


def _compare(s1, s2):
    s1_alphanumeric, s2_alphanumeric = ''.join(e for e in s1 if e.isalnum()).casefold(), \
        ''.join(e for e in s2 if e.isalnum()).casefold()
    s1_split, s2_split = set(s1.casefold().split()), set(s2.casefold().split())
    return s1_alphanumeric == s2_alphanumeric or s1_split.issubset(s2_split) or s2_split.issubset(s1_split)


def _search_dataset(entity_name: str, entity: Enum, dataset: dict):
    results = []
    for key in dataset:
        val = entity if isinstance(entity, str) else entity.value
        if entity_name in dataset[key] and any(_compare(val, item) for item in dataset[key][entity_name]):
            results.append(key)
    return results


def _search_by_object_name_or_coordinates(entity: Enum, angle: int, dataset: dict):
    result = _search_dataset("object_name", entity, dataset)

    if len(result) == 0:
        try:
            sky_coord = SkyCoord(entity, frame='icrs', unit=(u.hour, u.deg))
        except:
            return []
        result = _get_coordinates_within_radius(_get_coordinates_list(data_atel), sky_coord, angle)
    return result


def _get_coordinates_list(dataset: dict):
    coordinates = {
        key: {"coordinates": dataset[key]['coordinates'], "coordinate_system": dataset[key]['coordinate_system']}
        for key in dataset if dataset[key]['coordinates']}
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
