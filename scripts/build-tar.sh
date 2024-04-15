#!/bin/sh

IMAGE_NAME="myrt-co"
SERVER_PLATFORM="linux/amd64"
DIST_DIR="dist"
TAR_FILENAME="myrt-co.docker.tar"

docker buildx build --load --platform "$SERVER_PLATFORM" -t "$IMAGE_NAME:latest" .
mkdir -p "$DIST_DIR"
docker save "$IMAGE_NAME:latest" > "${DIST_DIR}/${TAR_FILENAME}"
