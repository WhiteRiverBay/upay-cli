import { FunctionFragment } from "tronweb/lib/esm/types";

export const TRON_API_KEY: string = '1aa50f46-ff6c-464a-9484-85379ba46866';
export const TRON_RPC: string = 'https://api.shasta.trongrid.io/'; // testnet
// export const TRON_RPC:string = 'https://api.trongrid.io/'; // mainnet    

// export const TRON_AIRDROP_CONTRACT: string = 'TQpmhTwq7ynPjFeGubMGMtgUCaHVzZcnu7'; 
// export const EVM_AIRDROP_CONTRACT: string = '0x9Ad7c32e559B5BD4B92E4af2Fe2A25eDA743eE77'; 

export const TRON_AIRDROP_CONTRACT: string = 'TNnHipM7aZMYYanXhESgRV9NmjndcgvaXu'; 
export const EVM_AIRDROP_CONTRACT: string = '0xE9511e55d2AaC1F62D7e3110f7800845dB2a31F1';

// function airdropCoin(address[] memory _to,uint256[] memory _amount) public payable
// function airdropToken(address _token,address[] memory _to,uint256[] memory _amount) public payable
//uint256 public fee;
export const AIRDROP_ABI_EVM = [
    "function airdropCoin(address[] memory _to,uint256[] memory _amount) public payable",
    "function airdropToken(address _token,address[] memory _to,uint256[] memory _amount) public payable",
    "function fee() public view returns (uint256)"
]

export const AIRDROP_ABI: FunctionFragment[] = [
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_to",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_amount",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function",
        "constant": false,
        "payable": true,
        "name": "airdropCoin",
        "outputs": []
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "address[]",
                "name": "_to",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_amount",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function",
        "constant": false,
        "payable": true,
        "name": "airdropToken",
        "outputs": []
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true,
        "payable": false,
        "name": "fee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    }

];
// transfer, balanceOf, decimals, symbol, allowance, approve
const ERC20_ABI = [
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
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true,
        "payable": false
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true,
        "payable": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "state": "view",
        "type": "function",
        "constant": true,
        "payable": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
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
    }
];
