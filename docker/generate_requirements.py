import os

import tomllib

docker_folders = [x for x in os.listdir(".") if os.path.isdir(x)]
with open('../poetry.lock', 'rb') as fp:
    poetry_lock = tomllib.load(fp)

with open('../pyproject.toml', 'rb') as fp:
    pyproject_toml = tomllib.load(fp)
all_deps = pyproject_toml['tool']['poetry']['dependencies']
all_deps = [x.lower() for x in all_deps]

lib_versions = {x['name'].lower(): x['version']
                for x in poetry_lock['package']
                # if x['name'].lower() in all_deps
                }
lib_versions = {k: v.split('+')[0] for k, v in lib_versions.items()}
lib_versions['uvicorn[standard]'] = lib_versions['uvicorn']

for folder_name in docker_folders:
    if not os.path.exists(f'./{folder_name}/requirements.txt'):
        continue
    with open(f'{folder_name}/requirements.txt', 'r') as fp:
        requirements = fp.read().split()
    requirements = [x.split('==')[0] for x in requirements]
    requirements = [x.split('~=')[0] for x in requirements]
    requirements = [f'{x.lower()}=={lib_versions[x.lower()]}'
                    for x in requirements]
    with open(f'{folder_name}/requirements.txt', 'w') as fp:
        fp.write('\n'.join(requirements))
