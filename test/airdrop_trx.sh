# native coin

ts-node src/index.ts airdrop \
    --privateKey 4fa8696bcdffce80a85a39eff5292c6640e976df0f5dbbc04f6e08cfcde0593e \
    --file /tmp/tron-out.txt \
    -R https://api.shasta.trongrid.io/ \
    --type tron \
    --airdropContract TQpmhTwq7ynPjFeGubMGMtgUCaHVzZcnu7 \
    --estimate

ts-node src/index.ts airdrop \
    --privateKey 4fa8696bcdffce80a85a39eff5292c6640e976df0f5dbbc04f6e08cfcde0593e \
    --file /tmp/tron-out.txt \
    -R https://api.shasta.trongrid.io/ \
    --airdropContract TQpmhTwq7ynPjFeGubMGMtgUCaHVzZcnu7 \
    --type tron
