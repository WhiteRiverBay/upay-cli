import { ethers } from 'ethers';
import fs from 'fs';
import { TronWeb } from 'tronweb';

export const GenerateAccount = async (options: any) => {
    const type = options.type.toLowerCase();
    // evm , tron
    if (type === 'evm') {
        await GenerateEOA(options);
    } else if (type === 'tron') {
        await GenerateTronAccount(options);
    }
}

const GenerateEOA = async (options: any) => {
    const count = options.number;
    const output = options.output;

    const accounts = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        accounts.push({
            address: wallet.address,
            privateKey: wallet.privateKey
        });
    }

    const content = accounts.map(account => `${account.address} ${account.privateKey}`).join('\n');
    if (options.output) {
        fs.writeFileSync(output, content + '\n', 'utf-8');
    } else {
        console.log(content);
    }
}

const GenerateTronAccount = async (options: any) => {
    // generate tron account and secret
    const count = options.number;
    const output = options.output;

    const accounts = [];
    for (let i = 0; i < count; i++) {
        const wallet = await TronWeb.createAccount();
        accounts.push({
            address: wallet.address.base58,
            privateKey: wallet.privateKey
        });
    }

    const content = accounts.map(account => `${account.address} ${account.privateKey}`).join('\n');
    if (options.output) {
        fs.writeFileSync(output, content + '\n', 'utf-8');
    } else {
        console.log(content);
    }
}
