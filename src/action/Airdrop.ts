import { ethers } from 'ethers';
import { decimals, getProvider } from '../util/web3util';
import { TronWeb } from 'tronweb';
// fs
import fs from 'fs';
import { AIRDROP_ABI, AIRDROP_ABI_EVM, EVM_AIRDROP_CONTRACT, TRON_AIRDROP_CONTRACT, TRON_API_KEY } from '../util/const';

// prompt_sync
import prompt from 'prompt-sync';

// [TESTED]
export const Airdrop = async (options: any) => {

    const {
        privateKey,
        file,
        rpc,
        type,
        contract,
        estimate,
        yes,
        airdropContract
    } = options;

    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    // to Destination[]
    const data: Destination[] = lines.map((line: string) => {
        const parts = line.split(',');
        return {
            address: parts[0],
            amount: parts[1],
        }
    });
    console.log(`File Path: ${file}`);
    if (type.toLowerCase() === 'evm') {
        const _airdropContract = airdropContract || EVM_AIRDROP_CONTRACT;
        if (!contract) {
            await airdropETH(privateKey, data, rpc, estimate, yes, _airdropContract);
        } else {
            await airDropERC20(privateKey, data, rpc, contract, estimate, yes, _airdropContract);
        }
    } else if (type.toLowerCase() === 'tron') {

        const _airdropContract = airdropContract || TRON_AIRDROP_CONTRACT;
        if (!contract) {
            await airdropTRX(privateKey, data, rpc, contract, estimate, yes, _airdropContract);
        } else {
            await airDropTRC20(privateKey, data, rpc, estimate, yes, _airdropContract, contract);
        }
    } else {
        console.log('Unsupported type');
    }
}

const airdropETH = async (
    privateKey: string,
    data: Array<Destination>,
    rpc: string,
    estimate: boolean,
    yes: boolean,
    airdropContract: string,
) => {
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractInstance = new ethers.Contract(airdropContract, AIRDROP_ABI_EVM, wallet);
    const gasPrice = (await provider.getFeeData()).gasPrice;

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => ethers.parseEther(d.amount + ''));

    const _amount = amounts.reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));

    const fee = await contractInstance.fee();

    const gasLimit = await contractInstance.airdropCoin.estimateGas(addresses, amounts, {
        gasPrice,
        value: _amount + fee,
    });

    if (estimate) {
        // file path
        // gas price
        console.log(`Gas Price: ${ethers.formatUnits(gasPrice + '', 'gwei')} GWEI`);
        // gas limit
        console.log(`Gas Limit: ${gasLimit}`);
        // tip fee
        console.log(`Fee: ${ethers.formatUnits(fee, 'ether')} ETH`);
        // total cost
        console.log(`Total Gas: ${ethers.formatUnits(BigInt(gasPrice + '') * BigInt(gasLimit) + fee + _amount, 'ether')} ETH`);
        // amount
        console.log(`Airdrop Amount: ${ethers.formatUnits(_amount, 'ether')} ETH`);
    } else {
        if (!yes) {
            // prompt_sync
            console.log(`AirDrop Summary: ${data.length} addresses, Total Amount: ${ethers.formatUnits(_amount, 'ether')} ETH`);
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }
        const tx = await contractInstance.airdropCoin(addresses, amounts, {
            gasPrice,
            gasLimit,
            value: fee + _amount,
        });
        console.log(`Transaction Hash: ${tx.hash}`);
    }

}

const airDropERC20 = async (
    privateKey: string,
    data: Array<Destination>,
    rpc: string,
    contract: string,
    estimate: boolean,
    yes: boolean,
    airdropContract: string,
) => {
    // airdropToken
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractInstance = new ethers.Contract(airdropContract, AIRDROP_ABI_EVM, wallet);

    const gasPrice = (await provider.getFeeData()).gasPrice;
    const _decimals = await decimals(contract, provider);

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => ethers.parseUnits(d.amount, _decimals));

    const _amount = amounts.reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));

    const fee = await contractInstance.fee();

    // contract
    console.log(`Contract: ${contract}`);

    const gasLimit = await contractInstance.airdropToken.estimateGas(contract, addresses, amounts, {
        gasPrice,
        value: fee,
    });

    if (estimate) {
        // gas price
        console.log(`Gas Price: ${ethers.formatUnits(gasPrice + '', 'gwei')} GWEI`);
        // gas limit
        console.log(`Gas Limit: ${gasLimit}`);
        // tip fee
        console.log(`Fee: ${ethers.formatUnits(fee, 'ether')} ETH`);
        // total cost
        console.log(`Total Gas: ${ethers.formatUnits(BigInt(gasPrice + '') * BigInt(gasLimit) + fee, 'ether')} ETH`);
        // amount
        console.log(`Airdrop Amount: ${ethers.formatUnits(_amount, 'ether')} Token`);
    } else {
        if (!yes) {
            // prompt_sync
            console.log(`AirDrop Summary: ${data.length} addresses, Total Amount: ${ethers.formatUnits(_amount, 'ether')} ETH`);
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }
        const tx = await contractInstance.airdropToken(contract, addresses, amounts, {
            gasPrice,
            gasLimit,
            value: fee + _amount,
        });
        console.log(`Transaction Hash: ${tx.hash}`);
    }
}

const airdropTRX = async (
    privateKey: string,
    data: Array<Destination>,
    rpc: string,
    contract: string,
    estimate: boolean,
    yes: boolean,
    airdropContract: string,
) => {

    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
        privateKey,
    });

    const contractInstance = await tronWeb.contract(AIRDROP_ABI).at(airdropContract);

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => tronWeb.toSun(Number(d.amount)));

    const _amount = amounts.reduce((a, b) => BigInt(a + '') + BigInt(b + ''), BigInt(0));

    const fee = await contractInstance.fee().call();

    if (estimate) {
        console.log(`Total Fee: ${tronWeb.fromSun(fee)} TRX`);
        console.log(`Total Cost: ${tronWeb.fromSun(fee + _amount)} TRX`);
    } else {
        if (!yes) {
            // prompt_sync
            console.log(`AirDrop Summary: ${data.length} addresses, Total Amount: ${tronWeb.fromSun(Number(_amount))} TRX`);
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }

        // console.log address and amounts
        const tx = await contractInstance.airdropCoin(addresses, amounts).send({
            callValue: fee + _amount,
        });
        console.log(`Transaction Hash: ${tx}`);
    }
}

const airDropTRC20 = async (
    privateKey: string,
    data: Array<Destination>,
    rpc: string,
    estimate: boolean,
    yes: boolean,
    airdropContract: string,
    contract: string,
) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
        privateKey,
    });

    const contractInstance = await tronWeb.contract(AIRDROP_ABI).at(airdropContract);

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => tronWeb.toSun(Number(d.amount)));

    const _amount = amounts.reduce((a, b) => BigInt(a + '') + BigInt(b + ''), BigInt(0));

    const fee = await contractInstance.fee().call();

    if (estimate) {
        console.log(`Total Fee: ${tronWeb.fromSun(fee)} TRX`);
        console.log(`Total Cost: ${tronWeb.fromSun(fee)} TRX`);
        // usdt
        console.log(`Total USDT: ${tronWeb.fromSun(Number(_amount))} USDT`);
    } else {
        if (!yes) {
            // prompt_sync
            console.log(`AirDrop Summary: ${data.length} addresses, Total Amount: ${tronWeb.fromSun(Number(_amount))} TRX`);
            const yes = prompt()('Continue? [y/N] ');
            if (yes !== 'y') {
                return;
            }
        }
        const tx = await contractInstance.airdropToken(contract, addresses, amounts).send({
            callValue: fee
        });
        console.log(`Transaction Hash: ${tx}`);
    }

}

interface Destination {
    address: string;
    amount: string;
}