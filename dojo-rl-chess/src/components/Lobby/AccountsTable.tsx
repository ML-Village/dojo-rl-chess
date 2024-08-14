import React from 'react';
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
import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pfpCardImageUrl } from '@/constants/assetspath';
import { feltToString, stringToFelt } from "@/utils/starknet";

export const AccountsTable = () => {
    const {
        setup: {
            systemCalls: { register_player, update_player, invite, reply_invite },
            clientComponents: { Game, GameState, Player },
            toriiClient,
            contractComponents,
        },
        account,
    } = useDojo();

    const hasPlayers = useEntityQuery([Has(Player)]);
    // console.log("tables:")
    // console.log(hasPlayers);
    const playerData = hasPlayers.map((entity) => {
        return getComponentValueStrict(Player, entity)
    })
    //console.log(playerData);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px] text-center">Profile</TableHead>
                    <TableHead className="w-[200px]">UserName</TableHead>
                    <TableHead className="text-center">ELO</TableHead>
                    <TableHead className="text-center">Wins</TableHead>
                    <TableHead className="text-center">Draws</TableHead>
                    <TableHead className="text-center">Losses</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {playerData.map((p, i) => {
                    let profilePicNum = p?.profile_pic_type == "Native" ? 
                        p?.profile_pic_uri.charCodeAt(0) :
                        JSON.stringify(p?.profile_pic_uri);
                        profilePicNum = (typeof(profilePicNum) === "number") ? profilePicNum : 0;
                    return (
                    <TableRow key={"accounts_"+i}>
                        <TableCell className="text-center">
                            <Avatar>
                                <AvatarImage src={pfpCardImageUrl[profilePicNum]} alt={p?.name ? feltToString(String(p?.name)) :""} />
                                <AvatarFallback>P</AvatarFallback>
                            </Avatar>

                        </TableCell>
                        <TableCell className="">{p?.name ? feltToString(String(p?.name)) :""}</TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">0</TableCell>
                    </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    )
}
