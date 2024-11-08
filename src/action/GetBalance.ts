import { ethers } from 'ethers';
import {TronWeb} from 'tronweb'; // Ensure TronWeb is imported correctly
import { getProvider } from '../util/web3util';
import { TRON_API_KEY } from '../util/const';

// [TESTED]
export const GetBalance = async (options: any) => {

    const { address, type, rpc, contract, format } = options;

    switch (type.toLowerCase()) {
        case 'evm':
            if (contract) {
                await getERC20Balance(address, contract, rpc, format);
            } else {
                await getETHBalance(address, rpc, format);
            }
            break;
        case 'tron':
            if (contract) {
                await getTRC20Balance(address, contract, rpc, format);
            } else {
                await getTRXBalance(address, rpc, format);
            }
            break;
        default:
            console.log('Unsupported type');
            break;
    }
}


const getETHBalance = async (address: string, rpc: string, format: boolean) => {
    // ethers v6
    const provider = getProvider(rpc);
    const balance = await provider.getBalance(address);
    if (format === true) {
        console.log(`${ethers.formatUnits(balance, 18)} ETH`);
    } else {
        console.log(`${balance} WEI`);
    }
}

const getERC20Balance = async (address: string, contract: string, rpc: string, format: boolean) => {
    // ethers v6
    const provider = getProvider(rpc);
    const contractInstance = new ethers.Contract(contract, [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
    ], provider);
    const balance = await contractInstance.balanceOf(address);
    if (format === true) {
        const decimals = await contractInstance.decimals();
        const symbol = await contractInstance.symbol();
        console.log(`${ethers.formatUnits(balance, decimals)} ${symbol}`);
    } else {
        console.log(`${balance} ERC20`);
    }
}

const getTRXBalance = async (address: string, rpc: string, format: boolean) => {
    //prod: https://api.trongrid.io/
    //test: https://api.shasta.trongrid.io/

    // apikey:  1aa50f46-ff6c-464a-9484-85379ba46866

    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY }
    });

    const balance = await tronWeb.trx.getBalance(address);
    if (format === true) {
        console.log(`${tronWeb.fromSun(balance)} TRX`);
    } else {
        console.log(`${balance} SUN`);
    }
}

const getTRC20Balance = async (address: string, contract: string, rpc: string, format: boolean) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY }
    });

    tronWeb.setAddress(address);

    const contractInstance = await tronWeb.contract().at(contract);
    const balance = await contractInstance.balanceOf(address).call();
    if (format === true) {
        // const decimals = await contractInstance.decimals().call();
        const symbol = await contractInstance.symbol().call();
        console.log(`${tronWeb.fromSun(balance)} ${symbol}`);
    } else {
        console.log(`${balance} TRC20`);
    }
}