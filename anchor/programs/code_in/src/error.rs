use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The provided account does not belong to the expected program.")]
    IllegalOwner,
}
