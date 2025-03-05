// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import PlayIDL from '../target/idl/play.json';
import type { Play } from '../target/types/play';

// Re-export the generated IDL and type
export { Play, PlayIDL }

// The programId is imported from the program IDL.
export const PLAY_PROGRAM_ID = new PublicKey(PlayIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getPlayProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...PlayIDL, address: address ? address.toBase58() : PlayIDL.address } as Play, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getPlayProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('9nb1AEZzVaC1VvoQAUoDJTuZK3x2uZDQ2cZd3tuAQwzC')
    case 'mainnet-beta':
    default:
      return PLAY_PROGRAM_ID
  }
}
