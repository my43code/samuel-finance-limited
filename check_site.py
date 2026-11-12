from html.parser import HTMLParser
from pathlib import Path

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, 'Duplicate ID'
            self.ids.add(a['id'])
        self.refs.extend(a[k] for k in ('src', 'href') if k in a)
        if tag == 'img':
            assert a.get('alt'), 'Missing image description'

root = Path(__file__).parent / 'dist'
p = Page()
p.feed((root / 'index.html').read_text(encoding='utf-8'))
for ref in p.refs:
    if ref.startswith('#'):
        assert len(ref) == 1 or ref[1:] in p.ids, ref
    elif not ref.startswith(('http', 'mailto:', 'tel:')):
        assert (root / ref).is_file(), ref
print('PASS: local links, section targets, unique IDs and image descriptions.')
