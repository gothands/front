export const Moves = {
    None: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3,
    LoadingMark: 4,
    CheckMark: 5,
};
  
export const Outcomes = {
    None: 0,
    PlayerA: 1,
    PlayerB: 2,
    Draw: 3,
    PlayerALeft: 4,
    PlayerBLeft: 5,
    PlayerATimeout: 6,
    PlayerBTimeout: 7,
    BothTimeout: 8,
    Cancelled: 9,
};
  
export const GameStates = {
    Initial: 0, //
    Registering: 1, //Searching for a match
    Waiting: 2, //Waiting to be matched
    Matched: 3, //Matched with another player
    Sending: 4, //Sending move
    Sent: 5, //Sent move
    Revealing: 6, //Revealing move to opponent
    Revealed: 7, //Revealed move to opponent
    Finished: 8, //Both players have revealed their moves. Game over
};


export const CHAIN_ID_MAINNET = "0x1"
export const CHAIN_ID_TESTNET = "0x118"
export const CHAIN_ID_LOCALHOST = "0x10e"
export const CHAIN_ID_LOCALHOST_HARDHAT = "0x7A69"
export const CHAIN_ID_ARBITRUM_GOERLI = "0x66eed"
export const CHAIN_ID_ARBITRUM_NOVA = "0xa4ba"

export const RPC_URLS = {
  [CHAIN_ID_MAINNET]: "https://cloudflare-eth.com",
  [CHAIN_ID_TESTNET]: "https://testnet.era.zksync.dev",
  [CHAIN_ID_LOCALHOST]: "http://localhost:3050/",
  [CHAIN_ID_LOCALHOST_HARDHAT]: "http://localhost:8545",
  [CHAIN_ID_ARBITRUM_GOERLI]: "https://goerli-rollup.arbitrum.io/rpc",
  [CHAIN_ID_ARBITRUM_NOVA]: "https://nova.arbitrum.io/rpc",

};

export const CURRENT_CHAIN_ID = CHAIN_ID_ARBITRUM_GOERLI;

export const READ_PROVIDER_URL = "https://goerli-rollup.arbitrum.io/rpc"

export const DEFAULT_FETCH_BLOCK = 34700240;
export const APPLICATION_FEE = 0.05;

export const MAX_MOVE_TIME = 60*2;