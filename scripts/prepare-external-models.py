"""Extract the curated CC0 selection from locally acquired publisher archives.

Run from any directory. No network calls or publisher code execution.
Preserves source bytes and dependencies; records every archive member separately.
"""
import hashlib
import json
import struct
from pathlib import Path, PurePosixPath
from urllib.parse import unquote
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "assets/external"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    manifest = json.loads((LIBRARY / "catalog.json").read_text())
    for pack in manifest["collections"]:
        if not pack.get("archive"):
            continue
        archive = ROOT / pack["archive"]
        if digest(archive.read_bytes()) != pack["archive_sha256"]:
            raise ValueError(f"Archive checksum mismatch: {archive}")
        with zipfile.ZipFile(archive) as z:
            if z.testzip():
                raise ValueError(f"Invalid archive: {archive}")
            inventory = []
            for member in z.infolist():
                if not member.is_dir():
                    inventory.append({"path": member.filename, "bytes": member.file_size,
                                      "sha256": digest(z.read(member))})
            target = ROOT / pack["inventory"]
            target.write_text(json.dumps(inventory, indent=2) + "\n")

            def extract(member, destination):
                destination = destination.resolve()
                if not destination.is_relative_to(LIBRARY.resolve()):
                    raise ValueError(f"Unsafe destination: {destination}")
                data = z.read(member)
                destination.parent.mkdir(parents=True, exist_ok=True)
                if destination.exists() and destination.read_bytes() != data:
                    raise ValueError(f"Refusing to overwrite modified source: {destination}")
                destination.write_bytes(data)

            for item in pack["license_files"]:
                extract(item["member"], ROOT / item["path"])
            for asset in manifest["assets"]:
                if asset["collection"] != pack["id"]:
                    continue
                member, destination = asset["archive_member"], ROOT / asset["source_path"]
                extract(member, destination)
                if destination.suffix in (".gltf", ".glb"):
                    if destination.suffix == ".gltf":
                        gltf = json.loads(destination.read_text())
                    else:
                        data = destination.read_bytes()
                        size, kind = struct.unpack_from("<II", data, 12)
                        if kind != 0x4E4F534A:
                            raise ValueError(f"Missing GLB JSON chunk: {destination}")
                        gltf = json.loads(data[20:20 + size])
                    for resource in gltf.get("buffers", []) + gltf.get("images", []):
                        uri = resource.get("uri", "")
                        if not uri or uri.startswith("data:"):
                            continue
                        relative = PurePosixPath(unquote(uri))
                        if relative.is_absolute() or ".." in relative.parts or ":" in uri:
                            raise ValueError(f"Unsupported source URI: {uri}")
                        source_member = asset.get("dependency_aliases", {}).get(
                            uri, str(PurePosixPath(member).parent / relative))
                        extract(source_member, destination.parent / str(relative))
            print(f"Verified and extracted {pack['id']}: {len(inventory)} archive files")


if __name__ == "__main__":
    main()
