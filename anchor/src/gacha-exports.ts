// 여기서는 Anchor 프로그램과 상호 작용하기 위한 유용한 타입과 함수를 내보냅니다.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import GachaIDL from '../target/idl/gacha.json'
import type { Gacha } from '../target/types/gacha'

// 가챠 관련 상수
export const NUM_GACHA = 6;
export const NUM_GRADE = 6;
export const NUM_IMAGES = 10;

export const GRADE_NAMES = [
  "NORMAL", "RARE", "EPIC", "UNIQUE", "LEGENDARY", "DEGENDARY"
];

export const GACHA_WEIGHTS = [
  [60, 25, 10, 4, 1, 0],  // 가챠 0: 가장 낮은 등급 (DEGENDARY 없음)
  [55, 25, 10, 4, 4, 2],  // 가챠 1
  [50, 25, 10, 4, 7, 4],  // 가챠 2
  [45, 25, 10, 4, 9, 7],  // 가챠 3
  [40, 25, 10, 4, 9, 12], // 가챠 4
  [35, 25, 10, 4, 9, 17], // 가챠 5: 가장 높은 등급 (DEGENDARY 있음)
];

export const VALID_IMAGES = [
  // NORMAL images
  "normal0001.png", "normal0002.png", "normal0003.png", "normal0004.png", "normal0005.png",
  "normal0006.png", "normal0007.png", "normal0008.png", "normal0009.png", "normal0010.png",
  // RARE images
  "rare0001.png", "rare0002.png", "rare0003.png", "rare0004.png", "rare0005.png",
  "rare0006.png", "rare0007.png", "rare0008.png", "rare0009.png", "rare0010.png",
  // EPIC images
  "epic0001.png", "epic0002.png", "epic0003.png", "epic0004.png", "epic0005.png",
  "epic0006.png", "epic0007.png", "epic0008.png", "epic0009.png", "epic0010.png",
  // UNIQUE images
  "unique0001.png", "unique0002.png", "unique0003.png", "unique0004.png", "unique0005.png",
  "unique0006.png", "unique0007.png", "unique0008.png", "unique0009.png", "unique0010.png",
  // LEGENDARY images
  "legendary0001.png", "legendary0002.png", "legendary0003.png", "legendary0004.png", "legendary0005.png",
  "legendary0006.png", "legendary0007.png", "legendary0008.png", "legendary0009.png", "legendary0010.png",
  // DEGENDARY images
  "degendary0001.png", "degendary0002.png", "degendary0003.png", "degendary0004.png", "degendary0005.png",
  "degendary0006.png", "degendary0007.png", "degendary0008.png", "degendary0009.png", "degendary0010.png",
];

// 생성된 IDL과 타입을 다시 내보냅니다.
export { Gacha, GachaIDL }

// programId는 프로그램 IDL에서 가져옵니다.
export const GACHA_PROGRAM_ID = new PublicKey(GachaIDL.address)

// 이것은 가챠 Anchor 프로그램을 가져오는 헬퍼 함수입니다.
export function getGachaProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...GachaIDL, address: address ? address.toBase58() : GachaIDL.address } as Gacha, provider)
}

// 이것은 클러스터에 따라 가챠 프로그램의 프로그램 ID를 가져오는 헬퍼 함수입니다.
export function getGachaProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // 이것은 devnet과 testnet에서 가챠 프로그램의 프로그램 ID입니다.
      return new PublicKey('B5jvU8fizMd4cPo8xBg3MMVLGKggB8Q5b5KjoUkDR3bJ')
    case 'mainnet-beta':
    default:
      return GACHA_PROGRAM_ID
  }
}
