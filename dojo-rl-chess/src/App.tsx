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
            clientComponents: { Game, GameState, GameFormat, Player },
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
                    "rl_chess_contracts-Game",
                    "rl_chess_contracts-Player",
                    "rl_chess_contracts-GameState",
                    "rl_chess_contracts-GameFormat",
                    "rl_chess_contracts-GameSquares",
                ],
                pattern_matching: "FixedLen",
            },
        },
    ]);

    // const hasPlayers = useEntityQuery([Has(Player)]);
    // console.log("App.tsx:hasPlayers: ", hasPlayers)
    // const hasGames = useEntityQuery([Has(Game)]);
    // console.log("App.tsx: hasGames: ", hasGames)
    // const hasGameFormats = useEntityQuery([Has(GameFormat)]);
    // console.log("App.tsx: hasGameFormats: ", hasGameFormats)



    return (
        <div className="flex flex-col
        bg-blue-800/20 h-screen
        ">
            <Router>
                {/* <RegistrationModal /> */}
                <BaseNavbar />

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

