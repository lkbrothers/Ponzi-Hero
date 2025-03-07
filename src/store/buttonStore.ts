import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ButtonType = 'BRONZE' | 'SILVER' | 'GOLD';

interface ButtonState {
  buttonType: ButtonType;
  setButtonType: (type: ButtonType) => void;
  getWinProbability: () => number;
}

export const useButtonStore = create<ButtonState>()(
  devtools((set, get) => ({
    buttonType: 'BRONZE',
    setButtonType: (type) => set({ buttonType: type }),
    getWinProbability: () => {
    const { buttonType } = get();
    switch (buttonType) {
      case 'BRONZE': return 0.1; // 10% 확률
      case 'SILVER': return 0.3; // 30% 확률
      case 'GOLD': return 0.5; // 50% 확률
      default: return 0.1;
    }
    }
  }))
);