import React, {useEffect} from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
    useAccount,
    useConnect,
    useDisconnect,
    useExplorer,
} from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector"; 



import { useDojo } from "@/dojo/useDojo";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";

import { useRegModalStore } from "@/store";

import { getPlayerPfPurl, getPlayerName } from '@/utils';
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { set } from 'mobx';

export const ConnectControllerButton = () => {
    const { connect, connectors } = useConnect();
    const connector = connectors[0];
    const { disconnect } = useDisconnect();

    const { 
        address,
        // account, 
        isConnected } = useAccount();

    const {
        setup: {
            clientComponents: { Player },
        },
        //account,
    } = useDojo();

    const { setOpen, username, setUserName } = useRegModalStore();


    const entityId = getEntityIdFromKeys([
        BigInt(address??"0x0"),
    ]) as Entity;
    // get current component values
    const player = useComponentValue(Player, entityId);
    const playerName = getPlayerName(player) ?? "";


    const cController = connector as CartridgeConnector
    console.log("ConnectControllerButton.tsx: isConnected: ", isConnected)
    console.log("ConnectControllerButton.tsx: address: ", address)
    // console.log("ConnectControllerButton.tsx: Player: ", player)
    // console.log("ConnectControllerButton.tsx: PlayerName: ", playerName)

    useEffect(() => {
        let username = ""
        console.log("ConnectControllerButton.tsx: useEffect: ")
        const getUserName = async () => {
            try {
                username = await cController.username() ?? ""
                setUserName(username??"")
                console.log("ConnectControllerButton.tsx: getUserName: ", username)
                return username
            } catch(error) {
                console.error("ConnectControllerButton.tsx: Failed to fetch name:", error)
            }
            
        }
        getUserName()

    },[cController, isConnected, address])
    
    return (
        <>
            {
                !isConnected ? (
                        <Button
                        onClick={() => 
                            connect({ connector })
                        }
                        >ConnectControllerButton</Button>
                    ) 
                    
                    : 

                    (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" 
                                className="relative p-4 rounded-full
                                hover:bg-blue-500/50
                                flex items-center
                                ">
                                    <span className="mx-4 text-xl text-white">
                                    {username}
                                    </span>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={getPlayerPfPurl(player)} alt={"username"} />
                                        <AvatarFallback>{username}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            

                            {/* Dropdowns */}
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                className="hover:cursor-pointer"
                                onClick={() => setOpen(true)}>
                                    Edit Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem 
                                className="hover:cursor-pointer"
                                onClick={() => disconnect() }>
                                    Disconnect
                                </DropdownMenuItem>

                            </DropdownMenuContent>

                        </DropdownMenu>
                    )
            }
        </>
    )
}
