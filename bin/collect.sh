#!/bin/bash

DATA_DIR=/tmp
USDT_THRESHOLD=1
AIRDROP_PRIVATE_KEY=0x1234567890
PEM_PRIVATE_KEY=~/.upay/.private.pem

ts=$(date +%Y-%m-%d-%H)

function dump_data {
    ts=$(date +%Y-%m-%d-%H)
    $UPAY dump -g $2 --type $1 -e $API >$DATA_DIR/$1.wallets.$ts
}

function process_item {
    address=$1
    encrypted_private_key=$2
    encrypted_aes_key=$3

    provider=$4
    usdt=$5
    usdt_decimals=$6
    airdrop=$7
    to=$8

    # if usdt starts with T then it is tron else if it starts with 0x then it is ethereum
    if [[ $usdt == T* ]]; then
        type=tron
    else
        type=evm
    fi

    # check balance of the account
    balance=$($UPAY balance --address $address --rpc $provider --type $type --contract $usdt --format false)

    # threshold = THRESHOLD * 10^usdt_decimals
    threshold=$(echo "$USDT_THRESHOLD * 10^$usdt_decimals" | bc)

    # if balance is greater than threshold,
    if [ $balance -gt $threshold ]; then
        # if it is
        # send the balance to the airdrop address
        private_key=$($UPAY decrypt -pk $encrypted_private_key -aek $encrypted_aes_key -P $PEM_PRIVATE_KEY)
        balance_in_decimals=$(echo "scale=18; $balance / 10^$usdt_decimals" | bc)
        $UPAY send --rpc $provider --type $type --contract $usdt --to $to --privateKey $private_key --amount $balance_in_decimals
    fi
}

function collect {
    provider=$1
    usdt=$2
    usdt_decimals=$3
    airdrop=$4
    to=$5

    while read line; do
        address=$(echo $line | awk '{print $1}')
        encrypted_private_key=$(echo $line | awk '{print $2}')
        encrypted_aes_key=$(echo $line | awk '{print $3}')
        process_item $address $encrypted_private_key $encrypted_aes_key $provider $usdt $usdt_decimals $airdrop $to
    done <$DATA_DIR/$1.wallets.$ts
}

function airdrop {
    chain=$2
    native_coin_balance_threshold=$3
    usdt_balance_threshold=$4
    airdrop_coin_in_decimals=$5

    provider=$(cat .upay.json | jq -r .chains.$chain.provider)
    # if provider is empty or null, error
    if [ -z "$provider" ]; then
        echo "provider is empty"
        exit 1
    fi
    usdt=$(cat .upay.json | jq -r .chains.$chain.usdt.address)
    usdt_decimals=$(cat .upay.json | jq -r .chains.$chain.usdt.decimals)
    airdrop=$(cat .upay.json | jq -r .chains.$chain.airdrop)

    line=$(cat $DATA_DIR/$chain.wallets.$ts)
    while read line; do
        address=$(echo $line | awk '{print $1}')

        usdt_balance=$($UPAY balance --address $address --rpc $provider --type $chain --contract $usdt --format false)
        usdt_threshold=$(echo "$usdt_balance_threshold * 10^$usdt_decimals" | bc)

        # if usdt_balance >= usdt_threshold
        if [ $usdt_balance -ge $usdt_threshold ]; then
            # check the native balance
            native_balance=$($UPAY balance --address $address --rpc $provider --type $chain --format false)
            # if native_balance >= native_coin_balance_threshold
            if [ $native_balance -le $native_coin_balance_threshold ]; then
                # add to the airdrop list
                echo "$address $airdrop_coin_in_decimals" >>$DATA_DIR/$chain.airdrop.$ts
            fi
        fi

    done <$DATA_DIR/$1.wallets.$ts

    # airdrop native coin to the addresses in the airdrop list for gas fees
    $UPAY airdrop --rpc $provider --type $chain --file $DATA_DIR/$chain.airdrop.$ts --privateKey $AIRDROP_PRIVATE_KEY -c $airdrop
}

function main {
    # dump data from the database
    COMMAND=$1

    if [ "$COMMAND" == "dump" ]; then
        if [ "$2" != "evm" ] && [ "$2" != "tron" ]; then
            echo "invalid type"
            exit 1
        fi
        dump_data $2 $3
        # airdrop
    elif [ "$COMMAND" == "airdrop" ]; then
        # check the native balance and usdt balance and add to the airdrop list
        airdrop $2 $3 $4 $5
    elif [ "$COMMAND" == "collect" ]; then
        chain=$2
        provider=$(cat .upay.json | jq -r .chains.$chain.provider)
        # if provider is empty or null, error
        if [ -z "$provider" ]; then
            echo "provider is empty"
            exit 1
        fi
        usdt=$(cat .upay.json | jq -r .chains.$chain.usdt.address)
        usdt_decimals=$(cat .upay.json | jq -r .chains.$chain.usdt.decimals)
        airdrop=$(cat .upay.json | jq -r .chains.$chain.airdrop)
        to=$(cat .upay.json | jq -r .chains.$chain.to)

        collect $provider $usdt $usdt_decimals $airdrop $to
    fi
}

main $@
