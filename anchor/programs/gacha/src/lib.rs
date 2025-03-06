use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::{Hash, hash};

declare_id!("B5jvU8fizMd4cPo8xBg3MMVLGKggB8Q5b5KjoUkDR3bJ");

// const NORMAL_WEIGHT: u64= 60;
// const RARE_WEIGHT: u64 = 25;
// const EPIC_WEIGHT: u64 = 10;
// const UNIQUE_WEIGHT: u64 = 4;
// const LEGENDARY_WEIGHT: u64 = 1;
// const DEGENDARY_WEIGHT: u64 = 1;
// const TOTAL_WEIGHT: u64 = NORMAL_WEIGHT + RARE_WEIGHT + EPIC_WEIGHT + UNIQUE_WEIGHT + LEGENDARY_WEIGHT + DEGENDARY_WEIGHT;

pub const NUM_GACHA: usize = 6;
pub const NUM_GRADE: usize = 6;
pub const NUM_IMAGES: usize = 10;

pub const GRADE_NAMES: [&str; NUM_GRADE] = [
    "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

const GACHA_WEIGHTS: [[u64; NUM_GRADE]; NUM_GACHA] = [
    [60, 25, 10, 4, 1, 0],  // 가챠 0: 가장 낮은 등급 (DEGENDARY 없음)
    [55, 25, 10, 4, 4, 2],  // 가챠 1
    [50, 25, 10, 4, 7, 4],  // 가챠 2
    [45, 25, 10, 4, 9, 7],  // 가챠 3
    [40, 25, 10, 4, 9, 12], // 가챠 4
    [35, 25, 10, 4, 9, 17], // 가챠 5: 가장 높은 등급 (DEGENDARY 있음)
];

const NORMAL_IMAGES: [&str; NUM_IMAGES] = [
    "normal0001.png", "normal0002.png", "normal0003.png", "normal0004.png", "normal0005.png",
    "normal0006.png", "normal0007.png", "normal0008.png", "normal0009.png", "normal0010.png",
];
const RARE_IMAGES: [&str; NUM_IMAGES]   = [
    "rare0001.png", "rare0002.png", "rare0003.png", "rare0004.png", "rare0005.png",
    "rare0006.png", "rare0007.png", "rare0008.png", "rare0009.png", "rare0010.png",
];
const EPIC_IMAGES: [&str; NUM_IMAGES]   = [
    "epic0001.png", "epic0002.png", "epic0003.png", "epic0004.png", "epic0005.png",
    "epic0006.png", "epic0007.png", "epic0008.png", "epic0009.png", "epic0010.png",
];
const UNIQUE_IMAGES: [&str; NUM_IMAGES] = [
    "unique0001.png", "unique0002.png", "unique0003.png", "unique0004.png", "unique0005.png",
    "unique0006.png", "unique0007.png", "unique0008.png", "unique0009.png", "unique0010.png",
];
const LEGENDARY_IMAGES: [&str; NUM_IMAGES] = [
    "legendary0001.png", "legendary0002.png", "legendary0003.png", "legendary0004.png", "legendary0005.png",
    "legendary0006.png", "legendary0007.png", "legendary0008.png", "legendary0009.png", "legendary0010.png",
];
const DEGENDARY_IMAGES: [&str; NUM_IMAGES] = [
    "degendary0001.png", "degendary0002.png", "degendary0003.png", "degendary0004.png", "degendary0005.png",
    "degendary0006.png", "degendary0007.png", "degendary0008.png", "degendary0009.png", "degendary0010.png",
];

pub fn generate_seed(ctx: &Context<MintItem>) -> Result<u64> {
    // 여러 엔트로피 요소 결합 후 SHA256 적용
    let slot = Clock::get()?.slot;
    let timestamp = Clock::get()?.unix_timestamp as u64;
    let owner_bytes = ctx.accounts.owner.key().to_bytes();
    let recent_block_hash = ctx.accounts.recent_blockhashes.data.borrow();
    // msg!("FUNCTION CALLED GENERATE_SEED() SLOT VALUE: {}", slot);
    // msg!("FUNCTION CALLED GENERATE_SEED() TIMESTAMP VALUE: {}", timestamp);
    // msg!("FUNCTION CALLED GENERATE_SEED() OWNER BYTES VALUE: {:?}", owner_bytes);
    // msg!("FUNCTION CALLED GENERATE_SEED() RECENT_BLOCK_HASH VALUE: {:?}", recent_block_hash);

    // 각 요소를 바이트 배열로 변환하여 결합
    let mut entropy = Vec::new();
    entropy.extend_from_slice(&owner_bytes);
    entropy.extend_from_slice(&slot.to_le_bytes());
    entropy.extend_from_slice(&timestamp.to_le_bytes());
    entropy.extend_from_slice(&recent_block_hash[0..32]);

    // 여러 요소를 결합한 바이트 배열에 SHA256 해시 적용
    let result: Hash = hash(&entropy);
    let seed_bytes: [u8; 8] = result.as_ref()[0..8].try_into().unwrap();
    Ok(u64::from_le_bytes(seed_bytes))
}

#[program]
pub mod gacha {
    use super::*;

    pub fn mint_item(ctx: Context<MintItem>, gacha_type: u8) -> Result<()> {
        if (gacha_type as usize) >= NUM_GACHA {
            return Err(ErrorCode::InvalidGachaType.into());
        }

        let weights = GACHA_WEIGHTS[gacha_type as usize];
        let total_weight: u64 = weights.iter().sum();

        let seed1 = generate_seed(&ctx)?;
        let value = seed1 % total_weight;

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
        let images = match grade_index {
            0 => NORMAL_IMAGES,
            1 => RARE_IMAGES,
            2 => EPIC_IMAGES,
            3 => UNIQUE_IMAGES,
            4 => LEGENDARY_IMAGES,
            5 => DEGENDARY_IMAGES,
            _ => return Err(ErrorCode::InvalidItemGrade.into()),
        };

        let seed2 = generate_seed(&ctx)?;
        let image_index = (seed2 % images.len() as u64) as usize;

        let image = images[image_index];
        let item_account = &mut ctx.accounts.item_account;
        item_account.owner = ctx.accounts.owner.key();
        item_account.grade = grade.to_string();
        item_account.image = image.to_string();

        msg!("COMBINED SEED 1 FOR CHOOSING GACHA: {}", seed1);
        msg!("COMBINED SEED 2 FOR CHOOSING IMAGE: {}", seed2);
        msg!("CALCULATED GRADE INDEX: {}", grade_index);
        msg!("CALCULATED IMAGE INDEX: {}", image_index);
        msg!("SELECTED IMAGE FILENAME: {}", image);
        Ok(())        
    }
}

#[derive(Accounts)]
pub struct MintItem<'info> {
    // Discriminator(8) + owner(32) + length(4) + grade(20) + length(4) + image(20)
    #[account(init, payer = owner, space = 8 + 32 + 4 + 20 + 4 + 20)]
    pub item_account: Account<'info, ItemAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Recent blockhashes sysvar account
    #[account(address = anchor_lang::solana_program::sysvar::recent_blockhashes::ID)]
    pub recent_blockhashes: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ItemAccount {
    pub owner: Pubkey,
    pub grade: String,
    pub image: String,
    // pub part: String,
    // pub active: Bolean,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid Item Grade Determined.")]
    InvalidItemGrade,
    #[msg("Invalid Gacha Type Determined.")]
    InvalidGachaType,
}
