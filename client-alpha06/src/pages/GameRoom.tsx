import React, {useState, useMemo} from 'react';
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "@/dojo/useDojo";
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { entityIdToKey, bigintToEntity, keysToEntity, bigintToHex,

    getPlayerName, getPlayerPfPurl,
} from '@/utils';

import { useParams } from 'react-router-dom';
import { feltToString, stringToFelt } from "@/utils/starknet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { PlayerPanel } from '@/components/';


export const GameRoom = () => {
    const { roomId } = useParams();
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

    console.log("room Id: ", roomId)
    const entityId = getEntityIdFromKeys([
        BigInt(roomId??""),
    ]) as Entity;

    const gameObject = getComponentValueStrict(Game, entityId);
    const gameState = getComponentValueStrict(GameState, entityId);

    const ownerIsWhite = gameState?.white == 0;
    
    // Owner Stuff
    const ownerEntity = bigintToEntity(
        gameObject?.room_owner_address,
    ) as Entity;
    const ownerPlayerObject = getComponentValueStrict(Player, ownerEntity);
    const ownerName = getPlayerName(ownerPlayerObject);
    const ownerPfPurl = getPlayerPfPurl(ownerPlayerObject);
    const ownerTimeRemaining = ownerIsWhite ? gameState?.w_total_time_left 
    : gameState?.b_total_time_left;

    // Opponent Stuff
    const opponentAddressBigInt = gameObject?.invitee_address;
    const opponentHere = Number(opponentAddressBigInt) == 0 ? false : true;
    const opponentEntity: Entity = opponentHere ? bigintToEntity(
        gameObject?.invitee_address,
    ) : "";

    const opponentPlayerObject = opponentHere ? getComponentValueStrict(Player, opponentEntity) : {};
    const opponentName = opponentHere ? getPlayerName(opponentPlayerObject): "";
    const opponentPfPurl = opponentHere ? getPlayerPfPurl(opponentPlayerObject) : "";
    const opponentTimeRemaining = ownerIsWhite ? gameState?.b_total_time_left
    : gameState?.w_total_time_left;

    console.log("opponent address: ", gameObject?.invitee_address)
    console.log("opponent entity: ", opponentEntity)

    const ownerNamePanel = useMemo(()=>{
        return (
            <div className="flex">
                        <span className="mx-4 text-xl">
                        {ownerName}
                        </span>

                        <Avatar className="h-8 w-8">
                            <AvatarImage src={ownerPfPurl} alt={"username"} />
                            <AvatarFallback>{ownerName}</AvatarFallback>
                        </Avatar>
            </div>
        )
    },[ownerName, ownerPfPurl])

    const opponentNamePanel = useMemo(()=>{
        return (
            <div className="flex">
                        <span className="mx-4 text-xl">
                        {opponentName}
                        </span>

                        <Avatar className="h-8 w-8">
                            <AvatarImage src={opponentPfPurl} alt={"username"} />
                            <AvatarFallback>{opponentName}</AvatarFallback>
                        </Avatar>
            </div>
        )
    },[opponentName, opponentPfPurl])

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

                    {opponentHere ? 
                        <PlayerPanel ownerNamePanel={opponentNamePanel} 
                        ownerTimeRemaining={String(opponentTimeRemaining)} /> :
                        
                    <div className="w-full p-3 flex items-center
                        ">
                        <Button className="bg-orange-600">
                            Join Game
                        </Button>
                        <div className="ml-auto mr-8">{String(opponentTimeRemaining)}</div>
                    </div>
                    }
                    

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
                    

                    <PlayerPanel ownerNamePanel={ownerNamePanel} 
                        ownerTimeRemaining={String(ownerTimeRemaining)} />

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
