import json
import os
from enum import Enum


class Entity(str, Enum):
    EVENT_TYPE = 'event_type'
    OBJECT_NAME = 'object_name_or_event_ID'
    OBJECT_TYPE = 'object_type'

    def __str__(self):
        return self.value


class Dataset(str, Enum):
    GCN = 'gcn'
    ATEL = 'atel'

    def __str__(self):
        return self.value


def update_json_file(filename, new_data):
    if os.path.isfile(filename):
        with open(filename, 'r') as json_file:
            data = json.load(json_file)
            if isinstance(data, dict):
                data.update(new_data)
            elif isinstance(data, list):
                data = data + new_data
    else:
        data = new_data
    with open(filename, 'w') as json_file:
        json.dump(data, json_file, indent=2)


def create_indices(dataset_name, indices_path):
    if indices_path:
        with open(indices_path, 'r') as f:
            return json.load(f)
    with open(f"./data/{dataset_name}/dataset.json", 'r') as f:
        new_indices = list(json.load(f).keys())
    with open(f"./data/{dataset_name}/entities.json", 'r') as f:
        old_indices = list(json.load(f).keys())
    # if os.path.isfile(f"./data/{dataset_name}/completions.json"):
    #     with open(f"./data/{dataset_name}_completions.json", 'r') as f:
    #         unfinished_indices = list(json.load(f).keys())
    return list(set(new_indices) ^ set(old_indices))
