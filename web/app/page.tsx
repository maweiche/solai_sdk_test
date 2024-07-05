'use client'
import { useState, useEffect } from 'react';
import * as anchor from '@project-serum/anchor';
import { AppHero } from '../components/ui/ui-layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { SDK } from '@maweiche/react-sdk';
import { Keypair, Connection, PublicKey, Transaction, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from '@solana/web3.js';

export type Collection = {
  owner: string;
  maxSupply: number;
  name: string;
  price: string;
  reference: string;
  saleStartTime: string;
  stableId: string;
  symbol: string;
  totalSupply: string;
  whitelist: {
    wallets: string[];
  }
  whitelistPrice: string;
  whitelistStartTime: string;
};

export default function Page() {
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [owner, setOwner] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [sale_start_time, setSaleStartTime] = useState<number>(0);
  const [max_supply, setMaxSupply] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [stable_id, setStableId] = useState<string>('');
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [whitelist_start_time, setWhitelistStartTime] = useState<number>(0);
  const [whitelist_price, setWhitelistPrice] = useState<number>(0);
  
  const { publicKey, sendTransaction } = useWallet();
  const id = Math.floor(Math.random() * 100000);
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

  async function mintNft(){
    try {
      console.log('publicKey', publicKey?.toBase58());
      const _tx = await fetch('/api/mint', {
        method: 'POST',
        body: JSON.stringify({ id: id, collectionOwner: selectedCollection, publicKey: publicKey?.toBase58()}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('tx', _tx)
      const _txJson = await _tx.json();

      const tx = Transaction.from(Buffer.from(_txJson, "base64"));
      const signature = await sendTransaction(tx, connection, {skipPreflight: true});
      console.log('signature', signature);
      if(signature) {
        const _response = await fetch('/api/finalize', {
          method: 'POST',
          body: JSON.stringify({ id: id, collectionOwner: selectedCollection, publicKey: publicKey?.toBase58()}),
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

  async function getCollectionByOwner(owner: string){
    try{
      const _collection = await fetch('/api/collections/get/owner', {
        method: 'POST',
        body: JSON.stringify({ owner: owner}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const _collectionJson = await _collection.json();
      console.log('collection', _collectionJson);
    } catch (error) {
      console.log('error', error)
    }
  }

  async function getAllCollections(){
    try{
      const _collections = await fetch('/api/collections/get/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const _collectionsJson = await _collections.json();
      console.log('collections', _collectionsJson[0].name);
      _collectionsJson.map((collection: Collection) => {
        console.log('collection', collection);
      });
      setAllCollections(_collectionsJson);
    } catch (error) {
      console.log('error', error)
    }
  };

  async function createNewCollection(){
    try{
      const whitelist_as_pubkeys: PublicKey[] = [];
      if(whitelist.length > 0){
        for(let i = 0; i < whitelist.length; i++){
          whitelist_as_pubkeys.push(new PublicKey(whitelist[i]));
        }
      }
      const _collection = await fetch('/api/collections/create', {
        method: 'POST',
        body: JSON.stringify({ 
          owner: publicKey?.toBase58(),
          name: name,
          symbol: symbol,
          sale_start_time: sale_start_time,
          max_supply: max_supply,
          price: price,
          stable_id: stable_id,
          whitelist: whitelist_as_pubkeys,
          whitelist_start_time: whitelist_start_time ? whitelist_start_time : undefined,
          whitelist_price: whitelist_price ? whitelist_price : undefined,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const _txJson = await _collection.json();
      const tx = Transaction.from(Buffer.from(_txJson, "base64"));
      const signature = await sendTransaction(tx, connection, {skipPreflight: true});
      console.log('signature', signature);
    } catch (error) {
      console.log('error', error)
    }
  };

  useEffect(() => {
    getAllCollections();
  }, [])


  return (
    <div>
      <AppHero title="gm" subtitle="Say hi to your new Solana dApp." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          {publicKey && (
            <div className="flex flex-col border-2 gap-6 p-6">
              <h1 className="text-xl font-bold">All Collections</h1>
              {allCollections.length > 0 && (
                <div className="flex flex-row gap-2">
                  {allCollections.map((collection: Collection, index) => (
                    <div key={index} className="flex flex-col gap-2"  onClick={()=> setSelectedCollection(collection.owner)}
                      style={{
                        border: selectedCollection === collection.owner ? '2px solid #2563EB' : '2px solid #E5E7EB',
                      }}
                    >
                      <h3 className="text-lg font-bold">Collection {index + 1}</h3>
                      <div>{collection.name}</div>
                      <h3 className="text-lg font-bold">Symbol</h3>
                      <div>{collection.symbol}</div>
                      <h3 className="text-lg font-bold">Owner</h3>
                      <div>{collection.owner.slice(0,4)}...{collection.owner.slice(-4)}</div>
                      <h3 className="text-lg font-bold">Max Supply</h3>
                      <div>{collection.maxSupply}</div>
                      <h3 className="text-lg font-bold">Price</h3>
                      <div>{collection.price}</div>
                      <h3 className="text-lg font-bold">Reference</h3>
                      <div>{collection.reference.slice(0,4)}...{collection.reference.slice(-4)}</div>
                      <h3 className="text-lg font-bold">Sale Start Time</h3>
                      <div>{new Date(parseInt(collection.saleStartTime)).toLocaleString()}</div>
                      <h3 className="text-lg font-bold">Stable ID</h3>
                      <div>{collection.stableId}</div>
                      <h3 className="text-lg font-bold">Total Supply</h3>
                      <div>{collection.totalSupply}</div>                     
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={getAllCollections}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Get All Collections
              </button>

              {selectedCollection ? (
                <button
                  onClick={mintNft}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Mint NFT
                </button>
                ) : (
                  <p>
                    Please select a collection to mint an NFT
                  </p>
                )}
            </div>
          )}

          {publicKey && (
            <div className="flex flex-col border-2 p-6">
              <input
                type="text"
                value={owner}
                onChange={(e)=>setOwner(e.target.value)}
                placeholder="Owner"
                className="border border-gray-300 rounded-md p-2"
              />
              <button
                onClick={()=>getCollectionByOwner(owner)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Get Collection By Owner
              </button>
            </div>
          )}

          {publicKey && (
            <div className="flex flex-col border-2 p-6">
              <input
                type="text"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Name"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                value={symbol}
                onChange={(e)=>setSymbol(e.target.value)}
                placeholder="Symbol"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="number"
                value={sale_start_time}
                onChange={(e)=>setSaleStartTime(parseInt(e.target.value))}
                placeholder="Sale Start Time"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="number"
                value={max_supply}
                onChange={(e)=>setMaxSupply(parseInt(e.target.value))}
                placeholder="Max Supply"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="number"
                value={price}
                onChange={(e)=>setPrice(parseInt(e.target.value))}
                placeholder="Price"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                value={stable_id}
                onChange={(e)=>setStableId(e.target.value)}
                placeholder="Stable ID"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="text"
                value={whitelist}
                onChange={(e)=>setWhitelist(e.target.value.split(','))}
                placeholder="Whitelist"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="number"
                value={whitelist_start_time}
                onChange={(e)=>setWhitelistStartTime(parseInt(e.target.value))}
                placeholder="Whitelist Start Time"
                className="border border-gray-300 rounded-md p-2"
              />
              <input
                type="number"
                value={whitelist_price}
                onChange={(e)=>setWhitelistPrice(parseInt(e.target.value))}
                placeholder="Whitelist Price"
                className="border border-gray-300 rounded-md p-2"
              />
              <button
                onClick={createNewCollection}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Collection
              </button>
            </div>
          )}  

        </div>
      </div>
    </div>
  );
  
}
