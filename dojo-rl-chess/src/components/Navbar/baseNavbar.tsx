import React, {useEffect, useState} from 'react';
import { FaChessKnight } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


import { useDojo } from "@/dojo/useDojo";
import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useRegModalStore } from "@/store/index";
import { pfpCardImageUrl } from '@/constants/assetspath';

import { feltToString, stringToFelt } from "@/utils/starknet";
import { getPlayerPfPurl, getPlayerName } from '@/utils';
import { RegistrationModal } from '../Modals';
import { useNavigate } from 'react-router-dom';


export const BaseNavbar = () => {
  const {
    setup: {
        systemCalls: { register_player, update_player, invite, reply_invite },
        clientComponents: { Game, GameState, Player },
        toriiClient,
        contractComponents,
    },
    account,
} = useDojo();

  const { open , setOpen } = useRegModalStore();
  const navigate = useNavigate();

  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;
  // get current component values
  const player = useComponentValue(Player, entityId);
  const playerName = getPlayerName(player) ?? "";


  useQuerySync(toriiClient, contractComponents as any, [
    {
        Keys: {
            keys: [BigInt(account?.account.address).toString()],
            models: [
                "rl_chess_contracts-Player",
            ],
            pattern_matching: "FixedLen",
        },
    },
    player
  ]);

  console.log("player")
  console.log(player)

  useEffect(() => {
    // if there is no player or account is not yet loaded
    if (!player || account?.count<0) {
      console.log("player not registered.")
      setOpen(true); // set Modal open if player not registered
      return;
    }
    setOpen(false)

  },[player, account])

  return (
    <nav className="bg-blue-950 shadow-md
    rounded-b-md py-2
    ">
      <RegistrationModal />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              
              <span className="font-bold text-2xl
              text-white
              flex items-center
              hover:cursor-pointer
              "
              onClick={()=>navigate("/")}
              >
                <FaChessKnight className="mx-2" />
                Dojo Chess
                </span>
            </div>
          </div>

          <div className="flex items-center">
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
                      {/* <AvatarImage src={profilePic} alt={username} />
                      <AvatarFallback>{username[0]}</AvatarFallback> */}
                    </Avatar>
                  </Button>

              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="hover:cursor-pointer"
                  onClick={() => setOpen(true)}>
                  Edit Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        
        </div>
      </div>
    </nav>
  )
}