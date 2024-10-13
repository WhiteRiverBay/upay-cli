import { ethers } from 'ethers';
import { TronWeb } from 'tronweb';
import { getProvider } from '../util/web3util';
import { TRON_API_KEY } from '../util/const';
import prompt from 'prompt-sync';
import { FunctionFragment } from 'tronweb/lib/esm/types';

export const Transfer = async (options: any) => {
    let privateKey = options.privateKey;
    const {
        to,
        amount,
        type,
        rpc,
        contract,
        gasPrice,
        gasLimit,
        estimate,
        decimals,
        yes,
    } = options;

    if (!privateKey) {
        // prompt for private key
        console.log('Private Key is required');
        privateKey = prompt()('Enter the private key: ');
    }

    if (!yes) {
        console.log(`Transfer ${options.amount} to ${options.to} `);
        console.log('Are you sure to do the tranfer ?');
        const yes = prompt()('Continue? [y/N] ');
        if (yes !== 'y') {
            return;
        }
    }

    switch (type.toLowerCase()) {
        case 'evm':
            if (contract) {
                await transferERC20(privateKey, to, amount, contract, rpc, gasPrice, gasLimit, estimate, decimals);
            } else {
                await transferETH(privateKey, to, amount, rpc, gasPrice, gasLimit, estimate);
            }
            break;
        case 'tron':
            if (contract) {
                await transferTRC20(privateKey, to, amount, contract, rpc, estimate);
            } else {
                await transferTRX(privateKey, to, amount, rpc);
            }
            break;
        default:
            console.log('Unsupported type');
            break;
    }
}


const transferETH = async (
    privateKey: string,
    to: string,
    amount: string,
    rpc: string,
    gasPrice: string | undefined,
    gasLimit: string | undefined,
    estimate: boolean
) => {
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.balanceOf(wallet.address);
    const nonce = await provider.getTransactionCount(wallet.address);

    const _gasPrice = gasPrice ? gasPrice : await provider.getGasPrice();
    const _gasLimit = gasLimit ? gasLimit : await wallet.estimateGas({ to, value: ethers.parseEther(amount) });

    const tx = {
        to,
        value: ethers.parseEther(amount),
        gasPrice: _gasPrice,
        gasLimit: _gasLimit,
        nonce
    }
    if (estimate) {
        console.log(`Gas Price`);
        console.log(`${_gasPrice} wei`);
        console.log(`${ethers.formatUnits(_gasPrice, 9)} gwei`);
        console.log(`Gas Limit`);
        console.log(_gasLimit);
        console.log(`Estimated Total ${ethers.formatUnits(BigInt(_gasPrice) * BigInt(_gasLimit), 18)} ETH`);
        console.log(`Balance: ${ethers.formatUnits(balance, 18)} ETH`);

        if (BigInt(ethers.formatUnits(balance, 18)) < BigInt(amount) + BigInt(ethers.formatUnits(BigInt(_gasPrice) * BigInt(_gasLimit), 18))) {
            console.log(`Insufficient Balance to transfer ${amount} ETH`);
        }
    } else {
        const response = await wallet.sendTransaction(tx);
        console.log(`Transaction Hash: ${response.hash}`);
    }
}

const transferERC20 = async (
    privateKey: string,
    to: string,
    amount: string,
    contract: string,
    rpc: string,
    gasPrice: string | undefined,
    gasLimit: string | undefined,
    estimate: boolean,
    decimals: number | undefined
) => {
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractInstance = new ethers.Contract(contract, ['function transfer(address to, uint256 value)'], wallet);

    const balance = await contractInstance.balanceOf(wallet.address);
    const nonce = await provider.getTransactionCount(wallet.address);

    const _decimals = decimals ? decimals : await contractInstance.decimals();

    const _gasPrice = gasPrice ? gasPrice : await provider.getGasPrice();
    const _gasLimit = gasLimit ? gasLimit : await contractInstance.transfer.estimateGas(to, ethers.parseUnits(amount, _decimals));

    const tx = {
        to: contract,
        value: 0,
        data: contractInstance.interface.encodeFunctionData('transfer', [to, ethers.parseUnits(amount, 18)]),
        gasPrice: _gasPrice,
        gasLimit: _gasLimit,
        nonce
    }

    if (estimate) {
        console.log(`Gas Price`);
        console.log(`${_gasPrice} wei`);
        console.log(`${ethers.formatUnits(_gasPrice, 9)} gwei`);
        console.log(`Gas Limit`);
        console.log(_gasLimit);
        console.log(`Estimated Total ${ethers.formatUnits(BigInt(_gasPrice) * BigInt(_gasLimit), 18)} ETH`);
        console.log(`Balance: ${ethers.formatUnits(balance, 18)} ETH`);

        if (BigInt(ethers.formatUnits(balance, 18)) < BigInt(ethers.formatUnits(BigInt(_gasPrice) * BigInt(_gasLimit), 18))) {
            console.log(`Insufficient Balance for Gas Fee`);
        }
    } else {
        const response = await wallet.sendTransaction(tx);
        console.log(`Transaction Hash: ${response.hash}`);
    }
}

// [TESTED]
const transferTRX = async (
    privateKey: string,
    to: string,
    amount: string,
    rpc: string,
) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
        privateKey
    });
    const balance = await tronWeb.trx.getBalance();
    const _amount = tronWeb.toSun(Number(amount));

    const _gasPrice = await tronWeb.trx.getEnergyPrices();
    const _gasLimit = 10000000;

    if (BigInt(balance) < BigInt(String(_amount))) {
        console.log(`Insufficient Balance to transfer ${amount} TRX - ${tronWeb.address}`);
        return;
    }

    const response = await tronWeb.trx.sendTrx(to, Number(tronWeb.toSun(Number(amount))));
    console.log(`Transaction Hash: ${response.transaction.txID}`);
}


// [TESTED]
const transferTRC20 = async (
    privateKey: string,
    to: string,
    amount: string,
    contract: string,
    rpc: string,
    estimate: boolean) => {

    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
        privateKey
    });

    const trc20abi: FunctionFragment[] = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function",
            "constant": false,
            "payable": false
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true,
            "payable": false
        }
    ];
    const contractInstance = tronWeb.contract(
        trc20abi,
        contract
    ); //.at(contract);

    const balance = await contractInstance.balanceOf(tronWeb.defaultAddress.base58).call();

    const _amount = tronWeb.toSun(Number(amount));
    if (BigInt(balance) < BigInt(String(_amount))) {
        console.log(`Insufficient Balance to transfer ${amount} TRC20 - ${tronWeb.address}`);
        return;
    }

    const response = await contractInstance.transfer(to, _amount).send();
    console.log(`Transaction Hash: ${response}`);

}