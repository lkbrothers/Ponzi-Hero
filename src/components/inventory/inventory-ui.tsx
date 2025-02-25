'use client'

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { AppHero } from '@/components/ui/ui-layout'
import { useEffect, useState } from 'react'
import { LAMPORTS_PER_SOL, ParsedAccountData } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'

export default function Page() {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number>(0)
  const [tokens, setTokens] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])

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

      // NFT 계정 조회
      const nftAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })

      // NFT 필터링 (수량이 1이고 소수점이 0인 토큰)
      const nftList = nftAccounts.value.filter(account => {
        const tokenAmount = (account.account.data as ParsedAccountData).parsed.info.tokenAmount
        return tokenAmount.uiAmount === 1 && tokenAmount.decimals === 0
      })

      setNfts(nftList)
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
    <div className="flex flex-col gap-8">
        <div className="flex flex-row items-center gap-8">
            <WalletInfo balance={balance} publicKey={publicKey} />
            <NFTList nfts={nfts} />
        </div>
      <div className="flex flex-row items-center gap-8">
        <Equipments />
        <Inventory tokens={tokens} nfts={nfts} />
      </div>
    </div>
  )
}

export function Equipments() {
    return (
        <div className="flex flex-col items-center gap-2 w-1/2">
            <h2 className="text-xl font-bold">장비</h2>
            <div className="grid grid-cols-3 gap-2 w-48">
                <div className="col-start-2">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        Head
                    </div>
                </div>
                <div className="col-start-1 col-span-1">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        L-Hand
                    </div>
                </div>
                <div className="col-start-2 col-span-1">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        Body
                    </div>
                </div>
                <div className="col-start-3 col-span-1">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        R-Hand
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Inventory({ tokens, nfts }: { tokens: any[], nfts: any[] }) {
    return (
        <div className="flex flex-col items-center gap-8 w-1/2">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold">인벤토리</h2>
                
                <div className="grid grid-cols-4 gap-4">
                    {tokens.length > 0 ? tokens.map((token, i) => (
                        <div key={i} className="w-16 h-16 border-2 border-gray-400 rounded flex items-center justify-center">
                            <div className="text-xs text-center">
                                <p>수량: {(token.account.data as ParsedAccountData).parsed.info.tokenAmount.uiAmount}</p>
                            </div>
                        </div>
                    )) : [...Array(20)].map((_, i) => (
                        <div key={i} className="w-16 h-16 border-2 border-gray-400 rounded flex items-center justify-center">
                            {/* NFT 아이템이 들어갈 자리 */}
                        </div>
                    ))}
                </div>



                <div className="flex gap-4 mt-4">
                    <button className="btn btn-primary">이전</button>
                    <button className="btn btn-primary">다음</button>
                </div>
            </div>
        </div>
    )
}
export function NFTList({ nfts }: { nfts: any[] }) {
    return (
        <div>
            <h2 className="text-xl font-bold mt-8">NFT</h2>
            <div className="grid grid-cols-4 gap-4">
                {nfts.length > 0 ? nfts.map((nft, i) => (
                    <div key={i} className="w-16 h-16 border-2 border-gray-400 rounded flex items-center justify-center">
                        <div className="text-xs text-center">
                            <p>NFT #{i + 1}</p>
                            <p>{(nft.account.data as ParsedAccountData).parsed.info.mint.slice(0, 4)}</p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-4 text-center">
                        <p>보유한 NFT가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export function WalletInfo({ balance, publicKey }: { balance: number; publicKey: PublicKey | null }) {
  return (
    <div className="card bg-base-200 p-6">
      <h2 className="text-2xl font-bold mb-4">지갑 정보</h2>
      <p>SOL 잔액: {balance.toFixed(4)} SOL</p>
      <p>지갑 주소: {publicKey?.toString()}</p>
    </div>
  )
}