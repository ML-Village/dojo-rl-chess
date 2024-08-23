import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "@/dojo/useDojo";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pfpCardImageUrl } from '@/constants/assetspath';
import { bigintToHex, formatTimestamp, formatAddress} from "@/utils";
import { feltToString, stringToFelt } from "@/utils/starknet";
import { gameFormatconfig } from "@/constants/gameformat";
import { FaChessBoard, FaRegChessKnight } from "react-icons/fa6";
import { FaChessKnight } from "react-icons/fa";
import { IoMdInfinite } from "react-icons/io";

export const OpenRooms = () => {

    const {
        setup: {
            systemCalls: { register_player, update_player, invite, reply_invite },
            clientComponents: { Game, GameState, Player },
            toriiClient,
            contractComponents,
        },
        account,
    } = useDojo();
    const navigate = useNavigate();

    const hasPlayers = useEntityQuery([Has(Player)]);
    const hasGames = useEntityQuery([Has(Game)]);

    const gamesData = hasGames.map((entity) => {
        //console.log("games data entity:", entity)
        const g = getComponentValueStrict(Game, entity)
        const generatedEntity = getEntityIdFromKeys([
            BigInt(g?.game_id)?? BigInt("0x0"),
        ]) as Entity;
        return {
            generated_game_entity: generatedEntity,
            game_entity: entity,
            ...g
        }
    })
    console.log("OpenRoom: gamesData: ", gamesData)

    const newGamesData = gamesData?.filter((game) => {
        return game?.invite_state == "Awaiting"
    }).map((game) => {

        const ownerAddress = bigintToHex(game?.room_owner_address)
        const ownerEntity = getEntityIdFromKeys([
                                game?.room_owner_address,
                            ]) as Entity;
        const player = getComponentValueStrict(Player, ownerEntity)??{}
        const playerName = feltToString(String(player?.name ?? ""));
        //const playerPfPnum = 
        return {
            ...game,
            game_format_id: game?.game_format_id,
            game_id: BigInt(game?.game_id).toString(),
            owner_name: playerName,
            room_owner_address: ownerAddress,
            owner_entity: ownerEntity,
            profile_pic_type: player?.profile_pic_type ?? "",
            profile_pic_uri: player?.profile_pic_uri ?? "0",
            room_start: formatTimestamp(game?.room_start),
        }
    })
    console.log("openrooms.tsx: newGamesData: ", newGamesData)
    return (
        <Table>
            <TableHeader >
                <TableRow className="bg-blue-950
                hover:bg-blue-950
                ">
                    
                    <TableHead className="text-white px-8">Creator</TableHead>
                    <TableHead className="text-center text-white">Owner Color</TableHead>
                    <TableHead className="text-center text-white">Game Type</TableHead>
                    <TableHead className="text-center text-white">Total Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {newGamesData.map((g, i) => {

                    let profilePicNum = g?.profile_pic_type == "Native" ? 
                        g?.profile_pic_uri.charCodeAt(0) :
                        JSON.stringify(g?.profile_pic_uri);
                        profilePicNum = (typeof(profilePicNum) === "number") ? profilePicNum : 0;
                        console.log("openroom.tsx: profilePicNum: ", profilePicNum);

                    
                    const GameFormatIcon = gameFormatconfig[g?.game_format_id??1]?.icon ?? FaChessBoard;

                    const gameState = g?.game_entity? getComponentValueStrict(GameState, g?.game_entity)??{}: {};
                    console.log("gameState: ", gameState)
                    console.log("got entity?", g?.game_entity)

                    return (
                    <TableRow key={"accounts_"+i}
                        className={`hover:cursor-pointer
                        ${i % 2 === 0 ? 
                            'bg-white/20 text-black hover:bg-white' 
                            : 
                            'bg-blue-900/80 text-white hover:text-black'}
                        `}
                        onClick={()=>navigate(`/room/${g?.game_id}`)}
                    >
                        

                        <TableCell className="">
                            <div className="flex flex-nowrap 
                            justify-start items-center
                            ">
                                <Avatar className="mx-2">
                                    <AvatarImage src={pfpCardImageUrl[profilePicNum]} alt={g?.owner_name ?? ""} />
                                    <AvatarFallback>P</AvatarFallback>
                                </Avatar>
                                <span className="mx-2">{g?.owner_name ?? ""}</span>
                            </div>
                        </TableCell>

                        <TableCell className="text-center">
                            <div className="flex justify-center items-center text-xl
                            py-1
                            ">
                                <div className={`border border-black rounded-full
                                p-2.5 flex justify-center items-center
                                ${(gameState?.white ?? 0) == 0 ? "bg-lime-600":"bg-orange-100"}
                                `}>
                            {
                                (gameState?.white ?? 0) == 0 ? 
                                <FaChessKnight className="text-white drop-shadow-lg
                                
                                "/> 
                                : <FaChessKnight className="text-black drop-shadow-lg"/>
                            }
                                </div>
                            </div>
                        </TableCell>
                        
                        <TableCell className="">
                            <div className="flex flex-nowrap 
                            justify-center space-x-1
                            items-center
                            ">
                                <GameFormatIcon className="font-bold text-lg
                                
                                "/>
                                <span>
                                    {gameFormatconfig[g?.game_format_id]?.name ?? "na"}
                                </span>
                            </div>
                        </TableCell>

                        <TableCell className="text-center">{gameFormatconfig[g?.game_format_id]?.total_time_string??<IoMdInfinite/>}</TableCell>
                        
                    </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    )
}
