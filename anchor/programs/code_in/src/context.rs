use anchor_lang::prelude::*;

use crate::state::*;

// #[derive(Accounts)]
// pub struct CreateDBAccount<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(
//         init_if_needed,
//         payer = user,
//         seeds = [user.key().as_ref()],
//         bump,
//         space = 8 + 1 + 50 + 8 + 100
//     )]
//     pub db_account: Account<'info, DBAccount>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
pub struct CreateDBAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // 이미 초기화된 계정을 그대로 사용하도록 변경
    #[account(mut, seeds = [user.key().as_ref()], bump)]
    pub db_account: Account<'info, DBAccount>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct UpdateDBAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, has_one = user)]
    pub db_account: Account<'info, DBAccount>,
}

#[derive(Accounts)]
#[instruction(_timestamp: u64)]
pub struct CreateCodeAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init_if_needed,
        payer = user,
        seeds = [user.key().as_ref(), &_timestamp.to_le_bytes()],
        bump,
        space = 1 + 1 + 900 + 100
    )]
    pub code_account: Account<'info, CodeAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCodeAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, has_one = user)]
    pub code_account: Account<'info, CodeAccount>,
}

// use anchor_lang::prelude::*;

// use crate::state::*;

// #[derive(Accounts)]
// pub struct CreateDBAccount<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     /// CHECK: 이 필드는 내부에서 직접 생성되므로 검증할 필요 없음
//     #[account(mut)]
//     pub db_account: UncheckedAccount<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct UpdateDBAccount<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(mut, has_one = user)]
//     pub db_account: Account<'info, DBAccount>,
// }

// #[derive(Accounts)]
// // #[instruction(_timestamp: u64)]
// pub struct CreateCodeAccount<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     /// CHECK: 이 필드는 내부에서 직접 생성되므로 검증할 필요 없음
//     #[account(mut)]
//     pub code_account: UncheckedAccount<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct UpdateCodeAccount<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,
//     #[account(mut, has_one = user)]
//     pub code_account: Account<'info, CodeAccount>,
// }