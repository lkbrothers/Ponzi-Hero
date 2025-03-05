use anchor_lang::prelude::*;
use credit::cpi::accounts::UpdateCreditAccount;
use nft::cpi::accounts::UpdateNftAccount;
use nft::cpi::accounts::DeleteNftAccount;
use credit::program as CreditProgram;
use nft::program as NftProgram;

declare_id!("CR8Sox2FniGkNFQ6AmE7FGi5cJjpJn7QTvhhgZcbg9PX");

#[program]
pub mod shop {
    use super::*;

    // NFT를 CREDIT으로 교환하는 함수
    // NFT 종류에 따라 CreditAccount에 보상 크레딧 추가
    // 보상 크레딧 지급 후 NFT Account 소멸, 소유자에게 Lamports 반환
    pub fn exchange_nft_to_credit(ctx: Context<ExchangeNftToCredit>) -> Result<()> {
        let nft_cpi_ctx = CpiContext::new(
            ctx.accounts.nft_program.to_account_info(),
            DeleteNftAccount {
                owner: ctx.accounts.owner.to_account_info(),
                nft_account: ctx.accounts.nft_account.to_account_info(),
            },
        );
        let credit_cpi_ctx = CpiContext::new(
            ctx.accounts.credit_program.to_account_info(),
            UpdateCreditAccount {
                owner: ctx.accounts.owner.to_account_info(),
                credit_account: ctx.accounts.credit_account.to_account_info(),
            },
        );

        // NFT의 종류에 따른 보상 크레딧 결정
        let reward = match ctx.accounts.nft_account.name.as_str() {
            "NFT Alpha" => 10,
            "NFT Beta" => 20,
            "NFT Gamma" => 30,
            _ => return Err(ErrorCode::InvalidNft.into()),
        };

        credit::cpi::add_credit_account(credit_cpi_ctx, reward)?;
        nft::cpi::delete_nft_account(nft_cpi_ctx)?;
        Ok(())
    }

    // CREDIT을 NFT로 교환하는 함수: 사용자가 원하는 NFT를 선택하면
    // 해당 NFT의 발행 비용(크레딧)이 차감되고, 새 NFT Account가 생성되어 소유자에게 할당
    pub fn exchange_credit_to_nft(ctx: Context<ExchangeCreditToNft>, nft_type: u8) -> Result<()> {
        let credit_cpi_ctx = CpiContext::new(
            ctx.accounts.credit_program.to_account_info(),
            UpdateCreditAccount {
                owner: ctx.accounts.owner.to_account_info(),
                credit_account: ctx.accounts.credit_account.to_account_info(),
            },
        );
        let nft_cpi_ctx = CpiContext::new(
            ctx.accounts.nft_program.to_account_info(),
            UpdateNftAccount {
                owner: ctx.accounts.owner.to_account_info(),
                nft_account: ctx.accounts.nft_account.to_account_info(),
            },
        );

        // NFT 타입에 따른 발행 비용과 메타데이터 결정
        let (cost, name, uri) = match nft_type {
            0 => (10, "NFT Alpha", "https://example.com/nft_alpha.json"),
            1 => (20, "NFT Beta",  "https://example.com/nft_beta.json"),
            2 => (30, "NFT Gamma", "https://example.com/nft_gamma.json"),
            _ => return Err(ErrorCode::InvalidNft.into()),
        };

        credit::cpi::sub_credit_account(credit_cpi_ctx, cost)?;
        nft::cpi::update_nft_account(nft_cpi_ctx, name.to_string(), uri.to_string())?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ExchangeNftToCredit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub nft_account: Account<'info, nft::NftAccount>,
    #[account(mut)]
    pub credit_account: Account<'info, credit::CreditAccount>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub nft_program: AccountInfo<'info>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub credit_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExchangeCreditToNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub nft_account: Account<'info, nft::NftAccount>,
    #[account(mut)]
    pub credit_account: Account<'info, credit::CreditAccount>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub nft_program: AccountInfo<'info>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub credit_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

// #[program]
// pub mod shop {
//     use super::*;

//     pub fn exchange_nft_to_credit(ctx: Context<ExchangeNftToCredit>) -> Result<()> {
//         let nft_account = &ctx.accounts.nft_account;
//         let credit_account = &mut ctx.accounts.credit_account;

//         // NFT의 종류에 따른 보상 크레딧 결정
//         let reward = match nft_account.name.as_str() {
//             "NFT Alpha" => 10,
//             "NFT Beta" => 20,
//             "NFT Gamma" => 30,
//             _ => return Err(ErrorCode::InvalidNft.into()),
//         };

//         // CreditAccount에 보상 크레딧 추가
//         credit_account.balance = credit_account
//             .balance.checked_add(reward)
//             .ok_or(ErrorCode::Overflow)?;
//         Ok(())
//     }

//     pub fn exchange_credit_to_nft(ctx: Context<ExchangeCreditToNft>, nft_type: u8) -> Result<()> {
//         // NFT 타입에 따른 발행 비용과 메타데이터 결정
//         let (cost, name, uri) = match nft_type {
//             0 => (10, "NFT Alpha", "https://example.com/nft_alpha.json"),
//             1 => (20, "NFT Beta",  "https://example.com/nft_beta.json"),
//             2 => (30, "NFT Gamma", "https://example.com/nft_gamma.json"),
//             _ => return Err(ErrorCode::InvalidNft.into()),
//         };
        
//         // CreditAccount에서 비용 차감
//         let credit_account = &mut ctx.accounts.credit_account;
//         if credit_account.balance < cost {
//             return Err(ErrorCode::InsufficientCredit.into());
//         }
//         credit_account.balance = credit_account.balance
//             .checked_sub(cost)
//             .ok_or(ErrorCode::Underflow)?;

//         // 새 NFT 계정 생성 및 할당
//         let nft_account = &mut ctx.accounts.nft_account;
//         nft_account.owner = ctx.accounts.owner.key();
//         nft_account.name = name.to_string();
//         nft_account.uri = uri.to_string();
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct ExchangeNftToCredit<'info> {
//     // NFT 계정: 소유자가 일치하며, close 속성을 통해 함수 종료 시 소각되어 램포트가 owner로 반환됨
//     #[account(mut, has_one = owner, close = owner)]
//     pub nft_account: Account<'info, NftAccount>,
//     // Credit 계정: 소유자가 일치하며 mutable 처리되어 보상 크레딧이 추가됨
//     #[account(mut, has_one = owner)]
//     pub credit_account: Account<'info, CreditAccount>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct ExchangeCreditToNft<'info> {
//     // Credit 계정: 충분한 잔액이 있어야 하며, 소유자가 일치해야 합니다.
//     #[account(mut, has_one = owner)]
//     pub credit_account: Account<'info, CreditAccount>,
//     // 새로 생성될 NFT 계정: payer는 owner로, 충분한 공간을 할당합니다.
//     // 디스크리미네이터(8) + owner(32) + name(4 + 32) + uri(4 + 200)
//     #[account(init, payer = owner, space = 8 + 32 + (4 + 32) + (4 + 200))]
//     pub nft_account: Account<'info, NftAccount>,
    
//     #[account(mut)]
//     pub owner: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[account]
// pub struct NftAccount {
//     pub owner: Pubkey,
//     pub name: String,
//     pub uri: String,
// }

// #[account]
// pub struct CreditAccount {
//     pub balance: u64,
//     pub owner: Pubkey,
// }

#[error_code]
pub enum ErrorCode {
    #[msg("[ERROR] 제공된 NFT가 유효하지 않습니다.")]
    InvalidNft,
    #[msg("[ERROR] 크레딧 잔액이 부족합니다.")]
    InsufficientCredit,
    #[msg("[ERROR] Overflow occurred: 잔액이 허용 범위를 초과합니다.")]
    Overflow,
    #[msg("[ERROR] Underflow occurred: 잔액은 0보다 작아질 수 없습니다.")]
    Underflow,
}
