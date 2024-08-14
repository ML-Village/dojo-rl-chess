import React, {useState} from 'react';
import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "@/dojo/useDojo";
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';


export const GameRoom = () => {
    const {
        setup: {
            systemCalls: { register_player, update_player, invite, reply_invite },
            clientComponents: { Game, GameState, Player },
            toriiClient,
            contractComponents,
        },
        account,
    } = useDojo();

    const [game, setGame] = useState(new Chess());
    const onDrop = (sourceSquare: string, targetSquare: string) => {

        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });

        if (move === null) return false;
        setGame(new Chess(game.fen()));
        return true
    }

    return (
        <div className="flex justify-center items-start flex-1
        ">
            <div className="grid-cols-2 grid gap-2
            w-4/5 h-[80vh]
            p-2
            border border-red-500
            ">

                {/* Chessboard column */}
                <div className="flex flex-col
                justify-between items-center h-full w-full
                border border-green-500">

                    <div className="w-full p-3
                    border border-blue-600
                    ">Opponent Title Bar</div>

                    <div className="w-4/5">
                        <Chessboard 
                            position={game.fen()} 
                            onPieceDrop={onDrop}
                            boardOrientation={'white'}
                            customDarkSquareStyle={{
                                backgroundColor: "#779952"
                            }} customLightSquareStyle={{
                                backgroundColor: "#edeed1"
                            }} 
                        />
                    </div>
                    

                    <div className="w-full p-3
                    border border-blue-600
                    ">Owner Title Bar</div>

                </div>

                {/* Chat column */}
                <div className="flex flex-col
                justify-start items-center h-full w-full
                rounded-2xl overflow-hidden
                text-white bg-slate-900/70
                border-4 border-gray-700">
                    <div className="w-full p-3
                    ">Chat Title Bar</div>

                    <div className="w-full h-[80%]
                    ">Chat Box</div>

                    <div className="w-full h-[20%]
                    ">Chat Input</div>
                </div>

            </div>
        </div>
    )
}
