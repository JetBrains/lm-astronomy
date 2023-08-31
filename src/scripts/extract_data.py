import argparse
import json
import os

import numpy as np
import re
import csv
from ffn_inference import get_ranged_completions
from gen_embeddings import get_embeddings, ModelType
from gen_completions import get_completions
from utils import Entity, Dataset, create_indices, update_json_file


def remove_interval(s):
    spl = s.split(',')
    res = [x.split("+-")[0].strip() for x in spl]
    res = [x.split("±")[0].strip() for x in res]
    return " ".join(res)


def remove_characters(s):
    if not s:
        return
    if isinstance(s, list):
        return list(np.ravel([remove_characters(x) for x in s]))

    without_radec = s.lower().replace('r.a.', '').replace('ra', '').replace('decl.', '').replace('dec.', '').replace(
        'dec', '').replace("2000.0", '').replace('2000', '').replace("deg.", '').replace('s.', '.').replace('\".',
                                                                                                            '.').replace(
        "''.", '.').split(";")  # RA=17h04m09s.71 <- s.

    remove_inside_parentheses = [re.sub("[\(\[].*?[\)\]]", "", x) for x in without_radec]
    remove_non_digits = [re.sub("[a-z:'\"º()=\u00b0]+", ' ', x) for x in remove_inside_parentheses]
    return [remove_interval(x) for x in remove_non_digits]


def get_date(dataset_name, keys):
    date = {}
    if dataset_name == 'gcn':
        with open('./data/gcn/dataset.json') as f:
            data = json.load(f)
        for key, body in data.items():
            if key in keys:
                body = body.split('\n')
                date_str = list(filter(lambda x: x.startswith("DATE:"), body))
                date[key] = date_str[0].replace("DATE:", '').strip() if len(date_str) > 0 else ""
    elif dataset_name == 'atel':
        with open('./data/atel/dataset.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['id'] in keys:
                    date[row['id']] = row['date']
    return date


def process_group(s, groups):
    if len(s) > 1:
        s = [j for sub in s for j in sub]  # flatten input list
    s = np.unique(s)
    res = []
    for si in s:
        for group in groups:
            if group in si:
                res.append(si)
    return res


def prepare_groups(entity_name, dataset_name, indices_path):
    keys = create_indices(dataset_name, indices_path)
    with open("./data/prompts.json", "r") as f:
        groups = json.load(f)["group"][entity_name]
    with open(f"./data/{dataset_name}/{entity_name}/grouped_completions.json", "r") as f:
        tmp = json.load(f)
        data = {key: tmp[key] for key in keys}
    for key in keys:
        data[key] = process_group(data[key], groups)
    return data


def get_grouped_entities(entity_name, dataset_name, indices_path):
    get_completions(dataset_name=dataset_name, engine="gpt-4-0613", shots_num=1, indices_path=indices_path,
                    entity_name=entity_name)
    data = prepare_groups(entity_name, dataset_name, indices_path)
    return data


def dump_ffn_input_completions(entity_name, dataset_name, data, keys):
    entity_folder = f"./data/{dataset_name}/{entity_name}"
    os.makedirs(entity_folder, exist_ok=True)
    with open(f"{entity_folder}/completions.json", "w") as f:
        json.dump({k: [item[entity_name] for item in data[k]] for k in keys}, f, indent=2)


def get_ffn_ranged_entities(dataset_name, data, indices_path):
    ranged_entities = {}
    keys = create_indices(dataset_name, indices_path)
    for entity_name in Entity:
        dump_ffn_input_completions(entity_name, dataset_name, data, keys)
        get_embeddings(dataset_name, ModelType.ADA, entity_name, indices_path)
        get_ranged_completions(dataset_name, entity_name, indices_path)
        if entity_name == Entity.EVENT_TYPE or entity_name == Entity.OBJECT_TYPE:
            ranged_entities[entity_name] = get_grouped_entities(entity_name, dataset_name, indices_path)
        else:
            with open(f"./data/{dataset_name}/{entity_name}/ranked_completions.json", 'r') as f:
                ranged_entities[entity_name] = json.load(f)
    return {key: {entity_name.value: ranged_entities[entity_name][key] for entity_name in Entity} for key in keys}


def get_extractable_entities(dataset_name, data, indices_path):
    entities = {}
    keys = create_indices(dataset_name, indices_path)
    date = get_date(dataset_name, keys)
    for k in keys:
        entities[k] = {
            "messenger_type": data[k][0]['messenger_type'] if isinstance(data[k][0]['messenger_type'], str) else [
                data[k][0]['messenger_type']],
            "coordinates": remove_characters(data[k][0]['coordinates']),
            "coordinate_system": data[k][0]['coordinate_system'],
            "date": date[k]}
    return entities


def extract_data(dataset_name, indices_path=None):
    with open(f'./data/{dataset_name}/function_completions.json', 'r') as f:
        data = json.load(f)

    extractable_entities = get_extractable_entities(dataset_name, data, indices_path)
    ffn_ranged_entities = get_ffn_ranged_entities(dataset_name, data, indices_path)

    for key in extractable_entities:
        extractable_entities[key].update(ffn_ranged_entities.get(key, {}))

    update_json_file(f'./data/{dataset_name}/entities.json',
                     extractable_entities
                     )


def main():
    parser = argparse.ArgumentParser(description="Extract entities for given dataset messages.")

    parser.add_argument("-d", "--dataset", required=True, help="Dataset name", type=Dataset, choices=list(Dataset))
    parser.add_argument("-i", "--indices_path", type=str, help="Path to file with indices", default=None)
    args = parser.parse_args()

    extract_data(args.dataset, args.indices_path)


if __name__ == "__main__":
    main()
