use anchor_lang::prelude::*;
use credit::cpi::accounts::UpdateCreditAccount;
// use item::cpi::accounts::CreateItemAccount;
use item::cpi::accounts::UpdateItemAccount;
use item::cpi::accounts::DeleteItemAccount;
// use credit::program as CreditProgram;
// use item::program as ItemProgram;

declare_id!("CR8Sox2FniGkNFQ6AmE7FGi5cJjpJn7QTvhhgZcbg9PX");

pub const NUM_IMAGES: usize = 10;
pub const NUM_GACHA: usize = 6;
pub const NUM_GRADE: usize = 6;

pub const GRADE_NAMES: [&str; NUM_GRADE] = [
    "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

// 각 등급별 아이템 배열: (키, 등급, 이름, URI, 부위, 가격)
// NORMAL 아이템: 키 번호는 "NORM_0001" ~ "NORM_0010"
pub const NORMAL_ITEMS: [(&str, &str, &str, &str, &str, u64); NUM_IMAGES] = [
    ("NORM_0001", "NORMAL", "Normal Item Name 0001", "normal0001.png", "head", 100),
    ("NORM_0002", "NORMAL", "Normal Item Name 0002", "normal0002.png", "body", 100),
    ("NORM_0003", "NORMAL", "Normal Item Name 0003", "normal0003.png", "arms", 100),
    ("NORM_0004", "NORMAL", "Normal Item Name 0004", "normal0004.png", "legs", 100),
    ("NORM_0005", "NORMAL", "Normal Item Name 0005", "normal0005.png", "accessory", 100),
    ("NORM_0006", "NORMAL", "Normal Item Name 0006", "normal0006.png", "head", 100),
    ("NORM_0007", "NORMAL", "Normal Item Name 0007", "normal0007.png", "body", 100),
    ("NORM_0008", "NORMAL", "Normal Item Name 0008", "normal0008.png", "arms", 100),
    ("NORM_0009", "NORMAL", "Normal Item Name 0009", "normal0009.png", "legs", 100),
    ("NORM_0010", "NORMAL", "Normal Item Name 0010", "normal0010.png", "accessory", 100),
];

// RARE 아이템: 키 번호 "RARE_0001" ~ "RARE_0010"
pub const RARE_ITEMS: [(&str, &str, &str, &str, &str, u64); NUM_IMAGES] = [
    ("RARE_0001", "RARE", "Rare Item Name 0001", "rare0001.png", "head", 200),
    ("RARE_0002", "RARE", "Rare Item Name 0002", "rare0002.png", "body", 200),
    ("RARE_0003", "RARE", "Rare Item Name 0003", "rare0003.png", "arms", 200),
    ("RARE_0004", "RARE", "Rare Item Name 0004", "rare0004.png", "legs", 200),
    ("RARE_0005", "RARE", "Rare Item Name 0005", "rare0005.png", "accessory", 200),
    ("RARE_0006", "RARE", "Rare Item Name 0006", "rare0006.png", "head", 200),
    ("RARE_0007", "RARE", "Rare Item Name 0007", "rare0007.png", "body", 200),
    ("RARE_0008", "RARE", "Rare Item Name 0008", "rare0008.png", "arms", 200),
    ("RARE_0009", "RARE", "Rare Item Name 0009", "rare0009.png", "legs", 200),
    ("RARE_0010", "RARE", "Rare Item Name 0010", "rare0010.png", "accessory", 200),
];

// EPIC 아이템: 키 번호 "EPIC_0001" ~ "EPIC_0010"
pub const EPIC_ITEMS: [(&str, &str, &str, &str, &str, u64); NUM_IMAGES] = [
    ("EPIC_0001", "EPIC", "Epic Item Name 0001", "epic0001.png", "head", 300),
    ("EPIC_0002", "EPIC", "Epic Item Name 0002", "epic0002.png", "body", 300),
    ("EPIC_0003", "EPIC", "Epic Item Name 0003", "epic0003.png", "arms", 300),
    ("EPIC_0004", "EPIC", "Epic Item Name 0004", "epic0004.png", "legs", 300),
    ("EPIC_0005", "EPIC", "Epic Item Name 0005", "epic0005.png", "accessory", 300),
    ("EPIC_0006", "EPIC", "Epic Item Name 0006", "epic0006.png", "head", 300),
    ("EPIC_0007", "EPIC", "Epic Item Name 0007", "epic0007.png", "body", 300),
    ("EPIC_0008", "EPIC", "Epic Item Name 0008", "epic0008.png", "arms", 300),
    ("EPIC_0009", "EPIC", "Epic Item Name 0009", "epic0009.png", "legs", 300),
    ("EPIC_0010", "EPIC", "Epic Item Name 0010", "epic0010.png", "accessory", 300),
];

// UNIQUE 아이템: 키 번호 "UNIQ_0001" ~ "UNIQ_0010"
pub const UNIQUE_ITEMS: [(&str, &str, &str, &str, &str, u64); NUM_IMAGES] = [
    ("UNIQ_0001", "UNIQUE", "Unique Item Name 0001", "unique0001.png", "head", 400),
    ("UNIQ_0002", "UNIQUE", "Unique Item Name 0002", "unique0002.png", "body", 400),
    ("UNIQ_0003", "UNIQUE", "Unique Item Name 0003", "unique0003.png", "arms", 400),
    ("UNIQ_0004", "UNIQUE", "Unique Item Name 0004", "unique0004.png", "legs", 400),
    ("UNIQ_0005", "UNIQUE", "Unique Item Name 0005", "unique0005.png", "accessory", 400),
    ("UNIQ_0006", "UNIQUE", "Unique Item Name 0006", "unique0006.png", "head", 400),
    ("UNIQ_0007", "UNIQUE", "Unique Item Name 0007", "unique0007.png", "body", 400),
    ("UNIQ_0008", "UNIQUE", "Unique Item Name 0008", "unique0008.png", "arms", 400),
    ("UNIQ_0009", "UNIQUE", "Unique Item Name 0009", "unique0009.png", "legs", 400),
    ("UNIQ_0010", "UNIQUE", "Unique Item Name 0010", "unique0010.png", "accessory", 400),
];

// LEGENDARY 아이템: 키 번호 "LEGEN_0001" ~ "LEGEN_0010"
pub const LEGENDARY_ITEMS: [(&str, &str, &str, &str, &str, u64); NUM_IMAGES] = [
    ("LEGEN_0001", "LEGENDARY", "Legendary Item Name 0001", "legendary0001.png", "head", 500),
    ("LEGEN_0002", "LEGENDARY", "Legendary Item Name 0002", "legendary0002.png", "body", 500),
    ("LEGEN_0003", "LEGENDARY", "Legendary Item Name 0003", "legendary0003.png", "arms", 500),
    ("LEGEN_0004", "LEGENDARY", "Legendary Item Name 0004", "legendary0004.png", "legs", 500),
    ("LEGEN_0005", "LEGENDARY", "Legendary Item Name 0005", "legendary0005.png", "accessory", 500),
    ("LEGEN_0006", "LEGENDARY", "Legendary Item Name 0006", "legendary0006.png", "head", 500),
    ("LEGEN_0007", "LEGENDARY", "Legendary Item Name 0007", "legendary0007.png", "body", 500),
    ("LEGEN_0008", "LEGENDARY", "Legendary Item Name 0008", "legendary0008.png", "arms", 500),
    ("LEGEN_0009", "LEGENDARY", "Legendary Item Name 0009", "legendary0009.png", "legs", 500),
    ("LEGEN_0010", "LEGENDARY", "Legendary Item Name 0010", "legendary0010.png", "accessory", 500),
];

// DEGENDARY 아이템: 키 번호 "DEGEN_0001" ~ "DEGEN_0010"
pub const DEGENDARY_ITEMS: [(&str, &str, &str, &str, &str, u64); NUM_IMAGES] = [
    ("DEGEN_0001", "DEGENDARY", "Degendary Item Name 0001", "degendary0001.png", "head", 600),
    ("DEGEN_0002", "DEGENDARY", "Degendary Item Name 0002", "degendary0002.png", "body", 600),
    ("DEGEN_0003", "DEGENDARY", "Degendary Item Name 0003", "degendary0003.png", "arms", 600),
    ("DEGEN_0004", "DEGENDARY", "Degendary Item Name 0004", "degendary0004.png", "legs", 600),
    ("DEGEN_0005", "DEGENDARY", "Degendary Item Name 0005", "degendary0005.png", "accessory", 600),
    ("DEGEN_0006", "DEGENDARY", "Degendary Item Name 0006", "degendary0006.png", "head", 600),
    ("DEGEN_0007", "DEGENDARY", "Degendary Item Name 0007", "degendary0007.png", "body", 600),
    ("DEGEN_0008", "DEGENDARY", "Degendary Item Name 0008", "degendary0008.png", "arms", 600),
    ("DEGEN_0009", "DEGENDARY", "Degendary Item Name 0009", "degendary0009.png", "legs", 600),
    ("DEGEN_0010", "DEGENDARY", "Degendary Item Name 0010", "degendary0010.png", "accessory", 600),
];

pub fn get_item_price(grade: &str, name: &str, uri: &str, part: &str) -> Result<u64> {
    let items = match grade {
        "NORMAL" => NORMAL_ITEMS,
        "RARE" => RARE_ITEMS,
        "EPIC" => EPIC_ITEMS,
        "UNIQUE" => UNIQUE_ITEMS,
        "LEGENDARY" => LEGENDARY_ITEMS,
        "DEGENDARY" => DEGENDARY_ITEMS,
        _ => return Err(ErrorCode::InvalidItem.into()),
    };

    // 배열에서 name, uri, part가 모두 일치하는 아이템을 검색합니다.
    for item in items.iter() {
        let (_key, item_grade, item_name, item_uri, item_part, cost) = item;
        if *item_grade == grade && *item_name == name && *item_uri == uri && *item_part == part {
            return Ok(*cost);
        }
    }
    Err(ErrorCode::InvalidItem.into())
}

pub fn find_item_by_key(item_key: &str) -> Result<(&'static str, &'static str, &'static str, &'static str, &'static str, u64)> {
    // item_key의 길이가 4 미만이면 에러 반환
    if item_key.len() < 4 {
        return Err(ErrorCode::InvalidItemType.into());
    }
    let prefix = &item_key[0..4];

    // 앞 4자리(prefix)를 통해 검색할 배열을 선택하고, Box를 사용해 동적 iterator를 생성
    let mut items: Box<dyn Iterator<Item = &(&str, &str, &str, &str, &str, u64)>> = match prefix {
        "NORM" => Box::new(NORMAL_ITEMS.iter()),
        "RARE" => Box::new(RARE_ITEMS.iter()),
        "EPIC" => Box::new(EPIC_ITEMS.iter()),
        "UNIQ" => Box::new(UNIQUE_ITEMS.iter()),
        "LEGE" => Box::new(LEGENDARY_ITEMS.iter()),
        "DEGE" => Box::new(DEGENDARY_ITEMS.iter()),
        _ => return Err(ErrorCode::InvalidItemGrade.into()),
    };

    // 선택된 배열에서 정확히 일치하는 key를 검색
    let selected_item = items
        .find(|item| item.0 == item_key)
        .ok_or(ErrorCode::InvalidItemType)?;

    // 선택된 아이템의 정보를 역참조하여 튜플로 추출 (cost는 u64 타입)
    let &(_key, grade, name, uri, part, cost) = selected_item;
    Ok((_key, grade, name, uri, part, cost))
}

#[program]
pub mod shop {
    use super::*;

    // ITEM을 CREDIT으로 교환하는 함수
    // ITEM 종류에 따라 CreditAccount에 크레딧 추가
    // 크레딧 추가 후 NFT Account 소멸, 소유자에게 Lamport 반환
    pub fn exchange_item_to_credit(ctx: Context<ExchangeItemToCredit>) -> Result<()> {
        let item_cpi_ctx = CpiContext::new(
            ctx.accounts.item_program.to_account_info(),
            DeleteItemAccount {
                owner: ctx.accounts.owner.to_account_info(),
                item_account: ctx.accounts.item_account.to_account_info(),
            },
        );
        let credit_cpi_ctx = CpiContext::new(
            ctx.accounts.credit_program.to_account_info(),
            UpdateCreditAccount {
                owner: ctx.accounts.owner.to_account_info(),
                credit_account: ctx.accounts.credit_account.to_account_info(),
            },
        );

        let cost = get_item_price(
            &ctx.accounts.item_account.grade,
            &ctx.accounts.item_account.name,
            &ctx.accounts.item_account.uri,
            &ctx.accounts.item_account.part,
        )?;

        credit::cpi::increase_credit_account(credit_cpi_ctx, cost)?;
        item::cpi::delete_item_account(item_cpi_ctx)?;
        Ok(())
    }

    // CREDIT을 NFT로 교환하는 함수: 사용자가 원하는 NFT를 선택하면
    // 해당 NFT의 발행 비용(크레딧)이 차감되고, 새 NFT Account가 생성되어 소유자에게 할당
    pub fn exchange_credit_to_item(ctx: Context<ExchangeCreditToItem>, item_key: String) -> Result<()> {
        let credit_cpi_ctx = CpiContext::new(
            ctx.accounts.credit_program.to_account_info(),
            UpdateCreditAccount {
                owner: ctx.accounts.owner.to_account_info(),
                credit_account: ctx.accounts.credit_account.to_account_info(),
            },
        );
        let item_cpi_ctx = CpiContext::new(
            ctx.accounts.item_program.to_account_info(),
            UpdateItemAccount {
                owner: ctx.accounts.owner.to_account_info(),
                item_account: ctx.accounts.item_account.to_account_info(),
            },
        );

        let (_key, grade, name, uri, part, cost) = find_item_by_key(&item_key)?;
        credit::cpi::decrease_credit_account(credit_cpi_ctx, cost)?;
        item::cpi::update_item_account(item_cpi_ctx, 
            Some(grade.to_string()),
            Some(name.to_string()),
            Some(uri.to_string()),
            Some(part.to_string()),
            Some(false)
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ExchangeItemToCredit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub item_account: Account<'info, item::ItemAccount>,
    #[account(mut)]
    pub credit_account: Account<'info, credit::CreditAccount>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub item_program: AccountInfo<'info>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub credit_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExchangeCreditToItem<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub item_account: Account<'info, item::ItemAccount>,
    #[account(mut)]
    pub credit_account: Account<'info, credit::CreditAccount>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub item_program: AccountInfo<'info>,
    /// CHECK: CROSS-PROGRAM-INVOCATION
    pub credit_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("[ERROR] 제공된 Item이 유효하지 않습니다.")]
    InvalidItem,
    #[msg("[ERROR] 아이템 등급이 유효하지 않습니다.")]
    InvalidItemGrade,
    #[msg("[ERROR] 아이템 타입이 유효하지 않습니다.")]
    InvalidItemType,
    #[msg("[ERROR] 크레딧 잔액이 부족합니다.")]
    InsufficientCredit,
    #[msg("[ERROR] Overflow occurred: 잔액이 허용 범위를 초과합니다.")]
    Overflow,
    #[msg("[ERROR] Underflow occurred: 잔액은 0보다 작아질 수 없습니다.")]
    Underflow,
}
