import {create} from 'zustand';

interface regModalStoreState {
    open: boolean;
    setOpen: (value:boolean) => void;
}
export const useRegModalStore = create<regModalStoreState>((set) => ({
    open: true,
    setOpen: (value: boolean) => set({ open: value }), 
}));