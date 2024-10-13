import { authenticator } from 'otplib'

export const GenerateGASecret = (name: string) => {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(name, 'UPay', secret)

    console.log(`Please keep the secret in a safe place. You will need it to setup your Google Authenticator App.`);
    console.log(`Secret: ${secret}`);

    console.log(`\nYou can use the URI to generate the QR code. Or you can copy the secret to your Google Authenticator App directly.`);
    console.log(`URI: ${uri}`);

}