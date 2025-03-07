use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds to send code.")]
    InsufficientFunds,
    #[msg("Invalid wallet address.")]
    InvalidWallet,
    #[msg("Invalid receiver address.")]
    InvalidReceiver,
    #[msg("Funds were not received by the expected wallet.")]
    FundsNotReceived,
    #[msg("Provided code account is invalid.")]
    InvalidAccount,
    #[msg("InvalidCodeFormat")]
    InvalidCodeFormat,
    #[msg("InvalidInstructionData")]
    InvalidInstructionData,
    #[msg("InvalidTransfer")]
    InvalidTransfer,
}