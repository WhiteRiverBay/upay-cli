import { TronWeb } from 'tronweb';
import { ethers } from 'ethers';
import { getProvider } from '../util/web3util';
import { TRON_API_KEY } from '../util/const';
import prompt from 'prompt-sync';

export const TokenApprove = async (options: any) => {
    const { privateKey, contract, spender, amount, type, rpc, gasPrice, gasLimit, estimate, yes } = options;

    if (!privateKey) {
        console.log('Private Key is required');
        return;
    }

    if (!yes) {
        console.log(`Approve ${amount} to ${spender} `);
        console.log('Are you sure to do the approve ?');
        const yes = prompt()('Continue? [y/N] ');
        if (yes !== 'y') {
            return;
        }
    }

    switch (type.toLowerCase()) {
        case 'evm':
            await approveERC20(privateKey, contract, spender, amount, rpc, gasPrice, gasLimit, estimate);
            break;
        case 'tron':
            await approveTRC20(privateKey, contract, spender, amount, rpc, estimate);
            break;
        default:
            console.log('Unsupported type');
            break;
    }
}

const approveERC20 = async (
    privateKey: string,
    contract: string,
    spender: string,
    amount: string,
    rpc: string,
    gasPrice: string,
    gasLimit: string,
    estimate: boolean,
) => {
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractInstance = new ethers.Contract(contract, ['function approve(address,uint256)'], wallet);
    const tx = await contractInstance.approve(spender, amount, {
        gasPrice: ethers.parseUnits(gasPrice, 'gwei'),
        gasLimit: ethers.hexlify(gasLimit),
    });

    if (estimate) {
        const estimateGas = await wallet.estimateGas(tx);
        console.log(`Estimated Gas: ${estimateGas}`);
    } else {
        const receipt = await wallet.sendTransaction(tx);
        console.log(`Tx Hash: ${receipt.hash}`);
    }
}

const approveTRC20 = async (
    privateKey: string,
    contract: string,
    spender: string,
    amount: string,
    rpc: string,
    estimate: boolean,
) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
    });

    tronWeb.setPrivateKey(privateKey);

    const contractInstance = await tronWeb.contract().at(contract);
    const tx = await contractInstance.approve(spender, amount).send({
        feeLimit: 100000000,
        callValue: 0,
        shouldPollResponse: true,
    });

    if (estimate) {
        console.log(`Estimated Gas: ${tx.result.gasUsed}`);
    } else {
        console.log(`Tx Hash: ${tx.txid}`);
    }
}