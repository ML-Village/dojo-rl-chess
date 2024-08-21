import { Account, AccountInterface } from "starknet";
import { DojoProvider } from "@dojoengine/core";
import { Color } from "chess.js";

const NAMESPACE = "rl_chess_contracts";
export interface IWorld {
    lobby: {
        register_player: (props: UpdatePlayerProps) => Promise<any>;
        update_player: (props: UpdatePlayerProps) => Promise<any>;
        invite: (props: InviteProps) => Promise<any>;
        reply_invite: (props: ReplyInviteProps) => Promise<any>;
        create_game: (props: {account: Account | AccountInterface, game_format_id:number}) => Promise<any>;
        join_game: (props: {account: Account | AccountInterface, game_id:number}) => Promise<any>;
    };
    gameroom: {
        start_game: (props: {account: Account | AccountInterface, game_id:number}) => Promise<any>;
        make_move: (props: MakeMoveProps) => Promise<any>;        
    }
}

export enum ProfilePicType {
    Undefined = 0,
    Native = 1,
    External = 2,
}

export interface UpdatePlayerProps {
    account: Account | AccountInterface;
    name: string;
    profile_pic_type: ProfilePicType;
    profile_pic_uri: string;
}

export interface InviteProps {
    account: Account | AccountInterface;
    game_format_id: number;
    invitee_address: bigint;
    invite_expiry: number;
}

export interface ReplyInviteProps {
    account: Account | AccountInterface;
    game_id: number,
    accepted: boolean;
}

// game room interfaces
export enum ModelColor {
    None = 0,
    White = 1,
    Black = 2,
}

export enum PieceType {
    None = 0,
    Pawn = 1,
    Knight = 2,
    Bishop = 3,
    Rook = 4,
    Queen = 5,
    King = 6,
}

export interface MakeMoveProps {
    account: Account | AccountInterface;
    game_id: number;
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
    promotion_piece: { color: ModelColor; piece_type: PieceType };
}

const handleError = (action: string, error: unknown) => {
    console.error(`Error executing ${action}:`, error);
    throw error;
};

export const setupWorld = async (provider: DojoProvider): Promise<IWorld> => {
    const lobby = () => ({
        register_player: async ({ account, name, profile_pic_type, profile_pic_uri }: UpdatePlayerProps) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "lobby",
                        entrypoint: "register_player",
                        calldata: [name, profile_pic_type, profile_pic_uri],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("register_player", error);
            }
        },

        update_player: async ({ account, name, profile_pic_type, profile_pic_uri }: UpdatePlayerProps) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "lobby",
                        entrypoint: "update_player",
                        calldata: [name, profile_pic_type, profile_pic_uri],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("update_player", error);
            }
        },

        invite: async ({ account, game_format_id, invitee_address, invite_expiry }: InviteProps) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "lobby",
                        entrypoint: "invite",
                        calldata: [game_format_id, invitee_address, invite_expiry],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("invite", error);
            }
        },

        reply_invite: async ({ account, game_id, accepted }: ReplyInviteProps) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "lobby",
                        entrypoint: "reply_invite",
                        calldata: [game_id, accepted],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("reply_invite", error);
            }
        },

        create_game: async ({ account, game_format_id }: {account: Account | AccountInterface, game_format_id:number}) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "lobby",
                        entrypoint: "create_game",
                        calldata: [game_format_id],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("create_game", error);
            }
        },

        join_game: async ({ account, game_id }: {account: Account | AccountInterface, game_id:number}) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "lobby",
                        entrypoint: "join_game",
                        calldata: [game_id],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("join_game", error);
            }
        },

    });

    const gameroom = () => ({ 
        start_game: async ({ account, game_id}: {account: Account | AccountInterface, game_id:number}) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "gameroom",
                        entrypoint: "start_game",
                        calldata: [game_id],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("start_game", error);
            }
        },

        make_move: async ({ account, game_id, from_x, from_y, to_x, to_y, promotion_piece}: MakeMoveProps) => {
            try {
                return await provider.execute(
                    account,
                    {
                        contractName: "gameroom",
                        entrypoint: "make_move",
                        calldata: [game_id, 
                            from_x, from_y, 
                            to_x, to_y, 
                            promotion_piece],
                    },
                    NAMESPACE
                );
            } catch (error) {
                handleError("make_move", error);
            }
        },
        
    })

    return { 
        lobby: lobby(),
        gameroom: gameroom(),
    };
};
