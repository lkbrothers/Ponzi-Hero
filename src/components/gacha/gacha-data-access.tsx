'use client'

import { getGameProgram, getGameProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { getGachaProgram, getGachaProgramId } from 'anchor/src/gacha-exports'

// 가챠 관련 상수
export const NUM_GACHA = 6;
export const NUM_GRADE = 6;
export const NUM_IMAGES = 10;

export const GRADE_NAMES = [
  "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

export const GACHA_WEIGHTS = [
  [60, 25, 10, 4, 1, 0],  // 가챠 0: 가장 낮은 등급 (DEGENDARY 없음)
  [55, 25, 10, 4, 4, 2],  // 가챠 1
  [50, 25, 10, 4, 7, 4],  // 가챠 2
  [45, 25, 10, 4, 9, 7],  // 가챠 3
  [40, 25, 10, 4, 9, 12], // 가챠 4
  [35, 25, 10, 4, 9, 17], // 가챠 5: 가장 높은 등급 (DEGENDARY 있음)
];

export const VALID_IMAGES = [
  // NORMAL images
  "normal0001.png", "normal0002.png", "normal0003.png", "normal0004.png", "normal0005.png",
  "normal0006.png", "normal0007.png", "normal0008.png", "normal0009.png", "normal0010.png",
  // RARE images
  "rare0001.png", "rare0002.png", "rare0003.png", "rare0004.png", "rare0005.png",
  "rare0006.png", "rare0007.png", "rare0008.png", "rare0009.png", "rare0010.png",
  // EPIC images
  "epic0001.png", "epic0002.png", "epic0003.png", "epic0004.png", "epic0005.png",
  "epic0006.png", "epic0007.png", "epic0008.png", "epic0009.png", "epic0010.png",
  // UNIQUE images
  "unique0001.png", "unique0002.png", "unique0003.png", "unique0004.png", "unique0005.png",
  "unique0006.png", "unique0007.png", "unique0008.png", "unique0009.png", "unique0010.png",
  // LEGENDARY images
  "legendary0001.png", "legendary0002.png", "legendary0003.png", "legendary0004.png", "legendary0005.png",
  "legendary0006.png", "legendary0007.png", "legendary0008.png", "legendary0009.png", "legendary0010.png",
  // DEGENDARY images
  "degendary0001.png", "degendary0002.png", "degendary0003.png", "degendary0004.png", "degendary0005.png",
  "degendary0006.png", "degendary0007.png", "degendary0008.png", "degendary0009.png", "degendary0010.png",
];


export function useGachaProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getGachaProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getGachaProgram(provider, programId), [provider, programId])
  // 프로그램 인스턴스 생성 (실제 구현 필요)


  // 모든 가챠 아이템 계정 조회
  const accounts = useQuery({
    queryKey: ['gacha', 'all', { cluster }],
    queryFn: () => program?.account.itemAccount.all() || [],
    enabled: !!program,
  })

  // 프로그램 계정 정보 조회
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  // 가챠 아이템 민팅 함수
  const mintItem = useMutation({
    mutationKey: ['gacha', 'mint', { cluster }],
    mutationFn: async ({ gachaLevel = 0 }: { gachaLevel: number }) => {
      if (!program) throw new Error('프로그램이 초기화되지 않았습니다')
      
      const itemAccount = Keypair.generate()
      
      const signature = await program.methods.mintItem(gachaLevel)
        .accounts({
          owner: provider.publicKey,
          itemAccount: itemAccount.publicKey,
        })
        .signers([itemAccount])
        .rpc()
        
      const mintedItemAccount = await program.account.itemAccount.fetch(itemAccount.publicKey)
      
      return {
        signature,
        itemAccount,
        mintedItemAccount
      }
    },
    onSuccess: (result) => {
      transactionToast(result.signature)
      toast.success(`${result.mintedItemAccount.grade} 등급 아이템을 획득했습니다!`)
      return accounts.refetch()
    },
    onError: () => toast.error('가챠 아이템 민팅에 실패했습니다'),
  })

  const allNft = useQuery({
    queryKey: ['gacha', 'allNft', { cluster }],
    queryFn: async () => {
      if (!program || !provider.publicKey) return []
      
      const filters = [{
        memcmp: {
          offset: 8, // 소유자 필드의 오프셋
          bytes: provider.publicKey.toString(),
        }
      }]
      
      // 현재 사용자가 소유한 모든 NFT 계정 조회
      return program.account.itemAccount.all(filters)
    },
    enabled: !!program && !!provider.publicKey,
  })
  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    mintItem,
    allNft,
  }
}

// 특정 가챠 아이템 계정 정보 조회 훅
export function useGachaItemAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const { program } = useGachaProgram()

  const itemQuery = useQuery({
    queryKey: ['gacha', 'fetch', { cluster, account }],
    queryFn: () => program?.account.itemAccount.fetch(account),
    enabled: !!program && !!account,
  })

  return {
    item: itemQuery.data,
    isLoading: itemQuery.isLoading,
    refetch: itemQuery.refetch,
  }
}
