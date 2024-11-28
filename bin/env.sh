#!/bin/bash

DATA_DIR=data
# if DATA_DIR is not exist, create it
if [ ! -d $DATA_DIR ]; then
    mkdir $DATA_DIR
fi
UPAY=upay
ts=$(date +%Y-%m-%d-%H)
