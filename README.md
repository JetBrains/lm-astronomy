# lm-astronomy API

This API is designed to facilitate the search and cross-referencing of GCN Circulars and the Astronomer's Telegram (
ATel) messages. Currently, our database has preprocessed 15,009 ATel and 31,125 GCN messages. For any additional
messages, you can use our provided pipeline to process them.

## Features

The API allows you to search and filter the messages by the following entities:

- object_type
- event_type
- object_name_or_coordinates
- messenger_type

Both `object_type` and `event_type` are enums, which are predefined and can be accessed on the API documentation.

`object_name_or_coordinates` allows you to search either by the name of the object or by the event ID. You may also use
coordinates in a format compatible with `astropy.coordinates.SkyCoord.` If you provide coordinates, you can also specify
a radius to search for messages that mention coordinates within that radius.

`messenger_type` refers to the type of messenger. There are 4 types you can filter
by: `electromagnetic radiation`, `gravitational waves`, `neutrinos`, and `cosmic rays`.

## Local Setup

To use this API locally, run:

```
docker compose build && docker compose up
```

## API Endpoints

Here are some examples of how to make requests to the API endpoints:

- To filter by `event_type` and `object_type`, use:

```
/api/filter/?event_type=High Energy Event&object_type=Galaxy
```

- To search within a radius of given coordinates, use:

```
/api/filter/?object_name_or_coordinates=266.76-28.89&radius=3
```

- To get the object type of specific ATel message, use:

```
/api/atel/1203/object_type
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

## API Usage

## Pipeline Usage

### 1. Crawlers (`atel_crawler.py` and `gcn_crawler.py`)

These scripts update the ATel and GCN datasets stored in `./data/{dataset_name}/dataset.json`. Run using the following
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

Results will be written in the `./data/{dataset_name}/` folder.

2. For generating embeddings for entities, run:

```
python3 scripts/gen_embeddings.py -d {dataset_name} -e text-embedding-ada-002 -en {entity_name} -i {indices_path}
```

Results will be written in the `./data/{dataset_name}/{entity}/` folder.

### 3. Generate Completions using OpenAI API (`gen_completions.py`)

This script generates completions for given messages for such entities
as `messenger_type`, `coordinates`,`object_name_or_event_ID`, `object_type`, `event_type`, `coordinate_system`. Run
using:

```
python3 scripts/gen_completions.py --dataset {dataset_name} -e gpt-4-0613 -i {indices_path}
```

Results will be written in the `./data/{dataset_name}/function_completions.json` file.

### 4. Entity Extractor (`extract_data.py`)

This script extracts entities for given dataset messages. The entities are divided into two types. Certain types of
entities such as `event_type`, `object_type`, and `object_name_or_event_ID` are ranked using a feed-forward
network (`ffn_inference.py`). Other entities like `messenger_type`, `coordinates`, `coordinate_system`, `date` are
extracted using the openai API or directly from the text. Run using:

```
python3 scripts/extract_data.py -d {dataset_name} -i {indices_path}
```

Results will be added to the `./data/{dataset_name}/entities.json` file.
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
feed-forward network [[1]](#1). Run using:

```
python3 scripts/ffn_inference.py -d {dataset_name} -en {entity_name} -i {indices_path}
```

**Note:** In each script, `-i` specifies the file with indices. If it is not provided, indices will be calculated as the
difference between indices in the `./data/{dataset_name}/dataset.json` and `./data/{dataset_name}/entities.json` files.

## References

1. Sotnikov, V.; Chaikova, A. Language Models for Multimessenger Astronomy. Galaxies 2023, 11,
    63. [https://doi.org/10.3390/galaxies11030063](https://doi.org/10.3390/galaxies11030063).