import { TronWeb } from 'tronweb';
import { ethers } from 'ethers';
import { getProvider } from '../util/web3util';
import { TRON_API_KEY } from '../util/const';


export const TokenAllowance = async (options: any) => {
    const { address, contract, spender, type, rpc, format } = options;

    switch (type.toLowerCase()) {
        case 'evm':
            await getERC20Allowance(address, contract, spender, rpc, format);
            break;
        case 'tron':
            await getTRC20Allowance(address, contract, spender, rpc, format);
            break;
        default:
            console.log('Unsupported type');
            break;
    }
}

const getERC20Allowance = async (address: string, contract: string, spender: string, rpc: string, format: boolean) => {
    // ethers v6
    const provider = getProvider(rpc);
    const contractInstance = new ethers.Contract(contract, ['function allowance(address,address)'], provider);
    const allowance = await contractInstance.allowance(address, spender);
    if (format) {
        console.log(`${ethers.formatUnits(allowance, 18)} ERC20`);
    } else {
        console.log(`${allowance} ERC20`);
    }
}

const getTRC20Allowance = async (address: string, contract: string, spender: string, rpc: string, format: boolean) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
    });

    tronWeb.setAddress(address);

    const contractInstance = await tronWeb.contract().at(contract);
    const allowance = await contractInstance.allowance(address, spender).call();
    const decimals = await contractInstance.decimals().call();
    const symbol = await contractInstance.symbol().call();

    if (format) {
        console.log(`${tronWeb.fromSun(allowance).toString()} ${symbol}`);
    } else {
        console.log(`${allowance} `);
    }
}