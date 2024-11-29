#!/bin/bash

chain_name=$1
wallet_file=$2
admin_private_key_file=$3

# check the input parameters
if [ $# -lt 3 ]; then
    echo "Usage: $0 <chain_name> <wallet_file> <admin_private_key_file>"
    exit 1
fi

echo "preparing file"
prepared_file=$(sh .prepare.sh $chain_name $wallet_file)
echo "prepared file: $prepared_file"

echo "collecting usdt"
sh .collect_usdt.sh $chain_name $prepared_file $admin_private_key_file 