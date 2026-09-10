"""Prepare and render a representative acquisition sample; never edit originals.

blender --background --factory-startup --python scripts/blender/prepare_external_samples.py
Outputs stay under assets/external, outside the application's public directory.
"""
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
LIBRARY = ROOT / "assets/external"
SAMPLES = [
    ("quaternius-fantasy-props-vase-2", "Pottery", None),
    ("quaternius-fantasy-props-scroll-1", "Scroll", None),
    ("quaternius-fantasy-props-stall-empty", "Market stall", None),
    ("polyhaven-wicker_basket_02", "Wicker basket", 4000),
    ("quaternius-base-characters-superhero-female-fullbody", "Female rigged base", None),
    ("quaternius-base-characters-superhero-male-fullbody", "Male rigged base", None),
    ("kenney-pirate-kit-boat-row-small", "Rowboat", None),
    ("polyhaven-coast_rocks_01", "Coastal rocks", 12000),
    ("polyhaven-wooden_table_02", "Reading table", None),
    ("quaternius-fantasy-props-chair-1", "Chair", None),
    ("polyhaven-planter_pot_clay", "Garden planter", None),
    ("kenney-pirate-kit-rocks-a", "Low-poly rocks", None),
]


def main():
    catalog = json.loads((LIBRARY / "catalog.json").read_text())
    assets = {a["id"]: a for a in catalog["assets"]}
    for folder in ["prepared", "previews"]:
        (LIBRARY / folder).mkdir(exist_ok=True)
    report_path = LIBRARY / "prepared-manifest.json"
    previous = {a["id"]: a for a in json.loads(report_path.read_text())} if report_path.exists() else {}
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    report = []
    for asset_id, label, triangle_target in SAMPLES:
        if only and only not in asset_id:
            report.append(previous[asset_id])
            continue
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=str(ROOT / assets[asset_id]["source_path"]))
        objects = list(bpy.context.scene.objects)
        changes = ["Re-exported as self-contained GLB using Blender " + bpy.app.version_string,
                   "Resized textures larger than 1024 pixels to at most 1024; embedded in GLB",
                   "Exported opaque textures as JPEG quality 85; exporter preserves PNG where alpha is needed"]
        for image in bpy.data.images:
            width, height = image.size
            if width and height and max(width, height) > 1024:
                factor = 1024 / max(width, height)
                image.scale(round(width * factor), round(height * factor))
        meshes = [o for o in objects if o.type == "MESH" and not o.hide_render
                  and any(not c.hide_render for c in o.users_collection)]
        total = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
        if triangle_target and total > triangle_target:
            for obj in meshes:
                modifier = obj.modifiers.new("Acquisition preview simplification", "DECIMATE")
                modifier.ratio = triangle_target / total
                bpy.context.view_layer.objects.active = obj
                bpy.ops.object.modifier_apply(modifier=modifier.name)
            changes.append(f"Decimated geometry toward {triangle_target} triangles; inspect silhouette and UV shading before integration")
        destination = LIBRARY / "prepared" / (asset_id + ".glb")
        bpy.ops.export_scene.gltf(filepath=str(destination), export_format="GLB",
                                  export_cameras=False, export_lights=False,
                                  export_image_format="JPEG", export_jpeg_quality=85)

        # Re-import the derivative so the render also checks the saved GLB.
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=str(destination))
        objects = list(bpy.context.scene.objects)
        # Importer-generated custom bone shapes live in a non-rendering collection.
        meshes = [o for o in objects if o.type == "MESH" and not o.hide_render
                  and any(not c.hide_render for c in o.users_collection)]

        # Only the preview arrangement is centered and fitted to a uniform tile.
        # The exported GLB retains the publisher's transforms and units.
        bpy.context.view_layer.update()
        depsgraph = bpy.context.evaluated_depsgraph_get()
        points = []
        for obj in meshes:
            evaluated = obj.evaluated_get(depsgraph)
            mesh = evaluated.to_mesh()
            points.extend(evaluated.matrix_world @ vertex.co for vertex in mesh.vertices)
            evaluated.to_mesh_clear()
        low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
        high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
        dimensions = high - low
        center = (low + high) / 2
        factor = 3.0 / max(dimensions)
        root = bpy.data.objects.new("PreviewOnly", None)
        bpy.context.collection.objects.link(root)
        for obj in objects:
            if obj.parent is None:
                matrix = obj.matrix_world.copy()
                obj.parent = root
                obj.matrix_world = matrix
        root.scale = (factor,) * 3
        root.location = (-center.x * factor, -center.y * factor, -low.z * factor + .025)
        bpy.context.view_layer.update()
        scene = bpy.context.scene
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 12
        scene.cycles.use_denoising = True
        scene.render.resolution_x = 480
        scene.render.resolution_y = 480
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = "PNG"
        scene.world = bpy.data.worlds.new("Studio")
        scene.world.use_nodes = True
        scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.18, .21, .25, 1)
        scene.world.node_tree.nodes["Background"].inputs[1].default_value = .7
        bpy.ops.mesh.primitive_plane_add(size=200)
        floor = bpy.context.object
        mat = bpy.data.materials.new("Studio floor")
        mat.diffuse_color = (.16, .19, .23, 1)
        floor.data.materials.append(mat)
        target = Vector((0, 0, 1.15))
        for position, energy, size in [((-3,-4,7), 600, 5), ((4,1,5), 450, 4)]:
            bpy.ops.object.light_add(type="AREA", location=position)
            light = bpy.context.object
            light.data.energy, light.data.shape, light.data.size = energy, "DISK", size
            light.rotation_euler = (target-light.location).to_track_quat('-Z','Y').to_euler()
        bpy.ops.object.camera_add(location=(4,-7,4.1))
        camera = bpy.context.object
        camera.rotation_euler = (target-camera.location).to_track_quat('-Z','Y').to_euler()
        camera.data.type, camera.data.ortho_scale = "ORTHO", 4.4
        scene.camera = camera
        preview = LIBRARY / "previews" / (asset_id + ".png")
        scene.render.filepath = str(preview)
        bpy.ops.render.render(write_still=True)
        report.append({"id": asset_id, "label": label,
                       "source_path": assets[asset_id]["source_path"],
                       "prepared_path": str(destination.relative_to(ROOT)),
                       "preview_path": str(preview.relative_to(ROOT)),
                       "source_dimensions_blender_xyz": list(dimensions),
                       "modifications": changes,
                       "status": "prepared-awaiting-runtime-review"})
        report_path.write_text(json.dumps(report, indent=2) + "\n")
        print("PREPARED", asset_id, flush=True)
    report_path.write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
