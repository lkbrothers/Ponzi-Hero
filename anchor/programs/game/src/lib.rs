#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::{hash, Hash};

// use anchor_lang::solana_program::{program::invoke_signed, system_instruction, rent::Rent};

pub mod context;

use crate::context::*;

use code_in::cpi::{
    accounts::{
        CreateDBAccount,
        UpdateDBAccount,
        CreateCodeAccount,
        UpdateCodeAccount
    }, 
    create_db_account,
    update_db_account,
    create_code_account,
    update_code_account
};
use transfer::cpi::{
    accounts::{
        TransferFromUserToDb,
        TransferFromDbToUser
    }, 
    transfer_from_user_to_db,
    transfer_from_db_to_user
};

declare_id!("37Z9j1LjgPRHLnB3S3cTL7t4mCSsnWmrtUJj5u9eSBQi");

#[program]
pub mod game {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {

        let cpi_create_db_account_ctx = CpiContext::new(
            ctx.accounts.code_in_program.to_account_info(),
            CreateDBAccount {
                user: ctx.accounts.user.to_account_info(),
                db_account: ctx.accounts.db_account.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        create_db_account(cpi_create_db_account_ctx)?;
    
        Ok(())
    }


    // pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
    //     let db_account_info = ctx.accounts.db_account.to_account_info();

    //     // 계정이 아직 초기화되지 않은 경우에만 생성
    //     if db_account_info.data_is_empty() {
    //         let rent = Rent::get()?;
    //         let space: usize = 8 + 1 + 50 + 8 + 100;
    //         let lamports = rent.minimum_balance(space);

    //         // PDA 생성 시 사용한 seeds와 bump 정보
    //         let bump = ctx.bumps.db_account;
    //         let seeds_inner: &[&[u8]] = &[ctx.accounts.user.key.as_ref(), &[bump]];
    //         let signer_seeds: &[&[&[u8]]] = &[seeds_inner];

    //         // db_account의 소유자를 code_in 프로그램으로 설정하기 위해,
    //         // owner를 ctx.accounts.code_in_program.key()로 지정
    //         let create_ix = system_instruction::create_account(
    //             &ctx.accounts.user.key(),         // payer
    //             &db_account_info.key(),           // 생성할 PDA 주소
    //             lamports,                         // 필요한 lamports
    //             space as u64,                     // 할당할 공간
    //             &ctx.accounts.code_in_program.key() // 소유자를 code_in 프로그램으로 지정
    //         );

    //         invoke_signed(
    //             &create_ix,
    //             &[
    //                 ctx.accounts.user.to_account_info(),
    //                 db_account_info.clone(),
    //                 ctx.accounts.system_program.to_account_info(),
    //             ],
    //             signer_seeds,
    //         )?;
    //     }

    //     // 이후 CPI를 통해 code_in 프로그램의 create_db_account 호출
    //     let cpi_create_db_account_ctx = CpiContext::new(
    //         ctx.accounts.code_in_program.to_account_info(),
    //         CreateDBAccount {
    //             user: ctx.accounts.user.to_account_info(),
    //             db_account: ctx.accounts.db_account.to_account_info(),
    //             system_program: ctx.accounts.system_program.to_account_info(),
    //         }
    //     );
    //     create_db_account(cpi_create_db_account_ctx)?;

    //     Ok(())
    // }
    
    pub fn dummy_tx(ctx: Context<DummyTx>, timestamp: u64) -> Result<()> {
    
        // random 값을 만드는데 쓰일 더미 트랜잭션에 대한 송금 이벤트
        let cpi_transfer_from_user_to_db_ctx = CpiContext::new(
            ctx.accounts.transfer_program.to_account_info(),
            TransferFromUserToDb {
                user: ctx.accounts.user.to_account_info(),
                db_account: ctx.accounts.db_account.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }   
        );
        transfer_from_user_to_db(cpi_transfer_from_user_to_db_ctx)?;
    
        // code_account 생성
        let cpi_create_code_account_ctx = CpiContext::new(
            ctx.accounts.code_in_program.to_account_info(),
            CreateCodeAccount {
                user: ctx.accounts.user.to_account_info(),
                code_account: ctx.accounts.code_account.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        create_code_account(cpi_create_code_account_ctx, timestamp)?;
    
        Ok(())
    }
    
    pub fn play_game(
        ctx: Context<PlayGame>,
        dummy_tx: String,
        block_hash: String,
        slot: u64,
        block_time: u64
    ) -> Result<()> {
    
        // random 값 생성
        let random_number = create_random_no(dummy_tx.clone(), block_hash, slot, block_time)?;
    
        let cpi_update_code_account_ctx = CpiContext::new(
            ctx.accounts.code_in_program.to_account_info(),
            UpdateCodeAccount {
                user: ctx.accounts.user.to_account_info(),
                code_account: ctx.accounts.code_account.to_account_info(),
            }
        );
        update_code_account(cpi_update_code_account_ctx, random_number, ctx.accounts.db_account.tail_tx.clone())?;
    
        let cpi_update_db_account_ctx = CpiContext::new(
            ctx.accounts.code_in_program.to_account_info(),
            UpdateDBAccount {
                user: ctx.accounts.user.to_account_info(),
                db_account: ctx.accounts.db_account.to_account_info(),
            }
        );
        update_db_account(cpi_update_db_account_ctx, dummy_tx.clone())?;
    
        let cpi_transfer_from_db_to_user_ctx = CpiContext::new(
            ctx.accounts.transfer_program.to_account_info(),
            TransferFromDbToUser {
                user: ctx.accounts.user.to_account_info(),
                db_account: ctx.accounts.db_account.to_account_info(),
            }
        );
        transfer_from_db_to_user(cpi_transfer_from_db_to_user_ctx)?;
    
        Ok(())
    }
    
}

pub fn create_random_no(
    transfer_from_user_to_db_tx: String,
    block_hash: String,
    slot: u64,
    block_time: u64
) -> Result<u8> {
    let combined = format!("{}{}{}{}", transfer_from_user_to_db_tx, block_hash, slot, block_time);
    let hash_result: Hash = hash(combined.as_bytes());
    let bytes = hash_result.to_bytes();
    let mut num: u64 = 0;
    for i in 0..8 {
        num = (num << 8) | (bytes[i] as u64);
    }
    let random_number = (num % 100) + 1;
    Ok(random_number as u8)
}