use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct TransferFromUserToDb<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub db_account: Account<'info, code_in::state::DBAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferFromDbToUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub db_account: Account<'info, code_in::state::DBAccount>,
}