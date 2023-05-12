<template>
  <div>
    <!-- If in game-->
    <div v-if="isInGame">
      <!-- Round Id-->
      <div style="justify-content: center;">
        Round {{ currentRound }}
      </div>
      <!-- Game view -->
      <div style="display:grid; grid-template-columns: 1fr auto 1fr;">
          <!-- Selected move-->
          <div 
            v-if="shouldMove"
            >
                  <p> {{ yourAddress }}</p>
                  <p> {{ yourCurrentPoints }} / 3 </p>
                  <p>{{ yourGameStateToString }}</p>
                  <GameMove v-if="gameState != GameStates.Initial" :move="selectedMove"/>
                  <GameMove v-else :move="0"/>
          </div>
          <!-- Choose move-->
          <div
            v-else
          >
            <p>{{  yourAddress }}</p>
            <p> {{ yourCurrentPoints }} / 3 </p>
            <p>{{ yourGameStateToString }}</p>
            <div 
              style="display: flex; justify-content: center; gap: 10px;"
            >
              <div 
                  :style="{ 'border-color': isRock ? 'yellow' : 'inherit' }" 
                  @click="onRock"
              >
                  <GameMove :move="1"/>
              </div>
              <div 
                  :style="{ 'border-color': isPaper ? 'yellow' : 'inherit' }" 
                  @click="onPaper"
              >
                  <GameMove :move="2"/>
              </div>
              <div 
                  :style="{ 'border-color': isScissors ? 'yellow' : 'inherit' }" 
                  @click="onScissors"
              >
                  <GameMove :move="3"/>
              </div>
            </div>

            <!--red button-->
            <button
              class="card"
              @click="sendMove"
            >   
              Submit
            </button>

          </div>

          <div style="display:flex; height: 100%; align-items: center;">VS</div>

          <!-- Opponent move-->
          <div 
          >
              <div class="flex flex-column">
                  <p> {{ opponentAddress }}</p>
                  <p> {{ previousGameOpponentPoints }} / 3 </p>
                  <p>{{ opponentStateToString }}</p>
                  <GameMove v-if="bothRevealed" :move="opponentMove"/>
                  <GameMove v-else-if="isOpponentMoveSent" :move="5"/>
                  <GameMove v-else :move="4"/>
                  
              </div>
              
          </div>
      </div>

    </div>

    <!-- Should find game-->
    <div v-else>
      <div>
        <!-- Previous Game Result -->
        <div v-if="previousGame">
          <!-- You won text-->
          <h1 v-if="wonLastGame">You won {{ previousGameWager }} ETH</h1>
          <h1 v-else>You lost {{ previousGameWager }} ETH</h1>
          <!-- Points-->
          <h1> {{ previousGamePoints }} : {{ previousGameOpponentPoints }} </h1>
        </div>
        
        <!-- Game buttons -->
        <div v-if="!isRegistering && !isWaiting">
          <div>
            <button v-for="(step, index) in wagerSteps"
                    class="select"
                    :key="step"
                    :class="{ 'highlight-select': index === sliderIndex }"
                    @click="buttonClicked(index)">
              {{ step }} ETH
            </button>
          </div>
        </div>


        <button
          class="card"
          @click="registerGame"
          :disabled="isRegistering || isWaiting"
        >   
          {{ isRegistering ? "Registering" : isWaiting ? "Waiting for opponent" : previousGame ? "Play again" : "Find game" }}
          <a>{{ this.wagerSteps[this.sliderIndex] }} ETH</a>
        </button>
      </div>
    </div>


    


    
    

    <!-- <div v-if="isUserConnected">

      <div v-if="pastGames && pastGames.length">
        <h2>Past games</h2>
        <table>
          <thead>
            <tr>
              <th>Game ID</th>
              <th>Player A</th>
              <th>Player B</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in pastGames" :key="game.gameId">
              <td>{{ game.gameId }}</td>
              <td>{{ game.playerA }} played {{ game.moveA }}</td>
              <td>{{ game.playerB }} played {{ game.moveB }}</td>
              <td>{{ game.outcome }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->
  </div>
</template>

<style>
body {
  height: 100%;
  width: 100%;
}
</style>

<script>
function gameStateToString(state) {
    if(state == GameStates.Waiting)
        return "Waiting"
    if(state == GameStates.Sending)
        return "Sending move"
    if(state == GameStates.Revealing)
        return "Revealing move"
    if(state == GameStates.Revealed)
        return "Revealed move"
    if(state == GameStates.Matched)
        return "Matched with opponent"
    if(state == GameStates.Initial)
        return ""
    if(state == GameStates.Finished)
        return "Game complete"
    
    return ""
    
}

function opponentGameStateToString(state) {
  if(state == GameStates.Waiting)
        return "Waiting"
    if(state == GameStates.Sending)
        return "Sending move"
    if(state == GameStates.Revealing)
        return "Revealing move"
    if(state == GameStates.Revealed)
        return "Revealed move"
    if(state == GameStates.Matched)
        return "Matched with opponent"
    if(state == GameStates.Initial)
        return "Waiting for opponent"
    if(state == GameStates.Finished)
        return "Game complete"
    
    return ""
}
import RPC from "../web3RPC";

import GameMove from "./GameMove.vue";
import { Moves, Outcomes, GameStates } from "../types";
import Hands from "../contracts/Hands.json";
import Web3 from "web3";
import { sha256 } from "js-sha256";

const CONTRACT_ADDRESS = "0x06ba8F4057BaFaB404FBAc95490cC1299B2dfc8B"

//EXAMPLE Game.
// {
//   gameId: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
//   playerA: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
//   playerB: "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb",
//   states: {}

//   betAmount: 1,
//   moveA: 1,
//   moveB: 2,
//   outcome: 2, // 0 = draw, 1 = playerA wins, 2 = playerB wins
// }


function generateRandomString() {
  return Math.random().toString(36).substring(2, 15);
}

export default {
  components: {
      GameMove,
  },
  props: {
    provider: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      initialized: false,
      games: {},
      lastBlockSearched: 0,
      currentGameId: "0",

      selectedMove: "",
      selectedBet: "",
      randomString: "",

      contractInstance: null,
      pastGames: [],

      playerRegisteredEvents: [],
      playerWaitingEvents: [],
      playersMatchedEvents: [],
      moveCommittedEvents: [],
      moveRevealedEvents: [],
      newRoundEvents: [],
      gameOutcomeEvents: [],

      wagerSteps: [0.01, 0.1, 1, 5, 10],
      sliderIndex: 0,

      _lastGameId: -1,
      activeAccount: null,
    };
  },
  computed: {
    getActiveAccount() {        
      return this.activeAccount?.toLowerCase()
    },
    getWeb3() {return new Web3(this.provider);},
    balance() {return this.getBalance();},
    //Game state
    isRock() { return this.selectedMove === Moves.Rock },
    isPaper() { return this.selectedMove === Moves.Paper },
    isScissors() { return this.selectedMove === Moves.Scissors;},
    gameState() {
      console.log("gameState", this.currentGameId, this.games);
      if (!this.games[this.currentGameId ?? "0"]) {
        return GameStates.Initial;
      }
      const currentRound = this.games[this.currentGameId ?? "0"].round;
      return this.games[this.currentGameId ?? "0"].states[currentRound][this.getActiveAccount] ?? GameStates.Matched
    },
    yourGameStateToString() { 
      switch(this.gameState) {
        case GameStates.Initial:
          return "Waiting for opponent"
        case GameStates.Waiting:
          return "Waiting for opponent"
        case GameStates.Sending:
          return "Sending move"
        case GameStates.Sent:
          return "Sent move"
        case GameStates.Revealing:
          return "Revealing move"
        case GameStates.Revealed:
          return "Revealed move"
        case GameStates.Matched:
          return "Send your move"
        case GameStates.Finished:
          return "Game complete"
        default:
          return ""
      }
    },
    isRegistering() { return this.gameState == GameStates.Registering },
    isWaiting() { return this.gameState == GameStates.Waiting },
    isRevealing() { return this.gameState == GameStates.Revealing },
    isRevealed() { return this.gameState == GameStates.Revealed },
    isOpponentMoveRevealed() { return this.opponentState == GameStates.Revealed },
    bothRevealed() { return this.isRevealed && this.isOpponentMoveRevealed },
    isInGame() { return this.gameState == GameStates.Sending || this.gameState == GameStates.Revealing || this.gameState == GameStates.Revealed || this.gameState == GameStates.Matched || this.gameState == GameStates.Sent },
    isMoveSent() { return this.gameState == GameStates.Sent || this.gameState == GameStates.Revealing || this.gameState == GameStates.Revealed},
    isOpponentMoveSent() { return this.opponentState == GameStates.Sent || this.opponentState == GameStates.Revealing || this.opponentState == GameStates.Revealed},
    isGameFinished() { return this.gameState == GameStates.Finished},
    currentRound() { return this.games[this.currentGameId ?? "0"].round },
    previousGame() { 
      console.log("previousGame", this._lastGameId, this.games)
      return this._lastGameId != -1 ? this.games[this._lastGameId] : null
    },
    previousGameWager() { return this.previousGame?.bet ?? 0},
    previousGamePoints() { return this.previousGame?.points[this.getActiveAccount] ?? 0},
    yourCurrentPoints() { return this.games[this.currentGameId]?.points[this.getActiveAccount?.toLowerCase()] ?? 0},
    previousGameOpponentPoints() { return this.previousGame?.points[this.opponentAddress?.toLowerCase()] ?? 0},
    wonLastGame() { return this.previousGamePoints > this.previousGameOpponentPoints},
    yourAddress() { return this.getActiveAccount},
    yourMove() { return this.selectedMove },
    opponentAddress(){
      const playerA = this.games[this.currentGameId]?.playerA?.toLowerCase()
      const playerB = this.games[this.currentGameId]?.playerB?.toLowerCase()
      return playerA === this?.getActiveAccount?.toLowerCase() ? playerB : playerA
    },
    opponentMove() {
      const opponentAddress = this.opponentAddress?.toLowerCase()
      const currentGameId = this.currentGameId
      return this.games[currentGameId?.toLowerCase()]?.moves[this.currentRound]?.[opponentAddress?.toLowerCase()] ?? Moves.None
    },
    opponentState() {
      const opponentAddress = this.opponentAddress?.toLowerCase()
      const currentGameId = this?.currentGameId
      const currentRound = this.games[this.currentGameId ?? "0"]?.round ?? 0
      console.log("opponentState", this.games[currentGameId?.toLowerCase()]?.states[currentRound][opponentAddress?.toLowerCase()])
      return this.games[currentGameId?.toLowerCase()]?.states[currentRound][opponentAddress?.toLowerCase()] ?? GameStates.Initial
    },

    opponentStateToString() { 
      switch(this.opponentState) {
        case GameStates.Initial:
          return "Choosing move"
        case GameStates.Registering:
          return "Registering"
        case GameStates.Waiting:
          return "Waiting"
        case GameStates.Matched:
          return "Choosing move"
        case GameStates.Sending:
          return "Sending"
        case GameStates.Sent:
          return "Sent"
        case GameStates.Revealing:
          return "Revealing"
        case GameStates.Revealed:
          return "Revealed"
        case GameStates.Finished:
          return "Finished"
        default:
          return "Unknown"
      }
    },


    //Seamless transaction handler
    //Reveal move when both players have successfully sent their move
    //And not revealing move yet
    shouldReveal(){
      console.log("shouldReveal", this.isMoveSent, this.isOpponentMoveSent, this.isGameFinished, this.isRevealing)
      return this.isMoveSent && this.isOpponentMoveSent && !this.isGameFinished && !this.isRevealing && this.initialized && !this.isRevealed
    },
    //should move when in a game and has not sent move yet
    shouldMove(){
      return this.isMoveSent && this.isInGame
    }
  },
  mounted() {
    console.log("provider", this.provider)
    this.initialized = false
    this.fetchPastGames();
    this.subscribeToEvents();

    // Load the last sentMove and betAmount from the localStorage
    const lastSentMove = localStorage.getItem("lastSentMove");
    const lastRandomString = localStorage.getItem("lastRandomString");
    const lastBetAmount = localStorage.getItem("lastBetAmount");

    if (lastSentMove) {
      this.selectedMove = lastSentMove;
    }

    if (lastBetAmount) {
      this.selectedBet = lastBetAmount;
      this.sliderIndex = this.wagerSteps.indexOf(parseFloat(lastBetAmount));
    }

    if (lastRandomString) {
      this.randomString = lastRandomString;
    }

    this.initialized = true

    //set active account
    this.getAccount()
    
  },
  watch:{
    games: {
      handler(newValue, oldValue) {
        console.log("yourGameState", gameStateToString(this.gameState));
        console.log("games changed", this.games[this.currentGameId]);
      },
      deep: true
    },
    shouldReveal: {
      handler(newValue, oldValue) {
        if (newValue) {
          console.log("is calling revealMove");
          this.revealMove();
        }
      },
      deep: true
    },
  },
  methods: {
    onRock() {
      this.selectedMove = Moves.Rock;
    },
    onPaper() {
      this.selectedMove = Moves.Paper;
    },
    onScissors() {
      this.selectedMove = Moves.Scissors;
    },
    buttonClicked(index) {
      this.sliderIndex = index;
      this.sliderValueChanged();
    },
    sliderValueChanged() {
      this.selectedBet = this.wagerSteps[this.sliderIndex];
    },
    async getAccount() {
      const accounts = await this.getWeb3.eth.getAccounts();
      console.log("accounts", accounts);
      this.activeAccount = accounts[0];
      return accounts[0];
    },
    async setContract() {
      this.contractInstance = new this.getWeb3.eth.Contract(
        Hands.abi,
        CONTRACT_ADDRESS,
      );
      console.log("contractInstance", this.contractInstance);
    },

    async getBlockNumber() {
      return await this.getWeb3.eth.getBlockNumber();
    },
    async getContract() {
      if (!this.contractInstance) {
        await this.setContract();
      }
      return this.contractInstance;
    },

    createGame(gameId, playerA= this.getActiveAccount){
      this.games[gameId] = {
        gameId,
        playerA: playerA.toLowerCase(),
        playerB: "",
        states: {
            [0]: {
                [playerA.toLowerCase()]: GameStates.Initial,
            }
        },
        bet: 0,
        moves: {
          [0]: {
            [playerA.toLowerCase()]: Moves.None,
          },
        },
        outcome: Outcomes.None,
        points: {
          [playerA.toLowerCase()]: 0,
        },
        round: 0,
      };
    },

    setLastGameId(gameId) {
      this._lastGameId = parseInt(gameId);
    },

    isNewestGameId(gameId) {
      return parseInt(gameId) >= this._lastGameId;
    },

    getGame(gameId) {
      return this.games[gameId]
    },

    getGameCurrentRound(gameId) {
      return this.games[gameId].length - 1;
    },
    
    //Whenever a new game is registered
    async handleRegisterEvent(event, userAddress) {
      console.log("PlayerRegistered event:", event.returnValues);
      const { gameId, playerAddress } = event.returnValues;
      
      //check if gameId is in games
      if (!this.getGame(gameId, 0)) 
        this.createGame(gameId, playerAddress);
      
      //set players state to waiting
      this.getGame(gameId).states[0][playerAddress.toLowerCase()] = GameStates.Waiting;    
      
      //set currentGameId if user is in game
      if (playerAddress.toLowerCase() === userAddress.toLowerCase()) {
        if (this.isNewestGameId(gameId)){
          this.currentGameId = gameId;
          console.log("setting currentGameId", this.currentGameId);
        }
        this.setLastGameId(gameId);
      }
    },

    //Whenever has created a match and is waiting for another player to join
    //We set the bet value and the state to waiting
    handleWaitingEvent(event) {
      console.log("PlayerWaiting event:", event.returnValues);
      const { gameId, bet } = event.returnValues;

      //check if gameId is in games
      if (!this.getGame(gameId, 0))
        this.createGame(gameId);
      
      //set players state to waiting
      const playerA = this.getGame(gameId).playerA.toLowerCase()
      this.getGame(gameId).states[0][playerA] = GameStates.Waiting;

      //set bet amount
      this.getGame(gameId).bet = bet;
    },


    handlePlayersMatchedEvent(event) {
      console.log("PlayersMatched event:", event.returnValues);
      const { gameId, playerA, playerB } = event.returnValues;

      //check if gameId is in games
      if (!this.getGame(gameId))
        this.createGame(gameId, playerA);
      
      //set player values
      this.getGame(gameId).playerA = playerA.toLowerCase()
      this.getGame(gameId).playerB = playerB.toLowerCase()

      //set player states
      this.getGame(gameId).states[0][playerA.toLowerCase()] = GameStates.Matched;
      this.getGame(gameId).states[0][playerB.toLowerCase()] = GameStates.Matched;
    },

    handleMoveSentEvent(event) {
      console.log("MoveSent event:", event.returnValues);
      const { gameId, round, playerAddress } = event.returnValues;

      //check if gameId is in games
      if (!this.getGame(gameId))
        this.createGame(gameId, playerAddress);

      //Check if round is in moves
      if (!this.getGame(gameId).moves[round])
        this.getGame(gameId).moves[round] = {};
      
      //Check if round is in states
      if (!this.getGame(gameId).states[round])
        this.getGame(gameId).states[round] = {};

      //set player state
      this.getGame(gameId).states[round][playerAddress.toLowerCase()] = GameStates.Sent;
    },

    handleRevealedEvent(event) {
      console.log("MoveRevealed event:", event.returnValues);
      const { gameId, round, playerAddress, move } = event.returnValues;
      
      //check if gameId is in games
      if (!this.getGame(gameId))
        this.createGame(gameId, playerAddress);
      
      //Check if round is in moves
      if (!this.getGame(gameId).moves[round])
        this.getGame(gameId).moves[round] = {};

      //Check if round is in states
      if (!this.getGame(gameId).states[round])
        this.getGame(gameId).states[round] = {};

      //set player move
      this.games[gameId].moves[round][playerAddress.toLowerCase()] = move;

      //set player state
      this.games[gameId].states[round][playerAddress.toLowerCase()] = GameStates.Revealed;
    },

    //Handle new round event
    handleNewRoundEvent(event) {
      console.log("NewRound event:", event.returnValues);
      const { gameId, round, pointsA, pointsB } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId);

      //Check if round is in states
      if (!this.games[gameId].states[round])
        this.games[gameId].states[round] = {};

      //Check if round is in moves
      if (!this.games[gameId].moves[round])
        this.games[gameId].moves[round] = {};

      //set round
      this.games[gameId].round = round;

      //set points
      this.games[gameId].points[this.games[gameId].playerA.toLowerCase()] = pointsA;
      this.games[gameId].points[this.games[gameId].playerB.toLowerCase()] = pointsB;

      //reset game state to matched if not revealed or sent
      // this.games[gameId].states[round][this.games[gameId].playerA.toLowerCase()] = GameStates.Matched;
      
      // this.games[gameId].states[round][this.games[gameId].playerB.toLowerCase()] = GameStates.Matched;
      
      
    },
    
    handleOutcomeEvent(event) {
      console.log("GameOutcome event:", event.returnValues);
      const { gameId, outcome } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId);

      //set outcome
      this.games[gameId].outcome = outcome;

      //reset current gameId
      if(this.isNewestGameId(gameId)){
        this.currentGameId = "0";
        this.createGame("0");
        this.setLastGameId(gameId);
      }
``
      
    },

    async subscribeToEvents() {
  const contract = await this.getContract();
  const userAddress = await this.getAccount();

  console.log("Polling for events...");
  console.log("contract:", contract);

  const eventNames = [
    "PlayerRegistered",
    "PlayerWaiting",
    "PlayersMatched",
    "MoveCommitted",
    "MoveRevealed",
    "NewRound",
    "GameOutcome",
  ];

  const eventHandlers = {
    PlayerRegistered: this.handleRegisterEvent,
    PlayerWaiting: this.handleWaitingEvent,
    PlayersMatched: this.handlePlayersMatchedEvent,
    MoveCommitted: this.handleMoveSentEvent,
    MoveRevealed: this.handleRevealedEvent,
    NewRound: this.handleNewRoundEvent,
    GameOutcome: this.handleOutcomeEvent,
  };

  const pollingInterval = 1000; // Poll every 5 seconds

  let lastBlockChecked = await this.getBlockNumber()

  setInterval(async () => {
    const currentBlock = await this.getBlockNumber();

    for (const eventName of eventNames) {
      const events = await contract.getPastEvents(eventName, {
        fromBlock: lastBlockChecked + 1,
        toBlock: currentBlock,
      });

      events.forEach((event) => {
        console.log(`New ${eventName} event detected:`, event);
        eventHandlers[eventName].call(this, event, userAddress);
      });
    }

    lastBlockChecked = currentBlock;
  }, pollingInterval);
},


    async getActiveGameId() {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          Hands.abi,
          CONTRACT_ADDRESS
        );
      }

      try {
        const accounts = await this.getWeb3.eth.getAccounts();
        const gameId = await this.contractInstance.methods
          .playerGame(accounts[0])
          .call({ from: accounts[0] });
        return gameId;
      } catch (error) {
        //console.error("Error getting active gameId:", error);
      }
    },

    //Join or create a new game
    async registerGame() {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          Hands.abi,
          CONTRACT_ADDRESS
        );
      }

      if (!this.selectedBet) {
        alert("Please select a bet amount.");
        return;
      }

      try {
        console.log("Registering game...", this.currentGameId);
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0")
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Registering;

        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;

        const betInWei = this.getWeb3.utils.toWei(this.selectedBet.toString(), "ether");

        const result = await this.contractInstance.methods
          .register()
          .send({ from: accounts[0], value: betInWei, gasPrice, gasLimit });
        

        localStorage.setItem("lastBetAmount", this.selectedBet);

        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[0][this.getActiveAccount] = GameStates.Initial;

        //revert selected move
        console.error("Error registering game:", error);
      }
    },

    //Send move to the contract
    async sendMove(){
      const prevState = this.gameState;
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          Hands.abi,
          CONTRACT_ADDRESS
        );
      }

      if (!this.selectedBet) {
        alert("Please select a bet amount.");
        return;
      }

      try {
        console.log("Sending game...", this.currentGameId);
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0")
        this.games[this.currentGameId ?? "0"].states[this.currentRound][this.getActiveAccount] = GameStates.Sending;
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
        this.randomString = generateRandomString(); // Save randomString
        const encryptedMove =
          "0x" + sha256(this.selectedMove + this.randomString);
        console.log("clearMove:", this.selectedMove + this.randomString);
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;

        const result = await this.contractInstance.methods
          .commit(parseInt(this.currentGameId), encryptedMove)
          .send({ from: accounts[0], gasPrice, gasLimit });
        console.log("Game registered:", result);

        // Store the last sentMove and betAmount in the localStorage
        localStorage.setItem("lastSentMove", this.selectedMove);
        localStorage.setItem("lastRandomString", this.randomString);
        
        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = prevState

        //revert selected move
        this.selectedMove = "";
        console.error("Error registering game:", error);
      }
    },

    async revealMove() {
      const prevState = this.gameState;
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          Hands.abi,
          CONTRACT_ADDRESS
        );
      }

      try {
        // Update the gameState to Revealing
        if (!this.games[this.currentGameId]) 
          this.createGame(this.currentGameId)
        this.games[this.currentGameId].states[this.getActiveAccount] = GameStates.Revealing;

        const accounts = await this.getWeb3.eth.getAccounts();
        const clearMove = `${this.selectedMove}${this.randomString}`; // Use saved randomString
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;
        const result = await this.contractInstance.methods
          .reveal(this.currentGameId, clearMove)
          .send({ from: accounts[0], gasPrice, gasLimit });

        //console.log("Move revealed:", result);

        // Automatically update the gameId to get the outcome

        
        console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //Update the gameState to Matched
        if (!this.games[this.currentGameId]) 
          this.createGame(this.currentGameId)
        this.games[this.currentGameId].states[this.getActiveAccount] = prevState
        console.error("Error revealing move:", error);
      }
    },
    async getGameOutcome() {
      if (!this.contractInstance) {
        this.contractInstance = new this.getWeb3.eth.Contract(
          Hands.abi,
          CONTRACT_ADDRESS
        );
      }

      try {
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;
        const result = await this.contractInstance.methods
          .getOutcome(this.currentGameId)
          .call({ from: accounts[0], gasPrice, gasLimit });
        console.log("Game outcome:", result);
        //this.gameInfo.outcome = result;
      } catch (error) {
        console.error("Error getting game outcome:", error);
      }
    },

    async fetchPlayerRegisteredEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayerRegistered", {
        fromBlock,
      });
      this.playerRegisteredEvents = events;
      console.log("playerRegisteredEvents:", this.playerRegisteredEvents.map(e => e.returnValues));
    },

    async fetchPlayerWaitingEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayerWaiting", {
        fromBlock,
      });
      this.playerWaitingEvents = events;
      console.log("playerWaitingEvents:", this.playerWaitingEvents.map(e => e.returnValues));
    },

    async fetchPlayersMatchedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("PlayersMatched", {
        fromBlock,
      });
      this.playersMatchedEvents = events;
      console.log("playersMatchedEvents:", this.playersMatchedEvents.map(e => e.returnValues));
    },

    async fetchPlayersMoveCommittedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("MoveCommitted", {
        fromBlock,
      });
      this.moveCommittedEvents = events;
      console.log("moveCommittedEvents:", this.moveCommittedEvents.map(e => e.returnValues));
    },

    async fetchMoveRevealedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("MoveRevealed", {
        fromBlock,
      });
      this.moveRevealedEvents = events;
      console.log("moveRevealedEvents:", this.moveRevealedEvents.map(e => e.returnValues));
    },

    async fetchNewRoundEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("NewRound", {
        fromBlock,
      });
      this.newRoundEvents = events;
      console.log("newRoundEvents:", this.newRoundEvents.map(e => e.returnValues));
    },

    async fetchGameOutcomeEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("GameOutcome", {
        fromBlock,
      });
      this.gameOutcomeEvents = events;
      console.log("gameOutcomeEvents:", this.gameOutcomeEvents.map(e => e.returnValues));
    },


    
    async processEvents() {
      // Get the current user's address
      const userAddress = await this.getAccount();

      // Iterate over the playerRegisteredEvents
      // Call handlePlayerRegisteredEvent for each event
      for (const event of this.playerRegisteredEvents) {
        this.handleRegisterEvent(event, userAddress);
      }

      // Iterate over the playerWaitingEvents
      // Call handlePlayerWaitingEvent for each event
      for (const event of this.playerWaitingEvents) {
        this.handleWaitingEvent(event)
      }

      // Iterate over the playersMatchedEvents
      // Call handlePlayersMatchedEvent for each event
      for (const event of this.playersMatchedEvents) {
        this.handlePlayersMatchedEvent(event)
      }

      // Iterate over the moveCommittedEvents
      // Call handleMoveSentEvent for each event
      for (const event of this.moveCommittedEvents) {
        this.handleMoveSentEvent(event)
      }

      // Iterate over the moveRevealedEvents
      // Call handleMoveRevealedEvent for each event
      for (const event of this.moveRevealedEvents) {
        this.handleRevealedEvent(event)
      }

      // Iterate over the newRoundEvents
      // Call handleNewRoundEvent for each event
      for (const event of this.newRoundEvents) {
        this.handleNewRoundEvent(event)
      }

      // Iterate over the gameOutcomeEvents
      // Call handleGameOutcomeEvent for each event
      for (const event of this.gameOutcomeEvents) {
        this.handleOutcomeEvent(event)
      }
    },

    async fetchPastGames() {
      const fromBlock = 0;

      await this.fetchPlayerRegisteredEvents(fromBlock);
      await this.fetchPlayerWaitingEvents(fromBlock);
      await this.fetchPlayersMatchedEvents(fromBlock);
      await this.fetchPlayersMoveCommittedEvents(fromBlock);
      await this.fetchMoveRevealedEvents(fromBlock);
      await this.fetchNewRoundEvents(fromBlock);
      await this.fetchGameOutcomeEvents(fromBlock);


      this.processEvents();
    },
  },
};
</script>
