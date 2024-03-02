# lm-astronomy API

[![research JetBrains project](https://jb.gg/badges/research.svg)](https://confluence.jetbrains.com/display/ALL/JetBrains+on+GitHub)

The `lm-astronomy` API is designed to facilitate the searching and cross-referencing of GCN Circulars and the Astronomer's Telegram (ATel) messages. Currently, our dataset includes 15k ATel and 31k GCN messages. In case you wish to further extend the dataset, we provide a pipeline for preprocessing additional messages.

## Features

Using the API, you can search, and filter the messages using the following parameters:

- `object_type`: This references a predetermined set of object types. Please consult the API documentation for a complete list.
- `event_type`: References a specific set of event types predefined in the system. You can find the complete list in the API documentation.
- `object_name`: This allows you to search by the particular name of the astronomical object.
- `coordinates`: You can supply the coordinates of the area of interest to find messages regarding events that occured in that region. The coordinates should be provided in ICRS format. If you provide the coordinates, you must also specify a radius (`radius`) to search for messages that mention coordinates within that radius.
- `messenger_type`: This pertains to the type of messenger associated with the event. Here, you can filter by four types: `electromagnetic radiation`, `gravitational waves`, `neutrinos`, and `cosmic rays`.

## Local Setup

To run this API locally, use:

```
docker compose build && docker compose up
```

## API Endpoints Examples

The following are examples of how to make requests to the API endpoints:

- To filter by both `event_type` and `object_type`:

```
curl -X 'GET' \
  'https://lm-astronomy.labs.jb.gg/api/search/?event_type=High%20Energy%20Event&object_type=Supernova' \
  -H 'accept: application/json'
```

- To search within a given radius of specific coordinates:

```
curl -X 'GET' \
  'https://lm-astronomy.labs.jb.gg/api/search/?coordinates=266.76%20-28.89&radius=5' \
  -H 'accept: application/json'
```

You can provide coordinates using the Equatorial coordinate system, expressed either in decimal degrees or sexagesimal format. The coordinates should be without commas and explicit units. To see an example, you can consult [NASA'S HEASARC](https://heasarc.gsfc.nasa.gov/Tools/name_or_coordinates_help.html) (the first three examples).
**Please note**: To make a request using object coordinates, you must also provide a radius parameter.

- To get metadata for a specific ATel message:

```
curl -X 'GET' \
  'https://lm-astronomy.labs.jb.gg/api/atel/14778' \
  -H 'accept: application/json'
```

# Entity Extraction Pipeline

This pipeline extracts entities from astronomical data from GCN Circulars and the Astronomer's Telegram (ATel).

Source data:

- [GCN Circulars](https://gcn.gsfc.nasa.gov)
- [ATel](https://www.astronomerstelegram.org)

## Setup

Follow these steps to set up your environment.

### Step 1: Add OpenAI API Key

Firstly, you need to add the OpenAI API key to your environment variables.
Please replace `{key}` with your OpenAI key.

```sh
export openai_api_key={key}
```

### Step 2: Install Requirements

Make sure all necessary Python packages are installed.

```sh
pip install -r scripts/requirements.txt
pip install -r api/requirements.txt
```

## Pipeline Usage

### 1. Crawlers (`atel_crawler.py` and `gcn_crawler.py`)

These scripts update the ATel and GCN datasets stored in `data/{dataset_name}/dataset.json`. Run using the following
commands:

```
python3 atel_crawler.py
python3 gcn_crawler.py
```

### 2. Generate Embeddings using OpenAI API (`gen_embeddings.py`)

Use this script to generate embeddings for given messages.

1. For generating embeddings for the dataset messages, run:

```
python3 scripts/gen_embeddings.py -d {dataset_name} -e text-similarity-davinci-001 -i {indices_path}
```

Results will be written in the `data/{dataset_name}/` folder.

2. For generating embeddings for entities, run:

```
python3 scripts/gen_embeddings.py -d {dataset_name} -e text-embedding-ada-002 -en {entity_name} -i {indices_path}
```

Results will be written in the `data/{dataset_name}/{entity_name}/` folder.
Folder `data/weights/` contains weights of a
fine-tuned [pearsonkyle/gpt2-exomachina](https://huggingface.co/pearsonkyle/gpt2-exomachina) which can be used for
generating embeddings/

### 3. Generate Completions using OpenAI API (`gen_completions.py`)

This script generates completions for given messages for such entities
as `messenger_type`, `coordinates`,`object_name_or_event_ID`, `object_type`, `event_type`, `coordinate_system`. Run
using:

```
python3 scripts/gen_completions.py --dataset {dataset_name} -e gpt-4-0613 -i {indices_path}
```

Results will be written in the `data/{dataset_name}/function_completions.json` file.

### 4. Entity Extractor (`extract_data.py`)

This script extracts entities for given dataset messages. The entities are divided into two types. Certain types of
entities such as `event_type`, `object_type`, and `object_name_or_event_ID` are ranked using a feed-forward
network (`ffn_inference.py`). Other entities like `messenger_type`, `coordinates`, `coordinate_system`, `date` are
extracted using the openai API or directly from the text. Run using:

```
python3 scripts/extract_data.py -d {dataset_name} -i {indices_path}
```

Results will be added to the `data/{dataset_name}/entities.json` file.
Note, that for the data to be extracted, embeddings and completions for given dataset messages should already be
computed using `gen_embeddings.py` and `gen_completions.py`

#### 4.1 Grouped Entity Extraction

In order to simplify the process of searching through messages, we categorized the most significant types of events and
objects. Subsequently, we associated the event_type and object_type entities obtained via FFN with these categories.
This was done to decrease the variety of potential event and object types. This is accomplished through
the `get_grouped_entities` function.

Do note, however, that the categorization process could occasionally produce groups outside of
the pre-determined ones.

### 5. FFN Inference (`ffn_inference.py`)

This script ranks embeddings for `object_name_or_event_ID`, `event_type` and `object_type` using the trained
feed-forward network [[1]](#1). Directories in `data/ffn/` contain feed-forward network weights and are named
accordingly to their output dimensions. Run using:

```
python3 scripts/ffn_inference.py -d {dataset_name} -en {entity_name} -i {indices_path}
```

**Note:** In each script, `-i` specifies the file with indices. If it is not provided, indices will be calculated as the
difference between indices in the `data/{dataset_name}/dataset.json` and `data/{dataset_name}/entities.json` files.

## References

1. Sotnikov, V.; Chaikova, A. Language Models for Multimessenger Astronomy. Galaxies 2023, 11, 63. 
   [https://doi.org/10.3390/galaxies11030063](https://doi.org/10.3390/galaxies11030063).
2. [Nimbus: Online demo-version](https://lm-astronomy.labs.jb.gg/) 
3. [FastAPI](https://lm-astronomy.labs.jb.gg/docs)
4. [Astroparticle Physics Lab at JetBrains Research](https://lp.jetbrains.com/research/astroparticle-physics/)
