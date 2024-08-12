import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { RegistrationCarousel } from "@/components/Carousels";
import { usePfpStore } from "@/store/index";

import { useDojo } from "@/dojo/useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";

import { useComponentValue } from "@dojoengine/react";
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
  },
    account,
  } = useDojo();

  // modal
  const [open, setOpen] = useState(true);
  const { pfpCarouselApi } = usePfpStore();

  // entity id we are syncing
  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;

  console.log("entityId loaded: ", entityId);
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
    // if there is no player or account is not yet loaded
    if (!player || account?.count<0) {
      pfpCarouselApi?.scrollTo(0);
      setNameValue("");
      setPlayerRegistered(false);
      return;
    }

    // else player is registered
    setPlayerRegistered(true);
    console.log("player: ", player);

    // do nothing if there is no name and set the name input to empty
    if (player?.name === undefined) {
      setNameValue("");
      return
    }

    if (!player?.name) {
      setNameValue("");
      return
    }

    // if there is a name, set the name input to the name
    console.log("Player Name: ", feltToString(String(player?.name)))
    setNameValue(feltToString(String(player?.name)))

    if (player?.profile_pic_uri === undefined) return;
    console.log("player pfp num: ", player?.profile_pic_uri)
    console.log("player pfp type: ", typeof (player?.profile_pic_uri))

    if(!pfpCarouselApi) return;
    console.log("scrolling to: ", parseInt(player?.profile_pic_uri));
    if(!player?.profile_pic_uri) return;
    pfpCarouselApi?.scrollTo(parseInt(player?.profile_pic_uri))

  }, [player, pfpCarouselApi, account]);

  const registerName = () => {
    
    if (!nameValue || nameValue.trim() === '') return;
    const pfpNum = pfpCarouselApi?.selectedScrollSnap()
    console.log("pfpNum: ", pfpNum);
    if (pfpNum=== undefined) return;

    console.log("registering: ", nameValue);
    register_player(account.account as AccountInterface, 
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
                  className="bg-yellow-200
                  border border-gray-700
                  mx-1 ml-auto 
                  p-1 px-2 rounded-md
                  text-gray-800 hover:text-white
                  "
                    onClick={() => account.clear()}>
                        clear burners
                    </Button>
                  <Button 
                  className="bg-emerald-700
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
          <div className="flex justify-end">
            <Button 
            className="bg-emerald-700"
            onClick={registerName}
            >Confirm Player Details</Button>
          </div>
      </DialogContent>
    </Dialog>
  );
};