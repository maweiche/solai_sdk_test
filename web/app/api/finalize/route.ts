import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import base58, * as bs58 from "bs58";
import { SDK } from '@solai/react-sdk';

export async function POST(request: Request) {
  try{
    const body = await request.json();
    const id = body.id;
    const publicKey = new PublicKey(body.publicKey);

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
      "https://amin.stable-dilution.art/nft/item/generation/3/11/0xf75e77b4EfD56476708792066753AC428eB0c21c", // url for ai image
      "ad4a356ddba9eff73cd627f69a481b8493ed975d7aac909eec4aaebdd9b506ef", // bearer
      admin2Keypair, // admin
      admin3KeyPair.publicKey, // collection owner
      publicKey, // buyer
    );

    const collection_owner = admin3KeyPair.publicKey;
    const burnPlaceholder = await sdk.placeholder.burnPlaceholder(
        connection, // connection
        id, // id
        admin2Keypair,  // admin
        publicKey, // buyer
        collection_owner  // collection owner
    );

    return new Response(JSON.stringify(createNft), { status: 200 });
  } catch (error) {
    console.log('error', error)
    return new Response('error', { status: 500 });
  }
}
  