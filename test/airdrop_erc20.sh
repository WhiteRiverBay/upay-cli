# token erc20

ts-node src/index.ts airdrop \
    --privateKey d600ff8ac07628320002ef5bfd40d978cf44a2b151fb5fe394554193df303f92 \
    --file /tmp/eoa-out.txt \
    --rpc https://bsc-testnet-rpc.publicnode.com \
    --type evm \
    --contract 0x41AC113ED7118361c1c5f7d5b955CBE7acb44849 \
    --airdropContract 0x9Ad7c32e559B5BD4B92E4af2Fe2A25eDA743eE77 \
    --estimate

ts-node src/index.ts airdrop \
    --privateKey d600ff8ac07628320002ef5bfd40d978cf44a2b151fb5fe394554193df303f92 \
    --file /tmp/eoa-out.txt \
    --rpc https://bsc-testnet-rpc.publicnode.com \
    --type evm \
    --contract 0x41AC113ED7118361c1c5f7d5b955CBE7acb44849 \
    --airdropContract 0x9Ad7c32e559B5BD4B92E4af2Fe2A25eDA743eE77 
