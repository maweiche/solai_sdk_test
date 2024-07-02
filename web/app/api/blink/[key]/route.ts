import { prepareTransaction } from '../../../../helpers/transaction-utils';
import * as anchor from "@coral-xyz/anchor";
import {
    SYSVAR_INSTRUCTIONS_PUBKEY,
    PublicKey,
    SystemProgram,
    Keypair,
    Transaction,
    Connection,
    VersionedTransaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
    ActionsSpecGetResponse,
    ActionsSpecPostRequestBody,
    ActionsSpecPostResponse,
} from '../../../../helpers/spec/actions-spec';
  import { 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    TOKEN_2022_PROGRAM_ID, 
    TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddressSync, 
 } from "@solana/spl-token";
import * as b58 from "bs58";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { SDK } from '@maweiche/react-sdk';
import dotenv from 'dotenv';
  const DONATION_DESTINATION_WALLET =
    '7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n';
  const DONATION_AMOUNT_SOL_OPTIONS = [1, 5, 10];
  const DEFAULT_DONATION_AMOUNT_SOL = 1;

  export async function POST( request: Request ) {
    try{
    // WALLETS
    const _keypair = process.env.KEYPAIR2
    const userKeypair = Keypair.fromSecretKey(b58.decode(_keypair!));
    console.log('userKeypair', userKeypair.publicKey.toBase58());
    const userWallet = new NodeWallet(userKeypair);

    const _keypair2 = process.env.KEYPAIR2
    const admin2Keypair = Keypair.fromSecretKey(b58.decode(_keypair2!))
    const admin2Wallet = new NodeWallet(admin2Keypair);
    console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());

    const _keypair3 = process.env.KEYPAIR3
    const admin3KeyPair = Keypair.fromSecretKey(b58.decode(_keypair3!));
    const admin3Wallet = new NodeWallet(admin3KeyPair);
    console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());
    // const connection = new Connection("http://localhost:8899", "finalized");
    // SDK  
    const sdk = new SDK(
        userWallet as NodeWallet,
        new Connection("https://api.devnet.solana.com", "confirmed"),
        { skipPreflight: true},
        "devnet",
    );

    //  PROGRAM AND ADDRESSES
    const program = sdk.program;
    
    const collection_owner = admin2Wallet.publicKey;
    const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
    console.log('collection pda', collection.toBase58());
    const id = Math.floor(Math.random() * 100000);
    const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];

    const nft = PublicKey.findProgramAddressSync([Buffer.from('ainft'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
    
    console.log('placeholder collection owner', collection_owner.toBase58());
    const { account } = await request.json() as ActionsSpecPostRequestBody;
    const buyer = new PublicKey(account);
    console.log('buyer', buyer.toBase58());


    const placeholder_tx = await sdk.placeholder.createPlaceholder(
        sdk.rpcConnection,
        userKeypair.publicKey,
        collection_owner,
        buyer,
        id,
    );

    console.log('placeholder_tx', placeholder_tx);

    const _tx = await sdk.nft.createNft(
        sdk.rpcConnection,  // connection: Connection,
        process.env.BEARER!, // bearer
        userKeypair.publicKey, // admin
        collection_owner, // collection owner
        buyer, // buyer   
        id 
    ); 

        
    const instructions = [
        ...placeholder_tx.instructions, 
        ..._tx.instructions
    ];
    const transaction = await prepareTransaction(instructions, buyer);
    console.log('admin2Wallet signing', admin2Wallet.publicKey.toBase58());
    transaction.sign([admin2Keypair])
    const base64 = Buffer.from(transaction.serialize()).toString('base64');
    const response: ActionsSpecPostResponse = {
        transaction: base64,
    };

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
            'content-type': 'application/json; charset=UTF-8'
        }
    });

    

    } catch (e) {
        console.log(e);
        throw e;
    }
};


export async function GET(_: Request, { params }: { params: { key : number } }) {
    try {
        console.log('route pinged')
        function getDonateInfo(): Pick<
            ActionsSpecGetResponse,
            'icon' | 'title' | 'description'
        > {
            const icon =
            'https://artsn.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FAudemars-piguet-Royaloak.b2100923.webp&w=1080&q=75';
            const title = 'Audemar Piguet Royal Oak';
            const description =
            'Buy a share of this Audemar Piguet Royal Oak watch for 1 USDC-DEV. You will receive a fraction of the watch in return.';
            return { icon, title, description };
        }
        
        const { icon, title, description } = getDonateInfo();
        const amountParameterName = 'amount';
        const response: ActionsSpecGetResponse = {
            icon,
            label: `${params.key} SOL`,
            title,
            description,
          };

        console.log('response', response);
        const res = new Response(
            JSON.stringify(response), {
                status: 200,
                headers: {
                    'access-control-allow-origin': '*',
                    'content-type': 'application/json; charset=UTF-8'
                }
            }
        );
        console.log('res', res);
        return res
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function OPTIONS(_: Request) {
    return new Response(null, {
        headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET, POST, OPTIONS',
            'access-control-allow-headers': 'Content-Type',
        },
    });
};