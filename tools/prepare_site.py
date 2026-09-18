"""Prepare GitHub Pages and split the existing registry; no external dependencies."""
import json
import re
import shutil
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
CHUNK_SIZE = 1000
PROGRAMMING_BEGIN = '// BEGIN OWNER PROGRAMMING ADDITIONS V1\n'
PROGRAMMING_END = '// END OWNER PROGRAMMING ADDITIONS V1\n\n'


def programming_block(manifest, source):
    """Validate owner-supplied entries, then render inert data before catalog binding.

    Source index.html stays intact. The published copy is self-contained: visitors
    do not fetch a second catalog or run a harvester. Existing arrays only grow.
    """
    if not isinstance(manifest, dict) or manifest.get('schema_version') != 1:
        raise ValueError('Unsupported programming additions schema')
    entries = manifest.get('entries')
    if not isinstance(entries, list) or not entries:
        raise ValueError('Expected a nonempty programming entries list')
    grouped, seen = {}, set()
    for entry in entries:
        if not isinstance(entry, dict) or set(entry) != {'channel', 'n', 'u'}:
            raise ValueError('Each addition needs exactly channel, n and u')
        channel, name, url = entry['channel'], entry['n'], entry['u']
        if type(channel) is not int or not 1 <= channel <= 26:
            raise ValueError('Addition has an invalid existing channel')
        if not isinstance(name, str) or not name.strip():
            raise ValueError('Addition has an empty title')
        if not isinstance(url, str) or url != url.strip():
            raise ValueError('Addition has an invalid URL')
        parsed = urlsplit(url)
        host = parsed.hostname or ''
        match = re.fullmatch(r'/(?:download/|\d+/items/)([^/]+/.+\.mp4)',
                             unquote(parsed.path))
        if (parsed.scheme != 'https' or
                not (host == 'archive.org' or host.endswith('.archive.org')) or
                parsed.username or parsed.password or parsed.query or parsed.fragment or
                parsed.port not in (None, 443) or match is None):
            raise ValueError(f'Expected an exact Archive.org HTTPS MP4 URL: {url}')
        key = match.group(1)
        if key in seen:
            raise ValueError(f'Duplicate Archive.org file in additions: {key}')
        seen.add(key)
        if len(re.findall(rf'\bconst\s+ch{channel}\s*=\s*\[', source)) != 1:
            raise ValueError(f'Expected one existing ch{channel} array')
        grouped.setdefault(channel, []).append({'n': name, 'u': url})
    lines = []
    for channel, rows in grouped.items():
        # Escape HTML delimiters even in a quoted title; data must not end a script.
        payload = json.dumps(rows, ensure_ascii=True, separators=(',', ':'))
        payload = payload.replace('<', r'\u003c').replace('>', r'\u003e').replace('&', r'\u0026')
        lines.append(f'ch{channel}.push(...{payload});\n')
    return PROGRAMMING_BEGIN + ''.join(lines) + PROGRAMMING_END


def add_programming(output, manifest_path=None):
    """Append only the validated supplement to the published index; idempotent."""
    page = output / 'index.html'
    text = page.read_text(encoding='utf-8')
    if PROGRAMMING_BEGIN in text or PROGRAMMING_END in text:
        if text.count(PROGRAMMING_BEGIN) != 1 or text.count(PROGRAMMING_END) != 1:
            raise ValueError('Ambiguous programming-additions boundaries')
        before, _, tail = text.partition(PROGRAMMING_BEGIN)
        _, end, after = tail.partition(PROGRAMMING_END)
        if not end:
            raise ValueError('Malformed programming-additions boundaries')
        text = before + after
    anchor = 'const categories = ['
    if text.count(anchor) != 1:
        raise ValueError('Expected exactly one existing categories declaration')
    manifest_path = manifest_path or ROOT / 'tools' / 'programming-additions.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    block = programming_block(manifest, text)
    page.write_text(text.replace(anchor, block + anchor, 1), encoding='utf-8')


def add_fan_mode(output):
    """Add only navigation and a deferred host script to the published copy.

    The original self-contained index.html and its entire catalog remain unchanged.
    Running this function twice is harmless; missing anchors fail the build.
    """
    page = output / 'index.html'
    text = page.read_text(encoding='utf-8')
    for relative in ('fan.html', 'assets/fan-host.js', 'assets/fan-audio.js',
                     'assets/fan-ui.js', 'assets/fan-noise-worklet.js'):
        if not (output / relative).is_file():
            raise ValueError(f'Missing fan asset: {relative}')
    anchor = '<a href="index.html" aria-current="page">TV</a>'
    button = '<a id="fan-mode" href="fan.html" title="Vintage-style fan sound tuner">FAN</a>'
    script = '<script defer src="assets/fan-host.js"></script>'
    if 'id="fan-mode"' not in text:
        if text.count(anchor) != 1:
            raise ValueError('Expected exactly one existing TV navigation link')
        text = text.replace(anchor, anchor + button, 1)
    if script not in text:
        if text.count('</body>') != 1:
            raise ValueError('Expected exactly one TV closing body tag')
        text = text.replace('</body>', script + '\n</body>', 1)
    page.write_text(text, encoding='utf-8')


def main():
    data = json.loads((ROOT / 'nodes.json').read_text())
    if not isinstance(data, dict) or not data:
        raise ValueError('nodes.json must contain a nonempty object keyed by node number')
    groups = {}
    for key, record in data.items():
        if not key.isdigit() or int(key) < 1 or str(int(key)) != key:
            raise ValueError(f'Invalid node number: {key}')
        if not isinstance(record, dict):
            raise ValueError(f'Invalid node record: {key}')
        bucket = (int(key) - 1) // CHUNK_SIZE
        groups.setdefault(bucket, {})[key] = record
    # Only remove our own generated output, never source or backups.
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for source in ROOT.iterdir():
        if source.name.startswith('.') or source.name in {'_site', 'tools', 'tests', 'nodes'}:
            continue
        target = OUT / source.name
        if source.is_dir():
            shutil.copytree(source, target)
        else:
            shutil.copy2(source, target)
    add_programming(OUT)
    add_fan_mode(OUT)
    chunks = OUT / 'nodes'
    chunks.mkdir()
    manifest = {'chunkSize': CHUNK_SIZE, 'count': len(data), 'maxId': max(map(int, data)), 'chunks': sorted(groups)}
    (chunks / 'manifest.json').write_text(json.dumps(manifest, separators=(',', ':')))
    for bucket, records in groups.items():
        (chunks / f'{bucket}.json').write_text(json.dumps(records, separators=(',', ':'), ensure_ascii=False))
    print(f'Prepared {len(data):,} unchanged nodes in {len(groups)} sections; programming additions and FAN mode attached.')


if __name__ == '__main__':
    main()
