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
import { useInventoryItems } from './items/item-data-access';
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

  const { fetchUserItems } = useInventoryItems();

  useEffect(() => {
    if (!connected || !publicKey) return

    const fetchWalletData = async () => {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })

      setTokens(tokenAccounts.value)

      const userItems = await fetchUserItems();
      setNfts(userItems);
    }

    fetchWalletData()
  }, [connected, publicKey, connection])

  // 장착된 아이템 로드를 위한 새로운 useEffect 추가
  useEffect(() => {
    const loadEquippedItems = () => {
      let equippedItemsMap = new Map();
      let result = {
        Head: null,
        Body: null,
        'L-Hand': null, 
        'R-Hand': null
      };

      // 장착된 아이템 먼저 처리
      nfts.forEach((nft) => {
        if (nft.account.equipped) {
          const part = nft.account.part.toLowerCase();
          
          if (part === 'head' && !result.Head) {
            result.Head = nft;
            equippedItemsMap.set(nft.publicKey.toString(), true);
          } else if (part === 'body' && !result.Body) {
            result.Body = nft;
            equippedItemsMap.set(nft.publicKey.toString(), true);
          } else if (part === 'arms') {
            if (!result['L-Hand']) {
              result['L-Hand'] = nft;
              equippedItemsMap.set(nft.publicKey.toString(), true);
            } else if (!result['R-Hand']) {
              result['R-Hand'] = nft;
              equippedItemsMap.set(nft.publicKey.toString(), true);
            }
          }
        }
      });

      // 맵에 없는 장착된 아이템 처리
      nfts.forEach((nft) => {
        if (nft.account.equipped && !equippedItemsMap.has(nft.publicKey.toString())) {
          const part = nft.account.part.toLowerCase();
          
          if (part === 'head' && !result.Head) {
            result.Head = nft;
          } else if (part === 'body' && !result.Body) {
            result.Body = nft;
          } else if (part === 'arms') {
            if (!result['L-Hand']) {
              result['L-Hand'] = nft;
            } else if (!result['R-Hand']) {
              result['R-Hand'] = nft;
            }
          }
        }
      });

      return result;
    }

    const loadedEquippedItems = loadEquippedItems();
    setEquippedItems(loadedEquippedItems);
  }, [nfts]);

  if (!connected) {
    return (
      <AppHero
        title="지갑을 연결해주세요"
        subtitle="지갑을 연결하면 보유한 자산을 확인할 수 있습니다."
      />
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full h-[55vh] justify-center items-center ">

      <div className="flex flex-row w-[90%] items-center gap-8 bg-[#] py-4">
        <Equipments equippedItems={equippedItems} />
        <Inventory tokens={tokens} nfts={nfts} setNfts={setNfts} equippedItems={equippedItems} setEquippedItems={setEquippedItems} />
      </div>
    </div>
  )
}