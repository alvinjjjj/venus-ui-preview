import base64
import copy
import html
import json
import mimetypes
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).parent
BASE = 'https://venus-ui-preview-git-main-venus-4bd6.vercel.app/'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class Node:
    def __init__(self, tag='', attrs=(), start=''):
        self.tag, self.attrs, self.start, self.children = tag, dict(attrs), start, []

    def find(self, predicate):
        if predicate(self):
            return self
        for child in self.children:
            if isinstance(child, Node):
                result = child.find(predicate)
                if result:
                    return result

    def remove(self, predicate):
        self.children = [c for c in self.children if not isinstance(c, Node) or not predicate(c)]
        for child in self.children:
            if isinstance(child, Node):
                child.remove(predicate)

    def render(self):
        body = ''.join(c.render() if isinstance(c, Node) else c for c in self.children)
        if not self.tag:
            return body
        return self.start + body + ('' if self.tag in VOID or self.start.endswith('/>') else '</' + self.tag + '>')


class Parser(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.root = Node()
        self.stack = [self.root]
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.get_starttag_text())
        self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs, self.get_starttag_text()))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, value):
        self.stack[-1].children.append(value)

    def handle_entityref(self, value):
        self.handle_data('&' + value + ';')

    def handle_charref(self, value):
        self.handle_data('&#' + value + ';')


def has_class(name):
    return lambda n: name in n.attrs.get('class', '').split()


def load(name):
    return json.loads(Path('/private/tmp/venus-landing-' + name + '.json').read_text())


def data_uri(path, mime=None):
    path = Path(path)
    return 'data:' + (mime or mimetypes.guess_type(path.name)[0] or 'application/octet-stream') + ';base64,' + base64.b64encode(path.read_bytes()).decode()


raw = load('new-raw')
tree = Parser(raw['html']).root
assets = json.loads(Path('/private/tmp/venus-landing-assets.json').read_text())['assets']
asset_map = {a['url']: data_uri(a['path'], a['contentType']) for a in assets if a['kind'] in ('font', 'image')}


def embed_urls(text, base=BASE):
    def css_url(m):
        value = m.group(1).strip().strip('"\'')
        if value.startswith(('data:', '#')):
            return m.group(0)
        absolute = urljoin(base, value)
        return 'url("' + asset_map.get(absolute, absolute) + '")'
    text = re.sub(r'url\(([^)]+)\)', css_url, text)
    for url, data in asset_map.items():
        text = text.replace('src="' + url + '"', 'src="' + data + '"')
    return text


styles = []
for url in raw['sheets']:
    a = next((a for a in assets if a['url'] == url and a['kind'] == 'stylesheet'), None)
    if a:
        styles.append(embed_urls(Path(a['path']).read_text(), url))
styles.append(raw['css'])
css = '\n'.join(styles)
# Keep the website's 1280 x 720 desktop layout while expanding scroll stages.
css = re.sub(r'([\d.]+)(?:svh|dvh|vh)\b', lambda m: str(float(m.group(1)) * 7.2) + 'px', css)
css = re.sub(r'\((max|min)-height:\s*([\d.]+)px\)', lambda m: '(min-width:0px)' if ((720 <= float(m.group(2))) if m.group(1) == 'max' else (720 >= float(m.group(2)))) else '(max-width:0px)', css)


def artwork_stage(tree, image, hero):
    stage = copy.deepcopy(tree.find(has_class('horizontal-flow-track')))
    if hero:
        stage.remove(has_class('asset-orbit'))
    else:
        for name in ('landing-mockup__headline', 'landing-mockup__details', 'landing-mockup__trusted'):
            stage.remove(has_class(name))
    flow = stage.find(has_class('landing-mockup__flow-field'))
    flow.children = ['<img alt="' + ('Hero flow artwork' if hero else 'Asset orbit artwork') + '" class="figma-flow-artwork" src="' + data_uri(ROOT / image) + '">']
    return stage.render()


nav = tree.find(lambda n: n.tag == 'nav').render()
hero = artwork_stage(tree, 'hero-artwork.png', True)
orbit = artwork_stage(Parser(load('orbit')['html']).root, 'orbit-artwork.png', False)
steps = []
for step in ('supply', 'allocate', 'borrow', 'earn', 'trade'):
    fragment = load(step)['html']
    step_tree = Parser(fragment).root
    dots = step_tree.find(has_class('venus-steps__dots'))
    circles = []
    for y in range(5, 328, 10):
        opacity = 0.22 * min(1, max(0, (327.1171875 - y) / (327.1171875 * 0.7)))
        for x in range(5, 180, 10):
            circles.append(f'<circle cx="{x}" cy="{y}" r="1" fill="white" opacity="{opacity:.4f}"/>')
    dots.children = ['<svg xmlns="http://www.w3.org/2000/svg" width="180" height="327.1171875" viewBox="0 0 180 327.1171875">' + ''.join(circles) + '</svg>']
    fragment = step_tree.render()
    steps.append('<div class="venus-steps-track" data-step="' + step + '" style="--vs3-step-count:1">' + fragment + '</div>')
sections = [hero, orbit, *steps, load('safety')['html'], load('community')['html'], load('footer')['html']]
scoped = []
for i, section in enumerate(sections):
    ids = re.findall(r'\bid="([^"]+)"', section)
    for old in sorted(set(ids), key=len, reverse=True):
        new = 'landing-' + str(i) + '-' + old
        section = section.replace('id="' + old + '"', 'id="' + new + '"').replace('url(#' + old + ')', 'url(#' + new + ')').replace('href="#' + old + '"', 'href="#' + new + '"')
    scoped.append(section)

overrides = '''
html,body{width:1280px!important;min-width:1280px!important;height:auto!important;overflow:visible!important;background:#101218}
body{margin:0}#root{height:auto!important}.figma-landing-content{width:1276px}
.horizontal-flow-track,.horizontal-flow{position:relative!important;top:auto!important;height:656px!important;min-height:656px!important;max-height:656px!important}
.figma-flow-artwork{position:absolute;inset:0;width:1276px;height:656px;max-width:none!important;object-fit:cover}
.venus-steps-track{height:656px!important}.venus-steps-track .venus-steps{position:relative!important;top:auto!important;height:656px!important;min-height:0!important}
.venus-steps__scroll-stop,.preview-controller{display:none!important}
.venus-steps__dots{background:none!important;mask-image:none!important}.venus-steps__dots svg{display:block;width:180px;height:327.1171875px}
*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
.venus-community,.venus-footer{opacity:1!important;transform:none!important}
'''
output = '<!doctype html><html lang="en" data-glass-version="v6" data-glass-preview="v5" data-glass-mode="explorer" data-glass-choice="v5" data-glass-study="v5" data-glass-landing><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="' + BASE + '"><title>Landing — New</title><style>' + css + '</style><style>' + overrides + '</style></head><body><div id="root">' + nav + '<div class="figma-landing-content">' + ''.join(scoped) + '</div></div></body></html>'
for url, data in asset_map.items():
    output = output.replace('src="' + url + '"', 'src="' + data + '"')
(ROOT / 'landing-new.html').write_text(output)
print(json.dumps({'path': str(ROOT / 'landing-new.html'), 'bytes': len(output.encode()), 'sections': len(sections), 'css_sources': len(styles)}))
