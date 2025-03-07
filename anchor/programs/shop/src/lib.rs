use anchor_lang::prelude::*;
use credit::cpi::accounts::UpdateCreditAccount;
// use item::cpi::accounts::CreateItemAccount;
use item::cpi::accounts::UpdateItemAccount;
use item::cpi::accounts::DeleteItemAccount;
// use credit::program as CreditProgram;
// use item::program as ItemProgram;

declare_id!("2rwPP5Dev33CypTWEEDP1DSGpxYVi7xAcKwiTRYXWQNe");

pub const NUM_IMAGES: usize = 10;
pub const NUM_GACHA: usize = 6;
pub const NUM_GRADE: usize = 6;

pub const GRADE_NAMES: [&str; NUM_GRADE] = [
    "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

// 각 등급별 아이템 배열: (키, 등급, 이름, URI, 부위, 가격)
// NORMAL 아이템: 키 번호는 "NORM_0001" ~ "NORM_0010"
pub static NORMAL_ITEMS: &[(&str, &str, &str, &str, &str, u64)] = &[
    ("NORM_0001", "NORMAL", "Age of Ponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/AgeofPonzi_head_common.png", "head", 10),
    ("NORM_0002", "NORMAL", "Famous Fox ponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/FamousFoxponzi_head_common.png", "head", 10),
    ("NORM_0003", "NORMAL", "hypers", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/hypers_head_common.png", "head", 10),
    ("NORM_0004", "NORMAL", "Juponter", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Juponter_head_common.png", "head", 10),
    ("NORM_0005", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana_head_common.png", "head", 10),
    ("NORM_0006", "NORMAL", "oozi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/oozi_head_common.png", "head", 10),
    ("NORM_0007", "NORMAL", "Peebits", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Peebits_head_common.png", "head", 10),
    ("NORM_0008", "NORMAL", "PNE1", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PNE1_head_common.png", "head", 10),
    ("NORM_0009", "NORMAL", "Ponzi16z", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzi16z_head_common.png", "head", 10),
    ("NORM_0010", "NORMAL", "ponziside", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/ponziside_head_common.png", "head", 10),
    ("NORM_0011", "NORMAL", "PonziTown.wtf", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziTown.wtf_head_common.png", "head", 10),
    ("NORM_0012", "NORMAL", "Ponziverse", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponziverse_head_common.png", "head", 10),
    ("NORM_0013", "NORMAL", "Poteora", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponziworld_head_common.png", "head", 10),
    ("NORM_0014", "NORMAL", "Ponziworld", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poteora_head_common.png", "head", 10),
    ("NORM_0015", "NORMAL", "sproto ponzin", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/sprotoponzin_head_common.png", "head", 10),
    ("NORM_0016", "NORMAL", "Yogaponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Yogaponzi_head_common.png", "head", 10),
    ("NORM_0017", "NORMAL", "Famous Fox Ponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/FamousFoxPonzi_body_common.png", "body", 10),
    ("NORM_0018", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana1_body_common.png", "body", 10),
    ("NORM_0019", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana2_body_common.png", "body", 10),
    ("NORM_0020", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana3_body_common.png", "body", 10),
    ("NORM_0021", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana4_body_common.png", "body", 10),
    ("NORM_0022", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana5_body_common.png", "body", 10),
    ("NORM_0023", "NORMAL", "NPC on ponzana", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NPConponzana6_body_common.png", "body", 10),
    ("NORM_0024", "NORMAL", "oozi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/oozi_body_common.png", "body", 10),
    ("NORM_0025", "NORMAL", "Peebits", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Peebits_body_common.png", "body", 10),
    ("NORM_0026", "NORMAL", "Pizza Pinza", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PizzaPinza_body_common.png", "body", 10),
    ("NORM_0027", "NORMAL", "Ponzi16z", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziTown.wtf_body_common.png", "body", 10),
    ("NORM_0028", "NORMAL", "ponziside", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/ponziside_body_common.png", "body", 10),
    ("NORM_0029", "NORMAL", "PonziTown.wtf", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziTown.wtf_body_common.png", "body", 10),
    ("NORM_0030", "NORMAL", "PSC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PSC_body_common.png", "body", 10),
    ("NORM_0031", "NORMAL", "Juponter", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Juponter_arms_common.png", "arms", 10),
    ("NORM_0032", "NORMAL", "Magicponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Magicponzi_arms_common.png", "arms", 10),
    ("NORM_0033", "NORMAL", "Oponzea gemesis", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Oponzeagemesis_arms_common.png", "arms", 10),
    ("NORM_0034", "NORMAL", "PAKC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PAKC_arms_common.png", "arms", 10),
    ("NORM_0035", "NORMAL", "Pombo", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Pombo_arms_common.png", "arms", 10),
    ("NORM_0036", "NORMAL", "Ponzimask", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzimask_arms_common.png", "arms", 10),
    ("NORM_0037", "NORMAL", "Poodles", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poodles_arms_common.png", "arms", 10),
    ("NORM_0038", "NORMAL", "Sancpom", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Sancpom_arms_common.png", "arms", 10),
];

pub static RARE_ITEMS: &[(&str, &str, &str, &str, &str, u64)] = &[
    ("RARE_0001", "RARE", "CyberPongz", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/CyberPongz_head_rare.png", "head", 100),
    ("RARE_0002", "RARE", "Pondelion", "ipfs://bafybeibgg3nbuppcswctptabkm6auklchjztrui6wzofklpvxqtv5pvdli/Pondelion_head_rare.png", "head", 100),
    ("RARE_0003", "RARE", "happy Ponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/happyPonzi_head_rare.png", "head", 100),
    ("RARE_0004", "RARE", "MPYC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/MPYC_head_rare.png", "head", 100),
    ("RARE_0005", "RARE", "NodePonkey", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/NodePonkey_head_rare.png", "head", 100),
    ("RARE_0006", "RARE", "p00ts", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/p00ts_head_rare.png", "head", 100),
    ("RARE_0007", "RARE", "Pammoth Overload", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PammothOverload_head_rare.png", "head", 100),
    ("RARE_0008", "RARE", "PanzBear", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PanzBear_head_rare.png", "head", 100),
    ("RARE_0009", "RARE", "Pizza Pinza", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PizzaPinza_head_rare.png", "head", 100),
    ("RARE_0010", "RARE", "PONSORIANS", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PONSORIANS_head_rare.png", "head", 100),
    ("RARE_0011", "RARE", "Ponzikids", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzikids_head_rare.png", "head", 100),
    ("RARE_0012", "RARE", "Poonbirds", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poonbirds_head_rare.png", "head", 100),
    ("RARE_0013", "RARE", "PSC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PSC_head_rare.png", "head", 100),
    ("RARE_0014", "RARE", "Sloth Ponzi Society", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/SlothPonziSociety_head_rare.png", "head", 100),
    ("RARE_0015", "RARE", "ponsorian", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/ponsorian_Body_rare.png", "body", 100),
    ("RARE_0016", "RARE", "Lil Ponzies", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/LilPonzies_Body_rare.png", "body", 100),
    ("RARE_0017", "RARE", "Pammoth Overload", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PammothOverload_Body_rare.png", "body", 100),
    ("RARE_0018", "RARE", "Panz Bear", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PanzBear_Body_unique.png", "body", 100),
    ("RARE_0019", "RARE", "Ponz", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/ponz_Body_rare.png", "body", 100),
    ("RARE_0020", "RARE", "Pongod", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Pongod_Body_rare.png", "body", 100),
    ("RARE_0021", "RARE", "Potatonzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Potatonzi_Body_rare.png", "body", 100),
    ("RARE_0022", "RARE", "Sloth Ponzi Society", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/SlothPonziSociety_Body_rare.png", "body", 100),
    ("RARE_0023", "RARE", "Oponzea gemesis", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Oponzeagemesis_arms_rare.png", "arms", 100),
    ("RARE_0024", "RARE", "Peanz", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Peanz_arms_rare.png", "arms", 100),
    ("RARE_0025", "RARE", "pepeland", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/pepeland_arms_rare.png", "arms", 100),
    ("RARE_0026", "RARE", "Ponzana phone1 Saga", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzanaphone1Saga_arms_rare.png", "arms", 100),
    ("RARE_0027", "RARE", "ponzipaw", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/ponzipaw_arms_rare.png", "arms", 100),
    ("RARE_0028", "RARE", "Ponzi-X", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziX_arms_rare.png", "arms", 100),
    ("RARE_0029", "RARE", "Poodles", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poodles_arms_rare", "arms", 100),
    ("RARE_0030", "RARE", "Porca", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Porca_arms_rare.png", "arms", 100),
    ("RARE_0031", "RARE", "PonziStone", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziStone_arms_rare.png", "arms", 100),
    ("RARE_0032", "RARE", "Yogaponz", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Yogaponz_arms_rare.png", "arms", 100),
];

pub static EPIC_ITEMS: &[(&str, &str, &str, &str, &str, u64)] = &[
    ("EPIC_0001", "EPIC", "Caponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Caponzi_head_unique.png", "head", 1500),
    ("EPIC_0002", "EPIC", "Keungzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Keungzi_head_unique.png", "head", 1500),
    ("EPIC_0003", "EPIC", "Moca vs ponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Mocavsponzi_head_unique.png", "head", 1500),
    ("EPIC_0004", "EPIC", "PonzBear", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Pongod_head_unique.png", "head", 1500),
    ("EPIC_0005", "EPIC", "Pongod", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonzBear_head_unique.png", "head", 1500),
    ("EPIC_0006", "EPIC", "Ponzicat", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzicat_head_unique.png", "head", 1500),
    ("EPIC_0007", "EPIC", "Ponzi-X", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziX_head_unique.png", "head", 1500),
    ("EPIC_0008", "EPIC", "SMP", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/SMP_head_unique.png", "head", 1500),
    ("EPIC_0009", "EPIC", "BPYC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/BPYC_Body_unique.png", "body", 1500),
    ("EPIC_0010", "EPIC", "Moca vs Ponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/MocavsPonzi_Body_unique.png", "body", 1500),
    ("EPIC_0011", "EPIC", "Ponz Bear", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonzBear_Body_unique.png", "body", 1500),
    ("EPIC_0012", "EPIC", "Azukey", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Azukey_arms_unique.png", "arms", 1500),
    ("EPIC_0013", "EPIC", "Backponzi", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Backponzi_arms_unique.png", "arms", 1500),
    ("EPIC_0014", "EPIC", "CUPIS", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/CUPIS_arms_unique.png", "arms", 1500),
    ("EPIC_0015", "EPIC", "Pothir edge ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Pothiredge_arms_unique.png", "arms", 1500),
    ("EPIC_0016", "EPIC", "Ponzana phone2 Seeker", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzanaphone2Seeker_arms_unique.png", "arms", 1500),
    ("EPIC_0017", "EPIC", "Ponzi-X", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziX_arms_unique.png", "arms", 1500),
];

pub static UNIQUE_ITEMS: &[(&str, &str, &str, &str, &str, u64)] = &[
    ("UNIQ_0001", "UNIQUE", "Madlabs", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Madlabs_head_eipc.png", "head", 20000),
    ("UNIQ_0002", "UNIQUE", "Milboy Maker", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/MilboyMaker_head_eipc.png", "head", 20000),
    ("UNIQ_0003", "UNIQUE", "OMP", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/OMP_head_eipc.png", "head", 20000),
    ("UNIQ_0004", "UNIQUE", "Ponzicat", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzicat_head_eipc.png", "head", 20000),
    ("UNIQ_0005", "UNIQUE", "Ponzi-X", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PonziX_head_eipc.png", "head", 20000),
    ("UNIQ_0006", "UNIQUE", "Poodles", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poodles_head_eipc.png", "head", 20000),
    ("UNIQ_0007", "UNIQUE", "Madlabs", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Madlabs_body_epic.png", "body", 20000),
    ("UNIQ_0008", "UNIQUE", "Milboy Maker", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Milboy_body_epic.png", "body", 20000),
    ("UNIQ_0009", "UNIQUE", "Azukey", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Azukey_arms_epic.png", "arms", 20000),
    ("UNIQ_0010", "UNIQUE", "Chromie Squiggle", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/ChromieSquiggle_arms_epic.png", "arms", 20000),
    ("UNIQ_0011", "UNIQUE", "Madlabs  우산", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Madlabs_arms_epic.png", "arms", 20000),
    ("UNIQ_0012", "UNIQUE", "MPYC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/MPYC_arms_epic.png", "arms", 20000),
    ("UNIQ_0013", "UNIQUE", "phontom", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/phontom_arms_epic.png", "arms", 20000),
    ("UNIQ_0014", "UNIQUE", "Pudgy Ponzies Rods", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PudgyPonziesRods_arms_epic.png", "arms", 20000),
];

pub static LEGENDARY_ITEMS: &[(&str, &str, &str, &str, &str, u64)] = &[
    ("LEGEN_0001", "LEGENDARY", "Azukey", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Azukey_head_legen.png", "head", 100000),
    ("LEGEN_0002", "LEGENDARY", "BPYC", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/BPYC_head_legen.png", "head", 100000),
    ("LEGEN_0003", "LEGENDARY", "CryptoPonzies", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/CryptoPonzies1_head_legen.png", "head", 100000),
    ("LEGEN_0004", "LEGENDARY", "CryptoPonzies", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/CryptoPonzies2_head_legen.png", "head", 100000),
    ("LEGEN_0005", "LEGENDARY", "Madlabs", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Madlabs_head_legen.png", "head", 100000),
    ("LEGEN_0006", "LEGENDARY", "Pudgy Ponzies", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Pudgy Ponzies_head_legen.png", "head", 100000),
    ("LEGEN_0007", "LEGENDARY", "Poodles", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poodles_head_legen.png", "head", 100000),
    ("LEGEN_0008", "LEGENDARY", "Azukey", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Azukey_Body_legen.png", "body", 100000),
    ("LEGEN_0009", "LEGENDARY", "Pudgy Ponzies", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PudgyPonzies_Body_legen.png", "body", 100000),
    ("LEGEN_0010", "LEGENDARY", "Paito ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzito_arms_legen.png", "arms", 100000),
    ("LEGEN_0011", "LEGENDARY", "Ponzi.fun ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Ponzi.fun_arms_legen.png", "arms", 100000),
];

pub static DEGENDARY_ITEMS: &[(&str, &str, &str, &str, &str, u64)] = &[
    ("DEGEN_0001", "DEGENDARY", "Azukey ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Azukey_head_degen.png", "head", 5000000),
    ("DEGEN_0002", "DEGENDARY", "CryptoPonzies ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/CryptoPonzies_head_degen.png", "head", 5000000),
    ("DEGEN_0003", "DEGENDARY", "Madlabs ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Madlabs_head_degen.png", "head", 5000000),
    ("DEGEN_0004", "DEGENDARY", "Pudgy Ponzies ", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PudgyPonzies_head_degen.png", "head", 5000000),
    ("DEGEN_0005", "DEGENDARY", "Madlabs", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Madlabs_body_degen.png", "body", 5000000),
    ("DEGEN_0006", "DEGENDARY", "CryptoPonzies", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/CryptoPonzies_arms_degen.png", "arms", 5000000),
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
