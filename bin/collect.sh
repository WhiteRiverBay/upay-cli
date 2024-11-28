#!/bin/bash

chain_type=$1
wallet_file=$2
admin_private_key_file=$3

# check the input parameters
if [ $# -lt 3 ]; then
    echo "Usage: $0 <chain_type> <wallet_file> <admin_private_key_file>"
    exit 1
fi

prepared_file=$(sh .prepare.sh $chain_type $wallet_file)
sh .collect_usdt.sh bsc $prepared_file $admin_private_key_file 