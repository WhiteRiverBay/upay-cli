
import { Command } from 'commander';
import { GenerateGASecret } from './action/GenerateGA';
import { Dump } from './action/Dump';
import { DecryptKey } from './action/DecryptKey';
import { GetBalance } from './action/GetBalance';
import { Transfer } from './action/Transfer';

const program = new Command();

/*
    ./upay generate-ga
    ./upay dump -g|--ga [google authticator] -T|--type [evm|tron] --endpoint [endpoint]
    ./upay decrypt -I|--input [the key] -P|--private-key-file private_key.pem
    ./upay balance -A|--address [address] -C|--contract [contract address] -T|--type [evm|tron] -R|--rpc [rpc]
    ./upay transfer -P|--private-key -C|--contract [erc20] -T|--type [evm|tron] -t|--to [to_address] -E|--estimate
    ./upay airdrop -f|--file [airdropfile(address,amount)] -R|--rpc [rpc] -T|--type [eth|trx] -C|--contract [if erc20, neet this] -E|--estimate
*/
function main() {
    program.name('upay')
        .version('0.0.1')
        .description('Upay CLI');

    program.command('generate-ga')
        .description('Generate Google Authenticator Secret')
        .action(async () => {
            GenerateGASecret('UPay-Admin');
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
        .requiredOption('-a, --amount <amount>', 'Amount to transfer')
        .option('-C, --contract <contract>', 'Contract Address, if specified, will transfer the contract')
        .option('-G, --gasPrice <gasPrice>', 'Gas Price')
        .option('-L, --gasLimit <gasLimit>', 'Gas Limit')
        .option('-E, --estimate', 'Estimate the gas')
        // decimals
        .option('-d, --decimals <decimals>', 'Decimals of the token', )
        // yes
        .option('-y, --yes', 'Yes to confirm')
        .action(async (options) => {
            Transfer(options);
        })
    // airdrop -f|--file [airdropfile(address,amount)] -R|--rpc [rpc] -T|--type [eth|trx] -C|--contract [if erc20, neet this] -E|--estimate
    program.command('airdrop')
        .description('Airdrop the token')
        .requiredOption('-f, --file <file>', 'The airdrop file')
        .requiredOption('-R, --rpc <rpc>', 'RPC Endpoint')
        .requiredOption('-T, --type <type>', 'EVM or TRON')
        .option('-C, --contract <contract>', 'Contract Address, if specified, will transfer the contract')
        .option('-E, --estimate', 'Estimate the gas')
        .action(async (options) => {
            console.log(options);
        })

    program.command('help')
        .description('Help')
        .action(async () => {
            program.help();
        })

    // default is help
    program.action(async () => {
        program.help();
    })
    const argv = program.opts();
    program.parseAsync(process.argv);
}

main();