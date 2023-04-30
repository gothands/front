<script setup>
import { Moves, Outcomes, GameStates } from "../types";

function truncateAddress(address) {
  if (!address || address.length < 10) {
    return address;
  }
  const prefix = address.slice(0, 6);
  const suffix = address.slice(-4);
  return `${prefix}...${suffix}`;
}

function moveToString(move) {
  switch (parseInt(move)) {
    case Moves.Rock:
      return "Rock";
    case Moves.Paper:
      return "Paper";
    case Moves.Scissors:
      return "Scissors";
    default:
      return "None";
  }
}

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

</script>
<template>
  <div style="height:90vh; display: flex; flex-direction: column; justify-content: center ;">
    <!-- <p v-if="isUserConnected">
      <strong>Your balance is: {{ balance }} ETH</strong>
    </p> -->

    
    <!-- If in game-->
    <div v-if="isInGame">
      <!-- Round Id-->
      <div class="flex justify-center" style="justify-content: center;">
        Round {{ currentRound }}
      </div>
      <!-- Game view -->
      <div class="flex justify-center gap-4" style="width: 100%; height: 100%; align-items: center;">
          <!-- Selected move-->
          <div 
            v-if="selectedMove != Moves.None && gameState != GameStates.Initial"
            style="flex-direction: column; width: 500px; align-items: center; gap: 50px;"
            >
                  <p>{{ gameStateToString(gameState) }}</p>
                  <GameMove v-if="gameState != GameStates.Initial" :move="selectedMove"/>
                  <GameMove v-else :move="Moves.None"/>
          </div>
          <!-- Choose move-->
          <div
            v-else
            class="flex flex-col"
            style="flex-direction: column; width: 500px; align-items: center; gap: 50px;"
          >
            <p>{{  truncateAddress(yourAddress) }}</p>
            <p>Select a move</p>
            <div 
              class="flex justify-evenly gap-4"
              style="width: 100%;"
            >
              <div 
                  class="p-6 bg-white border-2 border-rose-600 rounded-lg shadow hover:bg-gray"
                  style="border: 1px solid #e53e3e;"
                  :style="{ 'border-color': isRock ? 'yellow' : 'inherit' }" 
                  @click="onRock"
              >
                  <GameMove :move="Moves.Rock"/>
              </div>
              <div 
                  class="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray"
                  style="border: 1px solid #e53e3e;"
                  :style="{ 'border-color': isPaper ? 'yellow' : 'inherit' }" 
                  @click="onPaper"
              >
                  <GameMove :move="Moves.Paper"/>
              </div>
              <div 
                  class="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray"
                  style="border: 1px solid #e53e3e;"
                  :style="{ 'border-color': isScissors ? 'yellow' : 'inherit' }" 
                  @click="onScissors"
              >
                  <GameMove :move="Moves.Scissors"/>
              </div>
            </div>

            <!--red button-->
            <button
              style="background-color: #e53e3e; color: white; border: 1px solid #e53e3e;"
              @click="registerGame"
            >   
              Submit
            </button>

          </div>

          <h1>VS</h1>

          <!-- Opponent move-->
          <div 
            class="p-20 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray"
            style="width: 50%;"
          >
              <div class="flex flex-column">
                  <p> {{ truncateAddress(opponentAddress) }}</p>
                  <p>{{ gameStateToString(opponentState) }}</p>
                  <GameMove v-if="opponentMove" :move="opponentMove"/>
                  <GameMove v-else :move="Moves.None"/>
              </div>
              
          </div>
      </div>

    </div>

    <!-- Should find game-->
    <div v-else>
      <div class="flex justify-center">
        <!-- Previous Game Result -->
        <div v-if="previousGame">
          <!-- You won text-->
          <h1 v-if="wonLastGame">You won {{ previousGameWager }} ETH</h1>
          <h1 v-else>You lost {{ previousGameWager }} ETH</h1>
          <!-- Points-->
          <h1> {{ previousGamePoints }} : {{ previousGameOpponentPoints }} </h1>
        </div>
        <!-- Game slider -->
        <div class="w-full">
          <div class="flex justify-between text-gray-800">
            <div v-for="step in wagerSteps" :key="step">{{ step }} ETH</div>
          </div>
            <input type="range"
                  :min="0"
                  :max="wagerSteps.length - 1"
                  v-model="sliderIndex"
                  @input="sliderValueChanged"
                  class="slider w-100" />
        </div>

        <button
          style="background-color: #e53e3e; color: white; border: 1px solid #e53e3e;"
          @click="registerGame"
          :disabled="isRegistering || isWaiting"
        >   
          {{ isRegistering ? "Registering" : isWaiting ? "Waiting for opponent" : previousGame ? "Play again" : "Find game" }}
        </button>
      </div>
    </div>


    


    
    

    <div v-if="isUserConnected">

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
    </div>
  </div>
</template>

<style>
body {
  height: 100%;
  width: 100%;
}
</style>

<script>
import GameMove from "../components/GameMove.vue";
import { Moves, Outcomes, GameStates } from "../types";
import Hands from "../contracts/Hands.json";
import Web3 from "web3";
import { mapGetters } from "vuex";
import { sha256 } from "js-sha256";

const CONTRACT_ADDRESS = "0x111C3E89Ce80e62EE88318C2804920D4c96f92bb"

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
      GameMove
  },
  data() {
    return {
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
    };
  },
  computed: {
    //store
    ...mapGetters("accounts", [
      "getChainName",
      "isUserConnected",
      "getActiveBalanceEth",
      "getWeb3",
      "getActiveAccount",
    ]),

    //funds
    balance(){
      return this.getActiveBalanceEth;
    },

    //Game state
    isRock() { return this.selectedMove === Moves.Rock },
    isPaper() { return this.selectedMove === Moves.Paper },
    isScissors() { return this.selectedMove === Moves.Scissors;},
    gameState() {
      console.log("gameState", this.currentGameId, this.games);
      //make sure everything exists, else default to GameStates.Initial
      if (!this.games[this.currentGameId ?? "0"]) {
        return GameStates.Initial;
      }
      //return game state
      return this.games[this.currentGameId ?? "0"].states[this.getActiveAccount];
    },
    isRegistering() { return this.gameState == GameStates.Registering },
    isWaiting() { return this.gameState == GameStates.Waiting },
    isInGame() { return this.gameState == GameStates.Sending || this.gameState == GameStates.Revealing || this.gameState == GameStates.Revealed || this.gameState == GameStates.Matched || this.gameState == GameStates.Sent },
    isGameFinished() { return this.gameState == GameStates.Finished},
    currentRound() { return this.games[this.currentGameId ?? "0"].round ?? 0},
    previousGame() { return this.games[this._lastGameId ?? undefined]},
    previousGameWager() { return this.previousGame?.bet ?? 0},
    previousGamePoints() { return this.previousGame?.points[this.getActiveAccount] ?? 0},
    previousGameOpponentPoints() { return this.previousGame?.points[this.opponentAddress] ?? 0},
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
      return this.games[currentGameId?.toLowerCase()]?.states[opponentAddress?.toLowerCase()] ?? GameStates.Initial
    }
  },
  mounted() {
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
  },
  watch:{
    games: {
      handler(newValue, oldValue) {
        console.log("games changed", newValue);
      },
      deep: true
    }
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
    sliderValueChanged() {
      this.selectedBet = this.wagerSteps[this.sliderIndex];
    },
    async getAccount() {
      const accounts = await this.getWeb3.eth.getAccounts();
      console.log("accounts", accounts);
      return accounts[0];
    },
    async setContract() {
      this.contractInstance = new this.getWeb3.eth.Contract(
        Hands.abi,
        CONTRACT_ADDRESS
      );
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
          [playerA.toLowerCase()]: GameStates.Initial,
        },
        bet: 0,
        moves: {
          [playerA.toLowerCase()]: Moves.None,
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
    
    //Whenever a new game is registered
    async handleRegisterEvent(event, userAddress) {
      console.log("PlayerRegistered event:", event.returnValues);
      const { gameId, playerAddress } = event.returnValues;
      
      //check if gameId is in games
      if (!this.games[gameId]) 
        this.createGame(gameId, playerAddress);
      
      //set players state to waiting
      this.games[gameId].states[playerAddress.toLowerCase()] = GameStates.Waiting;    
      
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
      if (!this.games[gameId])
        this.createGame(gameId);
      
      //set players state to waiting
      const playerA = this.games[gameId].playerA.toLowerCase()
      this.games[gameId].states[playerA] = GameStates.Waiting;

      //set bet amount
      this.games[gameId].bet = bet;
    },


    handlePlayersMatchedEvent(event) {
      console.log("PlayersMatched event:", event.returnValues);
      const { gameId, playerA, playerB } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId, playerA);
      
      //set player values
      this.games[gameId].playerA = playerA.toLowerCase()
      this.games[gameId].playerB = playerB.toLowerCase()

      //set player states
      this.games[gameId].states[playerA.toLowerCase()] = GameStates.Matched;
      this.games[gameId].states[playerB.toLowerCase()] = GameStates.Matched;
    },

    handleMoveSentEvent(event) {
      console.log("MoveSent event:", event.returnValues);
      const { gameId, playerAddress } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId, playerAddress);

      //set player state
      this.games[gameId].states[playerAddress.toLowerCase()] = GameStates.Sent;
    },

    handleRevealedEvent(event) {
      console.log("MoveRevealed event:", event.returnValues);
      const { gameId, playerAddress, move } = event.returnValues;
      
      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId, playerAddress);

      //get round of game
      const round = this.games[gameId].round;

      //set player move
      this.games[gameId].moves[round][playerAddress.toLowerCase()] = move;

      //set player state
      this.games[gameId].states[playerAddress.toLowerCase()] = GameStates.Revealed;
    },

    //Handle new round event
    handleNewRoundEvent(event) {
      console.log("NewRound event:", event.returnValues);
      const { gameId, round, pointsA, pointsB } = event.returnValues;

      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId);

      //set round
      this.games[gameId].round = round;

      //set points
      this.games[gameId].points[this.games[gameId].playerA.toLowerCase()] = pointsA;
      this.games[gameId].points[this.games[gameId].playerB.toLowerCase()] = pointsB;
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

      //Listen to player registered events
      contract.events.PlayerRegistered({}, (error, event) => {
        if (error) {
          console.error("Error in PlayerRegistered event:", error);
          return;
        }

        this.handleRegisterEvent(event, userAddress);
      });

      //Listen to player waiting events
      contract.events.PlayerWaiting({}, (error, event) => {
        if (error) {
          console.error("Error in PlayerWaiting event:", error);
          return;
        }

        this.handleWaitingEvent(event);
      });

      //Listen to players matched events
      contract.events.PlayersMatched({}, (error, event) => {
        if (error) {
          console.error("Error in PlayersMatched event:", error);
          return;
        }

        this.handlePlayersMatchedEvent(event);
      });

      //Listen to move sent events
      contract.events.MoveCommitted({}, (error, event) => {
        if (error) {
          console.error("Error in MoveSent event:", error);
          return;
        }

        this.handleMoveSentEvent(event);
      });

      //Listen to move revealed events
      contract.events.MoveRevealed({}, (error, event) => {
        if (error) {
          console.error("Error in MoveRevealed event:", error);
          return;
        }

        this.handleRevealedEvent(event);
      });

      //Listen to new round events
      contract.events.NewRound({}, (error, event) => {
        if (error) {
          console.error("Error in NewRound event:", error);
          return;
        }

        this.handleNewRoundEvent(event);
      });

      //Listen to game outcome events
      contract.events.GameOutcome({}, (error, event) => {
        if (error) {
          console.error("Error in GameOutcome event:", error);
          return;
        }
        
        this.handleOutcomeEvent(event);
      });
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
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Registering;

        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;

        const betInWei = this.getWeb3.utils.toWei(this.selectedBet, "ether");

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
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Initial;

        //revert selected move
        console.error("Error registering game:", error);
      }
    },

    //Send move to the contract
    async sendMove(){
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
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Sending;
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
        this.randomString = generateRandomString(); // Save randomString
        const encryptedMove =
          "0x" + sha256(this.selectedMove + this.randomString);
        console.log("clearMove:", this.selectedMove + this.randomString);
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;

        const result = await this.contractInstance.methods
          .commit(encryptedMove)
          .send({ from: accounts[0], gasPrice, gasLimit });
        //console.log("Game registered:", result);

        // Store the last sentMove and betAmount in the localStorage
        localStorage.setItem("lastSentMove", this.selectedMove);
        localStorage.setItem("lastRandomString", this.randomString);
        
        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Initial;

        //revert selected move
        this.selectedMove = "";
        console.error("Error registering game:", error);
      }
    },

    async revealMove() {
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
        this.games[this.currentGameId].states[this.getActiveAccount] = GameStates.Matched;
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
      await this.fetchPlayersMatchedEvents(fromBlock);
      await this.fetchMoveRevealedEvents(fromBlock);
      await this.fetchGameOutcomeEvents(fromBlock);

      this.processEvents();
    },
  },
};
</script>
