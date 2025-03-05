// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import GameIDL from '../target/idl/game.json';
import type { Game } from '../target/types/game';

// Re-export the generated IDL and type
export { Game, GameIDL }

// The programId is imported from the program IDL.
export const GAME_PROGRAM_ID = new PublicKey(GameIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getGameProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...GameIDL, address: address ? address.toBase58() : GameIDL.address } as Game, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getGameProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('CoatTNmx2psjiC1yq34435qDtbHCLBLcdReJTLqAqrxL')
    case 'mainnet-beta':
    default:
      return GAME_PROGRAM_ID
  }
}
