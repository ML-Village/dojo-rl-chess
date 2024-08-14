import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "@/dojo/useDojo";
import { BaseNavbar, RegistrationModal } from "@/components";
import { LobbyPage, GameRoom } from "./pages";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


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

            <Router>
                <Routes>
                    {/* Lobby Page */}
                    <Route path="/" element={<LobbyPage/>} />
                    <Route path="/room/:roomId" element={<GameRoom />} />
                </Routes>
            </Router>
        
            
        </div>
    );
}

export default App;
