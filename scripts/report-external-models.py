"""Generate the acquisition inventory and preview contact sheet (requires Pillow)."""
import json
from pathlib import Path
from urllib.parse import quote
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "assets/external"
catalog = json.loads((LIBRARY / "catalog.json").read_text())
metrics = {a["id"]: a for a in json.loads((LIBRARY / "metrics.json").read_text())}
samples = json.loads((LIBRARY / "prepared-manifest.json").read_text())

lines = ["# Selected external model inventory", "", "Acquired 2026-09-10. All items are CC0; creator and rights records are in [catalog.json](catalog.json). Sizes include each source's dependencies; shared files repeat across rows but are stored once. Triangles are counts in the default glTF scene. These are acquisition measurements. See USAGE-GUIDE.md and runtime-catalog.json for current published derivatives and integration status.", "", "## Prepared GLB examples", "", "Each file is self-contained. See [preparation notes](prepared-manifest.json) and [visual QA](MODEL-QA.md).", "", "| Model | Triangles | GLB MB |", "| --- | ---: | ---: |"]
for sample in samples:
    m = metrics[sample["id"] + ":prepared"]
    path = str(Path(sample["prepared_path"]).relative_to("assets/external"))
    lines.append(f"| [{sample['label']}]({quote(path)}) | {m['default_scene_triangles']:,} | {m['source_payload_bytes_with_dependencies']/1e6:.2f} |")
lines += ["", "## Original selected assets", "", "| Model | Source file | Triangles | Payload MB | Worlds |", "| --- | --- | ---: | ---: | --- |"]
for asset in catalog["assets"]:
    m = metrics[asset["id"]]
    path = str(Path(asset["source_path"]).relative_to("assets/external"))
    lines.append(f"| {asset['title']} | [Open]({quote(path)}) | {m['default_scene_triangles']:,} | {m['source_payload_bytes_with_dependencies']/1e6:.2f} | {', '.join(asset['worlds'])} |")
(LIBRARY / "INVENTORY.md").write_text("\n".join(lines) + "\n")

font_candidates = [Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
                   Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")]
font_path = next((str(p) for p in font_candidates if p.exists()), None)
def font(size):
    return ImageFont.truetype(font_path, size) if font_path else ImageFont.load_default(size=size)

sheet = Image.new("RGB", (1600, 1590), "#111c2b")
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), "COUNTERFACTUAL WORLDS | OPEN MODEL LIBRARY", font=font(36), fill="#f2e8d8")
draw.text((28, 72), "12 prepared CC0 samples · source assets preserved · acquisition samples · independent tile scales", font=font(19), fill="#a4bed3")
for i, sample in enumerate(samples):
    x, y = 16 + (i % 4) * 396, 120 + (i // 4) * 480
    with Image.open(ROOT / sample["preview_path"]) as image:
        sheet.paste(image.convert("RGB").resize((380, 380)), (x, y))
    draw.text((x+8, y+389), sample["label"], font=font(23), fill="#f2e8d8")
    m = metrics[sample["id"] + ":prepared"]
    label = f"{m['default_scene_triangles']:,} tris · {m['source_payload_bytes_with_dependencies']/1e6:.2f} MB"
    draw.text((x+8, y+422), label, font=font(19), fill="#a4bed3")
sheet.save(LIBRARY / "previews/contact-sheet.jpg", quality=90)
print("Wrote INVENTORY.md and previews/contact-sheet.jpg")
