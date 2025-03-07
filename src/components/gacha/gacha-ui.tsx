'use client'

import { Keypair, Cluster, PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { useGachaProgram, GRADE_NAMES, VALID_IMAGES, NUM_GACHA } from './gacha-data-access'
import confetti from 'canvas-confetti'

import gachaImg from '../../assets/gachaBtnNoBg.png'
import nftimg from '../../assets/nft.png'
import nftimg2 from '../../assets/nft2.png'
import nftimg3 from '../../assets/nft3.png'

import inventoryImg from '../../assets/inventory.png'
import rankingImg from '../../assets/ranking.png'
import howitworksImg from '../../assets/howitworks.png'
import InventoryUI from '../inventory/inventory-ui'
export function GachaExplain(){
    return (
        <div className="relative w-full h-full">
            <button className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 btn btn-lg btn-primary w-48 h-48 text-2xl font-bold">
            <img src={howitworksImg.src} alt="explain" className=" " />
            </button>
            {/* <button className="relative btn btn-lg btn-primary w-full text-2xl font-bold">Check my history</button> */}
        </div>
    )
}

// NFT 결과 모달 컴포넌트
function GachaResultModal({ nft, onClose, onRetry }: { nft: any, onClose: () => void, onRetry: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">가챠 결과</h2>
        <div className="flex flex-col items-center gap-4 mb-4">
          <img 
            src={`/images/${nft.image}`} 
            alt={nft.name} 
            className="w-48 h-48 object-cover rounded"
          />
          <div className="text-center">
            <h3 className="text-xl font-bold">{nft.name}</h3>
            <p className="text-sm text-gray-600">{nft.description}</p>
            <p className="text-sm text-gray-600">등급: {GRADE_NAMES[nft.grade]}</p>
            <p className="text-sm text-gray-600">아이템 ID: {nft.mint.slice(0, 8)}...</p>
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
  const [gachaResult, setGachaResult] = useState<any>(null)
  const [selectedGachaLevel, setSelectedGachaLevel] = useState(0)
  const { mintItem, allNft } = useGachaProgram()

  const [isGacha, setIsGacha] = useState(true)
  const [isInventory, setIsInventory] = useState(false)
  const [isRanking, setIsRanking] = useState(false)

  const handleGachaClick = async () => {
    if (connected) {
      try {
        const result = await mintItem.mutateAsync({ gachaLevel: selectedGachaLevel })
        console.log(mintItem)
        // 민팅된 아이템 정보로 결과 설정
        const mintedItem = result.mintedItemAccount
        let gradeIndex = 0
        const grade = mintedItem.grade
        switch(grade){
          case 'NORMAL':
            gradeIndex = 0
            break
          case 'RARE':
            gradeIndex = 1
            break
          case 'EPIC':
            gradeIndex = 2
            break
          case 'UNIQUE':
            gradeIndex = 3
            break
          case 'LEGENDARY':
            gradeIndex = 4
            break
          case 'DEGENDARY':
            gradeIndex = 5
            break
        }
        
        // 올바른 이미지 인덱스 계산
        
        const nftResult = {
          name: `${GRADE_NAMES[gradeIndex]}}`,
          image: mintedItem.image,
          description: '가챠에서 획득한 아이템입니다.',
          grade: gradeIndex,
          mint: result.itemAccount.publicKey.toString()
        }
        setGachaResult(nftResult)
        setShowModal(true)
        
        // 색종이 효과 추가
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (error) {
        toast.error('가챠 뽑기에 실패했습니다')
        console.error(error)
      }
    }
  }

  const handleRetry = () => {
    handleGachaClick()
  }

  const handleClose = () => {
    setShowModal(false)
    setGachaResult(null)
  }

  return (
    <>
      <div className={`flex flex-col w-full items-center justify-${isInventory ? 'between' : 'end'}`}>
        <MainContent 
          isGacha={isGacha} 
          isInventory={isInventory} 
          isRanking={isRanking} 
          handleGachaClick={handleGachaClick} 
          connected={connected} 
          mintItem={mintItem}
          showModal={showModal}
          gachaResult={gachaResult}
          onClose={handleClose}
          onRetry={handleRetry}
        />
        <LeftMenu isGacha={isGacha} isInventory={isInventory} isRanking={isRanking} setIsGacha={setIsGacha} setIsInventory={setIsInventory} setIsRanking={setIsRanking} connected={connected} mintItem={mintItem} handleGachaClick={handleGachaClick} setGachaResult={setGachaResult}/>
      </div>
      
      {/* 모달 코드 제거 */}
    </>
  )
}

export function GachaList() {
  const { accounts, getProgramAccount, allNft } = useGachaProgram()
  const { publicKey } = useWallet()

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

  // 내 NFT만 필터링
  const myNfts = allNft.data?.filter(account => 
    publicKey && account.account.owner.toString() === publicKey.toString()
  );


  return (
    <div className={'space-y-6'}>
      <h2 className="text-2xl font-bold">내 NFT 컬렉션</h2>
      {allNft.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : myNfts?.length ? (
        <div className="flex flex-wrap gap-4">
          {myNfts.map((account) => {
            const item = account.account;
            let gradeIndex = 0;
            // 등급 문자열을 인덱스로 변환
            switch(item.grade) {
              case 'NORMAL': gradeIndex = 0; break;
              case 'RARE': gradeIndex = 1; break;
              case 'EPIC': gradeIndex = 2; break;
              case 'UNIQUE': gradeIndex = 3; break;
              case 'LEGENDARY': gradeIndex = 4; break;
              case 'DEGENDARY': gradeIndex = 5; break;
            }
            
            return (
              <div key={account.publicKey.toString()} className="card bg-base-100 shadow-xl">
                <figure className="px-4 pt-4">
                  <img src={`/images/${item.image}`} alt="NFT" className="rounded-xl h-48 w-48 object-cover" />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{item.grade}</h2>
                  <p>소유자: {item.owner.toString().slice(0, 8)}...</p>
                  <p>{item.image}</p>
                  <div className="card-actions justify-end">
                    <div className="badge badge-outline">{item.grade}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>보유한 NFT가 없습니다</h2>
          위에서 새로운 가챠를 뽑아보세요.
        </div>
      )}
    </div>
  )
}

const LeftMenu = ({isGacha, isInventory, isRanking, setIsGacha, setIsInventory, setIsRanking, connected, mintItem, handleGachaClick, setGachaResult}: {isGacha: boolean, isInventory: boolean, isRanking: boolean, setIsGacha: (isGacha: boolean) => void, setIsInventory: (isInventory: boolean) => void, setIsRanking: (isRanking: boolean) => void, connected: boolean, mintItem: any, handleGachaClick: () => void, setGachaResult: (gachaResult: any ) => void}) => {
  return (
    <div className="flex flex-row w-full h-[25vh] items-center justify-around gap-10">
    {/* {Array.from({ length: NUM_GACHA }).map((_, index) => (
      <button 
        key={index}
        className={`btn ${selectedGachaLevel === index ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => setSelectedGachaLevel(index)}
      >
        레벨 {index + 1}
      </button>
    ))} */}
    {isGacha && (
      <>
        <button className="btn btn-ghost w-32 h-28 pixel-shake">
          <img src={inventoryImg.src} alt="nft" className=" object-cover" onClick={() => {setIsGacha(false); setIsInventory(true); setIsRanking(false);setGachaResult(null)}} />
        </button>
        <div className="relative w-1/3 h-full flex justify-center items-end">
          <button
            className="text-2xl w-1/2 flex justify-center items-end font-bold"
            disabled={!connected || mintItem.isPending}
            onClick={handleGachaClick}
          >
            {connected ? 

                <img src={gachaImg.src} alt="gacha" className="w-full object-cover" />
              : '지갑을 연결해주세요'}
          </button>
        </div>
      </>
    )}
    {isInventory && (
      <button className="w-32 h-28 pixel-shake">
        <img src={gachaImg.src} alt="nft" className=" object-cover" onClick={() => {setIsGacha(true); setIsInventory(false); setIsRanking(false)}} />
      </button>
    )}

      <button className=" w-32 h-28 pixel-shake">
        <img src={rankingImg.src} alt="nft" className=" object-cover" />
      </button>
    
  </div>
  )
}

const MainContent = ({isGacha, isInventory, isRanking, handleGachaClick, connected, mintItem, showModal, gachaResult, onClose, onRetry}: {
  isGacha: boolean, 
  isInventory: boolean, 
  isRanking: boolean, 
  handleGachaClick: () => void, 
  connected: boolean, 
  mintItem: any,
  showModal?: boolean,
  gachaResult?: any,
  onClose?: () => void,
  onRetry?: () => void
}) => {
  return (
    <>
    {isGacha && (
      <>
      {showModal && gachaResult ? (
        <div className=" max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">가챠 결과</h2>
          <div className="flex flex-col items-center gap-4 mb-4">
            <img 
              src={`/images/${gachaResult.image}`} 
              alt={gachaResult.name} 
              className="w-48 h-48 object-cover rounded"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold">{gachaResult.name}</h3>
              <p className="text-sm text-gray-600">{gachaResult.description}</p>
              <p className="text-sm text-gray-600">등급: {GRADE_NAMES[gachaResult.grade]}</p>
              <p className="text-sm text-gray-600">아이템 ID: {gachaResult.mint.slice(0, 8)}...</p>
            </div>
          </div>
          

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-[64px] color-changing-text">
        PRESS BUTTON
        </div>
      )}
      </>
    )}
    {isInventory && (
        <InventoryUI />
    )}
  </>
  )
}