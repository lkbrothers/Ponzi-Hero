// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CreditIDL from '../target/idl/credit.json';
import type { Credit } from '../target/types/credit';

// Re-export the generated IDL and type
export { Credit, CreditIDL }

// The programId is imported from the program IDL.
export const CREDIT_PROGRAM_ID = new PublicKey(CreditIDL.address)

// This is a helper function to get the Credit Anchor program.
export function getCreditProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...CreditIDL, address: address ? address.toBase58() : CreditIDL.address } as Credit, provider)
}

// This is a helper function to get the program ID for the Credit program depending on the cluster.
export function getCreditProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
        return new PublicKey('AuWH2cCt8bxjRCwiF7eqp81dwxyZvVWspV7ip5SiDkbq')
    case 'testnet':
      // This is the program ID for the Credit program on devnet and testnet.
      // return new PublicKey('B2bJBFBn3swvZz5YrtuuPmXZTbUpddBS3AaPc2WiYxg8')
    case 'mainnet-beta':
    default:
      return CREDIT_PROGRAM_ID
  }
}
