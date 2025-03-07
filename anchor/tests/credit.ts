import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Credit } from "../target/types/credit";
import * as assert from "assert";

describe("credit", () => {
    // 클라이언트가 로컬 클러스터(provider) 사용하도록 설정
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.Credit as Program<Credit>;

    // 테스트용 Account Keypair
    // const creditAccount = anchor.web3.Keypair.generate();
    let [creditAccountPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("credit"), provider.wallet.publicKey.toBuffer()], program.programId
    );
    
    it("READ CREDIT ACCOUNT TEST (ACCOUNT NOT CREATED YET)", async () => {
        try {
            // PDA로 CreditAccount 데이터 fetch 시도 (아직 생성되지 않았으므로 실패해야 함)
            await program.account.creditAccount.fetch(creditAccountPda);
            assert.fail("Account should not exist yet");
        } catch (err) {
            console.log("As expected, Credit account does not exist yet.");
        }
    });
        
    it("CREATE CREDIT ACCOUNT TEST", async () => {
        const initialBalance = new anchor.BN(1000);
        await program.methods.createCreditAccount(initialBalance)
        .accounts({
            owner: provider.wallet.publicKey,
        })
        .rpc();
        
        const createdAccount = await program.account.creditAccount.fetch(creditAccountPda);
        console.log("Created Credit Account:", createdAccount);
        assert.ok(createdAccount.balance.eq(initialBalance), "Initial balance mismatch");
        assert.ok(createdAccount.owner.equals(provider.wallet.publicKey), "Owner mismatch");
    });
    
    it("READ CREDIT ACCOUNT TEST (ACCOUNT CREATED)", async () => {
        const response = await program.account.creditAccount.fetch(creditAccountPda);
        console.log("Fetched Credit Account Data:", response);
    });

    it("UPDATE CREDIT ACCOUNT TEST", async () => {
        const updateBalance = new anchor.BN(2000);
        await program.methods.updateCreditAccount(updateBalance)
            .accounts({
                creditAccount: creditAccountPda,
            })
            .rpc();

        const updatedAccount = await program.account.creditAccount.fetch(creditAccountPda);
        console.log("Updated Credit Account:", updatedAccount);
        assert.ok(updatedAccount.balance.eq(updateBalance));
    });

    it("DEPOSIT INCREASE CREDIT ACCOUNT TEST", async () => {
        const depositAmount = new anchor.BN(500);
        const expectedBalance = new anchor.BN(2500);
        await program.methods.increaseCreditAccount(depositAmount)
            .accounts({
                creditAccount: creditAccountPda,
            })
            .rpc();

        const deposittedAccount = await program.account.creditAccount.fetch(creditAccountPda);
        console.log("After Deposit, Increased Credit Account:", deposittedAccount);
        assert.ok(deposittedAccount.balance.eq(expectedBalance), "Increase failed");
    });

    it("WITHDRAW DECREASE CREDIT ACCOUNT TEST", async () => {
        const withdrawAmount = new anchor.BN(1000);
        const expectedBalance = new anchor.BN(1500); // 2500 - 1000

        await program.methods.decreaseCreditAccount(withdrawAmount)
            .accounts({
                creditAccount: creditAccountPda,
            })
            .rpc();

        const withdrawedAccount = await program.account.creditAccount.fetch(creditAccountPda);
        console.log("After Withdrawal, Decreased Credit Account:", withdrawedAccount);
        assert.ok(withdrawedAccount.balance.eq(expectedBalance), "Decrease failed");
    });

    it("DELETE THE CREDIT ACCOUNT TEST", async () => {
        await program.methods.deleteCreditAccount()
            .accounts({
                creditAccount: creditAccountPda,
            })
            .rpc();

        // 계정이 삭제되었으므로 fetch 시 오류가 발생해야 함
        try {
            await program.account.creditAccount.fetch(creditAccountPda);
            assert.fail("Account should be deleted");
        } catch (err) {
            console.log("Credit Account successfully deleted.");
        }
    });
});
