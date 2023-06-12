import json
from enum import Enum
from typing import Optional, List

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, root_validator

with open('./data/atel_entities.json', 'r') as f:
    data_atel = json.load(f)

with open('./data/gcn_entities.json', 'r') as f:
    data_gcn = json.load(f)


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
    object_name: str
    event_type: List[str]
    object_type: List[str]

    @root_validator(pre=True)
    def check_record_id(cls, values: dict):
        ri = values.get('record_id')
        if ri is None:
            raise ValueError(f"Enter the message id.")
        if not (ri.lower() in data_atel or ri.lower() in data_gcn):
            raise ValueError(f"The message with id {ri} doesn't exist.")
        values['record_id'] = ri.lower()
        return values


class FilterParameters(BaseModel):
    event_type: Optional[EventType]
    object_type: Optional[ObjectType]


app = FastAPI()


@app.get('/api/atel/{record_id}')
def get_atel_data(record_id: str) -> RecordMetadata:
    metadata = RecordMetadata(
        record_id=record_id,
        object_name=data_atel[record_id]['object_name'],
        event_type=data_atel[record_id]['event_type'],
        object_type=data_atel[record_id]['object_type']
    )
    return metadata


@app.get('/api/gcn/{record_id}')
def get_gcn_data(record_id: str) -> RecordMetadata:
    metadata = RecordMetadata(
        record_id=record_id,
        object_name=data_gcn[record_id]['object_name'],
        event_type=data_gcn[record_id]['event_type'],
        object_type=data_gcn[record_id]['object_type']
    )
    return metadata


@app.get('/api/atel/{record_id}/object_name')
def get_atel_object_name(record_id: str) -> str:
    return get_atel_data(record_id).object_name


@app.get('/api/atel/{record_id}/event_type')
def get_atel_event_type(record_id: str) -> List[str]:
    return get_atel_data(record_id).event_type


@app.get('/api/atel/{record_id}/object_type')
def get_atel_object_type(record_id: str) -> List[str]:
    return get_atel_data(record_id).object_type


@app.get('/api/atel/{record_id}/object_name')
def get_gcn_object_name(record_id: str) -> str:
    return get_gcn_data(record_id).object_name


@app.get('/api/atel/{record_id}/event_type')
def get_gcn_event_type(record_id: str) -> List[str]:
    return get_gcn_data(record_id).event_type


@app.get('/api/atel/{record_id}/object_type')
def get_gcn_object_type(record_id: str) -> List[str]:
    return get_gcn_data(record_id).object_type


@app.get('/api/filter/')
def get_filtered_records(params: FilterParameters = Depends()):
    result_atel, result_gcn = [], []
    for param_name, param_val in vars(params).items():
        if param_val:
            result_atel.append(_search_dataset(param_name, param_val, data_atel))
            result_gcn.append(_search_dataset(param_name, param_val, data_gcn))
    return {"ATel": set.intersection(*map(set, result_atel)), "GCN": set.intersection(*map(set, result_gcn))}


def _search_dataset(entity_name: str, entity: Enum, dataset: dict):
    results = []
    for key in dataset:
        if entity.value.lower() in dataset[key][entity_name]:
            results.append(key)
    return results


@app.get('/api/health_check')
def health_check():
    return 'OK'


app.mount("/", StaticFiles(directory="static", html=True), name="static")
