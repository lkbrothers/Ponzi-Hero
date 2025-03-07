use anchor_lang::prelude::*;
// use anchor_lang::solana_program::hash::{Hash, hash};

use game::cpi::{accounts::FinalizeGame, finalize_game};


declare_id!("A3iwuQp9UcJsxcxXJ9ZWWLv5B616srHw8fCGkEeWgLjN");

pub const NUM_GACHA: usize = 6;
pub const NUM_GRADE: usize = 6;
pub const NUM_IMAGES: usize = 10;

pub const GRADE_NAMES: [&str; NUM_GRADE] = [
    "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

pub const GACHA_WEIGHTS: [[u64; NUM_GRADE]; NUM_GACHA] = [
    [60, 25, 10, 4, 1, 0],  // 가챠 0: 가장 낮은 등급 (DEGENDARY 없음)
    [55, 25, 10, 4, 4, 2],  // 가챠 1
    [50, 25, 10, 4, 7, 4],  // 가챠 2
    [45, 25, 10, 4, 9, 7],  // 가챠 3
    [40, 25, 10, 4, 9, 12], // 가챠 4
    [35, 25, 10, 4, 9, 17], // 가챠 5: 가장 높은 등급 (DEGENDARY 있음)
];

pub const NORMAL_ITEMS: [(&str, &str, &str); NUM_IMAGES] = [
    ("Normal Item Name 0001", "normal0001.png", "head"),
    ("Normal Item Name 0002", "normal0002.png", "body"),
    ("Normal Item Name 0003", "normal0003.png", "arms"),
    ("Normal Item Name 0004", "normal0004.png", "legs"),
    ("Normal Item Name 0005", "normal0005.png", "accessory"),
    ("Normal Item Name 0006", "normal0006.png", "head"),
    ("Normal Item Name 0007", "normal0007.png", "body"),
    ("Normal Item Name 0008", "normal0008.png", "arms"),
    ("Normal Item Name 0009", "normal0009.png", "legs"),
    ("Normal Item Name 0010", "normal0010.png", "accessory"),
];

pub const RARE_ITEMS: [(&str, &str, &str); NUM_IMAGES] = [
    ("Rare Item Name 0001", "rare0001.png", "head"),
    ("Rare Item Name 0002", "rare0002.png", "body"),
    ("Rare Item Name 0003", "rare0003.png", "arms"),
    ("Rare Item Name 0004", "rare0004.png", "legs"),
    ("Rare Item Name 0005", "rare0005.png", "accessory"),
    ("Rare Item Name 0006", "rare0006.png", "head"),
    ("Rare Item Name 0007", "rare0007.png", "body"),
    ("Rare Item Name 0008", "rare0008.png", "arms"),
    ("Rare Item Name 0009", "rare0009.png", "legs"),
    ("Rare Item Name 0010", "rare0010.png", "accessory"),
];

pub const EPIC_ITEMS: [(&str, &str, &str); NUM_IMAGES] = [
    ("Epic Item Name 0001", "epic0001.png", "head"),
    ("Epic Item Name 0002", "epic0002.png", "body"),
    ("Epic Item Name 0003", "epic0003.png", "arms"),
    ("Epic Item Name 0004", "epic0004.png", "legs"),
    ("Epic Item Name 0005", "epic0005.png", "accessory"),
    ("Epic Item Name 0006", "epic0006.png", "head"),
    ("Epic Item Name 0007", "epic0007.png", "body"),
    ("Epic Item Name 0008", "epic0008.png", "arms"),
    ("Epic Item Name 0009", "epic0009.png", "legs"),
    ("Epic Item Name 0010", "epic0010.png", "accessory"),
];

pub const UNIQUE_ITEMS: [(&str, &str, &str); NUM_IMAGES] = [
    ("Unique Item Name 0001", "unique0001.png", "head"),
    ("Unique Item Name 0002", "unique0002.png", "body"),
    ("Unique Item Name 0003", "unique0003.png", "arms"),
    ("Unique Item Name 0004", "unique0004.png", "legs"),
    ("Unique Item Name 0005", "unique0005.png", "accessory"),
    ("Unique Item Name 0006", "unique0006.png", "head"),
    ("Unique Item Name 0007", "unique0007.png", "body"),
    ("Unique Item Name 0008", "unique0008.png", "arms"),
    ("Unique Item Name 0009", "unique0009.png", "legs"),
    ("Unique Item Name 0010", "unique0010.png", "accessory"),
];

pub const LEGENDARY_ITEMS: [(&str, &str, &str); NUM_IMAGES] = [
    ("Legendary Item Name 0001", "legendary0001.png", "head"),
    ("Legendary Item Name 0002", "legendary0002.png", "body"),
    ("Legendary Item Name 0003", "legendary0003.png", "arms"),
    ("Legendary Item Name 0004", "legendary0004.png", "legs"),
    ("Legendary Item Name 0005", "legendary0005.png", "accessory"),
    ("Legendary Item Name 0006", "legendary0006.png", "head"),
    ("Legendary Item Name 0007", "legendary0007.png", "body"),
    ("Legendary Item Name 0008", "legendary0008.png", "arms"),
    ("Legendary Item Name 0009", "legendary0009.png", "legs"),
    ("Legendary Item Name 0010", "legendary0010.png", "accessory"),
];

pub const DEGENDARY_ITEMS: [(&str, &str, &str); NUM_IMAGES] = [
    ("Degendary Item Name 0001", "degendary0001.png", "head"),
    ("Degendary Item Name 0002", "degendary0002.png", "body"),
    ("Degendary Item Name 0003", "degendary0003.png", "arms"),
    ("Degendary Item Name 0004", "degendary0004.png", "legs"),
    ("Degendary Item Name 0005", "degendary0005.png", "accessory"),
    ("Degendary Item Name 0006", "degendary0006.png", "head"),
    ("Degendary Item Name 0007", "degendary0007.png", "body"),
    ("Degendary Item Name 0008", "degendary0008.png", "arms"),
    ("Degendary Item Name 0009", "degendary0009.png", "legs"),
    ("Degendary Item Name 0010", "degendary0010.png", "accessory"),
];

// pub fn generate_seed(ctx: &Context<RandomMintItem>) -> Result<u64> {
//     // 여러 엔트로피 요소 결합 후 SHA256 적용
//     let slot = Clock::get()?.slot;
//     let timestamp = Clock::get()?.unix_timestamp as u64;
//     let owner_bytes = ctx.accounts.owner.key().to_bytes();
//     let recent_block_hash = ctx.accounts.recent_blockhashes.data.borrow();
//     // msg!("FUNCTION CALLED GENERATE_SEED() SLOT VALUE: {}", slot);
//     // msg!("FUNCTION CALLED GENERATE_SEED() TIMESTAMP VALUE: {}", timestamp);
//     // msg!("FUNCTION CALLED GENERATE_SEED() OWNER BYTES VALUE: {:?}", owner_bytes);
//     // msg!("FUNCTION CALLED GENERATE_SEED() RECENT_BLOCK_HASH VALUE: {:?}", recent_block_hash);

//     // 각 요소를 바이트 배열로 변환하여 결합
//     let mut entropy = Vec::new();
//     entropy.extend_from_slice(&owner_bytes);
//     entropy.extend_from_slice(&slot.to_le_bytes());
//     entropy.extend_from_slice(&timestamp.to_le_bytes());
//     entropy.extend_from_slice(&recent_block_hash[0..32]);

//     // 여러 요소를 결합한 바이트 배열에 SHA256 해시 적용
//     let result: Hash = hash(&entropy);
//     let seed_bytes: [u8; 8] = result.as_ref()[0..8].try_into().unwrap();
//     Ok(u64::from_le_bytes(seed_bytes))
// }

#[program]
pub mod item {
    use super::*;

    // CREATE ITEM ACCOUNT
    pub fn create_item_account(ctx: Context<CreateItemAccount>,
        grade: String, name: String, uri: String, part: String, equipped: bool) -> Result<()> {
        let item_account = &mut ctx.accounts.item_account;
            item_account.owner = ctx.accounts.owner.key();
            item_account.grade = grade;
            item_account.name = name;
            item_account.uri = uri;
            item_account.part = part;
            item_account.equipped = equipped;
            Ok(())
    }
    
    // UPDATE ITEM ACCOUNT
    pub fn update_item_account(ctx: Context<UpdateItemAccount>,
        grade: Option<String>, name: Option<String>, uri: Option<String>, part: Option<String>, equipped: Option<bool>) -> Result<()> {
            let item_account = &mut ctx.accounts.item_account;
            if let Some(g) = grade { item_account.grade = g; }
            if let Some(n) = name { item_account.name = n; }
            if let Some(p) = part { item_account.part = p; }
            if let Some(u) = uri { item_account.uri = u; }
            if let Some(e) = equipped { item_account.equipped = e; }
            Ok(())
    }

    // DELETE ITEM ACCOUNT
    pub fn delete_item_account(_ctx: Context<DeleteItemAccount>) -> Result<()> {
        Ok(())
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // RANDOM MINT ITEM ACCOUNT
    pub fn random_mint_item(
        ctx: Context<RandomMintItem>,
        gacha_type: u8,
        dummy_tx_hash: String,
        block_hash: String,
        slot: u64,
        block_time: u64
    ) -> Result<()> {
        if (gacha_type as usize) >= NUM_GACHA {
            return Err(ErrorCode::InvalidGachaType.into());
        }

        let weights = GACHA_WEIGHTS[gacha_type as usize];
        let total_weight: u64 = weights.iter().sum();

        let finalize_game_ctx = CpiContext::new(
            ctx.accounts.game_program.to_account_info(),
            FinalizeGame {
                user: ctx.accounts.owner.to_account_info(),
                db_account: ctx.accounts.db_account.to_account_info(),
                code_account: ctx.accounts.code_account.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );
        finalize_game(
            finalize_game_ctx, 
            dummy_tx_hash, 
            block_hash, 
            slot, 
            block_time
        )?;
    
        // 반환된 struct의 data 필드에서 seed1, seed2 추출
        let seed1 = ctx.accounts.code_account.seed1;
        let seed2 = ctx.accounts.code_account.seed2;

        msg!("COMBINED SEED 1 FOR CHOOSING GACHA: {}", seed1);
        msg!("COMBINED SEED 2 FOR CHOOSING IMAGE: {}", seed2);

        // let seed1 = generate_seed(&ctx)?;
        let value = seed1 % total_weight;

        // 아이템별 확률 분포 적용
        // let (grade, images) = if weight < NORMAL_WEIGHT {
        //     ("NORMAL", NORMAL_IMAGES)
        // } else if weight < NORMAL_WEIGHT + RARE_WEIGHT {
        //     ("RARE", RARE_IMAGES)
        // } else if weight < NORMAL_WEIGHT + RARE_WEIGHT + EPIC_WEIGHT {
        //     ("EPIC", EPIC_IMAGES)
        // } else if weight < NORMAL_WEIGHT + RARE_WEIGHT + EPIC_WEIGHT + UNIQUE_WEIGHT {
        //     ("UNIQUE", UNIQUE_IMAGES)
        // } else if weight < TOTAL_WEIGHT {
        //     ("LEGENDARY", LEGENDARY_IMAGES)
        // } else {
        //     return Err(ErrorCode::InvalidItemGrade.into());
        // };

        // 가챠별 확률 분포 적용 + 아이템별 확률 분포 적용
        let mut grade_index = 0; let mut cumulative = 0;
        for (idx, weight) in weights.iter().enumerate() {
            cumulative += weight;
            if value < cumulative {
                grade_index = idx;
                break;
            }
        }

        for (idx, weight) in weights.iter().enumerate() {
            msg!("{} ITEM PROBABILITY: {}%", GRADE_NAMES[idx], (*weight as f64 / total_weight as f64) * 100.0);    
        }

        let grade = GRADE_NAMES[grade_index];
        let items = match grade_index {
            0 => NORMAL_ITEMS,
            1 => RARE_ITEMS,
            2 => EPIC_ITEMS,
            3 => UNIQUE_ITEMS,
            4 => LEGENDARY_ITEMS,
            5 => DEGENDARY_ITEMS,
            _ => return Err(ErrorCode::InvalidItemGrade.into()),
        };

        // let seed2 = generate_seed(&ctx)?;
        let item_index = (seed2 % items.len() as u64) as usize;

        let (name, uri, part) = items[item_index];
        let item_account = &mut ctx.accounts.item_account;
        item_account.owner = ctx.accounts.owner.key();
        item_account.grade = grade.to_string();
        item_account.name = name.to_string();
        item_account.uri = uri.to_string();
        item_account.part = part.to_string();
        item_account.equipped = false;

        msg!("COMBINED SEED 1 FOR CHOOSING GACHA: {}", seed1);
        msg!("COMBINED SEED 2 FOR CHOOSING IMAGE: {}", seed2);
        msg!("CALCULATED GRADE INDEX: {}", grade_index);
        msg!("CALCULATED IMAGE INDEX: {}", item_index);
        msg!("SELECTED ITEM URI: {}", uri);
        Ok(())        
    }

    // // Random ITEM Account 민팅(생성)
    // pub fn mint_random_item_account(ctx: Context<CreateItemAccount>) -> Result<()> {
    //     // Clock 값을 사용하여 간단한 난수 seed를 생성
    //     let seed = Clock::get()?.unix_timestamp as u64;

    //     // 미리 정의된 ITEM 메타데이터 쌍 (이름, URI)
    //     let items: [(&str, &str); 3] = [
    //         ("ITEM Alpha", "https://example.com/item_alpha.json"),
    //         ("ITEM Beta", "https://example.com/item_beta.json"),
    //         ("ITEM Gamma", "https://example.com/item_gamma.json"),
    //     ];

    //     // seed를 이용해 items 배열의 인덱스를 결정
    //     let idx = (seed % (items.len() as u64)) as usize;
    //     let (name, uri) = items[idx];

    //     let item_account = &mut ctx.accounts.item_account;
    //     item_account.owner = ctx.accounts.owner.key();
    //     item_account.name = name.to_string();
    //     item_account.uri = uri.to_string();
    //     Ok(())
    // }
}

// CREATE ITEM ACCOUNT
#[derive(Accounts)]
pub struct CreateItemAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    // discriminator(8) + owner(32) + grade(4 + 20) + name(4 + 20) + uri(4 + 20) + part(4 + 20) + equipped(1)
    #[account(init, payer = owner, space = 8 + 32 + (4 + 20) + (4 + 20) + (4 + 20) + (4 + 20) + 1)]
    pub item_account: Account<'info, ItemAccount>,
    pub system_program: Program<'info, System>,
}

// UPDATE ITEM ACCOUNT
#[derive(Accounts)]
pub struct UpdateItemAccount<'info> {
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner)]
    pub item_account: Account<'info, ItemAccount>,
}

// DELETE ITEM ACCOUNT
#[derive(Accounts)]
pub struct DeleteItemAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner, close = owner)]
    pub item_account: Account<'info, ItemAccount>,
}

// RANDOM MINT ITEM ACCOUNT
#[derive(Accounts)]
pub struct RandomMintItem<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    // discriminator(8) + owner(32) + grade(4 + 20) + name(4 + 20) + uri(4 + 20) + part(4 + 20) + equipped(1)
    #[account(init, payer = owner, space = 8 + 32 + (4 + 20) + (4 + 20) + (4 + 20) + (4 + 20) + 1)]
    pub item_account: Account<'info, ItemAccount>,
    /// CHECK: Recent blockhashes sysvar account
    // #[account(address = anchor_lang::solana_program::sysvar::recent_blockhashes::ID)]
    // pub recent_blockhashes: AccountInfo<'info>,

    #[account(mut)]
    pub db_account: Account<'info, game::state::DBaccount>,
    #[account(mut)]
    pub code_account: Account<'info, game::state::CodeAccount>,
    /// CHECK: Game program account
    pub game_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct FinalizeGameForItem<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(mut)]
//     pub db_account: Account<'info, game::state::DBaccount>,
//     #[account(mut)]
//     pub code_account: Account<'info, game::state::CodeAccount>,
//     pub system_program: Program<'info, System>,
// }

#[account]
pub struct ItemAccount {
    pub owner: Pubkey,
    pub grade: String,
    pub name: String,
    pub uri: String,
    pub part: String,
    pub equipped: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid Gacha Type Determined.")]
    InvalidGachaType,
    #[msg("Invalid Item Grade Determined.")]
    InvalidItemGrade,
}
