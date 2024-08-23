import {create} from 'zustand';
import { type CarouselApi } from "@/components/ui/carousel"


interface pfpStoreState {
    pfpCarouselApi: CarouselApi;
    setPfpCarouselApi: (value: CarouselApi) => void;
}
export const usePfpStore = create<pfpStoreState>((set) => ({
    pfpCarouselApi: undefined,
    setPfpCarouselApi: (value: CarouselApi) => set({pfpCarouselApi: value}),
}));