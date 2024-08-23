import {create} from 'zustand';

interface regModalStoreState {
    open: boolean;
    regCount: number;
    setOpen: (value:boolean) => void;
    incrementRegCount: () => void;
}
export const useRegModalStore = create<regModalStoreState>((set) => ({
    open: true,
    regCount: 0,
    setOpen: (value: boolean) => set({ open: value }), 
    incrementRegCount: () => set((state) => ({ regCount: state.regCount + 1 })),
}));