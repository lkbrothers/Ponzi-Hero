'use client'

import { Keypair, Cluster, PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { getImageUrl } from '../inventory/items/item-ui'
import { useUserStore } from '@/store/userStore'
import {getGameProgramId} from '../../../anchor/src/game-exports'

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
      // IPFS URL 변환 함수
      const getImageUrl = (uri: string) => {
        if (!uri) return nftimg.src;
        
        // IPFS URI 처리
        if (uri.startsWith('ipfs://')) {
            return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        
        return uri;
    };  
  
  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">가챠 결과</h2>
                <div className="flex flex-col items-center gap-4 mb-4">
                    <img
                        src={getImageUrl(nft.uri)}
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

    const [checkDbAccount, setCheckDbAccount] = useState<boolean>(false);

    const [dummyTx, setDummyTx] = useState<string | null>(null);

    const { dbAccount, creditAccount, selectedDbAccount, selectedCreditAccount, setDbAccount, setCreditAccount, selectDbAccount, selectCreditAccount } = useAccountStore()

    const { fetchBlockInfo,DbAccounts } = useGameProgram();
    const { CreditAccount, creditAccountPda, createCreditAccount, depositCredit } = useCreditProgram();

    const {setCredit} = useUserStore();
    const [fetchCredit, setFetchCredit] = useState(false);
    const { data: credit } = useQuery({
      queryKey: ['credit'],
      queryFn: () => useUserStore.getState().credit
    });
    const {
      remitForRandomMutation,
      fetchCodeAccount
  } = useGameProgramDBAccount({ userPublicKey: publicKey! });

    const queryClient = useQueryClient();

    // 가챠 비용 설정
    const gachaCosts = [500, 1000, 1500, 2000, 2500, 3000]

    // 송금 버튼 핸들러
    const handleRemit = async () => {
      try {
          // 1. remitForRandom 실행 → dummyTx 획득
          console.log("handleRemit = ", dbAccount)
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

  const fetchCreditBalance = async () => {
    if (!CreditAccount) return;
    const balance = await CreditAccount.balance.toString();
    console.log("balance = ", balance)
    setCredit(balance);
  };

  useEffect(() => {
    fetchCreditBalance();
  }, [CreditAccount]);

  useEffect(() => {
    handleGachaClick()
  }, [codeAccount])

  useEffect(() => {
    fetchCreditBalance();
  }, [CreditAccount]);

      // 크레딧 잔액 가져오기 - 실제 체인 데이터 사용
      const getCreditBalance = async () => {
        if (!publicKey || !creditAccountPda) {
            toast.error('지갑 연결 및 크레딧 계정이 필요합니다.');
            return;
        }

        try {
            await depositCredit.mutateAsync({ amount: 0 });
            await fetchCreditBalance();
        } catch (error) {
 
        }
    };

    const handleGachaClick = async () => {
        if(!connected) {
            toast.error("11지갑을 연결해주세요.")
            return
        }else{
            toast.error('Connected Wallet')
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
                    case 'COMMON':
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
                    name: mintedItem.name,
                    uri: mintedItem.uri,
                    grade: mintedItem.grade,
                    mint: result.itemAccount.publicKey.toString()
                }
                setGachaResult(nftResult)
                setShowModal(true)

                // 크레딧 잔액 업데이트 - 즉시 실행
                setFetchCredit(true)
    // getCreditBalance();
                
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

    useEffect(() => {
        if (fetchCredit) {
            console.log("fetchCredit = ", fetchCredit)
            fetchCreditBalance();
            setFetchCredit(false)
        }
    }, [fetchCredit]);

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
                    credit={credit}
                    isGacha={isGacha} 
                    isInventory={isInventory}
                    isRanking={isRanking}
                    handleRemit={handleRemit}
                    handleGachaClick={handleGachaClick}
                    connected={connected}
                    showModal={showModal}
                    gachaResult={gachaResult}
                    creditAccount={creditAccount}
                    checkDbAccount={checkDbAccount}
                    onClose={handleClose}
                    onRetry={handleRetry}
                    setDbAccount={setDbAccount}
                    setCreditAccount={setCreditAccount}
                    setCodeAccount={setCodeAccount}
                    setDummyTx={setDummyTx}
                    setCheckDbAccount={setCheckDbAccount}
                    selectedGachaLevel={selectedGachaLevel}
                    setSelectedGachaLevel={setSelectedGachaLevel}
                />
                <LeftMenu 
                    isGacha={isGacha}
                    isInventory={isInventory}
                    isRanking={isRanking}
                    setIsGacha={setIsGacha}
                    setIsInventory={setIsInventory}
                    setIsRanking={setIsRanking}
                    connected={connected}
                    handleRemit={handleRemit}
                    setGachaResult={setGachaResult}
                    checkDbAccount={checkDbAccount}
                    selectedGachaLevel={selectedGachaLevel}
                    setSelectedGachaLevel={setSelectedGachaLevel}
                />
            </div>

            {/* 모달 코드 제거 */}
        </>
    )
}

const LeftMenu = ({
    isGacha,
    isInventory, 
    isRanking,
    setIsGacha,
    setIsInventory,
    setIsRanking,
    connected,
    handleRemit,
    setGachaResult,
    selectedGachaLevel,
    setSelectedGachaLevel,
    checkDbAccount,
}: {
    isGacha: boolean,
    isInventory: boolean,
    isRanking: boolean,
    setIsGacha: (isGacha: boolean) => void,
    setIsInventory: (isInventory: boolean) => void,
    setIsRanking: (isRanking: boolean) => void,
    connected: boolean,
    handleRemit: () => void,
    setGachaResult: (gachaResult: any) => void,
    selectedGachaLevel: number,
    setSelectedGachaLevel: (selectedGachaLevel: number) => void,
    checkDbAccount : boolean
}) => {
    return (
        <div className="flex flex-row w-full h-[25vh] items-center justify-around gap-10">
            {isGacha && (
                <>
                    <button className="btn btn-ghost w-32 h-28 pixel-shake">
                        <img src={inventoryImg.src} alt="nft" className=" object-cover" onClick={() => { setIsGacha(false); setIsInventory(true); setIsRanking(false); setGachaResult(null) }} />
                    </button>
                    <div className="relative w-1/3 h-full flex justify-center items-end">
                        <button
                            className="text-2xl w-1/2 flex justify-center items-end font-bold"
                            disabled={!connected}
                            onClick={checkDbAccount ? handleRemit : () => toast.error('Create Account First')}
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

const MainContent = ({ credit, isGacha, isInventory, isRanking, handleRemit: parentHandleRemit, handleGachaClick, connected, showModal, gachaResult, onClose, onRetry,checkDbAccount, creditAccount, setDbAccount, setCreditAccount, setCodeAccount, setDummyTx, setCheckDbAccount,    selectedGachaLevel,
    setSelectedGachaLevel }: {
    credit: number | undefined,
    isGacha: boolean,
    isInventory: boolean,
    isRanking: boolean,
    handleRemit: () => void,
    handleGachaClick: () => void,
    connected: boolean,
    showModal?: boolean,
    gachaResult?: any,
    onClose?: () => void,
    onRetry?: () => void,
    creditAccount: any,
    checkDbAccount:boolean,
    setDbAccount: (account: any) => void,
    setCreditAccount: (account: any) => void,
    setCodeAccount: (account: any) => void,
    setDummyTx: (account: any) => void,
    setCheckDbAccount : (checkDbAccount : any) => void
    selectedGachaLevel: number,
    setSelectedGachaLevel: (selectedGachaLevel: number) => void,
}) => {

    const { userInitialize, DbAccounts, getProgramAccount } = useGameProgram()
    const {
        creditAccountPda,
        createCreditAccount,
        CreditAccount,
        depositCredit
    } = useCreditProgram()

    const {dbAccount} = useAccountStore();

    const [isClicked, setIsClicked] = useState(false)
    const { publicKey } = useWallet()

    const queryClient = useQueryClient();


    // DB 계정 생성 함수
    const handleDbAccountCreate = async () => {
        if (!publicKey) {
            toast.error('111지갑을 연결해주세요.')
            return
        }

        console.log("Public Key = ", publicKey.toString())
        console.log("DB 계정 생성 시작...")

        try {
            // 캐시 무효화
            await queryClient.invalidateQueries({ queryKey: ['game', 'dbAccountAll'] });
            console.log("쿼리 캐시 무효화 완료")
            
            // 기존 DB 계정 확인
            await DbAccounts.refetch();
            console.log("DbAccounts = ", DbAccounts.data)
            
            // 사용자 계정에 따른 PDA 생성
            const [expectedPda, _] = PublicKey.findProgramAddressSync(
                [Buffer.from("dbseedhere"), publicKey.toBuffer()],
                getGameProgramId("devnet") || new PublicKey("")
            );
            
            // 기존 계정 중에 일치하는 PDA가 있는지 확인
            console.log("기존 계정 확인 중...");
            console.log("expectedPda:", expectedPda.toString());
            console.log("DbAccounts.data:", DbAccounts.data?.map(acc => acc.publicKey.toString()));
            
            const existingAccount = DbAccounts.data?.find(acc => 
                acc.publicKey.toString() === expectedPda.toString()
            );
            
            console.log("existingAccount 검색 결과:", existingAccount ? "찾음" : "없음");
            
            if (existingAccount) {
                console.log("일치하는 DB 계정이 존재합니다:", existingAccount.publicKey.toString());
                setDbAccount(existingAccount.publicKey);
                toast.success('기존 DB 계정을 불러왔습니다!');
                setCheckDbAccount(true)
                return;
            }
            
            // DB 계정이 없는 경우 새로 생성
            console.log("userInitialize 호출 전...");
            await userInitialize.mutateAsync(publicKey);
            console.log("userInitialize 호출 성공!");
            toast.success('DB 계정이 생성되었습니다!');
            
            // 계정 생성 후 데이터 다시 불러오기
            console.log("DB 계정 데이터 다시 불러오기...");
            await DbAccounts.refetch();
            
            // 새로 생성된 계정 찾기
            const newAccount = DbAccounts.data?.find(acc => 
                acc.publicKey.toString() === expectedPda.toString()
            );
            
            if (newAccount) {
                console.log("새로 생성된 DB 계정:", newAccount.publicKey.toString());
                setDbAccount(newAccount.publicKey);
                console.log("DB 계정 설정 완료");
            } else {
                console.error("생성된 계정을 찾을 수 없습니다");
                toast.error("생성된 계정을 찾을 수 없습니다");
            }
        } catch (error) {
            console.error('DB 계정 생성 오류:', error);
            
            // 오류가 발생했지만 이미 계정이 존재하는 경우 처리
            if (error instanceof Error && error.message.includes("already in use")) {
                toast.success('이미 계정이 존재합니다. 기존 계정을 불러옵니다.');
                
                // 기존 계정 다시 불러오기
                await DbAccounts.refetch();
                
                // 사용자 계정에 따른 PDA 찾기
                const [expectedPda, _] = PublicKey.findProgramAddressSync(
                    [Buffer.from("dbseedhere"), publicKey.toBuffer()],
                    getProgramAccount.data?.value?.owner || new PublicKey("")
                );
                
                const existingAccount = DbAccounts.data?.find(acc => 
                    acc.publicKey.toString() === expectedPda.toString()
                );
                
                if (existingAccount) {
                    setDbAccount(existingAccount.publicKey);
                    toast.success('기존 DB 계정을 불러왔습니다!');
                }
            } else {
                toast.error('DB 계정 생성에 실패했습니다.');
            }
        }

        setCheckDbAccount(true)
    };

    useEffect(() => {
        if (!publicKey || !DbAccounts.data) return;

        const [expectedPda, _] = PublicKey.findProgramAddressSync(
            [Buffer.from("dbseedhere"), publicKey.toBuffer()],
            getGameProgramId("devnet") || new PublicKey("")
        );

        const existingAccount = DbAccounts.data.find(acc => 
            acc.publicKey.toString() === expectedPda.toString()
        );

        if (existingAccount) {
            console.log("기존 DB 계정을 찾았습니다:", existingAccount.publicKey.toString());
            toast.success('기존 DB 계정을 불러왔습니다!');
            setDbAccount(existingAccount.publicKey);
        }
    }, [DbAccounts.data, publicKey])

    // 크레딧 계정 생성 함수
    const handleCreditAccountCreate = async () => {
        if (!publicKey) {
            toast.error('Connect Wallet First')
            return
        }else{
            toast.success('지갑이 연결되었습니다')
        }

        console.log("크레딧 계정 생성 시작...")
        console.log("현재 CreditAccount 상태:", CreditAccount ? "존재함" : "없음")

        if (CreditAccount) {
            console.log("이미 크레딧 계정 존재:", creditAccountPda?.toString())
            toast.error('이미 크레딧 계정이 생성되었습니다.')
            setCreditAccount(creditAccountPda)
            return;
        }

        try {
            // 초기 크레딧 5000으로 계정 생성
            console.log("createCreditAccount 호출 전...")
            await createCreditAccount.mutateAsync({ initialBalance: 5000 });
            console.log("createCreditAccount 호출 성공!")
            toast.success('크레딧 계정이 생성되었습니다! 초기 크레딧: 5000');

            // 생성된 계정 정보 갱신
            if (creditAccountPda) {
                console.log("생성된 크레딧 계정 PDA:", creditAccountPda.toString())
                setCreditAccount(creditAccountPda);
            } else {
                console.log("크레딧 계정 PDA가 없습니다.");
            }
        } catch (error) {
            console.error('크레딧 계정 생성 오류:', error);
            toast.error('크레딧 계정 생성에 실패했습니다.');
        }
    };


    const {setCredit} = useUserStore();
    const fetchCreditBalance = async () => {
        if (!CreditAccount) return;
        const balance = await CreditAccount.balance.toString();
        console.log("balance = ", balance)
        setCredit(balance);
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
            
            // 크레딧 충전 후 즉시 잔액 업데이트
            await fetchCreditBalance();
        } catch (error) {
            console.error('크레딧 충전 오류:', error);
            toast.error('크레딧 충전에 실패했습니다.');
        }
    };

    const {
        remitForRandomMutation,
        fetchCodeAccount
    } = useGameProgramDBAccount({ userPublicKey: publicKey! });


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
                                {/* {!checkDbAccount && (
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
                                )} */}
                                {(!checkDbAccount || !creditAccount) && (
                                    <button
                                        className="btn btn-accent"
                                        onClick={async () => {
                                            await handleDbAccountCreate()
                                            await handleCreditAccountCreate()
                                        }}
                                    >
                                        Create Account
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : showModal && gachaResult ? (
                        <div className=" w-full h-full flex flex-col items-center justify-center">
                            <h2 className="text-3xl font-bold text-center text-black">Congratulations!</h2>
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <img
                                    src={getImageUrl(gachaResult.uri)}
                                    alt={gachaResult.name}
                                    className="w-48 h-48 object-cover rounded"
                                />
                                <div className="text-center">
                                    <h3 className="text-3xl text-black font-extrabold">{gachaResult.name}</h3>
                                    <GradeText grade={gachaResult.grade} />
                                    <p className="text-sm text-gray-600">Item ID: {gachaResult.mint.slice(0, 8)}...</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">

                            <div className="text-[64px] color-changing-text mb-8">
                                PRESS BUTTON
                            </div>
                            <div className="flex items-center gap-2">
                                <select 
                                    className="select select-bordered select-md text-xl"
                                    value={selectedGachaLevel}
                                    onChange={(e) => setSelectedGachaLevel(Number(e.target.value))}
                                >
                                    <option value={0}>Common Gacha (0)</option>
                                    <option value={1}>Bronze Gacha (50)</option>
                                    <option value={2}>Silver Gacha (200)</option>
                                    <option value={4}>Gold Gacha(1000)</option>
                                    <option value={5}>Diamond Gacha(10000)</option>
                                    <option value={6}>Degen Gacha(200000)</option>
                                </select>
                                <button
                                    className="btn btn-sm btn-outline btn-accent"
                                    onClick={() => handleCreditDeposit(1000)}
                                >
                                    1000 크레딧 충전
                                </button>
                            </div>
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

const GradeText = ({ grade }: { grade: string }) => {
    let textColor = 'Black'
    let bgColor = 'White'
    if (grade === 'NORMAL') {
        textColor = 'Gray'
        bgColor = '#f5f5f5'
    } else if (grade === 'RARE') {
        textColor = 'Blue'
        bgColor = '#e3f2fd'
    } else if (grade === 'EPIC') {
        textColor = 'Purple'
        bgColor = '#ffffff'
    } else if (grade === 'LEGENDARY') {
        textColor = 'Gold'
        bgColor = '#fff8e1'
    }else if(grade === 'DEGENDARY'){
        textColor = 'Pink'
        bgColor = '#fce4ec'
    }
    return (
        <div className='flex flex-row items-center'>
            <span className="text-xl text-black text-bold">Grade: </span>
        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
            <p style={{ color: textColor, padding: '4px 8px', borderRadius: '4px' }}>{grade}</p>
        </div>
        </div>
    )
}