import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { RegistrationCarousel } from "@/components/Carousels";
import { usePfpStore, useRegModalStore } from "@/store/index";

import { useDojo } from "@/dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";

import { useComponentValue, useQuerySync } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";

import { formatAddress } from '@/utils';
import { feltToString, stringToFelt } from "@/utils/starknet";
import { AccountInterface } from "starknet";


export const RegistrationModal: React.FC = () => {
  const [username, setUsername] = useState('');

  const {
    setup: {
      systemCalls: { register_player, update_player },
      clientComponents: { Player, Game },
      toriiClient,
      contractComponents,
  },
    account,
  } = useDojo();

  // modal
  const {open, setOpen} = useRegModalStore();
  const { pfpCarouselApi } = usePfpStore();

  // entity id we are syncing
  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;

  //console.log("entityId loaded: ", entityId);
  // get current component values
  const player = useComponentValue(Player, entityId);
  //console.log(player);

  // Player Name States
  const [nameValue, setNameValue] = useState('');
  const handleNameTypingInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(String(event.target.value));
  };
  const [ playerRegistered, setPlayerRegistered ] = useState(false);

  useQuerySync(toriiClient, contractComponents as any, [
    {
        Keys: {
            keys: [BigInt(account?.account.address).toString()],
            models: [
                //"rl_chess_contracts-Game",
                "rl_chess_contracts-Player",
                //"rl_chess_contracts-GameState",
            ],
            pattern_matching: "FixedLen",
        },
    },
  ]);

  // use to check if there is existing registered player
  useEffect(() => {
    // if there is no player or account is not yet loaded
    if (!player || account?.count<0) {
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

  }, [player, pfpCarouselApi, account]);

  const registerPlayer = async () => {
    if (!nameValue || nameValue.trim() === '') return;
    const pfpNum = pfpCarouselApi?.selectedScrollSnap()

    if (pfpNum=== undefined) return;

    console.log("registering: ", nameValue);
    console.log("registering pfp: ", pfpNum.toString());
    await register_player(account.account as AccountInterface, 
      nameValue, 1, pfpNum.toString());
    }  

  const updatePlayer = async () => {
    if (!nameValue || nameValue.trim() === '') return;
    const pfpNum = pfpCarouselApi?.selectedScrollSnap()
    if (pfpNum=== undefined) return;

    console.log("updating name, address: ", nameValue, account.account.address);
    console.log("updating pfp: ", pfpNum.toString());

    await update_player(account.account as AccountInterface, 
      nameValue, 1, pfpNum.toString());
    }  
  
  

  //console.log("current pfp num: ", pfpCarouselApi?.selectedScrollSnap())
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
                {/* create burners */}
                <div className="w-full flex py-1">
                  <Button 
                  className="bg-orange-300
                  border border-gray-700
                  mx-1 ml-auto 
                  p-1 px-2 rounded-md
                  text-gray-800 hover:text-white
                  "
                    onClick={() => account.clear()}>
                        clear burners
                    </Button>
                  <Button 
                  className="bg-blue-900/80
                  border border-gray-700
                  p-1 px-2 rounded-md
                  "
                  onClick={() => account?.create()}>
                  {account?.isDeploying ? "deploying burner" : "create burner"}
                  </Button>
                  
                </div>

                {/* select burners */}
                <div className="flex">
                  <span className="text-nowrap
                  p-1 px-2 rounded-md">
                    select signer:{" "}
                    </span>
                  <select className="w-full border border-gray-500/50 rounded-md my-1
                  py-1 focus:outline-none focus:ring-1 focus:ring-blue-500
                  "
                      value={account ? account.account.address : ""}
                      onChange={(e) => account.select(e.target.value)}
                  >
                      {account?.list().map((account, index) => {
                          return (
                              <option value={account.address} key={index}>
                                  {account.address}
                              </option>
                          );
                      })}
                  </select>
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
                disabled={(!player || account?.count<0)}
                onClick={() => setOpen(false)}
                >Confirm Config</Button>
          </div>
      </DialogContent>
    </Dialog>
  );
};