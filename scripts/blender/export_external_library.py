"""Publish the acquired library as local GLBs; retain every original source.

blender --background --factory-startup --python scripts/blender/export_external_library.py
Static props receive a measured meter scale and ground origin. Rigged references
retain their canonical transforms. They are catalog-only until adapted.
"""
import hashlib
import json
from pathlib import Path
import shutil
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
LIB = ROOT / 'assets/external'
OUT = ROOT / 'public/models/external'


def render_meshes():
    return [o for o in bpy.context.scene.objects if o.type == 'MESH' and not o.hide_render
            and any(not c.hide_render for c in o.users_collection)]


def bounds(meshes):
    bpy.context.view_layer.update()
    graph = bpy.context.evaluated_depsgraph_get()
    points = []
    for obj in meshes:
        evaluated = obj.evaluated_get(graph)
        mesh = evaluated.to_mesh()
        points.extend(evaluated.matrix_world @ v.co for v in mesh.vertices)
        evaluated.to_mesh_clear()
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    return low, high


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    catalog = json.loads((LIB / 'catalog.json').read_text())
    collections = {c['id']: c for c in catalog['collections']}
    metrics = {m['id']: m for m in json.loads((LIB / 'metrics.json').read_text())}
    published = []
    for a in catalog['assets']:
        destination = OUT / (a['id'] + '.glb')
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=str(ROOT / a['source_path']))
        meshes = render_meshes()
        low, high = bounds(meshes)
        factor = 1.0
        modifications = list(a.get('modifications', []))
        if a['usage']['target_longest_dimension_m']:
            factor = a['usage']['target_longest_dimension_m'] / max(high - low)
            visual = bpy.data.objects.new('Visual', None)
            bpy.context.collection.objects.link(visual)
            for obj in list(bpy.context.scene.objects):
                if obj != visual and obj.parent is None:
                    obj.parent = visual
            visual.scale = (factor,) * 3
            visual.location = (-(low.x+high.x)*factor/2, -(low.y+high.y)*factor/2, -low.z*factor)
            root = bpy.data.objects.new('Root', None)
            bpy.context.collection.objects.link(root)
            visual.parent = root
            height = (high.z-low.z)*factor
            for name, z in [('Anchor_Inspect', max(.12, height*.65)), ('Anchor_Label', height+.2)]:
                anchor = bpy.data.objects.new(name, None)
                bpy.context.collection.objects.link(anchor)
                anchor.parent = root
                anchor.location.z = z
            modifications.append('Uniform meter scaling; X/Z centered and ground origin; inspection/label anchors added')
        targets = {'polyhaven-coast_rocks_01': 12000, 'polyhaven-wicker_basket_02': 3000}
        if a['id'] in targets:
            total = sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes)
            for obj in meshes:
                if total > targets[a['id']]:
                    modifier = obj.modifiers.new('Web geometry reduction', 'DECIMATE')
                    modifier.ratio = targets[a['id']] / total
                    bpy.context.view_layer.objects.active = obj
                    bpy.ops.object.modifier_apply(modifier=modifier.name)
            modifications.append('Decimated toward '+str(targets[a['id']])+' triangles')
        resolution = 1024 if a['usage']['category'] in ['character-base', 'rock'] else 512
        for image in bpy.data.images:
            w, h = image.size
            if w and h and max(w,h) > resolution:
                scale = resolution/max(w,h)
                image.scale(round(w*scale), round(h*scale))
        if a['usage']['category'] == 'animation-source':
            # Preserve the exact motion source, including root motion and clip names.
            shutil.copyfile(ROOT / a['source_path'], destination)
            modifications.append('Exact source GLB copied; animation remains catalog-only')
        else:
            bpy.ops.export_scene.gltf(filepath=str(destination), export_format='GLB',
                export_image_format='JPEG', export_jpeg_quality=82,
                export_cameras=False, export_lights=False, export_extras=True)
            modifications.append(f'Textures at most {resolution}px; opaque JPEG quality 82, alpha PNG; embedded')
        low, high = bounds(render_meshes())
        dimensions = [high.x-low.x, high.z-low.z, high.y-low.y]
        size = destination.stat().st_size
        source = collections[a['collection']]
        published.append({
            'id': a['id'], 'title': a['title'], 'collection': a['collection'],
            'creator': ', '.join(source['creators']), 'sourceUrl': source['source_url'],
            'license': 'CC0-1.0', 'licenseUrl': source['license']['url'],
            'url': '/models/external/'+destination.name,
            'bytes': size, 'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
            'dimensions': [round(v,5) for v in dimensions],
            'triangles': sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in render_meshes()),
            'sourcePath': a['source_path'], 'sourcePayloadBytes': metrics[a['id']]['source_payload_bytes_with_dependencies'],
            'category': a['usage']['category'], 'classroomStatus': a['usage']['classroom_status'],
            'worlds': a['worlds'], 'use': a['intended_use'], 'usage': a['usage'],
            'modifications': modifications,
            'anchors': ['Anchor_Inspect','Anchor_Label'] if a['usage']['target_longest_dimension_m'] else [],
            'clips': metrics[a['id']]['animation_clips'],
            'previewUrl': '/models/external/previews/'+a['id']+'.jpg' if a.get('preview_path') else None,
        })
        (LIB/'runtime-catalog.json').write_text(json.dumps(published,indent=2)+'\n')
        print('EXPORTED',a['id'],size,flush=True)
    # Public metadata is intentional: the catalog is an asset-development reference.
    (OUT/'catalog.json').write_text(json.dumps(published,indent=2)+'\n')
    (OUT/'CREDITS.txt').write_text('Counterfactual Worlds — external scene art\nIllustrative assets; not primary evidence.\n\n'+ '\n\n'.join(
        f"{c['title']} — {', '.join(c['creators'])}\n{c['source_url']}\nCC0 1.0 Universal: {c['license']['url']}" for c in catalog['collections'])+'\n')
    print('EXPORTED ALL',len(published),flush=True)


if __name__ == '__main__':
    main()
