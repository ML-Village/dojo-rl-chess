use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u128,
    pub game_format_id:u16,
    pub room_owner_address: ContractAddress, //creator wallet address
    pub invitee_address: ContractAddress, //invitee wallet address

    pub invite_state: InviteState,
    pub invite_expiry: u64, // Unix time, time for challenge to expire (0 for unlimited)

    pub result: u8, //  0:unresolved, 1:owner, 2:invitee, 3:draw
    pub winner: ContractAddress, // winner wallet address

    // timestamps in unix epoch
    pub room_start: u64,       // Unix time, started
    pub room_end: u64,         // Unix time, ended
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GameFormat {
    #[key]
    pub game_format_id:u16,
    pub description: felt252,
    pub turn_expiry: u64, // Unix time, time for each turn to expire (0 for unlimited)
    pub total_time_per_side: u64, // Unix time, total game time (0 for unlimited)
    pub total_time_string: felt252,
    pub increment: u8, // Unix time, time in seconds added after each turn (0 for no increment)
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GameState {
    #[key]
    pub game_id: u128,
    pub white: u8, // who is white, 0:owner, 1:invitee
    pub turn: u32, // turn number
    pub turn_color: Color, // 0:white, 1:black

    pub w_turn_expiry_time: u64,
    pub b_turn_expiry_time: u64,
    pub w_total_time_left: u64, // Unix time, total game time (0 for unlimited)
    pub b_total_time_left: u64, // Unix time, total game time (0 for unlimited)
    
    pub game_start: u64, // Unix time, started
    pub last_move_time: u64, // Unix time, last move
    pub game_end: u64, // Unix time, ended

    // castling rights
    pub whitekingside: bool,
    pub whitequeenside: bool,
    pub blackkingside: bool,
    pub blackqueenside: bool,

    // move tracker
    pub halfmove_clock: u16,
    pub en_passant_target_x: u8,
    pub en_passant_target_y: u8,
    //fullmove_number: u16, //using turn

    // NOT DOING ARRAYS OF ARRAYS yet to wait for stability in Cairo/Dojo
    // using GameSquares
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GameSquares {
    #[key]
    pub game_id: u128,

    // Original Way of having each entity as a square causes
    // events to be fired on each square
    #[key]
    pub x: u8,
    #[key]
    pub y: u8,
    
    pub piece: Piece,

    // New Way manually code out positions
    // 8: Array<Piece>, // a1-h1
    // 7: Array<Piece>, // a2-h2
    // 6: Array<Piece>, // a3-h3
    // 5: Array<Piece>, // a4-h4
    // 4: Array<Piece>, // a5-h5
    // 3: Array<Piece>, // a6-h6
    // 2: Array<Piece>, // a7-h7
    // 1: Array<Piece>, // a8-h8
}


#[derive(Copy, Drop, Serde, PartialEq, Introspect)]
enum InviteState {
    Null,       // 0  
    Awaiting,   // 1
    Withdrawn,  // 2
    Refused,    // 3
    Expired,    // 4
    InProgress, // 5
    Resolved,   // 6
    Draw,       // 7
}


#[derive(Drop, Copy, Clone, PartialEq, Introspect, Serde, Debug)]
enum PieceType {
    None,
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

#[derive(Drop, Copy, Clone, PartialEq, Introspect, Serde, Debug)]
enum Color {
    None,
    White,
    Black,
}

#[derive(Drop, Copy, PartialEq, Introspect, Serde, Debug)]
pub struct Piece {
    pub color: Color,
    pub piece_type: PieceType,
}

//----------------------------------
// Manager
//

#[derive(Copy, Drop)]
pub struct GameManager {
    pub world: IWorldDispatcher,
    //token_dispatcher: IERC721Dispatcher,
}


#[generate_trait]
impl GameManagerTraitImpl of GameManagerTrait {
    fn new(world: IWorldDispatcher) -> GameManager {
        (GameManager { world })
    }

    // fn new_game(self: GameManager, game_id: u128, game_format_id:u16, room_owner_address: ContractAddress, invitee_address: ContractAddress, invite_expiry: u64) {
    //     let game = Game {
    //         game_id,
    //         game_format_id,
    //         room_owner_address,
    //         invitee_address,
    //         invite_state: InviteState::Awaiting,
    //         invite_expiry,
    //         result: 0,
    //         winner: ContractAddress::zero(),
    //         room_start: 0,
    //         room_end: 0,
    //     };
    //     set!(self.world, (game));
    // }

    // to get the Player model via key
    fn get(self: GameManager, game_id: u128) -> Game {
        get!(self.world, (game_id), Game)
    }

    fn set(self: GameManager, game: Game) {
        set!(self.world, (game));
    }
}