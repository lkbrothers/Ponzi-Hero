import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Credit } from "../target/types/credit";
import * as assert from "assert";

describe("credit", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.Credit as Program<Credit>;

    // 테스트용 Account Keypair
    const creditAccount = anchor.web3.Keypair.generate();

    it("READ CREDIT ACCOUNT TEST (account not created yet)", async () => {
        try {
            await program.account.creditAccount.fetch(creditAccount.publicKey);
            assert.fail("Account should not exist yet");
        } catch (err) {
            console.log("As expected, Credit account does not exist yet.");
        }
    });

    it("CREATE A CREDIT ACCOUNT TEST", async () => {
        const initialBalance = new anchor.BN(1000);
        await program.methods.createCreditAccount(initialBalance)
            .accounts({
                creditAccount: creditAccount.publicKey,
                owner: anchor.AnchorProvider.env().wallet.publicKey,
            })
            .signers([creditAccount])
            .rpc();

        // 생성된 Account 데이터를 가져와 확인
        const createdAccount = await program.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("Created Credit Account:", createdAccount);
        assert.ok(createdAccount.balance.eq(initialBalance));
        assert.ok(createdAccount.owner.equals(anchor.AnchorProvider.env().wallet.publicKey));
    });

    it("READ A CREDIT ACCOUNT TEST", async () => {
        const account = await program.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("Read Credit Account:", account);
        assert.ok(account.balance.eq(new anchor.BN(1000)));
    });

    it("UPDATE A CREDIT ACCOUNT TEST", async () => {
        const updatedBalance = new anchor.BN(2000);
        await program.methods.updateCreditAccount(updatedBalance)
            .accounts({
                creditAccount: creditAccount.publicKey,
            })
            .rpc();

        const updatedAccount = await program.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("Updated Credit Account:", updatedAccount);
        assert.ok(updatedAccount.balance.eq(updatedBalance));
    });

    it("DEPOSIT TO THE CREDIT ACCOUNT TEST", async () => {
        const depositAmount = new anchor.BN(500);
        const expectedBalance = new anchor.BN(2500); // 2000 + 500

        await program.methods.addCreditAccount(depositAmount)
            .accounts({
                creditAccount: creditAccount.publicKey,
            })
            .rpc();

        const deposittedAccount = await program.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("After Deposit, Credit Account:", deposittedAccount);
        assert.ok(deposittedAccount.balance.eq(expectedBalance));
    });

    it("WITHDRAW FROM THE CREDIT ACCOUNT TEST", async () => {
        const withdrawAmount = new anchor.BN(1000);
        const expectedBalance = new anchor.BN(1500); // 2500 - 1000

        await program.methods.subCreditAccount(withdrawAmount)
            .accounts({
                creditAccount: creditAccount.publicKey,
            })
            .rpc();

        const withdrawedAccount = await program.account.creditAccount.fetch(creditAccount.publicKey);
        console.log("After Withdrawal, Credit Account:", withdrawedAccount);
        assert.ok(withdrawedAccount.balance.eq(expectedBalance));
    });

    it("DELETE THE CREDIT ACCOUNT TEST", async () => {
        await program.methods.deleteCreditAccount()
            .accounts({
                creditAccount: creditAccount.publicKey,
            })
            .rpc();

        // 계정이 삭제되었으므로 fetch 시 오류가 발생해야 함
        try {
            await program.account.creditAccount.fetch(creditAccount.publicKey);
            assert.fail("Account should be deleted");
        } catch (err) {
            console.log("Credit Account successfully deleted.");
        }
    });
    
});
