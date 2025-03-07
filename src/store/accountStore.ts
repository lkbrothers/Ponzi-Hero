import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PublicKey } from '@solana/web3.js';

interface DbAccount {
  publicKey: PublicKey;
  // 필요한 다른 DbAccount 속성들을 여기에 추가하세요
}

interface CreditAccount {
  publicKey: PublicKey;
  // 필요한 다른 CreditAccount 속성들을 여기에 추가하세요
}

interface AccountState {
  dbAccount: PublicKey;
  creditAccount: CreditAccount;
  selectedDbAccount: PublicKey | null;
  selectedCreditAccount: CreditAccount | null;
  
  // DbAccount 관련 액션
  setDbAccount: (account: PublicKey) => void;
  selectDbAccount: (account: PublicKey | null) => void;
  
  // CreditAccount 관련 액션
  setCreditAccount: (account: CreditAccount) => void;
  selectCreditAccount: (account: CreditAccount | null) => void;
}

export const useAccountStore = create<AccountState>()(
  devtools((set) => ({
    dbAccount: null,
    creditAccount: null,
    selectedDbAccount: null,
    selectedCreditAccount: null,
    
    // DbAccount 관련 액션
    setDbAccount: (account) => set({ dbAccount: account }),
    selectDbAccount: (account) => set({ selectedDbAccount: account }),
    
    // CreditAccount 관련 액션
    setCreditAccount: (account) => set({ creditAccount: account }),
    selectCreditAccount: (account) => set({ selectedCreditAccount: account }),
  }))
);
