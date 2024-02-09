#!/bin/bash

export GIT_HASH=$(git rev-parse HEAD)
sed -i "s/GIT_HASH/${GIT_HASH}/" ./public/build-hash.json
