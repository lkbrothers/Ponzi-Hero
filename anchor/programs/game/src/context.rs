use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UserInitialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        seeds = [b"dbseedhere", user.key().as_ref()],
        bump,
        space = 8 + 1 + 50 + 8 + 100
    )]
    pub db_account: Account<'info, DBaccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemitForRandom<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub db_account: Account<'info, DBaccount>,
    #[account(
        init,
        payer = user,
        space = 1 + 1 + 900 + 100,
        seeds = [b"seedhere", user.key().as_ref(), db_account.counter.to_le_bytes().as_ref()],
        bump,
    )]
    pub code_account: Account<'info, CodeAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeGame<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub db_account: Account<'info, DBaccount>,
    // 매 finalize_game 호출 시 새로운 code_account를 생성합니다.
    #[account(mut)]
    pub code_account: Account<'info, CodeAccount>,

    pub system_program: Program<'info, System>,
}