import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import base58, * as bs58 from "bs58";
import { SDK } from '@maweiche/react-sdk';

export async function POST(request: Request) {
  try{
    const body = await request.json();
    const id = body.id;
    const publicKey = new PublicKey(body.publicKey);
    const collectionOwner = new PublicKey(body.collectionOwner);
    console.log('buyer: ', publicKey.toBase58())
    console.log('collection owner: ', collectionOwner.toBase58())
    const bearerToken = process.env.BEARER as string;
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

    const createNft = await sdk.nft.createNft(
      connection, // connection
      bearerToken, // bearer
      admin2Keypair.publicKey, // admin
      collectionOwner, // collection owner
      publicKey, // buyer
      id // id
    );
    console.log('nft created, proceeding to burn placeholder')


    return new Response(JSON.stringify(createNft), { status: 200 });
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}