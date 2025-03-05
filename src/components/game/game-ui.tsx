'use client'

import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import {
    useGameProgram,
    useGameProgramAccount,
} from './game-data-access'

/* 
  GameInit 컴포넌트
  - "Account Init" 버튼을 누르면 userInitialize 실행
*/
export function GameInit({
    userPublicKey,
}: {
    userPublicKey: PublicKey,
}) {
    const { userInitialize } = useGameProgram()

    return (
        <button
            className="btn btn-primary"
            onClick={() => userInitialize.mutateAsync(userPublicKey)}
            disabled={userInitialize.isPending}
        >
            {userInitialize.isPending ? "Initializing..." : "Account Init"}
        </button>
    )
}

/* 
  GameList 컴포넌트
  - 생성된 DB 계정 카드들을 렌더링
  - 여기서는 각 카드에 대해 GameCardDbAccountChain 컴포넌트를 사용
*/
export function GameList({
    userPublicKey,
}: {
    userPublicKey: PublicKey,
}) {
    const { DbAccounts, getProgramAccount, CodeAccounts } = useGameProgram()

    if (getProgramAccount.isLoading) {
        return <span className="loading loading-spinner loading-lg"></span>
    }
    if (!getProgramAccount.data?.value) {
        return (
            <div className="alert alert-info flex justify-center">
                <span>
                    Program account not found. Make sure you have deployed the program and are on the correct cluster.
                </span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {DbAccounts.isLoading ? (
                <span className="loading loading-spinner loading-lg"></span>
            ) : DbAccounts.data?.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {DbAccounts.data.map((dbAccount) => (
                        <GameCardDbAccountChain
                            key={dbAccount.publicKey.toString()}
                            userPublicKey={userPublicKey}
                            dbAccount={dbAccount.publicKey}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl">No DB accounts</h2>
                    No DB accounts found. Create one above to get started.
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
function GameCardDbAccountChain({
    userPublicKey,
    dbAccount,
}: {
    userPublicKey: PublicKey,
    dbAccount: PublicKey,
}) {
    const {
        dbAccountQuery,
        remitForRandomMutation,
        dbCodeInMutation,
        finalizeGameMutation,
        fetchCodeChain,
    } = useGameProgramAccount({ userPublicKey, dbAccount })

    const { fetchBlockInfo, CodeAccounts, DbAccounts } = useGameProgram()

    // 최신 코드 계정의 키(문자열)를 저장 (dbAccount.tailTx를 사용)
    const handleText = useMemo(() => dbAccountQuery.data?.handle ?? '', [dbAccountQuery.data?.handle])
    const recentTailTx = useMemo(() => dbAccountQuery.data?.tailTx ?? '', [dbAccountQuery.data?.tailTx])

    // codeChain을 상태로 관리
    const [codeChain, setCodeChain] = useState<{ txHash: string; before_tx: string; code: string }[]>([])

    // 컴포넌트 진입 시 tailTx를 기반으로 codeChain을 조회
    useEffect(() => {
        if (recentTailTx) {
            fetchCodeChain(recentTailTx)
                .then(setCodeChain)
                .catch((error) => console.error("Error fetching code chain:", error))
        }
    }, [recentTailTx, fetchCodeChain])

    // Remit 및 Finalize 체인 실행
    const handleRemitAndFinalize = async () => {
        try {
            // 1. remitForRandom 실행 → remitTxHash 획득
            const remitTxHash = await remitForRandomMutation.mutateAsync()
            toast.success(`Remit successful: ${remitTxHash}`)

            // 2. game-data-access의 fetchBlockInfo 함수를 사용해 블록 정보를 조회
            const { blockHash } = await fetchBlockInfo(remitTxHash)

            // 3. finalizeGame 실행: remitTxHash, blockHash 전달
            const finalizeSignature = await finalizeGameMutation.mutateAsync({
                remitTxHash,
                blockHash,
            })
            toast.success(`Finalize Game successful: ${finalizeSignature}`)

            // 4. finalizeGame의 signature를 dbCodeInMutation의 tailTx 파라미터로 전달하여 실행
            await dbCodeInMutation.mutateAsync(finalizeSignature)
            toast.success(`db_code_in updated with new tailTx: ${finalizeSignature}`)

            // 5. 새롭게 생성된 tailTx (finalizeSignature)를 기준으로 codeChain 재조회하여 업데이트
            const updatedChain = await fetchCodeChain(finalizeSignature)
            setCodeChain(updatedChain)
        } catch (error) {
            console.error(error)
            toast.error("Failed to execute remit/finalize chain")
        }
    }

    return (
        <div className="card p-4 shadow-lg">
            <h3 className="text-xl font-bold">Game Account</h3>
            <p>DB Account TailTx: {recentTailTx}</p>
            <CodeChainCard codeChain={codeChain} />
            <button className="btn btn-primary mt-4" onClick={handleRemitAndFinalize}>
                Remit & Finalize Game
            </button>
        </div>
    );
}

function CodeChainCard({ codeChain }: { codeChain: { txHash: string; before_tx: string; code: string }[] }) {
    return (
        <div className="mt-4 p-4 border rounded-lg shadow-md">
            <h4 className="font-semibold">Transaction Chain</h4>
            {codeChain.length ? (
                <ul>
                    {codeChain.map((entry, idx) => (
                        <li key={idx} className="mt-2">
                            <strong>{idx + 1}.</strong> TxHash: {entry.txHash}<br />
                            Code: {entry.code}<br />
                            Before Tx: {entry.before_tx}
                        </li>
                    ))}7
                </ul>
            ) : (
                <p>No transaction chain info found.</p>
            )}
        </div>
    )
}