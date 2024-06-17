import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import base58, * as bs58 from "bs58";
import { SDK } from '@maweiche/react-sdk';

// account for the id in the url

export async function GET(request: Request) {
  try{

    const keypair2 = process.env.KEYPAIR2 as string;

    const admin2Keypair = Keypair.fromSecretKey(base58.decode(keypair2));

    const admin2Wallet = new NodeWallet(admin2Keypair);

    const connection = new Connection(process.env.RPC!, 'confirmed')
    const sdk = new SDK(
      admin2Wallet,
      connection,
      { skipPreflight: true},
      "devnet",
    )

    const collections = await sdk.collection.getAllCollections(
      connection, // connection
    )
    console.log('collections', collections)
    
    if(!collections) {
      return new Response('error', { status: 500 });
    }


    const collection_data = {

    }
    return new Response(JSON.stringify(collections), { status: 200 });
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}
  