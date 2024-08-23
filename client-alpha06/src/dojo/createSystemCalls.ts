import { AccountInterface, Account } from "starknet";
import {
    Entity,
    Has,
    HasValue,
    World,
    defineSystem,
    getComponentValue,
} from "@dojoengine/recs";
//import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { getEntityIdFromKeys,
    getEvents,
    setComponentsFromEvents } from "@dojoengine/utils";
import type { IWorld } from "./typescript/contracts.gen";
import { ProfilePicType } from "../utils";
import * as models from "./typescript/models.gen";

export type SystemCalls = ReturnType<typeof createSystemCalls>;


export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ClientComponents,
    world: World
) {
  //======= Lobby System Calls =======//

    const register_player = async (account: Account, 
        name: string, profile_pic_type: number, profile_pic_uri: string,) => {

        try {
            const { transaction_hash } = await client.lobby.register_player({
                account,
                name: name, 
                profile_pic_type:  {type: ProfilePicType[profile_pic_type]} as models.ProfilePicType,
                profile_pic_uri: profile_pic_uri
            });
            console.log(
                await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );
            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                    })
                )
            );
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Player registered");
        }
    };

    const update_player = async (account: Account, 
        name: string, profile_pic_type: number, profile_pic_uri: string,) => {

        try {
            const { transaction_hash } =  await client.lobby.update_player({
                account,
                name: name, 
                profile_pic_type:  {type: ProfilePicType[profile_pic_type]} as models.ProfilePicType,
                profile_pic_uri: profile_pic_uri
            });

            console.log(
                await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );
            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                    })
                )
            );
            
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Player updated");
        }
    };

    const invite = async (account: Account, 
        game_format_id:number, invitee_address: bigint, invite_expiry: number) => {

        try {
            const { transaction_hash } = await client.lobby.invite({
                account,
                game_format_id, 
                invitee_address, 
                invite_expiry
            });

            console.log(
                await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );
            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                    })
                )
            );
            
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Game invite created");
        }
    };

    const reply_invite = async (account: Account, 
        game_id:number, accepted:boolean) => {
        
        try {
            const { transaction_hash } = await client.lobby.reply_invite({
                account,
                game_id: BigInt(game_id),
                accepted
            });

            console.log(
                await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );
            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                    })
                )
            );

        } catch (e) {
            console.log(e);
        } finally {
            console.log("Game Invite Replied");
        }
    };

    const create_game = async (account: Account, 
        game_format_id:number) => {

        try {
            const { transaction_hash } =  await client.lobby.create_game({
                account,
                game_format_id
            });

            console.log(
                await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                })
            );
            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                    retryInterval: 100,
                    })
                )
            );

        } catch (e) {
            console.log(e);
        } finally {
            console.log("Game Room Created");
        }
    };

    const join_game  = async (account: Account,
        game_id:number) => {

            try {
                const { transaction_hash } = await client.lobby.join_game({
                    account,
                    game_id: BigInt(game_id)
                });

                console.log(
                    await account.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                );
                setComponentsFromEvents(
                    contractComponents,
                    getEvents(
                        await account.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                        })
                    )
                );

            } catch (e) {
                console.log(e);
            } finally {
                console.log("Game Room Joined");
            }
    };

    return {
        register_player,
        update_player,
        invite,
        reply_invite,
        create_game,
        join_game,
    };
}
