use anchor_lang::prelude::*;
use code_in as code_in_program;

// #[derive(Accounts)]
// pub struct InitializeGame<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(mut)]
//     pub db_account: Account<'info, code_in::state::DBAccount>,
//     /// CHECK
//     pub code_in_program: AccountInfo<'info>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // PDA로 생성할 db_account: PDA가 존재하지 않아도 전달됨
    #[account(
        init_if_needed,
        payer = user,
        owner = code_in_program::ID,
        seeds = [user.key().as_ref()],
        bump,
        space = 8 + 1 + 50 + 8 + 100
    )]
    pub db_account: Account<'info, code_in::state::DBAccount>,
    /// CHECK: CPI 대상인 code_in 프로그램의 계정
    pub code_in_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DummyTx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub db_account: Account<'info, code_in::state::DBAccount>,
    #[account(mut)]
    pub code_account: Account<'info, code_in::state::CodeAccount>,
    /// CHECK
    pub code_in_program: AccountInfo<'info>,
    /// CHECK
    pub transfer_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlayGame<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub db_account: Account<'info, code_in::state::DBAccount>,
    #[account(mut)]
    pub code_account: Account<'info, code_in::state::CodeAccount>,
    /// CHECK
    pub code_in_program: AccountInfo<'info>,
    /// CHECK
    pub transfer_program: AccountInfo<'info>,
}