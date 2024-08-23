import React from 'react';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { AccountsTable } from "@/components/Lobby/AccountsTable";
import { OpenRooms } from "@/components/Lobby/OpenRooms";

export const LobbyTable = () => {
    return (
        <Tabs defaultValue="openrooms" 
            className="w-full
            
            rounded-2xl rounded-t-lg overflow-hidden
            flex flex-col
            ">
            
            
            <TabsList className="w-full flex flex-wrap
                rounded-lg flex-1 mb-2 border-2 border-blue-800
            ">
                <TabsTrigger className="basis-1/4" value="openrooms">Open Rooms</TabsTrigger>
                <TabsTrigger className="basis-1/4" value="invites">Invites</TabsTrigger>
                <TabsTrigger className="basis-1/4" value="livegames">Live Games</TabsTrigger>
                <TabsTrigger className="basis-1/4" value="accounts">Accounts</TabsTrigger>
            </TabsList>
            
            <div className="h-[70vh] overflow-y-scroll
            rounded-2xl
            border-2 border-blue-950/80
            bg-blue-950
            ">
                <TabsContent value="openrooms"
                    className="h-full bg-blue-100/80"
                    >
                    <OpenRooms />
                </TabsContent>

                <TabsContent value="invites"
                    className="h-full bg-blue-100/80"
                    >
                    <AccountsTable />
                </TabsContent>

                <TabsContent value="livegames"
                    className="h-full bg-blue-100/80"
                    >
                    <AccountsTable />
                </TabsContent>

                <TabsContent value="accounts"
                    className="h-full bg-blue-100/80"
                    >
                    <AccountsTable />
                </TabsContent>
            </div>
        </Tabs>
    )
}
