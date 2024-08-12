import React, { useEffect, useState, useRef } from 'react';
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselNext, 
    CarouselPrevious } from "@/components/ui/carousel"

import { pfpCardImageUrl } from '@/constants/assetspath';
import { usePfpStore } from '@/store';
import { RiArrowLeftWideFill, RiArrowRightWideFill } from "react-icons/ri";

const profilePics = [
    "/api/placeholder/200/200?text=Profile+1",
    "/api/placeholder/200/200?text=Profile+2",
    "/api/placeholder/200/200?text=Profile+3"
];

export const RegistrationCarousel = () => {
    const prevButtonRef = useRef(null);
    const nextButtonRef = useRef(null);
    const { pfpCarouselApi, setPfpCarouselApi } = usePfpStore();
    
    useEffect(() => {
        if (!pfpCarouselApi) {
            return
        }

        pfpCarouselApi.on("select", () => {
            // Do something on select.
            //console.log("Selected Pilot:", pfpCarouselApi.selectedScrollSnap())
        })
    }, [pfpCarouselApi])

    return (

        <div className="flex items-center justify-center 
                        space-x-2 
                        w-fit h-full px-2
                        border-2 border-blue-900/50
                        rounded-md
                        ">
            
            {/* <div className="border border-green-500 rounded-md
            w-fit
            "> */}
                {/* Left Arrow */}
                <div className="h-full flex items-center
                text-2xl font-bold
                hover:cursor-pointer 
                hover:text-cyan-700
                hover:text-3xl hover:font-extrabold
                "
                onClick={() => prevButtonRef.current?.click()}
                >
                    <RiArrowLeftWideFill />
                </div>
                
                <Carousel className="
                                rounded-2xl 
                                h-full aspect-square
                                flex items-center justify-center
                                overflow-hidden
                "
                    setApi={setPfpCarouselApi}
                >  
                    <CarouselContent>
                        {pfpCardImageUrl.map((imageUrl, index) => (
                            <CarouselItem key={index} 
                                className="flex justify-center items-center
                                        h-full aspect-square
                                "
                                style={
                                    {
                                        backgroundImage: `url(${imageUrl})`,
                                        backgroundSize: "104% 118%",
                                        backgroundPosition: "-50% 0%",
                                        backgroundRepeat: "no-repeat",
                                    }
                                }
                            >
                                {/* <img className="border border-green-700"
                                src={imageUrl} alt="pfp" /> */}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="" ref={prevButtonRef} />
                    <CarouselNext className="" ref={nextButtonRef}/>
                </Carousel>

                {/* Right Arrow */}
                <div className="h-full flex items-center
                text-2xl font-bold
                hover:cursor-pointer 
                hover:text-cyan-700
                hover:text-3xl hover:font-extrabold
                "
                onClick={() => nextButtonRef.current?.click()}
                >
                    <RiArrowRightWideFill />
                </div>
            {/* </div> */}
        </div>
    )
}

//export default RegistrationCarousel