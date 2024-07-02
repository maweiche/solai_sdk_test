import { prepareTransaction } from '../../../helpers/transaction-utils';
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
} from '../../../helpers/spec/actions-spec';
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
dotenv.config()
  const DONATION_DESTINATION_WALLET =
    '7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n';
  const DONATION_AMOUNT_SOL_OPTIONS = [1.5];
  const DEFAULT_DONATION_AMOUNT_SOL = 1;

export async function POST( request: Request ) {
    try{
    const _keypair = require('../test-wallet/keypair2.json');
    const userKeypair = Keypair.fromSecretKey(Uint8Array.from(_keypair))
    console.log('userKeypair', userKeypair.publicKey.toBase58());
    const userWallet = new NodeWallet(userKeypair);
    const sdk = new SDK(
        userWallet as NodeWallet,
        new Connection("https://api.devnet.solana.com", "confirmed"),
        { skipPreflight: true},
        "devnet",
    );
    const program = sdk.program;
    const _keypair2 = require('../test-wallet/keypair.json')
    const admin2Keypair = Keypair.fromSecretKey(Uint8Array.from(_keypair2))
    const admin2Wallet = new NodeWallet(admin2Keypair);
    console.log('admin2Wallet', admin2Wallet.publicKey.toBase58());

    const _keypair3 = require('../test-wallet/keypair3.json')
    const admin3KeyPair = Keypair.fromSecretKey(Uint8Array.from(_keypair3))
    const admin3Wallet = new NodeWallet(admin3KeyPair);
    console.log('admin3Wallet', admin3Wallet.publicKey.toBase58());

    const collection_owner = userWallet.publicKey;
    // const collection = PublicKey.findProgramAddressSync([Buffer.from('collection'), collection_owner.toBuffer()], program.programId)[0];
    const collection = new PublicKey('EXRsEGgA93BNX6GJpxYBzcUGqqLxE7sR7NYoFa2FNRDa')

    const id = Math.floor(Math.random() * 100000);
    const placeholder = PublicKey.findProgramAddressSync([Buffer.from('placeholder'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
    const placeholder_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), placeholder.toBuffer()], program.programId)[0];

    const nft = PublicKey.findProgramAddressSync([Buffer.from('ainft'), collection.toBuffer(), new anchor.BN(id).toBuffer("le", 8)], program.programId)[0];
    const nft_mint = PublicKey.findProgramAddressSync([Buffer.from('mint'), nft.toBuffer()], program.programId)[0];
    
    const auth = PublicKey.findProgramAddressSync([Buffer.from('auth')], program.programId)[0];
    const adminState = PublicKey.findProgramAddressSync([Buffer.from('admin_state'), userWallet.publicKey.toBuffer()], program.programId)[0];
    console.log('placeholder collection owner', collection_owner.toBase58());

    const placeholder_tx = await sdk.placeholder.createPlaceholder(
        sdk.rpcConnection,
        userKeypair.publicKey,
        collection_owner,
        admin2Wallet.publicKey,
        id,
    );

    async function getCollectionUrl(collection: PublicKey) {
        const collection_data = await sdk.rpcConnection.getAccountInfo(collection);
        const collection_decode = program.coder.accounts.decode("collection", collection_data!.data);
        // console.log('collection_decode', collection_decode)
        return collection_decode.url;
      };
    const url = await getCollectionUrl(collection);
    
    const _tx = await sdk.nft.createNft(
        sdk.rpcConnection,  // connection: Connection,
        "ad4a356ddba9eff73cd627f69a481b8493ed975d7aac909eec4aaebdd9b506ef", // bearer
        userKeypair.publicKey, // admin
        collection_owner, // collection owner
        admin2Wallet.publicKey, // buyer   
        id 
    ); // returns base64 string

        
        const instructions = [...placeholder_tx.instructions, ..._tx.instructions];
        const transaction = await prepareTransaction(instructions, admin2Wallet.publicKey);
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


export async function GET( request: Request ) {
    try {
        console.log('route pinged')
        function getDonateInfo(): Pick<
            ActionsSpecGetResponse,
            'icon' | 'title' | 'description'
        > {
            const icon =
            'https://devnet.irys.xyz/9gdv51JL7p1dtf8Y79og8pJ5s_4tkKYvjMpzcE_moYU';
            const title = 'SolAI Test Blink';
            const description =
            'Get a NFT from the SolAI Test Collection. All proceeds go to the SolAI Test Collection.';
            return { icon, title, description };
        }
        
        const { icon, title, description } = getDonateInfo();
        const amountParameterName = 'amount';
        const response: ActionsSpecGetResponse = {
            icon,
            label: `${DEFAULT_DONATION_AMOUNT_SOL} SOL`,
            title,
            description,
            links: {
            actions: [
                ...DONATION_AMOUNT_SOL_OPTIONS.map((amount) => ({
                label: `${amount} SOL`,
                href: `/api/blink/1`,
                })),
                // {
                // href: `/api/blink/{${amountParameterName}}`,
                // label: 'Buy',
                // parameters: [
                //     {
                //     name: amountParameterName,
                //     label: 'Enter a custom SOL amount',
                //     },
                // ],
                // },
            ],
            },
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

export async function OPTIONS( request: Request ) {
    return new Response(null, {
        headers: {
            'access-control-allow-origin': '*',
            'content-type': 'application/json; charset=UTF-8'
        }
    });
};