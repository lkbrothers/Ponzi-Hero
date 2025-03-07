import { useAnchorProvider } from "@/components/solana/solana-provider";
import { useCluster } from "@/components/cluster/cluster-data-access";
import { getItemProgram, getItemProgramId } from "@project/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import * as anchor from '@coral-xyz/anchor';

export function useInventoryProgram() {
    const { cluster } = useCluster();
    const provider = useAnchorProvider();
    const programId = useMemo(() => getItemProgramId(cluster.network as Cluster), [cluster]);
    const program = useMemo(() => getItemProgram(provider, programId), [provider, programId]);
    return program;
}

export function useInventoryItems() {
    const program = useInventoryProgram();
    const provider = useAnchorProvider();

    const fetchUserItems = useCallback(async () => {
        if (!provider?.wallet?.publicKey) {
            return [];
        }

        // 필터 설정 - 현재 지갑 소유자의 아이템만 조회
        const filters = [{
            memcmp: {
                offset: 8, // 8바이트 discriminator 이후에 owner가 저장됨
                bytes: provider.wallet.publicKey.toString(),
            }
        }];

        try {
            // 필터를 통해 현재 Wallet 주소가 보유한 Item 목록 조회
            const itemAccounts = await program.account.itemAccount.all(filters);
            return itemAccounts;
        } catch (error) {
            console.error("인벤토리 아이템 조회 중 오류 발생:", error);
            return [];
        }
    }, [program, provider]);

    const mintItem = useCallback(async (
        itemType: number,
        txHash: string,
        blockHash: string,
        timestamp: number,
        seed: number
    ) => {
        if (!provider?.wallet?.publicKey) {
            throw new Error("지갑이 연결되지 않았습니다");
        }

        try {
            // 새 아이템 계정 생성
            const itemAccount = await program.provider.connection.getRecentBlockhash()
                .then(({ blockhash }) => {
                    // 블록해시를 시드로 사용하여 새 키페어 생성
                    return program.provider.connection.getAccountInfo(new PublicKey(blockhash.substring(0, 32)))
                        .then(() => new PublicKey(blockhash.substring(0, 32)));
                });

            // 아이템 민팅 트랜잭션 실행
            const tx = await program.methods.randomMintItem(
                itemType,
                txHash,
                blockHash,
                new anchor.BN(timestamp),
                new anchor.BN(seed)
            )
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount,
                dbAccount: provider.wallet.publicKey, // 실제 구현에서는 적절한 계정으로 대체
                codeAccount: provider.wallet.publicKey, // 실제 구현에서는 적절한 계정으로 대체
                gameProgram: provider.wallet.publicKey, // 실제 구현에서는 적절한 계정으로 대체
            })
            .rpc();

            return {
                success: true,
                txId: tx,
                itemAccount
            };
        } catch (error) {
            console.error("아이템 민팅 중 오류 발생:", error);
            throw error;
        }
    }, [program, provider]);

    const updateEquipItem = useCallback(async (
        fromEquipped: boolean,
        toEquipped: boolean,
        fromItemAccountPublicKey: PublicKey | null,
        toItemAccountPublicKey: PublicKey | null
    ) => {
        let updateFromItemAccountIx = null;
        if (fromItemAccountPublicKey !== null) {
            updateFromItemAccountIx = await program.methods.updateItemAccount(
                null,
                null,
                null,
                null,
                fromEquipped
            )
            .accounts({
                itemAccount: fromItemAccountPublicKey,
            })
            .instruction();
        }

        let updateToItemAccountIx = null;
        if (toItemAccountPublicKey !== null) {
            updateToItemAccountIx = await program.methods.updateItemAccount(
                null,
                null,
                null,
                null,
                toEquipped
            )
            .accounts({
                itemAccount: toItemAccountPublicKey,
            })
            .instruction();
        }

        const tx = new anchor.web3.Transaction();
        if (updateFromItemAccountIx) tx.add(updateFromItemAccountIx);
        if (updateToItemAccountIx) tx.add(updateToItemAccountIx);
        await provider.sendAndConfirm(tx);

    }, [program, provider]);
    

    return {
        fetchUserItems,
        mintItem,
        updateEquipItem
    };
}