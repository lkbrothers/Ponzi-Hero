import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Shop } from "../target/types/shop";
import { Item } from "../target/types/item";
import { Credit } from "../target/types/credit";
import * as assert from "assert";

describe("shop", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const shopProgram = anchor.workspace.Shop as Program<Shop>;
    const itemProgram = anchor.workspace.Item as Program<Item>;
    const creditProgram = anchor.workspace.Credit as Program<Credit>;

    // 테스트용 Account Keypair
    const itemAccount = anchor.web3.Keypair.generate();
    const creditAccount = anchor.web3.Keypair.generate();
    // const creditAccount = anchor.web3.Keypair.generate();
    let [creditAccountPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("credit"), provider.wallet.publicKey.toBuffer()], creditProgram.programId
    );

    it("EXCHANGE NFT ITEM TO CREDIT TEST", async () => {
        // 테스트용 Credit Account 생성
        await creditProgram.methods.createCreditAccount(new anchor.BN(0))
            .accounts({
                owner: provider.wallet.publicKey,
            })
            .rpc();

        // 테스트용 NFT Item Account 생성
        await itemProgram.methods.randomMintItem(0)
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
            })
            .signers([itemAccount])
            .rpc();

        // 결과 확인 1
        const createdCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
        const createdItemAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Created Credit Account Balance Before Exchange: ", createdCreditAccount.balance.toNumber());
        console.log("Created Item Account Information: ", createdItemAccount);

        // NFT → CREDIT 교환: exchange_nft_to_credit 호출
        await shopProgram.methods.exchangeItemToCredit()
            .accounts({
                itemAccount: itemAccount.publicKey,
                creditAccount: creditAccountPda,
                itemProgram: itemProgram.programId,
                creditProgram: creditProgram.programId,
            })
            .rpc();

        // 결과 확인 2
        // Credit Account의 잔액은 보상이 추가되어야 함
        const exchangedCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
        console.log("Created Credit Account Balance After Exchange: ", exchangedCreditAccount.balance.toNumber());

        // NFT Item Account는 close 속성에 의해 소멸되어야 하므로, fetch 시 실패해야 함
        try {
            await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
            assert.fail("NFT account should be closed");
        } catch (err) {
            console.log("NFT account successfully closed.");
        }
    });

    it("EXCHANGE CREDIT TO NFT ITEM TEST", async () => {
        // 테스트용 Credit Account 수정
        await creditProgram.methods.updateCreditAccount(new anchor.BN(1000))
            .accounts({
                creditAccount: creditAccountPda,
            })
            .rpc();

        // 테스트용 NFT Item Account 생성
        await itemProgram.methods.randomMintItem(0)
            .accounts({
                owner: provider.wallet.publicKey,
                itemAccount: itemAccount.publicKey,
            })
            .signers([itemAccount])
            .rpc();

        // 결과 확인 1
        const createdCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
        const createdItemAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Created Credit Account Balance Before Exchange: ", createdCreditAccount.balance.toNumber());
        console.log("Created Item Account Information: ", createdItemAccount);

        // Credit → NFT 교환: Item Key 입력 (DEGEN_0007번 아이템, 600크레딧)
        await shopProgram.methods.exchangeCreditToItem("DEGEN_0007")
            .accounts({
                creditAccount: creditAccountPda,
                itemAccount: itemAccount.publicKey,
                creditProgram: creditProgram.programId,
                itemProgram: itemProgram.programId,
            })
            // .signers([newNftAccount])
            .rpc();

        // 결과 확인 2
        // CreditAccount 잔액은 1000 - 600 = 400이어야 함
        const exchangedCreditAccount = await creditProgram.account.creditAccount.fetch(creditAccountPda);
        const exchangedItemAccount = await itemProgram.account.itemAccount.fetch(itemAccount.publicKey);
        console.log("Exchanged Credit Account Balance After Exchange: ", exchangedCreditAccount.balance.toNumber());
        console.log("Exchanged Item Account Information: ", exchangedItemAccount);
        assert.strictEqual(exchangedCreditAccount.balance.toNumber(), 400);
    });
});
