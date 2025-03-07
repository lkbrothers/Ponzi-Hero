'use client'

import { PublicKey } from '@solana/web3.js'

export function WalletInfo({ balance, publicKey }: { balance: number; publicKey: PublicKey | null }) {
  return (
    <div className="card bg-base-200 p-6">
      <h2 className="text-2xl font-bold mb-4">지갑 정보</h2>
      <p>SOL 잔액: {balance.toFixed(4)} SOL</p>
      <p>지갑 주소: {publicKey?.toString()}</p>
    </div>
  )
}