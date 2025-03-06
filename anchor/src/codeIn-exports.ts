// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CodeInIDL from '../target/idl/code_in.json'
import type { CodeIn } from '../target/types/code_in'

// Re-export the generated IDL and type
export { CodeIn, CodeInIDL }

// The programId is imported from the program IDL.
export const CODE_IN_PROGRAM_ID = new PublicKey(CodeInIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getCodeInProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...CodeInIDL, address: address ? address.toBase58() : CodeInIDL.address } as CodeIn, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getCodeInProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('4Sz8xKjDR3tmb24HhMJjLYcLH2B6pmNPcbTUeYwYubUk')
    case 'mainnet-beta':
    default:
      return CODE_IN_PROGRAM_ID
  }
}
