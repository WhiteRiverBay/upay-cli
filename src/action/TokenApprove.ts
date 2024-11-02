import { TronWeb } from 'tronweb';
import { ethers } from 'ethers';
import { decimals, getProvider } from '../util/web3util';
import { TRON_API_KEY } from '../util/const';
import prompt from 'prompt-sync';
import { FunctionFragment } from 'tronweb/lib/esm/types';

// [TESTED]
export const TokenApprove = async (options: any) => {
    const { privateKey, contract, spender, amount, type, rpc, gasPrice, gasLimit, estimate, yes } = options;

    if (!privateKey) {
        console.log('Private Key is required');
        return;
    }

    if (!yes && !estimate) {
        console.log(`Approve ${amount} to ${spender} `);
        console.log('Are you sure to do the approve ?');
        const yes = prompt()('Continue? [y/N] ');
        if (yes !== 'y') {
            return;
        }
    }

    switch (type.toLowerCase()) {
        case 'evm':
            const _amountEVM = amount === 'max' ? ethers.MaxUint256 : amount;
            await approveERC20(privateKey, contract, spender, _amountEVM, rpc, gasPrice, gasLimit, estimate);
            break;
        case 'tron':
            const _amountTron = amount === 'max' ? '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' : amount;
            if (!_amountTron) {
                console.log('Invalid amount');
                return;
            }
            await approveTRC20(privateKey, contract, spender, _amountTron, rpc, estimate);
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
    amount: bigint,
    rpc: string,
    gasPrice: string,
    gasLimit: string,
    estimate: boolean,
) => {
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const _gasPrice = gasPrice ? ethers.parseUnits(gasPrice, 'gwei') : (await provider.getFeeData()).gasPrice;

    const contractInstance = new ethers.Contract(contract, ['function approve(address,uint256)'], wallet);

    if (estimate) {
        const estimateGas = await contractInstance.approve.estimateGas(spender, amount);
        console.log(`Estimated Gas: ${estimateGas}`);
        // gas price
        if (_gasPrice !== null) {
            console.log(`Gas Price: ${ethers.formatUnits(_gasPrice, 'gwei')} gwei`);
            // total cost
            console.log(`Total Cost: ${ethers.formatUnits(_gasPrice * estimateGas, 'ether')} ETH`);
        } else {
            console.log('Gas Price is null');
        }

    } else {
        // const estimateGas = await contractInstance.approve.estimateGas(spender, amount);
        const _gasLimit = gasLimit ? gasLimit : await contractInstance.approve.estimateGas(spender, amount);
        const nonce = await provider.getTransactionCount(
            wallet.address,
            'latest',
        );
        const tx = await contractInstance.approve(spender, amount, {
            gasPrice: _gasPrice,
            gasLimit: _gasLimit,
            nonce,
        });
        console.log(`Tx Hash: ${tx.hash}`);
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

    const trc20abi: FunctionFragment[] = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const contractInstance = await tronWeb.contract(trc20abi).at(contract);
    const tx = await contractInstance.approve(spender, amount).send();
    console.log(`Tx Hash: ${tx}`);
}