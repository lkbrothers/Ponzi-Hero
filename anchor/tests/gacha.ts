import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gacha } from "../target/types/gacha";
import * as assert from "assert";

describe("gacha", () => {
    // 로컬 클러스터(provider) 설정
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.Gacha as Program<Gacha>;

    // 테스트용 NFT Account Keypair
    const itemAccount = anchor.web3.Keypair.generate();

    const validGrades = ["NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"];
    const validImages = [
        // NORMAL images
        "normal0001.png", "normal0002.png", "normal0003.png", "normal0004.png", "normal0005.png",
        "normal0006.png", "normal0007.png", "normal0008.png", "normal0009.png", "normal0010.png",
        // RARE images
        "rare0001.png", "rare0002.png", "rare0003.png", "rare0004.png", "rare0005.png",
        "rare0006.png", "rare0007.png", "rare0008.png", "rare0009.png", "rare0010.png",
        // EPIC images
        "epic0001.png", "epic0002.png", "epic0003.png", "epic0004.png", "epic0005.png",
        "epic0006.png", "epic0007.png", "epic0008.png", "epic0009.png", "epic0010.png",
        // UNIQUE images
        "unique0001.png", "unique0002.png", "unique0003.png", "unique0004.png", "unique0005.png",
        "unique0006.png", "unique0007.png", "unique0008.png", "unique0009.png", "unique0010.png",
        // LEGENDARY images
        "legendary0001.png", "legendary0002.png", "legendary0003.png", "legendary0004.png", "legendary0005.png",
        "legendary0006.png", "legendary0007.png", "legendary0008.png", "legendary0009.png", "legendary0010.png",
        // DEGENDARY images
        "degendary0001.png", "degendary0002.png", "degendary0003.png", "degendary0004.png", "degendary0005.png",
        "degendary0006.png", "degendary0007.png", "degendary0008.png", "degendary0009.png", "degendary0010.png",
    ];

    it("SINGLE RANDOM RATE MINTING NFT TEST", async () => {
        await program.methods.mintItem(0)
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
            })
            .signers([itemAccount])
            .rpc();

        const mintedItemAccount = await program.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Minted Item Account:", mintedItemAccount);

        assert.ok(validGrades.includes(mintedItemAccount.grade), "[ERROR] Invalid Grade");
        assert.ok(validImages.includes(mintedItemAccount.image), "[ERROR] Invalid Image");
        assert.ok(mintedItemAccount.owner.equals(provider.wallet.publicKey), "[ERROR] Owner Mismatch");
    });

    it("ALL TYPES OF GACHA RANDOM RATE MINTING NFT TEST", async () => {
        // gacha_type는 0부터 5까지 테스트
        for (let gachaType = 0; gachaType < 6; gachaType++) {
            // 각 gacha_type마다 새로운 itemAccount 생성
            const itemAccount = anchor.web3.Keypair.generate();
            await program.methods.mintItem(gachaType)
                .accounts({
                    itemAccount: itemAccount.publicKey,
                    owner: provider.wallet.publicKey,
                })
                .signers([itemAccount])
                .rpc();

            const mintedItem = await program.account.itemAccount.fetch(itemAccount.publicKey);
            console.log(`Gacha Type ${gachaType} - Minted Item:`, mintedItem);
            assert.ok(validGrades.includes(mintedItem.grade), `Invalid grade for gacha type ${gachaType}`);
            assert.ok(validImages.includes(mintedItem.image), `Invalid image for gacha type ${gachaType}`);
            assert.ok(mintedItem.owner.equals(provider.wallet.publicKey), `Owner mismatch for gacha type ${gachaType}`);
        }
    });

    it("RANDOM RATE MINTING NFT PROBABILITY DISTRIBUTION", async () => {
        const GRADE_NAMES = ["NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"];
        const GACHA_WEIGHTS: number[][] = [
            [60, 25, 10, 4, 1, 0],  // 가챠 0
            [55, 25, 10, 4, 4, 2],  // 가챠 1
            [50, 25, 10, 4, 7, 4],  // 가챠 2
            [45, 25, 10, 4, 9, 7],  // 가챠 3
            [40, 25, 10, 4, 9, 12], // 가챠 4
            [35, 25, 10, 4, 9, 17], // 가챠 5
        ];

        const NUM_GACHA = 6;
        const NUM_GRADE = 6;
        const iterations = 100;
        for (let gachaType = 0; gachaType < NUM_GACHA; gachaType++) {
            let freq: { [grade: string]: number } = {};
            for (const grade of GRADE_NAMES) {
                freq[grade] = 0;
            }

            // iterations 만큼 민팅 실행
            for (let i = 0; i < iterations; i++) {
                // 매 반복마다 새로운 itemAccount 생성
                const itemAccount = anchor.web3.Keypair.generate();
                await program.methods.mintItem(gachaType)
                    .accounts({
                        itemAccount: itemAccount.publicKey,
                        owner: provider.wallet.publicKey,
                    })
                    .signers([itemAccount])
                    .rpc();

                const mintedItem = await program.account.itemAccount.fetch(itemAccount.publicKey);
                freq[mintedItem.grade] += 1;
            }
            console.log(`Gacha Type ${gachaType} frequency:`, freq);

            // 기대 확률 계산: 가챠별 각 등급의 기대 확률 = weight / total_weight, 총합은 100
            const weights = GACHA_WEIGHTS[gachaType];
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            for (let gradeIndex = 0; gradeIndex < NUM_GRADE; gradeIndex++) {
                const actualProb = freq[GRADE_NAMES[gradeIndex]] / iterations;
                const expectedProb = weights[gradeIndex] / totalWeight;  // 0 ~ 1
                console.log(`Gacha Type ${gachaType} - Grade ${GRADE_NAMES[gradeIndex]}: actual ${actualProb * 100}% vs expected ${expectedProb * 100}% +-10%`);
                
                // 각 등급에 대해 실제 등장 비율과 기대 비율을 비교 (허용 오차: ±10% relative)
                const tolerance = 0.10; // 10%
                assert.ok(
                    Math.abs(actualProb - expectedProb) <= tolerance,
                    `For gacha type ${gachaType} grade ${GRADE_NAMES[gradeIndex]}, expected probability ${expectedProb * 100}% +-10% but got ${actualProb * 100}%`
                );
            }
        }
    });

});
