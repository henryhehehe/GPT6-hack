#!/usr/bin/env python3
"""Render a 60-second narrated draft from genuine, unaltered app captures."""
import argparse
import json
import shutil
import subprocess
import wave
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs/demo'
OUT = ROOT / 'output/demo'


def run(args):
    subprocess.run([str(a) for a in args], check=True, stdout=subprocess.DEVNULL, timeout=90)


def stamp(seconds):
    ms = round(seconds * 1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'


def wrap(draw, text, font, width):
    lines, line = [], ''
    for word in text.split():
        candidate = (line + ' ' + word).strip()
        if draw.textlength(candidate, font=font) > width and line:
            lines.append(line)
            line = word
        else:
            line = candidate
    return lines + [line]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg'))
    parser.add_argument('--voice', default='Samantha')
    args = parser.parse_args()
    if not args.ffmpeg:
        parser.error('Provide --ffmpeg /path/to/ffmpeg')
    timeline = json.loads((DOCS / 'timeline.json').read_text())
    assert timeline[0]['start'] == 0 and timeline[-1]['end'] == 60
    for a, b in zip(timeline, timeline[1:]):
        assert a['end'] == b['start']
    for shot in timeline:
        for key in ('image', 'alternate'):
            if shot.get(key):
                assert (OUT / 'captures' / shot[key]).is_file(), shot[key]
    for folder in ('audio', 'frames', 'segments'):
        (OUT / folder).mkdir(parents=True, exist_ok=True)
    font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
    title_font = ImageFont.truetype(font_path, 29)
    note_font = ImageFont.truetype(font_path, 22)
    caption_font = ImageFont.truetype(font_path, 39)
    (DOCS / 'voiceover.txt').write_text('\n\n'.join(s['text'] for s in timeline) + '\n')
    metrics, captions, audio_files, video_files = [], [], [], []
    ff = [args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y']
    for index, shot in enumerate(timeline):
        duration = shot['end'] - shot['start']
        speech_text = OUT / 'audio' / f'{index:02}.txt'
        speech_text.write_text(shot['text'])
        aiff = OUT / 'audio' / f'{index:02}.aiff'
        raw_wav = OUT / 'audio' / f'{index:02}-raw.wav'
        wav = OUT / 'audio' / f'{index:02}.wav'
        rate = 150
        for attempt in range(4):
            run(['say', '-v', args.voice, '-r', rate, '-f', speech_text, '-o', aiff])
            run(ff + ['-i', aiff, '-ac', '1', '-ar', '48000', raw_wav])
            with wave.open(str(raw_wav)) as audio:
                speech_duration = audio.getnframes() / audio.getframerate()
            if speech_duration < 0.5:
                raise RuntimeError('macOS speech returned empty audio; check speech-service access before retrying')
            if speech_duration <= duration - 0.25:
                break
            rate = int(rate * speech_duration / (duration - 0.35)) + 2
        if speech_duration > duration - 0.15:
            raise RuntimeError(f'Shot {index}: narration exceeds slot; shorten the text')
        run(ff + ['-i', raw_wav, '-af', 'adelay=100,apad', '-t', str(duration),
                  '-ac', '1', '-ar', '48000', wav])
        audio_files.append(wav)
        metrics.append({'shot': index + 1, 'slot_seconds': duration,
                        'speech_seconds': round(speech_duration, 3), 'words_per_minute_setting': rate})
        # Divide narration into readable caption cards. Each stays outside the app image.
        words = shot['text'].split()
        midpoint = (len(words) + 1) // 2
        parts = [' '.join(words[:midpoint]), ' '.join(words[midpoint:])]
        for part_index, caption in enumerate(parts):
            start = shot['start'] + part_index * duration / 2
            end = start + duration / 2
            captions.append(f'{len(captions)+1}\n{stamp(start)} --> {stamp(end)}\n{caption}\n')
            source = shot.get('alternate', shot['image']) if part_index else shot['image']
            frame = Image.new('RGB', (1920, 1080), '#0b151d')
            draw = ImageDraw.Draw(frame)
            draw.text((44, 18), shot['label'], font=title_font, fill='#b1eadb')
            disclosure = 'SCREENSHOT WALKTHROUGH DRAFT · SYNTHETIC NARRATION'
            draw.text((1876, 26), disclosure, font=note_font, fill='#99a9b2', anchor='ra')
            app = Image.open(OUT / 'captures' / source).convert('RGB')
            # Preserve the complete screenshot and its aspect ratio.
            app.thumbnail((1600, 900), Image.Resampling.LANCZOS)
            # Upscale the native 1280x720 source to fit the presentation frame.
            scale = min(1600 / app.width, 900 / app.height)
            app = app.resize((round(app.width*scale), round(app.height*scale)), Image.Resampling.LANCZOS)
            frame.paste(app, ((1920-app.width)//2, 65+(900-app.height)//2))
            lines = wrap(draw, caption, caption_font, 1730)
            assert len(lines) <= 2, caption
            for j, line in enumerate(lines):
                draw.text((960, 976 + j * 44), line, font=caption_font, fill='#ffffff', anchor='mt')
            frame_path = OUT / 'frames' / f'{index:02}-{part_index}.png'
            frame.save(frame_path)
            segment = OUT / 'segments' / f'{index:02}-{part_index}.mp4'
            run(ff + ['-loop', '1', '-i', frame_path, '-t', str(duration/2), '-r', '30',
                      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', segment])
            video_files.append(segment)
    (DOCS / 'captions.srt').write_text('\n'.join(captions))
    # Paths are generated under a fixed workspace folder and quoted for FFmpeg's concat format.
    def manifest(name, paths):
        path = OUT / name
        path.write_text(''.join("file '" + str(p).replace("'", "'\\''") + "'\n" for p in paths))
        return path
    audio_manifest = manifest('audio-concat.txt', audio_files)
    video_manifest = manifest('video-concat.txt', video_files)
    voiceover = OUT / 'voiceover.wav'
    run(ff + ['-f', 'concat', '-safe', '0', '-i', audio_manifest, '-c:a', 'pcm_s16le', voiceover])
    final = OUT / 'counterfactual-worlds-60s-draft.mp4'
    run(ff + ['-f', 'concat', '-safe', '0', '-i', video_manifest, '-i', voiceover,
              '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
              '-t', '60', '-movflags', '+faststart', final])
    (OUT / 'render-metrics.json').write_text(json.dumps(metrics, indent=2) + '\n')
    print(final)
    print(json.dumps(metrics, indent=2))


if __name__ == '__main__':
    main()
