import {create} from 'zustand';

interface regModalStoreState {
    open: boolean;
    username: string;
    regCount: number;
    setOpen: (value:boolean) => void;
    incrementRegCount: () => void;
    setUserName: (value:string) => void;
}
export const useRegModalStore = create<regModalStoreState>((set) => ({
    open: true,
    username: "",
    regCount: 0,
    setOpen: (value: boolean) => set({ open: value }), 
    incrementRegCount: () => set((state) => ({ regCount: state.regCount + 1 })),
    setUserName: (value: string) => set({ username: value }),
}));