use anchor_lang::prelude::*;

#[account]
pub struct DBaccount {
    pub bump: u8,
    pub tail_tx: String,
    pub counter: u64, // 새로운 code_account 생성을 위한 카운터
}

#[account]
pub struct CodeAccount {
    pub bump: u8,
    pub seed1: u64,
    pub seed2: u64,
    pub before_tx: String,
}