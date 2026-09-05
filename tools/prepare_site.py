"""Prepare GitHub Pages and split the existing registry; no external dependencies."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
CHUNK_SIZE = 1000


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
    chunks = OUT / 'nodes'
    chunks.mkdir()
    manifest = {'chunkSize': CHUNK_SIZE, 'count': len(data), 'maxId': max(map(int, data)), 'chunks': sorted(groups)}
    (chunks / 'manifest.json').write_text(json.dumps(manifest, separators=(',', ':')))
    for bucket, records in groups.items():
        (chunks / f'{bucket}.json').write_text(json.dumps(records, separators=(',', ':'), ensure_ascii=False))
    print(f'Prepared {len(data):,} unchanged nodes in {len(groups)} sections.')


if __name__ == '__main__':
    main()
