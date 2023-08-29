import argparse
import json
import pickle
from utils import Entity, Dataset
import torch
import numpy as np
import torch.nn as nn

hidden_dim = 512


class GenEmbeddigsLinear(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(GenEmbeddigsLinear, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.dropout = nn.Dropout(p=0.2)
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x_in):
        intermediate = self.fc1(x_in)
        intermediate_d = self.dropout(intermediate)
        output = self.fc2(intermediate_d)
        return output


def get_answer_embedding(model, input_emb, output_dim):
    res = np.zeros((input_emb.shape[0], output_dim))
    for i, input in enumerate(input_emb):
        input_tn = torch.from_numpy(input).double()
        output = model(input_tn).detach().numpy()
        res[i] = output
    return res


def get_closest_embedding(completions, completions_embeddings, ranked_embeddings):
    res_emb, res_compl = np.zeros(ranked_embeddings.shape), {}
    for i, key in enumerate(completions.keys()):
        non_zero_preds = [i for i in completions_embeddings[i] if not np.array_equal(i, np.zeros(shape=i.shape))]
        min_idx = np.argmin([np.linalg.norm(ranked_embeddings[i] - pred) for pred in non_zero_preds])
        res_emb[i] = non_zero_preds[min_idx]
        if completions[key][min_idx]:
            res_compl[key] = completions[key][min_idx]
        else:
            res_compl[key] = []
    return res_compl


def load_model(input_dim, hidden_dim, output_dim, entity_name):
    model = GenEmbeddigsLinear(input_dim, hidden_dim, output_dim)
    model.load_state_dict(torch.load(f"./data/ffn/{output_dim}/{entity_name}_state_dict_model.pt"))
    model = model.double()
    model.eval()
    return model


def find_indices(a, b):
    return [b.index(i) for i in a if i in b]


def load_embeddings(dataset_name, entity_name, indices_path):
    with open(f"./data/{dataset_name}/filenames.json", 'rb') as f:
        dataset_keys = json.load(f)
    with open(f"./data/{dataset_name}/{entity_name}/filenames.json", 'rb') as f:
        entity_keys = json.load(f)
    if indices_path:
        with open(indices_path, 'r') as f:
            indices = json.load(f)
    else:
        indices = entity_keys
    with open(f"./data/{dataset_name}/embeddings.bin", 'rb') as f:
        dataset_embeddings = np.array(pickle.load(f))[find_indices(indices, dataset_keys)]
    with open(f"./data/{dataset_name}/{entity_name}/embeddings.bin", 'rb') as f:
        entity_embeddings = np.array(pickle.load(f))[find_indices(indices, entity_keys)]
    return dataset_embeddings, entity_embeddings


def get_ranged_completions(dataset_name, entity_name, indices_path):
    with open(f"./data/{dataset_name}/{entity_name}/completions.json", "r") as f:
        entity_data = json.load(f)
    dataset_embeddings, entity_embeddings = load_embeddings(dataset_name, entity_name, indices_path)
    input_dim, output_dim = dataset_embeddings.shape[-1], entity_embeddings.shape[-1]
    model = load_model(input_dim, hidden_dim, output_dim, entity_name)
    ffn_embeddings = get_answer_embedding(model, dataset_embeddings, output_dim)
    ranked_completions = get_closest_embedding(entity_data, entity_embeddings, ffn_embeddings)
    with open(f"./data/{dataset_name}/{entity_name}/ranked_completions.json", 'w') as f:
        json.dump(ranked_completions, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Rank embeddings for object_name_or_event_ID, event_type and object_type")

    parser.add_argument("-d", "--dataset", required=True, help="Dataset name", type=Dataset, choices=list(Dataset))
    parser.add_argument("-e", "--entity_name", required=True, help="Entity name", type=Entity, choices=list(Entity))
    parser.add_argument("-i", "--indices_path", type=str, help="Path to file with indices", default=None)
    args = parser.parse_args()

    get_ranged_completions(args.dataset, args.entity_name, args.indices_path)


if __name__ == "__main__":
    main()
