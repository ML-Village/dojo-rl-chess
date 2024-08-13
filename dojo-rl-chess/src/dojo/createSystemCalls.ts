import { AccountInterface } from "starknet";
import {
    Entity,
    Has,
    HasValue,
    World,
    defineSystem,
    getComponentValue,
} from "@dojoengine/recs";
// import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
// import { Direction, updatePositionWithDirection } from "../utils";
import { getEntityIdFromKeys, 
    getEvents,
    setComponentsFromEvents, } from "@dojoengine/utils";
import type { IWorld } from "./generated/generated";
import { ContractComponents } from "./generated/contractComponents";
import { join } from "path";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    { Game, GameFormat, GameState, Player  }: ClientComponents,
    world: World
) {
    const register_player = async (account: AccountInterface, 
        name: string, profile_pic_type: number, profile_pic_uri: string,) => {

        try {
            const { transaction_hash } = await client.lobby.register_player({
                account,
                name, 
                profile_pic_type, 
                profile_pic_uri
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
            // Wait for the indexer to update the entity
            // By doing this we keep the optimistic UI in sync with the actual state
            // await new Promise<void>((resolve) => {
            //     defineSystem(
            //         world,
            //         [
            //             Has(Player),
            //             HasValue(Player, { address: BigInt(account.address) }),
            //         ],
            //         () => {
            //             resolve();
            //         }
            //     );
            // });
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Player registered");
        }
    };

    const update_player = async (account: AccountInterface, 
        name: string, profile_pic_type: number, profile_pic_uri: string,) => {

        try {
            const { transaction_hash } =  await client.lobby.update_player({
                account,
                name, 
                profile_pic_type, 
                profile_pic_uri
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
            // Wait for the indexer to update the entity
            // By doing this we keep the optimistic UI in sync with the actual state
            await new Promise<void>((resolve) => {
                defineSystem(
                    world,
                    [
                        Has(Player),
                        HasValue(Player, { 
                            address: BigInt(account.address),
                            name: BigInt(name),
                            profile_pic_type: profile_pic_type,
                            profile_pic_uri: profile_pic_uri,
                        }),
                    ],
                    () => {
                        resolve();
                    }
                );
            });
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Player updated");
        }
    };

    const invite = async (account: AccountInterface, 
        game_format_id:number, invitee_address: bigint, invite_expiry: number) => {

        try {
            await client.lobby.invite({
                account,
                game_format_id, 
                invitee_address, 
                invite_expiry
            });

            // Wait for the indexer to update the entity
            // By doing this we keep the optimistic UI in sync with the actual state
            await new Promise<void>((resolve) => {
                defineSystem(
                    world,
                    [
                        Has(Game),
                        HasValue(Game, { 
                            game_format_id: game_format_id,
                            invitee_address:BigInt(invitee_address), 
                            invite_expiry: invite_expiry
                        }),
                    ],
                    () => {
                        resolve();
                    }
                );
            });
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Game invite created");
        }
    };

    const reply_invite = async (account: AccountInterface, 
        game_id:number, accepted:boolean) => {

        try {
            await client.lobby.reply_invite({
                account,
                game_id,
                accepted
            });

            // Wait for the indexer to update the entity
            // By doing this we keep the optimistic UI in sync with the actual state
            await new Promise<void>((resolve) => {
                defineSystem(
                    world,
                    [
                        Has(Game),
                        HasValue(Game, { 
                            game_id: game_id,
                            invite_state: accepted ? 5 : 3
                        }),
                    ],
                    () => {
                        resolve();
                    }
                );
            });
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Game Invite Replied");
        }
    };

    const create_game = async (account: AccountInterface, 
        game_format_id:number) => {

        try {
            const game_id = await client.lobby.create_game({
                account,
                game_format_id
            });

            // Wait for the indexer to update the entity
            // By doing this we keep the optimistic UI in sync with the actual state
            await new Promise<void>((resolve) => {
                defineSystem(
                    world,
                    [
                        Has(Game),
                        HasValue(Game, { 
                            game_id: game_id
                        }),
                    ],
                    () => {
                        resolve();
                    }
                );
            });
        } catch (e) {
            console.log(e);
        } finally {
            console.log("Game Room Created");
        }
    };

    const join_game  = async (account: AccountInterface,
        game_id:number) => {

            try {
                await client.lobby.join_game({
                    account,
                    game_id
                });
    
                // Wait for the indexer to update the entity
                // By doing this we keep the optimistic UI in sync with the actual state
                await new Promise<void>((resolve) => {
                    defineSystem(
                        world,
                        [
                            Has(Game),
                            HasValue(Game, { 
                                game_id: game_id
                            }),
                        ],
                        () => {
                            resolve();
                        }
                    );
                });
            } catch (e) {
                console.log(e);
            } finally {
                console.log("Game Room Joined");
            }
        };


    // const move = async (account: AccountInterface, direction: Direction) => {
    //     const entityId = getEntityIdFromKeys([
    //         BigInt(account.address),
    //     ]) as Entity;

    //     // // Update the state before the transaction
    //     // const positionId = uuid();
    //     // Position.addOverride(positionId, {
    //     //     entity: entityId,
    //     //     value: {
    //     //         player: BigInt(entityId),
    //     //         vec: updatePositionWithDirection(
    //     //             direction,
    //     //             getComponentValue(Position, entityId) as any
    //     //         ).vec,
    //     //     },
    //     // });

    //     // // Update the state before the transaction
    //     // const movesId = uuid();
    //     // Moves.addOverride(movesId, {
    //     //     entity: entityId,
    //     //     value: {
    //     //         player: BigInt(entityId),
    //     //         remaining:
    //     //             (getComponentValue(Moves, entityId)?.remaining || 0) - 1,
    //     //     },
    //     // });

    //     try {
    //         await client.actions.move({
    //             account,
    //             direction,
    //         });

    //         // Wait for the indexer to update the entity
    //         // By doing this we keep the optimistic UI in sync with the actual state
    //         await new Promise<void>((resolve) => {
    //             defineSystem(
    //                 world,
    //                 [
    //                     Has(Moves),
    //                     HasValue(Moves, { player: BigInt(account.address) }),
    //                 ],
    //                 () => {
    //                     resolve();
    //                 }
    //             );
    //         });
    //     } catch (e) {
    //         console.log(e);
    //         Position.removeOverride(positionId);
    //         Moves.removeOverride(movesId);
    //     } finally {
    //         Position.removeOverride(positionId);
    //         Moves.removeOverride(movesId);
    //     }
    // };

    return {
        register_player,
        update_player,
        invite,
        reply_invite,
        create_game,
        join_game,
    };
}
