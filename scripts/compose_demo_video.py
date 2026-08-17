#!/usr/bin/env python3
"""
Benchless Demo Video Compositor
Overlays speaker mobile video (cropped PIP in corner) onto timed 1080p background screenshots.
"""

import os
import sys
import subprocess
import argparse

# Shot list and timestamps (in seconds) based on benchless-demo-facecam.mp4
TIMED_SHOTS = [
    {"start": 0.0,   "end": 21.26, "image": "shot01_landing_headline.png",           "label": "Landing page & origin story"},
    {"start": 21.26, "end": 32.10, "image": "shot02a_venue_ieee_indexed.png",        "label": "IEEE EDL -> INDEXED"},
    {"start": 32.10, "end": 36.74, "image": "shot02b_venue_waset_flagged.png",       "label": "WASET -> FLAGGED"},
    {"start": 36.74, "end": 42.42, "image": "shot02c_venue_unknown_refusal.png",     "label": "ICETET -> UNKNOWN refusal"},
    {"start": 42.42, "end": 50.10, "image": "shot03_scoping_form_filled.png",        "label": "Scoping intake form filled"},
    {"start": 50.10, "end": 62.76, "image": "shot04_scoped_proposals_gemini.png",    "label": "Gemini 3.6 Flash proposals"},
    {"start": 62.76, "end": 73.88, "image": "shot05_timeline_table_arithmetic.png",  "label": "Timeline arithmetic table"},
    {"start": 73.88, "end": 87.40, "image": "shot06_firestore_decision_logs_row.png", "label": "Firestore decision_logs row"},
    {"start": 87.40, "end": 92.64, "image": "shot07a_kit_polar_checkout.png",       "label": "Kit Polar checkout"},
    {"start": 92.64, "end": 99.24, "image": "shot07b_governance_revenue_table.png", "label": "Governance $0 revenue table"},
    {"start": 99.24, "end": 111.96,"image": "shot08_governance_falsification.png",   "label": "Governance falsification threshold"},
]

def compose_video(input_video, output_video, pip_position="bottom-right", pip_width=440):
    screens_dir = os.path.join(os.path.dirname(__file__), "..", "submission", "video_screens")
    screens_dir = os.path.abspath(screens_dir)
    
    if not os.path.exists(input_video):
        print(f"Error: input video '{input_video}' not found.")
        sys.exit(1)

    print(f"[*] Input video: {input_video}")
    print(f"[*] Output video: {output_video}")
    print(f"[*] PIP Position: {pip_position}, PIP Width: {pip_width}px")

    # Get input video duration using ffprobe
    probe_cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", input_video
    ]
    try:
        dur_str = subprocess.check_output(probe_cmd).decode().strip()
        total_duration = float(dur_str)
        print(f"[*] Total input video duration: {total_duration:.2f}s")
    except Exception as e:
        total_duration = 160.0
        print(f"[!] Could not probe duration ({e}), defaulting to {total_duration}s")

    # Create background concat file
    concat_file = os.path.join(screens_dir, "concat_slides.txt")
    with open(concat_file, "w", encoding="utf-8") as f:
        for shot in TIMED_SHOTS:
            img_path = os.path.join(screens_dir, shot["image"]).replace("\\", "/")
            duration = shot["end"] - shot["start"]
            f.write(f"file '{img_path}'\n")
            f.write(f"duration {duration}\n")
        # Final image repeat for trailing frame in ffmpeg concat demuxer
        last_img = os.path.join(screens_dir, TIMED_SHOTS[-1]["image"]).replace("\\", "/")
        f.write(f"file '{last_img}'\n")

    # Determine PIP coordinates on 1920x1080 canvas
    # With margin 32px
    if pip_position == "bottom-right":
        pip_x = f"W-w-32"
        pip_y = f"H-h-32"
    elif pip_position == "bottom-left":
        pip_x = "32"
        pip_y = f"H-h-32"
    elif pip_position == "top-right":
        pip_x = f"W-w-32"
        pip_y = "32"
    else:
        pip_x = f"W-w-32"
        pip_y = f"H-h-32"

    # FFmpeg complex filter:
    # 1. Background slides scaled to 1920x1080
    # 2. Camera video scaled and cropped into nice 16:9 or square window with 3px subtle border
    filter_complex = (
        f"[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=white[bg];"
        f"[1:v]scale={pip_width}:-2,drawbox=x=0:y=0:w=iw:h=ih:color=0x1a73e8@1:t=3[pip];"
        f"[bg][pip]overlay={pip_x}:{pip_y}[outv]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_file,
        "-i", input_video,
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        output_video
    ]

    print("[*] Running FFmpeg rendering command...")
    subprocess.run(cmd, check=True)
    print(f"[✓] Render complete! Video saved to: {output_video}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compose Benchless Demo Video")
    parser.add_argument("--input", "-i", required=False, default=r"F:\Projects\benchless\submission\benchless-demo-facecam.mp4", help="Path to speaker mobile video")
    parser.add_argument("--output", "-o", required=False, default=r"F:\Projects\benchless\submission\Benchless-Demo-Video.mp4", help="Output video path")
    parser.add_argument("--position", "-p", choices=["bottom-right", "bottom-left", "top-right"], default="bottom-right", help="PIP corner position")
    parser.add_argument("--width", "-w", type=int, default=440, help="PIP width in pixels")
    args = parser.parse_args()

    compose_video(args.input, args.output, args.position, args.width)
