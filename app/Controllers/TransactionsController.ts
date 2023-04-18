import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from 'App/Models/Account';
import Transaction from 'App/Models/Transaction';
import WalletSendValidator from 'App/Validators/WalletSendValidator';
import { createHash, publicDecrypt } from 'node:crypto';


export default class TransactionsController {

    public async send({ request, response }: HttpContextContract) {
        const { publicKey, publicAddress, receiverAddress, amount, signature, date, uniqueTransactionToken } = await request.validate(WalletSendValidator);
        const owner = await Account.findByOrFail('address', publicAddress);
        if (owner.balance < amount) {
            response.status(403)
            return {
                success: false,
                message: "Inefficient balance"
            }
        }
        const incomingHash = publicDecrypt(publicKey, Buffer.from(signature, "utf-8")).toString();
        const generatedData = JSON.stringify({
            publicKey,
            publicAddress,
            receiverAddress,
            date,
            amount,
            uniqueTransactionToken
        })
        const hash = createHash("sha256");
        hash.update(generatedData)
        const generatedHash = hash.digest("hex");
        if (incomingHash === generatedHash) {
            const tx = await Transaction.findBy("uniqueTransactionToken",uniqueTransactionToken);
            if(!tx){
                const receiver = await Account.findByOrFail("address",receiverAddress);

                receiver.balance += amount;
                await receiver.save();

                owner.balance -= amount;
                await owner.save();
                
                await Transaction.create({
                    accountId:owner.id,
                    receiverAddress,
                    amount,
                    signature,
                    uniqueTransactionToken,
                    deposit:false,
                })
            }
            return {
                success: true,
                message: "Transaction successful"
            }
        }
        response.status(403)
        return {
            success: false,
            message: "Invalid signature"
        }
    }
}