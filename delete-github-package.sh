#!/bin/bash

if [[ ! `echo ${GITHUB_TOKEN}` ]]; then
    echo "GITHUB_TOKEN is not set"
    exit 1
fi

package="$1"
curl -L \
    -X DELETE \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/user/packages/npm/${package}"
