// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import ItemIDL from '../target/idl/item.json';
import type { Item } from '../target/types/item';

// Re-export the generated IDL and type
export { Item, ItemIDL }

// The programId is imported from the program IDL.
export const ITEM_PROGRAM_ID = new PublicKey(ItemIDL.address)

// This is a helper function to get the Item Anchor program.
export function getItemProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...ItemIDL, address: address ? address.toBase58() : ItemIDL.address } as Item, provider)
}

// This is a helper function to get the program ID for the Item program depending on the cluster.
export function getItemProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Item program on devnet and testnet.
      return new PublicKey('37Z9j1LjgPRHLnB3S3cTL7t4mCSsnWmrtUJj5u9eSBQi')
    case 'mainnet-beta':
    default:
      return ITEM_PROGRAM_ID
  }
}
