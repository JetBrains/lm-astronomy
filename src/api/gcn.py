from datetime import datetime
from typing import Optional

import aiohttp
from pydantic import BaseModel


class GCNRecord(BaseModel):
    author: str
    link: str
    title: str
    date: datetime
    description: str


async def load_gcn_record(record_id: str) -> Optional[GCNRecord]:
    """Load the JSON record from the NASA GCN website and convert to dict."""
    record_id = record_id.replace('neg', '-').replace('.gcn3', '')
    url = f'https://gcn.nasa.gov/circulars/{record_id}.json'
    # if not status 200, return None
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                return None
            response = await response.json()
    record = GCNRecord(
        author=response['submitter'],
        link=url,
        title=response['subject'],
        date=datetime.fromtimestamp(response['createdOn'] / 1000),
        description=response['body'],
    )
    return record


if __name__ == '__main__':
    import asyncio

    loop = asyncio.get_event_loop()
    print(loop.run_until_complete(load_gcn_record('13009.gcn3')))
