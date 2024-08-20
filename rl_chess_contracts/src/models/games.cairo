use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Game {
    #[key]
    game_id: u128,
    game_format_id:u16,
    room_owner_address: ContractAddress, //creator wallet address
    invitee_address: ContractAddress, //invitee wallet address

    invite_state: InviteState,
    invite_expiry: u64, // Unix time, time for challenge to expire (0 for unlimited)

    result: u8, //  0:unresolved, 1:owner, 2:invitee, 3:draw
    winner: ContractAddress, // winner wallet address

    // timestamps in unix epoch
    room_start: u64,       // Unix time, started
    room_end: u64,         // Unix time, ended
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GameFormat {
    #[key]
    game_format_id:u16,
    description: felt252,
    turn_expiry: u64, // Unix time, time for each turn to expire (0 for unlimited)
    total_time_per_side: u64, // Unix time, total game time (0 for unlimited)
    total_time_string: felt252,
    increment: u8, // Unix time, time in seconds added after each turn (0 for no increment)
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GameState {
    #[key]
    game_id: u128,
    white: u8, // who is white, 0:owner, 1:invitee
    turn: u32, // turn number
    turn_color: Color, // 0:white, 1:black

    w_turn_expiry_time: u64,
    b_turn_expiry_time: u64,
    w_total_time_left: u64, // Unix time, total game time (0 for unlimited)
    b_total_time_left: u64, // Unix time, total game time (0 for unlimited)
    
    game_start: u64, // Unix time, started
    last_move_time: u64, // Unix time, last move
    game_end: u64, // Unix time, ended

    // castling rights
    whitekingside: bool,
    whitequeenside: bool,
    blackkingside: bool,
    blackqueenside: bool,

    // move tracker
    halfmove_clock: u16,
    en_passant_target_x: u8,
    en_passant_target_y: u8,
    //fullmove_number: u16, //using turn

    // NOT DOING ARRAYS OF ARRAYS yet to wait for stability in Cairo/Dojo
    // using GameSquares
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GameSquares {
    #[key]
    game_id: u128,

    // Original Way of having each entity as a square causes
    // events to be fired on each square

    #[key]
    y: u8,
    #[key]
    x: u8,
    piece: Piece,

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
pub enum Color {
    None,
    White,
    Black,
}

#[derive(Drop, Copy, PartialEq, Introspect, Serde, Debug)]
struct Piece {
    color: Color,
    piece_type: PieceType,
}