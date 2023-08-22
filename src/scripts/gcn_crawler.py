import json
import logging
import requests
from tqdm import tqdm


def resolve_suffix(idx: int) -> str:
    if idx < 0:
        suffix = f'neg{abs(idx)}.gcn3'
    else:
        suffix = f'{idx:03}.gcn3'  # handle zeros in indices 000-099
    return suffix


def resolve_link(idx: str) -> str:
    prefix = f'https://gcn.gsfc.nasa.gov/gcn3/{idx}'
    return prefix


def load_gcn(idx: str) -> str:
    link = resolve_link(idx)
    r = requests.get(link)
    if r.status_code == 200:
        return r.text


def fetch_all():
    # Load the existing gcn entities from json file
    with open("./data/gcn_dataset.json", 'r') as f:
        gcn_records = json.load(f)
    latest_id = max(map(lambda x: int(x.split(".")[0].replace("neg", "-")), gcn_records.keys()))  # Fetch the message with the highest index  as latest

    new_records = {}
    idx = latest_id + 1  # Start from the next index
    while True:
        suffix = resolve_suffix(idx)
        print(suffix)
        record = load_gcn(suffix)
        if record is None:  # If there is no record or unsuccessful fetch, quit
            logging.warning(f'Missing circular: {suffix}')
            break
        else:
            new_records[suffix] = record
            idx += 1

    with open('./data/gcn_dataset.json', 'w') as fp:  # Update the json with both old and new records
        json.dump({**gcn_records, **new_records}, fp, indent=2)


if __name__ == '__main__':
    fetch_all()
