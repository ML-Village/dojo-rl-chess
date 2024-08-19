use starknet::{ContractAddress};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rl_chess_contracts::models::players::{Player, ProfilePicType};

// define the interface
#[dojo::interface]
trait IGameRoom {
    fn start_game(ref world: IWorldDispatcher, game_id: u128) -> bool;
    fn make_move(ref world: IWorldDispatcher, game_id: u128, 
        from_x: u8, from_y: u8, 
        to_x: u8, to_y: u8
    ) -> bool;

    // todo: offer draw
    fn resign(ref world: IWorldDispatcher, game_id: u128) -> bool;
}

// private/internal functions
#[dojo::interface]
trait IGameRoomInternal {
    fn _is_valid_move(ref world: IWorldDispatcher, game_id: u128, 
        from_x: u8, from_y: u8, 
        to_x: u8, to_y: u8
    ) -> bool;
}

#[dojo::contract]
mod gameroom {
    use debug::PrintTrait;
    use traits::{Into, TryInto};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    use rl_chess_contracts::models::games::{Game, GameFormat, GameState, InviteState,
        GameSquares, Piece, PieceType, Color};
    use rl_chess_contracts::models::players::{Player, ProfilePicType, PlayerManager, PlayerManagerTrait};
    
    use rl_chess_contracts::libs::utils;
    use rl_chess_contracts::utils::timestamp::{timestamp};
    use rl_chess_contracts::utils::short_string::{ShortStringTrait};

    mod Errors {
        const PLAYER_NOT_INGAME: felt252 = 'RL_CHESS: Caller not in game';
        const INVALID_PLAYER: felt252 = 'RL_CHESS: Invalid player';
        const INVALID_MOVE: felt252 = 'RL_CHESS: Invalid move';
    }

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl GameRoomImpl of super::IGameRoom<ContractState> {
        
        // startgame
        fn start_game(ref world: IWorldDispatcher, 
            game_id: u128,
        ) -> bool {
            let caller: ContractAddress = starknet::get_caller_address();

            // get the game
            let game: Game = get!(world, (game_id), Game);
            let gameformat: GameFormat = get!(world, (game.game_format_id), GameFormat);

            let owner: ContractAddress = game.room_owner_address;
            let invitee: ContractAddress = game.invitee_address;

            // check if caller is the owner or invitee
            assert(caller == owner || caller == invitee, Errors::PLAYER_NOT_INGAME);

            // initialize gamestate
            let gamestate: GameState = GameState {
                game_id: game_id,
                white: 0, // owner is white
                turn: 1,
                turn_color: Color::White, // white
                w_turn_expiry_time: game.total_time_per_side,
                b_turn_expiry_time: game.total_time_per_side,
                w_total_time_left: game.total_time_per_side,
                b_total_time_left: game.total_time_per_side,
                game_start: get_block_timestamp(),
                game_end: 0,
                whitekingside: true,
                whitequeenside: true,
                blackkingside: true,
                blackqueenside: true,
                halfmove_clock: 0
            };

            
            let mut y: u8 = 0;
            loop{
                if(y == 8) { break; }
                let mut x: u8 = 0;
                loop {
                    if(x == 8) { break; }

                    // if y is 0 or 1, then white pieces
                    // if y is 6 or 7, then black pieces
                    // else None
                    let piece:Piece = match y {
                        0 => {
                            match x {
                                0 => Piece { piece_type: PieceType::Rook, color: Color::White },
                                1 => Piece { piece_type: PieceType::Knight, color: Color::White },
                                2 => Piece { piece_type: PieceType::Bishop, color: Color::White },
                                3 => Piece { piece_type: PieceType::Queen, color: Color::White },
                                4 => Piece { piece_type: PieceType::King, color: Color::White },
                                5 => Piece { piece_type: PieceType::Bishop, color: Color::White },
                                6 => Piece { piece_type: PieceType::Knight, color: Color::White },
                                7 => Piece { piece_type: PieceType::Rook, color: Color::White },
                                _ => Piece { piece_type: PieceType::None, color: Color::None }
                            }
                        },
                        1 => {
                            match x {
                                0 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                1 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                2 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                3 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                4 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                5 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                6 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                7 => Piece { piece_type: PieceType::Pawn, color: Color::White },
                                _ => Piece { piece_type: PieceType::None, color: Color::None }
                            }
                        },
                        6 => {
                            match x {
                                0 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                1 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                2 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                3 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                4 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                5 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                6 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                7 => Piece { piece_type: PieceType::Pawn, color: Color::Black },
                                _ => Piece { piece_type: PieceType::None, color: Color::None }
                            }
                        },
                        7 => {
                            match x {
                                0 => Piece { piece_type: PieceType::Rook, color: Color::Black },
                                1 => Piece { piece_type: PieceType::Knight, color: Color::Black },
                                2 => Piece { piece_type: PieceType::Bishop, color: Color::Black },
                                3 => Piece { piece_type: PieceType::Queen, color: Color::Black },
                                4 => Piece { piece_type: PieceType::King, color: Color::Black },
                                5 => Piece { piece_type: PieceType::Bishop, color: Color::Black },
                                6 => Piece { piece_type: PieceType::Knight, color: Color::Black },
                                7 => Piece { piece_type: PieceType::Rook, color: Color::Black },
                                _ => Piece { piece_type: PieceType::None, color: Color::None }
                            }
                        },
                        _ => Piece { piece_type: PieceType::None, color: Color::None }
                    };

                    let gamesquares: GameSquares = GameSquares {
                        game_id: game_id,
                        y: y,
                        x: x,
                        piece: piece
                    };

                    set!(world, (gamesquares));

                    x+=1;
                }
                y+=1;
            }   
            
            set!(world, (gamestate));

            true
        }

        // make move
        fn make_move(ref world: IWorldDispatcher, 
            game_id: u128, 
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
        ) -> bool {
            let caller: ContractAddress = starknet::get_caller_address();

            // get the game
            let game: Game = get!(world, (game_id), Game);
            let gameformat: GameFormat = get!(world, (game.game_format_id), GameFormat);

            let owner: ContractAddress = game.room_owner_address;
            let invitee: ContractAddress = game.invitee_address;

            // check if caller is the owner or invitee
            assert(caller == owner || caller == invitee, Errors::INVALID_PLAYER);

            // check if move is valid
            let is_valid_move: bool = self._is_valid_move(world, game_id, from_x, from_y, to_x, to_y);
            assert(is_valid_move, Errors::INVALID_MOVE);

            // update gamestate
            let gamestate: GameState = get!(world, (game_id), GameState);
            let mut turn: u8 = gamestate.turn;
            let mut turn_color: Color = gamestate.turn_color;

            // update turn
            if(turn_color == Color::White) {
                turn_color = Color::Black;
            } else {
                turn_color = Color::White;
                turn+=1;
            }

            // update gamestate
            let gamestate: GameState = GameState {
                game_id: game_id,
                white: gamestate.white,
                turn: turn,
                turn_color: turn_color,
                w_turn_expiry_time: gamestate.w_turn_expiry_time,
                b_turn_expiry_time: gamestate.b_turn_expiry_time,
                w_total_time_left: gamestate.w_total_time_left,
                b_total_time_left: gamestate.b_total_time_left,
                game_start: gamestate.game_start,
                game_end: gamestate.game_end,
                whitekingside: gamestate.whitekingside,
                whitequeenside: gamestate.whitequeenside,
                blackkingside: gamestate.blackkingside,
                blackqueenside: gamestate.blackqueenside,
                halfmove_clock: gamestate.halfmove_clock
            };

            set!(world, (gamestate));

            true

    }

    //------------------------------------
    // Internal calls
    //

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        // DuelistRegisteredEvent: events::DuelistRegisteredEvent,
        // NewChallengeEvent: events::NewChallengeEvent,
        // ChallengeAcceptedEvent: events::ChallengeAcceptedEvent,
        // ChallengeResolvedEvent: events::ChallengeResolvedEvent,
        // DuelistTurnEvent: events::DuelistTurnEvent,
    }

    // #[abi(embed_v0)] // commented to make this private
    impl GameRoomInternalImpl of super::IGameRoomInternal<ContractState> {
        
    }
}