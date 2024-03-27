#!/bin/bash

cd paladins-stats-db
./reinstall-paladins-api-wrapper.sh
cd ..

cd paladins-stats-ui
./reinstall-paladins-packages.sh
cd ..
