'use client'

import { Keypair, Cluster, PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

import gachaImg from '../../assets/gachaBtnNoBg.png'
import nftimg from '../../assets/nft.png'
import nftimg2 from '../../assets/nft2.png'
import nftimg3 from '../../assets/nft3.png'

export function useGachaProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()

  const accounts = useQuery({
    queryKey: ['gacha', 'all', { cluster }],
    queryFn: () => [],
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(new PublicKey('11111111111111111111111111111111')),
  })

  return {
    accounts,
    getProgramAccount,
  }
}

export function GachaExplain(){
    return (
        <div className="flex flex-col gap-4">
            <button className="btn btn-lg btn-primary w-full text-2xl font-bold">How it works?</button>
            <button className="btn btn-lg btn-primary w-full text-2xl font-bold">Check my history</button>
        </div>
    )
}

// NFT 결과 모달 컴포넌트
function GachaResultModal({ nft, onClose, onRetry }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">가챠 결과</h2>
        <div className="flex flex-col items-center gap-4 mb-4">
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-48 h-48 object-cover rounded"
          />
          <div className="text-center">
            <h3 className="text-xl font-bold">{nft.name}</h3>
            <p className="text-sm text-gray-600">{nft.description}</p>
            <p className="text-sm text-gray-600">등급: {nft.grade}</p>
            <p className="text-sm text-gray-600">타입: {nft.type}</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <button className="btn btn-primary" onClick={onRetry}>다시 뽑기</button>
          <button className="btn" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  )
}

export function GachaCreate() {
  const { connected } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [gachaResult, setGachaResult] = useState(null)

  // 랜덤 NFT 생성 함수
  const generateRandomNFT = () => {
    const nftImages = [nftimg.src, nftimg2.src, nftimg3.src]
    const grades = ['일반', '희귀', '전설', '에픽']
    const types = ['머리', '몸통', '무기', '장신구']
    
    return {
      name: `랜덤 NFT #${Math.floor(Math.random() * 1000)}`,
      image: nftImages[Math.floor(Math.random() * nftImages.length)],
      description: '가챠에서 획득한 랜덤 아이템입니다.',
      grade: grades[Math.floor(Math.random() * grades.length)],
      type: types[Math.floor(Math.random() * types.length)],
      mint: `NFT${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    }
  }

  const handleGachaClick = () => {
    if (connected) {
      const randomNFT = generateRandomNFT()
      setGachaResult(randomNFT)
      setShowModal(true)
      console.log('가챠 결과:', randomNFT)
    }
  }

  const handleRetry = () => {
    const randomNFT = generateRandomNFT()
    setGachaResult(randomNFT)
    console.log('다시 뽑기 결과:', randomNFT)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  return (
    <>
      <button
        className="text-2xl font-bold"
        disabled={!connected}
        onClick={handleGachaClick}
      >
        {connected ? 
          <img src={gachaImg.src} alt="gacha" className="w-full h-full object-cover" />
        : '지갑을 연결해주세요'}
      </button>
      
      {showModal && gachaResult && (
        <GachaResultModal 
          nft={gachaResult} 
          onClose={handleClose} 
          onRetry={handleRetry} 
        />
      )}
    </>
  )
}

export function GachaList() {
  const { accounts, getProgramAccount } = useGachaProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>프로그램 계정을 찾을 수 없습니다. 프로그램이 배포되었고 올바른 클러스터에 있는지 확인하세요.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <div key={account.publicKey.toString()} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">가챠 #{account.publicKey.toString().slice(0, 8)}</h2>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">뽑기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>가챠가 없습니다</h2>
          위에서 새로운 가챠를 생성해주세요.
        </div>
      )}
    </div>
  )
}
