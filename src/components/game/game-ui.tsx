'use client'

import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProgram, useProgramAccount } from './game-data-access'
import { BN } from '@coral-xyz/anchor'
/* 
  Account 초기화 버튼
  - "Account Init" 버튼을 누르면 userInitialize 실행하여 dbAccount가 생성됨
*/
export function GameInit({ userPublicKey }: { userPublicKey: PublicKey }) {
    const { initializeGame, DbAccounts, codeInProgramId } = useProgram()
    const [isClicked, setIsClicked] = useState(false)

    const [dbAccountPDA] = PublicKey.findProgramAddressSync(
        [userPublicKey.toBuffer()],
        codeInProgramId
    )

    const handleClick = async () => {
        setIsClicked(true); // 버튼 클릭 시 비활성화
        await initializeGame.mutateAsync({
            userPublicKey,
        });
    };

    return (
        <button
            className="btn btn-primary"
            onClick={handleClick}
            disabled={isClicked || initializeGame.isPending} // 클릭했거나 실행 중이면 비활성화
        >
            {initializeGame.isPending ? "Initializing..." : "Create"}
        </button>
    )
}

/* 
  GameList 컴포넌트
  - 단 하나의 dbAccount가 존재한다고 가정하고,
    dbAccount 정보는 Account Init 버튼 바로 아래에 간단하게 표시함.
  - Game Start 버튼을 눌러 생성되는 code_account는 카드 형식으로 나열함.
*/
export function GameList({ userPublicKey }: { userPublicKey: PublicKey }) {
    const { DbAccounts, getProgramAccount, CodeAccounts } = useProgram()

    if (getProgramAccount.isLoading) {
        return <span className="loading loading-spinner loading-lg"></span>
    }
    if (!getProgramAccount.data?.value) {
        return (
            <div className="alert alert-info flex justify-center">
                <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
            </div>
        )
    }

    if (DbAccounts.isLoading) {
        return <span className="loading loading-spinner loading-lg"></span>
    }

    const dbAccount = DbAccounts.data && DbAccounts.data.length
        ? DbAccounts.data[0].publicKey
        : null

    return (
        <div className="space-y-6">
            {dbAccount ? (
                <GameDashboard userPublicKey={userPublicKey} dbAccount={dbAccount} />
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl">No DB accounts</h2>
                    <p>No DB accounts found. Create one above to get started.</p>
                </div>
            )}
        </div>
    )
}

/* 
  GameCardDbAccountChain 컴포넌트
  - DB 계정의 handle 및 tailTx를 표시
  - db_account.tailTx(최신 code_account의 key)를 시작으로 재귀적으로 code_account의 before_tx 체인을 불러옴
  - 체인 결과를 출력하고, 그 아래 "Remit" 버튼을 배치
  - Remit 버튼 클릭 시:
      1. remitForRandomMutation 실행 → remitTxHash 획득
      2. finalizeGameMutation 실행 (remitTxHash, blockNonce, blockHash 전달) → 최종 game 실행, 반환 signature
      3. 해당 signature를 dbCodeInMutation의 tailTx 파라미터로 전달하여 db_code_in 실행
*/
function GameDashboard({ userPublicKey, dbAccount }: { userPublicKey: PublicKey, dbAccount: PublicKey }) {
    const {
        DbAccounts,
        CodeAccounts,
        fetchCodeChain,
        fetchBlockInfo,
        codeInProgramId,
        fetchTimeStamp,
    } = useProgram()

    const { dummyTx, playGame, dbAccountQuery } = useProgramAccount({
        userPublicKey,
        dbAccount,
    })

    // 최신 코드 계정의 키(문자열)를 저장 (dbAccount.tailTx를 사용)
    const recentTailTx = useMemo(() => dbAccountQuery.data?.tailTx ?? '', [dbAccountQuery.data?.tailTx])

    // codeChain을 상태로 관리
    const [codeChain, setCodeChain] = useState<{ txHash: string; before_tx: string; nft: string }[]>([])

    // 컴포넌트 진입 시 tailTx를 기반으로 codeChain을 조회
    useEffect(() => {
        if (recentTailTx) {
            fetchCodeChain(recentTailTx)
                .then(setCodeChain)
                .catch((error) => console.error("Error fetching code chain:", error))
        }
    }, [recentTailTx, fetchCodeChain])

    const setup = async () => {
        const timestamp = await fetchTimeStamp();  // ✅ 비동기 처리 (await 추가)
        
        if (timestamp === null) {
            throw new Error("Failed to fetch timestamp");
        }
    
        // Rust에서 `to_le_bytes()`를 사용했으므로, TypeScript에서도 동일하게 변환
        const timestampBuffer = Buffer.alloc(8);
        timestampBuffer.writeBigUInt64LE(BigInt(timestamp));  // ✅ timestamp 변환
    
        const [codeAccountPDA] = PublicKey.findProgramAddressSync(
            [userPublicKey.toBuffer(), timestampBuffer],
            codeInProgramId
        );
    
        // Remit 및 Finalize 체인 실행
        const letsPlay = async () => {
            try {
                const dummyTxHash = await dummyTx.mutateAsync({
                    dbAccount: dbAccount,
                    codeAccount: codeAccountPDA,
                    timestamp: new BN(timestamp),  // ✅ timestamp를 올바르게 전달
                });
                toast.success(`Remit successful: ${dummyTxHash}`);
    
                const { blockHash, slot, blockTime } = await fetchBlockInfo(dummyTxHash);
    
                await playGame.mutateAsync({
                    dbAccount: dbAccount,
                    codeAccount: codeAccountPDA,
                    dummyTx: dummyTxHash,
                    blockHash,
                    slot,
                    blockTime: blockTime ?? 0,
                });
                toast.success(`Play Game successful: ${dummyTxHash}`);
    
                const updatedChain = await fetchCodeChain(dummyTxHash);
                setCodeChain(updatedChain);
            } catch (error) {
                console.error(error);
                toast.error("Failed to execute remit/finalize chain");
            }
        };
    
        // 실행
        await letsPlay();
    };

    return (
        <div className="space-y-6">

            <div className="text-center">
                <h3 className="text-xl font-bold">DB Account Info</h3>
                <p><strong>TailTx:</strong> {recentTailTx}</p>
            </div>

            <div className="text-center">
                <button className="btn btn-primary" onClick={setup}>
                    Game Start
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {codeChain.length > 0 ? (
                    codeChain.map((entry, idx) => (
                        <CodeAccountCard key={idx} entry={entry} idx={idx} />
                    ))
                ) : (
                    <p className="col-span-full text-center">No code accounts found.</p>
                )}
            </div>
        </div>
    )
}

/* 
  CodeAccountCard 컴포넌트
  - 개별 code_account의 정보를 카드 형태로 렌더링
  - TxHash와 BeforeTx의 첫 20자는 첫 줄에, 나머지 부분은 다음 줄에 표시
*/
function CodeAccountCard({ entry, idx }: { entry: { txHash: string; before_tx: string; nft: string }, idx: number }) {
    const splitText = (text: string, limit: number) => {
        if (text.length <= limit) return [text]
        return [text.slice(0, limit), text.slice(limit)]
    }

    const [txFirst, txRest] = splitText(entry.txHash, 20)
    const [beforeFirst, beforeRest] = splitText(entry.before_tx, 20)

    return (
        <div className="card p-4 shadow-2xl">
            <h4 className="text-lg font-bold">Code Account {idx + 1}</h4>
            <p>
                <strong>TxHash:</strong>{" "}
                <span title={entry.txHash}>
                    {txFirst}
                    {txRest && (<><br />{txRest}</>)}
                </span>
            </p>
            <p><strong>NFT:</strong> {entry.nft}</p>
            <p>
                <strong>Before Tx:</strong>{" "}
                <span title={entry.before_tx}>
                    {beforeFirst}
                    {beforeRest && (<><br />{beforeRest}</>)}
                </span>
            </p>
        </div>
    )
}