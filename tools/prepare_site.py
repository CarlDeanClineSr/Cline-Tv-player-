"""Prepare GitHub Pages and split the existing registry; no external dependencies."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
CHUNK_SIZE = 1000


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
    add_fan_mode(OUT)
    chunks = OUT / 'nodes'
    chunks.mkdir()
    manifest = {'chunkSize': CHUNK_SIZE, 'count': len(data), 'maxId': max(map(int, data)), 'chunks': sorted(groups)}
    (chunks / 'manifest.json').write_text(json.dumps(manifest, separators=(',', ':')))
    for bucket, records in groups.items():
        (chunks / f'{bucket}.json').write_text(json.dumps(records, separators=(',', ':'), ensure_ascii=False))
    print(f'Prepared {len(data):,} unchanged nodes in {len(groups)} sections; FAN mode attached.')


if __name__ == '__main__':
    main()
