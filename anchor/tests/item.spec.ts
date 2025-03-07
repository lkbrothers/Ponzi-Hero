import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Item } from "../target/types/item";
import { Credit } from "../target/types/credit";
import * as assert from "assert";

describe("item", () => {
    // 클라이언트가 로컬 클러스터(provider) 사용하도록 설정
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const itemProgram = anchor.workspace.Item as Program<Item>;
    const creditProgram = anchor.workspace.Credit as Program<Credit>;

    // 테스트용 Account Keypair
    const itemAccount = anchor.web3.Keypair.generate();
    const creditAccount = anchor.web3.Keypair.generate();
    let [creditAccountPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("credit"), provider.wallet.publicKey.toBuffer()], creditProgram.programId
    );

    // 검증용 데이터
    const validGrades = ["NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"];
    const validItems = [
        ["Normal Item Name 0001", "normal0001.png", "head"],
        ["Normal Item Name 0002", "normal0002.png", "body"],
        ["Normal Item Name 0003", "normal0003.png", "arms"],
        ["Normal Item Name 0004", "normal0004.png", "legs"],
        ["Normal Item Name 0005", "normal0005.png", "accessory"],
        ["Normal Item Name 0006", "normal0006.png", "head"],
        ["Normal Item Name 0007", "normal0007.png", "body"],
        ["Normal Item Name 0008", "normal0008.png", "arms"],
        ["Normal Item Name 0009", "normal0009.png", "legs"],
        ["Normal Item Name 0010", "normal0010.png", "accessory"],
        ["Rare Item Name 0001", "rare0001.png", "head"],
        ["Rare Item Name 0002", "rare0002.png", "body"],
        ["Rare Item Name 0003", "rare0003.png", "arms"],
        ["Rare Item Name 0004", "rare0004.png", "legs"],
        ["Rare Item Name 0005", "rare0005.png", "accessory"],
        ["Rare Item Name 0006", "rare0006.png", "head"],
        ["Rare Item Name 0007", "rare0007.png", "body"],
        ["Rare Item Name 0008", "rare0008.png", "arms"],
        ["Rare Item Name 0009", "rare0009.png", "legs"],
        ["Rare Item Name 0010", "rare0010.png", "accessory"],
        ["Epic Item Name 0001", "epic0001.png", "head"],
        ["Epic Item Name 0002", "epic0002.png", "body"],
        ["Epic Item Name 0003", "epic0003.png", "arms"],
        ["Epic Item Name 0004", "epic0004.png", "legs"],
        ["Epic Item Name 0005", "epic0005.png", "accessory"],
        ["Epic Item Name 0006", "epic0006.png", "head"],
        ["Epic Item Name 0007", "epic0007.png", "body"],
        ["Epic Item Name 0008", "epic0008.png", "arms"],
        ["Epic Item Name 0009", "epic0009.png", "legs"],
        ["Epic Item Name 0010", "epic0010.png", "accessory"],
        ["Unique Item Name 0001", "unique0001.png", "head"],
        ["Unique Item Name 0002", "unique0002.png", "body"],
        ["Unique Item Name 0003", "unique0003.png", "arms"],
        ["Unique Item Name 0004", "unique0004.png", "legs"],
        ["Unique Item Name 0005", "unique0005.png", "accessory"],
        ["Unique Item Name 0006", "unique0006.png", "head"],
        ["Unique Item Name 0007", "unique0007.png", "body"],
        ["Unique Item Name 0008", "unique0008.png", "arms"],
        ["Unique Item Name 0009", "unique0009.png", "legs"],
        ["Unique Item Name 0010", "unique0010.png", "accessory"],
        ["Legendary Item Name 0001", "legendary0001.png", "head"],
        ["Legendary Item Name 0002", "legendary0002.png", "body"],
        ["Legendary Item Name 0003", "legendary0003.png", "arms"],
        ["Legendary Item Name 0004", "legendary0004.png", "legs"],
        ["Legendary Item Name 0005", "legendary0005.png", "accessory"],
        ["Legendary Item Name 0006", "legendary0006.png", "head"],
        ["Legendary Item Name 0007", "legendary0007.png", "body"],
        ["Legendary Item Name 0008", "legendary0008.png", "arms"],
        ["Legendary Item Name 0009", "legendary0009.png", "legs"],
        ["Legendary Item Name 0010", "legendary0010.png", "accessory"],
        ["Degendary Item Name 0001", "degendary0001.png", "head"],
        ["Degendary Item Name 0002", "degendary0002.png", "body"],
        ["Degendary Item Name 0003", "degendary0003.png", "arms"],
        ["Degendary Item Name 0004", "degendary0004.png", "legs"],
        ["Degendary Item Name 0005", "degendary0005.png", "accessory"],
        ["Degendary Item Name 0006", "degendary0006.png", "head"],
        ["Degendary Item Name 0007", "degendary0007.png", "body"],
        ["Degendary Item Name 0008", "degendary0008.png", "arms"],
        ["Degendary Item Name 0009", "degendary0009.png", "legs"],
        ["Degendary Item Name 0010", "degendary0010.png", "accessory"],
    ]

    it("READ NFT ITEM ACCOUNT TEST (ACCOUNT NOT CREATED YET)", async () => {
        try {
            // ItemAccount 데이터 fetch 시도 (아직 생성되지 않았으므로 실패해야 함)
            await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
            assert.fail("Account should not exist yet");
        } catch (err) {
            console.log("As expected, Item account does not exist yet.");
        }
    });

    it("CREATE NFT ITEM ACCOUNT TEST", async () => {
        // 테스트용 NFT ITEM DATA
        const grade = "LEGENDARY";
        const name = "Test NFT ITEM Item Name: Excalibur";
        const uri = "https://picsum.photos/200/300";
        const part = "weapon";
        const equipped = false;

        await itemProgram.methods.createItemAccount(grade, name, uri, part, equipped)
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
            })
            .signers([itemAccount])
            .rpc();

        // 결과 확인
        const createdAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Created NFT ITEM Item Account:", createdAccount);
        assert.strictEqual(createdAccount.grade, grade, "Grade mismatch");
        assert.strictEqual(createdAccount.name, name, "Name mismatch");
        assert.strictEqual(createdAccount.uri, uri, "URI mismatch");
        assert.strictEqual(createdAccount.part, part, "Part mismatch");
        assert.strictEqual(createdAccount.equipped, equipped, "Equipped mismatch");
        assert.ok(createdAccount.owner.equals(provider.wallet.publicKey));
    });

    it("READ NFT ITEM ACCOUNT TEST (ACCOUNT CREATED)", async () => {
        const response = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Fetched Item Account Data:", response);
    });

    it("UPDATE NFT ITEM ACCOUNT TEST", async () => {
        // 테스트용 NFT ITEM DATA
        const grade = "LEGENDARY";
        const name = "Test NFT ITEM Item Name: Excalibur";
        const uri = "https://picsum.photos/300/200";
        const part = "weapon";
        const equipped = false;

        await itemProgram.methods.updateItemAccount(grade, name, uri, part, equipped)
            .accounts({
                itemAccount: itemAccount.publicKey,
            })
            .rpc();

        const updatedAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Updated NFT ITEM Account:", updatedAccount);
        assert.strictEqual(updatedAccount.grade, grade, "Updated Grade mismatch");
        assert.strictEqual(updatedAccount.name, name, "Updated Name mismatch");
        assert.strictEqual(updatedAccount.uri, uri, "Updated URI mismatch");
        assert.strictEqual(updatedAccount.part, part, "Updated Part mismatch");
        assert.strictEqual(updatedAccount.equipped, equipped, "Updated Equipped mismatch");
    });

    it("DELETE NFT ITEM ACCOUNT TEST", async () => {
        await itemProgram.methods.deleteItemAccount()
            .accounts({
                itemAccount: itemAccount.publicKey,
            })
            .rpc();

        try {
            await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
            assert.fail("Account should be deleted");
        } catch (err) {
            console.log("NFT ITEM account successfully deleted.");
        }
    });

    ///////////////////////////////////////////////////////////////////////////
    it("READ INVENTORY ITEM ACCOUNT TEST", async () => {
        const nums = 10;
        const createdItemAccounts: anchor.web3.Keypair[] = [];
        for (let i = 0; i < nums; i++) {
            const itemAccount = anchor.web3.Keypair.generate();
            createdItemAccounts.push(itemAccount);
            await itemProgram.methods.randomMintItem(i % 6, "dummy_tx_hash", "block_hash", new anchor.BN(12345), new anchor.BN(67890))
                .accounts({
                    owner: provider.wallet.publicKey,
                    itemAccount: itemAccount.publicKey,
                    // 아래 계정들은 테스트 목적으로 wallet의 publicKey를 dummy 값으로 사용합니다.
                    dbAccount: provider.wallet.publicKey,
                    codeAccount: provider.wallet.publicKey,
                    gameProgram: provider.wallet.publicKey,
                })
                .signers([itemAccount])
                .rpc();
        }

        // 트랜잭션 확정 대기
        await new Promise(resolve => setTimeout(resolve, 400 * nums));

        const filters = [{
            memcmp: {
                offset: 8, // 8바이트 discriminator 이후에 owner가 저장됨
                bytes: provider.wallet.publicKey.toString(),
            }
        }];

        // 필터를 통해 특정 Wallet 주소가 보유한 Item NFT 목록 조회
        const itemAccounts = await itemProgram.account.itemAccount.all(filters);
        console.log("Inventory NFT Item Accounts owned by", provider.wallet.publicKey.toString(), itemAccounts);

        // 각 생성한 더미 NFT ITEM 계정이 필터링 결과에 포함되는지 검증
        for (let i = 0; i < nums; i++) {
            const result = itemAccounts.some(account => account.publicKey.equals(createdItemAccounts[i].publicKey));
            assert.ok(result, `Fetched Created NFT Item [${i + 1}] Not Found in Filtered NFT Item Accounts`);
        }
    });

    ///////////////////////////////////////////////////////////////////////////
    it("SINGLE TYPE OF GACHA RANDOM RATE MINTING NFT ITEM TEST", async () => {
        const gachaType = 0;

        // 테스트용 Credit Account 생성
        await creditProgram.methods.createCreditAccount(new anchor.BN(1000))
            .accounts({
                owner: provider.wallet.publicKey,
            })
            .rpc();

        // 결과 확인 1
        const beforeGachaCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
        console.log("Credit Account Balance Before Gacha: ", beforeGachaCreditAccount.balance.toNumber());

        // 크레딧 지불 인스트럭션 생성
        const payIx = await creditProgram.methods.decreaseCreditAccount(new anchor.BN(10 ** gachaType))
            .accounts({
                creditAccount: creditAccountPda,
            })
            .instruction();
        
        // 가챠 아이템 보상 인스트럭션 생성
        const getIx = await itemProgram.methods.randomMintItem(6, "dummy_tx_hash", "block_hash", new anchor.BN(12345), new anchor.BN(67890))
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
                // 아래 계정들은 테스트 목적으로 wallet의 publicKey를 dummy 값으로 사용합니다.
                dbAccount: provider.wallet.publicKey,
                codeAccount: provider.wallet.publicKey,
                gameProgram: provider.wallet.publicKey,
            })
            .signers([itemAccount])
            .instruction();
        
        // 하나의 트랜잭션에 두 인스트럭션 추가 후 트랜잭션 전송 (생성을 위해 Signer 추가)
        const tx = new anchor.web3.Transaction(); tx.add(payIx, getIx);
        await provider.sendAndConfirm(tx, [itemAccount]);

        // 결과 확인 2: grade가 6개 등급 중 하나이고, name, uri, part 필드가 전체 아이템 목록 중에 존재해야 함.
        const afterGachaCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
        console.log("Credit Account Balance After Gacha: ", afterGachaCreditAccount.balance.toNumber());
        const mintedItemAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Random Minted Item Account Gacha Type {}:", gachaType, mintedItemAccount);
        assert.ok(validGrades.includes(mintedItemAccount.grade), "[ERROR] Invalid Grade from Random Mint Test");
        assert.ok(validItems.map(item => item[0]).includes(mintedItemAccount.name), "[ERROR] Invalid Name");
        assert.ok(validItems.map(item => item[1]).includes(mintedItemAccount.uri), "[ERROR] Invalid URI");
        assert.ok(validItems.map(item => item[2]).includes(mintedItemAccount.part), "[ERROR] Invalid Part");        
        assert.strictEqual(mintedItemAccount.equipped, false, "[ERROR] Equipped should be false by default");
        assert.ok(mintedItemAccount.owner.equals(provider.wallet.publicKey), "[ERROR] Owner mismatch");
    });
    
    it("ALL TYPES OF GACHA RANDOM RATE MINTING NFT ITEM TEST", async () => {            
        // 유효한 가챠 타입: 0 ~ 5 (6개 가챠 중 하나 선택)        
        for (let gachaType = 0; gachaType < 6; gachaType++) {
            // 크레딧 초기화 (10_000 크레딧)
            await creditProgram.methods.updateCreditAccount(new anchor.BN(100000))
            .accounts({
                creditAccount: creditAccountPda,
            })
            .rpc();

            // 결과 확인 1
            const beforeGachaCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
            console.log("Credit Account Balance Before Gacha: ", beforeGachaCreditAccount.balance.toNumber());

            // 크레딧 지불 인스트럭션 생성
            const payIx = await creditProgram.methods.decreaseCreditAccount(new anchor.BN(10 ** gachaType))
                .accounts({
                    creditAccount: creditAccountPda,
                })
                .instruction();
            
            // 가챠 아이템 보상 인스트럭션 생성
            const itemAccount = anchor.web3.Keypair.generate();
            const getIx = await itemProgram.methods.randomMintItem(6, "dummy_tx_hash", "block_hash", new anchor.BN(12345), new anchor.BN(67890))
                .accounts({
                    owner: provider.wallet.publicKey,
                    itemAccount: itemAccount.publicKey,
                    // 아래 계정들은 테스트 목적으로 wallet의 publicKey를 dummy 값으로 사용합니다.
                    dbAccount: provider.wallet.publicKey,
                    codeAccount: provider.wallet.publicKey,
                    gameProgram: provider.wallet.publicKey,
                })
                .signers([itemAccount])
                .instruction();
            
            // 하나의 트랜잭션에 두 인스트럭션 추가 후 트랜잭션 전송 (생성을 위해 Signer 추가)
            const tx = new anchor.web3.Transaction(); tx.add(payIx, getIx);
            await provider.sendAndConfirm(tx, [itemAccount]);

            // 결과 확인 2: grade가 6개 등급 중 하나이고, name, uri, part 필드가 전체 아이템 목록 중에 존재해야 함.
            const afterGachaCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
            console.log("Credit Account Balance After Gacha: ", afterGachaCreditAccount.balance.toNumber());
            const mintedItemAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
            console.log("Random Minted Item Account Gacha Type {}:", gachaType, mintedItemAccount);
            assert.ok(validGrades.includes(mintedItemAccount.grade), "[ERROR] Invalid Grade from Random Mint Test");
            assert.ok(validItems.map(item => item[0]).includes(mintedItemAccount.name), "[ERROR] Invalid Name");
            assert.ok(validItems.map(item => item[1]).includes(mintedItemAccount.uri), "[ERROR] Invalid URI");
            assert.ok(validItems.map(item => item[2]).includes(mintedItemAccount.part), "[ERROR] Invalid Part");        
            assert.strictEqual(mintedItemAccount.equipped, false, "[ERROR] Equipped should be false by default");
            assert.ok(mintedItemAccount.owner.equals(provider.wallet.publicKey), "[ERROR] Owner mismatch");
        }
    });

    /////////////////////////////////////////////////////////////////////////
    it("ALL TYPES OF GACHA PROBABILITY DISTRIBUTION VALIDATE TEST", async () => {
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
        const ITERATION = 100;
        for (let gachaType = 0; gachaType < NUM_GACHA; gachaType++) {
            let freq: { [grade: string]: number } = {};
            for (const grade of GRADE_NAMES) {
                freq[grade] = 0;
            }

            // ITERATION 만큼 민팅 실행
            for (let i = 0; i < ITERATION; i++) {
                // 매 반복마다 새로운 itemAccount 생성
                const itemAccount = anchor.web3.Keypair.generate();
                await itemProgram.methods.randomMintItem(i % 6, "dummy_tx_hash", "block_hash", new anchor.BN(12345), new anchor.BN(67890))
                    .accounts({
                        owner: provider.wallet.publicKey,
                        itemAccount: itemAccount.publicKey,
                        // 아래 계정들은 테스트 목적으로 wallet의 publicKey를 dummy 값으로 사용합니다.
                        dbAccount: provider.wallet.publicKey,
                        codeAccount: provider.wallet.publicKey,
                        gameProgram: provider.wallet.publicKey,
                    })
                    .signers([itemAccount])
                    .rpc();

                const mintedItem = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
                freq[mintedItem.grade] += 1;
            }
            console.log(`Gacha Type ${gachaType} frequency:`, freq);

            // 기대 확률 계산: 가챠별 각 등급의 기대 확률 = weight / total_weight, 총합은 100
            const weights = GACHA_WEIGHTS[gachaType];
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            for (let gradeIndex = 0; gradeIndex < NUM_GRADE; gradeIndex++) {
                const actualRate = freq[GRADE_NAMES[gradeIndex]] / ITERATION;
                const expectedRate = weights[gradeIndex] / totalWeight;  // 0 ~ 1
                console.log(`Gacha Type ${gachaType} - Grade ${GRADE_NAMES[gradeIndex]}: Actual Rate ${actualRate * 100}% vs Expected Rate ${expectedRate * 100}% (±10%)`);
                
                // 각 등급에 대해 실제 등장 비율과 기대 비율을 비교 (허용 오차: ±10% relative)
                const tolerance = 0.10; // 10%
                assert.ok(
                    Math.abs(actualRate - expectedRate) <= tolerance,
                    `For Gacha Type ${gachaType} Grade ${GRADE_NAMES[gradeIndex]}, Expected Probability ${expectedRate * 100}% (±10%) but got ${actualRate * 100}%`
                );
            }
        }
    });

});
