import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import base58, * as bs58 from "bs58";
import { SDK } from '@maweiche/react-sdk';

// account for the id in the url

export async function POST(request: Request) {
  try{
    const body = await request.json();
    const owner = new PublicKey(body.owner);
    console.log('incoming owner', owner)
    const keypair2 = process.env.KEYPAIR2 as string;
    const keypair3 = process.env.KEYPAIR3 as string;

    const admin2Keypair = Keypair.fromSecretKey(base58.decode(keypair2));
    const admin3KeyPair = Keypair.fromSecretKey(base58.decode(keypair3))

    const admin2Wallet = new NodeWallet(admin2Keypair);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    const sdk = new SDK(
      admin2Wallet,
      connection,
      { skipPreflight: true},
      "devnet",
    )
    const programID = sdk.program.programId;
    const collection = await sdk.collection.getCollectionByOwner(
      connection, // connection
      owner // owner
    )
    console.log('collection', collection)
    
    if(!collection) {
      return new Response('error', { status: 500 });
    }

    const collection_data = {
      name: collection.name,
      symbol: collection.symbol,
      owner: collection.owner.toBase58(),
      saleStartTime: collection.saleStartTime.toString(),
      maxSupply: collection.maxSupply.toString(),
      totalSupply: collection.totalSupply.toString(),
      price: collection.price.toString(),
      stableId: collection.stableId,
      reference: collection.reference,
      whitelist: collection.whitelist.wallets.map((wallet: PublicKey) => wallet.toBase58()),
      whitelistStartTime: collection.whitelistStartTime.toString(),
      whitelistPrice: collection.whitelistPrice.toString()
    
    }
    console.log('programid', programID)
    return new Response(JSON.stringify(collection_data), { status: 200 });
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}
  