import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Nft } from "../target/types/nft";
import * as assert from "assert";

describe("nft", () => {
    // 로컬 클러스터(provider) 설정
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.Nft as Program<Nft>;

    // 테스트용 NFT Account Keypair
    const nftAccount = anchor.web3.Keypair.generate();

    // 테스트용 NFT Name, URI
    const testNFTName = "Test NFT Name";
    const testNFTUri = "https://picsum.photos/200/300";

    it("READ NFT ACCOUNT TEST (account not created yet)", async () => {
        try {
            await program.account.nftAccount.fetch(nftAccount.publicKey);
            assert.fail("Account should not exist yet");
        } catch (err) {
            console.log("As expected, NFT account does not exist yet.");
        }
    });

    it("CREATE NFT ACCOUNT TEST", async () => {
        await program.methods.createNftAccount(testNFTName, testNFTUri)
            .accounts({
                nftAccount: nftAccount.publicKey,
                owner: provider.wallet.publicKey,
            })
            .signers([nftAccount])
            .rpc();
        // 생성된 Account 데이터를 가져와 확인
        const createdAccount = await program.account.nftAccount.fetch(nftAccount.publicKey);
        console.log("Created NFT Account:", createdAccount);
        assert.strictEqual(createdAccount.name, testNFTName);
        assert.strictEqual(createdAccount.uri, testNFTUri);
        assert.ok(createdAccount.owner.equals(provider.wallet.publicKey));
    });

    it("READ NFT ACCOUNT TEST", async () => {
        const account = await program.account.nftAccount.fetch(nftAccount.publicKey);
        console.log("Read NFT Account:", account);
        assert.strictEqual(account.name, testNFTName);
        assert.strictEqual(account.uri, testNFTUri);
    });

    it("UPDATE NFT ACCOUNT TEST", async () => {
        const newName = "Updated NFT";
        const newUri = "https://picsum.photos/300/200";

        await program.methods.updateNftAccount(newName, newUri)
            .accounts({
                nftAccount: nftAccount.publicKey,
            })
            .rpc();

        const updatedAccount = await program.account.nftAccount.fetch(nftAccount.publicKey);
        console.log("Updated NFT Account:", updatedAccount);
        assert.strictEqual(updatedAccount.name, newName);
        assert.strictEqual(updatedAccount.uri, newUri);
    });

    it("DELETE NFT ACCOUNT TEST", async () => {
        await program.methods.deleteNftAccount()
            .accounts({
                nftAccount: nftAccount.publicKey,
            })
            .rpc();

        try {
            await program.account.nftAccount.fetch(nftAccount.publicKey);
            assert.fail("Account should be deleted");
        } catch (err) {
            console.log("NFT account successfully deleted.");
        }
    });

    // 랜덤 NFT 민팅 테스트를 위해 새 Keypair 생성
    const randomNftAccount = anchor.web3.Keypair.generate();
    it("MINT RANDOM NFT ACCOUNT TEST", async () => {
        await program.methods.mintRandomNftAccount()
            .accounts({
                nftAccount: randomNftAccount.publicKey,
                owner: provider.wallet.publicKey,
            })
            .signers([randomNftAccount])
            .rpc();

        // 미리 정의된 값: "NFT Alpha", "NFT Beta", "NFT Gamma"
        const possibleNames = ["NFT Alpha", "NFT Beta", "NFT Gamma"];
        const possibleUris = [
            "https://example.com/nft_alpha.json",
            "https://example.com/nft_beta.json",
            "https://example.com/nft_gamma.json",
        ];

        const randomAccount = await program.account.nftAccount.fetch(randomNftAccount.publicKey);
        console.log("Random Minted NFT Account:", randomAccount);
        assert.ok(possibleNames.includes(randomAccount.name));
        assert.ok(possibleUris.includes(randomAccount.uri));
    });

    it("READ NFT ACCOUNT INVENTORY TEST", async () => {
        const nums = 10;
        const dummyNFTAccounts = [];
        for (let i = 0; i < nums; i++) {
            const dummyNFTAccount = anchor.web3.Keypair.generate();
            dummyNFTAccounts.push(dummyNFTAccount);

            await program.methods.createNftAccount(`Dummy NFT Name ${i + 1}`, `https://example.com/dummy/${i + 1}.json`)
                .accounts({
                    nftAccount: dummyNFTAccount.publicKey,
                    owner: provider.wallet.publicKey,
                })
                .signers([dummyNFTAccount])
                .rpc();
        }

        // 잠시 기다림: 트랜잭션 확정 대기 (선택 사항)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const filters = [{
            memcmp: {
                offset: 8,
                bytes: provider.wallet.publicKey.toString(),
            }
        }];

        // 필터를 통해 NFT 계정들을 조회
        const nftAccounts = await program.account.nftAccount.all(filters);
        console.log("NFT Accounts owned by", provider.wallet.publicKey.toString(), nftAccounts);

        // 각 생성한 더미 NFT 계정이 필터링 결과에 포함되는지 검증
        for (let i = 0; i < nums; i++) {
            // fetch를 통해 생성된 더미 NFT 계정 데이터 확인 (선택사항)
            const dummyNFTAccount = await program.account.nftAccount.fetch(dummyNFTAccounts[i].publicKey);
            console.log(`Fetched Created Dummy NFT Name ${i + 1}:`, dummyNFTAccount);

            // 필터링된 결과에 dummyNftKeypairs[i]가 있는지 확인
            const result = nftAccounts.some(acc => acc.publicKey.equals(dummyNFTAccounts[i].publicKey));
            assert.ok(result, `Fetched Created Dummy NFT Name ${i + 1} not found in filtered NFT accounts`);
        }
    });

});
