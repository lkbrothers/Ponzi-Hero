import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Nft } from "../target/types/nft";
import { Shop } from "../target/types/shop";
import { Credit } from "../target/types/credit";
import * as assert from "assert";

describe("shop", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const nftProgram = anchor.workspace.Nft as Program<Nft>;
    const shopProgram = anchor.workspace.Shop as Program<Shop>;
    const creditProgram = anchor.workspace.Credit as Program<Credit>;

    // 테스트용 Account Keypair
    const nftAccount = anchor.web3.Keypair.generate();
    const creditAccount = anchor.web3.Keypair.generate();

    // NFT 메타데이터를 배열로 선언 (타입, 이름, URI, 비용)
    const nftItems = [
        { type: 0, name: "NFT Alpha", uri: "https://example.com/nft_alpha.json", cost: 10 },
        { type: 1, name: "NFT Beta", uri: "https://example.com/nft_beta.json", cost: 20 },
        { type: 2, name: "NFT Gamma", uri: "https://example.com/nft_gamma.json", cost: 30 },
    ];

    it("EXCHANGE NFT TO CREDIT TEST", async () => {
        // 테스트용 Credit Account 생성
        await creditProgram.methods.createCreditAccount(new anchor.BN(0))
            .accounts({
                creditAccount: creditAccount.publicKey,
                owner: provider.wallet.publicKey,
            })
            .signers([creditAccount])
            .rpc();

        // 테스트용 NFT Account 생성
        await nftProgram.methods.createNftAccount(nftItems[1].name, nftItems[1].uri)
            .accounts({
                nftAccount: nftAccount.publicKey,
                owner: provider.wallet.publicKey,
            })
            .signers([nftAccount])
            .rpc();

        // NFT → CREDIT 교환: exchange_nft_to_credit 호출
        await shopProgram.methods.exchangeNftToCredit()
            .accounts({
                nftAccount: nftAccount.publicKey,
                creditAccount: creditAccount.publicKey,
                nftProgram: nftProgram.programId,
                creditProgram: creditProgram.programId,
            })
            .rpc();


        // Credit Account의 잔액은 "NFT Beta" 보상 20이 추가되어야 함
        const exchangedCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("Credit balance after exchange:", exchangedCreditAccount.balance.toNumber());
        assert.strictEqual(exchangedCreditAccount.balance.toNumber(), nftItems[1].cost);

        // NFT Account는 close 속성에 의해 소멸되어야 하므로, fetch 시 실패해야 함
        try {
            await nftProgram.account.nftAccount.fetch(nftAccount.publicKey);
            assert.fail("NFT account should be closed");
        } catch (err) {
            console.log("NFT account successfully closed.");
        }
    });

    it("EXCHANGE CREDIT TO NFT TEST", async () => {
        // 테스트용 Credit Account 수정
        await creditProgram.methods.updateCreditAccount(new anchor.BN(100))
            .accounts({
                creditAccount: creditAccount.publicKey,
            })
            .rpc();

        // 테스트용 NFT Account 생성
        const newNftAccount = anchor.web3.Keypair.generate();
        await nftProgram.methods.createNftAccount(nftItems[2].name, nftItems[2].uri)
            .accounts({
                nftAccount: newNftAccount.publicKey,
                owner: provider.wallet.publicKey,
            })
            .signers([newNftAccount])
            .rpc();

        // Credit → NFT 교환: nft_type 2 선택 (NFT Gamma, 비용 30)
        await shopProgram.methods.exchangeCreditToNft(2)
            .accounts({
                creditAccount: creditAccount.publicKey,
                nftAccount: newNftAccount.publicKey,
                creditProgram: creditProgram.programId,
                nftProgram: nftProgram.programId,
            })
            // .signers([newNftAccount])
            .rpc();

        // 새로 생성된 NFT Account 의 데이터 확인: NFT Gamma, 해당 URI, owner 일치
        const createdNftAccount = await nftProgram.account.nftAccount.fetch(newNftAccount.publicKey);
        console.log("Exchanged NFT account data:", createdNftAccount);
        assert.strictEqual(createdNftAccount.name, nftItems[2].name);
        assert.strictEqual(createdNftAccount.uri, nftItems[2].uri);
        assert.ok(createdNftAccount.owner.equals(provider.wallet.publicKey));

        // CreditAccount 잔액은 100 - 30 = 70이어야 함
        const exchangedCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("Credit balance after exchange:", exchangedCreditAccount.balance.toNumber());
        assert.strictEqual(exchangedCreditAccount.balance.toNumber(), 70);
    });

});
