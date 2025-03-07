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

export function useGameProgramDBAccount({
    userPublicKey,
    dbAccount,
}: {
    userPublicKey: PublicKey,
    dbAccount: PublicKey,
}) {

    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const { program, programId, connection, CodeAccounts } = useGameProgram()

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

    const finalizeGameMutation = useMutation({
        mutationKey: ['game', 'finalizeGame', { cluster, dbAccount }],
        mutationFn: ({
            codeAccount,
            dummyTxHash,
            blockHash,
            slot,
            blockTime,
        }: {
            codeAccount: PublicKey,
            dummyTxHash: string,
            blockHash: string,
            slot: number,
            blockTime: number,
        }) => {
            return program.methods
                .finalizeGame(dummyTxHash, blockHash, new BN(slot), new BN(blockTime))
                .accounts({
                    user: userPublicKey,
                    dbAccount: dbAccount,
                    codeAccount: codeAccount,
                })
                .rpc()
        },
        onSuccess: (signature) => {
            transactionToast(signature)
            return { CodeAccounts: CodeAccounts.refetch() }
        },
        onError: () => toast.error('Failed to finalize game'),
    })

    const fetchCodeAccount = async (
        currentTxHash: string,
    ): Promise<PublicKey | null> => {
        // 트랜잭션 정보 조회 (confirmed 상태)
        const txResponse = await connection.getParsedTransaction(currentTxHash, { commitment: "confirmed" });
        if (!txResponse) {
            console.error("Transaction not found", txResponse);
            return null;
        }


        console.log("fetchCodeAccount Top-level Instructions:", JSON.stringify(txResponse.transaction.message.instructions, null, 2));
        console.log("fetchCodeAccount Inner Instructions:", JSON.stringify(txResponse.meta?.innerInstructions, null, 2));

        let codeAccountPDA: PublicKey | null = null;

        // 트랜잭션 내의 innerInstructions에서 createAccount 인스트럭션 탐색
        if (txResponse.meta?.innerInstructions) {
            for (const inner of txResponse.meta.innerInstructions) {
                for (const instr of inner.instructions) {
                    // 시스템 프로그램의 createAccount 인스트럭션 확인
                    if (
                        instr.programId.equals(SystemProgram.programId) &&
                        "parsed" in instr &&
                        instr.parsed?.type === "createAccount"
                    ) {
                        // 새로 생성된 계정 주소 추출
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
            return null;
        }

        return codeAccountPDA;
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
                console.log("Top-level Instructions:", JSON.stringify(txResponse.transaction.message.instructions, null, 2));
                console.log("Inner Instructions:", JSON.stringify(txResponse.meta?.innerInstructions, null, 2));

                let codeAccountPDA: PublicKey | null = null;

                // 먼저 top-level instructions에서 검색
                for (const instr of txResponse.transaction.message.instructions) {
                    // 1. parsed된 시스템 프로그램 createAccount 인스트럭션이 있으면 사용
                    if (
                        instr.programId.equals(SystemProgram.programId) &&
                        "parsed" in instr &&
                        instr.parsed?.type === "createAccount"
                    ) {
                        const newAccount = instr.parsed.info.newAccount;
                        codeAccountPDA = new PublicKey(newAccount);
                        break;
                    }
                    // 2. parsed 정보가 없으면, accounts 프로퍼티가 있는지 타입 가드로 확인한 후,
                    //    accounts 배열의 3번째 요소를 code_account PDA로 사용
                    if ("accounts" in instr && Array.isArray((instr as any).accounts)) {
                        const accounts = (instr as any).accounts as string[];
                        if (
                            instr.programId.equals(programId) &&
                            accounts.length >= 3
                        ) {
                            const newAccountStr = accounts[2];
                            codeAccountPDA = new PublicKey(newAccountStr);
                            break;
                        }
                    }
                }

                // innerInstructions에서 검색 (top-level에서 찾지 못한 경우)
                if (!codeAccountPDA && txResponse.meta?.innerInstructions) {
                    for (const inner of txResponse.meta.innerInstructions) {
                        for (const instr of inner.instructions) {
                            if (
                                instr.programId.equals(SystemProgram.programId) &&
                                "parsed" in instr &&
                                instr.parsed?.type === "createAccount"
                            ) {
                                const newAccount = instr.parsed.info.newAccount;
                                codeAccountPDA = new PublicKey(newAccount);
                                break;
                            }
                        }
                        if (codeAccountPDA) break;
                    }
                }

                console.log("codeAccountPDA", codeAccountPDA);

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
        fetchCodeChain,
        finalizeGameMutation,
        fetchCodeAccount,
    }
}