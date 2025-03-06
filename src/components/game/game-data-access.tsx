'use client'

import { getGameProgram, getGameProgramId, getCodeInProgram, getCodeInProgramId, getTransferProgram, getTransferProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import BN from 'bn.js'

export function useProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const gameProgramId = useMemo(() => getGameProgramId(cluster.network as Cluster), [cluster])
    const gameProgram = useMemo(() => getGameProgram(provider, gameProgramId), [provider, gameProgramId])
    const codeInProgramId = useMemo(() => getCodeInProgramId(cluster.network as Cluster), [cluster])
    const codeInProgram = useMemo(() => getCodeInProgram(provider, codeInProgramId), [provider, codeInProgramId])
    const transferProgramId = useMemo(() => getTransferProgramId(cluster.network as Cluster), [cluster])
    const transferProgram = useMemo(() => getTransferProgram(provider, transferProgramId), [provider, transferProgramId])

    const DbAccounts = useQuery({
        queryKey: ['game', 'dbAccountAll', { cluster }],
        queryFn: () => gameProgram.account.dbAccount.all(),
    })

    const CodeAccounts = useQuery({
        queryKey: ['game', 'codeAccountAll', { cluster }],
        queryFn: () => gameProgram.account.codeAccount.all(),
    })

    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(gameProgramId),
    })

    // const dbAccountQuery = useQuery({
    //     queryKey: ['game', 'dbAccountFetch', { cluster}],
    //     queryFn: (dbAccount: PublicKey) => gameProgram.account.dbAccount.fetch(dbAccount),
    // })

    // const codeAccountQuery = useQuery({
    //     queryKey: ['game', 'codeAccountFetch', { cluster }],
    //     queryFn: (codeAccount: PublicKey) => gameProgram.account.codeAccount.fetch(codeAccount),
    // })

    const initializeGame = useMutation({
        mutationKey: ['game', 'initializeGame', { cluster }],
        mutationFn: ({
            userPublicKey,
        }: {
            userPublicKey: PublicKey,
        }) => {
            return gameProgram.methods
                .initializeGame()
                .accounts({
                    user: userPublicKey,
                    codeInProgram: codeInProgramId,
                })
                .rpc();
        },
        onSuccess: (signature) => {
            transactionToast(signature);
            return { DbAccounts: DbAccounts.refetch(), CodeAccounts: CodeAccounts.refetch() };
        },
        onError: () => toast.error('Failed to initialize account'),
    });

    const fetchTimeStamp = async () => {
        const slot = await connection.getSlot()
        const blockTime = await connection.getBlockTime(slot)
        return blockTime
    }
    // fetchBlockInfo: remit 트랜잭션 해시를 받아 블록 정보를 조회
    const fetchBlockInfo = async (
        remitTxHash: string
    ): Promise<{ blockHash: string, slot: number, blockTime: number | null }> => {
        const txResponse = await connection.getParsedTransaction(remitTxHash, { commitment: 'confirmed' });
        if (!txResponse) {
            throw new Error('Transaction not found');
        }
        const blockHash = txResponse.transaction.message.recentBlockhash;
        const slot = txResponse.slot;
        const blockTime = txResponse.blockTime ?? null;
        return { blockHash, slot, blockTime };
    }

    const fetchCodeChain = useCallback(
        async (
            currentTxHash: string,
            chain: { txHash: string, before_tx: string, nft: string }[] = []
        ): Promise<{ txHash: string, before_tx: string, nft: string }[]> => {
            // 1. 기저 조건
            if (currentTxHash === "GENESIS") return chain;
            try {
                // 2. currentTxHash에 해당하는 트랜잭션 조회
                const txResponse = await connection.getParsedTransaction(currentTxHash, { commitment: "confirmed" });
                if (!txResponse) {
                    console.error("Transaction not found", txResponse);
                    return chain;
                }

                let codeAccountPDA: PublicKey | null = null;
                if (txResponse.meta?.innerInstructions) {
                    for (const inner of txResponse.meta.innerInstructions) {
                        for (const instr of inner.instructions) {
                            // 시스템 프로그램의 createAccount 인스트럭션 찾기
                            if (
                                instr.programId.equals(SystemProgram.programId) &&
                                "parsed" in instr &&
                                instr.parsed?.type === "createAccount"
                            ) {
                                // 새로 생성된 계정 주소를 추출합니다.
                                const newAccount = instr.parsed.info.newAccount;
                                codeAccountPDA = new PublicKey(newAccount);
                                break;
                            }
                        }
                        if (codeAccountPDA) break;
                    }
                }

                if (!codeAccountPDA) {
                    console.error("Code account PDA not found in transaction.");
                    return chain;
                }

                // 4. 해당 트랜잭션의 codeAccount의 accountInfo를 조회 (특정 slot 기준)
                const accountInfo = await connection.getAccountInfo(codeAccountPDA);
                if (!accountInfo) {
                    console.error("Account info not found for PDA", codeAccountPDA.toString());
                    return chain;
                }

                // 5. accountInfo를 디코딩하여 codeAccount의 데이터를 추출 (Anchor coder 사용)
                const decoded = gameProgram.coder.accounts.decode("codeAccount", accountInfo.data);

                // 6. 해당 데이터를 chain에 추가
                const entry = {
                    txHash: currentTxHash,
                    before_tx: decoded.beforeTx,
                    nft: decoded.nft,
                };
                chain.push(entry);

                // 7. 재귀 호출
                return fetchCodeChain(decoded.beforeTx, chain);
            } catch (error) {
                console.error("Failed to fetch code account for tx", currentTxHash, error);
                return chain;
            }
        },
        []
    )

    return {
        connection,
        gameProgram,
        gameProgramId,
        codeInProgram,
        codeInProgramId,
        transferProgram,
        transferProgramId,
        DbAccounts,
        CodeAccounts,
        getProgramAccount,
        initializeGame,
        fetchBlockInfo,
        fetchCodeChain,
        fetchTimeStamp,
    }
}

export function useProgramAccount({
    userPublicKey,
    dbAccount,
}: {
    userPublicKey: PublicKey,
    dbAccount: PublicKey,
}) {

    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const { gameProgram, codeInProgramId, transferProgramId } = useProgram()

    const dbAccountQuery = useQuery({
        queryKey: ['game', 'fetch', { cluster, dbAccount }],
        queryFn: () => gameProgram.account.dbAccount.fetch(dbAccount),
    })

    const dummyTx = useMutation({
        mutationKey: ['game', 'dummyTx', { cluster }],
        mutationFn: ({
            dbAccount,
            codeAccount,
            timestamp
        }: {
            dbAccount: PublicKey,
            codeAccount: PublicKey,
            timestamp: BN
        }) => {
            return gameProgram.methods
                .dummyTx(timestamp)
                .accounts({
                    user: userPublicKey,
                    dbAccount: dbAccount,
                    codeAccount: codeAccount,
                    transferProgram: transferProgramId,
                    codeInProgram: codeInProgramId
                })
                .rpc();
        },
        onSuccess: (signature) => {
            transactionToast(signature);
            return { dbAccountQuery: dbAccountQuery.refetch() };
        },
        onError: () => toast.error('Failed to transfer from user to db'),
    });

    const playGame = useMutation({
        mutationKey: ['game', 'playGame', { cluster }],
        mutationFn: ({
            dbAccount,
            codeAccount,
            dummyTx,
            blockHash,
            slot,
            blockTime
        }: {
            dbAccount: PublicKey,
            codeAccount: PublicKey,
            dummyTx: string,
            blockHash: string,
            slot: number,
            blockTime: number
        }) => {
            return gameProgram.methods
                .playGame(dummyTx, blockHash, new BN(slot), new BN(blockTime))
                .accounts({
                    user: userPublicKey,
                    dbAccount: dbAccount,
                    codeAccount: codeAccount,
                    codeInProgram: codeInProgramId,
                    transferProgram: transferProgramId
                })
                .rpc();
        },
        onSuccess: (signature) => {
            transactionToast(signature);
            return { dbAccountQuery: dbAccountQuery.refetch() };
        },
        onError: () => toast.error('Failed to play game'),
    });

    return {
        dbAccountQuery,
        dummyTx,
        playGame,
    }
}
