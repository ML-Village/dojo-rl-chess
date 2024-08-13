import React from 'react';
import { Button } from "@/components/ui/button";

export const LobbyControls = () => {
    return (
        <div className="flex justify-center items-center
            space-x-2
            my-2 py-2
            ">
                    
                    <Button className="text-2xl font-bold
                    p-8 rounded-xl
                    bg-gray-800 hover:bg-orange-600/70
                    ">
                        Create Game
                    </Button>
                    <Button className="text-2xl font-bold
                    p-8 rounded-xl
                    bg-gray-800 hover:bg-orange-600/70
                    ">
                        Play A Friend
                    </Button>
                </div>
    )
}
