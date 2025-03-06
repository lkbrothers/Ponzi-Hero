#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod context;
pub mod state;

use crate::context::*;

declare_id!("4Sz8xKjDR3tmb24HhMJjLYcLH2B6pmNPcbTUeYwYubUk");

#[program]
pub mod code_in {
    use super::*;

    pub fn create_db_account(ctx: Context<CreateDBAccount>) -> Result<()> {
        let db_account = &mut ctx.accounts.db_account;
        db_account.bump = ctx.bumps.db_account;
        db_account.tail_tx = "GENESIS".to_string();
        Ok(())
    }
    
    pub fn update_db_account(ctx: Context<UpdateDBAccount>, tail_tx: String) -> Result<()> {
        let db_account = &mut ctx.accounts.db_account;
        db_account.tail_tx = tail_tx;
        Ok(())
    }
    
    pub fn create_code_account(ctx: Context<CreateCodeAccount>, _timestamp: u64) -> Result<()> {
        let code_account = &mut ctx.accounts.code_account;
        code_account.bump = ctx.bumps.code_account;
        code_account.random_number = 0;
        code_account.before_tx = String::new();
        Ok(())
    }
    
    pub fn update_code_account(ctx: Context<UpdateCodeAccount>, random_number: u8, before_tx: String) -> Result<()> {
        let code_account = &mut ctx.accounts.code_account;
        code_account.random_number = random_number;
        code_account.before_tx = before_tx;
        Ok(())
    }
}
