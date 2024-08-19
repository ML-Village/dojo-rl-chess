use starknet::{ContractAddress};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rl_chess_contracts::models::players::{Player, ProfilePicType};
use rl_chess_contracts::models::games::{Game, GameFormat, GameState, InviteState, 
    GameSquares, Piece, PieceType, Color};

// define the interface
#[dojo::interface]
trait IGameRoom<TContractState> {
    fn start_game(ref world: IWorldDispatcher, game_id: u128) -> bool;
    fn make_move(ref world: IWorldDispatcher, game_id: u128, 
        from_x: u8, from_y: u8, 
        to_x: u8, to_y: u8,
        promotion_choice: Piece
    ) -> bool;

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
            to_x: u8, to_y: u8,
            promotion_choice: Piece
        ) -> bool {
            let caller: ContractAddress = starknet::get_caller_address();

            // get the game
            let game: Game = get!(world, (game_id), Game);
            let gameformat: GameFormat = get!(world, (game.game_format_id), GameFormat);
            let mut gamesquares_from: GameSquares = get!(world, (game_id, from_x, from_y), GameSquares);
            let mut gamesquares_to: GameSquares = get!(world, (game_id, to_x, to_y), GameSquares);

            let owner: ContractAddress = game.room_owner_address;
            let invitee: ContractAddress = game.invitee_address;

            // check if caller is the owner or invitee
            assert(caller == owner || caller == invitee, Errors::INVALID_PLAYER);

            // check if move is valid
            let is_valid_move: bool = self._is_valid_move(world, game_id, from_x, from_y, to_x, to_y);
            assert(is_valid_move, Errors::INVALID_MOVE);

            // 0. === get gamestate vars and init ===
            let mut gamestate: GameState = get!(world, (game_id), GameState);
            let mut turn: u8 = gamestate.turn; // turn initialize from previous
            let mut turn_color: Color = gamestate.turn_color;
            let mut w_player_time_left: u64 = gamestate.w_total_time_left;
            let mut b_player_time_left: u64 = gamestate.b_total_time_left;

            // 1. == update gamesquares since move is valid ==

            gamesquares_to.piece = gamesquares_from.piece;
            gamesquares_from.piece = Piece { piece_type: PieceType::None, color: Color::None };
            
            set!(world, (gamesquares_from));
            set!(world, (gamesquares_to));

            // 2. == handle special moves ==
            self._handle_special_moves(game_id, from_x, from_y, to_x, to_y, gamesquares_from.piece, promotion_choice);

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
        fn _is_valid_pawn_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8,
            color: Color
            )-> bool {
                let direction = if (color == Color::White) { 1 } else {-1};
                let start_rank = if (color == Color::White) { 1 } else {6};

                let target_square_is_empty:bool = get!(
                    self.world(), (game_id, to_x, to_y), 
                    GameSquares).piece.piece_type == PieceType::None;
                
                // pawn cannot end up in non-empty square
                assert(target_square_is_empty, Errors::INVALID_MOVE);

                // check if it is regular move
                if from_x == to_x && to_y == from_y + direction && 
                    target_square_is_empty {
                        return true;
                }
                
                // First move - 2 squares
                if from_x == to_x && to_y == from_y + 2*direction 
                    && target_square_is_empty {
                        return true;
                }

                // check if it is a capture move by checking if x shift 1
                // and y shift 1 in the direction of the pawn
                if (to_x == from_x + 1 || to_x == from_x - 1) &&
                    to_y == from_y + direction {

                    let target_piece = get!(self.world(), (game_id, to_x, to_y), 
                        GameSquares).piece;

                    if target_piece.piece_type == PieceType::Pawn {
                        return target_piece.color != color;
                    }

                    // if en passant
                    return (target_piece.piece_type == PieceType::None) &&
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
            
            // check if the move is either horizontal or vertical
            if from_x != to_x && from_y != to_y {
                return false;
            }

            self._is_path_clear(game_id, from_x, from_y, to_x, to_y)
        }

        fn _is_path_clear(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                let dx = (to_x - from_x).signum();
                let dy = (to_y - from_y).signum();

                let mut x = from_x + dx;
                let mut y = from_y + dy;

                loop
                {
                    if x == to_x && y == to_y {
                        break;
                    }

                    if get!(self.world(), 
                        (game_id, x, y), GameSquares).piece.piece_type != PieceType::None {
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
                
                let dx = (to_x - from_x).abs();
                let dy = (to_y - from_y).abs();

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
                // Calculate the absolute difference between the x and y coordinates
                let dx = (to_x - from_x).abs(); 
                let dy = (to_y - from_y).abs();

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
                self._is_valid_rook_move(game_id, from_x, from_y, to_x, to_y) ||
                    self._is_valid_bishop_move(game_id, from_x, from_y, to_x, to_y)
        }

        fn _is_valid_king_move(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                // Calculate the absolute difference between the x and y coordinates
                let dx = (to_x - from_x).abs();
                let dy = (to_y - from_y).abs();

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

        fn _is_en_passant_flagging(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> bool {
                true
        }


        // removes en passant target pawn
        fn _handle_en_passant(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            ){
            // assuming en passant is valid

            // remove the pawn
            let mut gamestate: GameState = get!(self.world(), (game_id), GameState);
            let mut gamesquares_from: GameSquares = get!(
                self.world(), (game_id, from_x, from_y), 
                GameSquares);
            let from_piece: Piece = gamesquares_from.piece;

            let mut gamesquares_to: GameSquares = get!(
                self.world(), (game_id, to_x, to_y), 
                GameSquares
            );
            
            if gamestate.en_passant_target_x == to_x && 
                gamestate.en_passant_target_y == to_y {
                    // remove the pawn
                    //let captured_pawn_delta: u8 = if from_piece.color == Color::White { 1 } else { -1 };
                    let mut captured_pawn: GameSquares = get!(
                        self.world(), (game_id, to_x, from_y), 
                        GameSquares);
                    captured_pawn.piece = Piece { piece_type: PieceType::None, color: Color::None };
                    set!(self.world(), (captured_pawn));
            }

            // update en passant target if its a two square target
            // (assuming valid move)
            if to_y == from_y + 2 || to_y == from_y - 2 {
                gamestate.en_passant_target_x = to_x;
                gamestate.en_passant_target_y = (to_y + from_y) / 2;
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
                assert(promotion_choice.piece_type != PieceType::None, Errors::INVALID_MOVE);
                assert(promotion_choice.piece_type != PieceType::Pawn, Errors::INVALID_MOVE);
                // assuming pawn promotion is valid
                let mut gamesquares_to: GameSquares = get!(
                    self.world(), (game_id, to_x, to_y), 
                    GameSquares
                );
                
                // todo: check if color is correct
                gamesquares_to.piece.piece_type = promotion_choice.piece_type;
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
                match piece.piece_type {
                    PieceType::Pawn => {
                        if self._is_pawn_promotion(game_id, from_x, from_y, to_x, to_y) {
                            self._handle_pawn_promotion(game_id, from_x, from_y, to_x, to_y, promotion_choice);
                        };
                        is self._is_en_passant_flagging(game_id, from_x, from_y, to_x, to_y) {
                            self._handle_en_passant(game_id, from_x, from_y, to_x, to_y);
                        };
                    },
                    PieceType::King => {
                        if self._is_castle_move(game_id, from_x, from_y, to_x, to_y) {
                            // updates gamestate castling booleans
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
                (from_x - to_x).abs() == 2
        }

        fn  _handle_castling(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            ){
             // assuming castle is valid

             // update castling rights
            let mut gamestate: GameState = get!(self.world(), (game_id), GameState);
            let mut gamesquares_from: GameSquares = get!(
                self.world(), (game_id, from_x, from_y), 
                GameSquares);
            let from_piece: Piece = gamesquares_from.piece;
            
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
                

            if from_piece.piece_type == PieceType::King {
                if from_piece.color == Color::White {
                    gamestate.whitekingside = false;
                    gamestate.whitequeenside = false;
                } else {
                    gamestate.blackkingside = false;
                    gamestate.blackqueenside = false;
                }
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

        fn _update_en_passant_target(self: @ContractState, 
            game_id:u128,
            from_x: u8, from_y: u8, 
            to_x: u8, to_y: u8
            )-> (u8, u8) {
                (88, 88)
        }

    }
}