import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { RegistrationCarousel } from "@/components/Carousels";
import { usePfpStore, useRegModalStore } from "@/store/index";

import { useDojo } from "@/dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";

import { useComponentValue } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";

import { formatAddress } from '@/utils';
import { feltToString } from "@/utils/starknet";
//import { Account, AccountInterface } from "starknet";
import { useAccount } from '@starknet-react/core';


export const ControllerRegistrationModal: React.FC = () => {

  const {
    setup: {
      systemCalls: { register_player, update_player },
      clientComponents: { Player },
  },
    //account,
  } = useDojo();
  const { account, address, isConnected } = useAccount()
  // modal
  const {open, setOpen, regCount, incrementRegCount} = useRegModalStore();
  const { pfpCarouselApi } = usePfpStore();

  // entity id we are syncing
  const entityId = getEntityIdFromKeys([
    BigInt(address??""),
  ]) as Entity;

  // get current component values
  const player = useComponentValue(Player, entityId);

  // Player Name States
  const [nameValue, setNameValue] = useState('');
  const handleNameTypingInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(String(event.target.value));
  };
  const [ playerRegistered, setPlayerRegistered ] = useState(false);

  // use to check if there is existing registered player
  useEffect(() => {
    // if there is no player
    if (!player) {
      console.log("player not registered.")
      pfpCarouselApi?.scrollTo(0);
      setNameValue("");
      setPlayerRegistered(false);
      return;
    }

    // else player is registered
    setPlayerRegistered(true);
    console.log("player registered.")

    // do nothing if there is no name and set the name input to empty
    if (player?.name === undefined) {
      setNameValue("");
      console.log("player name undefined")
      return
    }

    if (!player?.name) {
      setNameValue("");
      console.log("no player name")
      return
    }

    // if there is a name, set the name input to the name
    console.log("Player Name: ", feltToString(String(player?.name)))
    setNameValue(feltToString(String(player?.name)))

    if (player?.profile_pic_uri === undefined) return;
    
    // parse the profile pic uri to int
    console.log("Native Profile Pic Type?", player?.profile_pic_type == "Native")
    console.log(player?.profile_pic_uri)
    const player_profile_pic_uri = player?.profile_pic_type == "Native" ? 
      player?.profile_pic_uri.charCodeAt(0) :
      JSON.stringify(player?.profile_pic_uri)

    if(!pfpCarouselApi) return;
    if(!player_profile_pic_uri) {
      console.log("no profile pic uri")
      return;
    }

    if (typeof(player_profile_pic_uri) === "number") {
      console.log("already registered profile pic num, scrolling to: ", player_profile_pic_uri)
      pfpCarouselApi?.scrollTo(player_profile_pic_uri)
    }

  }, [player, pfpCarouselApi, address, isConnected]);

  const registerPlayer = async () => {
    if (!nameValue || nameValue.trim() === '') return;
    const pfpNum = pfpCarouselApi?.selectedScrollSnap()

    if (pfpNum=== undefined) return;

    console.log("registering: ", nameValue);
    console.log("registering pfp: ", pfpNum.toString());
    await register_player(account, 
      nameValue, 1, pfpNum.toString());
    }  

  const updatePlayer = async () => {
    if (!nameValue || nameValue.trim() === '') return;
    const pfpNum = pfpCarouselApi?.selectedScrollSnap()
    if (pfpNum=== undefined) return;

    console.log("updating name, address: ", nameValue, address??"");
    console.log("updating pfp: ", pfpNum.toString());

    await update_player(account, 
      nameValue, 1, pfpNum.toString());
    }  
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]
      flex flex-col justify-center space-y-0
      ">
        
        <DialogHeader>
          <DialogTitle>Confirm Your Identity</DialogTitle>
          <DialogDescription>
            Register a player name and picture for your account.
          </DialogDescription>
        </DialogHeader>

          <div className="rounded-md">
            
            <div>
                

                {/* select burners */}
                <div className="flex">
                  <div className="w-full 
                  p-2
                  border rounded-lg
                  bg-gray-600/70 text-gray-800/70
                  truncate
                  "
                  >
                    {address??""}
                  </div>
                </div>
                
                <div className="flex my-1">
                  <input
                          type="text"
                          className="w-full
                          py-2 px-2
                          flex items-center rounded-lg 
                          border-2 border-dark-gray-200 text-xl
                          disabled:text-gray-700/50
                          "

                          placeholder="Register Name"
                          maxLength={31}
                          value={nameValue}
                          onChange={handleNameTypingInput}
                          disabled={playerRegistered}
                        />
                </div>
              </div>
          </div>

          {/* Carousel Div Row */}
          <div className="h-[8.5em]
          flex justify-center
          ">

                <RegistrationCarousel />
          </div>
          <div className="flex justify-end
          space-x-2
          ">
            
            {
                playerRegistered ?
                <Button 
                className="bg-blue-900/80
                hover:cursor-pointer
                "
                onClick={updatePlayer}
                >Update PFP</Button>
                :
                <Button 
                className="bg-blue-700
                hover:cursor-pointer
                "
                onClick={registerPlayer}
                >Register Profile</Button>
            }
            <Button 
                className="bg-green-800
                hover:cursor-pointer
                "
                disabled={!player}
                onClick={() => {
                    regCount == 0 ? incrementRegCount(): null;
                    setOpen(false)
                  }
                }
                >Confirm Config</Button>
          </div>
      </DialogContent>
    </Dialog>
  );
};