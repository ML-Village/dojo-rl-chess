use starknet::{ContractAddress};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rl_chess_contracts::models::players::{Player, ProfilePicType};
use rl_chess_contracts::models::games::{Game, GameFormat, GameState, InviteState, 
    GameSquares, Piece, PieceType, Color};

// define the interface
#[dojo::interface]
trait IGameRoom<TContractState> {
    fn start_game(ref world: IWorldDispatcher, game_id: u128);
    fn make_move(ref world: IWorldDispatcher, game_id: u128, 
        from_x: u8, from_y: u8, 
        to_x: u8, to_y: u8,
        promotion_choice: Piece
    );

    // todo: offer draw
    fn resign(ref world: IWorldDispatcher, game_id: u128) -> bool;

    // ready-only calls
    fn is_valid_move(self: @TContractState, game_id: u128, 
        from_x: u8, from_y: u8, 
        to_x: u8, to_y: u8
    ) -> bool;
}

// private/internal functions
// #[dojo::interface]
// trait IGameRoomInternal {
    
// }

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
    use rl_chess_contracts::utils::math::{MathU8};

    mod Errors {
        const PLAYER_NOT_INGAME: felt252 = 'RL_CHESS: Caller not in game';
        const INVALID_PLAYER: felt252 = 'RL_CHESS: Invalid player';
        const INVALID_MOVE: felt252 = 'RL_CHESS: Invalid move';
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        // DuelistRegisteredEvent: events::DuelistRegisteredEvent,
        // NewChallengeEvent: events::NewChallengeEvent,
        // ChallengeAcceptedEvent: events::ChallengeAcceptedEvent,
        // ChallengeResolvedEvent: events::ChallengeResolvedEvent,
        // DuelistTurnEvent: events::DuelistTurnEvent,
    }

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl GameRoomImpl of super::IGameRoom<ContractState> {
        
        // startgame
        fn start_game(ref world: IWorldDispatcher, 
            game_id: u128,
        ) {
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
                w_turn_expiry_time: gameformat.turn_expiry,
                b_turn_expiry_time: gameformat.turn_expiry,
                w_total_time_left: gameformat.total_time_per_side,
                b_total_time_left: gameformat.total_time_per_side,
                game_start: get_block_timestamp(),
                last_move_time: get_block_timestamp(),
                game_end: 0,
                whitekingside: true,
                whitequeenside: true,
                blackkingside: true,
                blackqueenside: true,
                halfmove_clock: 0,
                en_passant_target_x: 88, // 88 for none
                en_passant_target_y: 88, // 88 for none
            };

            // initate all board squares by looping through 8x8 models
            // note: setting model on 64 squares
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
                            // if white first row
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
                            // white pawn rows
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
                            // black pawn rows
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
                            // black first row
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
            
            // set game state after board squares initiated
            set!(world, (gamestate));

            true
        }

        // make move
        fn make_move(ref world: IWorldDispatcher, 
            game_id: u128, 
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8,
            promotion_choice: Piece
        ){
            let caller: ContractAddress = starknet::get_caller_address();
            
            let owner: ContractAddress = game.room_owner_address;
            let invitee: ContractAddress = game.invitee_address;

            // check if caller is the owner or invitee
            assert(caller == owner || caller == invitee, Errors::INVALID_PLAYER);

            // check if move is valid
            let is_valid_move: bool = self.is_valid_move(game_id, from_x, from_y, to_x, to_y);
            assert(is_valid_move, Errors::INVALID_MOVE);

            // get the game configs
            let game: Game = get!(world, (game_id), Game);
            let gameformat: GameFormat = get!(world, (game.game_format_id), GameFormat);

            // get game board / squares
            let mut gamesquares_from: GameSquares = get!(world, (game_id, from_x, from_y), GameSquares);
            let gamesquares_from_piece: Piece = gamesquares_from.piece.clone();
            let mut gamesquares_to: GameSquares = get!(world, (game_id, to_x, to_y), GameSquares);

            // 0. === get gamestate vars and init ===
            let mut gamestate: GameState = get!(world, (game_id), GameState);
            let mut turn: u8 = gamestate.turn; // turn initialize from previous
            let mut turn_color: Color = gamestate.turn_color;
            let mut w_player_time_left: u64 = gamestate.w_total_time_left;
            let mut b_player_time_left: u64 = gamestate.b_total_time_left;

            // 1. == update gamesquares since move is valid ==

            // idea is to update the To and From squares and leave the other squares to special moves handle
            gamesquares_to.piece = gamesquares_from.piece;
            gamesquares_from.piece = Piece { piece_type: PieceType::None, color: Color::None };
            
            set!(world, (gamesquares_from));
            set!(world, (gamesquares_to));

            // 2. == handle special moves ==
            self._handle_special_moves(game_id, from_x, from_y, to_x, to_y, gamesquares_from_piece, promotion_choice);

            // check for en passant or castle and get squares for that
            let is_en_passant: bool = self._is_en_passant_flagging(world, game_id, from_x, from_y, to_x, to_y);
            let is_castle_move: bool = self._is_castle_move(world, game_id, from_x, from_y, to_x, to_y);
            let is_pawn_promotion: bool = self._is_pawn_promotion(world, game_id, from_x, from_y, to_x, to_y);

            // == update gamestate ==

            // update turn
            if(turn_color == Color::White) {
                turn_color = Color::Black;
                w_player_time_left = (w_player_time_left - 
                    (get_block_timestamp() - gamestate.last_move_time)
                );
            } else {
                turn_color = Color::White;
                b_player_time_left = (b_player_time_left - 
                    (get_block_timestamp() - gamestate.last_move_time)
                );
                turn+=1;
            }

            // update gamestate
            gamestate.turn = turn; // 1. increment turn after black's move
            gamestate.turn_color = turn_color; // 1. update turn color
            gamestate.w_total_time_left = w_player_time_left;
            gamestate.b_total_time_left = b_player_time_left;
            gamestate.last_move_time = get_block_timestamp();


            (gamestate.en_passant_target_x,
                gamestate.en_passant_target_y
             ) = self._update_en_passant_target(
                game_id, from_x, from_y, to_x, to_y);

            (gamestate.whitekingside,
            gamestate.whitequeenside,
            gamestate.blackkingside,
            gamestate.blackqueenside
            ) = self._update_castling_rights(
                game_id, from_x, from_y, to_x, to_y);

            // todo: update these later
            // game_end: gamestate.game_end,
            // halfmove_clock: gamestate.halfmove_clock

            set!(world, (gamestate));

            true

        }
    
        //------------------------------------
        // read-only calls
        //
        fn is_valid_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {

            let gamesquares: GameSquares = get!(self.world(), (game_id, from_x, from_y), GameSquares);
            // match piece type and check valid move
            let valid_move: bool = match gamesquares.piece.piece_type {
                PieceType::Pawn => self._is_valid_pawn_move(game_id, from_x, from_y, to_x, to_y, gamesquares.piece.color),
                PieceType::Rook => self._is_valid_rook_move(game_id, from_x, from_y, to_x, to_y, gamesquares.piece.color),
                PieceType::Knight => self._is_valid_knight_move(game_id, from_x, from_y, to_x, to_y, gamesquares.piece.color),
                PieceType::Bishop => self._is_valid_bishop_move(game_id, from_x, from_y, to_x, to_y, gamesquares.piece.color),
                PieceType::Queen => self._is_valid_queen_move(game_id, from_x, from_y, to_x, to_y, gamesquares.piece.color),
                PieceType::King => self._is_valid_king_move(game_id, from_x, from_y, to_x, to_y, gamesquares.piece.color),
                _ => false
            };

            valid_move
        }
    }

    // #[abi(embed_v0)] // commented to make this private
    #[generate_trait]
    impl GameRoomInternalImpl of IGameRoomInternalTrait {
        fn _target_is_friendly(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                let from_piece = get!(self.world(), (game_id, from_x, from_y), 
                    GameSquares).piece;
                let target_piece = get!(self.world(), (game_id, to_x, to_y), 
                    GameSquares).piece;
                from_piece.color == target_piece.color
        }
        
        fn _is_valid_pawn_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8,
            color: Color
            )-> bool {
                let direction: i8 = if (color == Color::White) { 1 } else {-1};
                let start_rank = if (color == Color::White) { 1 } else {6};

                let target_square_is_empty:bool = get!(
                    self.world(), (game_id, to_x, to_y), 
                    GameSquares).piece.piece_type == PieceType::None;
                
                // check if it is regular move
                if (from_x == to_x) && 
                (to_y.try_into().unwrap()) == (from_y.try_into().unwrap() + direction) && 
                    target_square_is_empty {
                        return true;
                }
                
                // First move - 2 squares
                // todo: check if path is blocked
                if (from_x == to_x) && 
                    (from_y == start_rank) && 
                    (to_y.try_into().unwrap() == from_y.try_into().unwrap() + 2*direction) 
                    && (target_square_is_empty) {
                        return true;
                }

                // check if it is a capture move by checking if x shift 1
                // and y shift 1 in the direction of the pawn
                if (to_x == from_x + 1 || to_x.try_into().unwrap() == from_x.try_into().unwrap() - 1) &&
                    (to_y.try_into().unwrap() == from_y.try_into().unwrap() + direction) 
                    && !target_square_is_empty {
                        return true;
                    
                    let from_piece = get!(self.world(), (game_id, from_x, from_y),
                        GameSquares).piece;
                    let target_piece = get!(self.world(), (game_id, to_x, to_y), 
                        GameSquares).piece;
                    
                    // if regular capture
                    // check if target is enemy color (non-empty check already done above)
                    if from_piece.color != target_piece.color {
                        return true;
                    }

                    // if en passant
                    return (target_square_is_empty) &&
                        (to_y == self.en_passant_target_y) &&
                        (to_x == self.en_passant_target_x);
                }

                false
        }

        fn _is_valid_rook_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
            
            //if target is friendly
            if self._target_is_friendly(game_id, from_x, from_y, to_x, to_y) {
                return false;
            }

            // check if the move is neither horizontal or vertical
            if ((from_x != to_x) && (from_y != to_y))
            {
                return false;
            }

            self._is_path_clear(game_id, from_x, from_y, to_x, to_y)
        }

        fn _is_path_clear(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                let dx:i8 = MathU8::signum((to_x.try_into().unwrap() - from_x.try_into().unwrap()));
                let dy:i8 = MathU8::signum((to_y - from_y));

                let mut x:i8 = from_x.try_into().unwrap()+ dx;
                let mut y:i8 = from_y.try_into().unwrap()+ dy;

                loop
                {
                    if x == to_x.try_into().unwrap() && y == to_y.try_into().unwrap() {
                        break;
                    }

                    if get!(self.world(), 
                        (game_id, x.try_into().unwrap(), y.try_into().unwrap()), GameSquares).piece.piece_type != PieceType::None {
                        return false;
                    }
                    x += dx;
                    y += dy;
                }
                true
        }

        fn _is_valid_knight_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {

                // check if target is friendly
                if self._target_is_friendly(game_id, from_x, from_y, to_x, to_y) {
                    return false;
                }

                let dx = MathU8::abs((to_x - from_x));
                let dy = MathU8::abs((to_y - from_y));

                // A valid knight move is either:
                // 1. Two squares horizontally and one square vertically
                // 2. Two squares vertically and one square horizontally
                (dx == 2 && dy == 1) || (dx == 1 && dy == 2)
        }

        fn _is_valid_bishop_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {

                // check if target is friendly
                if self._target_is_friendly(game_id, from_x, from_y, to_x, to_y) {
                    return false;
                }

                // Calculate the absolute difference between the x and y coordinates
                let dx = MathU8::abs((to_x - from_x)); 
                let dy = MathU8::abs((to_y - from_y));

                // For a valid diagonal move, dx should equal dy
                if dx != dy {
                    return false;
                }

                self._is_path_clear(game_id, from_x, from_y, to_x, to_y)
        }

        fn _is_valid_queen_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                // A queen's move is valid if it's either a valid rook move or a valid bishop move
                // these 2 funcs already checked if target is friendly
                self._is_valid_rook_move(game_id, from_x, from_y, to_x, to_y) ||
                    self._is_valid_bishop_move(game_id, from_x, from_y, to_x, to_y)
        }

        fn _is_valid_king_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                
                // check if target is friendly
                if self._target_is_friendly(game_id, from_x, from_y, to_x, to_y) {
                    return false;
                }

                // Calculate the absolute difference between the x and y coordinates
                let dx = MathU8::abs((to_x.try_into().unwrap() - from_x.try_into().unwrap()
                            ).try_into().unwrap());
                let dy = MathU8::abs((to_y.try_into().unwrap() - from_y.try_into().unwrap()
                            ).try_into().unwrap());

                // Regular king move: one square in any direction
                if dx <= 1 && dy <= 1 {
                    return true;
                }

                // Castling move
                if dy == 0 && dx == 2 {
                    let color: Color = get!(self.world(), (game_id, from_x, from_y), GameSquares).piece.color;
                    let (kingside, queenside) = self._get_castling_rights(game_id, color);

                    // check if castling is allowed and path is clear
                    if (to_x > from_x && kingside) || (to_x < from_x && queenside) {

                        let rook_x = if to_x > from_x { 7 } else { 0 };
                        return self._is_path_clear(game_id, from_x, from_y, rook_x, from_y);
                    }
                }

                false
        }

        fn _get_castling_rights(self: @ContractState, 
            game_id:u128,
            color: Color
            )-> (bool, bool) {
                let gamestate: GameState = get!(self.world(), (game_id), GameState);
                if color == Color::White {
                    (gamestate.whitekingside, gamestate.whitequeenside)
                } else {
                    (gamestate.blackkingside, gamestate.blackqueenside)
                }
        }


        // only checks if it is en passant capture
        fn _is_en_passant_capture(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                let from_piece = get!(self.world(), (game_id, from_x, from_y), 
                    GameSquares).piece;
                let target_square_is_empty:bool = get!(
                    self.world(), (game_id, to_x, to_y), 
                    GameSquares).piece.piece_type == PieceType::None;
                
                return (from_piece.piece_type == PieceType::Pawn) &&
                        (target_square_is_empty) &&
                        (to_y == self.en_passant_target_y) &&
                        (to_x == self.en_passant_target_x);
                
                false
        }

        // removes en passant target pawn
        fn _handle_en_passant(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            ){
            // assuming en passant is valid
            // assuming from square is pawn

            // remove the captured pawn
            // let mut gamesquares_from: GameSquares = get!(
            //     self.world(), (game_id, from_x, from_y), 
            //     GameSquares);
            // let from_piece: Piece = gamesquares_from.piece;

            let mut gamesquares_to: GameSquares = get!(
                self.world(), (game_id, to_x, to_y), 
                GameSquares
            );
            let mut gamestate: GameState = get!(self.world(), (game_id), GameState);
            
            // if the target square is en passant target
            if gamestate.en_passant_target_x == to_x && 
                gamestate.en_passant_target_y == to_y {
                    // remove the captured pawn
                    let captured_pawn_delta: i8 = if gamestate.turn_color == Color::White { to_y.try_into().unwrap() - 1 } else { to_y.try_into().unwrap() + 1 };
                    let mut captured_pawn: GameSquares = get!(
                        self.world(), (
                            game_id, to_x, captured_pawn_delta.try_into().unwrap()
                        ), 
                        GameSquares);
                    captured_pawn.piece = Piece { piece_type: PieceType::None, color: Color::None };
                    set!(self.world(), (captured_pawn), GameSquares);
            }

            // update en passant target if its a two square target
            // (assuming valid move)
            if MathU8::abs((from_y - to_y).try_into().unwrap()) == 2 {
                gamestate.en_passant_target_x = to_x;
                gamestate.en_passant_target_y = (from_y + to_y) / 2;
            } else {
                gamestate.en_passant_target_x = 88;
                gamestate.en_passant_target_y = 88;
            }
            set!(self.world(), (gamestate));
            
        }

        fn _is_pawn_promotion(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                true
        }

        fn _handle_pawn_promotion(self: @ContractState, 
                game_id:u128,
                from_x: u8, from_y: u8, 
                to_x: u8, to_y: u8,
                promotion_choice: Piece
            ){  
                // assuming already checked for from piece type as Pawn

                assert(promotion_choice.piece_type != PieceType::None, Errors::INVALID_MOVE);
                assert(promotion_choice.piece_type != PieceType::Pawn, Errors::INVALID_MOVE);
                // check that to square is last rank
                assert(to_y == 0 || to_y == 7, Errors::INVALID_MOVE);
                
                // assuming pawn promotion is valid
                let mut gamesquares_to: GameSquares = get!(
                    self.world(), (game_id, to_x, to_y), 
                    GameSquares);
                
                // assumes promotion color is aligned

                gamesquares_to.piece = promotion_choice;
                set!(self.world(), (gamesquares_to));
        }

        // for special moves like en passant, castling, pawn promotion
        fn _handle_special_moves(self: @ContractState,
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8,
            piece: Piece,
            promotion_choice: Piece
            )-> bool {

                // note: these must not use from square model
                match piece.piece_type {
                    PieceType::Pawn => {
                        // removes en passant target pawn
                        // updates: en passant target state (gamestate) if its 2 square move
                        self._handle_en_passant(game_id, from_x, from_y, to_x, to_y);
                        
                        // checks if it is last rank target
                        // capture should have been handled in main move (target square overwritten)
                        // updates: target square updated to promotion_choice
                        self._handle_pawn_promotion(game_id, from_x, from_y, to_x, to_y, promotion_choice);

                        // if self._is_pawn_promotion(game_id, from_x, from_y, to_x, to_y) {
                        // };
                        // if self._is_en_passant(game_id, from_x, from_y, to_x, to_y) {
                            
                        // };
                    },
                    PieceType::King => {
                        if self._is_castle_move(game_id, from_x, from_y, to_x, to_y) {
                            // does not update king position as that is done in the main move
                            // updates: rook position
                            // updates: gamestate castling booleans
                            self._handle_castling(game_id, from_x, from_y, to_x, to_y);
                        };
                    },
                    _ => {}
                }
        }

        
        fn _is_castle_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                MathU8::abs((from_x.try_into().unwrap() - to_x.try_into().unwrap()
                    ).try_into().unwrap()) == 2
        }

        // note: does not need from_square model
        fn  _handle_castling(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            ){
             // assuming castle is valid

            let mut gamestate: GameState = get!(self.world(), (game_id), GameState);
            
            let rook_from_x = if to_x > from_x { 7 } else { 0 };
            let rook_to_x = if to_x > from_x { from_x + 1 } else { from_x - 1 };
            
            // move the rook (the king is already moved)
            let mut gamesquares_rook_from: GameSquares = get!(
                self.world(), (game_id, rook_from_x, from_y), 
                GameSquares);
            let mut gamesquares_rook_to: GameSquares = get!(
                self.world(), (game_id, rook_to_x, from_y), 
                GameSquares);
            
            gamesquares_rook_to.piece = gamesquares_rook_from.piece;
            gamesquares_rook_from.piece = Piece { piece_type: PieceType::None, color: Color::None };

            set!(self.world(), (gamesquares_rook_from, gamesquares_rook_to));
                
            // update castling rights
            if gamestate.turn_color == Color::White {
                gamestate.whitekingside = false;
                gamestate.whitequeenside = false;
            } else {
                gamestate.blackkingside = false;
                gamestate.blackqueenside = false;
            }
            
            set!(self.world(), (gamestate));   
        }

        fn _update_castling_rights(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> (bool, bool, bool, bool) {
               (true, true, true, true)
        }

    }
}