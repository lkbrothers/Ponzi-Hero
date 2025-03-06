use anchor_lang::prelude::*;

declare_id!("H1kXTuAJntnCELS2phbS7bMcD4VYy5CQK3wKFC9BMgfL");

#[program]
pub mod credit {
    use super::*;

    // CREATE CREDIT ACCOUNT
    pub fn create_credit_account(ctx: Context<CreateCreditAccount>, initial_balance: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.owner = ctx.accounts.owner.key();
        credit_account.balance = initial_balance;
        Ok(())
    }

    // UPDATE CREDIT ACCOUNT
    pub fn update_credit_account(ctx: Context<UpdateCreditAccount>, update_balance: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.balance = update_balance;
        Ok(())
    }

    // DELETE CREDIT ACCOUNT
    pub fn delete_credit_account(_ctx: Context<DeleteCreditAccount>) -> Result<()> {
        Ok(())
    }

    ///////////////////////////////////////////////////////////////////////////
    // INCREASE CREDIT ACCOUNT
    pub fn increase_credit_account(ctx: Context<UpdateCreditAccount>, amount: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.balance = credit_account.balance
            .checked_add(amount).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
    
    // DECREASE CREDIT ACCOUNT
    pub fn decrease_credit_account(ctx: Context<UpdateCreditAccount>, amount: u64) -> Result<()> {
        let credit_account = &mut ctx.accounts.credit_account;
        credit_account.balance = credit_account.balance
            .checked_sub(amount).ok_or(ErrorCode::Underflow)?;
        Ok(())
    }
}

// CREATE CREDIT ACCOUNT
#[derive(Accounts)]
pub struct CreateCreditAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(init, seeds = [b"credit", owner.key().as_ref()],
        bump, payer = owner, space = 8 + 8 + 32)] // Discriminator(8) + balance(8) + owner(32)
    pub credit_account: Account<'info, CreditAccount>,
    pub system_program: Program<'info, System>,
}

// UPDATE CREDIT ACCOUNT
#[derive(Accounts)]
pub struct UpdateCreditAccount<'info> {
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner)]
    pub credit_account: Account<'info, CreditAccount>,
}

// DELETE CREDIT ACCOUNT
#[derive(Accounts)]
pub struct DeleteCreditAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner, close = owner)]
    pub credit_account: Account<'info, CreditAccount>,
}

// DEFINE CREDIT ACCOUNT
#[account]
pub struct CreditAccount {
    pub owner: Pubkey,
    pub balance: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("[ERROR] Overflow occurred: 잔액이 허용 범위를 초과합니다.")]
    Overflow,
    #[msg("[ERROR] Underflow occurred: 잔액은 0보다 작아질 수 없습니다.")]
    Underflow,
}
