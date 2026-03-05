#!/bin/bash
USER="Spectra010s"
REPO="term-invader"

OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH_TYPE=$(uname -m)

if [[ "$OS_TYPE" == "linux" ]]; then
    if [[ "$ARCH_TYPE" == "aarch64" || "$ARCH_TYPE" == "arm64" ]]; then
        TARGET="linux-arm64"
    else
        TARGET="linux-x64"
    fi
elif [[ "$OS_TYPE" == "darwin" ]]; then
    [[ "$ARCH_TYPE" == "arm64" ]] && TARGET="macos-silicon" || TARGET="macos-intel"
else
    exit 1
fi

API_URL="https://api.github.com/repos/$USER/$REPO/releases/latest"
DOWNLOAD_URL=$(curl -s $API_URL | grep "browser_download_url" | grep "$TARGET" | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    exit 1
fi

curl -L "$DOWNLOAD_URL" -o term-invader
chmod +x term-invader

INSTALL_DIR="/usr/local/bin"
echo "To finish the installation, please enter your computer password when prompted:"
sudo mv term-invader "$INSTALL_DIR/"

echo "Done! Type 'term-invader' to run."
