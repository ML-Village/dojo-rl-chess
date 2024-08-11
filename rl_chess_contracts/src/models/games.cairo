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
    turn_expiry: u64, // Unix time, time for each turn to expire (0 for unlimited)
    total_time_per_side: u64, // Unix time, total game time (0 for unlimited)
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct GameState {
    #[key]
    game_id: u128,
    white: u8, // who is white, 0:owner, 1:invitee
    turn: u32, // turn number
    turn_color: u8, // 0:white, 1:black

    w_turn_expiry_time: u64,
    b_turn_expiry_time: u64,
    w_total_time_left: u64, // Unix time, total game time (0 for unlimited)
    b_total_time_left: u64, // Unix time, total game time (0 for unlimited)
    
    game_start: u64, // Unix time, started
    game_end: u64, // Unix time, ended
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