#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub mod context;
pub mod constant;
pub mod error;

use crate::context::*;
use crate::constant::*;
use crate::error::ErrorCode;

declare_id!("6LDk9tvtR5hoSp1QYZHsqdrVHv32tac6r8NYXjJam1M5");

#[program]
pub mod transfer {
    use super::*;

    pub fn transfer_from_user_to_db(ctx: Context<TransferFromUserToDb>) -> Result<()> {

        let user_account_info = ctx.accounts.user.to_account_info();
        let db_pda_account_info = ctx.accounts.db_account.to_account_info();

        if user_account_info.lamports() < REQUIRED_LAMPORTS {
            return Err(ErrorCode::InsufficientFunds.into());
        }
    
        let cpi_transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: user_account_info,
                to: db_pda_account_info,
            }
        );
        system_program::transfer(cpi_transfer_ctx, REQUIRED_LAMPORTS)?;
    
        Ok(())
    }
    
    pub fn transfer_from_db_to_user(ctx: Context<TransferFromDbToUser>) -> Result<()> {

        let db_pda_account_info = ctx.accounts.db_account.to_account_info();
        let user_account_info = ctx.accounts.user.to_account_info();
    
        let pda_balance = db_pda_account_info.lamports();
        if pda_balance < REQUIRED_LAMPORTS {
            return Err(ErrorCode::InvalidTransfer.into());
        }
    
        if **db_pda_account_info.try_borrow_lamports()? < REQUIRED_LAMPORTS {
            return Err(ErrorCode::InsufficientFunds.into());
        }
    
        **db_pda_account_info.try_borrow_mut_lamports()? -= REQUIRED_LAMPORTS;
        **user_account_info.try_borrow_mut_lamports()? += REQUIRED_LAMPORTS;
    
        Ok(())
    }
    
}