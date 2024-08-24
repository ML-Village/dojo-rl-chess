import React, {useEffect, useState} from 'react';
import { FaChessKnight } from "react-icons/fa";

import { useDojo } from "@/dojo/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { Entity} from "@dojoengine/recs";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useRegModalStore } from "@/store/index";

import { getPlayerName } from '@/utils';
import { RegistrationModal } from '../Modals';
import { useNavigate } from 'react-router-dom';

import { ConnectControllerButton, BurnerButtons } from "@/components";


export const BaseNavbar = () => {
  const {
    setup: {
        clientComponents: { Player },
    },
    account,
} = useDojo();

  const { setOpen, regCount } = useRegModalStore();
  const navigate = useNavigate();

  //const { address, account } = useAccount();

  const entityId = getEntityIdFromKeys([
    BigInt(account?.account.address),
  ]) as Entity;
  // get current component values
  const player = useComponentValue(Player, entityId);

  useEffect(() => {
    // if there is no player or account is not yet loaded
    if (!player || account?.count<0) {
      console.log("player not registered.")
      setOpen(true) // set Modal open if player not registered
      return;
    }
    //regCount == 0 ? setOpen(false) : null;

  },[player, account, regCount])

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



          {/* Profile Dropdown */}
          <div className="flex items-center">
            {
              import.meta.env.VITE_USECONTROLLER == "true" ?
            <ConnectControllerButton />
            :
            <BurnerButtons/>
            }
          </div>
        
        </div>
      </div>
    </nav>
  )
}
