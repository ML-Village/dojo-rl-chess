import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";
//import * as torii from "@dojoengine/torii-client";
import { LobbyPage, GameRoom } from "./pages";
import { BaseNavbar } from "@/components";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAccount } from '@starknet-react/core';

function App() {
  const {
    setup: {
      // systemCalls: { register_player },
      // clientComponents: { Game, GameState, GameFormat, Player },
      toriiClient,
      contractComponents,
    },
    //account
  } = useDojo();

  //const { address } = useAccount();
  useQuerySync(toriiClient, contractComponents as any, []);

  // entity id we are syncing
  // const entityId = getEntityIdFromKeys([BigInt(account?.account.address)]) as Entity;
  //const entityId = getEntityIdFromKeys([BigInt(address??"")]) as Entity;
  // const player = useComponentValue(Player, entityId);

  return (
    <div className="flex flex-col
        bg-blue-800/20 h-screen
        ">
            <Router>
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
