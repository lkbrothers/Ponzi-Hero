// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TransferIDL from '../target/idl/transfer.json';
import type { Transfer } from '../target/types/transfer';

// Re-export the generated IDL and type
export { Transfer, TransferIDL }

// The programId is imported from the program IDL.
export const TRANSFER_PROGRAM_ID = new PublicKey(TransferIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getTransferProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...TransferIDL, address: address ? address.toBase58() : TransferIDL.address } as Transfer, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getTransferProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('6LDk9tvtR5hoSp1QYZHsqdrVHv32tac6r8NYXjJam1M5')
    case 'mainnet-beta':
    default:
      return TRANSFER_PROGRAM_ID
  }
}
