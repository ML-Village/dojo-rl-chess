import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "@/dojo/useDojo";
import { AccountInterface } from "starknet";
import { BaseNavbar, RegistrationModal, 
    LobbyControls, LobbyTable } from "@/components";

import { useRegModalStore } from "@/store/index";

function App() {
    const {
        setup: {
            systemCalls: { register_player, update_player, invite, reply_invite },
            clientComponents: { Game, GameState, Player },
            toriiClient,
            contractComponents,
        },
        account,
    } = useDojo();

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


    //const {open, setOpen} = useRegModalStore();
    const entityId = getEntityIdFromKeys([
        BigInt(account?.account.address),
    ]) as Entity;
    // get current component values
    const player = useComponentValue(Player, entityId);

    // useEffect for invoking modal set in navbar
    // useEffect(() => {
    //     // if there is no player or account is not yet loaded
    //     if (!player || account?.count<0) {
    //         console.log("player not registered.")
    //         setOpen(true); // set Modal open if player not registered
    //         return;
    //     }
    //     setOpen(false)
    // },[player, account])


    return (
        <div className="flex flex-col
        bg-blue-800/20 h-screen
        ">
            <RegistrationModal />
            <BaseNavbar />

            <LobbyControls/>

            <div className="border border-orange-600
            w-full flex justify-center
            
            ">
                <div className="w-2/3
                flex justify-center space-x-4
                border border-blue-500">
                    <LobbyTable />
                    <div className="border-2 border-purple-700
                    w-[600px] h-full
                    ">
                        Events Screen
                    </div>
                </div>
            </div>
        
            
        </div>
    );
}

export default App;
