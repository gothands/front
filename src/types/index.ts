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
    Cancelled: 4,
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