import requests
from bs4 import BeautifulSoup
import json
from html2text import HTML2Text
import csv


class ATelCrawler:
    _url = 'https://www.astronomerstelegram.org'
    # _headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0'}
    _headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'}

    def __init__(self):
        self._stripper = HTML2Text()
        self._stripper.ignore_emphasis = True
        self._stripper.single_line_break = True
        self._stripper.ignore_links = True
        self._stripper.body_width = 0

    def headers(self):
        return (
            'id',
            'link',
            'title',
            'authors',
            'mailto',
            'date',
            'provenance',
            'subjects',
            'description',
        )

    def _crawl_one(self, id):
        rec = {'id': id}
        rec['link'] = f'{self._url}/?read={id}'
        xml = requests.get(
            self._url,
            params={'read': id},
            headers=self._headers,
        )
        xml = BeautifulSoup(xml.text, 'html.parser')
        xml = xml.find('div', id='telegram')
        xml.find('div', id='tnav').decompose()
        rec['title'] = xml.find('center').extract().get_text()
        t = xml.find('em').extract()
        xml.find('p', align='CENTER').decompose()
        authors = t.find('strong').extract()
        rec['authors'] = authors.get_text()
        authors = authors.find('a')
        if authors is not None:
            rec['mailto'] = authors.attrs['href'].replace('mailto:', '')
        else:
            rec['mailto'] = ''
        rec['date'] = t.find('strong').get_text()
        rec['provenance'] = t.find('em').get_text() \
            .replace('Credential Certification:', '').strip()
        t = xml.find('div', id='subjects').extract()
        rec['subjects'] = t.get_text().replace('Subjects:', '').strip()
        xml.find('a', class_='twitter-share-button').decompose()
        xml.find('script').decompose()
        if xml.find('p').get_text().strip() == '':
            xml.find('p').decompose()
        rec['description'] = self._stripper.handle(repr(xml)).strip()
        return rec

    def read_last_id(self):
        with open("./data/atel_dataset.json", "r") as file:
            data = json.load(file)

        last_read_id = max(map(int, data.keys()))  # assuming keys are the IDs
        return last_read_id

    @classmethod
    def get_max_id(cls):
        response = requests.get(
            f'{cls._url}/?rss',
            headers=cls._headers,
        )
        xml = BeautifulSoup(response.text, 'html.parser')
        return int(xml.find('item').attrs['rdf:about'].rpartition('=')[2])

    def crawl(self):
        start_id = self.read_last_id()
        end_id = self.get_max_id()
        for id in range(start_id, end_id + 1):
            print(id)
            rec = self._crawl_one(id)
            self.write_to_csv(rec)
            self.write_to_json(rec)

    def write_to_csv(self, rec):
        with open('./data/atel/dataset.csv', 'a+') as f:
            writer = csv.DictWriter(f, fieldnames=self.headers())
            writer.writeheader()
            writer.writerow(rec)

    def write_to_json(self, rec):
        with open("./data/atel/dataset.json", 'r') as f:
            dataset = json.load(f)
        dataset.update({rec["id"]: rec["description"]})
        with open("./data/atel/dataset.json", 'w') as f:
            json.dump(dataset, f, indent=2)


if __name__ == '__main__':
    ATelCrawler().crawl()
