interface Wallet {
    address: string;
    ecrypedPrivateKey: string;
    encryptedAesKey: string;
    uid: string;
}
export const Dump = async (options: any) => {

    const { ga, type, endpoint } = options;

    const api = `${endpoint}/_op/dumpWallet/${type.toUpperCase()}`;

    const response = await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "code": ga })
    });

    const data = await response.json();
    console.log(data);
    const wallets: Array<Wallet> = data['data'];

    wallets.forEach(wallet => {
        console.log(`${wallet.address},${wallet.ecrypedPrivateKey},${wallet.encryptedAesKey},${wallet.uid}`);
    })

}