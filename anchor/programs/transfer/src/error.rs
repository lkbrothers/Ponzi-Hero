use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds to send code.")]
    InsufficientFunds,
    #[msg("InvalidTransfer")]
    InvalidTransfer,
}