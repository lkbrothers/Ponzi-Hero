'use client'

import { Keypair, Cluster, PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { GRADE_NAMES, VALID_IMAGES, NUM_GACHA } from './gacha-data-access'
import confetti from 'canvas-confetti'

import gachaImg from '../../assets/gachaBtnNoBg.png'
import nftimg from '../../assets/nft.png'
import nftimg2 from '../../assets/nft2.png'
import nftimg3 from '../../assets/nft3.png'

import inventoryImg from '../../assets/inventory.png'
import rankingImg from '../../assets/ranking.png'
import howitworksImg from '../../assets/howitworks.png'
import InventoryUI from '../inventory/inventory-ui'
import { useAccountStore } from '@/store/accountStore'
import { useGameProgram, useGameProgramDBAccount } from '../game/game-data-access'
import { useCreditProgram } from './gacha-data-access'
import { useGachaWithCredit } from './gacha-data-access'


export function GachaExplain() {
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

    const { connected, publicKey } = useWallet()
    const [showModal, setShowModal] = useState(false)
    const [gachaResult, setGachaResult] = useState<any>(null)
    const [selectedGachaLevel, setSelectedGachaLevel] = useState(0)
    const { drawGacha } = useGachaWithCredit()

    const [isGacha, setIsGacha] = useState(true)
    const [isInventory, setIsInventory] = useState(false)
    const [isRanking, setIsRanking] = useState(false)

    const [codeAccount, setCodeAccount] = useState<PublicKey | null>(null);
    const [dummyTx, setDummyTx] = useState<string | null>(null);

    const { dbAccount, creditAccount, selectedDbAccount, selectedCreditAccount, setDbAccount, setCreditAccount, selectDbAccount, selectCreditAccount } = useAccountStore()

    const { fetchBlockInfo } = useGameProgram();

    const {
      remitForRandomMutation,
      fetchCodeAccount
  } = useGameProgramDBAccount({ userPublicKey: publicKey!, dbAccount });

    // 가챠 비용 설정
    const gachaCosts = [500, 1000, 1500, 2000, 2500, 3000]

    // 송금 버튼 핸들러
    const handleRemit = async () => {
      try {
          // 1. remitForRandom 실행 → dummyTx 획득
          const dummyTxHash = await remitForRandomMutation.mutateAsync();
          toast.success(`송금 성공: ${dummyTxHash}`);
          setDummyTx(dummyTxHash);
          const codeAccountAfterDummyTx = await fetchCodeAccount(dummyTxHash);
          setCodeAccount(codeAccountAfterDummyTx);
      } catch (error) {
          console.error(error);
          toast.error("송금에 실패했습니다.");
      }
  };

  useEffect(() => {
    handleGachaClick()
  }, [codeAccount])

    const handleGachaClick = async () => {
        if(!connected) {
            toast.error("지갑을 연결해주세요.")
            return
        }
        // try {
        //     await handleRemit()
        // } catch (error) {
        //     console.error(error);
        //     toast.error("송금에 실패했습니다.");
        // }

        if (connected) {
            try {

                if (!dummyTx || !dbAccount || !codeAccount) {
                    throw new Error("dummyTx || dbAccount || codeAccount is null");
                }

                const { blockHash, slot, blockTime } = await fetchBlockInfo(dummyTx);

                console.log("dbAccount = ", dbAccount)

                // 크레딧으로 가챠 뽑기
                const result = await drawGacha.mutateAsync({
                    gachaLevel: selectedGachaLevel,
                    cost: gachaCosts[selectedGachaLevel],
                    dbAccount: dbAccount,
                    codeAccount: codeAccount,
                    dummyTxHash: dummyTx,
                    blockHash,
                    slot,
                    blockTime: blockTime ?? 0
                })

                // 민팅된 아이템 정보로 결과 설정
                const mintedItem = result.mintedItemAccount
                let gradeIndex = 0
                const grade = mintedItem.grade
                switch (grade) {
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

                const nftResult = {
                    name: `${GRADE_NAMES[gradeIndex]}}`,
                    image: mintedItem.uri,
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
                toast.error('가챠 뽑기에 실패했습니다. 크레딧이 부족할 수 있습니다.')
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
                    handleRemit={handleRemit}
                    connected={connected}
                    showModal={showModal}
                    gachaResult={gachaResult}
                    dbAccount={dbAccount}
                    creditAccount={creditAccount}
                    onClose={handleClose}
                    onRetry={handleRetry}
                    setDbAccount={setDbAccount}
                    setCreditAccount={setCreditAccount}
                    setCodeAccount={setCodeAccount}
                    setDummyTx={setDummyTx}
                />
                <LeftMenu isGacha={isGacha} isInventory={isInventory} isRanking={isRanking} setIsGacha={setIsGacha} setIsInventory={setIsInventory} setIsRanking={setIsRanking} connected={connected} handleRemit={handleRemit} setGachaResult={setGachaResult} />
            </div>

            {/* 모달 코드 제거 */}
        </>
    )
}

// export function GachaList() {
//     const { publicKey } = useWallet()

//     if (getProgramAccount.isLoading) {
//         return <span className="loading loading-spinner loading-lg"></span>
//     }
//     if (!getProgramAccount.data?.value) {
//         return (
//             <div className="alert alert-info flex justify-center">
//                 <span>프로그램 계정을 찾을 수 없습니다. 프로그램이 배포되었고 올바른 클러스터에 있는지 확인하세요.</span>
//             </div>
//         )
//     }

//     // 내 NFT만 필터링
//     const myNfts = allNft.data?.filter(account =>
//         publicKey && account.account.owner.toString() === publicKey.toString()
//     );


//     return (
//         <div className={'space-y-6'}>
//             <h2 className="text-2xl font-bold">내 NFT 컬렉션</h2>
//             {allNft.isLoading ? (
//                 <span className="loading loading-spinner loading-lg"></span>
//             ) : myNfts?.length ? (
//                 <div className="flex flex-wrap gap-4">
//                     {myNfts.map((account) => {
//                         const item = account.account;
//                         let gradeIndex = 0;
//                         // 등급 문자열을 인덱스로 변환
//                         switch (item.grade) {
//                             case 'NORMAL': gradeIndex = 0; break;
//                             case 'RARE': gradeIndex = 1; break;
//                             case 'EPIC': gradeIndex = 2; break;
//                             case 'UNIQUE': gradeIndex = 3; break;
//                             case 'LEGENDARY': gradeIndex = 4; break;
//                             case 'DEGENDARY': gradeIndex = 5; break;
//                         }

//                         return (
//                             <div key={account.publicKey.toString()} className="card bg-base-100 shadow-xl">
//                                 <figure className="px-4 pt-4">
//                                     <img src={`/images/${item.image}`} alt="NFT" className="rounded-xl h-48 w-48 object-cover" />
//                                 </figure>
//                                 <div className="card-body">
//                                     <h2 className="card-title">{item.grade}</h2>
//                                     <p>소유자: {item.owner.toString().slice(0, 8)}...</p>
//                                     <p>{item.image}</p>
//                                     <div className="card-actions justify-end">
//                                         <div className="badge badge-outline">{item.grade}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )
//                     })}
//                 </div>
//             ) : (
//                 <div className="text-center">
//                     <h2 className={'text-2xl'}>보유한 NFT가 없습니다</h2>
//                     위에서 새로운 가챠를 뽑아보세요.
//                 </div>
//             )}
//         </div>
//     )
// }

const LeftMenu = ({ isGacha, isInventory, isRanking, setIsGacha, setIsInventory, setIsRanking, connected, handleRemit, setGachaResult }: { isGacha: boolean, isInventory: boolean, isRanking: boolean, setIsGacha: (isGacha: boolean) => void, setIsInventory: (isInventory: boolean) => void, setIsRanking: (isRanking: boolean) => void, connected: boolean, handleRemit: () => void, setGachaResult: (gachaResult: any) => void }) => {
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
                        <img src={inventoryImg.src} alt="nft" className=" object-cover" onClick={() => { setIsGacha(false); setIsInventory(true); setIsRanking(false); setGachaResult(null) }} />
                    </button>
                    <div className="relative w-1/3 h-full flex justify-center items-end">
                        <button
                            className="text-2xl w-1/2 flex justify-center items-end font-bold"
                            disabled={!connected}
                            onClick={handleRemit}
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
                    <img src={gachaImg.src} alt="nft" className=" object-cover" onClick={() => { setIsGacha(true); setIsInventory(false); setIsRanking(false) }} />
                </button>
            )}

            <button className=" w-32 h-28 pixel-shake">
                <img src={rankingImg.src} alt="nft" className=" object-cover" />
            </button>

        </div>
    )
}

const MainContent = ({ isGacha, isInventory, isRanking, handleRemit: parentHandleRemit, connected, showModal, gachaResult, onClose, onRetry, dbAccount, creditAccount, setDbAccount, setCreditAccount, setCodeAccount, setDummyTx }: {
    isGacha: boolean,
    isInventory: boolean,
    isRanking: boolean,
    handleRemit: () => void,
    connected: boolean,
    showModal?: boolean,
    gachaResult?: any,
    onClose?: () => void,
    onRetry?: () => void,
    dbAccount: any,
    creditAccount: any,
    setDbAccount: (account: any) => void,
    setCreditAccount: (account: any) => void,
    setCodeAccount: (account: any) => void,
    setDummyTx: (account: any) => void,
}) => {

    const { userInitialize, DbAccounts, getProgramAccount } = useGameProgram()
    const {
        creditAccountPda,
        createCreditAccount,
        CreditAccount,
        depositCredit
    } = useCreditProgram()
    const [isClicked, setIsClicked] = useState(false)
    const { publicKey } = useWallet()

    // DB 계정 생성 함수
    const handleDbAccountCreate = async () => {
        if (!publicKey) {
            toast.error('지갑을 연결해주세요.')
            return
        }

        try {
            await userInitialize.mutateAsync(publicKey);
            toast.success('DB 계정이 생성되었습니다!');

            // 계정 생성 후 데이터 다시 불러오기
            await DbAccounts.refetch();
        } catch (error) {
            console.error('DB 계정 생성 오류:', error);
            toast.error('DB 계정 생성에 실패했습니다.');
        }
    };

    // 크레딧 계정 생성 함수
    const handleCreditAccountCreate = async () => {
        if (!publicKey) {
            toast.error('지갑을 연결해주세요.')
            return
        }

        try {
            // 초기 크레딧 5000으로 계정 생성
            await createCreditAccount.mutateAsync({ initialBalance: 5000 });
            toast.success('크레딧 계정이 생성되었습니다! 초기 크레딧: 5000');

            // 생성된 계정 정보 갱신을 위해 데이터 다시 불러오기
        } catch (error) {
            console.error('크레딧 계정 생성 오류:', error);
            toast.error('크레딧 계정 생성에 실패했습니다.');
        }
    };

    // 크레딧 충전 함수
    const handleCreditDeposit = async (amount: number = 1000) => {
        if (!publicKey || !creditAccountPda) {
            toast.error('지갑 연결 및 크레딧 계정이 필요합니다.');
            return;
        }

        try {
            await depositCredit.mutateAsync({ amount });
            toast.success(`${amount} 크레딧이 충전되었습니다!`);
        } catch (error) {
            console.error('크레딧 충전 오류:', error);
            toast.error('크레딧 충전에 실패했습니다.');
        }
    };

    // 크레딧 잔액 가져오기 - 실제 체인 데이터 사용
    const getCreditBalance = () => {
        if (!CreditAccount) return "로딩 중...";
        return CreditAccount.balance.toString();
    };

    useEffect(() => {
        // 컴포넌트 마운트 시 또는 데이터 변경 시 한 번만 실행
        const syncAccounts = async () => {
            // DbAccount 설정
            if (DbAccounts.data && DbAccounts.data.length > 0) {
                const newDbAccount = DbAccounts.data[0].publicKey;
                if (!dbAccount || !dbAccount.equals(newDbAccount)) {
                    console.log("dbAccount 설정: ", newDbAccount.toString());
                    setDbAccount(newDbAccount);
                }
            }

            // 크레딧 계정 정보 설정
            if (creditAccountPda && CreditAccount) {
                console.log("creditAccount 설정: ", creditAccountPda.toString());
                setCreditAccount(creditAccountPda);
            }
        };

        syncAccounts();
    }, [DbAccounts.data, dbAccount, CreditAccount, setDbAccount, setCreditAccount]);









    // if (!publicKey) return;

    const {
        remitForRandomMutation,
        fetchCodeAccount
    } = useGameProgramDBAccount({ userPublicKey: publicKey!, dbAccount });


    // 함수 이름 변경
    const handleRemitLocal = async () => {
        try {
            // 1. remitForRandom 실행 → dummyTx 획득
            const dummyTxHash = await remitForRandomMutation.mutateAsync();
            toast.success(`송금 성공: ${dummyTxHash}`);
            setDummyTx(dummyTxHash);
            const codeAccountAfterDummyTx = await fetchCodeAccount(dummyTxHash);
            setCodeAccount(codeAccountAfterDummyTx);
        } catch (error) {
            console.error(error);
            toast.error("송금에 실패했습니다.");
        }
    };








    return (
        <>
            {isGacha && (
                <>
                    {!dbAccount || !creditAccount ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <h2 className="text-2xl font-bold mb-4 text-center">계정 생성이 필요합니다</h2>
                            <div className="flex gap-4">
                                {!dbAccount && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleDbAccountCreate}
                                    >
                                        DB 계정 생성하기
                                    </button>
                                )}
                                {!creditAccount && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCreditAccountCreate}
                                    >
                                        크레딧 계정 생성하기
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : showModal && gachaResult ? (
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
                        <div className="flex flex-col items-center justify-center h-full">

                            <div className="text-[64px] color-changing-text mb-8">
                                PRESS BUTTON
                            </div>

                            {/* 크레딧 정보 표시 - dbAccount와 creditAccount 모두 있을 때만 표시 */}
                            {dbAccount && creditAccount && (
                                <div className="bg-base-200 p-4 rounded-lg shadow-md mb-4">
                                    <h3 className="text-xl font-bold mb-2">크레딧 정보</h3>
                                    <p className="text-lg">현재 잔액: <span className="font-bold text-primary">{getCreditBalance()}</span> 크레딧</p>
                                    <button
                                        className="btn btn-sm btn-outline btn-accent mt-2"
                                        onClick={() => handleCreditDeposit(1000)}
                                    >
                                        1000 크레딧 충전
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleRemitLocal}>
                                        송금
                                    </button>
                                </div>
                            )}
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