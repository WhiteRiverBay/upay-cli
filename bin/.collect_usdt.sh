#!/bin/bash

source ./env.sh

# after the airdrop, collect the gas back to the airdrop address
CHAIN_NAME=$1
PREPARED_FILE=$2 # from prepare.sh
PRICATE_KEY_PEM_FILE=$3

CHAIN_TYPE=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.type)

RPC=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.provider)
USDT_CONTRACT=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.usdt.address)
USDT_DECIMALS=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.usdt.decimals)
COLLECT_THRESHOLD=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.usdt.collectThreshold)
TO=$(cat .upay.json | jq -r .chains.$CHAIN_NAME.to)

echo "Collect chain type: $CHAIN_TYPE"
echo "Collect threshold: $COLLECT_THRESHOLD"
echo "Collect to: $TO"

function process_line {
    # line = address,encryptedPrivateKey,encryptedAesKey,ethbalance,usdtbalance
    line=$1
    address=$(echo $line | awk -F',' '{print $1}')

    encryptedPrivateKey=$(echo $line | awk -F',' '{print $2}')
    encryptedAesKey=$(echo $line | awk -F',' '{print $3}')

    # get usdt balance again
    usdt_balance=$($UPAY balance --address $address --rpc $RPC --type $CHAIN_TYPE --contract $USDT_CONTRACT --format false | awk '{print $1}')

    # if usdt balance < $COLLECT_THRESHOLD, return
    if [ $usdt_balance -lt $COLLECT_THRESHOLD ]; then
        return
    fi

    # decrypt the private key
    # echo "$UPAY decrypt --encrypted-private-key $encryptedPrivateKey --encrypted-aes-key $encryptedAesKey --private-key-file $PRICATE_KEY_PEM_FILE"
    privateKey=$($UPAY decrypt --encrypted-private-key $encryptedPrivateKey --encrypted-aes-key $encryptedAesKey --private-key-file $PRICATE_KEY_PEM_FILE)

    # decimal balance
    usdt_balance_in_decimal=$(echo "scale=2; $usdt_balance / 10^$USDT_DECIMALS" | bc)
    echo "Collecting $usdt_balance_in_decimal USDT from $address..."
    # collect the gas back to the airdrop address
    $UPAY transfer --rpc $RPC \
        --type $CHAIN_TYPE \
        --to $TO \
        --contract $USDT_CONTRACT \
        --amount $usdt_balance_in_decimal \
        --privateKey $privateKey \
        --decimals $USDT_DECIMALS \
        --yes
}

cat $PREPARED_FILE | while read line; do
    process_line $line
done