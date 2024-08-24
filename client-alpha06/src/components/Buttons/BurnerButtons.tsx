import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useDojo } from "@/dojo/useDojo";

import { useComponentValue } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useRegModalStore } from "@/store/index";
import { getPlayerPfPurl, getPlayerName } from '@/utils';

export const BurnerButtons = () => {
    const {
        setup: {
            clientComponents: { Player },
        },
        account,
    } = useDojo();

    const { setOpen } = useRegModalStore();

    const entityId = getEntityIdFromKeys([
        BigInt(account?.account.address),
    ]) as Entity;
    
    const player = useComponentValue(Player, entityId);
    const playerName = getPlayerName(player) ?? "";

    return (
        
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    
                    
                    <Button variant="ghost" 
                    className="relative p-4 rounded-full
                    hover:bg-blue-500/50
                    flex items-center
                    ">
                        <span className="mx-4 text-xl text-white">
                        {playerName}
                        </span>
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={getPlayerPfPurl(player)} alt={"username"} />
                        <AvatarFallback>{playerName}</AvatarFallback>
                        </Avatar>
                    </Button>

                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                    className="hover:cursor-pointer"
                    onClick={() => setOpen(true)}>
                    Edit Profile
                    </DropdownMenuItem>

                    {/* <DropdownMenuItem 
                    className="hover:cursor-pointer"
                    onClick={() => disconnect() }>
                    Disconnect
                    </DropdownMenuItem> */}

                </DropdownMenuContent>
            </DropdownMenu>
    )
}
