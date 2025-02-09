#!/bin/bash

source ./env.sh

endpoint=$1
chainType=$2 # evm , tron
ga_code=$3
file_name=$DATA_DIR/$chainType.wallets.$ts

#check arguments
if [ $# -lt 3 ]; then
    echo "Usage: $0 <endpoint> <chainType> <ga_code>"
    exit 1
fi

$UPAY dump -g $ga_code --type $chainType -e $endpoint > $file_name
echo $file_name 