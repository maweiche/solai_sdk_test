import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SDK } from '@maweiche/react-sdk';
import base58, * as bs58 from "bs58";
import dotenv from 'dotenv';
dotenv.config()
export async function POST(request: Request) {
    const body = await request.json();
    const id = body.id;
    const collectionOwner = new PublicKey(body.collectionOwner);
    const publicKey = new PublicKey(body.publicKey);

    const keypair1 = process.env.KEYPAIR1 as string;
    const keypair2 = process.env.KEYPAIR2 as string;
    const keypair3 = process.env.KEYPAIR3 as string;

    const admin1Keypair = Keypair.fromSecretKey(base58.decode(keypair1));
    const admin2Keypair = Keypair.fromSecretKey(base58.decode(keypair2));
    const admin3KeyPair = Keypair.fromSecretKey(base58.decode(keypair3))

    const admin1Wallet = new NodeWallet(admin1Keypair);
    const admin2Wallet = new NodeWallet(admin2Keypair);
    
    console.log('wallet', admin1Wallet.publicKey.toBase58());
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    const sdk = new SDK(
        admin2Wallet,
        connection,
        { skipPreflight: true},
        "devnet",
    )
    const base64txn = await sdk.placeholder.createPlaceholder(
        connection,
        admin2Keypair,
        collectionOwner,
        publicKey,
        id,
        'www.example.com'
      );
    const tx = Transaction.from(Buffer.from(base64txn, "base64"));
    tx.partialSign(admin2Keypair);
    const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
      });
    const base64 = serializedTransaction.toString("base64");
    const base64JSON = JSON.stringify(base64);
    return new Response(base64JSON, { status: 200 });
  }
  