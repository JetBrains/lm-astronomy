import json
from enum import Enum
from typing import Optional

from pydantic import BaseModel


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
    object_name: Optional[list[str]] = []
    event_type: Optional[list[str]] = []
    object_type: Optional[list[str]] = []
    messenger_type: Optional[list[str]] = []
    coordinates: Optional[list[str]] = []
    coordinate_system: Optional[str]
    date: Optional[str]  # TODO: parse date


class FilterParameters(BaseModel):
    object_name: Optional[str]
    radius: int = 3
    event_type: Optional[EventType]
    object_type: Optional[ObjectType]
    messenger_type: Optional[MessengerType]
    coordinates: Optional[str]


def get_atel_dataset(path: str = 'api/data/atel/entities.json') -> dict[str, RecordMetadata]:
    with open(path, 'r') as f:
        raw_records = json.load(f)
    data = {name: RecordMetadata(record_id=name, **data) for name, data in raw_records.items()}
    return data


def get_gcn_dataset(path: str = 'api/data/gcn/entities.json') -> dict[str, RecordMetadata]:
    with open(path, 'r') as f:
        raw_records = json.load(f)
    data = {name: RecordMetadata(record_id=name, **data) for name, data in raw_records.items()}
    return data


def _compare(s1, s2):
    """Compare two strings, ignoring punctuation and case."""
    s1_alphanumeric = ''.join(e for e in s1 if e.isalnum()).casefold()
    s2_alphanumeric = ''.join(e for e in s2 if e.isalnum()).casefold()
    s1_split, s2_split = set(s1.casefold().split()), set(s2.casefold().split())
    return s1_alphanumeric == s2_alphanumeric or s1_split.issubset(s2_split) or s2_split.issubset(s1_split)


def match_object_name(object_name: str,
                      records: dict[str, RecordMetadata],
                      add_nulls: bool = True) -> dict[str, RecordMetadata]:
    matches = {}
    for record_id, record in records.items():
        if not record.object_name:
            if add_nulls:
                matches[record_id] = record
            continue
        for name in record.object_name:
            if _compare(object_name, name):
                matches[record_id] = record
                break
    return matches

