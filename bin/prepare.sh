#!/bin/bash

# ./prepare.sh <wallet_file> <chain_name>
source ./env.sh

CHAIN_NAME=$1
WALLET_FILE=$2


RPC=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.provider)
TYPE=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.type)
USDT=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.usdt.address)
USDT_DECIMALS=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.usdt.decimals)

cat $WALLET_FILE | while read line; do
    address=$(echo $line | awk -F',' '{print $1}')
    # get usdt balance and eth balance of the address, output as $addres,$eth_balance,$usdt_balance,$encrypted_private_key,$encrypted_aes_key
    eth_balance=$($UPAY balance --address $address --rpc $RPC --type $TYPE --format false | awk '{print $1}')
    usdt_balance=$($UPAY balance --address $address --rpc $RPC --type $TYPE --contract $USDT --format false | awk '{print $1}')
    encrypted_private_key=$(echo $line | awk -F',' '{print $2}')
    encrypted_aes_key=$(echo $line | awk -F',' '{print $3}')

    # if usdt_balance >= 1 * 10^USDT_DECIMALS
    if [ $usdt_balance -ge $(echo "1 * 10^$USDT_DECIMALS" | bc) ]; then
        echo "$address,$encrypted_private_key,$encrypted_aes_key,$eth_balance,$usdt_balance"
    fi
done