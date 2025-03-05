use anchor_lang::prelude::*;

declare_id!("3BjKmutGGbVtnVeeJnNg9xKqkAticq7WYvBjuBr1dQab");

#[program]
pub mod nft {
    use super::*;

    // NFT Account 정보 읽기
    pub fn read_nft_account(ctx: Context<ReadNftAccount>) -> Result<()> {
        msg!("NFT Account Owner: {}", ctx.accounts.nft_account.owner);
        msg!("NFT Account Name: {}", ctx.accounts.nft_account.name);
        msg!("NFT Account URI: {}", ctx.accounts.nft_account.uri);
        Ok(())
    }

    // NFT Account 생성
    pub fn create_nft_account(ctx: Context<CreateNftAccount>, name: String, uri: String) -> Result<()> {
        let nft_account = &mut ctx.accounts.nft_account;
        nft_account.owner = ctx.accounts.owner.key();
        nft_account.name = name;
        nft_account.uri = uri;
        Ok(())
    }
    
    // NFT Account 수정
    pub fn update_nft_account(ctx: Context<UpdateNftAccount>, name: String, uri: String) -> Result<()> {
        let nft_account = &mut ctx.accounts.nft_account;
        nft_account.name = name;
        nft_account.uri = uri;
        Ok(())
    }

    // NFT Account 삭제
    pub fn delete_nft_account(_ctx: Context<DeleteNftAccount>) -> Result<()> {
        Ok(())
    }

    // Random NFT Account 민팅(생성)
    pub fn mint_random_nft_account(ctx: Context<CreateNftAccount>) -> Result<()> {
        // Clock 값을 사용하여 간단한 난수 seed를 생성
        let seed = Clock::get()?.unix_timestamp as u64;

        // 미리 정의된 NFT 메타데이터 쌍 (이름, URI)
        let items: [(&str, &str); 3] = [
            ("NFT Alpha", "https://example.com/nft_alpha.json"),
            ("NFT Beta", "https://example.com/nft_beta.json"),
            ("NFT Gamma", "https://example.com/nft_gamma.json"),
        ];

        // seed를 이용해 items 배열의 인덱스를 결정
        let idx = (seed % (items.len() as u64)) as usize;
        let (name, uri) = items[idx];

        let nft_account = &mut ctx.accounts.nft_account;
        nft_account.owner = ctx.accounts.owner.key();
        nft_account.name = name.to_string();
        nft_account.uri = uri.to_string();
        Ok(())
    }
}

// READ NFT
#[derive(Accounts)]
pub struct ReadNftAccount<'info> {
    pub nft_account: Account<'info, NftAccount>,
}

// CREATE NFT
#[derive(Accounts)]
pub struct CreateNftAccount<'info> {
    // 디스크리미네이터(8) + owner(32) + name(4 + 32) + uri(4 + 200)
    #[account(init, payer = owner, space = 8 + 32 + (4 + 32) + (4 + 200))]
    pub nft_account: Account<'info, NftAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// UPDATE NFT
#[derive(Accounts)]
pub struct UpdateNftAccount<'info> {
    #[account(mut, has_one = owner)]
    pub nft_account: Account<'info, NftAccount>,
    pub owner: Signer<'info>,
}

// DELETE NFT
#[derive(Accounts)]
pub struct DeleteNftAccount<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub nft_account: Account<'info, NftAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct NftAccount {
    pub owner: Pubkey,
    pub name: String,
    pub uri: String,
}
