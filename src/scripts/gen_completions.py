from enum import Enum
import argparse
import openai
import json
import time
import os
from utils import Dataset, update_json_file, create_indices

openai.api_key = os.getenv('openai_api_key')

functions = [
    {
        "name": "extract_entities",
        "description": "Add the physical properties of an observed event mentioned in astronomical message to the database.",
        "parameters": {
            "type": "object",
            "properties": {
                "messenger_type": {
                    "type": "string",
                    "description": "Possible messenger types observed in text: ['electromagnetic radiation','gravitational waves', 'neutrinos', 'cosmic rays']. Electromagnetic radiation may be mentioned in texts as radio waves, microwaves, infrared, (visible) light, ultraviolet, X-rays, and gamma rays. Output list of observed types, e.g ['electromagnetic radiation', 'gravitational waves']. In case it is not mentioned - null.",
                },
                "coordinates": {
                    "type": "string",
                    "description": "Explicitly stated coordinates of the observed events in the given text. Coordinates may be entered in the Equatorial, Galactic, and Ecliptic coordinate systems. The output should be an array of coordinates in format readable by SkyCoord, e.g Input: RA=4h16m06s.10, Dec=-5o40'32''.4; Output: ['4 16 06.10, -5 40 32.4']. In case it is not mentioned - null.",
                },
                "object_name_or_event_ID": {
                    "type": "string",
                    "description": "The names of all the mentioned astronomical objects and/or IDs of astronomical events. Do not mention references to other ATels and GCN messages, names of telescopes, observatories or other irrelevant names.",
                },
                "object_type": {
                    "type": "string",
                    "description": "The types of all mentioned astronomical objects (e.g.  planetary systems, star clusters, asteroids, moons, planets).",
                },
                "event_type": {
                    "type": "string",
                    "description": "Emissions, absorptions, or reflections of electromagnetic radiation observed in a text (e.g. Accretion, FRB, GRB, TDE). It is different from messenger_type, which mentions the type of emission.",
                },
                "coordinate_system": {
                    "type": "string",
                    "description": "The Coordinate Systems used in text. In case it is not mentioned - null. Possible Systems - [J2000, B1950, Galactic, Ecliptic, Equinox]",
                },
            },
            "required":
                ["messenger_type", "coordinates","object_name_or_event_ID", "object_type", "event_type", "coordinate_system"],
        },
    }
]


class Model(str, Enum):
    chat_gpt = 'gpt-3.5-turbo-16k'
    gpt_4 = "gpt-4-0613"


def try_request(engine: str, cur_prompt: str, retries: int = 0):
    if retries >= 5:
        return
    try:
        prompt_chat = [
            {"role": "system",
             "content": "You are a helpful assistant that extracts structured information from ATel and GCN Circulars datasets. Don't make assumptions about what values to plug into functions, but use only information from text."},
            {"role": "user",
             "content": cur_prompt}
        ]
        response = openai.ChatCompletion.create(
            model=engine, functions=functions, messages=prompt_chat, function_call={"name": "extract_entities"})
        json_response = json.loads(response.choices[0]['message']['function_call']['arguments'])
        return json_response
    except openai.error.InvalidRequestError:
        return
    except Exception as e:
        print(f'Retrying after catching an exception, try {retries + 1}\n{e}')
        time.sleep(90)
        return try_request(engine, cur_prompt, retries + 1)


def try_prompt(dataset, engine, indices, shots_num, dataset_name):
    json_output = {}
    for i in indices:
        json_output[i] = []
        for j in range(shots_num):
            response = None
            while response is None:
                response = try_request(engine, dataset[i])
            json_output[i].append(response)
        update_json_file(f"./data/{dataset_name}/function_completions.json", json_output)


def test_prompts(dataset_name, engine, shots_num, indices_path=None):
    with open(f'./data/{dataset_name}/dataset.json') as json_file:
        dataset = json.load(json_file)
    indices = create_indices(dataset_name, indices_path)
    try_prompt(dataset, engine, indices, shots_num, dataset_name)


def main():
    parser = argparse.ArgumentParser(description="Generate completions for given messages.")

    parser.add_argument("-d", "--dataset", required=True, help="Dataset name", type=Dataset, choices=list(Dataset))
    parser.add_argument("-e", "--engine", required=True, help="OpenAI model compatible with ChatCompletion API",
                        type=Model, choices=list(Model))
    parser.add_argument("-s", "--size", type=int, help="Sample size", default=3)
    parser.add_argument("-i", "--indices_path", type=str, help="Path to file with indices", default=None)

    args = parser.parse_args()

    test_prompts(args.dataset, args.engine, args.size, args.indices_path)


if __name__ == "__main__":
    main()
