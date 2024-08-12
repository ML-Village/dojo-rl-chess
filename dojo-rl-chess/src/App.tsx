import { useComponentValue, useQuerySync, useEntityQuery } from "@dojoengine/react";
import { Entity, Has, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import { useEffect, useState } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";
import { AccountInterface } from "starknet";
import { RegistrationModal } from "@/components/RegistrationModal";

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

    // useQuerySync(toriiClient, contractComponents as any, [
    //     {
    //         Keys: {
    //             keys: [BigInt(account?.account.address).toString()],
    //             models: [
    //                 //"rl_chess_contracts-Game",
    //                 "rl_chess_contracts-Player",
    //                 //"rl_chess_contracts-GameState",
    //             ],
    //             pattern_matching: "FixedLen",
    //         },
    //     },
    // ]);


    //const hasGame = useEntityQuery([Has(Game)]);
    // console.log("game")
    // console.log(hasGame)

    //const hasPlayers = useEntityQuery([Has(Player)]);
    // console.log("players")
    // console.log(hasPlayers)

    //hasPlayers.map((entity) => {
        // console.log(entity)
        // console.log(getComponentValueStrict(Player, entity))
    //})

    // const [clipboardStatus, setClipboardStatus] = useState({
    //     message: "",
    //     isError: false,
    // });

    // const handleRestoreBurners = async () => {
    //     try {
    //         await account?.applyFromClipboard();
    //         setClipboardStatus({
    //             message: "Burners restored successfully!",
    //             isError: false,
    //         });
    //     } catch (error) {
    //         setClipboardStatus({
    //             message: `Failed to restore burners from clipboard`,
    //             isError: true,
    //         });
    //     }
    // };

    // useEffect(() => {
    //     if (clipboardStatus.message) {
    //         const timer = setTimeout(() => {
    //             setClipboardStatus({ message: "", isError: false });
    //         }, 3000);

    //         return () => clearTimeout(timer);
    //     }
    // }, [clipboardStatus.message]);

    return (
        <>
        <RegistrationModal />
            {/* 
            {account && account?.list().length > 0 && (
                <button onClick={async () => await account?.copyToClipboard()}>
                    Save Burners to Clipboard
                </button>
            )}
            <button onClick={handleRestoreBurners}>
                Restore Burners from Clipboard
            </button>
            {clipboardStatus.message && (
                <div className={clipboardStatus.isError ? "error" : "success"}>
                    {clipboardStatus.message}
                </div>
            )} */}
        </>
    );
}

export default App;
