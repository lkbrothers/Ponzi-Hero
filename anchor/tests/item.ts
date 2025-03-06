import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Item } from "../target/types/item";
import * as assert from "assert";

describe("item", () => {
    // 클라이언트가 로컬 클러스터(provider) 사용하도록 설정
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.Item as Program<Item>;

    // 테스트용 Item Account Keypair
    const itemAccount = anchor.web3.Keypair.generate();
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
            await program.account.itemAccount.fetch(itemAccount.publicKey);
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

        await program.methods.createItemAccount(grade, name, uri, part, equipped)
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
            })
            .signers([itemAccount])
            .rpc();

        // 결과 확인
        const createdAccount = await program.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Created NFT ITEM Item Account:", createdAccount);
        assert.strictEqual(createdAccount.grade, grade, "Grade mismatch");
        assert.strictEqual(createdAccount.name, name, "Name mismatch");
        assert.strictEqual(createdAccount.uri, uri, "URI mismatch");
        assert.strictEqual(createdAccount.part, part, "Part mismatch");
        assert.strictEqual(createdAccount.equipped, equipped, "Equipped mismatch");
        assert.ok(createdAccount.owner.equals(provider.wallet.publicKey));
    });

    it("READ NFT ITEM ACCOUNT TEST (ACCOUNT CREATED)", async () => {
        const response = await program.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Fetched Item Account Data:", response);
    });

    it("UPDATE NFT ITEM ACCOUNT TEST", async () => {
        // 테스트용 NFT ITEM DATA
        const grade = "LEGENDARY";
        const name = "Test NFT ITEM Item Name: Excalibur";
        const uri = "https://picsum.photos/300/200";
        const part = "weapon";
        const equipped = false;

        await program.methods.updateItemAccount(grade, name, uri, part, equipped)
            .accounts({
                itemAccount: itemAccount.publicKey,
            })
            .rpc();

        const updatedAccount = await program.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Updated NFT ITEM Account:", updatedAccount);
        assert.strictEqual(updatedAccount.grade, grade, "Updated Grade mismatch");
        assert.strictEqual(updatedAccount.name, name, "Updated Name mismatch");
        assert.strictEqual(updatedAccount.uri, uri, "Updated URI mismatch");
        assert.strictEqual(updatedAccount.part, part, "Updated Part mismatch");
        assert.strictEqual(updatedAccount.equipped, equipped, "Updated Equipped mismatch");
    });

    it("DELETE NFT ITEM ACCOUNT TEST", async () => {
        await program.methods.deleteItemAccount()
            .accounts({
                itemAccount: itemAccount.publicKey,
            })
            .rpc();

        try {
            await program.account.itemAccount.fetch(itemAccount.publicKey);
            assert.fail("Account should be deleted");
        } catch (err) {
            console.log("NFT ITEM account successfully deleted.");
        }
    });

    ///////////////////////////////////////////////////////////////////////////
    it("RANDOM MINT ITEM TEST", async () => {
        // 유효한 가챠 타입: 0 ~ 5 (6개 가챠 중 하나 선택)        
        const gachaType = 3; 
        await program.methods.randomMintItem(gachaType)
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
            })
            .signers([itemAccount])
            .rpc();

        // 결과 확인: grade가 6개 등급 중 하나이고, name, uri, part 필드가 비어있지 않아야 함.        
        const mintedItemAccount = await program.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Random Minted Item Account:", mintedItemAccount);
        assert.ok(validGrades.includes(mintedItemAccount.grade), "[ERROR] Invalid Grade from Random Mint Test");
        assert.ok(validItems.map(item => item[0]).includes(mintedItemAccount.name), "[ERROR] Invalid Name");
        assert.ok(validItems.map(item => item[1]).includes(mintedItemAccount.uri), "[ERROR] Invalid URI");
        assert.ok(validItems.map(item => item[2]).includes(mintedItemAccount.part), "[ERROR] Invalid Part");        
        assert.strictEqual(mintedItemAccount.equipped, false, "[ERROR] Equipped should be false by default");
        assert.ok(mintedItemAccount.owner.equals(provider.wallet.publicKey), "[ERROR] Owner mismatch");
    });

    it("READ INVENTORY ITEM ACCOUNT TEST", async () => {
        const nums = 10;
        const createdItemAccounts = [];
        for (let i = 0; i < nums; i++) {
            const itemAccount = anchor.web3.Keypair.generate();
            createdItemAccounts.push(itemAccount);
            await program.methods.randomMintItem(i % 6)
                .accounts({
                    owner: provider.wallet.publicKey,
                    itemAccount: itemAccount.publicKey,
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
        const itemAccounts = await program.account.itemAccount.all(filters);
        console.log("Inventory NFT Item Accounts owned by", provider.wallet.publicKey.toString(), itemAccounts);

        // 각 생성한 더미 NFT ITEM 계정이 필터링 결과에 포함되는지 검증
        for (let i = 0; i < nums; i++) {
            const result = itemAccounts.some(account => account.publicKey.equals(createdItemAccounts[i].publicKey));
            assert.ok(result, `Fetched Created NFT Item [${i + 1}] Not Found in Filtered NFT Item Accounts`);
        }
    });

    // // 랜덤 NFT ITEM 민팅 테스트를 위해 새 Keypair 생성
    // const randomItemAccount = anchor.web3.Keypair.generate();
    // it("MINT RANDOM NFT ITEM ACCOUNT TEST", async () => {
    //     await program.methods.randomMintItem()
    //         .accounts({
    //             itemAccount: randomItemAccount.publicKey,
    //             owner: provider.wallet.publicKey,
    //         })
    //         .signers([randomItemAccount])
    //         .rpc();

    //     // 미리 정의된 값: "NFT ITEM Alpha", "NFT ITEM Beta", "NFT ITEM Gamma"
    //     const possibleNames = ["NFT ITEM Alpha", "NFT ITEM Beta", "NFT ITEM Gamma"];
    //     const possibleUris = [
    //         "https://example.com/nft_alpha.json",
    //         "https://example.com/nft_beta.json",
    //         "https://example.com/nft_gamma.json",
    //     ];

    //     const randomAccount = await program.account.itemAccount.fetch(randomItemAccount.publicKey);
    //     console.log("Random Minted NFT ITEM Account:", randomAccount);
    //     assert.ok(possibleNames.includes(randomAccount.name));
    //     assert.ok(possibleUris.includes(randomAccount.uri));
    // });

});
