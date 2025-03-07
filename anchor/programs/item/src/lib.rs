use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::{Hash, hash};

use game::cpi::{accounts::FinalizeGame, finalize_game};


// declare_id!("A3iwuQp9UcJsxcxXJ9ZWWLv5B616srHw8fCGkEeWgLjN");
declare_id!("4M2MAXqYYw9Qwek5WwzttegotU4sajWQrcmEfx8LZfga");

pub const NUM_GACHA: usize = 6;
pub const NUM_GRADE: usize = 6;
pub const NUM_IMAGES: usize = 10;

pub const GRADE_NAMES: [&str; NUM_GRADE] = [
    "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

pub const GACHA_WEIGHTS: [[u64; NUM_GRADE]; NUM_GACHA] = [
    [510, 300, 100, 60, 30, 0],     // 가챠 0: 51.0%, 30.0%, 10.0%, 06.0%, 03.0%, 00.0%
    [405, 360, 110, 80, 40, 5],     // 가챠 1: 40.5%, 36.0%, 11.0%, 08.0%, 04.0%, 00.5%
    [280, 400, 150, 100, 60, 10],   // 가챠 2: 28.0%, 40.0%, 15.0%, 10.0%, 06.0%, 01.0%
    [180, 250, 300, 150, 100, 20],  // 가챠 3: 18.0%, 25.0%, 30.0%, 15.0%, 10.0%, 02.0%
    [20, 200, 400, 200, 150, 30],   // 가챠 4: 02.0%, 20.0%, 40.0%, 20.0%, 15.0%, 03.0%
    [0, 50, 150, 400, 300, 100],    // 가챠 5: 00.0%, 05.0%, 15.0%, 40.0%, 30.0%, 10.0%
];

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
    ("RARE_0029", "RARE", "Poodles", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/Poodles_arms_rare.png", "arms", 100),
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
    ("EPIC_0011", "EPIC", "Ponz Bear", "ipfs://bafybeicjd2mozoo7sjtddf67tkenld5gk2sinwtgg6jakhblp6i56dcla4/PondBear_Body_unique.png", "body", 1500),
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

pub fn generate_seed(ctx: &Context<RandomMintItem>) -> Result<u64> {
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

        ctx.accounts.code_account.reload()?;
        // 반환된 struct의 data 필드에서 seed1, seed2 추출
        // let seed1 = ctx.accounts.code_account.seed1;
        // let seed2 = ctx.accounts.code_account.seed2;
        let seed1 = generate_seed(&ctx)?;
        let seed2 = generate_seed(&ctx)?;


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

        // let (name, uri, part) = items[item_index];
        let (_key, _grade, name, uri, part, _cost) = items[item_index];
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
    // discriminator(8) + owner(32) + grade(4 + 20) + name(4 + 20) + uri(4 + 200) + part(4 + 20) + equipped(1)
    #[account(init, payer = owner, space = 8 + 32 + (4 + 20) + (4 + 20) + (4 + 200) + (4 + 20) + 1)]
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
    // discriminator(8) + owner(32) + grade(4 + 20) + name(4 + 20) + uri(4 + 200) + part(4 + 20) + equipped(1)
    #[account(init, payer = owner, space = 8 + 32 + (4 + 20) + (4 + 20) + (4 + 200) + (4 + 20) + 1)]
    pub item_account: Account<'info, ItemAccount>,
    /// CHECK: Recent blockhashes sysvar account
    #[account(address = anchor_lang::solana_program::sysvar::recent_blockhashes::ID)]
    pub recent_blockhashes: AccountInfo<'info>,

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
