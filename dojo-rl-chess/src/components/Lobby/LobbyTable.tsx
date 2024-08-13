import React from 'react';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { AccountsTable } from "@/components/Lobby/AccountsTable";

export const LobbyTable = () => {
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
                <AccountsTable />
            </TabsContent>
        </Tabs>
    )
}
