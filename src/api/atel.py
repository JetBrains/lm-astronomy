import json
from datetime import datetime
from typing import Optional

import aiohttp
from pydantic import BaseModel
from rdflib import Graph


class ATelRecord(BaseModel):
    author: str
    creator: str
    creatoremail: str
    description: str
    identifier: str
    link: str
    provenance: str
    publisher: str
    title: str
    date: datetime


async def load_record(record_id: str) -> Optional[ATelRecord]:
    """Load the RDF record from the ATel website and convert to dict."""
    url = f'https://www.astronomerstelegram.org/?rss+{record_id}'
    # if not status 200, return None
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                return None
            response_rss_xml = await response.text()
    g = Graph()
    g.parse(data=response_rss_xml, format='xml')
    record_raw = json.loads(g.serialize(format='json-ld'))
    # choose the longest sublist
    record_raw = max(record_raw, key=lambda x: len(x))
    record = {}
    for key, value in record_raw.items():
        if key.startswith('http://purl.org/rss/1.0/'):
            record[key[len('http://purl.org/rss/1.0/'):]] = value[0]['@value'].strip()
    record['date'] = datetime.fromisoformat(record_raw['http://purl.org/dc/elements/1.1/date'][0]['@value'].strip())
    atel_record = ATelRecord(**record)
    return atel_record


if __name__ == '__main__':
    import asyncio

    loop = asyncio.get_event_loop()
    print(loop.run_until_complete(load_record('15')))
