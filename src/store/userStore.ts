import { create } from 'zustand';

interface UserStore {
    credit: string;
    setCredit: (credit: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    credit: "0",
    setCredit: (credit: string) => set({ credit }),
}));
