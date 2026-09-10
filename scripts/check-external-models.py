"""Offline file-integrity and glTF inventory checks for the acquisition library.

--record writes a new integrity baseline after an intentional acquisition/edit.
Default mode verifies that baseline. This is not a full Khronos glTF validator
or a substitute for browser rendering, performance and historical-style review.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "assets/external"


def document(path):
    data = path.read_bytes()
    if path.suffix == ".gltf":
        return json.loads(data), None
    magic, version, length = struct.unpack_from("<4sII", data)
    assert magic == b"glTF" and version == 2 and length == len(data), path
    offset, gltf, binary_size = 12, None, None
    while offset < length:
        size, kind = struct.unpack_from("<II", data, offset)
        offset += 8
        assert offset + size <= length and size % 4 == 0, path
        if kind == 0x4E4F534A:
            gltf = json.loads(data[offset:offset + size])
        elif kind == 0x004E4942:
            binary_size = size
        offset += size
    assert gltf is not None and offset == length, path
    return gltf, binary_size


def inspect(asset):
    source = ROOT / asset["source_path"]
    gltf, binary_size = document(source)
    assert gltf["asset"]["version"] == "2.0", source
    files = {source}
    for resource in gltf.get("buffers", []) + gltf.get("images", []):
        uri = resource.get("uri")
        if uri and not uri.startswith("data:"):
            path = (source.parent / unquote(uri)).resolve()
            assert path.is_relative_to(LIBRARY.resolve()) and path.is_file(), (source, uri)
            files.add(path)
            if "byteLength" in resource:
                assert path.stat().st_size >= resource["byteLength"], path
        elif not uri and "byteLength" in resource:
            assert binary_size is not None and binary_size >= resource["byteLength"], source
    accessors = gltf.get("accessors", [])
    triangles, primitives = [], 0
    for mesh in gltf.get("meshes", []):
        count = 0
        for primitive in mesh["primitives"]:
            primitives += 1
            assert primitive.get("mode", 4) == 4, "Only triangle-list assets supported"
            accessor = primitive.get("indices", primitive["attributes"]["POSITION"])
            elements = accessors[accessor]["count"]
            assert elements % 3 == 0, source
            count += elements // 3
        triangles.append(count)
    nodes = gltf.get("nodes", [])

    def visit(index, ancestors):
        assert index not in ancestors, "Cyclic scene graph"
        node = nodes[index]
        result = triangles[node["mesh"]] if "mesh" in node else 0
        return result + sum(visit(i, ancestors | {index}) for i in node.get("children", []))

    scene = gltf.get("scenes", [{}])[gltf.get("scene", 0)]
    instance_triangles = sum(visit(i, set()) for i in scene.get("nodes", []))
    size = sum(p.stat().st_size for p in files)
    return {"id": asset["id"], "source_path": asset["source_path"],
            "source_payload_bytes_with_dependencies": size,
            "mesh_triangles": sum(triangles), "default_scene_triangles": instance_triangles,
            "mesh_primitives": primitives, "materials": len(gltf.get("materials", [])),
            "images": len(gltf.get("images", [])),
            "skins": len(gltf.get("skins", [])),
            "joint_counts": [len(s["joints"]) for s in gltf.get("skins", [])],
            "animation_clips": [a.get("name", "unnamed") for a in gltf.get("animations", [])],
            "required_extensions": gltf.get("extensionsRequired", []),
            "exceeds_5MB_source_payload": size > 5_000_000,
            "files": [{"path": str(p.relative_to(ROOT)), "bytes": p.stat().st_size,
                       "sha256": hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--record", action="store_true")
    args = parser.parse_args()
    catalog = json.loads((LIBRARY / "catalog.json").read_text())
    ids = [a["id"] for a in catalog["assets"]]
    assert len(ids) == len(set(ids)), "Duplicate asset IDs"
    measurements = [inspect(a) for a in catalog["assets"]]
    prepared_manifest = LIBRARY / "prepared-manifest.json"
    if prepared_manifest.exists():
        for item in json.loads(prepared_manifest.read_text()):
            sample = inspect({"id": item["id"] + ":prepared", "source_path": item["prepared_path"]})
            assert len(sample["files"]) == 1, "Prepared GLB must embed its dependencies"
            measurements.append(sample)
    target = LIBRARY / "metrics.json"
    if args.record:
        target.write_text(json.dumps(measurements, indent=2) + "\n")
    else:
        assert json.loads(target.read_text()) == measurements, "Integrity/inventory changed; inspect before recording a new baseline"
    unique_files = {f["path"]: f for item in measurements for f in item["files"]}
    print(json.dumps({"source_assets_checked": len(catalog["assets"]),
                      "prepared_assets_checked": len(measurements) - len(catalog["assets"]),
                      "unique_files": len(unique_files),
                      "unique_source_bytes": sum(f["bytes"] for f in unique_files.values()),
                      "over_5MB_source_payload": sum(a["exceeds_5MB_source_payload"] for a in measurements),
                      "status": "passed"}, indent=2))


if __name__ == "__main__":
    main()
