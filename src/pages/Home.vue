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
</script>
<template>
  <div>
    <p v-if="isUserConnected">
      <strong>Your balance is: {{ balance }} ETH</strong>
    </p>

    <!-- Current game id -->
    <h2>{{ currentGameId }}</h2>

    <!-- Game status -->
    <h4 v-if="gameState === GameStates.Initial">Play</h4>
    <h4 v-else-if="gameState === GameStates.Sending">Sending move</h4>
    <h4 v-else-if="gameState === GameStates.Waiting">Waiting for opponent</h4>
    <h4 v-else-if="gameState === GameStates.Matched">Opponent matched</h4>
    <h4 v-else-if="gameState === GameStates.Revealing">Revealing move</h4>
    <h4 v-else-if="gameState === GameStates.Revealed">Revealed move</h4>
    <h4 v-else-if="gameState === GameStates.Finished">Game finished</h4>


    <!-- Game Controls -->
    <div v-if="isUserConnected">
      <div v-if="gameState === GameStates.Initial">
        <select v-model="selectedMove">
          <option disabled value="">Choose a move</option>
          <option value="1">Rock</option>
          <option value="2">Paper</option>
          <option value="3">Scissors</option>
        </select>
        <select v-model="selectedBet">
          <option disabled value="">Choose a bet</option>
          <option value="0.01">0.01 ETH</option>
          <option value="0.1">0.1 ETH</option>
          <option value="1">1 ETH</option>
          <option value="5">5 ETH</option>
          <option value="10">10 ETH</option>
        </select>
        <button @click="registerGame">Register</button>
      </div>

      <div v-else-if="gameState === GameStates.Sending">
        <h2>Sending move</h2>
        <p>Move: {{ moveToString(selectedMove) }}</p>
        <p>Wager: {{ selectedBet }} ETH</p>
      </div>

      <div v-else-if="gameState === GameStates.Waiting">
        <h2>Sent move. Waiting to match with an opponent</h2>
        <p>Move: {{ moveToString(selectedMove) }}</p>
        <p>Wager: {{ selectedBet }} ETH</p>
      </div>

      <div v-else-if="gameState === GameStates.Matched">
        <h2>Opponent matched</h2>
        <p>Opponent address: {{ opponentAddress }}</p>
        <p>Your move: {{ moveToString(selectedMove) }}</p>
        <p>Your wager: {{ selectedBet }} ETH</p>
        <button @click="revealMove">Reveal</button>
        <div v-if="opponentMove">
          <p>Opponent move: {{ moveToString(opponentMove) }}</p>
        </div>
      </div>

      <div v-else-if="gameState === GameStates.Revealing">
        <h2>Revealing move</h2>
        <p>Opponent address: {{ opponentAddress }}</p>
        <p>Your move: {{ moveToString(selectedMove) }}</p>
        <p>Your wager: {{ selectedBet }} ETH</p>
        <div v-if="opponentMove">
          <p>Opponent move: {{ moveToString(opponentMove) }}</p>
        </div>
      </div>

      <div v-else-if="gameState === 5">
        <h2>Revealed move</h2>
        <p>Opponent address: {{ opponentAddress }}</p>
        <p>Your move: {{ moveToString(selectedMove) }}</p>
        <p>Your wager: {{ selectedBet }} ETH</p>
        <div v-if="opponentMove">
          <p>Opponent move: {{ moveToString(opponentMove) }}</p>
        </div>
        <div v-else>
          <p>Waiting for opponent to reveal move</p>
        </div>
        
      </div>

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

<script>
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
      moveRevealedEvents: [],
      gameOutcomeEvents: [],

      _lastGameId: -1,
    };
  },
  computed: {
    ...mapGetters("accounts", [
      "getChainName",
      "isUserConnected",
      "getActiveBalanceEth",
      "getWeb3",
      "getActiveAccount",
    ]),
    balance(){
      return this.getActiveBalanceEth;
    },
    gameState() {
      console.log("gameState", this.currentGameId, this.games);
      //make sure everything exists, else default to GameStates.Initial
      if (!this.games[this.currentGameId ?? "0"]) {
        return GameStates.Initial;
      }

      //return game state
      return this.games[this.currentGameId ?? "0"].states[this.getActiveAccount];
    },
    opponentAddress(){
      const playerA = this.games[this.currentGameId].playerA.toLowerCase()
      const playerB = this.games[this.currentGameId].playerB.toLowerCase()
      return playerA === this.getActiveAccount.toLowerCase() ? playerB : playerA
    },
    opponentMove() {
      const opponentAddress = this.opponentAddress.toLowerCase()
      const currentGameId = this.currentGameId
      return this.games[currentGameId.toLowerCase()].moves[opponentAddress.toLowerCase()]
    },
    opponentState() {
      const opponentAddress = this.opponentAddress.toLowerCase()
      const currentGameId = this.currentGameId
      return this.games[currentGameId.toLowerCase()].states[opponentAddress.toLowerCase()]
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
      };
    },

    setLastGameId(gameId) {
      this._lastGameId = parseInt(gameId);
    },

    isNewestGameId(gameId) {
      return parseInt(gameId) >= this._lastGameId;
    },
    

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

    handleRevealedEvent(event) {
      console.log("MoveRevealed event:", event.returnValues);
      const { gameId, playerAddress, move } = event.returnValues;
      
      //check if gameId is in games
      if (!this.games[gameId])
        this.createGame(gameId, playerAddress);

      //set player move
      this.games[gameId].moves[playerAddress.toLowerCase()] = move;

      //set player state
      this.games[gameId].states[playerAddress.toLowerCase()] = GameStates.Revealed;
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

      //Listen to move revealed events
      contract.events.MoveRevealed({}, (error, event) => {
        if (error) {
          console.error("Error in MoveRevealed event:", error);
          return;
        }

        this.handleRevealedEvent(event);
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
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Sending;
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
        this.randomString = generateRandomString(); // Save randomString
        const encryptedMove =
          "0x" + sha256(this.selectedMove + this.randomString);
        console.log("clearMove:", this.selectedMove + this.randomString);
        const accounts = await this.getWeb3.eth.getAccounts();
        const gasPrice = this.getWeb3.utils.toWei("5", "gwei");
        const gasLimit = 3000000;

        const betInWei = this.getWeb3.utils.toWei(this.selectedBet, "ether");

        const result = await this.contractInstance.methods
          .register(encryptedMove)
          .send({ from: accounts[0], value: betInWei, gasPrice, gasLimit });
        //console.log("Game registered:", result);

        // Store the last sentMove and betAmount in the localStorage
        localStorage.setItem("lastSentMove", this.selectedMove);
        localStorage.setItem("lastRandomString", this.randomString);
        localStorage.setItem("lastBetAmount", this.selectedBet);
        
        // Update the gameState to Waiting
        //console.log("Current gameState:", this.games[this.currentGameId].states[this.getActiveAccount]);
      } catch (error) {
        //set back to initial state
        if (!this.games[this.currentGameId ?? "0"]) 
          this.createGame(this.currentGameId ?? "0");
        this.games[this.currentGameId ?? "0"].states[this.getActiveAccount] = GameStates.Initial;

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

    async fetchMoveRevealedEvents(fromBlock) {
      const contract = await this.getContract();
      const events = await contract.getPastEvents("MoveRevealed", {
        fromBlock,
      });
      this.moveRevealedEvents = events;
      console.log("moveRevealedEvents:", this.moveRevealedEvents.map(e => e.returnValues));
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

      // Iterate over the moveRevealedEvents
      // Call handleMoveRevealedEvent for each event
      for (const event of this.moveRevealedEvents) {
        this.handleRevealedEvent(event)
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
