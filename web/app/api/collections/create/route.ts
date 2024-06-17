import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { SDK } from '@maweiche/react-sdk';
import * as anchor from '@project-serum/anchor';
import base58, * as bs58 from "bs58";
import dotenv from 'dotenv';
dotenv.config()
export async function POST(request: Request) {
    const body = await request.json();
    // public async createCollection(
    //     connection: Connection,
    //     owner: PublicKey,
    //     name: string,
    //     symbol: string,
    //     sale_start_time: anchor.BN,
    //     max_supply: anchor.BN,
    //     price: anchor.BN,
    //     stable_id: string,
    //     reference: string,
    //     whitelist?: PublicKey[] | undefined,
    //     whitelist_price?: anchor.BN | undefined,
    //     whitelist_start_time?: anchor.BN | undefined,
    // )
    const owner = new PublicKey(body.owner);
    const name = body.name;
    const symbol = body.symbol;
    const sale_start_time = new anchor.BN(body.sale_start_time);
    const max_supply = new anchor.BN(body.max_supply);
    const price = new anchor.BN(body.price);
    const stable_id = body.stable_id;
    const reference = body.reference;

    console.log('owner', owner.toBase58())
    console.log('name', name)
    console.log('symbol', symbol)
    console.log('sale_start_time', sale_start_time)
    console.log('max_supply', max_supply)
    console.log('price', price)
    console.log('stable_id', stable_id)
    console.log('reference', reference)


    const whitelist = body.whitelist ? body.whitelist : undefined;
    const whitelist_price = body.whitelist_price ? new anchor.BN(body.whitelist_price) : undefined;
    const whitelist_start_time = body.whitelist_start_time ? new anchor.BN(body.whitelist_start_time) : undefined;

    const keypair1 = process.env.KEYPAIR1 as string;
    const keypair2 = process.env.KEYPAIR2 as string;
    const keypair3 = process.env.KEYPAIR3 as string;

    const admin1Keypair = Keypair.fromSecretKey(base58.decode(keypair1));
    const admin2Keypair = Keypair.fromSecretKey(base58.decode(keypair2));
    const admin3KeyPair = Keypair.fromSecretKey(base58.decode(keypair3))

    const admin1Wallet = new NodeWallet(admin1Keypair);
    const admin2Wallet = new NodeWallet(admin2Keypair);
    const collectionRefKey = new PublicKey("mwUt7aCktvBeSm8bry6TvqEcNSUGtxByKCbBKfkxAzA");
    console.log('wallet', admin2Wallet.publicKey.toBase58());
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    const sdk = new SDK(
        admin2Wallet,
        connection,
        { skipPreflight: true},
        "devnet",
    )
    const base64txn = await sdk.collection.createCollection(
        connection,
        collectionRefKey,
        owner,
        name,
        symbol,
        sale_start_time,
        max_supply,
        price,
        stable_id,
        whitelist,
        whitelist_price,
        whitelist_start_time
    );
    console.log('base64txn', base64txn)
    const tx = Transaction.from(Buffer.from(base64txn, "base64"));
    const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
      });
    const base64 = serializedTransaction.toString("base64");
    const base64JSON = JSON.stringify(base64);
    return new Response(base64JSON, { status: 200 });
  }
  