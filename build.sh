#!/usr/bin/env bash

set -e
set -u
set -x

npm install -g yarn

cd source
rm -rf package-lock.json
yarn install
yarn build

cd .webpack
zip -r archive.zip .
open .
