import { ethers } from 'ethers';
import { getProvider } from '../util/web3util';
import { TronWeb } from 'tronweb';
// fs
import fs from 'fs';
import { AIRDROP_ABI, EVM_AIRDROP_CONTRACT, TRON_API_KEY } from '../util/const';

// prompt_sync
import prompt from 'prompt-sync';

export const Airdrop = async (options: any) => {

    const {
        privateKey,
        file,
        rpc,
        type,
        contract,
        estimate,
        yes,
    } = options;

    const lines = fs.readFileSync(file, 'utf8').split('\n');
    // to Destination[]
    const data: Destination[] = lines.map((line: string) => {
        const parts = line.split(',');
        return {
            address: parts[0],
            amount: parts[1],
        }
    });

    if (type.toLowerCase() === 'evm') {
        if (!contract) {
            await airdropETH(privateKey, data, rpc, estimate, yes);
        } else {
            await airDropERC20(privateKey, data, rpc, contract, estimate, yes);
        }
    } else if (type.toLowerCase() === 'tron') {
        if (!contract) {
            await airdropTRX(privateKey, data, rpc, contract, estimate, yes);
        } else {
            await airDropTRC20(privateKey, data, rpc, estimate, yes);
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
) => {
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractInstance = new ethers.Contract(EVM_AIRDROP_CONTRACT, AIRDROP_ABI, wallet);
    const gasPrice = (await provider.getFeeData()).gasPrice;

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => ethers.parseEther(d.amount));

    const _amount = amounts.reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));

    const fee = await contractInstance.fee();

    const gasLimit = await contractInstance.airdropCoin.estimateGas(addresses, amounts, {
        gasPrice,
        value: _amount + fee,
    });

    if (estimate) {
        // gas price
        console.log(`Gas Price: ${ethers.formatUnits(gasPrice + '', 'gwei')} GWEI`);
        // gas limit
        console.log(`Gas Limit: ${gasLimit}`);
        // tip fee
        console.log(`Total Fee: ${ethers.formatUnits(fee, 'ether')} ETH`);
        // total cost
        console.log(`Total Cost: ${ethers.formatUnits(BigInt(gasPrice + '') * BigInt(gasLimit) + fee + _amount, 'ether')} ETH`);
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
    estimate: boolean,
    contract: string,
    yes: boolean,
) => {
    // airdropToken
    // ethers v6
    const provider = getProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractInstance = new ethers.Contract(EVM_AIRDROP_CONTRACT, AIRDROP_ABI, wallet);

    const gasPrice = (await provider.getFeeData()).gasPrice;

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => ethers.parseEther(d.amount));

    const _amount = amounts.reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));

    const fee = await contractInstance.fee();

    const gasLimit = await contractInstance.airdropToken.estimateGas(contract, addresses, amounts, {
        gasPrice,
        value: _amount + fee,
    });

    if (estimate) {
        // gas price
        console.log(`Gas Price: ${ethers.formatUnits(gasPrice + '', 'gwei')} GWEI`);
        // gas limit
        console.log(`Gas Limit: ${gasLimit}`);
        // tip fee
        console.log(`Total Fee: ${ethers.formatUnits(fee, 'ether')} ETH`);
        // total cost
        console.log(`Total Cost: ${ethers.formatUnits(BigInt(gasPrice + '') * BigInt(gasLimit) + fee + _amount, 'ether')} ETH`);
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
) => {

    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
        privateKey,
    });

    const contractInstance = await tronWeb.contract(AIRDROP_ABI).at(contract);

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => tronWeb.toSun(Number(d.amount)));

    const _amount = amounts.reduce((a, b) => BigInt(a + '') + BigInt(b + ''), BigInt(0));

    const fee = await contractInstance.fee().call();

    const _gasLimit = await contractInstance.airdropCoin.estimateGas(addresses, amounts, {
        value: _amount + fee,
    });

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
        const tx = await contractInstance.airdropCoin(addresses, amounts, {
            value: fee + _amount,
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
) => {
    const tronWeb = new TronWeb({
        fullHost: rpc,
        headers: { "TRON-PRO-API-KEY": TRON_API_KEY },
        privateKey,
    });

    const contractInstance = await tronWeb.contract(AIRDROP_ABI).at(EVM_AIRDROP_CONTRACT);

    const addresses = data.map((d: Destination) => d.address);
    const amounts = data.map((d: Destination) => tronWeb.toSun(Number(d.amount)));

    const _amount = amounts.reduce((a, b) => BigInt(a + '') + BigInt(b + ''), BigInt(0));

    const fee = await contractInstance.fee().call();

    const _gasLimit = await contractInstance.airdropToken.estimateGas(addresses, amounts, {
        value: _amount + fee,
    });

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
        const tx = await contractInstance.airdropToken(addresses, amounts, {
            value: fee + _amount,
        });
        console.log(`Transaction Hash: ${tx}`);
    }

}

interface Destination {
    address: string;
    amount: string;
}