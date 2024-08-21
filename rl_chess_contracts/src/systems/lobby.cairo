use starknet::{ContractAddress};
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use rl_chess_contracts::models::players::{Player, ProfilePicType};

// define the interface
#[dojo::interface]
trait ILobby {
    
    // Duelists
    fn register_player(
        ref world: IWorldDispatcher,
        name: felt252,
        profile_pic_type: ProfilePicType,
        profile_pic_uri: felt252
    ) -> Player;
    fn update_player(
        ref world: IWorldDispatcher,
        name: felt252,
        profile_pic_type: ProfilePicType,
        profile_pic_uri: felt252,
    ) -> Player;

    // do an invite
    fn invite(
        ref world: IWorldDispatcher, 
        game_format_id: u16,
        invitee_address: ContractAddress,
        invite_expiry: u64) -> u128;
    
    fn reply_invite(
        ref world: IWorldDispatcher, 
        game_id: u128,
        accepted: bool) -> bool;
    
    // regular create/wait games
    fn create_game(
        ref world: IWorldDispatcher,
        game_format_id: u16) -> u128;
    fn join_game(
        ref world: IWorldDispatcher,
        game_id: u128) -> bool;
    }


// private/internal functions
#[dojo::interface]
trait ILobbyInternal {
    //fn _emitDuelistRegisteredEvent(ref world: IWorldDispatcher, address: ContractAddress, duelist: Duelist, is_new: bool);
}

#[dojo::contract]
mod lobby {
    use debug::PrintTrait;
    use traits::{Into, TryInto};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    use rl_chess_contracts::models::games::{Game, GameFormat, GameState, InviteState,
        Color, Piece, PieceType, GameSquares
    };
    use rl_chess_contracts::models::players::{Player, ProfilePicType, PlayerManager, PlayerManagerTrait};
    use rl_chess_contracts::libs::seeder::{make_seed};
    use rl_chess_contracts::libs::utils;
    use rl_chess_contracts::utils::timestamp::{timestamp};
    use rl_chess_contracts::utils::short_string::{ShortStringTrait};

    mod Errors {
        const UNREGISTERED_PLAYER: felt252   = 'RL_CHESS: Unregistered player';
        const NOT_YOUR_PLAYER: felt252  = 'RL_CHESS: Not your player';
        const GAME_NOT_FOR_YOU: felt252 = 'RL_CHESS: Game not for you';
        const GAME_NOT_AWAITING: felt252 = 'RL_CHESS: Game not Awaiting';
        const GAME_OCCUPIED: felt252 = 'RL_CHESS: Game occupied';
    }

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl LobbyImpl of super::ILobby<ContractState> {

        // Players
        //
        fn register_player(ref world: IWorldDispatcher,
            name: felt252,
            profile_pic_type: ProfilePicType,
            profile_pic_uri: felt252,
        ) -> Player {
            let caller: ContractAddress = starknet::get_caller_address();
            // let minter_dispatcher: IMinterDispatcher = world.minter_dispatcher();
            // let token_id: u128 = minter_dispatcher.mint(caller, world.token_duelist_address());
            
            // // create
            let mut player = Player {
                address: caller,
                name,
                profile_pic_type,
                profile_pic_uri: profile_pic_uri.to_byte_array(),
                timestamp: get_block_timestamp(),
            };
            
            // // save
            PlayerManagerTrait::new(world).set(player.clone());
            //set!(world, (player));

            //todo:
            //self._emitDuelistRegisteredEvent(caller, duelist.clone(), true);

            (player)
        }

        fn update_player(ref world: IWorldDispatcher,
            name: felt252,
            profile_pic_type: ProfilePicType,
            profile_pic_uri: felt252,
        ) -> Player {
            let caller: ContractAddress = starknet::get_caller_address();
            let player_manager: PlayerManager = PlayerManagerTrait::new(world);
            //let mut player = get!(world, (caller), Player);
            let mut player = player_manager.get(caller);

            assert(player.timestamp != 0, Errors::UNREGISTERED_PLAYER);
            //assert(duelist_manager.is_owner_of(caller, duelist_id) == true, Errors::NOT_YOUR_PROFILE);
            //assert(player.address == caller, Errors::NOT_YOUR_PROFILE);

            // update
            player.name = name;
            player.profile_pic_type = profile_pic_type;
            player.profile_pic_uri = profile_pic_uri.to_byte_array();
            
            // save
            player_manager.set(player.clone());
            //set!(world, (player));

            //self._emitDuelistRegisteredEvent(caller, duelist.clone(), false);

            (player)
        }

        fn invite(ref world: IWorldDispatcher,
            game_format_id: u16,
            invitee_address: ContractAddress,
            invite_expiry: u64,
        ) -> u128 {
            
            let room_owner_address: ContractAddress = starknet::get_caller_address();
            let player_manager = PlayerManagerTrait::new(world);
            //let room_owner: Player = get!(world, (room_owner_address), Player);
            let room_owner: Player = player_manager.get(room_owner_address);
            assert(room_owner.timestamp != 0, Errors::UNREGISTERED_PLAYER);

            let invitee: Player = player_manager.get(invitee_address);
            assert(invitee.timestamp != 0, Errors::UNREGISTERED_PLAYER);

            let game_format: GameFormat = get!(world, (game_format_id), GameFormat);
            
            // create game id
            let game_id: u128 = make_seed(room_owner_address, world.uuid());
            
            //assert(table_manager.can_join(table_id, address_b, duelist_id_b), Errors::CHALLENGED_NOT_ADMITTED);

            // calc expiration
            let timestamp_start: u64 = get_block_timestamp();
            let timestamp_end: u64 = if (invite_expiry == 0) { 0 } else { timestamp_start + timestamp::from_hours(invite_expiry) };

            let game = Game {
                game_id,
                game_format_id,
                room_owner_address,
                invitee_address,
                
                // progress
                invite_state: InviteState::Awaiting,
                invite_expiry: timestamp_end,

                result: 0,
                winner: utils::ZERO(),
                // times
                room_start:get_block_timestamp(),   // chalenge issued
                room_end: 0, // when room is closed
            };

            // let game_state = GameState {
            //     game_id,
            //     white: 0, //randomize this
            //     turn: 0, // starts at one when game start
            //     turn_color: 0, // 0:white, 1:black

            //     w_turn_expiry_time: 0,
            //     b_turn_expiry_time: 0,
            //     w_total_time_left: game_format.total_time_per_side,
            //     b_total_time_left: game_format.total_time_per_side,

            //     game_start: 0,
            //     game_end: 0,
            // };

            // set game room start
            //utils::set_pact(world, challenge);
            
            // create challenge
            //utils::set_challenge(world, challenge);
            set!(world, (game)); // game manager?
            //set!(world, (game, game_state)); // game manager?

            (game_id)
        }

        fn reply_invite(ref world: IWorldDispatcher, 
            game_id: u128, 
            accepted: bool) -> bool {

            let invitee_address: ContractAddress = starknet::get_caller_address();
            let mut game: Game = get!(world, (game_id), Game);
            let player_manager = PlayerManagerTrait::new(world);
            //let invitee: Player = get!(world, (invitee_address), Player);
            let invitee: Player = player_manager.get(invitee_address);
            assert(invitee.timestamp != 0, Errors::UNREGISTERED_PLAYER);

            assert(game.invitee_address == invitee_address, Errors::GAME_NOT_FOR_YOU);
            assert(game.invite_state == InviteState::Awaiting, Errors::GAME_NOT_AWAITING);
            
            // update game
            game.invite_state = if accepted { InviteState::InProgress } else { InviteState::Refused };
            
            // save
            set!(world, (game));

            (accepted)
        }

        fn create_game(ref world: IWorldDispatcher,
            game_format_id: u16,
        ) -> u128 {
            
            let room_owner_address: ContractAddress = starknet::get_caller_address();
            let player_manager = PlayerManagerTrait::new(world);
            //let room_owner: Player = get!(world, (room_owner_address), Player);
            let room_owner: Player = player_manager.get(room_owner_address);
            assert(room_owner.timestamp != 0, Errors::UNREGISTERED_PLAYER);

            let game_format: GameFormat = get!(world, (game_format_id), GameFormat);
            
            // create game id
            let game_id: u128 = make_seed(room_owner_address, world.uuid());
            
            //assert(table_manager.can_join(table_id, address_b, duelist_id_b), Errors::CHALLENGED_NOT_ADMITTED);

            // calc expiration
            // let timestamp_start: u64 = get_block_timestamp();
            // let timestamp_end: u64 = if (invite_expiry == 0) { 0 } else { timestamp_start + timestamp::from_hours(invite_expiry) };

            let game = Game {
                game_id,
                game_format_id,
                room_owner_address,
                invitee_address: utils::ZERO(),
                
                // progress
                invite_state: InviteState::Awaiting,
                invite_expiry: 0,

                result: 0,
                winner: utils::ZERO(),
                // times
                room_start:get_block_timestamp(),   // chalenge issued
                room_end: 0, // when room is closed
            };

            // set game room start

            // rough initialize gamestate
            let gamestate: GameState = GameState {
                game_id: game_id,
                white: 0, // owner is white
                turn: 0,
                turn_color: Color::White, // white
                w_turn_expiry_time: game_format.turn_expiry,
                b_turn_expiry_time: game_format.turn_expiry,
                w_total_time_left: game_format.total_time_per_side,
                b_total_time_left: game_format.total_time_per_side,
                game_start: 0,
                last_move_time: 0,
                game_end: 0,
                whitekingside: true,
                whitequeenside: true,
                blackkingside: true,
                blackqueenside: true,
                halfmove_clock: 0,
                en_passant_target_x: 88, // 88 for none
                en_passant_target_y: 88, // 88 for none
            };
            
            set!(world, (game));

            // set game state after board squares initiated
            set!(world, (gamestate));

            (game_id)
        }

        fn join_game(ref world: IWorldDispatcher, 
            game_id: u128) -> bool {
            let invitee_address: ContractAddress = starknet::get_caller_address();
            let mut game: Game = get!(world, (game_id), Game);
            let player_manager = PlayerManagerTrait::new(world);
            //let invitee: Player = get!(world, (invitee_address), Player);
            let invitee: Player = player_manager.get(invitee_address);
            assert(invitee.timestamp != 0, Errors::UNREGISTERED_PLAYER);

            assert(game.invitee_address == utils::ZERO(), Errors::GAME_OCCUPIED);
            assert(game.invite_state == InviteState::Awaiting, Errors::GAME_NOT_AWAITING);
            
            // update game
            game.invitee_address = invitee_address;
            game.invite_state = InviteState::InProgress;
            
            // save
            set!(world, (game));

            (true)
        }

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

}