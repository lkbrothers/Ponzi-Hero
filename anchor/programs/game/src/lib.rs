#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::hash::{hash, Hash};

pub mod context;
pub mod state;
pub mod error;

use crate::context::*;
use crate::error::ErrorCode;

// declare_id!("37Z9j1LjgPRHLnB3S3cTL7t4mCSsnWmrtUJj5u9eSBQi");
declare_id!("65vAJ9srf4w7ifZURDhp1GvnLADpwM5CepQPd29A87JF");

#[program]
pub mod game {
    use super::*;

    pub fn user_initialize(ctx: Context<UserInitialize>) -> Result<()> {
        let (_expected_db_pda, expected_db_bump) = Pubkey::find_program_address(
            &[b"dbseedhere", ctx.accounts.user.key.as_ref()],
            ctx.program_id,
        );

        let db_account = &mut ctx.accounts.db_account;
        db_account.bump = expected_db_bump;
        // 체인의 최초 종료값을 "GENESIS"로 설정합니다.
        db_account.tail_tx = "GENESIS".to_string();
        db_account.counter = 0;

        Ok(())
    }

    // transfer: user wallet -> db_account
    // create_code_account
    pub fn remit_for_random(ctx: Context<RemitForRandom>) -> Result<()> {
        let required_lamports = 3_000_000; // 0.0003 SOL

        let (expected_db_pda, _expected_db_bump) = Pubkey::find_program_address(
            &[b"dbseedhere", ctx.accounts.user.key.as_ref()],
            ctx.program_id,
        );
        if ctx.accounts.db_account.key() != expected_db_pda {
            return Err(ErrorCode::InvalidAccount.into());
        }

        // 송금 계좌(사용자 지갑)의 잔액 확인
        let user_account_info = ctx.accounts.user.to_account_info();
        if user_account_info.lamports() < required_lamports {
            return Err(ErrorCode::InsufficientFunds.into());
        }

        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.db_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        system_program::transfer(cpi_ctx, required_lamports)?;



        // db_account.counter 값을 seed로 사용하여 고유한 PDA를 생성합니다.
        let counter_bytes = ctx.accounts.db_account.counter.to_le_bytes();
        let (expected_code_pda, bump) = Pubkey::find_program_address(
            &[b"seedhere", ctx.accounts.user.key.as_ref(), &counter_bytes],
            ctx.program_id,
        );
        if ctx.accounts.code_account.key() != expected_code_pda {
            return Err(ErrorCode::InvalidAccount.into());
        }

        // 새 code_account(노드)를 초기화합니다.
        let code_account = &mut ctx.accounts.code_account;
        code_account.bump = bump;
        // 여기서 random_number 값을 문자열로 변환하여 저장합니다.
        code_account.seed1 = 0;
        code_account.seed2 = 0;
        // 이전 노드(혹은 초기값 "GENESIS")를 before_tx에 저장합니다.
        code_account.before_tx = ctx.accounts.db_account.tail_tx.clone();

        Ok(())
    }

    // finalize_game에서는 매 호출 시마다 새로운 code_account(새로운 노드)를 생성합니다.
    pub fn finalize_game(
        ctx: Context<FinalizeGame>,
        dummy_tx_hash: String,
        block_hash: String,
        slot: u64,
        block_time: u64,
    ) -> Result<()> {

        let (expected_db_pda, _expected_db_bump) = Pubkey::find_program_address(
            &[b"dbseedhere", ctx.accounts.user.key.as_ref()],
            ctx.program_id,
        );
        if ctx.accounts.db_account.key() != expected_db_pda {
            return Err(ErrorCode::InvalidAccount.into());
        }

        let counter_bytes = ctx.accounts.db_account.counter.to_le_bytes();
        let (expected_code_pda, _bump) = Pubkey::find_program_address(
            &[b"seedhere", ctx.accounts.user.key.as_ref(), &counter_bytes],
            ctx.program_id,
        );
        if ctx.accounts.code_account.key() != expected_code_pda {
            return Err(ErrorCode::InvalidAccount.into());
        }

        // 해시 결과 계산: dummy_tx_hash, block_hash, slot, block_time을 결합하여 해시 생성
        let combined1 = format!("{}{}{}", dummy_tx_hash, block_hash, block_time);
        let hash_result: Hash = hash(combined1.as_bytes());
        let bytes1 = hash_result.to_bytes();

        // 해시의 앞 8바이트를 u64로 변환
        let seed_bytes1: [u8; 8] = bytes1[..8]
            .try_into()
            .expect("Expected slice to have exactly 8 bytes");
        let num1 = u64::from_le_bytes(seed_bytes1);

        let combined2 = format!("{}{}{}", dummy_tx_hash, block_hash, slot);
        let hash_result: Hash = hash(combined2.as_bytes());
        let bytes2 = hash_result.to_bytes();

        // 해시의 앞 8바이트를 u64로 변환
        let seed_bytes2: [u8; 8] = bytes2[..8]
            .try_into()
            .expect("Expected slice to have exactly 8 bytes");
        let num2 = u64::from_le_bytes(seed_bytes2);



        let code_account = &mut ctx.accounts.code_account;
        code_account.seed1 = num1;
        code_account.seed2 = num2;

        let required_lamports = 3_000_000;
        let receiver_account = ctx.accounts.user.to_account_info();
        let db_pda_account_info = &ctx.accounts.db_account.to_account_info();

        let pda_balance = db_pda_account_info.lamports();
        if pda_balance < required_lamports {
            return Err(ErrorCode::InvalidTransfer.into());
        }

        if **db_pda_account_info.try_borrow_lamports()? < required_lamports {
            return Err(ErrorCode::InsufficientFunds.into());
        }

        **db_pda_account_info.try_borrow_mut_lamports()? -= required_lamports;
        **receiver_account.try_borrow_mut_lamports()? += required_lamports;

        ctx.accounts.db_account.tail_tx = dummy_tx_hash.clone();
        ctx.accounts.db_account.counter += 1;

        Ok(())
    }

    // pub fn finalize_game(
    //     ctx: Context<FinalizeGame>,
    //     dummy_tx_hash: String,
    //     block_hash: String,
    //     slot: u64,
    //     block_time: u64,
    // ) -> Result<u()> {

    //     let (expected_db_pda, _expected_db_bump) = Pubkey::find_program_address(
    //         &[b"dbseedhere", ctx.accounts.user.key.as_ref()],
    //         ctx.program_id,
    //     );
    //     if ctx.accounts.db_account.key() != expected_db_pda {
    //         return Err(ErrorCode::InvalidAccount.into());
    //     }

    //     let counter_bytes = ctx.accounts.db_account.counter.to_le_bytes();
    //     let (expected_code_pda, _bump) = Pubkey::find_program_address(
    //         &[b"seedhere", ctx.accounts.user.key.as_ref(), &counter_bytes],
    //         ctx.program_id,
    //     );
    //     if ctx.accounts.code_account.key() != expected_code_pda {
    //         return Err(ErrorCode::InvalidAccount.into());
    //     }

    //     // 랜덤 결과 계산: remit_tx_hash, block_hash, slot, block_time을 결합하여 해시 생성
    //     let combined = format!("{}{}{}{}", dummy_tx_hash, block_hash, slot, block_time);
    //     let hash_result: Hash = hash(combined.as_bytes());
    //     let bytes = hash_result.to_bytes();
    //     let mut num: u64 = 0;
    //     for i in 0..8 {
    //         num = (num << 8) | (bytes[i] as u64);
    //     }
    //     // 1에서 100 사이의 자연수로 결정 (num % 100은 0~99, +1 하면 1~100)
    //     let random_number = (num % 100) + 1;

    //     let code_account = &mut ctx.accounts.code_account;
    //     code_account.nft = random_number.to_string();
        

    //     let required_lamports = 3_000_000;
    //     let receiver_account = ctx.accounts.user.to_account_info();
    //     let db_pda_account_info = &ctx.accounts.db_account.to_account_info();

    //     let pda_balance = db_pda_account_info.lamports();
    //     if pda_balance < required_lamports {
    //         return Err(ErrorCode::InvalidTransfer.into());
    //     }

    //     if **db_pda_account_info.try_borrow_lamports()? < required_lamports {
    //         return Err(ErrorCode::InsufficientFunds.into());
    //     }

    //     **db_pda_account_info.try_borrow_mut_lamports()? -= required_lamports;
    //     **receiver_account.try_borrow_mut_lamports()? += required_lamports;

    //     ctx.accounts.db_account.tail_tx = dummy_tx_hash.clone();
    //     ctx.accounts.db_account.counter += 1;

    //     Ok(())
    // }
}