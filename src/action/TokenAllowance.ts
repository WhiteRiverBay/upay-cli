import { TronWeb } from 'tronweb';
import { ethers } from 'ethers';
import { FunctionFragment } from 'tronweb/lib/esm/types';
import { getProvider } from '../util/web3util';
import { TRON_API_KEY } from '../util/const';


export const TokenAllowance = async (options: any) => {
    const { owner, contract, spender, type, rpc, format } = options;

    switch (type.toLowerCase()) {
        case 'evm':
            await getERC20Allowance(owner, contract, spender, rpc, format);
            break;
        case 'tron':
            await getTRC20Allowance(owner, contract, spender, rpc, format);
            break;
        default:
            console.log('Unsupported type');
            break;
    }
}

// [TESTED]
const getERC20Allowance = async (address: string, contract: string, spender: string, rpc: string, format: boolean) => {
    // ethers v6
    const provider = getProvider(rpc);
    const contractInstance = new ethers.Contract(contract, [
        'function allowance(address owner, address spender) public view returns (uint256)'
    ], provider);
    const allowance = await contractInstance.allowance(address, spender);
    if (format === true) {
        console.log(`${ethers.formatUnits(allowance, 18)}`);
    } else {
        console.log(`${allowance}`);
    }
}

// [TESTED]
const getTRC20Allowance = async (address: string, contract: string, spender: string, rpc: string, format: boolean) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
    });

    tronWeb.setAddress(address);

    const trc20abi: FunctionFragment[] = [
        {
            "constant": true,
            "inputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const contractInstance = await tronWeb.contract(trc20abi).at(contract);
    const allowance = await contractInstance.allowance(address, spender).call();
    // const decimals = await contractInstance.decimals().call();
    // const symbol = await contractInstance.symbol().call();

    if (format === true) {
        console.log(`${tronWeb.fromSun(allowance).toString()}`);
    } else {
        console.log(`${allowance}`);
    }
}