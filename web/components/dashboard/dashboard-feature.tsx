'use client';

import { AppHero } from '../ui/ui-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { SDK } from '@solai/react-sdk';
import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';

export default function DashboardFeature() {
  const { publicKey, sendTransaction } = useWallet();
  const id = Math.floor(Math.random() * 100000);

  async function mintNft(){
    try {
      console.log('publicKey', publicKey?.toBase58());
      const _tx = await fetch('/api/mint', {
        method: 'POST',
        body: JSON.stringify({ id: id, publicKey: publicKey?.toBase58()}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const connection = new Connection('https://devnet.helius-rpc.com/?api-key=b7faf1b9-5b70-4085-bf8e-a7be3e3b78c2', 'confirmed')
      console.log('tx', _tx)
      const _txJson = await _tx.json();

      const tx = Transaction.from(Buffer.from(_txJson, "base64"));
      const signature = await sendTransaction(tx, connection, {skipPreflight: true});
      console.log('signature', signature);
      if(signature) {
        const _response = await fetch('/api/finalize', {
          method: 'POST',
          body: JSON.stringify({ id: id, publicKey: publicKey?.toBase58()}),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const response = await _response.json();
        console.log('response', response);
        console.log(`View NFT: https://solscan.io/token/${response.nft_mint}?cluster=devnet`)
      }
    } catch (error) {
      console.log('error', error)
    }
  };

  return (
    <div>
      <AppHero title="gm" subtitle="Say hi to your new Solana dApp." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          {publicKey ? (
          <button
            onClick={mintNft}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mint NFT
          </button>
          ) : (
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect Wallet
            </button>
          
          )}
        </div>
      </div>
    </div>
  );
}
