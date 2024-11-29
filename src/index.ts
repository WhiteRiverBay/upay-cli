#!/usr/bin/env node

import { Command } from 'commander';
import { GenerateGASecret } from './action/GenerateGA';
import { Dump } from './action/Dump';
import { DecryptKey } from './action/DecryptKey';
import { GetBalance } from './action/GetBalance';
import { Transfer } from './action/Transfer';
import { Airdrop } from './action/Airdrop';
import { TokenAllowance } from './action/TokenAllowance';
import { TokenApprove } from './action/TokenApprove';
import { GenerateAccount } from './action/GenerateAccount';

const program = new Command();

function main() {
    program.name('upay')
        .version('0.0.7')
        .description('Upay CLI');

    program.command('generate-ga')
        .description('Generate Google Authenticator Secret')
        .action(async () => {
            GenerateGASecret('UPay-Admin');
        })

    // generate-account -n 10 -o output.txt -t evm
    program.command('generate-account')
        .description('Generate the account')
        .requiredOption('-n, --number <number>', 'The number of accounts to generate')
        .option('-o, --output <output>', 'Output file')
        .requiredOption('-t, --type <type>', 'EVM or TRON')
        .action(async (options) => {
            GenerateAccount(options);
        })

    program.command('dump')
        .description('Dump the wallets')
        .requiredOption('-g, --ga <ga>', 'Google Authenticator Code')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .requiredOption('-e, --endpoint <endpoint>', 'UPay API Endpoint, formatted [schame]://[host][:port]', 'http://localhost:8080')
        .action(async (options) => {
            Dump(options);
        })

    // decrypt -I|--input [the key] -P|--private-key-file private_key.pem
    program.command('decrypt')
        .description('Decrypt the key')
        .requiredOption('-pk, --encrypted-private-key <privatekey>', 'The encrypted private key')
        .requiredOption('-aes, --encrypted-aes-key <aeskey>', 'The encrypted aes key')
        .requiredOption('-P, --private-key-file <private-key-file>', 'Private Key File')
        .action(async (options) => {
            DecryptKey(options);
        })

    // balance -A|--address [address] -C|--contract [contract address] -T|--type [evm|tron] -R|--rpc [rpc]
    program.command('balance')
        .description('Get the balance')
        .requiredOption('-A, --address <address>', 'The address you want to check')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .requiredOption('-R, --rpc <rpc>', 'RPC Endpoint')
        .option('-f, --format <format>', 'Format of the output to decimals', true)
        .option('-C, --contract <contract>', 'Contract Address, if specified, will get the balance of the contract')
        .action(async (options) => {
            GetBalance(options);
        })
    // transfer -P|--private-key -C|--contract [erc20] -T|--type [evm|tron] -t|--to [to_address] -E|--estimate
    program.command('transfer')
        .description('Transfer the token')
        .option('-P, --privateKey <privateKey>', 'The private key')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .requiredOption('-R, --rpc <rpc>', 'RPC Endpoint')
        .requiredOption('-t, --to <to>', 'To Address')
        .requiredOption('-a, --amount <amount>', 'Amount to transfer, in decimal')
        .option('-C, --contract <contract>', 'Contract Address, if specified, will transfer the contract')
        .option('-G, --gasPrice <gasPrice>', 'Gas Price')
        .option('-L, --gasLimit <gasLimit>', 'Gas Limit')
        .option('-E, --estimate', 'Estimate the gas (not work for TRON temporarily)')
        // decimals
        .option('-d, --decimals <decimals>', 'Decimals of the token',)
        // yes
        .option('-y, --yes', 'Yes to confirm')
        .action(async (options) => {
            Transfer(options);
        })
    // airdrop -f|--file [airdropfile(address,amount)] -R|--rpc [rpc] -T|--type [eth|trx] -C|--contract [if erc20, neet this] -E|--estimate
    program.command('airdrop')
        .description('Airdrop the token')
        .option('-P, --privateKey <privateKey>', 'The private key of the sender')
        .requiredOption('-f, --file <file>', 'The airdrop file')
        .requiredOption('-R, --rpc <rpc>', 'RPC Endpoint')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .option('-C, --contract <contract>', 'Contract Address, if specified, will transfer the token of the contract')
        .option('-E, --estimate', 'Estimate the gas (not work for TRON temporarily)')
        .option('-y, --yes', 'Yes to confirm')
        .option('-c, --airdropContract <airdropContract>', 'Airdrop Contract Address')
        .action(async (options) => {
            Airdrop(options);
        })

    // allowance const { address, contract, spender, type, rpc, format } = options;
    program.command('allowance')
        .description('Get the allowance')
        .requiredOption('-O, --owner <owner>', 'The address you want to check')
        .requiredOption('-C, --contract <contract>', 'The contract address')
        .requiredOption('-S, --spender <spender>', 'The spender address')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .requiredOption('-R, --rpc <rpc>', 'RPC Endpoint')
        .option('-f, --format <format>', 'Format of the output to decimals', false)
        .action(async (options) => {
            TokenAllowance(options);
        })
    // approve const { privateKey, contract, spender, amount, type, rpc, gasPrice, gasLimit, estimate, yes } = options;
    program.command('approve')
        .description('Approve the token')
        .requiredOption('-P, --privateKey <privateKey>', 'The private key')
        .requiredOption('-C, --contract <contract>', 'The contract address')
        .requiredOption('-S, --spender <spender>', 'The spender address')
        .requiredOption('-A, --amount <amount>', 'The amount to approve in wei')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .requiredOption('-R, --rpc <rpc>', 'RPC Endpoint')
        .option('-G, --gasPrice <gasPrice>', 'Gas Price')
        .option('-L, --gasLimit <gasLimit>', 'Gas Limit')
        .option('-E, --estimate', 'Estimate the gas (not work for TRON temporarily)')
        .option('-y, --yes', 'Yes to confirm')
        .action(async (options) => {
            TokenApprove(options);
        })

    program.command('help')
        .description('Help')
        .action(async () => {
            program.help();
        })
        //version
    // default is help
    program.action(async () => {
        program.help();
    })
    const argv = program.opts();
    program.parseAsync(process.argv);
}

main();

