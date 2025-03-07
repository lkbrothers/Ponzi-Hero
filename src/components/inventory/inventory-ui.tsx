'use client'

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { AppHero } from '@/components/ui/ui-layout'
import { useEffect, useState } from 'react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'

// 분리된 컴포넌트 임포트
import { Equipments } from './equipment/equipment-ui'
import { Inventory } from './items/item-ui'
import { WalletInfo } from './wallet/wallet-info'

// 더미 데이터 임포트
import { DUMMY_NFTS } from './data/dummy-data'

export default function Page() {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number>(0)
  const [tokens, setTokens] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])
  const [equippedItems, setEquippedItems] = useState<{[key:string]: any}>({
    Head: null,
    Body: null,
    'L-Hand': null,
    'R-Hand': null
  })

  useEffect(() => {
    if (!connected || !publicKey) return

    const fetchWalletData = async () => {
      // SOL 잔액 조회
      const bal = await connection.getBalance(publicKey)
      setBalance(bal / LAMPORTS_PER_SOL)

      // 토큰 계정 조회
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })

      setTokens(tokenAccounts.value)

      // 개발 환경에서는 더미 NFT 데이터 사용
      setNfts(DUMMY_NFTS)
    }

    fetchWalletData()
  }, [connected, publicKey, connection])

  if (!connected) {
    return (
      <AppHero
        title="지갑을 연결해주세요"
        subtitle="지갑을 연결하면 보유한 자산을 확인할 수 있습니다."
      />
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-row items-center gap-8">
            <WalletInfo balance={balance} publicKey={publicKey} />
        </div>
      <div className="flex flex-row items-center gap-8">
        <Equipments equippedItems={equippedItems} />
        <Inventory tokens={tokens} nfts={nfts} equippedItems={equippedItems} setEquippedItems={setEquippedItems} />
      </div>
    </div>
  )
}