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

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "@/dojo/useDojo";
import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { feltToString, stringToFelt } from "@/utils/starknet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pfpCardImageUrl } from '@/constants/assetspath';

const invoices = [
{
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
},
{
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
},
{
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
},
{
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
},
{
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
},
{
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
},
{
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
},
]

export const LobbyTable = () => {
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
    console.log("tables:")
    console.log(hasPlayers);
    const playerData = hasPlayers.map((entity) => {
        return getComponentValueStrict(Player, entity)
    })
    console.log(playerData);

    return (
    <Tabs defaultValue="accounts" 
        className="w-full
        border-2 border-green-500
        rounded-2xl overflow-hidden
        ">
        
        
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="globalgames">Global Rooms</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="livegames">Live Games</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>
        
        
        
        
        <TabsContent value="accounts"
            className="border-2 border-red-600"
            >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px] text-center">Profile</TableHead>
                        <TableHead className="w-[200px]">UserName</TableHead>
                        <TableHead className="w-[90px] text-center">ELO</TableHead>
                        <TableHead className="w-[90px] text-center">Wins</TableHead>
                        <TableHead className="w-[90px] text-center">Draws</TableHead>
                        <TableHead className="w-[90px] text-center">Losses</TableHead>
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
        </TabsContent>
    </Tabs>
    )
}
