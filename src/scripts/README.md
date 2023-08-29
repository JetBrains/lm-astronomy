# Entity Extraction Pipeline
This pipeline extracts entities from astronomical data from GCN Circulars and the Astronomer's Telegram (ATel).

Source data:
- GCN Circulars: [https://gcn.gsfc.nasa.gov](https://gcn.gsfc.nasa.gov)
- ATel: [https://www.astronomerstelegram.org](https://www.astronomerstelegram.org)

## Usage
### 1. Crawlers (`atel_crawler.py` and `gcn_crawler.py`)
These scripts update the ATel and GCN datasets stored in `./data/{dataset_name}/dataset.json`. Run using the following commands:

```
python3 atel_crawler.py
python3 gcn_crawler.py
```

**Requirements:** html2text, bs4, requests

### 2. Generate Embeddings using OpenAI API (`gen_embeddings.py`)
Use this script to generate embeddings for given messages. 

1. For generating embeddings for the dataset messages, run:

```
python3 scripts/gen_embeddings.py -d {dataset_name} -e text-similarity-davinci-001 -i {indices_path}
```
Results will be written in the `./data/{dataset_name}/` folder.

**Requirements:** openai

2. For generating embeddings for entities, run:

```
python3 scripts/gen_embeddings.py -d {dataset_name} -e text-embedding-ada-002 -en {entity_name} -i {indices_path}
```
Results will be written in the `./data/{dataset_name}/{entity}/` folder.

### 3. Generate Completions using OpenAI API (`gen_completions.py`)
This script generates completions for given messages for such entities as `messenger_type`, `coordinates`,`object_name_or_event_ID`, `object_type`, `event_type`, `coordinate_system`. Run using:

```
python3 scripts/gen_completions.py --dataset {dataset_name} -e gpt-4-0613 -i {indices_path}
```

Results will be written in the `./data/{dataset_name}/function_completions.json` file.

**Requirements:** openai

### 4. Entity Extractor (`extract_data.py`)
This script extracts entities for given dataset messages. The entities are divided into two types. Certain types of entities such as `event_type`, `object_type`, and `object_name_or_event_ID` are ranked using a feed-forward network (`ffn_inference.py`). Other entities like `messenger_type`, `coordinates`, `coordinate_system`, `date` are extracted using the openai API or directly from the text. Run using:

```
python3 scripts/extract_data.py -d {dataset_name} -i {indices_path}
```

Results will be added to the `./data/{dataset_name}/entities.json` file.

### 5. FFN Inference (`ffn_inference.py`)
This script ranks embeddings for `object_name_or_event_ID`, `event_type` and `object_type` using the trained feed-forward network [[1]](#1). Run using:

```
python3 scripts/ffn_inference.py -d {dataset_name} -en {entity_name} -i {indices_path}
```

**Note:** In each script, `-i` specifies the file with indices. If it is not provided, indices will be calculated as the difference between indices in the `./data/{dataset_name}/dataset.json` and `./data/{dataset_name}/entities.json` files.

## References
1. Sotnikov, V.; Chaikova, A. Language Models for Multimessenger Astronomy. Galaxies 2023, 11, 63. [https://doi.org/10.3390/galaxies11030063](https://doi.org/10.3390/galaxies11030063).