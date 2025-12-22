#!/bin/bash

# Generate PNG icons from SVG
# Requires ImageMagick or rsvg-convert

if command -v convert &> /dev/null; then
    echo "Using ImageMagick to convert icons..."
    convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
    convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
    convert -background none icons/icon.svg -resize 128x128 icons/icon128.png
    echo "Icons generated successfully!"
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert to convert icons..."
    rsvg-convert -w 16 -h 16 icons/icon.svg -o icons/icon16.png
    rsvg-convert -w 48 -h 48 icons/icon.svg -o icons/icon48.png
    rsvg-convert -w 128 -h 128 icons/icon.svg -o icons/icon128.png
    echo "Icons generated successfully!"
else
    echo "Error: Neither ImageMagick (convert) nor rsvg-convert found."
    echo "Please install one of them:"
    echo "  - Ubuntu/Debian: sudo apt install imagemagick or sudo apt install librsvg2-bin"
    echo "  - Fedora: sudo dnf install ImageMagick or sudo dnf install librsvg2-tools"
    echo "  - macOS: brew install imagemagick or brew install librsvg"
    exit 1
fi
