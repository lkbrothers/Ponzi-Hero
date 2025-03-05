'use client'

import { getGameProgram, getGameProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import BN from 'bn.js'

export function useGameProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getGameProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getGameProgram(provider, programId), [provider, programId])

    const DbAccounts = useQuery({
        queryKey: ['game', 'dbAccountAll', { cluster }],
        queryFn: () => program.account.dBaccount.all(),
    })

    const CodeAccounts = useQuery({
        queryKey: ['game', 'codeAccountAll', { cluster }],
        queryFn: () => program.account.codeAccount.all(),
    })

    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    })

    const userInitialize = useMutation({
        mutationKey: ['game', 'userInitialize', { cluster }],
        mutationFn: (userPublicKey: PublicKey) =>
            program.methods
                .userInitialize()
                .accounts({ user: userPublicKey })
                .rpc(),
        onSuccess: (signature) => {
            transactionToast(signature)
            return { DbAccounts: DbAccounts.refetch(), CodeAccounts: CodeAccounts.refetch() }
        },
        onError: () => toast.error('Failed to initialize account'),
    })

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

    return {
        connection,
        program,
        programId,
        DbAccounts,
        CodeAccounts,
        getProgramAccount,
        userInitialize,
        fetchBlockInfo,
    }
}

export function useGameProgramAccount({
    userPublicKey,
    dbAccount,
}: {
    userPublicKey: PublicKey,
    dbAccount: PublicKey,
}) {

    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const { program, connection } = useGameProgram()

    const dbAccountQuery = useQuery({
        queryKey: ['game', 'fetch', { cluster, dbAccount }],
        queryFn: () => program.account.dBaccount.fetch(dbAccount),
    })

    const remitForRandomMutation = useMutation({
        mutationKey: ['game', 'remitForRandom', { cluster, dbAccount }],
        mutationFn: () =>
            program.methods
                .remitForRandom()
                .accounts({
                    user: userPublicKey,
                    dbAccount: dbAccount,
                })
                .rpc(),
        onSuccess: (signature) => {
            transactionToast(signature)
            return dbAccountQuery.refetch()
        },
        onError: () => toast.error('Failed to remit for random'),
    })

    const dbCodeInMutation = useMutation({
        mutationKey: ['game', 'dbCodeIn', { cluster, dbAccount }],
        mutationFn: (codeTxHash: string) =>
            program.methods
                .dbCodeIn(codeTxHash)
                .accounts({
                    user: userPublicKey,
                    dbAccount: dbAccount,
                })
                .rpc(),
        onSuccess: (signature) => {
            transactionToast(signature)
            return { dbAccountQuery: dbAccountQuery.refetch() }
        },
        onError: () => toast.error('Failed to send db code'),
    })

    const finalizeGameMutation = useMutation({
        mutationKey: ['game', 'finalizeGame', { cluster, dbAccount }],
        mutationFn: ({
            remitTxHash,
            blockHash,
            slot,
            blockTime,
        }: {
            remitTxHash: string,
            blockHash: string,
            slot: number,
            blockTime: number,
        }) => {
            return program.methods
                .finalizeGame(remitTxHash, blockHash, new BN(slot), new BN(blockTime))
                .accounts({
                    user: userPublicKey,
                    dbAccount: dbAccount,
                })
                .rpc()
        },
        onSuccess: (signature) => {
            transactionToast(signature)
            return { dbAccountQuery: dbAccountQuery.refetch(), }
        },
        onError: () => toast.error('Failed to finalize game'),
    })

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
                const decoded = program.coder.accounts.decode("codeAccount", accountInfo.data);

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
        dbAccountQuery,
        remitForRandomMutation,
        dbCodeInMutation,
        finalizeGameMutation,
        fetchCodeChain,
    }
}
