#!/bin/zsh
set -euo pipefail

project_root="${0:A:h:h}"
iconset_path="${project_root}/build/icon.iconset"
source_svg="${project_root}/public/causalpilot-mark.svg"
source_png="${project_root}/build/icon-1024.png"

mkdir -p "${iconset_path}"
sips -s format png "${source_svg}" --out "${source_png}" >/dev/null

sips -z 16 16 "${source_png}" --out "${iconset_path}/icon_16x16.png" >/dev/null
sips -z 32 32 "${source_png}" --out "${iconset_path}/icon_16x16@2x.png" >/dev/null
sips -z 32 32 "${source_png}" --out "${iconset_path}/icon_32x32.png" >/dev/null
sips -z 64 64 "${source_png}" --out "${iconset_path}/icon_32x32@2x.png" >/dev/null
sips -z 128 128 "${source_png}" --out "${iconset_path}/icon_128x128.png" >/dev/null
sips -z 256 256 "${source_png}" --out "${iconset_path}/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "${source_png}" --out "${iconset_path}/icon_256x256.png" >/dev/null
sips -z 512 512 "${source_png}" --out "${iconset_path}/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "${source_png}" --out "${iconset_path}/icon_512x512.png" >/dev/null
sips -z 1024 1024 "${source_png}" --out "${iconset_path}/icon_512x512@2x.png" >/dev/null

iconutil -c icns "${iconset_path}" -o "${project_root}/build/icon.icns"
echo "Created ${project_root}/build/icon.icns"
