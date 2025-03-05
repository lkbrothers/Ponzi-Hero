use anchor_lang::prelude::*;

declare_id!("H1kXTuAJntnCELS2phbS7bMcD4VYy5CQK3wKFC9BMgfL");

#[program]
pub mod credit {
    use super::*;

    // CreditAccount 정보 확인
    pub fn read_credit_account(ctx: Context<ReadCreditAccount>) -> Result<()> {
        msg!("Credit Account Owner: {}", ctx.accounts.credit_account.owner);
        msg!("Credit Account Balance: {}", ctx.accounts.credit_account.balance);
        Ok(())
    }

    // CreditAccount 생성
    pub fn create_credit_account(ctx: Context<CreateCreditAccount>, initial_balance: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.owner = ctx.accounts.owner.key();
        credit_account.balance = initial_balance;
        Ok(())
    }
    
    // CreditAccount 잔액 수정
    pub fn update_credit_account(ctx: Context<UpdateCreditAccount>, update_balance: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.balance = update_balance;
        Ok(())
    }

    // CreditAccount 잔액 증가 (입금 기능)
    pub fn add_credit_account(ctx: Context<UpdateCreditAccount>, amount: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.balance = credit_account.balance.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
    
    // CreditAccount 잔액 감소 (출금 기능)
    pub fn sub_credit_account(ctx: Context<UpdateCreditAccount>, amount: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.balance = credit_account.balance.checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        Ok(())
    }

    // CreditAccount 삭제
    pub fn delete_credit_account(_ctx: Context<DeleteCreditAccount>) -> Result<()> {
        Ok(())
    }
}

// READ CREDIT
#[derive(Accounts)]
pub struct ReadCreditAccount<'info> {
    pub credit_account: Account<'info, CreditAccount>,
}

// CREATE CREDIT
#[derive(Accounts)]
pub struct CreateCreditAccount<'info> {
    // 디스크리미네이터 + Balance + Owner = 8 Byte + 8 Byte + 32 Byte
    #[account(init, payer = owner, space = 8 + 8 + 32)]
    pub credit_account: Account<'info, CreditAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// UPDATE CREDIT
#[derive(Accounts)]
pub struct UpdateCreditAccount<'info> {
    #[account(mut, has_one = owner)]
    pub credit_account: Account<'info, CreditAccount>,
    pub owner: Signer<'info>,
}

// DELETE CREDIT
#[derive(Accounts)]
pub struct DeleteCreditAccount<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub credit_account: Account<'info, CreditAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct CreditAccount {
    pub balance: u64,
    pub owner: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("[ERROR] Overflow occurred: 잔액이 허용 범위를 초과합니다.")]
    Overflow,
    #[msg("[ERROR] Underflow occurred: 잔액은 0보다 작아질 수 없습니다.")]
    Underflow,
}
