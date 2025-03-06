use anchor_lang::prelude::*;

#[account]
pub struct DBAccount {
    pub user: Pubkey,
    pub bump: u8,
    pub tail_tx: String,
}

#[account]
pub struct CodeAccount {
    pub user: Pubkey,
    pub bump: u8,
    pub random_number: u8,
    pub before_tx: String,
}