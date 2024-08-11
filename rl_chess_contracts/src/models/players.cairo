use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

#[derive(Serde, Copy, Drop, PartialEq, Introspect)]
enum ProfilePicType {
    Undefined,  // 0
    Native,    // 1
    External,   // 2
    // StarkId,    // stark.id (ipfs?)
    // ERC721,     // Owned erc-721 (hard to validate and keep up to date)
    // Discord,    // Linked account (had to be cloned, or just copy the url)
}

//---------------------
//
// #[derive(Copy, Drop, Serde)] // ByteArray is not copiable!
#[derive(Clone, Drop, Serde)]   // pass to functions using duelist.clone()
#[dojo::model]
struct Player {
    #[key]
    address: ContractAddress,   // wallet address
    //-----------------------
    name: felt252,
    profile_pic_type: ProfilePicType,
    profile_pic_uri: ByteArray,     // can be anything
    timestamp: u64,                 // date registered
}



//----------------------------------
// Manager
//

#[derive(Copy, Drop)]
struct PlayerManager {
    world: IWorldDispatcher,
    //token_dispatcher: IERC721Dispatcher,
}


#[generate_trait]
impl PlayerManagerTraitImpl of PlayerManagerTrait {
    fn new(world: IWorldDispatcher) -> PlayerManager {

        // 1. get the NFT contract address for the token to duelist
        // let contract_address: ContractAddress = world.token_duelist_address();
        // assert(contract_address.is_non_zero(), 'DuelistManager: null token addr');

        // 2. get the dispatcher (functional) for the NFT contract
        // let token_dispatcher = ierc721(contract_address);

        //(DuelistManager { world, token_dispatcher })
        (PlayerManager { world })
    }

    // to get the Player model via key
    fn get(self: PlayerManager, address: ContractAddress) -> Player {
        get!(self.world, (address), Player)
    }

    fn set(self: PlayerManager, player: Player) {
        set!(self.world, (player));
    }

    // fn get_token_dispatcher(self: PlayerManager) -> IERC721Dispatcher {
    //     (self.token_dispatcher)
    // }

    // fn owner_of(self: PlayerManager, player_id: u128) -> ContractAddress {
    //     (self.token_dispatcher.owner_of(player_id.into()))
    // }

    // fn exists(self: PlayerManager, player_id: u128) -> bool {
    //     (self.owner_of(player_id).is_non_zero())
    // }

    // fn is_owner_of(self: DuelistManager, address: ContractAddress, player_id: u128) -> bool {
    //     (self.owner_of(player_id)  == address)
    // }
}
